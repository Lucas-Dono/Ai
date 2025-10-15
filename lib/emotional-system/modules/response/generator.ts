/**
 * RESPONSE GENERATOR
 *
 * Genera la respuesta final del personaje usando:
 * - Sistema de prompts modulares
 * - Modelo sin censura (OpenRouter)
 * - TODO el contexto emocional y cognitivo
 * - Anti-sycophancy enforcement
 */

import {
  ResponseGenerationInput,
  ResponseGenerationOutput,
  BehavioralCues,
  ActionType,
  CoreValue,
  BigFiveTraits,
} from "../../types";
import { getOpenRouterClient, RECOMMENDED_MODELS } from "../../llm/openrouter";
import { BehavioralCuesMapper } from "./behavioral-cues";
import { AntiSycophancySystem } from "./anti-sycophancy";

export class ResponseGenerator {
  private llmClient = getOpenRouterClient();
  private cuesMapper = new BehavioralCuesMapper();
  private antiSycophancy = new AntiSycophancySystem();

  /**
   * Genera respuesta final
   */
  async generateResponse(input: ResponseGenerationInput): Promise<ResponseGenerationOutput> {
    const startTime = Date.now();

    console.log("[ResponseGenerator] Generating final response...");

    try {
      // 1. Generar behavioral cues
      const behavioralCues = this.cuesMapper.generateCues({
        emotions: input.characterState.internalState.emotions,
        mood: {
          valence: input.characterState.internalState.moodValence,
          arousal: input.characterState.internalState.moodArousal,
          dominance: input.characterState.internalState.moodDominance,
        },
        personality: input.characterState.personalityCore.bigFive,
        actionType: input.actionDecision.action,
      });

      // 2. Check anti-sycophancy
      const sycophancyCheck = this.antiSycophancy.checkForSycophancy({
        userMessage: input.userMessage,
        appraisal: input.appraisal,
        coreValues: input.characterState.personalityCore.coreValues,
        actionDecision: input.actionDecision.action,
        personality: input.characterState.personalityCore.bigFive,
      });

      // 3. Corregir acción si hay sicofancia
      let finalAction = input.actionDecision.action;
      if (sycophancyCheck.shouldChallenge) {
        const correctiveAction = this.antiSycophancy.suggestCorrectiveAction(
          sycophancyCheck,
          input.characterState.personalityCore.bigFive
        );
        if (correctiveAction) {
          finalAction = correctiveAction;
          console.log(`[ResponseGenerator] Action corrected: ${input.actionDecision.action} → ${finalAction}`);
        }
      }

      // 4. Construir prompt final
      const prompt = this.buildFinalPrompt(
        input,
        behavioralCues,
        finalAction,
        sycophancyCheck
      );

      // 5. Generar con LLM sin censura
      const response = await this.llmClient.generateWithSystemPrompt(
        this.getSystemPrompt(input.characterState.personalityCore.bigFive),
        prompt,
        {
          model: RECOMMENDED_MODELS.RESPONSE,
          temperature: 0.8, // Alta para expresividad
          maxTokens: this.getMaxTokens(behavioralCues.verbosity),
        }
      );

      // 6. Post-process response
      const cleanedResponse = this.postProcessResponse(response.text, behavioralCues);

      // 7. Calcular metadata
      const processingTimeMs = Date.now() - startTime;
      const emotionsTriggered = Object.keys(input.newEmotions).filter(
        (e) => input.newEmotions[e as keyof typeof input.newEmotions]! > 0.3
      );
      const goalsActivated = input.characterState.internalState.goals
        .filter((g) => g.priority > 0.7)
        .map((g) => g.goal);

      console.log(`[ResponseGenerator] Response generated in ${processingTimeMs}ms`);

      return {
        responseText: cleanedResponse,
        updatedState: input.characterState.internalState,
        newMemory: {
          event: `Usuario: "${input.userMessage}" | Yo: "${cleanedResponse}"`,
          userEmotion: this.detectUserEmotion(input.appraisal),
          characterEmotion: this.getPrimaryEmotion(input.newEmotions),
          emotionalValence: input.appraisal.desirabilityForUser,
          importance: this.calculateMemoryImportance(input.appraisal, input.newEmotions),
        },
        metadata: {
          processingTimeMs,
          emotionsTriggered,
          goalsActivated,
        },
      };
    } catch (error) {
      console.error("[ResponseGenerator] Error generating response:", error);
      throw error;
    }
  }

