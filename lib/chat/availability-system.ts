import { prisma } from "@/lib/prisma";

/**
 * Sistema de Disponibilidad Inteligente
 *
 * Previene abuse de "interrupciones" como en Character.AI
 * - Cooldowns según nivel de relación
 * - Bloqueo real cuando dice "no puedo contestar"
 * - Respuestas espaciadas si el usuario insiste
 */

export interface AvailabilityStatus {
  available: boolean;
  reason?: string;
  blockedUntil?: Date;
  canRespondSpaced?: boolean; // Puede responder pero espaciado
  nextResponseAt?: Date; // Cuándo puede responder el próximo mensaje espaciado
}

export interface ActivityUnavailability {
  activity: string;
  durationMinutes: number; // Cuánto dura la no-disponibilidad
  allowSpacedResponses: boolean; // Si permite respuestas espaciadas
  spacedInterval: number; // Minutos entre respuestas espaciadas
}

// Duración de no-disponibilidad según actividad
const ACTIVITY_DURATIONS: Record<string, ActivityUnavailability> = {
  sleeping: {
    activity: "durmiendo",
    durationMinutes: 480, // 8 horas
    allowSpacedResponses: false, // NO responde mientras duerme
    spacedInterval: 0,
  },
  working_focused: {
    activity: "trabajando (concentrado)",
    durationMinutes: 90,
    allowSpacedResponses: true, // Responde cada 5min
    spacedInterval: 5,
  },
  meeting: {
    activity: "en una reunión",
    durationMinutes: 60,
    allowSpacedResponses: true, // Responde cada 10min
    spacedInterval: 10,
  },
  exercising: {
    activity: "haciendo ejercicio",
    durationMinutes: 45,
    allowSpacedResponses: true, // Responde cada 5min
    spacedInterval: 5,
  },
  eating: {
    activity: "comiendo",
    durationMinutes: 30,
    allowSpacedResponses: true, // Responde cada 3min
    spacedInterval: 3,
  },
  shower: {
    activity: "en la ducha",
    durationMinutes: 20,
    allowSpacedResponses: false,
    spacedInterval: 0,
  },
  driving: {
    activity: "manejando",
    durationMinutes: 45,
    allowSpacedResponses: false, // Seguridad primero
    spacedInterval: 0,
  },
};

// Cooldowns según nivel de relación (minutos)
const RELATIONSHIP_COOLDOWNS: Record<string, number> = {
  stranger: 30, // 30 minutos
  acquaintance: 20,
  friend: 10,
  close_friend: 5,
  intimate: 1, // Solo 1 minuto
};

/**
 * Marca al agente como no disponible temporalmente
 */
export async function markUnavailable(
  agentId: string,
  activity: string,
  customDuration?: number
): Promise<void> {
  const activityConfig = ACTIVITY_DURATIONS[activity];

  if (!activityConfig && !customDuration) {
    throw new Error(`Unknown activity: ${activity}`);
  }

  const durationMs = (customDuration || activityConfig?.durationMinutes || 30) * 60 * 1000;
  const blockedUntil = new Date(Date.now() + durationMs);

  await prisma.agentAvailability.upsert({
    where: { agentId },
    create: {
      agentId,
      available: false,
      blockedUntil,
      currentActivity: activity,
      allowSpacedResponses: activityConfig?.allowSpacedResponses ?? false,
      spacedIntervalMinutes: activityConfig?.spacedInterval ?? 0,
    },
    update: {
      available: false,
      blockedUntil,
      currentActivity: activity,
      allowSpacedResponses: activityConfig?.allowSpacedResponses ?? false,
      spacedIntervalMinutes: activityConfig?.spacedInterval ?? 0,
      lastUnavailableAt: new Date(),
    },
  });
}

/**
 * Verifica si el agente puede responder
 */
export async function checkAvailability(
  agentId: string,
  relationshipStage: string
): Promise<AvailabilityStatus> {
  const availability = await prisma.agentAvailability.findUnique({
    where: { agentId },
  });

  // Si no hay registro, está disponible
  if (!availability) {
    return { available: true };
  }

  // Si está marcado como disponible
  if (availability.available) {
    return { available: true };
  }

  // Verificar si ya pasó el tiempo de bloqueo
  const now = new Date();
  if (availability.blockedUntil && now >= availability.blockedUntil) {
    // Auto-liberar
    await prisma.agentAvailability.update({
      where: { agentId },
      data: {
        available: true,
        blockedUntil: null,
        currentActivity: null,
      },
    });

    return { available: true };
  }

  // Todavía bloqueado
  const cooldownMinutes = RELATIONSHIP_COOLDOWNS[relationshipStage] || 20;

  // Verificar si puede responder de forma espaciada
  if (availability.allowSpacedResponses) {
    // Verificar si ya pasó el intervalo desde la última respuesta
    const lastResponseTime = availability.lastSpacedResponseAt?.getTime() || 0;
    const intervalMs = (availability.spacedIntervalMinutes || 3) * 60 * 1000;
    const nextResponseTime = lastResponseTime + intervalMs;

    if (now.getTime() >= nextResponseTime) {
      return {
        available: true, // Puede responder ahora (espaciado)
        canRespondSpaced: true,
      };
    }

    // Todavía no puede responder (muy pronto)
    return {
      available: false,
      reason: `El personaje está ${availability.currentActivity}. Puede responder ocasionalmente.`,
      blockedUntil: availability.blockedUntil ?? undefined,
      canRespondSpaced: true,
      nextResponseAt: new Date(nextResponseTime),
    };
  }

  // No puede responder en absoluto (actividad bloqueante)
  return {
    available: false,
    reason: `El personaje está ${availability.currentActivity} y no puede responder ahora.`,
    blockedUntil: availability.blockedUntil ?? undefined,
    canRespondSpaced: false,
  };
}

/**
 * Registra que el agente respondió de forma espaciada
 */
export async function recordSpacedResponse(agentId: string): Promise<void> {
  await prisma.agentAvailability.update({
    where: { agentId },
    data: {
      lastSpacedResponseAt: new Date(),
    },
  });
}

/**
 * Marca al agente como disponible de nuevo
 */
export async function markAvailable(agentId: string): Promise<void> {
  await prisma.agentAvailability.upsert({
    where: { agentId },
    create: {
      agentId,
      available: true,
    },
    update: {
      available: true,
      blockedUntil: null,
      currentActivity: null,
      allowSpacedResponses: false,
      spacedIntervalMinutes: 0,
    },
  });
}

/**
 * Aplica cooldown basado en la relación
 */
export async function applyCooldown(
  agentId: string,
  relationshipStage: string
): Promise<void> {
  const cooldownMinutes = RELATIONSHIP_COOLDOWNS[relationshipStage] || 20;
  const blockedUntil = new Date(Date.now() + cooldownMinutes * 60 * 1000);

  await prisma.agentAvailability.upsert({
    where: { agentId },
    create: {
      agentId,
      available: false,
      blockedUntil,
      currentActivity: "ocupado/a",
      allowSpacedResponses: false,
    },
    update: {
      available: false,
      blockedUntil,
      lastUnavailableAt: new Date(),
    },
  });
}
