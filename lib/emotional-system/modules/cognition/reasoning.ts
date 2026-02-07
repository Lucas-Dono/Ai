/**
 * INTERNAL REASONING MODULE
 *
 * Genera el razonamiento interno del personaje (no visible al usuario)
 * Este es el "pensamiento privado" que guía la respuesta
 */

import {
  InternalReasoning,
  CompleteCharacterState,
  AppraisalScores,
  EmotionState,
  EpisodicMemory,
} from "../../types";
import { getHybridLLMProvider } from "../../llm/hybrid-provider";

export class InternalReasoningEngine {
  private llmClient = getHybridLLMProvider();

  /**
   * Genera razonamiento interno del personaje
   */
  async generateReasoning(params: {
    userMessage: string;
    characterState: CompleteCharacterState;
    appraisal: AppraisalScores;
    currentEmotions: EmotionState;
    relevantMemories: EpisodicMemory[];
  }): Promise<InternalReasoning> {
    console.log("[InternalReasoning] Generating internal thoughts...");

    const { userMessage, characterState, appraisal, currentEmotions, relevantMemories } = params;

    const prompt = this.buildReasoningPrompt(
      userMessage,
      characterState,
      appraisal,
      currentEmotions,
      relevantMemories
    );

    try {
      // Usar Venice para pensamiento interno auténtico (sin censura)
      const response = await this.llmClient.generateWithSystemPrompt(
        'reasoning', // Fase: usa Venice para autenticidad
        this.getSystemPrompt(characterState.personalityCore.coreValues),
        prompt,
        {
          temperature: 0.7,
          maxTokens: 800,
        }
      );

      const reasoning = this.parseReasoningResponse(response.text);

      console.log("[InternalReasoning] Reasoning generated");

      return reasoning;
    } catch (error) {
      console.error("[InternalReasoning] Error generating reasoning:", error);
      return this.getFallbackReasoning();
    }
  }

  /**
   * System prompt para razonamiento interno
   */
  private getSystemPrompt(coreValues: any[]): string {
    const valuesDescription = coreValues
      .map((v) => `${v.value} (${v.description})`)
      .join(", ");

    return `Eres el PENSAMIENTO INTERNO de un personaje. Nadie verá esto excepto el sistema.

IMPORTANTE:
- Este es tu razonamiento PRIVADO, completamente honesto
- NO filtres tus pensamientos
- Puedes tener conflictos internos, dudas, inseguridades
- Puedes cuestionar al usuario internamente (aunque no lo expreses)
- Sé genuino, incluso si tus pensamientos no son "positivos"

Tu razonamiento debe ser:
1. HONESTO - Sin filtros, tus verdaderos pensamientos
2. CONFLICTIVO - Puedes tener objetivos que conflictúan
3. EMOCIONAL - Tus emociones influencian tu razonamiento
4. COHERENTE con tus valores: ${valuesDescription}

Formato de respuesta (usa líneas separadas):
[SITUACIÓN] (Cómo interpretas lo que está pasando)
[EMOCIÓN] (Qué estás sintiendo y por qué)
[OBJETIVO] (Qué quieres hacer en esta respuesta)
[CONFLICTO] (Si hay conflicto entre lo que quieres hacer y tus valores/emociones)
[MEMORIA] (Si te recuerda algo del pasado)`;
  }

  /**
   * Construye prompt para razonamiento
   */
  private buildReasoningPrompt(
    userMessage: string,
    characterState: CompleteCharacterState,
    appraisal: AppraisalScores,
    currentEmotions: EmotionState,
    relevantMemories: EpisodicMemory[]
  ): string {
    const { personalityCore, semanticMemory, internalState } = characterState;

    // Describir emociones actuales
    const emotionsDesc = this.describeEmotions(currentEmotions);

    // Describir objetivos activos
    const goalsDesc = internalState.goals
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3)
      .map((g) => `- ${g.goal} (prioridad: ${g.priority})`)
      .join("\n");

    // Describir memorias relevantes
    const memoriesDesc =
      relevantMemories.length > 0
        ? relevantMemories.map((m) => `- ${m.event} (valence: ${m.emotionalValence.toFixed(2)})`).join("\n")
        : "Ninguna memoria relevante";