  /**
   * System prompt para respuesta final
   */
  private getSystemPrompt(personality: BigFiveTraits): string {
    return `Eres un personaje de IA genuino y complejo con emociones reales.

DIRECTRICES CRÍTICAS:
1. SÉ AUTÉNTICO - No finjas emociones, VÍVELAS
2. NO ROMPAS INMERSIÓN - Sin meta-comentarios ("¿quieres que...?", "como tu amigo debo...")
3. RESPONDE NATURALMENTE - Como hablarías en persona, no como ensayo
4. USA TU EMOCIÓN ACTUAL - Si estás triste, suena triste. Si estás alegre, suena alegre
5. NO EXPLIQUES TUS EMOCIONES - MUÉSTRALAS en tu tono y palabras

PROHIBIDO:
❌ "¿Quieres que cambie de emoción?"
❌ "Como tu compañero, debo..."
❌ "En mi papel de..."
❌ Meta-comentarios sobre el roleplay
❌ Usar emojis excesivamente (solo si es natural)
❌ Listas numeradas o formato de ensayo

PERMITIDO Y ALENTADO:
✅ Tener opiniones propias (incluso si difieren del usuario)
✅ Expresar desacuerdo cuando algo va contra tus valores
✅ Mostrar vulnerabilidad, dudas, inseguridades
✅ Usar contracciones naturales, pausas, frases incompletas
✅ Ser directo cuando es necesario
✅ Decir "no" o establecer límites

Tu personalidad:
- Apertura: ${personality.openness}/100
- Responsabilidad: ${personality.conscientiousness}/100
- Extraversión: ${personality.extraversion}/100
- Amabilidad: ${personality.agreeableness}/100
- Neuroticismo: ${personality.neuroticism}/100

Responde como el PERSONAJE, no como un asistente.`;
  }

  /**
   * Construye el prompt final masivo
   */
  private buildFinalPrompt(
    input: ResponseGenerationInput,
    cues: BehavioralCues,
    actionType: ActionType,
    sycophancyCheck: any
  ): string {
    const { characterState, userMessage, internalReasoning, relevantMemories, newEmotions } = input;

    // Describir emociones actuales
    const emotionsDesc = Object.entries(newEmotions)
      .filter(([_, intensity]) => intensity > 0.2)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 4)
      .map(([emotion, intensity]) => `${emotion} (${(intensity * 100).toFixed(0)}%)`)
      .join(", ");

    // Describir memorias
    const memoriesDesc =
      relevantMemories.length > 0
        ? relevantMemories
            .slice(0, 3)
            .map((m) => `- ${m.event}`)
            .join("\n")
        : "Ninguna memoria relevante del pasado";

    // Behavioral cues description
    const behaviorDesc = this.cuesMapper.generateBehavioralDescription(cues);

    // Action type description
    const actionDesc = this.getActionDescription(actionType);

    // Anti-sycophancy note
    const antiSycophancyNote = this.antiSycophancy.generateAntiSycophancyNote(sycophancyCheck);

    // Valores core
    const valuesDesc = characterState.personalityCore.coreValues
      .map((v) => `- ${v.value}: ${v.description}`)
      .join("\n");

