/**
 * SYMBOLIC BONDS SERVICE
 *
 * Servicio core para gestionar el sistema de vínculos emocionales únicos.
 * Maneja: creación, actualización, decay, cola de espera, y cálculo de rareza.
 */

import { prisma } from "@/lib/prisma";
import { BondTier } from "@prisma/client";

// ============================================================================
// TIPOS Y CONFIGURACIONES
// ============================================================================

export interface AffinityMetrics {
  messageQuality: number;        // 0-1: Profundidad emocional
  consistencyScore: number;      // 0-1: Regularidad
  mutualDisclosure: number;      // 0-1: Compartir personal
  emotionalResonance: number;    // 0-1: IA responde bien
  sharedExperiences: number;     // Count de arcos completados
}

export interface BondRequirements {
  minAffinity: number;      // 0-100
  minDays: number;
  minInteractions: number;
}

// Configuración por defecto de slots (puede ser sobreescrita por agente)
const DEFAULT_SLOTS_PER_TIER: Record<BondTier, number> = {
  ROMANTIC: 1,
  BEST_FRIEND: 5,
  MENTOR: 10,
  CONFIDANT: 50,
  CREATIVE_PARTNER: 20,
  ADVENTURE_COMPANION: 30,
  ACQUAINTANCE: 999999, // Sin límite
};

// Requisitos mínimos por tier (puede ser sobreescrito por agente)
const DEFAULT_TIER_REQUIREMENTS: Record<BondTier, BondRequirements> = {
  ROMANTIC: { minAffinity: 80, minDays: 30, minInteractions: 100 },
  BEST_FRIEND: { minAffinity: 70, minDays: 20, minInteractions: 60 },
  MENTOR: { minAffinity: 60, minDays: 15, minInteractions: 40 },
  CONFIDANT: { minAffinity: 50, minDays: 10, minInteractions: 30 },
  CREATIVE_PARTNER: { minAffinity: 55, minDays: 12, minInteractions: 35 },
  ADVENTURE_COMPANION: { minAffinity: 50, minDays: 10, minInteractions: 25 },
  ACQUAINTANCE: { minAffinity: 20, minDays: 3, minInteractions: 10 },
};

// Configuración de decay por defecto
const DEFAULT_DECAY_SETTINGS = {
  warningDays: 30,    // Después de 30 días sin interacción → warning
  dormantDays: 60,    // Después de 60 días → dormant
  fragileDays: 90,    // Después de 90 días → fragile
  releaseDays: 120,   // Después de 120 días → released
};

// ============================================================================
// FUNCIONES PRINCIPALES
// ============================================================================

/**
 * Calcula el progreso de afinidad basado en métricas de calidad
 */
export function calculateAffinityProgress(metrics: AffinityMetrics): number {
  // Fórmula ponderada que recompensa calidad sobre cantidad
  const weights = {
    messageQuality: 0.25,
    consistencyScore: 0.20,
    mutualDisclosure: 0.20,
    emotionalResonance: 0.25,
    sharedExperiences: 0.10,
  };

  const normalizedExperiences = Math.min(metrics.sharedExperiences / 10, 1);

  const score = (
    metrics.messageQuality * weights.messageQuality +
    metrics.consistencyScore * weights.consistencyScore +
    metrics.mutualDisclosure * weights.mutualDisclosure +
    metrics.emotionalResonance * weights.emotionalResonance +
    normalizedExperiences * weights.sharedExperiences
  );

  return Math.min(Math.max(score, 0), 1) * 100; // 0-100
}

/**
 * Obtiene o crea la configuración de bonds para un agente
 */
export async function getOrCreateBondConfig(agentId: string) {
  let config = await prisma.agentBondConfig.findUnique({
    where: { agentId },
  });

  if (!config) {
    // Crear configuración por defecto
    config = await prisma.agentBondConfig.create({
      data: {
        agentId,
        slotsPerTier: DEFAULT_SLOTS_PER_TIER as any,
        tierRequirements: DEFAULT_TIER_REQUIREMENTS as any,
        decaySettings: DEFAULT_DECAY_SETTINGS as any,
        isPolyamorous: false,
      },
    });
  }

  return config;
}

