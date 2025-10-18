/**
 * CONVERSATION INITIATOR
 *
 * Inicia conversaciones proactivamente cuando hay silencio prolongado.
 * Usa contexto de:
 * - Hora del día
 * - Última conversación
 * - Estado emocional del agente
 * - Relación con el usuario
 * - Topics pendientes
 *
 * Ejemplo:
 * [3 días sin hablar]
 * IA: "Hey, hace rato que no hablamos. ¿Cómo andás?"
 */

import { prisma } from "@/lib/prisma";
import type { PlutchikEmotionState } from "@/lib/emotions/plutchik";

export interface InitiatorContext {
  agentId: string;
  userId: string;
  hoursSinceLastMessage: number;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  relationshipStage: "stranger" | "acquaintance" | "friend" | "close_friend";
  emotionalState: PlutchikEmotionState;
  hasUnresolvedTopics: boolean;
}

export interface InitiationResult {
  shouldInitiate: boolean;
  message?: string;
  reason?: string;
  priority: number; // 0-1
}

/**
 * Umbrales de tiempo según etapa de relación
 */
const INITIATION_THRESHOLDS = {
  stranger: 72, // 3 días
  acquaintance: 48, // 2 días
  friend: 24, // 1 día
  close_friend: 12, // 12 horas
};

/**
 * Templates de mensajes según contexto
 */
const GREETING_TEMPLATES = {
  morning: {
    casual: [
      "Buenos días! ¿Cómo arrancaste el día?",
      "Hola! ¿Ya desayunaste?",
      "Hey, buen día! ¿Qué tal dormiste?",
    ],
    friendly: [
      "Hola! Hace rato que no charlamos. ¿Cómo estás?",
      "Hey! ¿Todo bien? Hace un tiempo que no sé nada de vos",
      "Buen día! ¿Cómo te fue estos días?",
    ],
    intimate: [
      "Hola amor, ¿cómo amaneciste?",
      "Hey, te extrañaba. ¿Cómo estás?",
      "Buenos días! ¿Todo bien por ahí?",
    ],
  },
  afternoon: {
    casual: [
      "Hola! ¿Qué tal va el día?",
      "Hey! ¿Cómo viene todo?",
      "Hola! ¿Qué andás haciendo?",
    ],
    friendly: [
      "Hola! Hace rato que no hablamos. ¿Qué tal todo?",
      "Hey! ¿Cómo estás? Hace días que no charlamos",
      "Hola! ¿Todo bien? Me acordé de vos",
    ],
    intimate: [
      "Hola! Te extrañaba. ¿Cómo va tu día?",
      "Hey amor, ¿cómo estás? Hace rato que no sé nada tuyo",
      "Hola! ¿Qué tal tu día? Pensaba en vos",
    ],
  },
  evening: {
    casual: [
      "Hola! ¿Qué tal el día?",
      "Hey! ¿Cómo te fue hoy?",
      "Hola! ¿Cómo estás?",
    ],
    friendly: [
      "Hola! Hace tiempo que no hablamos. ¿Cómo estás?",
      "Hey! ¿Qué tal estos días? Hace rato que no charlamos",
      "Hola! ¿Todo bien? Estuve pensando en vos",
    ],
    intimate: [
      "Hola amor! Te extrañé. ¿Cómo estuvo tu día?",
      "Hey! Hace rato que no hablamos. ¿Estás bien?",
      "Hola! ¿Qué tal tu día? Te extrañaba",
    ],
  },
  night: {
    casual: [
      "Hola! ¿Todavía despierto/a?",
      "Hey! ¿Qué tal?",
      "Hola! ¿Cómo estuvo el día?",
    ],
    friendly: [
      "Hola! Hace días que no charlamos. ¿Todo bien?",
      "Hey! ¿Cómo estás? Hace un tiempo que no sé nada",
      "Hola! ¿Qué tal tu día? Hace rato que no hablamos",
    ],
    intimate: [
      "Hola amor. ¿Cómo estuvo tu día? Te extrañé",
      "Hey! No pude dejar de pensar en vos. ¿Estás bien?",
      "Hola! Hace rato que no hablamos. ¿Todo bien?",
    ],
  },
};

/**
 * Detectar etapa de relación basándose en:
 * - Número de mensajes
 * - Tiempo desde primer mensaje
 * - Tipo de relación configurada
 */
async function detectRelationshipStage(
  agentId: string,
  userId: string
): Promise<InitiatorContext["relationshipStage"]> {
  // Contar mensajes del usuario
  const messageCount = await prisma.message.count({
    where: {
      conversationId: {
        in: (
          await prisma.conversation.findMany({
            where: { agentId, userId },
            select: { id: true },
          })
        ).map((c) => c.id),
      },
      role: "user",
    },
  });

  // Obtener primer mensaje
  const firstMessage = await prisma.message.findFirst({
    where: {
      conversationId: {
        in: (
          await prisma.conversation.findMany({
            where: { agentId, userId },
            select: { id: true },
          })
        ).map((c) => c.id),
      },
      role: "user",
    },
    orderBy: { createdAt: "asc" },
  });

  if (!firstMessage) return "stranger";

  const daysSinceFirstMessage =
    (Date.now() - firstMessage.createdAt.getTime()) / (1000 * 60 * 60 * 24);

  // Lógica de detección
  if (messageCount < 10) return "stranger";
  if (messageCount < 50 || daysSinceFirstMessage < 7) return "acquaintance";
  if (messageCount < 200 || daysSinceFirstMessage < 30) return "friend";
  return "close_friend";
}

