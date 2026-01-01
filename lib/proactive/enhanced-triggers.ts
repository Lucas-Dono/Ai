import { prisma } from "@/lib/prisma";
import { EmotionalEngine } from "@/lib/relations/engine";
import { getRelevantMemories } from "@/lib/chat/cross-context-memory";
import { getTemporalContext } from "@/lib/chat/cross-context-memory";
import { getFatiguedTopics } from "@/lib/chat/topic-fatigue";
import type { UserTier } from "@/lib/chat/types";

/**
 * Enhanced Proactive Messaging Triggers
 *
 * Mejoras significativas al sistema de mensajes proactivos:
 * - Basado en nivel de relación (más cercano = más mensajes)
 * - Awareness de energía (no molestar si está cansado)
 * - Cross-context awareness (mencionar conversaciones grupales)
 * - Topic fatigue awareness (evitar temas repetidos)
 * - Emotional intelligence (detectar cuándo el usuario necesita apoyo)
 */

export interface EnhancedTrigger {
  type: string;
  priority: number;
  context: any;
  reason: string;
}

/**
 * Detecta triggers mejorados para mensajes proactivos
 */
export async function detectEnhancedTriggers(
  agentId: string,
  userId: string,
  tier: UserTier
): Promise<EnhancedTrigger[]> {
  const triggers: EnhancedTrigger[] = [];

  // Obtener relación
  const relation = await prisma.relation.findFirst({
    where: {
      subjectId: agentId,
      targetId: userId,
      targetType: "user",
    },
  });

  if (!relation) {
    return []; // No hay relación establecida
  }

  // Calcular nivel de relación
  const relationshipLevel = EmotionalEngine.getRelationshipLevel({
    trust: relation.trust,
    affinity: relation.affinity,
    respect: relation.respect,
    love: (relation.privateState as { love?: number }).love || 0,
    curiosity: (relation.privateState as { curiosity?: number }).curiosity || 0,
    valence: 0.5,
    arousal: 0.5,
    dominance: 0.5,
  });

  // Obtener contexto temporal
  const temporalContext = await getTemporalContext(agentId, userId);

  // 1. TRIGGER: Inactividad (basado en relación)
  const inactivityTrigger = await checkInactivityTrigger(
    agentId,
    userId,
    relationshipLevel,
    temporalContext
  );
  if (inactivityTrigger) {
    triggers.push(inactivityTrigger);
  }

  // 2. TRIGGER: Emotional Check-in (si última conversación fue negativa)
  const emotionalTrigger = await checkEmotionalTrigger(agentId, userId, relation);
  if (emotionalTrigger) {
    triggers.push(emotionalTrigger);
  }

  // 3. TRIGGER: Cross-context reference (mencionar algo de grupo)
  const crossContextTrigger = await checkCrossContextTrigger(agentId, userId, tier);
  if (crossContextTrigger) {
    triggers.push(crossContextTrigger);
  }

  // 4. TRIGGER: Shared experience (algo en común del clima/rutina)
  const sharedExperienceTrigger = await checkSharedExperienceTrigger(agentId);
  if (sharedExperienceTrigger) {
    triggers.push(sharedExperienceTrigger);
  }

  // 5. TRIGGER: Relationship milestone (nuevo nivel de relación)
  const milestoneTrigger = await checkRelationshipMilestoneTrigger(agentId, userId, relation);
  if (milestoneTrigger) {
    triggers.push(milestoneTrigger);
  }

  // Ordenar por prioridad
  return triggers.sort((a, b) => b.priority - a.priority);
}

/**
 * Trigger de inactividad mejorado (basado en relación)
 */
async function checkInactivityTrigger(
  agentId: string,
  userId: string,
  relationshipLevel: string,
  temporalContext: any
): Promise<EnhancedTrigger | null> {
  if (!temporalContext?.lastIndividualChatAt) {
    return null;
  }

  const hoursSinceLastChat =
    (Date.now() - temporalContext.lastIndividualChatAt.getTime()) / (1000 * 60 * 60);

  // Threshold basado en relación
  const thresholds: Record<string, number> = {
    stranger: 168, // 7 días
    acquaintance: 72, // 3 días
    friend: 48, // 2 días
    close_friend: 24, // 1 día
    intimate: 12, // 12 horas
  };

  const threshold = thresholds[relationshipLevel] || 72;

  if (hoursSinceLastChat >= threshold) {
    return {
      type: "inactivity",
      priority: relationshipLevel === "intimate" ? 0.9 : 0.6,
      context: {
        hoursSinceLastChat,
        relationshipLevel,
      },
      reason: `Han pasado ${Math.floor(hoursSinceLastChat)} horas sin hablar`,
    };
  }

  return null;
}

/**
 * Trigger de check-in emocional
 */
