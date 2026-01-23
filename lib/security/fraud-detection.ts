/**
 * FRAUD DETECTION SYSTEM
 *
 * Sistema ML-lite para detectar fraude en bonds:
 * - Cuentas creadas solo para farming
 * - Coordinated attacks (múltiples usuarios atacando mismo bond)
 * - Manipulation de métricas
 * - Anomaly detection
 */

import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { calculateGenuinenessScore } from "./anti-gaming-detector";

export interface FraudSignal {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number; // 0-1
  description: string;
  evidence: any;
}

export interface FraudAnalysisResult {
  fraudulent: boolean;
  fraudScore: number; // 0-1, donde 1 = definitivamente fraude
  signals: FraudSignal[];
  recommendedAction: "allow" | "flag" | "block" | "manual_review";
}

/**
 * Analiza si un intento de establecer bond es fraudulento
 */
export async function analyzeBondEstablishmentForFraud(
  userId: string,
  agentId: string
): Promise<FraudAnalysisResult> {
  const signals: FraudSignal[] = [];
  let fraudScore = 0;

  // Signal 1: Cuenta muy nueva intentando bond de alto valor
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true, plan: true },
  });

  if (user) {
    const accountAgeHours =
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60);

    if (accountAgeHours < 24) {
      signals.push({
        type: "NEW_ACCOUNT",
        severity: "medium",
        confidence: 0.8,
        description: `Cuenta creada hace ${accountAgeHours.toFixed(1)}h intentando bond`,
        evidence: { accountAgeHours },
      });
      fraudScore += 0.3;
    }
  }

  // Signal 2: Usuario tiene múltiples bonds en periodo corto
  const recentBonds = await prisma.symbolicBond.findMany({
    where: {
      userId,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
  });

  if (recentBonds.length >= 3) {
    signals.push({
      type: "RAPID_BONDING",
      severity: "high",
      confidence: 0.9,
      description: `${recentBonds.length} bonds en última semana`,
      evidence: { bondCount: recentBonds.length },
    });
    fraudScore += 0.4;
  }

  // Signal 3: Genuineness score muy bajo
  const genuineness = await calculateGenuinenessScore(userId, agentId);

  if (genuineness < 0.3) {
    signals.push({
      type: "LOW_GENUINENESS",
      severity: "high",
      confidence: 0.85,
      description: `Score de genuinidad muy bajo (${(genuineness * 100).toFixed(1)}%)`,
      evidence: { genuinenessScore: genuineness },
    });
    fraudScore += 0.5;
  }

  // Signal 4: Patrón de interacción anómalo
  const messageCount = await prisma.message.count({
    where: {
      userId,
      agentId,
      role: "user",
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });

  // Demasiados mensajes en 24h = farming
  if (messageCount > 200) {
    signals.push({
      type: "EXCESSIVE_MESSAGES",
      severity: "critical",
      confidence: 0.95,
      description: `${messageCount} mensajes en 24h (inhuman)`,
      evidence: { messageCount },
    });
    fraudScore += 0.6;
  }

  // Signal 5: Coordinated attack detection
  const similarBondAttempts = await detectCoordinatedAttack(agentId);
  if (similarBondAttempts.suspicious) {
    signals.push({
      type: "COORDINATED_ATTACK",
      severity: "critical",
      confidence: 0.9,
      description: "Múltiples usuarios con patrones idénticos",
      evidence: similarBondAttempts,
    });
    fraudScore += 0.7;
  }

  // Normalizar score
  fraudScore = Math.min(fraudScore, 1);

  // Determinar acción recomendada
  let recommendedAction: FraudAnalysisResult["recommendedAction"] = "allow";
  if (fraudScore >= 0.8) {
    recommendedAction = "block";
  } else if (fraudScore >= 0.6) {
    recommendedAction = "manual_review";
  } else if (fraudScore >= 0.4) {
    recommendedAction = "flag";
  }

  return {
    fraudulent: fraudScore >= 0.6,
    fraudScore,
    signals,
    recommendedAction,
  };
}

/**
 * Detecta ataques coordinados (múltiples usuarios con mismo patrón)
 */
async function detectCoordinatedAttack(agentId: string): Promise<{
  suspicious: boolean;
  userIds: string[];
  pattern: string;
}> {
  // Buscar usuarios que:
  // 1. Crearon cuenta en mismo periodo
  // 2. Interactúan con mismo agente
  // 3. Tienen patrones de mensaje similares

  const recentUsers = await prisma.message.groupBy({
    by: ["userId"],
    where: {
      agentId,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    _count: { id: true },
    having: {
      id: { _count: { gt: 50 } }, // Usuarios muy activos
    },
  });

  if (recentUsers.length < 3) {
    return { suspicious: false, userIds: [], pattern: "" };
  }

  // Obtener users data
  const userIds = recentUsers.map((u) => u.userId).filter((id): id is string => id !== null);
  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  // Check si cuentas creadas en ventana de 1 hora
  const timestamps = users.map((u) => u.createdAt.getTime());
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);

  const windowHours = (maxTimestamp - minTimestamp) / (1000 * 60 * 60);

  if (windowHours < 1 && users.length >= 3) {
    return {
      suspicious: true,
      userIds: users.map((u) => u.id),
      pattern: "same_creation_window",
    };
  }

  return { suspicious: false, userIds: [], pattern: "" };
}

/**
 * Detecta anomalías en progreso de afinidad
 */
export async function detectAffinityAnomaly(
  userId: string,
  agentId: string,
  newAffinityLevel: number
): Promise<{ anomalous: boolean; reason: string }> {
  // Obtener bond existente (si hay)
  const bond = await prisma.symbolicBond.findFirst({
    where: { userId, agentId },
  });

  if (!bond) {
    // Nuevo bond, verificar si el nivel inicial es sospechosamente alto
    if (newAffinityLevel > 50) {
      return {
        anomalous: true,
        reason: `Afinidad inicial muy alta (${newAffinityLevel})`,
      };
    }
    return { anomalous: false, reason: "" };
  }

  // Verificar incremento anómalo
  const increment = newAffinityLevel - bond.affinityLevel;
  const daysSinceStart =
    (Date.now() - bond.startDate.getTime()) / (1000 * 60 * 60 * 24);

  // Incremento de >20 puntos en un día = sospechoso
  if (increment > 20 && daysSinceStart < 1) {
    return {
      anomalous: true,
      reason: `Incremento de ${increment} puntos en ${daysSinceStart.toFixed(1)} días`,
    };
  }

  // Incremento de >50 puntos desde inicio es imposible sin farming
  if (newAffinityLevel - bond.affinityLevel > 50) {
    return {
      anomalous: true,
      reason: `Incremento total de ${newAffinityLevel - bond.affinityLevel} puntos`,
    };
  }

  return { anomalous: false, reason: "" };
}

/**
 * Analiza el historial completo del usuario para detectar fraude
 */
export async function analyzeUserHistoryForFraud(
  userId: string
): Promise<FraudAnalysisResult> {
  const signals: FraudSignal[] = [];
  let fraudScore = 0;

  // Obtener todos los bonds del usuario
  const allBonds = await prisma.symbolicBond.findMany({
    where: { userId },
    include: {
      Agent: {
        select: { name: true },
      },
    },
  });

  // Signal: Demasiados bonds activos simultáneamente
  const activeBonds = allBonds.filter((b) => b.status === "active");
  if (activeBonds.length > 5) {
    signals.push({
      type: "EXCESSIVE_ACTIVE_BONDS",
      severity: "high",
      confidence: 0.8,
      description: `${activeBonds.length} bonds activos simultáneos`,
      evidence: { count: activeBonds.length },
    });
    fraudScore += 0.4;
  }

  // Signal: Todos los bonds con mismo patrón de progreso
  if (allBonds.length >= 3) {
    const affinities = allBonds.map((b) => b.affinityLevel);
    const avg = affinities.reduce((a, b) => a + b, 0) / affinities.length;
    const variance =
      affinities.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
      affinities.length;

    // Varianza muy baja = todos progresan igual (bot)
    if (variance < 25) {
      signals.push({
        type: "UNIFORM_PROGRESSION",
        severity: "high",
        confidence: 0.85,
        description: "Todos los bonds progresan de forma idéntica",
        evidence: { variance, affinities },
      });
      fraudScore += 0.5;
    }
  }

  // Signal: Usuario liberó y re-estableció bonds rápidamente (churning)
  const legacyBonds = await prisma.bondLegacy.findMany({
    where: {
      userId,
      endDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  });

  if (legacyBonds.length > 3) {
    signals.push({
      type: "BOND_CHURNING",
      severity: "medium",
      confidence: 0.7,
      description: `${legacyBonds.length} bonds liberados en último mes`,
      evidence: { count: legacyBonds.length },
    });
    fraudScore += 0.3;
  }

  fraudScore = Math.min(fraudScore, 1);

  let recommendedAction: FraudAnalysisResult["recommendedAction"] = "allow";
  if (fraudScore >= 0.7) {
    recommendedAction = "block";
  } else if (fraudScore >= 0.5) {
    recommendedAction = "manual_review";
  } else if (fraudScore >= 0.3) {
    recommendedAction = "flag";
  }

  return {
    fraudulent: fraudScore >= 0.5,
    fraudScore,
    signals,
    recommendedAction,
  };
}

/**
 * Auto-block de usuarios con fraud score crítico
 */
export async function autoBlockFraudulentUser(
  userId: string,
  reason: string,
  evidence: any
) {
  console.log(`[FraudDetection] Auto-blocking user ${userId}: ${reason}`);

  // Actualizar metadata del usuario
  await prisma.user.update({
    where: { id: userId },
    data: {
      metadata: {
        blocked: true,
        blockedAt: new Date().toISOString(),
        blockReason: reason,
        blockEvidence: evidence,
      } as any,
    },
  });

  // Crear log de moderación
  await prisma.moderationAction.create({
    data: {
      id: nanoid(),
      moderatorId: "fraud_detection_system",
      targetType: "user",
      targetId: userId,
      action: "block",
      reason,
      details: JSON.stringify(evidence),
    },
  });

  // Liberar todos sus bonds activos
  const activeBonds = await prisma.symbolicBond.findMany({
    where: { userId, status: "active" },
  });

  for (const bond of activeBonds) {
    await prisma.symbolicBond.update({
      where: { id: bond.id },
      data: { status: "released" },
    });

    // Crear legacy
    await prisma.bondLegacy.create({
      data: {
        id: nanoid(),
        userId,
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
        releaseReason: "fraud_detected",
        legacyBadge: "Removed (Fraud)",
      },
    });
  }

  return { blocked: true, bondsReleased: activeBonds.length };
}

export default {
  analyzeBondEstablishmentForFraud,
  detectAffinityAnomaly,
  analyzeUserHistoryForFraud,
  autoBlockFraudulentUser,
};
