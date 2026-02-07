/**
 * APPRAISAL ENGINE - OCC MODEL IMPLEMENTATION
 *
 * Evalúa situaciones según el modelo OCC (Ortony, Clore, Collins)
 * para generar emociones dinámicamente basadas en:
 * - Deseabilidad para objetivos del personaje
 * - Deseabilidad para el usuario
 * - Dignidad de elogio/reproche de acciones
 * - Atractivo de objetos
 * - Relevancia para objetivos, valores, y contexto
 */

import { AppraisalScores, CompleteCharacterState, Goal, CoreValue } from "../../types";
import { getHybridLLMProvider } from "../../llm/hybrid-provider";
import { normalizeCoreValuesToWeightedArray } from "@/lib/psychological-analysis/corevalues-normalizer";

export class AppraisalEngine {
  private llmClient = getHybridLLMProvider();

  /**
   * Evalúa un mensaje del usuario según el estado del personaje
   */
  async evaluateSituation(
    userMessage: string,
    characterState: CompleteCharacterState
  ): Promise<AppraisalScores> {
    console.log("[AppraisalEngine] Evaluating situation...");

    const prompt = this.buildAppraisalPrompt(userMessage, characterState);

    try {
      // Usar Gemini (gratis) para appraisal técnico
      const appraisalData = await this.llmClient.generateJSON<AppraisalScores>(
        'appraisal', // Fase: usa Gemini automáticamente
        this.getSystemPrompt(),
        prompt,
        {
          temperature: 0.3, // Bajo para evaluación consistente
        }
      );

      console.log("[AppraisalEngine] Appraisal completed:", appraisalData);

      return this.validateAndNormalize(appraisalData);
    } catch (error) {
      console.error("[AppraisalEngine] Error evaluating, using fallback:", error);
      return this.getFallbackAppraisal();
    }
  }

  /**
   * System prompt para el evaluador
   */
  private getSystemPrompt(): string {
    return `Eres un evaluador psicológico interno basado en el modelo OCC (Ortony, Clore, Collins).
Tu tarea es analizar mensajes desde la perspectiva de un personaje y generar evaluaciones cuantitativas.

IMPORTANTE:
- Respondes SOLO con JSON válido
- Todas las puntuaciones deben estar en los rangos especificados
- Tu evaluación debe ser desde la PERSPECTIVA DEL PERSONAJE, no neutral

Modelo de evaluación OCC:
1. EVENTOS - ¿Qué tan deseable es esto?
2. ACCIONES - ¿Son dignas de elogio/reproche?
3. OBJETOS - ¿Son atractivos/repulsivos?
4. CONTEXTO - Relevancia para objetivos, valores, novedad`;
  }

  /**
   * Construye el prompt de evaluación
   */
  private buildAppraisalPrompt(
    userMessage: string,
    characterState: CompleteCharacterState
  ): string {
    const { personalityCore, internalState, semanticMemory } = characterState;

    // Extraer información clave
    const currentGoals = internalState.goals
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3); // Top 3 objetivos