/**
 * Verifica si hay slots disponibles para un tier específico
 */
export async function checkSlotAvailability(
  agentId: string,
  tier: BondTier
): Promise<{ available: boolean; currentCount: number; maxSlots: number }> {
  const config = await getOrCreateBondConfig(agentId);
  const slotsPerTier = config.slotsPerTier as Record<BondTier, number>;
  const maxSlots = slotsPerTier[tier] || DEFAULT_SLOTS_PER_TIER[tier];

  const currentCount = await prisma.symbolicBond.count({
    where: {
      agentId,
      tier,
      status: "active",
    },
  });

  return {
    available: currentCount < maxSlots,
    currentCount,
    maxSlots,
  };
}

/**
 * Intenta establecer un nuevo bond (o agrega a cola si no hay slots)
 */
export async function attemptEstablishBond(
  userId: string,
  agentId: string,
  tier: BondTier,
  initialMetrics: AffinityMetrics
) {
  // Verificar que el usuario no tenga ya este bond
  const existingBond = await prisma.symbolicBond.findUnique({
    where: {
      userId_agentId_tier: { userId, agentId, tier },
    },
  });

  if (existingBond) {
    throw new Error("Ya tienes un bond de este tipo con este agente");
  }

  // Calcular afinidad actual
  const affinityProgress = calculateAffinityProgress(initialMetrics);

  // Verificar requisitos mínimos
  const config = await getOrCreateBondConfig(agentId);
  const requirements = (config.tierRequirements as any as Record<BondTier, BondRequirements>)[tier];

  if (
    affinityProgress < requirements.minAffinity
    // Aquí también verificarías minDays y minInteractions desde Relation existente
  ) {
    throw new Error("No cumples los requisitos mínimos para este tier");
  }

  // Verificar disponibilidad de slots
  const { available } = await checkSlotAvailability(agentId, tier);

  if (available) {
    // Crear bond directamente
    const bond = await prisma.symbolicBond.create({
      data: {
        userId,
        agentId,
        tier,
        affinityLevel: Math.floor(affinityProgress),
        affinityProgress,
        messageQuality: initialMetrics.messageQuality,
        consistencyScore: initialMetrics.consistencyScore,
        mutualDisclosure: initialMetrics.mutualDisclosure,
        emotionalResonance: initialMetrics.emotionalResonance,
        sharedExperiences: initialMetrics.sharedExperiences,
        status: "active",
        decayPhase: "healthy",
      },
    });

    // Actualizar config stats
    await prisma.agentBondConfig.update({
      where: { agentId },
      data: {
        totalBondsActive: { increment: 1 },
      },
    });

    // Crear notificación
    await prisma.bondNotification.create({
      data: {
        userId,
        bondId: bond.id,
        type: "milestone_reached",
        title: `¡Nuevo vínculo establecido!`,
        message: `Has establecido un vínculo ${tier} con este personaje.`,
        metadata: { tier, agentId },
      },
    });

    return { success: true, bond, inQueue: false };
  } else {
    // Agregar a cola de espera
    const queuePosition = await prisma.bondQueue.count({
      where: { agentId, tier, status: "waiting" },
    });

    const queueEntry = await prisma.bondQueue.create({
      data: {
        userId,
        agentId,
        tier,
        queuePosition: queuePosition + 1,
        affinityProgress,
        eligibilityScore: affinityProgress, // Puede ser más complejo
      },
    });

    // Notificar que entró en cola
    await prisma.bondNotification.create({
      data: {
        userId,
        type: "queue_position_update",
        title: "Agregado a la cola",
        message: `Estás en posición #${queuePosition + 1} para un vínculo ${tier}. Sigue interactuando para mejorar tu posición.`,
        metadata: { tier, agentId, queuePosition: queuePosition + 1 },
      },
    });

    return { success: false, inQueue: true, queueEntry, queuePosition: queuePosition + 1 };
  }
}

/**
 * Actualiza las métricas de un bond existente después de una interacción
 */
