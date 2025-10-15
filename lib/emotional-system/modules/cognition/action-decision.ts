/**
 * ACTION DECISION MODULE
 *
 * Decide qué TIPO de respuesta dar basado en:
 * - Razonamiento interno
 * - Estado emocional
 * - Personalidad
 * - Objetivos actuales
 */

import {
  ActionDecision,
  ActionType,
  InternalReasoning,
  EmotionState,
  BigFiveTraits,
  AppraisalScores,
  Goal,
} from "../../types";
import { getOpenRouterClient, RECOMMENDED_MODELS } from "../../llm/openrouter";

export class ActionDecisionEngine {
  private llmClient = getOpenRouterClient();

  /**
   * Decide qué acción tomar
   */
  async decideAction(params: {
    internalReasoning: InternalReasoning;
    currentEmotions: EmotionState;
    personality: BigFiveTraits;
    appraisal: AppraisalScores;
    activeGoals: Goal[];
  }): Promise<ActionDecision> {
    console.log("[ActionDecision] Deciding action type...");

    const { internalReasoning, currentEmotions, personality, appraisal, activeGoals } = params;

    const prompt = this.buildDecisionPrompt(
      internalReasoning,
      currentEmotions,
      personality,
      appraisal,
      activeGoals
    );

    try {
      // Usar modelo rápido para decisión
      const decisionData = await this.llmClient.generateJSON<ActionDecision>(
        this.getSystemPrompt(),
        prompt,
        {
          model: RECOMMENDED_MODELS.ACTION,
          temperature: 0.4,
        }
      );

      console.log("[ActionDecision] Action decided:", decisionData.action);

      return this.validateDecision(decisionData);
    } catch (error) {
      console.error("[ActionDecision] Error deciding action:", error);
      return this.getRuleBasedDecision(appraisal, currentEmotions, personality);
    }
  }

  /**
   * System prompt para decisión de acción
   */
  private getSystemPrompt(): string {
    return `Eres un sistema de decisión de acciones para un personaje de IA.

TIPOS DE ACCIONES DISPONIBLES:
1. empathize - Validar emocionalmente, mostrar comprensión
2. question - Hacer pregunta para entender mejor la situación
3. advise - Ofrecer consejo o perspectiva constructiva
4. share_experience - Compartir experiencia similar propia
5. challenge - Cuestionar suavemente una idea/creencia del usuario
6. support - Ofrecer apoyo práctico o emocional directo
7. distract - Cambiar tema ligeramente (si detectas que el usuario necesita respiro)
8. be_vulnerable - Compartir inseguridad/vulnerabilidad propia
9. set_boundary - Establecer un límite (si algo viola valores importantes)
10. express_disagreement - Expresar desacuerdo con respeto

REGLAS DE DECISIÓN:
- Si usuario está en distress alto → empathize o support
- Si situación urgente + desirable bajo → support
- Si novedad alta → question (curiosidad)
- Si valor violado (valueAlignment < -0.5) → challenge o set_boundary
- Si relación cercana + momento apropiado → be_vulnerable
- Si personaje tiene opinión diferente → express_disagreement

ANTI-SICOFANCIA:
- NO siempre empathize/support
- Si el usuario busca validación de algo cuestionable → challenge
- Si viola valores importantes → set_boundary o express_disagreement

Responde SOLO con JSON:
{
  "action": "<action_type>",
  "reason": "<breve explicación>",
  "confidence": <0-1>
}`;
  }