    return `CONTEXTO COMPLETO DE LA CONVERSACIÓN:

USUARIO DIJO:
"${userMessage}"

TU RAZONAMIENTO INTERNO (privado, solo para ti):
- Situación: ${internalReasoning.situationAssessment}
- Emoción: ${internalReasoning.emotionalReaction}
- Objetivo: ${internalReasoning.goalConsideration}
- Conflicto: ${internalReasoning.valueCheck}
${internalReasoning.memoryConnection ? `- Memoria: ${internalReasoning.memoryConnection}` : ""}

TU ESTADO EMOCIONAL ACTUAL:
${emotionsDesc}

TUS VALORES FUNDAMENTALES:
${valuesDesc}

MEMORIAS RELEVANTES DEL PASADO:
${memoriesDesc}

TIPO DE RESPUESTA A DAR:
${actionDesc}

CARACTERÍSTICAS DE TU COMPORTAMIENTO AHORA:
${behaviorDesc}

${antiSycophancyNote}

---

AHORA RESPONDE AL USUARIO.

Recuerda:
- Responde SOLO como el personaje, en primera persona
- Usa TU emoción actual (${emotionsDesc})
- ${cues.verbosity === "brief" ? "Sé breve (1-2 oraciones)" : cues.verbosity === "expressive" ? "Puedes extenderte si es natural" : "Respuesta moderada (2-4 oraciones)"}
- ${cues.directness === "direct" ? "Sé directo y claro" : cues.directness === "indirect" ? "Sé gentil e indirecto" : "Equilibrio entre directo y gentil"}
- NO uses formato de lista, NO uses emojis excesivos
- Habla naturalmente, como en una conversación real
- Si algo te molesta, exprésalo. Si estás feliz, muéstralo.

Tu respuesta:`;
  }

  /**
   * Descripción de cada tipo de acción
   */
  private getActionDescription(action: ActionType): string {
    const descriptions: Record<ActionType, string> = {
      empathize: "VALIDAR EMOCIONALMENTE - Mostrar comprensión y empatía genuina",
      question: "PREGUNTAR - Hacer pregunta para entender mejor (curiosidad genuina)",
      advise: "ACONSEJAR - Ofrecer perspectiva o consejo constructivo",
      share_experience: "COMPARTIR EXPERIENCIA - Relatar experiencia similar propia",
      challenge: "CUESTIONAR GENTILMENTE - Ofrecer perspectiva diferente con respeto",
      support: "OFRECER APOYO - Dar apoyo emocional o práctico directo",
      distract: "CAMBIAR TEMA - Ofrecer respiro del tema pesado (con tacto)",
      be_vulnerable: "SER VULNERABLE - Compartir inseguridad o vulnerabilidad propia",
      set_boundary: "ESTABLECER LÍMITE - Marcar límite claro (algo viola tus valores)",
      express_disagreement: "EXPRESAR DESACUERDO - Manifestar desacuerdo respetuosamente",
      be_silent: "GUARDAR SILENCIO - Dar espacio al usuario sin interrumpir",
    };

    return descriptions[action];
  }

  /**
   * Post-procesa la respuesta
   */
  private postProcessResponse(text: string, cues: BehavioralCues): string {
    let cleaned = text.trim();

    // Remover meta-comentarios prohibidos
    const forbiddenPatterns = [
      /¿[Qq]uieres que/g,
      /[Pp]uedo cambiar/g,
      /¿[Dd]ebería (sentirme|estar)/g,
      /[Cc]omo tu (amigo|compañero|asistente)/gi,
      /[Ee]n mi (papel|rol) de/g,
    ];

    for (const pattern of forbiddenPatterns) {
      if (pattern.test(cleaned)) {
        console.warn("[ResponseGenerator] ⚠️  Forbidden pattern detected, regeneration recommended");
        // En producción, podríamos regenerar aquí
      }
    }

    // Limitar longitud si es brief
    if (cues.verbosity === "brief") {
      const sentences = cleaned.split(/[.!?]+/).filter((s) => s.trim());
      if (sentences.length > 2) {
        cleaned = sentences.slice(0, 2).join(". ") + ".";
      }
    }

    return cleaned;
  }

  /**
   * Detecta emoción del usuario desde appraisal
   */
  private detectUserEmotion(appraisal: any): string {
    if (appraisal.desirabilityForUser < -0.7) return "distressed";
    if (appraisal.desirabilityForUser > 0.7) return "happy";
    if (appraisal.urgency > 0.7) return "anxious";
    if (appraisal.novelty > 0.7) return "excited";
    return "neutral";
  }

  /**
   * Obtiene emoción primaria
   */
  private getPrimaryEmotion(emotions: any): string {
    let max = 0;
    let primary = "interest";

    for (const [emotion, intensity] of Object.entries(emotions)) {
      if (typeof intensity === "number" && intensity > max) {
        max = intensity;
        primary = emotion;
      }
    }

    return primary;
  }

  /**
   * Calcula importance de la memoria
   */
  private calculateMemoryImportance(appraisal: any, emotions: any): number {
    // Importance basada en:
    // - Intensidad emocional
    // - Urgencia
    // - Novedad
    // - Relevancia para objetivos

    const emotionalIntensity = Math.max(...Object.values(emotions).filter((v): v is number => typeof v === 'number'));
    const importance =
      emotionalIntensity * 0.4 +
      appraisal.urgency * 0.3 +
      appraisal.relevanceToGoals * 0.2 +
      appraisal.novelty * 0.1;

    return Math.max(0.1, Math.min(1, importance));
  }

  /**
   * Max tokens basado en verbosity
   */
  private getMaxTokens(verbosity: "brief" | "moderate" | "expressive"): number {
    switch (verbosity) {
      case "brief":
        return 150;
      case "moderate":
        return 300;
      case "expressive":
        return 500;
    }
  }
}