export async function updateBondMetrics(
  bondId: string,
  newMetrics: Partial<AffinityMetrics>
) {
  const bond = await prisma.symbolicBond.findUnique({
    where: { id: bondId },
  });

  if (!bond) {
    throw new Error("Bond no encontrado");
  }

  // Combinar métricas antiguas con nuevas
  const updatedMetrics: AffinityMetrics = {
    messageQuality: newMetrics.messageQuality ?? bond.messageQuality,
    consistencyScore: newMetrics.consistencyScore ?? bond.consistencyScore,
    mutualDisclosure: newMetrics.mutualDisclosure ?? bond.mutualDisclosure,
    emotionalResonance: newMetrics.emotionalResonance ?? bond.emotionalResonance,
    sharedExperiences: newMetrics.sharedExperiences ?? bond.sharedExperiences,
  };

  const newAffinityProgress = calculateAffinityProgress(updatedMetrics);

  // Calcular días desde creación
  const daysActive = Math.floor(
    (Date.now() - bond.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Reset decay si hubo interacción
  const updatedBond = await prisma.symbolicBond.update({
    where: { id: bondId },
    data: {
      ...updatedMetrics,
      affinityProgress: newAffinityProgress,
      affinityLevel: Math.floor(newAffinityProgress),
      lastInteraction: new Date(),
      totalInteractions: { increment: 1 },
      durationDays: daysActive,
      daysInactive: 0, // Reset porque hubo interacción
      decayPhase: "healthy",
      status: "active",
    },
  });

  // Recalcular rareza
  await updateBondRarity(bondId);

  return updatedBond;
}

/**
 * Calcula y actualiza la rareza de un bond
 */
export async function updateBondRarity(bondId: string) {
  const bond = await prisma.symbolicBond.findUnique({
    where: { id: bondId },
  });

  if (!bond) return;

  // Factores de rareza:
  // 1. Demanda global (cuántos usuarios tienen este tier con este agente)
  const totalBondsOfType = await prisma.symbolicBond.count({
    where: {
      agentId: bond.agentId,
      tier: bond.tier,
      status: "active",
    },
  });

  // 2. Duración del bond (bonds más antiguos son más raros)
  const durationFactor = Math.min(bond.durationDays / 365, 1); // Max 1 año

  // 3. Nivel de afinidad alcanzado
  const affinityFactor = bond.affinityProgress / 100;

  // 4. Experiencias compartidas
  const experienceFactor = Math.min(bond.sharedExperiences / 20, 1);

  // 5. Scarcity (cuánto más raro es este tier)
  const config = await prisma.agentBondConfig.findUnique({
    where: { agentId: bond.agentId },
  });

  const maxSlots = config
    ? (config.slotsPerTier as Record<BondTier, number>)[bond.tier]
    : DEFAULT_SLOTS_PER_TIER[bond.tier];

  const scarcityFactor = 1 - totalBondsOfType / Math.max(maxSlots, 1);

  // Fórmula final de rareza (0-1)
  const rarityScore =
    scarcityFactor * 0.3 +
    durationFactor * 0.25 +
    affinityFactor * 0.25 +
    experienceFactor * 0.20;

  // Determinar tier de rareza
  let rarityTier: string;
  if (rarityScore >= 0.95) rarityTier = "Mythic";
  else if (rarityScore >= 0.85) rarityTier = "Legendary";
  else if (rarityScore >= 0.70) rarityTier = "Epic";
  else if (rarityScore >= 0.50) rarityTier = "Rare";
  else if (rarityScore >= 0.30) rarityTier = "Uncommon";
  else rarityTier = "Common";

  // Calcular ranking global (posición entre todos los bonds de este tier con este agente)
  const bondsAbove = await prisma.symbolicBond.count({
    where: {
      agentId: bond.agentId,
      tier: bond.tier,
      status: "active",
      rarityScore: { gt: rarityScore },
    },
  });

  const globalRank = bondsAbove + 1;

  await prisma.symbolicBond.update({
    where: { id: bondId },
    data: {
      rarityScore,
      rarityTier,
      globalRank,
    },
  });

  return { rarityScore, rarityTier, globalRank };
}

/**
 * Procesa el decay de todos los bonds (ejecutar diariamente via cron)
 */
export async function processAllBondDecay() {
  const allActiveBonds = await prisma.symbolicBond.findMany({
    where: {
      status: { in: ["active", "dormant", "fragile"] },
    },
  });

  const results = {
    processed: 0,
    warned: 0,
    dormant: 0,
    fragile: 0,
    released: 0,
  };

  for (const bond of allActiveBonds) {
    const daysSinceInteraction = Math.floor(
      (Date.now() - bond.lastInteraction.getTime()) / (1000 * 60 * 60 * 24)
    );

    const config = await prisma.agentBondConfig.findUnique({
      where: { agentId: bond.agentId },
    });

    const decaySettings = (config?.decaySettings as typeof DEFAULT_DECAY_SETTINGS) || DEFAULT_DECAY_SETTINGS;

    let newStatus = bond.status;
    let newDecayPhase = bond.decayPhase;
    let shouldNotify = false;
    let notificationMessage = "";

    // Determinar fase de decay
    if (daysSinceInteraction >= decaySettings.releaseDays) {
      // Liberar bond automáticamente
      await releaseBond(bond.id, "inactivity");
      results.released++;
      continue;
    } else if (daysSinceInteraction >= decaySettings.fragileDays) {
      newDecayPhase = "critical";
      newStatus = "fragile";
      shouldNotify = bond.decayPhase !== "critical";
      notificationMessage = "Tu vínculo está en riesgo crítico. Interactúa pronto o se liberará.";
      results.fragile++;
    } else if (daysSinceInteraction >= decaySettings.dormantDays) {
      newDecayPhase = "fragile";
      newStatus = "dormant";
      shouldNotify = bond.decayPhase !== "fragile";
      notificationMessage = "Tu vínculo está frágil. Considera interactuar para mantenerlo.";
      results.dormant++;
    } else if (daysSinceInteraction >= decaySettings.warningDays) {
      newDecayPhase = "dormant";
      shouldNotify = bond.decayPhase !== "dormant";
      notificationMessage = "No has interactuado en un tiempo. Tu vínculo podría debilitarse.";
      results.warned++;
    }

    // Actualizar bond
    await prisma.symbolicBond.update({
      where: { id: bond.id },
      data: {
        daysInactive: daysSinceInteraction,
        decayPhase: newDecayPhase,
        status: newStatus,
      },
    });

    // Notificar si es necesario
    if (shouldNotify) {
      await prisma.bondNotification.create({
        data: {
          userId: bond.userId,
          bondId: bond.id,
          type: "bond_at_risk",
          title: "Estado de vínculo",
          message: notificationMessage,
          metadata: {
            daysInactive: daysSinceInteraction,
            decayPhase: newDecayPhase,
          },
        },
      });
    }

    results.processed++;
  }

  return results;
}

/**
 * Libera un bond (voluntariamente o por inactividad)
 */
export async function releaseBond(bondId: string, reason: string) {
  const bond = await prisma.symbolicBond.findUnique({
    where: { id: bondId },
  });

  if (!bond) {
    throw new Error("Bond no encontrado");
  }

  // Crear entrada en legacy
  const legacyBadge = `Former ${bond.tier} - Season 1`; // Puedes hacer esto más sofisticado

  await prisma.bondLegacy.create({
    data: {
      userId: bond.userId,
      agentId: bond.agentId,
      tier: bond.tier,
      startDate: bond.startDate,
      endDate: new Date(),
      durationDays: bond.durationDays,
      finalRarityTier: bond.rarityTier,
      finalRank: bond.globalRank,
      totalInteractions: bond.totalInteractions,
      narrativesUnlocked: bond.narrativesUnlocked,
      legacyImpact: bond.legacyImpact,
      canonContributions: bond.canonContributions as any,
      releaseReason: reason,
      legacyBadge,
    },
  });

  // Eliminar bond activo
  await prisma.symbolicBond.delete({
    where: { id: bondId },
  });

  // Actualizar stats del agente
  await prisma.agentBondConfig.update({
    where: { agentId: bond.agentId },
    data: {
      totalBondsActive: { decrement: 1 },
      totalBondsReleased: { increment: 1 },
    },
  });

  // Notificar usuario
  await prisma.bondNotification.create({
    data: {
      userId: bond.userId,
      type: "bond_released",
      title: "Vínculo liberado",
      message: `Tu vínculo ${bond.tier} ha sido liberado. Tu legado permanece en la historia.`,
      metadata: { reason, legacyBadge },
    },
  });

  // Procesar cola: Ofrecer slot al siguiente en línea
  await processQueue(bond.agentId, bond.tier);

  return { success: true, legacyBadge };
}

/**
 * Procesa la cola y ofrece slots disponibles
 */
async function processQueue(agentId: string, tier: BondTier) {
  // Verificar si hay slots disponibles
  const { available } = await checkSlotAvailability(agentId, tier);

  if (!available) return;

  // Encontrar el siguiente usuario elegible en la cola
  const nextInQueue = await prisma.bondQueue.findFirst({
    where: {
      agentId,
      tier,
      status: "waiting",
    },
    orderBy: [
      { eligibilityScore: "desc" }, // Priorizar por score
      { joinedQueueAt: "asc" },     // Desempatar por antigüedad
    ],
  });

  if (!nextInQueue) return;

  // Ofrecer el slot (válido por 48 horas)
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  await prisma.bondQueue.update({
    where: { id: nextInQueue.id },
    data: {
      status: "offered",
      slotOfferedAt: new Date(),
      slotExpiresAt: expiresAt,
      notifiedOfSlot: true,
    },
  });

  // Notificar usuario
  await prisma.bondNotification.create({
    data: {
      userId: nextInQueue.userId,
      type: "slot_available",
      title: "¡Slot disponible!",
      message: `Un slot para ${tier} está disponible. Tienes 48 horas para reclamarlo.`,
      metadata: {
        tier,
        agentId,
        expiresAt: expiresAt.toISOString(),
      },
    },
  });
}

/**
 * Usuario reclama un slot ofrecido desde la cola
 */
export async function claimQueueSlot(userId: string, queueId: string) {
  const queueEntry = await prisma.bondQueue.findUnique({
    where: { id: queueId },
  });

  if (!queueEntry || queueEntry.userId !== userId) {
    throw new Error("Queue entry no encontrado");
  }

  if (queueEntry.status !== "offered") {
    throw new Error("Este slot ya no está disponible");
  }

  if (queueEntry.slotExpiresAt && queueEntry.slotExpiresAt < new Date()) {
    throw new Error("El slot expiró");
  }

  // Crear el bond
  const bond = await prisma.symbolicBond.create({
    data: {
      userId,
      agentId: queueEntry.agentId,
      tier: queueEntry.tier,
      affinityLevel: Math.floor(queueEntry.affinityProgress),
      affinityProgress: queueEntry.affinityProgress,
      status: "active",
      decayPhase: "healthy",
    },
  });

  // Marcar queue como claimed y eliminar
  await prisma.bondQueue.update({
    where: { id: queueId },
    data: { status: "claimed" },
  });

  await prisma.bondQueue.delete({
    where: { id: queueId },
  });

  // Actualizar config stats
  await prisma.agentBondConfig.update({
    where: { agentId: queueEntry.agentId },
    data: {
      totalBondsActive: { increment: 1 },
    },
  });

  return bond;
}

// ============================================================================
// FUNCIONES DE CONSULTA
// ============================================================================

/**
 * Obtiene todos los bonds activos de un usuario
 */
export async function getUserBonds(userId: string) {
  return await prisma.symbolicBond.findMany({
    where: { userId },
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          avatar: true,
          description: true,
        },
      },
    },
    orderBy: { rarityScore: "desc" },
  });
}

/**
 * Obtiene el legado de bonds de un usuario
 */
export async function getUserBondLegacy(userId: string) {
  return await prisma.bondLegacy.findMany({
    where: { userId },
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: { endDate: "desc" },
  });
}

/**
 * Obtiene la posición en cola de un usuario
 */
export async function getUserQueueStatus(userId: string, agentId: string, tier: BondTier) {
  return await prisma.bondQueue.findUnique({
    where: {
      userId_agentId_tier: { userId, agentId, tier },
    },
  });
}