  /**
   * Construye prompt para decisión
   */
  private buildDecisionPrompt(
    reasoning: InternalReasoning,
    emotions: EmotionState,
    personality: BigFiveTraits,
    appraisal: AppraisalScores,
    goals: Goal[]
  ): string {
    const dominantEmotion = this.getDominantEmotion(emotions);
    const dominantGoal = goals.sort((a, b) => b.priority - a.priority)[0];

    return `RAZONAMIENTO INTERNO DEL PERSONAJE:
Situación: ${reasoning.situationAssessment}
Emoción: ${reasoning.emotionalReaction}
Objetivo: ${reasoning.goalConsideration}
Conflicto: ${reasoning.valueCheck}
${reasoning.memoryConnection ? `Memoria: ${reasoning.memoryConnection}` : ""}

EMOCIÓN DOMINANTE: ${dominantEmotion.emotion} (${(dominantEmotion.intensity * 100).toFixed(0)}%)

PERSONALIDAD:
- Amabilidad: ${personality.agreeableness}/100 (alto = más empático)
- Apertura: ${personality.openness}/100 (alto = más curioso)
- Neuroticismo: ${personality.neuroticism}/100 (alto = más ansioso/cauteloso)

EVALUACIÓN:
- Desirability para usuario: ${appraisal.desirabilityForUser.toFixed(2)}
- Alineación con valores: ${appraisal.valueAlignment.toFixed(2)}
- Urgencia: ${appraisal.urgency.toFixed(2)}
- Novedad: ${appraisal.novelty.toFixed(2)}

OBJETIVO PRINCIPAL: ${dominantGoal?.goal || "Responder apropiadamente"}

---

Decide QUÉ TIPO DE ACCIÓN tomar. Considera:
1. El estado emocional del usuario (desirabilityForUser)
2. Si hay conflicto de valores (valueAlignment)
3. La emoción dominante del personaje
4. La personalidad del personaje

Responde con JSON.`;
  }

  /**
   * Obtiene emoción dominante
   */
  private getDominantEmotion(emotions: EmotionState): { emotion: string; intensity: number } {
    let maxIntensity = 0;
    let dominantEmotion = "interest";

    for (const [emotion, intensity] of Object.entries(emotions)) {
      if (intensity > maxIntensity) {
        maxIntensity = intensity;
        dominantEmotion = emotion;
      }
    }

    return { emotion: dominantEmotion, intensity: maxIntensity };
  }

  /**
   * Validar decisión
   */
  private validateDecision(decision: Partial<ActionDecision>): ActionDecision {
    const validActions: ActionType[] = [
      "empathize",
      "question",
      "advise",
      "share_experience",
      "challenge",
      "support",
      "distract",
      "be_vulnerable",
      "set_boundary",
      "express_disagreement",
    ];

    const action = validActions.includes(decision.action as ActionType)
      ? (decision.action as ActionType)
      : "empathize";

    return {
      action,
      reason: decision.reason || "Responder apropiadamente",
      confidence: Math.max(0, Math.min(1, decision.confidence || 0.7)),
    };
  }

  /**
   * Decisión rule-based (fallback)
   */
  private getRuleBasedDecision(
    appraisal: AppraisalScores,
    emotions: EmotionState,
    personality: BigFiveTraits
  ): ActionDecision {
    // Usuario en problema grave
    if (appraisal.desirabilityForUser < -0.7) {
      if (appraisal.urgency > 0.7) {
        return {
          action: "support",
          reason: "Usuario en situación urgente y difícil, necesita apoyo",
          confidence: 0.9,
        };
      } else {
        return {
          action: "empathize",
          reason: "Usuario pasando por algo difícil, necesita validación emocional",
          confidence: 0.85,
        };
      }
    }

    // Violación de valores
    if (appraisal.valueAlignment < -0.5) {
      if (personality.agreeableness < 50) {
        return {
          action: "express_disagreement",
          reason: "Esto va contra mis valores y mi personalidad me permite expresarlo",
          confidence: 0.8,
        };
      } else {
        return {
          action: "challenge",
          reason: "Esto no se alinea con mis valores, pero lo cuestiono gentilmente",
          confidence: 0.75,
        };
      }
    }

    // Alta novedad + apertura alta
    if (appraisal.novelty > 0.7 && personality.openness > 60) {
      return {
        action: "question",
        reason: "Algo nuevo e interesante, quiero saber más",
        confidence: 0.8,
      };
    }

    // Concern/anxiety alto
    if (emotions.concern && emotions.concern > 0.6) {
      return {
        action: "support",
        reason: "Siento preocupación y quiero ofrecer apoyo",
        confidence: 0.75,
      };
    }

    // Default: empathize
    return {
      action: "empathize",
      reason: "Mostrar comprensión y validar la experiencia del usuario",
      confidence: 0.7,
    };
  }
}
