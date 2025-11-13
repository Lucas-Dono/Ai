/**
 * PROACTIVE BEHAVIOR SYSTEM V2
 *
 * Sistema inteligente de comportamientos proactivos que hace que
 * la IA compañera se sienta más "viva" y natural.
 *
 * COMPONENTES:
 * - Trigger Detector: Detecta cuándo y por qué iniciar conversación
 * - Context Builder: Construye contexto rico para mensajes
 * - Message Generator: Genera mensajes naturales y personalizados
 * - Scheduler: Timing inteligente (horarios, cooldowns)
 * - Analytics Tracker: Métricas de engagement
 * - Topic Suggester: Sugiere temas cuando la conversación se estanca
 * - Follow-Up Tracker: Seguimiento de topics mencionados
 *
 * TRIGGERS SOPORTADOS:
 * - Inactividad (basado en relación)
 * - Topics sin resolver (follow-ups)
 * - Life Events importantes
 * - Check-ins emocionales
 * - Celebraciones y logros
 * - Fechas especiales
 *
 * USO BÁSICO:
 * ```typescript
 * import { proactiveBehavior } from "@/lib/proactive-behavior";
 *
 * // API SIMPLE - Verificar y enviar si procede
 * const result = await proactiveBehavior.checkAndSend(agentId, userId);
 *
 * // API AVANZADA - Control fino
 * const triggers = await proactiveBehavior.detectTriggers(agentId, userId);
 * const canSend = await proactiveBehavior.shouldSendNow(agentId, userId);
 * const message = await proactiveBehavior.generateMessage(agentId, userId, trigger);
 *
 * // ANALYTICS
 * const metrics = await proactiveBehavior.getMetrics(agentId);
 * const insights = await proactiveBehavior.getInsights(agentId);
 * ```
 */

// ============================================
// EXPORTS - Componentes individuales
// ============================================

export {
  TriggerDetector,
  triggerDetector,
  type ProactiveTrigger,
  type TriggerType,
  type TriggerContext,
} from './trigger-detector';

export {
  ContextBuilder,
  contextBuilder,
  type ProactiveContext,
  type ConversationSummary,
  type UnresolvedTopicSummary,
  type NarrativeArcSummary,
  type EventSummary,
} from './context-builder';

export {
  generateProactiveMessage,
  type MessageType,
} from '@/lib/proactive/message-generator';

export {
  ProactiveScheduler,
  proactiveScheduler,
  type SchedulingResult,
} from './scheduler';

export {
  ProactiveAnalyticsTracker,
  proactiveAnalyticsTracker,
  type ProactiveMetrics,
} from './analytics-tracker';

// Exports legacy (mantener compatibilidad)
export {
  ConversationInitiator,
  conversationInitiator,
  type InitiatorContext,
  type InitiationResult,
} from './initiator';

export {
  TopicSuggester,
  topicSuggester,
  type TopicSuggestion,
} from './topic-suggester';

export {
  FollowUpTracker,
  followUpTracker,
  type UnresolvedTopic,
  type TopicDetectionResult,
} from './follow-up-tracker';

// ============================================
// UNIFIED API V2
// ============================================

import { triggerDetector, type ProactiveTrigger } from './trigger-detector';
import { contextBuilder } from './context-builder';
import { generateProactiveMessage } from '@/lib/proactive/message-generator';
import { proactiveScheduler } from './scheduler';
import { proactiveAnalyticsTracker } from './analytics-tracker';
import { conversationInitiator } from './initiator';
import { topicSuggester } from './topic-suggester';
import { followUpTracker, type UnresolvedTopic } from './follow-up-tracker';
import { createLogger } from '@/lib/logger';

const log = createLogger('ProactiveBehavior');

/**
 * Resultado de check & send
 */
export interface CheckAndSendResult {
  sent: boolean;
  message?: string;
  reason: string;
  trigger?: ProactiveTrigger;
  scheduledFor?: Date;
}

/**
 * API unificada V2 de comportamientos proactivos
 */
export class ProactiveBehaviorOrchestrator {
  // ============================================
  // API PRINCIPAL V2
  // ============================================

