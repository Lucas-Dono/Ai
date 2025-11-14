/**
 * TRIGGER DETECTOR - Sistema inteligente de detección de triggers
 *
 * Detecta cuándo y por qué un agente debe iniciar conversación proactiva.
 *
 * Triggers soportados:
 * - Silencio prolongado (basado en relación)
 * - Topics sin resolver (follow-ups)
 * - Life Events importantes
 * - Estados emocionales negativos prolongados
 * - Logros y celebraciones del usuario
 * - Fechas especiales (cumpleaños, aniversarios)
 */

import { prisma } from '@/lib/prisma';
import { PlutchikEmotionState } from '@/lib/emotions/plutchik';
import { LifeEventsTimelineService, NarrativeArc } from '@/lib/life-events/timeline.service';

export type TriggerType =
  | 'inactivity'
  | 'follow_up'
  | 'emotional_checkin'
  | 'celebration'
  | 'life_event'
  | 'special_date';

export interface ProactiveTrigger {
  type: TriggerType;
  priority: number; // 0-1
  reason: string;
  context: TriggerContext;
}

export interface TriggerContext {
  // Tiempo
  hoursSinceLastMessage?: number;
  daysSinceLastMessage?: number;

  // Relación
  relationshipStage?: string;
  messageCount?: number;

  // Contexto emocional
  lastEmotion?: PlutchikEmotionState;
  emotionDuration?: number; // horas con esa emoción

  // Life Events
  event?: any;
  hoursUntil?: number;

  // Follow-up
  unresolvedTopic?: any;

  // Celebración
  achievement?: any;
  milestone?: string;
}

/**
 * Umbrales de silencio según relación
 */
const INACTIVITY_THRESHOLDS = {
  stranger: 72, // 3 días
  acquaintance: 48, // 2 días
  friend: 24, // 1 día
  close_friend: 12, // 12 horas
};

/**
 * Cooldown mínimo entre mensajes proactivos (12h)
 */
const PROACTIVE_COOLDOWN_HOURS = 12;

export class TriggerDetector {
  /**
   * Detecta si debe iniciar conversación y por qué
   */
  async detectTriggers(
    agentId: string,
    userId: string
  ): Promise<ProactiveTrigger[]> {
    const triggers: ProactiveTrigger[] = [];

    // Verificar cooldown global de mensajes proactivos
    const recentProactive = await this.hasRecentProactiveMessage(agentId, userId);
    if (recentProactive) {
      console.log(
        '[TriggerDetector] Cooldown activo - no generar nuevos triggers'
      );
      return [];
    }

    // 1. Detectar inactividad
    const inactivityTrigger = await this.detectInactivity(agentId, userId);
    if (inactivityTrigger) triggers.push(inactivityTrigger);

    // 2. Detectar topics pendientes de follow-up
    const followUpTrigger = await this.detectFollowUpNeeded(agentId, userId);
    if (followUpTrigger) triggers.push(followUpTrigger);

    // 3. Detectar necesidad de check-in emocional
    const emotionalTrigger = await this.detectEmotionalNeed(agentId, userId);
    if (emotionalTrigger) triggers.push(emotionalTrigger);

    // 4. Detectar life events próximos
    const lifeEventTrigger = await this.detectUpcomingLifeEvent(agentId, userId);
    if (lifeEventTrigger) triggers.push(lifeEventTrigger);

    // 5. Detectar logros/celebraciones
    const celebrationTrigger = await this.detectUserMilestone(agentId, userId);
    if (celebrationTrigger) triggers.push(celebrationTrigger);

    // Ordenar por prioridad
    triggers.sort((a, b) => b.priority - a.priority);

    return triggers;
  }

  /**
   * Verifica si el agente envió un mensaje proactivo recientemente
   */
  private async hasRecentProactiveMessage(
    agentId: string,
    userId: string
  ): Promise<boolean> {
    const cooldownDate = new Date();
    cooldownDate.setHours(cooldownDate.getHours() - PROACTIVE_COOLDOWN_HOURS);

    const recentProactive = await prisma.message.findFirst({
      where: {
        agentId,
        role: 'assistant',
        createdAt: { gte: cooldownDate },
        metadata: {
          path: ['proactive'],
          equals: true,
        },
      },
    });

    return !!recentProactive;
  }

