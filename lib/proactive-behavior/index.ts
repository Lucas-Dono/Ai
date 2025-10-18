/**
 * PROACTIVE BEHAVIOR SYSTEM
 *
 * Sistema unificado de comportamientos proactivos que hace que
 * la IA compañera se sienta más "viva" y natural.
 *
 * Incluye:
 * - Conversation Initiator: Inicia conversaciones cuando hay silencio
 * - Topic Suggester: Sugiere temas cuando la conversación se estanca
 * - Follow-Up Tracker: Hace seguimiento de topics mencionados
 *
 * USO:
 * import { proactiveBehavior } from "@/lib/proactive-behavior";
 *
 * // Verificar si debe iniciar conversación
 * const shouldInit = await proactiveBehavior.shouldInitiate(agentId, userId);
 *
 * // Sugerir topic
 * const topic = await proactiveBehavior.suggestTopic(agentId, userId);
 *
 * // Trackear topic sin resolver
 * await proactiveBehavior.trackUnresolvedTopic(agentId, userId, message);
 */

export {
  ConversationInitiator,
  conversationInitiator,
  type InitiatorContext,
  type InitiationResult,
} from "./initiator";

export {
  TopicSuggester,
  topicSuggester,
  type TopicSuggestion,
} from "./topic-suggester";

export {
  FollowUpTracker,
  followUpTracker,
  type UnresolvedTopic,
  type TopicDetectionResult,
} from "./follow-up-tracker";

// ============================================
// UNIFIED API
// ============================================

import { conversationInitiator } from "./initiator";
import { topicSuggester } from "./topic-suggester";
import { followUpTracker } from "./follow-up-tracker";

/**
 * API unificada de comportamientos proactivos
 */
export class ProactiveBehaviorOrchestrator {
  /**
   * Evalúa si debe iniciar una conversación proactivamente
   */
  async shouldInitiate(agentId: string, userId: string) {
    return conversationInitiator.shouldInitiateConversation(agentId, userId);
  }

  /**
   * Obtiene mensaje de iniciación si procede
   */
  async getInitiationMessage(agentId: string, userId: string) {
    return conversationInitiator.getInitiationMessage(agentId, userId);
  }

  /**
   * Verifica si el usuario necesita ayuda con el tema
   */
  needsTopicSuggestion(message: string) {
    return topicSuggester.needsTopicSuggestion(message);
  }

  /**
   * Sugiere un tema de conversación
   */
  async suggestTopic(agentId: string, userId: string, userMessage?: string) {
    return topicSuggester.suggestTopic(agentId, userId, userMessage);
  }

  /**
   * Genera respuesta completa con topic sugerido
   */
  async generateTopicSuggestionResponse(
    agentId: string,
    userId: string,
    userMessage: string
  ) {
    return topicSuggester.generateTopicSuggestionResponse(
      agentId,
      userId,
      userMessage
    );
  }

  /**
   * Detecta si el mensaje contiene un topic sin resolver
   */
  detectUnresolvedTopic(message: string) {
    return followUpTracker.detectUnresolvedTopic(message);
  }

  /**
   * Trackea un topic sin resolver para seguimiento futuro
   */
  async trackUnresolvedTopic(
    agentId: string,
    userId: string,
    message: string,
    detection: ReturnType<typeof followUpTracker.detectUnresolvedTopic>
  ) {
    return followUpTracker.trackUnresolvedTopic(
      agentId,
      userId,
      message,
      detection
    );
  }

  /**
   * Obtiene topics pendientes de follow-up
   */
  async getTopicsForFollowUp(agentId: string, currentDate?: Date) {
    return followUpTracker.getTopicsForFollowUp(agentId, currentDate);
  }

  /**
   * Genera pregunta de follow-up para un topic
   */
  generateFollowUpQuestion(
    topic: ReturnType<typeof followUpTracker.getTopicsForFollowUp> extends Promise<
      infer U
    >
      ? U[number]
      : never
  ) {
    return followUpTracker.generateFollowUpQuestion(topic);
  }

