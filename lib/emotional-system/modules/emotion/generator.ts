/**
 * EMOTION GENERATOR - FROM APPRAISAL TO EMOTIONS
 *
 * Genera emociones dinámicamente basadas en evaluación OCC
 * Implementa las 22 emociones del modelo OCC más emociones adicionales
 */

import {
  AppraisalScores,
  EmotionState,
  EmotionType,
  PADMood,
  BigFiveTraits,
} from "../../types";
import { getOpenRouterClient, RECOMMENDED_MODELS } from "../../llm/openrouter";

export interface EmotionGenerationResult {
  emotions: EmotionState;
  moodShift: Partial<PADMood>;
  primaryEmotion: EmotionType;
  intensity: number;
}

export class EmotionGenerator {
  private llmClient = getOpenRouterClient();

  /**
   * Genera emociones desde appraisal
   */
  async generateFromAppraisal(
    appraisal: AppraisalScores,
    previousEmotions: EmotionState,
    personality: BigFiveTraits
  ): Promise<EmotionGenerationResult> {
    console.log("[EmotionGenerator] Generating emotions from appraisal...");

    const prompt = this.buildEmotionPrompt(appraisal, previousEmotions, personality);

    try {
      const emotionData = await this.llmClient.generateJSON<EmotionGenerationResult>(
        this.getSystemPrompt(),
        prompt,
        {
          model: RECOMMENDED_MODELS.EMOTION,
          temperature: 0.4, // Moderado para variedad emocional
        }
      );

      console.log("[EmotionGenerator] Emotions generated:", emotionData);

      return this.validateAndNormalize(emotionData);
    } catch (error) {
      console.error("[EmotionGenerator] Error generating, using rule-based fallback:", error);
      return this.generateRuleBasedEmotions(appraisal, previousEmotions, personality);
    }
  }

  /**
   * System prompt para generador de emociones
   */
  private getSystemPrompt(): string {
    return `Eres un generador de emociones basado en el modelo OCC (Ortony, Clore, Collins).
Generas estados emocionales dinámicos basados en evaluaciones cognitivas (appraisal).

MODELO OCC - 22 EMOCIONES BASE:

EVENTOS (consecuencias):
- joy/distress: Eventos deseables/indeseables
- hope/fear: Perspectivas futuras positivas/negativas
- satisfaction/disappointment: Confirmación/disconfirmación de expectativas
- relief/fears_confirmed: Realización de prospectos
- happy_for/resentment: Bienestar de otros (deseable/indeseable)
- pity/gloating: Fortuna de otros (indeseable/deseable)

ACCIONES (agentes):
- pride/shame: Acciones propias elogiables/reprochables
- admiration/reproach: Acciones de otros elogiables/reprochables
- gratitude/anger: Acción elogiable + consecuencia deseable/indeseable

OBJETOS (aspectos):
- liking/disliking: Aspectos atractivos/repulsivos

ADICIONALES (realismo):
- interest/curiosity: Novedad alta
- affection/love: Relaciones positivas
- anxiety/concern: Urgencia + incertidumbre
- boredom/excitement: Arousal bajo/alto

REGLAS DE GENERACIÓN:
1. Las emociones emergen NATURALMENTE del appraisal
2. Múltiples emociones pueden coexistir (ej: joy + anxiety)
3. Personalidad MODULA intensidad (neuroticism alto = emociones más intensas)
4. Estado previo influencia (inertia emocional)
5. Responde SOLO con JSON válido`;
  }

  /**
   * Construye prompt para generar emociones
   */
  private buildEmotionPrompt(
    appraisal: AppraisalScores,
    previousEmotions: EmotionState,
    personality: BigFiveTraits
  ): string {
    return `APPRAISAL ACTUAL:
${JSON.stringify(appraisal, null, 2)}

EMOCIONES PREVIAS:
${JSON.stringify(previousEmotions, null, 2)}

PERSONALIDAD:
- Neuroticismo: ${personality.neuroticism}/100 (alto = emociones más intensas/duraderas)
- Extraversión: ${personality.extraversion}/100 (alto = emociones sociales más intensas)
- Amabilidad: ${personality.agreeableness}/100 (alto = más empatía/preocupación por otros)
- Apertura: ${personality.openness}/100 (alto = más curiosidad/interés)
- Responsabilidad: ${personality.conscientiousness}/100 (alto = más satisfacción/decepción)

GENERA el estado emocional resultante. Responde SOLO con JSON:
{
  "emotions": {
    "emotion_name": <0-1: intensidad>,
    // Incluye TODAS las emociones relevantes (pueden ser múltiples)
  },
  "moodShift": {
    "valence": <-1 a 1: cambio en mood (negativo/positivo)>,
    "arousal": <0 a 1: cambio en arousal (calmado/activado)>,
    "dominance": <0 a 1: cambio en dominance (sumiso/dominante)>
  },
  "primaryEmotion": "<emoción dominante>",
  "intensity": <0-1: intensidad general de la respuesta emocional>
}

LÓGICA DE GENERACIÓN:

1. EVENTOS:
   - desirability alto (>0.5) → joy alta
   - desirability bajo (<-0.5) → distress alta
   - desirabilityForUser alto + desirability neutral → happy_for
   - desirabilityForUser bajo → concern/pity

2. ACCIONES:
   - praiseworthiness alto → admiration
   - praiseworthiness bajo → reproach
   - praiseworthiness alto + desirability alto → gratitude
   - praiseworthiness bajo + desirability bajo → anger

3. NOVEDAD:
   - novelty alto (>0.7) → interest/curiosity alto

4. URGENCIA:
   - urgency alto + desirability bajo → anxiety/concern
   - urgency alto + desirability alto → excitement

5. PERSONALIDAD MODULA:
   - Neuroticismo alto → amplifica emociones negativas (distress, anxiety)
   - Extraversión alto → amplifica emociones sociales (affection, excitement)
   - Amabilidad alto → amplifica empatía (concern, pity, happy_for)

6. INERTIA EMOCIONAL:
   - Emociones previas altas persisten (decaen gradualmente)
   - No cambiar drásticamente de muy negativo a muy positivo instantáneamente

Genera emociones REALISTAS y COHERENTES con el appraisal.`;
  }