  /**
   * Detecta si hay suficiente inactividad para iniciar conversación
   */
  async detectInactivity(
    agentId: string,
    userId: string
  ): Promise<ProactiveTrigger | null> {
    const lastMessage = await prisma.message.findFirst({
      where: {
        agentId,
        OR: [{ userId, role: 'user' }, { role: 'assistant' }],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastMessage) return null;

    const hoursSince =
      (Date.now() - lastMessage.createdAt.getTime()) / (1000 * 60 * 60);
    const daysSince = hoursSince / 24;

    // Obtener etapa de relación
    const relation = await prisma.relation.findFirst({
      where: {
        subjectId: agentId,
        targetId: userId,
      },
    });

    const stage = relation?.stage || 'stranger';
    const threshold = INACTIVITY_THRESHOLDS[stage as keyof typeof INACTIVITY_THRESHOLDS] || 72;

    // Si no ha pasado suficiente tiempo, no trigger
    if (hoursSince < threshold) {
      return null;
    }

    // Calcular prioridad basada en:
    // - Tiempo transcurrido sobre el threshold
    // - Cercanía de la relación
    const timeOverThreshold = hoursSince - threshold;
    let priority = Math.min(0.9, timeOverThreshold / threshold);

    // Bonus por relación cercana
    if (stage === 'close_friend') priority += 0.1;
    if (stage === 'friend') priority += 0.05;

    // Verificar si última conversación fue positiva
    const wasPositive = await this.wasLastConversationPositive(agentId);
    if (wasPositive) priority += 0.1;

    priority = Math.min(1.0, priority);

    return {
      type: 'inactivity',
      priority,
      reason: `${daysSince.toFixed(1)} días de silencio (threshold: ${(threshold / 24).toFixed(1)} días)`,
      context: {
        hoursSinceLastMessage: hoursSince,
        daysSinceLastMessage: daysSince,
        relationshipStage: stage,
      },
    };
  }

  /**
   * Detecta si hay topics pendientes de follow-up
   */
  async detectFollowUpNeeded(
    agentId: string,
    userId: string
  ): Promise<ProactiveTrigger | null> {
    const internalState = await prisma.internalState.findUnique({
      where: { agentId },
    });

    if (!internalState) return null;

    const unresolvedTopics = (internalState.conversationBuffer as any[]) || [];

    // Buscar topics que necesiten follow-up
    for (const topic of unresolvedTopics) {
      if (topic.resolved) continue;
      if (topic.followUpAttempts >= 2) continue; // Max 2 intentos

      const mentionedAt = new Date(topic.mentionedAt);
      const hoursSince = (Date.now() - mentionedAt.getTime()) / (1000 * 60 * 60);

      // Si tiene fecha esperada de resolución, verificar
      if (topic.expectedResolutionDate) {
        const expectedDate = new Date(topic.expectedResolutionDate);
        const hoursUntilExpected =
          (expectedDate.getTime() - Date.now()) / (1000 * 60 * 60);

        // Si ya pasó la fecha esperada, alta prioridad
        if (hoursUntilExpected <= 0 && hoursUntilExpected >= -48) {
          // Dentro de 2 días después
          return {
            type: 'follow_up',
            priority: 0.85 + topic.importance * 0.15,
            reason: `Follow-up de "${topic.topic}" (fecha esperada pasó)`,
            context: {
              unresolvedTopic: topic,
            },
          };
        }

        // Si está cerca de la fecha (24h antes a 12h después)
        if (hoursUntilExpected >= -12 && hoursUntilExpected <= 24) {
          return {
            type: 'follow_up',
            priority: 0.75 + topic.importance * 0.15,
            reason: `Follow-up de "${topic.topic}" (fecha esperada cercana)`,
            context: {
              unresolvedTopic: topic,
            },
          };
        }
      }

      // Si pasó suficiente tiempo desde la mención (48h+)
      if (hoursSince >= 48 && topic.importance >= 0.6) {
        return {
          type: 'follow_up',
          priority: 0.65 + topic.importance * 0.15,
          reason: `Follow-up de "${topic.topic}" (${(hoursSince / 24).toFixed(1)} días desde mención)`,
          context: {
            unresolvedTopic: topic,
          },
        };
      }
    }

    return null;
  }

  /**
   * Detecta si usuario necesita check-in emocional
   */
  async detectEmotionalNeed(
    agentId: string,
    userId: string
  ): Promise<ProactiveTrigger | null> {
    // Obtener última conversación
    const lastUserMessage = await prisma.message.findFirst({
      where: {
        agentId,
        userId,
        role: 'user',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastUserMessage) return null;

    const hoursSince =
      (Date.now() - lastUserMessage.createdAt.getTime()) / (1000 * 60 * 60);

    // Verificar si último mensaje tenía emoción negativa
    const emotionData = (lastUserMessage.metadata as any)?.emotions;
    if (!emotionData) return null;

    const negativeEmotions = ['sadness', 'fear', 'anger', 'disgust'];
    const dominantEmotion = this.getDominantEmotion(emotionData);

    // Si última emoción fue negativa y pasaron 24-72h
    if (
      negativeEmotions.includes(dominantEmotion) &&
      hoursSince >= 24 &&
      hoursSince <= 72
    ) {
      const intensity = emotionData[dominantEmotion] || 0;

      return {
        type: 'emotional_checkin',
        priority: 0.7 + intensity * 0.2,
        reason: `Check-in emocional (última emoción: ${dominantEmotion})`,
        context: {
          hoursSinceLastMessage: hoursSince,
          lastEmotion: emotionData,
          emotionDuration: hoursSince,
        },
      };
    }

    return null;
  }

  /**
   * Detecta life events próximos que requieren mención
   */
  async detectUpcomingLifeEvent(
    agentId: string,
    userId: string
  ): Promise<ProactiveTrigger | null> {
    // Buscar arcos narrativos activos con eventos próximos
    const activeArcs = await prisma.narrativeArc.findMany({
      where: {
        agentId,
        userId,
        status: 'active',
      },
      include: {
        events: {
          orderBy: { eventDate: 'desc' },
          take: 1,
        },
      },
    });

    for (const arc of activeArcs) {
      const lastEvent = arc.events[0];
      if (!lastEvent) continue;

      const hoursUntilEvent =
        (lastEvent.eventDate.getTime() - Date.now()) / (1000 * 60 * 60);

      // Si el evento es en las próximas 24-48h
      if (hoursUntilEvent >= 0 && hoursUntilEvent <= 48) {
        // Prioridad más alta si es más cercano
        const priority = 0.8 - hoursUntilEvent / 100;

        return {
          type: 'life_event',
          priority: Math.max(0.6, Math.min(0.95, priority)),
          reason: `Life event próximo: ${arc.title || arc.theme}`,
          context: {
            event: {
              description: arc.title || arc.theme,
              type: arc.category,
              priority: arc.confidence,
            },
            hoursUntil: hoursUntilEvent,
          },
        };
      }
    }

    return null;
  }

  /**
   * Detecta logros o hitos del usuario para celebrar
   */
  async detectUserMilestone(
    agentId: string,
    userId: string
  ): Promise<ProactiveTrigger | null> {
    // Contar mensajes totales
    const messageCount = await prisma.message.count({
      where: { agentId, userId, role: 'user' },
    });

    // Hitos de mensajes
    const milestones = [10, 50, 100, 250, 500, 1000];
    if (milestones.includes(messageCount)) {
      return {
        type: 'celebration',
        priority: 0.75,
        reason: `Milestone de ${messageCount} mensajes`,
        context: {
          milestone: `${messageCount} mensajes juntos`,
          messageCount,
        },
      };
    }

    // Verificar aniversario de primer mensaje
    const firstMessage = await prisma.message.findFirst({
      where: { agentId, userId, role: 'user' },
      orderBy: { createdAt: 'asc' },
    });

    if (firstMessage) {
      const daysSinceFirst =
        (Date.now() - firstMessage.createdAt.getTime()) / (1000 * 60 * 60 * 24);

      // Aniversarios en meses
      const monthAnniversaries = [30, 60, 90, 180, 365];
      for (const days of monthAnniversaries) {
        // Dentro de un margen de 1 día
        if (Math.abs(daysSinceFirst - days) <= 1) {
          const months = Math.floor(days / 30);
          return {
            type: 'celebration',
            priority: 0.8,
            reason: `Aniversario de ${months} ${months === 1 ? 'mes' : 'meses'}`,
            context: {
              milestone: `${months} ${months === 1 ? 'mes' : 'meses'} juntos`,
            },
          };
        }
      }
    }

    return null;
  }

  /**
   * Helper: Verifica si última conversación fue positiva
   */
  private async wasLastConversationPositive(agentId: string): Promise<boolean> {
    const lastMessages = await prisma.message.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    let positiveCount = 0;
    for (const msg of lastMessages) {
      const emotionData = (msg.metadata as any)?.emotions;
      if (emotionData) {
        const joy = emotionData.joy || 0;
        const trust = emotionData.trust || 0;
        if (joy > 0.5 || trust > 0.5) positiveCount++;
      }
    }

    return positiveCount >= 2;
  }

  /**
   * Helper: Obtiene emoción dominante
   */
  private getDominantEmotion(emotions: PlutchikEmotionState): string {
    const emotionArray = Object.entries(emotions);
    emotionArray.sort((a, b) => (b[1] as number) - (a[1] as number));
    return emotionArray[0][0];
  }
}

/**
 * Singleton instance
 */
export const triggerDetector = new TriggerDetector();
