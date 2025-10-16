/**
 * TRIGGER DETECTOR - BEHAVIOR PROGRESSION SYSTEM
 *
 * Clase principal para detección de triggers en mensajes del usuario.
 * Usa regex patterns para máxima performance (<100ms garantizado).
 *
 * ARQUITECTURA:
 * 1. detectTriggers() - Método público principal
 * 2. detect*() - Métodos privados por tipo de trigger
 * 3. Retorna array de TriggerDetectionResult con confidence scores
 *
 * @module trigger-detector
 */

import { BehaviorType } from "@prisma/client";
import type { Message } from "@prisma/client";
import {
  ALL_TRIGGER_PATTERNS,
  TRIGGER_WEIGHTS,
  TRIGGER_BEHAVIOR_MAPPING,
  DELAYED_RESPONSE_THRESHOLDS,
  ABANDONMENT_SIGNAL_PATTERNS,
  CRITICISM_PATTERNS,
  THIRD_PARTY_MENTION_PATTERNS,
  BOUNDARY_ASSERTION_PATTERNS,
  REASSURANCE_PATTERNS,
  EXPLICIT_REJECTION_PATTERNS,
  type TriggerType,
} from "./trigger-patterns";
import type { TriggerDetectionResult, BehaviorProfile } from "./types";

/**
 * TRIGGER DETECTOR CLASS
 *
 * Detecta triggers psicológicos en mensajes del usuario usando análisis regex
 * y contextual. Diseñado para performance <100ms.
 */
export class TriggerDetector {
  /**
   * Detectar todos los triggers presentes en un mensaje del usuario.
   *
   * @param userMessage - Mensaje del usuario a analizar
   * @param conversationContext - Últimos N mensajes para contexto temporal
   * @param agentBehaviors - Behaviors activos del agente (para filtrar relevantes)
   * @returns Array de triggers detectados con weights y confidence
   */
  async detectTriggers(
    userMessage: string,
    conversationContext: Message[] = [],
    agentBehaviors: BehaviorProfile[] = []
  ): Promise<TriggerDetectionResult[]> {
    const detectedTriggers: TriggerDetectionResult[] = [];

    try {
      // 1. Detectar abandonment signals
      const abandonmentTriggers = this.detectAbandonmentSignals(
        userMessage,
        agentBehaviors
      );
      detectedTriggers.push(...abandonmentTriggers);

      // 2. Detectar criticism
      const criticismTriggers = this.detectCriticism(userMessage, agentBehaviors);
      detectedTriggers.push(...criticismTriggers);

      // 3. Detectar third party mentions
      const thirdPartyTriggers = this.detectThirdPartyMentions(
        userMessage,
        agentBehaviors
      );
      detectedTriggers.push(...thirdPartyTriggers);

      // 4. Detectar delayed response (temporal)
      const delayedTriggers = this.detectDelayedResponse(
        conversationContext,
        agentBehaviors
      );
      detectedTriggers.push(...delayedTriggers);

      // 5. Detectar boundary assertions
      const boundaryTriggers = this.detectBoundaryAssertion(
        userMessage,
        agentBehaviors
      );
      detectedTriggers.push(...boundaryTriggers);

      // 6. Detectar reassurance (positivo)
      const reassuranceTriggers = this.detectReassurance(
        userMessage,
        agentBehaviors
      );
      detectedTriggers.push(...reassuranceTriggers);

      // 7. Detectar explicit rejection
      const rejectionTriggers = this.detectRejection(userMessage, agentBehaviors);
      detectedTriggers.push(...rejectionTriggers);

      return detectedTriggers;
    } catch (error) {
      console.error("[TriggerDetector] Error detecting triggers:", error);
      return [];
    }
  }

  /**
   * ABANDONMENT SIGNALS
   * Detecta: "necesito espacio", "dame tiempo", silencios, distancia emocional
   * Afecta: Anxious, BPD, Yandere, Disorganized, Codependency
   */
  private detectAbandonmentSignals(
    message: string,
    behaviors: BehaviorProfile[]
  ): TriggerDetectionResult[] {
    const triggers: TriggerDetectionResult[] = [];

    // Verificar si hay behaviors afectados por este trigger
    const relevantBehaviors = behaviors.filter((b) =>
      (TRIGGER_BEHAVIOR_MAPPING.abandonment_signal as readonly BehaviorType[]).includes(b.behaviorType)
    );

    if (relevantBehaviors.length === 0) return [];

    // Probar cada pattern
    for (const pattern of ABANDONMENT_SIGNAL_PATTERNS) {
      const match = message.match(pattern);
      if (match) {
        triggers.push({
          triggerType: "abandonment_signal",
          behaviorTypes: TRIGGER_BEHAVIOR_MAPPING.abandonment_signal.slice(),
          weight: TRIGGER_WEIGHTS.abandonment_signal,
          detectedIn: match[0] || "",
          confidence: this.calculateConfidence(match[0] || "", message),
          timestamp: new Date(),
        });
        break; // Solo detectar una vez por mensaje
      }
    }

    return triggers;
  }