  /**
   * Generación rule-based de emociones (fallback)
   */
  private generateRuleBasedEmotions(
    appraisal: AppraisalScores,
    previousEmotions: EmotionState,
    personality: BigFiveTraits
  ): EmotionGenerationResult {
    const emotions: EmotionState = {};

    // Factor de amplificación por neuroticismo
    const neuroticismAmp = 1 + (personality.neuroticism / 100) * 0.5;

    // EVENTOS - Desirability
    if (appraisal.desirability > 0.3) {
      emotions.joy = Math.min(1, appraisal.desirability * 1.2);
    } else if (appraisal.desirability < -0.3) {
      emotions.distress = Math.min(1, Math.abs(appraisal.desirability) * neuroticismAmp);
    }

    // Usuario en problema
    if (appraisal.desirabilityForUser < -0.5) {
      const empathyFactor = personality.agreeableness / 100;
      emotions.concern = Math.min(1, Math.abs(appraisal.desirabilityForUser) * empathyFactor);
      emotions.pity = Math.min(1, Math.abs(appraisal.desirabilityForUser) * empathyFactor * 0.7);
    }

    // Novedad → Interest/Curiosity
    if (appraisal.novelty > 0.5) {
      const opennessFactor = personality.openness / 100;
      emotions.interest = Math.min(1, appraisal.novelty * opennessFactor * 1.5);
      emotions.curiosity = Math.min(1, appraisal.novelty * opennessFactor);
    }

    // Urgencia + Problema → Anxiety
    if (appraisal.urgency > 0.6 && appraisal.desirability < 0) {
      emotions.anxiety = Math.min(1, appraisal.urgency * neuroticismAmp * 0.8);
    }

    // Valor violado → Reproach/Anger
    if (appraisal.valueAlignment < -0.5) {
      emotions.reproach = Math.min(1, Math.abs(appraisal.valueAlignment) * 0.9);
      if (appraisal.desirability < -0.5) {
        emotions.anger = Math.min(1, Math.abs(appraisal.valueAlignment) * 0.6);
      }
    }

    // Atractivo → Liking
    if (appraisal.appealingness > 0.5) {
      emotions.liking = appraisal.appealingness;
    }

    // Si no hay emociones fuertes, agregar baseline
    if (Object.keys(emotions).length === 0) {
      emotions.interest = 0.3;
    }

    // Determinar emoción primaria
    const primaryEmotion = this.determinePrimaryEmotion(emotions);

    // Calcular mood shift
    const moodShift = this.calculateMoodShift(appraisal, emotions);

    // Intensidad general
    const intensity = Math.max(...Object.values(emotions));

    return {
      emotions,
      moodShift,
      primaryEmotion,
      intensity,
    };
  }

  /**
   * Determina la emoción primaria (más intensa)
   */
  private determinePrimaryEmotion(emotions: EmotionState): EmotionType {
    let maxIntensity = 0;
    let primary: EmotionType = "interest";

    for (const [emotion, intensity] of Object.entries(emotions)) {
      if (intensity > maxIntensity) {
        maxIntensity = intensity;
        primary = emotion as EmotionType;
      }
    }

    return primary;
  }

  /**
   * Calcula cambio en PAD mood
   */
  private calculateMoodShift(
    appraisal: AppraisalScores,
    emotions: EmotionState
  ): Partial<PADMood> {
    // Valence: Basado en desirability
    const valence = appraisal.desirability * 0.5 + appraisal.appealingness * 0.3;

    // Arousal: Basado en urgency y novedad
    const arousal = appraisal.urgency * 0.6 + appraisal.novelty * 0.4;

    // Dominance: Basado en control de la situación
    const dominance = appraisal.desirability > 0 ? 0.6 : 0.3;

    return {
      valence,
      arousal,
      dominance,
    };
  }

  /**
   * Valida y normaliza resultado
   */
  private validateAndNormalize(result: Partial<EmotionGenerationResult>): EmotionGenerationResult {
    const emotions: EmotionState = {};

    // Normalizar emociones
    if (result.emotions) {
      for (const [emotion, intensity] of Object.entries(result.emotions)) {
        if (typeof intensity === "number") {
          emotions[emotion as EmotionType] = Math.max(0, Math.min(1, intensity));
        }
      }
    }

    // Si no hay emociones, agregar default
    if (Object.keys(emotions).length === 0) {
      emotions.interest = 0.3;
    }

    return {
      emotions,
      moodShift: result.moodShift || { valence: 0, arousal: 0, dominance: 0 },
      primaryEmotion: result.primaryEmotion || this.determinePrimaryEmotion(emotions),
      intensity: result.intensity || Math.max(...Object.values(emotions)),
    };
  }
}