    const coreValues = normalizeCoreValuesToWeightedArray(personalityCore.coreValues)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3); // Top 3 valores

    const currentEmotions = this.describeCurrentEmotions(internalState.emotions);

    return `PERSONAJE:
Nombre: ${characterState.agentId}
Personalidad Big Five:
- Apertura: ${personalityCore.bigFive.openness}/100
- Responsabilidad: ${personalityCore.bigFive.conscientiousness}/100
- Extraversión: ${personalityCore.bigFive.extraversion}/100
- Amabilidad: ${personalityCore.bigFive.agreeableness}/100
- Neuroticismo: ${personalityCore.bigFive.neuroticism}/100

Valores Core (más importantes):
${coreValues.map((v) => `- ${v.value} (peso: ${v.weight}): ${v.description}`).join("\n")}

Objetivos Actuales:
${currentGoals.map((g) => `- ${g.goal} (prioridad: ${g.priority}, tipo: ${g.type})`).join("\n")}

Estado Emocional Actual:
${currentEmotions}

Etapa de Relación con Usuario: ${semanticMemory.relationshipStage}

MENSAJE DEL USUARIO:
"${userMessage}"

EVALÚA este mensaje en escala numérica. Responde SOLO con este JSON:
{
  "desirability": <-1 a 1: ¿Es deseable para los objetivos del personaje?>,
  "desirabilityForUser": <-1 a 1: ¿Es bueno/malo para el usuario?>,
  "praiseworthiness": <-1 a 1: ¿Las acciones del usuario son dignas de elogio (-1) o reproche (1)?>,
  "appealingness": <-1 a 1: ¿El contenido es atractivo/agradable al personaje?>,
  "likelihood": <0 a 1: Si hay perspectiva futura, ¿qué tan probable es?>,
  "relevanceToGoals": <0 a 1: ¿Qué tan relevante para objetivos actuales?>,
  "valueAlignment": <-1 a 1: ¿Se alinea con valores core del personaje?>,
  "novelty": <0 a 1: ¿Qué tan nueva/sorprendente es esta información?>,
  "urgency": <0 a 1: ¿Qué tan urgente es responder/actuar?>,
  "socialAppropriateness": <0 a 1: ¿Es socialmente apropiado?>
}

CRITERIOS DE EVALUACIÓN:
- desirability: Evalúa según objetivos del PERSONAJE. Si conflictúa con objetivos = negativo.
- desirabilityForUser: Evalúa el bienestar del USUARIO. Perder trabajo = muy negativo.
- praiseworthiness: Solo aplica si el usuario realizó una ACCIÓN. Neutral si solo informa.
- valueAlignment: Compara con valores core. Violar valor importante = muy negativo.
- novelty: Primera mención de algo = alta novedad. Tema recurrente = baja novedad.
- urgency: Problema serio/crisis = alta urgencia. Conversación casual = baja urgencia.

Recuerda: Evalúa desde la PERSPECTIVA del personaje, considerando SU personalidad y valores.`;
  }

  /**
   * Describe emociones actuales en texto
   */
  private describeCurrentEmotions(emotions: Record<string, number>): string {
    const activeEmotions = Object.entries(emotions)
      .filter(([_, intensity]) => intensity > 0.3)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3);

    if (activeEmotions.length === 0) {
      return "Neutral (ninguna emoción dominante)";
    }

    return activeEmotions
      .map(([emotion, intensity]) => `${emotion} (${(intensity * 100).toFixed(0)}%)`)
      .join(", ");
  }

  /**
   * Valida y normaliza scores de appraisal
   */
  private validateAndNormalize(appraisal: Partial<AppraisalScores>): AppraisalScores {
    const clamp = (value: number | undefined, min: number, max: number): number => {
      if (value === undefined || isNaN(value)) return (min + max) / 2;
      return Math.max(min, Math.min(max, value));
    };

    return {
      desirability: clamp(appraisal.desirability, -1, 1),
      desirabilityForUser: clamp(appraisal.desirabilityForUser, -1, 1),
      praiseworthiness: clamp(appraisal.praiseworthiness, -1, 1),
      appealingness: clamp(appraisal.appealingness, -1, 1),
      likelihood: clamp(appraisal.likelihood, 0, 1),
      relevanceToGoals: clamp(appraisal.relevanceToGoals, 0, 1),
      valueAlignment: clamp(appraisal.valueAlignment, -1, 1),
      novelty: clamp(appraisal.novelty, 0, 1),
      urgency: clamp(appraisal.urgency, 0, 1),
      socialAppropriateness: clamp(appraisal.socialAppropriateness, 0, 1),
    };
  }

  /**
   * Appraisal fallback si falla el LLM
   */
  private getFallbackAppraisal(): AppraisalScores {
    return {
      desirability: 0.1,
      desirabilityForUser: 0.0,
      praiseworthiness: 0.0,
      appealingness: 0.0,
      likelihood: 0.5,
      relevanceToGoals: 0.5,
      valueAlignment: 0.0,
      novelty: 0.3,
      urgency: 0.4,
      socialAppropriateness: 0.7,
    };
  }

  /**
   * Evalúa si un mensaje viola valores core del personaje
   */
  evaluateValueViolation(
    appraisal: AppraisalScores,
    coreValues: CoreValue[]
  ): { violated: boolean; value?: string; severity?: number } {
    // Si value alignment es muy negativo y hay valores importantes
    if (appraisal.valueAlignment < -0.5) {
      const importantValues = coreValues.filter((v) => v.weight > 0.7);

      if (importantValues.length > 0) {
        const mostImportant = importantValues[0];
        return {
          violated: true,
          value: mostImportant.value,
          severity: Math.abs(appraisal.valueAlignment),
        };
      }
    }

    return { violated: false };
  }
}