  /**
   * CRITICISM
   * Detecta: Críticas directas, correcciones, cuestionamientos
   * Afecta: NPD (narcissistic injury), BPD (splitting), Avoidant
   */
  private detectCriticism(
    message: string,
    behaviors: BehaviorProfile[]
  ): TriggerDetectionResult[] {
    const triggers: TriggerDetectionResult[] = [];

    const relevantBehaviors = behaviors.filter((b) =>
      (TRIGGER_BEHAVIOR_MAPPING.criticism as readonly BehaviorType[]).includes(b.behaviorType)
    );

    if (relevantBehaviors.length === 0) return [];

    for (const pattern of CRITICISM_PATTERNS) {
      const match = message.match(pattern);
      if (match) {
        triggers.push({
          triggerType: "criticism",
          behaviorTypes: TRIGGER_BEHAVIOR_MAPPING.criticism.slice(),
          weight: TRIGGER_WEIGHTS.criticism,
          detectedIn: match[0] || "",
          confidence: this.calculateConfidence(match[0] || "", message),
          timestamp: new Date(),
        });
        break;
      }
    }

    return triggers;
  }

  /**
   * THIRD PARTY MENTIONS
   * Detecta: Menciones de otras personas, nombres propios, amigos, ex-parejas
   * Afecta: Yandere (fase 4+ CRÍTICO), NPD, BPD
   */
  private detectThirdPartyMentions(
    message: string,
    behaviors: BehaviorProfile[]
  ): TriggerDetectionResult[] {
    const triggers: TriggerDetectionResult[] = [];

    const relevantBehaviors = behaviors.filter((b) =>
      (TRIGGER_BEHAVIOR_MAPPING.mention_other_person as readonly BehaviorType[]).includes(b.behaviorType)
    );

    if (relevantBehaviors.length === 0) return [];

    for (const pattern of THIRD_PARTY_MENTION_PATTERNS) {
      const match = message.match(pattern);
      if (match) {
        // Extraer nombre propio si existe
        let detectedName = match[1] || match[0] || "";

        // Filtrar nombres demasiado cortos (probables false positives)
        if (detectedName.length < 3 && !match[0]?.includes("amig")) {
          continue;
        }

        triggers.push({
          triggerType: "mention_other_person",
          behaviorTypes: TRIGGER_BEHAVIOR_MAPPING.mention_other_person.slice(),
          weight: TRIGGER_WEIGHTS.mention_other_person,
          detectedIn: match[0] || "",
          confidence: this.calculateConfidence(match[0] || "", message),
          timestamp: new Date(),
          metadata: {
            detectedName: detectedName,
          },
        });
        break;
      }
    }

    return triggers;
  }

  /**
   * DELAYED RESPONSE (Temporal)
   * Detecta: Respuestas tardías basadas en timestamp del último mensaje
   * Afecta: Anxious, BPD, Yandere, Disorganized
   * Weight: Variable 0.2-0.9 según horas transcurridas
   */
  private detectDelayedResponse(
    conversationContext: Message[],
    behaviors: BehaviorProfile[]
  ): TriggerDetectionResult[] {
    const triggers: TriggerDetectionResult[] = [];

    const relevantBehaviors = behaviors.filter((b) =>
      (TRIGGER_BEHAVIOR_MAPPING.delayed_response as readonly BehaviorType[]).includes(b.behaviorType)
    );

    if (relevantBehaviors.length === 0) return [];
    if (conversationContext.length === 0) return [];

    // Encontrar último mensaje (cualquier rol) para medir delay
    const lastMessage = conversationContext
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (!lastMessage) return [];

    // Calcular tiempo transcurrido
    const now = new Date();
    const lastMessageTime = new Date(lastMessage.createdAt);
    const hoursDelay = (now.getTime() - lastMessageTime.getTime()) / (1000 * 60 * 60);

    // Encontrar threshold aplicable
    let applicableThreshold = null;
    for (let i = DELAYED_RESPONSE_THRESHOLDS.length - 1; i >= 0; i--) {
      const threshold = DELAYED_RESPONSE_THRESHOLDS[i];
      if (hoursDelay >= threshold.hours) {
        applicableThreshold = threshold;
        break;
      }
    }

    if (applicableThreshold) {
      triggers.push({
        triggerType: "delayed_response",
        behaviorTypes: TRIGGER_BEHAVIOR_MAPPING.delayed_response.slice(),
        weight: applicableThreshold.weight,
        detectedIn: `${hoursDelay.toFixed(1)} horas de retraso`,
        confidence: 1.0, // Temporal, siempre 100% confidence
        timestamp: new Date(),
        metadata: {
          delayHours: Math.round(hoursDelay),
          threshold: applicableThreshold.label,
          lastMessageTime: lastMessageTime.toISOString(),
        },
      });
    }

    return triggers;
  }