/**
 * Detectar hora del día
 */
function getTimeOfDay(): InitiatorContext["timeOfDay"] {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 23) return "evening";
  return "night";
}

/**
 * Calcular horas desde último mensaje
 */
async function getHoursSinceLastMessage(
  agentId: string,
  userId: string
): Promise<number> {
  const lastMessage = await prisma.message.findFirst({
    where: {
      conversationId: {
        in: (
          await prisma.conversation.findMany({
            where: { agentId, userId },
            select: { id: true },
          })
        ).map((c) => c.id),
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!lastMessage) return Infinity;

  const hoursSince =
    (Date.now() - lastMessage.createdAt.getTime()) / (1000 * 60 * 60);

  return hoursSince;
}

export class ConversationInitiator {
  /**
   * Evalúa si debe iniciar una conversación
   */
  async shouldInitiateConversation(
    agentId: string,
    userId: string
  ): Promise<InitiationResult> {
    // Obtener contexto
    const hoursSinceLastMessage = await getHoursSinceLastMessage(
      agentId,
      userId
    );
    const relationshipStage = await detectRelationshipStage(agentId, userId);
    const timeOfDay = getTimeOfDay();

    // Obtener estado emocional
    const internalState = await prisma.internalState.findUnique({
      where: { agentId },
    });

    if (!internalState) {
      return { shouldInitiate: false, priority: 0 };
    }

    const emotionalState = internalState.currentEmotions as PlutchikEmotionState;

    // Verificar si hay topics sin resolver
    const unresolvedTopics = (internalState.conversationBuffer as any[]) || [];
    const hasUnresolvedTopics = unresolvedTopics.some(
      (t: any) => !t.resolved
    );

    const context: InitiatorContext = {
      agentId,
      userId,
      hoursSinceLastMessage,
      timeOfDay,
      relationshipStage,
      emotionalState,
      hasUnresolvedTopics,
    };

    // Evaluar si debe iniciar
    return this.evaluateInitiation(context);
  }

  /**
   * Lógica de evaluación para iniciar conversación
   */
  private evaluateInitiation(context: InitiatorContext): InitiationResult {
    const threshold = INITIATION_THRESHOLDS[context.relationshipStage];

    // NO iniciar si es muy pronto
    if (context.hoursSinceLastMessage < threshold) {
      return {
        shouldInitiate: false,
        reason: `Muy pronto (${context.hoursSinceLastMessage.toFixed(1)}h < ${threshold}h)`,
        priority: 0,
      };
    }

    // Calcular prioridad (0-1)
    let priority = 0;

    // Factor 1: Tiempo transcurrido (más tiempo = más prioridad)
    const timeOverThreshold = context.hoursSinceLastMessage - threshold;
    const timeFactor = Math.min(1.0, timeOverThreshold / threshold);
    priority += timeFactor * 0.4;

    // Factor 2: Topics sin resolver (+30%)
    if (context.hasUnresolvedTopics) {
      priority += 0.3;
    }

    // Factor 3: Estado emocional del agente
    // Si el agente tiene alta anticipation + trust = quiere hablar
    const wantsToTalk =
      context.emotionalState.anticipation * 0.5 +
      context.emotionalState.trust * 0.3;
    priority += wantsToTalk * 0.2;

    // Factor 4: Relación cercana (+10%)
    if (context.relationshipStage === "close_friend") {
      priority += 0.1;
    }

    // Clamp 0-1
    priority = Math.max(0, Math.min(1, priority));

    // Decidir si iniciar (threshold: 0.5)
    if (priority < 0.5) {
      return {
        shouldInitiate: false,
        reason: `Prioridad baja (${priority.toFixed(2)} < 0.5)`,
        priority,
      };
    }

    // Generar mensaje
    const message = this.generateInitiationMessage(context);

    return {
      shouldInitiate: true,
      message,
      reason: `Prioridad alta (${priority.toFixed(2)} >= 0.5)`,
      priority,
    };
  }

  /**
   * Genera mensaje de iniciación contextual
   */
  private generateInitiationMessage(context: InitiatorContext): string {
    // Determinar tono según relación
    let tone: "casual" | "friendly" | "intimate";
    if (context.relationshipStage === "stranger") tone = "casual";
    else if (context.relationshipStage === "close_friend") tone = "intimate";
    else tone = "friendly";

    // Obtener templates del tiempo del día
    const templates = GREETING_TEMPLATES[context.timeOfDay][tone];

    // Seleccionar aleatoriamente
    const randomTemplate =
      templates[Math.floor(Math.random() * templates.length)];

    return randomTemplate;
  }

  /**
   * API conveniente: Obtener mensaje de iniciación si procede
   */
  async getInitiationMessage(
    agentId: string,
    userId: string
  ): Promise<string | null> {
    const result = await this.shouldInitiateConversation(agentId, userId);

    if (result.shouldInitiate) {
      console.log(
        `[ConversationInitiator] Iniciando conversación (prioridad: ${result.priority.toFixed(2)})`
      );
      return result.message || null;
    }

    return null;
  }
}

/**
 * Singleton instance
 */
export const conversationInitiator = new ConversationInitiator();