  /**
   * Marca un topic como intentado (incrementa contador)
   */
  async markFollowUpAttempt(agentId: string, topicId: string) {
    return followUpTracker.markFollowUpAttempt(agentId, topicId);
  }

  /**
   * Marca un topic como resuelto
   */
  async resolveTopic(agentId: string, topicId: string) {
    return followUpTracker.resolveTopic(agentId, topicId);
  }

  /**
   * Detecta si el mensaje actual responde a un topic pendiente
   */
  async detectTopicResolution(agentId: string, message: string) {
    return followUpTracker.detectTopicResolution(agentId, message);
  }

  // ============================================
  // WORKFLOW COMPLETO
  // ============================================

  /**
   * Procesa un mensaje entrante del usuario aplicando todos los
   * comportamientos proactivos.
   *
   * Retorna información para que el sistema decida qué hacer.
   */
  async processIncomingMessage(
    agentId: string,
    userId: string,
    userMessage: string
  ): Promise<{
    unresolvedTopic: Awaited<
      ReturnType<typeof followUpTracker.detectUnresolvedTopic>
    > | null;
    resolvedTopic: Awaited<
      ReturnType<typeof followUpTracker.detectTopicResolution>
    > | null;
    needsTopicSuggestion: boolean;
    suggestedTopic?: Awaited<ReturnType<typeof topicSuggester.suggestTopic>>;
  }> {
    // 1. Detectar si resuelve algún topic pendiente
    const resolvedTopic = await this.detectTopicResolution(
      agentId,
      userMessage
    );

    if (resolvedTopic) {
      console.log(
        `[ProactiveBehavior] Topic resuelto: "${resolvedTopic.topic}"`
      );
    }

    // 2. Detectar si menciona un nuevo topic sin resolver
    const unresolvedDetection = this.detectUnresolvedTopic(userMessage);
    let unresolvedTopic = null;

    if (unresolvedDetection.hasUnresolvedTopic) {
      unresolvedTopic = await this.trackUnresolvedTopic(
        agentId,
        userId,
        userMessage,
        unresolvedDetection
      );
    }

    // 3. Verificar si necesita ayuda con el tema
    const needsTopicSuggestion = this.needsTopicSuggestion(userMessage);
    let suggestedTopic = undefined;

    if (needsTopicSuggestion) {
      suggestedTopic = await this.suggestTopic(agentId, userId, userMessage);
      console.log(
        `[ProactiveBehavior] Topic sugerido: "${suggestedTopic.topic}" (${suggestedTopic.source})`
      );
    }

    return {
      unresolvedTopic: unresolvedDetection.hasUnresolvedTopic
        ? unresolvedDetection
        : null,
      resolvedTopic,
      needsTopicSuggestion,
      suggestedTopic,
    };
  }

  /**
   * Verifica si hay topics pendientes de follow-up que deberían
   * ser mencionados en la próxima respuesta.
   *
   * Llamar esto ANTES de generar la respuesta del agente.
   */
  async checkFollowUpOpportunities(
    agentId: string
  ): Promise<{
    hasFollowUp: boolean;
    followUpQuestion?: string;
    topicId?: string;
  }> {
    const topics = await this.getTopicsForFollowUp(agentId);

    if (topics.length === 0) {
      return { hasFollowUp: false };
    }

    // Seleccionar el topic de mayor importancia
    const topTopic = topics.sort((a, b) => b.importance - a.importance)[0];

    // Generar pregunta
    const followUpQuestion = this.generateFollowUpQuestion(topTopic);

    // Marcar como intentado
    await this.markFollowUpAttempt(agentId, topTopic.id);

    console.log(
      `[ProactiveBehavior] Follow-up generado: "${followUpQuestion}" (${topTopic.category})`
    );

    return {
      hasFollowUp: true,
      followUpQuestion,
      topicId: topTopic.id,
    };
  }
}

/**
 * Singleton instance - USAR ESTA
 */
export const proactiveBehavior = new ProactiveBehaviorOrchestrator();