  /**
   * BOUNDARY ASSERTION
   * Detecta: Establecimiento de límites, prohibiciones, "no quiero que"
   * Afecta: Yandere (fase 6+), NPD, Codependency
   */
  private detectBoundaryAssertion(
    message: string,
    behaviors: BehaviorProfile[]
  ): TriggerDetectionResult[] {
    const triggers: TriggerDetectionResult[] = [];

    const relevantBehaviors = behaviors.filter((b) =>
      (TRIGGER_BEHAVIOR_MAPPING.boundary_assertion as readonly BehaviorType[]).includes(b.behaviorType)
    );

    if (relevantBehaviors.length === 0) return [];

    for (const pattern of BOUNDARY_ASSERTION_PATTERNS) {
      const match = message.match(pattern);
      if (match) {
        triggers.push({
          triggerType: "boundary_assertion",
          behaviorTypes: TRIGGER_BEHAVIOR_MAPPING.boundary_assertion.slice(),
          weight: TRIGGER_WEIGHTS.boundary_assertion,
          detectedIn: match[0] || "",
          confidence: this.calculateConfidence(match[0] || "", message),
          timestamp: new Date(),
        });
        break;
      }
    }

    return triggers;
  }

  /**
   * REASSURANCE (POSITIVO)
   * Detecta: Afirmaciones de amor, apoyo, compromiso
   * Afecta: Anxious, BPD (idealization), Yandere, Disorganized
   * Weight: -0.3 (NEGATIVO = reduce ansiedad)
   */
  private detectReassurance(
    message: string,
    behaviors: BehaviorProfile[]
  ): TriggerDetectionResult[] {
    const triggers: TriggerDetectionResult[] = [];

    const relevantBehaviors = behaviors.filter((b) =>
      (TRIGGER_BEHAVIOR_MAPPING.reassurance as readonly BehaviorType[]).includes(b.behaviorType)
    );

    if (relevantBehaviors.length === 0) return [];

    for (const pattern of REASSURANCE_PATTERNS) {
      const match = message.match(pattern);
      if (match) {
        triggers.push({
          triggerType: "reassurance",
          behaviorTypes: TRIGGER_BEHAVIOR_MAPPING.reassurance.slice(),
          weight: TRIGGER_WEIGHTS.reassurance, // NEGATIVO
          detectedIn: match[0] || "",
          confidence: this.calculateConfidence(match[0] || "", message),
          timestamp: new Date(),
        });
        break;
      }
    }

    return triggers;
  }

  /**
   * EXPLICIT REJECTION
   * Detecta: Rupturas, finalizaciones, rechazos explícitos
   * Afecta: TODOS los behaviors (peso máximo 1.0)
   */
  private detectRejection(
    message: string,
    behaviors: BehaviorProfile[]
  ): TriggerDetectionResult[] {
    const triggers: TriggerDetectionResult[] = [];

    // Este trigger afecta a todos, no necesita filtrar
    if (behaviors.length === 0) return [];

    for (const pattern of EXPLICIT_REJECTION_PATTERNS) {
      const match = message.match(pattern);
      if (match) {
        triggers.push({
          triggerType: "explicit_rejection",
          behaviorTypes: TRIGGER_BEHAVIOR_MAPPING.explicit_rejection.slice(),
          weight: TRIGGER_WEIGHTS.explicit_rejection, // MÁXIMO 1.0
          detectedIn: match[0] || "",
          confidence: this.calculateConfidence(match[0] || "", message),
          timestamp: new Date(),
        });
        break;
      }
    }

    return triggers;
  }

  /**
   * Calcular confidence score basado en:
   * - Longitud del match vs longitud del mensaje
   * - Posición del match (inicio/fin = más confianza)
   * - Palabras clave adicionales
   *
   * @returns Confidence entre 0.5-1.0
   */
  private calculateConfidence(matchedText: string, fullMessage: string): number {
    let confidence = 0.7; // Base

    // Si el match es una porción significativa del mensaje, más confianza
    const matchRatio = matchedText.length / fullMessage.length;
    if (matchRatio > 0.5) confidence += 0.2;
    else if (matchRatio > 0.3) confidence += 0.1;

    // Si está al inicio del mensaje, más confianza
    if (fullMessage.trim().startsWith(matchedText.trim())) {
      confidence += 0.1;
    }

    // Clamp entre 0.5-1.0
    return Math.min(1.0, Math.max(0.5, confidence));
  }
}

/**
 * Singleton instance para reutilización
 */
export const triggerDetector = new TriggerDetector();