  /**
   * API SIMPLE: Verifica triggers, timing y envía si procede
   * Esta es la función principal que deberías usar en la mayoría de casos.
   */
  async checkAndSend(
    agentId: string,
    userId: string,
    userTimezone?: string
  ): Promise<CheckAndSendResult> {
    log.info({ agentId, userId }, 'Checking for proactive message opportunity');

    // 1. Detectar triggers
    const triggers = await triggerDetector.detectTriggers(agentId, userId);

    if (triggers.length === 0) {
      return {
        sent: false,
        reason: 'No triggers detected',
      };
    }

    const topTrigger = triggers[0]; // Ya vienen ordenados por prioridad
    log.info(
      { agentId, userId, triggerType: topTrigger.type, priority: topTrigger.priority },
      'Trigger detected'
    );

    // 2. Verificar timing
    const schedulingResult = await proactiveScheduler.shouldSendNow(
      agentId,
      userId,
      userTimezone
    );

    if (!schedulingResult.shouldSend) {
      log.info(
        { agentId, userId, reason: schedulingResult.reason },
        'Not appropriate time to send'
      );

      return {
        sent: false,
        reason: schedulingResult.reason,
        trigger: topTrigger,
        scheduledFor: schedulingResult.suggestedTime,
      };
    }

    // 3. Generar y enviar mensaje
    const message = await generateProactiveMessage(agentId, userId, topTrigger);

    log.info({ agentId, userId, triggerType: topTrigger.type }, 'Proactive message sent');

    return {
      sent: true,
      message,
      reason: `Sent ${topTrigger.type} message`,
      trigger: topTrigger,
    };
  }

  /**
   * Detecta triggers sin enviar (para preview o scheduling)
   */
  async detectTriggers(agentId: string, userId: string): Promise<ProactiveTrigger[]> {
    return triggerDetector.detectTriggers(agentId, userId);
  }

  /**
   * Verifica si es buen momento para enviar (sin detectar triggers)
   */
  async shouldSendNow(
    agentId: string,
    userId: string,
    userTimezone?: string
  ): Promise<{ shouldSend: boolean; reason: string; suggestedTime?: Date }> {
    const result = await proactiveScheduler.shouldSendNow(agentId, userId, userTimezone);
    return {
      shouldSend: result.shouldSend,
      reason: result.reason,
      suggestedTime: result.suggestedTime,
    };
  }

  /**
   * Genera mensaje para un trigger específico (sin enviar)
   */
  async generateMessage(
    agentId: string,
    userId: string,
    trigger: ProactiveTrigger
  ): Promise<string> {
    return generateProactiveMessage(agentId, userId, trigger);
  }

  /**
   * Obtiene mejor momento para enviar en próximas 24h
   */
  async getBestSendTime(
    agentId: string,
    userId: string,
    userTimezone?: string
  ): Promise<Date> {
    return proactiveScheduler.getBestSendTime(agentId, userId, userTimezone);
  }

  // ============================================
  // ANALYTICS
  // ============================================

  /**
   * Obtiene métricas de engagement
   */
  async getMetrics(agentId: string, userId?: string, days: number = 30) {
    return proactiveAnalyticsTracker.getMetrics(agentId, userId, days);
  }

  /**
   * Genera reporte de performance
   */
  async generateReport(agentId: string, userId?: string, days: number = 30) {
    return proactiveAnalyticsTracker.generateReport(agentId, userId, days);
  }

  /**
   * Obtiene insights accionables
   */
  async getInsights(agentId: string, userId?: string) {
    return proactiveAnalyticsTracker.getInsights(agentId, userId);
  }

  // ============================================
  // API LEGACY (compatibilidad con versión anterior)
  // ============================================

  /**
   * @deprecated Use detectTriggers() instead
   */
  async shouldInitiate(agentId: string, userId: string) {
    return conversationInitiator.shouldInitiateConversation(agentId, userId);
  }

  /**
   * @deprecated Use checkAndSend() instead
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
  generateFollowUpQuestion(topic: UnresolvedTopic) {
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