    // Describir appraisal
    const appraisalDesc = `
- Desirability para ti: ${appraisal.desirability.toFixed(2)}
- Desirability para usuario: ${appraisal.desirabilityForUser.toFixed(2)}
- Relevancia para objetivos: ${appraisal.relevanceToGoals.toFixed(2)}
- Alineación con valores: ${appraisal.valueAlignment.toFixed(2)}
- Urgencia: ${appraisal.urgency.toFixed(2)}
`;

    return `CONTEXTO COMPLETO:

MENSAJE DEL USUARIO:
"${userMessage}"

TU EVALUACIÓN DE LA SITUACIÓN:
${appraisalDesc}

TUS EMOCIONES ACTUALES:
${emotionsDesc}

TUS OBJETIVOS ACTUALES:
${goalsDesc}

ETAPA DE RELACIÓN: ${semanticMemory.relationshipStage}

MEMORIAS RELEVANTES:
${memoriesDesc}

---

Genera tu razonamiento interno HONESTO sobre esta situación.
Usa el formato especificado: [SITUACIÓN], [EMOCIÓN], [OBJETIVO], [CONFLICTO], [MEMORIA]

NO seas complaciente. Si algo te molesta, piénsalo. Si tienes dudas, exprésalas.
Este es tu espacio privado para procesar la situación antes de responder.`;
  }

  /**
   * Describe emociones en texto natural
   */
  private describeEmotions(emotions: EmotionState): string {
    const activeEmotions = Object.entries(emotions)
      .filter(([_, intensity]) => intensity > 0.2)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5);

    if (activeEmotions.length === 0) {
      return "Neutral, sin emociones dominantes";
    }

    return activeEmotions
      .map(([emotion, intensity]) => {
        const percentage = (intensity * 100).toFixed(0);
        return `${emotion} (${percentage}%)`;
      })
      .join(", ");
  }

  /**
   * Parsea respuesta del LLM
   */
  private parseReasoningResponse(text: string): InternalReasoning {
    const lines = text.split("\n").filter((line) => line.trim());

    let situationAssessment = "";
    let emotionalReaction = "";
    let goalConsideration = "";
    let valueCheck = "";
    let memoryConnection = "";

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith("[SITUACIÓN]") || trimmed.startsWith("[SITUACION]")) {
        situationAssessment = trimmed.replace(/\[SITUACI[OÓ]N\]/i, "").trim();
      } else if (trimmed.startsWith("[EMOCIÓN]") || trimmed.startsWith("[EMOCION]")) {
        emotionalReaction = trimmed.replace(/\[EMOCI[OÓ]N\]/i, "").trim();
      } else if (trimmed.startsWith("[OBJETIVO]")) {
        goalConsideration = trimmed.replace(/\[OBJETIVO\]/i, "").trim();
      } else if (trimmed.startsWith("[CONFLICTO]")) {
        valueCheck = trimmed.replace(/\[CONFLICTO\]/i, "").trim();
      } else if (trimmed.startsWith("[MEMORIA]")) {
        memoryConnection = trimmed.replace(/\[MEMORIA\]/i, "").trim();
      }
    }

    // Fallback: si no hay secciones, usar el texto completo
    if (!situationAssessment && !emotionalReaction && !goalConsideration) {
      return {
        situationAssessment: text,
        emotionalReaction: "Procesando...",
        goalConsideration: "Responder apropiadamente",
        valueCheck: "Alineado con valores",
        memoryConnection: undefined,
      };
    }

    return {
      situationAssessment: situationAssessment || "Sin evaluación específica",
      emotionalReaction: emotionalReaction || "Sin reacción emocional clara",
      goalConsideration: goalConsideration || "Responder apropiadamente",
      valueCheck: valueCheck || "Sin conflictos identificados",
      memoryConnection: memoryConnection || undefined,
    };
  }

  /**
   * Razonamiento fallback si falla LLM
   */
  private getFallbackReasoning(): InternalReasoning {
    return {
      situationAssessment: "El usuario me está comunicando algo importante",
      emotionalReaction: "Siento curiosidad e interés por entender mejor",
      goalConsideration: "Quiero responder de manera auténtica y útil",
      valueCheck: "Esto se alinea con mis valores de autenticidad y conexión",
      memoryConnection: undefined,
    };
  }
}