async function checkEmotionalTrigger(
  agentId: string,
  userId: string,
  relation: any
): Promise<EnhancedTrigger | null> {
  // Verificar si la última conversación fue negativa
  const lastMessage = await prisma.message.findFirst({
    where: {
      agentId,
      role: "user",
    },
    orderBy: { createdAt: "desc" },
  });

  if (!lastMessage) {
    return null;
  }

  const hoursSinceLastMessage =
    (Date.now() - lastMessage.createdAt.getTime()) / (1000 * 60 * 60);

  // Si la última interacción fue hace más de 12 horas y menos de 48 horas
  // y la relación tiene baja valence emocional, hacer check-in
  const emotionalValence = (relation.privateState as { emotionalValence?: number })
    .emotionalValence;

  if (
    hoursSinceLastMessage >= 12 &&
    hoursSinceLastMessage <= 48 &&
    emotionalValence !== undefined &&
    emotionalValence < 0
  ) {
    return {
      type: "emotional_checkin",
      priority: 0.85,
      context: {
        lastMessageTime: lastMessage.createdAt,
        emotionalValence,
      },
      reason: "Última conversación tuvo tono negativo",
    };
  }

  return null;
}

/**
 * Trigger de referencia cross-context
 */
async function checkCrossContextTrigger(
  agentId: string,
  userId: string,
  tier: UserTier
): Promise<EnhancedTrigger | null> {
  // Solo para Plus y Ultra (Free no tiene acceso)
  if (tier === "free") {
    return null;
  }

  // Obtener memorias recientes de grupos
  const memories = await getRelevantMemories(agentId, tier, "individual", 3);

  if (memories.length > 0) {
    // Verificar si hace poco tuvo una conversación grupal interesante
    const recentMemory = memories[0];
    const hoursSinceMemory =
      (Date.now() - recentMemory.happenedAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceMemory <= 48 && hoursSinceMemory >= 6) {
      // Entre 6 y 48 horas
      return {
        type: "cross_context_reference",
        priority: 0.75,
        context: {
          memory: recentMemory,
        },
        reason: "Conversación grupal reciente interesante",
      };
    }
  }

  return null;
}

/**
 * Trigger de experiencia compartida (clima/rutina)
 * NOTE: routine feature has been deprecated/removed
 */
async function checkSharedExperienceTrigger(agentId: string): Promise<EnhancedTrigger | null> {
  // Feature deprecated - routine table no longer exists
  return null;

  /* DEPRECATED CODE - routine feature removed
  // Verificar si el agente tiene una rutina actual interesante
  const routine = await prisma.routine.findFirst({
    where: {
      agentId,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!routine) {
    return null;
  }

  // Parsear la rutina para encontrar actividades actuales
  const now = new Date();
  const currentHour = now.getHours();

  // Esto es simplificado - en producción usarías la lógica completa de routine
  // Por ahora, solo verificar si hay algo interesante en la rutina
  const routineData = routine.schedule as any;

  // Si hay una actividad especial ahora, compartir experiencia
  if (routineData && routineData.specialActivities) {
    return {
      type: "shared_experience",
      priority: 0.65,
      context: {
        routineActivity: routineData.specialActivities[0],
      },
      reason: "Actividad especial en rutina actual",
    };
  }

  return null;
  */
}

/**
 * Trigger de milestone de relación
 */
async function checkRelationshipMilestoneTrigger(
  agentId: string,
  userId: string,
  relation: any
): Promise<EnhancedTrigger | null> {
  // Verificar si recientemente hubo un cambio significativo en la relación
  const previousRelation = await prisma.relation.findFirst({
    where: {
      subjectId: agentId,
      targetId: userId,
      targetType: "user",
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!previousRelation) {
    return null;
  }

  // Calcular niveles antes y después
  const currentLevel = EmotionalEngine.getRelationshipLevel({
    trust: relation.trust,
    affinity: relation.affinity,
    respect: relation.respect,
    love: (relation.privateState as { love?: number }).love || 0,
    curiosity: (relation.privateState as { curiosity?: number }).curiosity || 0,
    valence: 0.5,
    arousal: 0.5,
    dominance: 0.5,
  });

  // Si hay un milestone reciente (última actualización en 24 horas)
  const hoursSinceUpdate =
    (Date.now() - relation.updatedAt.getTime()) / (1000 * 60 * 60);

  if (hoursSinceUpdate <= 24 && currentLevel !== "stranger") {
    return {
      type: "relationship_milestone",
      priority: 0.8,
      context: {
        currentLevel,
        trust: relation.trust,
        affinity: relation.affinity,
      },
      reason: `Relación evolucionó a ${currentLevel}`,
    };
  }

  return null;
}

/**
 * Verifica si es buen momento para enviar mensaje proactivo
 */
export async function isSuitableTimeForProactive(
  agentId: string,
  userId: string
): Promise<boolean> {
  // 1. Verificar energía del agente
  const energyState = await prisma.agentEnergyState.findUnique({
    where: { agentId },
  });

  if (energyState && energyState.current < 30) {
    return false; // Muy cansado para mensajes proactivos
  }

  // 2. Verificar disponibilidad
  const availability = await prisma.agentAvailability.findUnique({
    where: { agentId },
  });

  if (availability && !availability.available) {
    return false; // No disponible
  }

  // 3. Verificar horario silencioso
  const config = await prisma.proactiveConfig.findUnique({
    where: { agentId },
  });

  if (config?.quietHoursStart && config?.quietHoursEnd) {
    const now = new Date();
    const hour = now.getHours();

    const start = config.quietHoursStart;
    const end = config.quietHoursEnd;

    // Manejar quiet hours que cruzan medianoche
    if (start > end) {
      if (hour >= start || hour < end) {
        return false;
      }
    } else {
      if (hour >= start && hour < end) {
        return false;
      }
    }
  }

  return true;
}
