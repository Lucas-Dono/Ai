/**
 * BEHAVIORAL CUES MAPPER
 *
 * Traduce estado emocional y personalidad en cues de comportamiento:
 * - Tono de voz
 * - Verbosity (cuánto habla)
 * - Directness (qué tan directo es)
 * - Pacing (velocidad de habla)
 * - Physical cues (pausas, suspiros, etc.)
 */

import { BehavioralCues, EmotionState, PADMood, BigFiveTraits, ActionType } from "../../types";

export class BehavioralCuesMapper {
  /**
   * Genera behavioral cues desde estado emocional
   */
  generateCues(params: {
    emotions: EmotionState;
    mood: PADMood;
    personality: BigFiveTraits;
    actionType: ActionType;
  }): BehavioralCues {
    const { emotions, mood, personality, actionType } = params;

    const tone = this.mapEmotionsToTone(emotions, mood);
    const verbosity = this.mapArousalToVerbosity(mood.arousal, personality.extraversion);
    const directness = this.mapPersonalityToDirectness(personality, actionType);
    const pacing = this.mapMoodToPacing(mood);
    const physicalCues = this.generatePhysicalCues(emotions, mood);

    return {
      tone,
      verbosity,
      directness,
      pacing,
      physicalCues,
    };
  }

  /**
   * Mapea emociones → tono de voz
   */
  private mapEmotionsToTone(emotions: EmotionState, mood: PADMood): string {
    const tones: string[] = [];

    // Emociones positivas
    if (emotions.joy && emotions.joy > 0.5) tones.push("alegre");
    if (emotions.excitement && emotions.excitement > 0.5) tones.push("emocionada");
    if (emotions.affection && emotions.affection > 0.5) tones.push("cálida");
    if (emotions.interest && emotions.interest > 0.5) tones.push("curiosa");

    // Emociones negativas
    if (emotions.distress && emotions.distress > 0.5) tones.push("angustiada");
    if (emotions.concern && emotions.concern > 0.5) tones.push("preocupada");
    if (emotions.anxiety && emotions.anxiety > 0.5) tones.push("ansiosa");
    if (emotions.sadness && emotions.sadness > 0.5) tones.push("melancólica");
    if (emotions.anger && emotions.anger > 0.5) tones.push("frustrada");

    // Emociones complejas
    if (emotions.pity && emotions.pity > 0.5) tones.push("comprensiva");
    if (emotions.reproach && emotions.reproach > 0.5) tones.push("crítica");
    if (emotions.admiration && emotions.admiration > 0.5) tones.push("admirativa");

    // Si no hay emociones fuertes, usar mood
    if (tones.length === 0) {
      if (mood.valence > 0.3) tones.push("positiva");
      else if (mood.valence < -0.3) tones.push("pensativa");
      else tones.push("neutral");
    }

    // Tomar top 2 tonos
    return tones.slice(0, 2).join(", ");
  }

  /**
   * Mapea arousal → verbosity (cuánto habla)
   */
  private mapArousalToVerbosity(
    arousal: number,
    extraversion: number
  ): "brief" | "moderate" | "expressive" {
    // Arousal alto + extraversión alta = muy expresiva
    // Arousal bajo + introversión = breve

    const verbosityScore = arousal * 0.6 + (extraversion / 100) * 0.4;

    if (verbosityScore > 0.7) return "expressive";
    if (verbosityScore < 0.4) return "brief";
    return "moderate";
  }

  /**
   * Mapea personalidad → directness
   */
  private mapPersonalityToDirectness(
    personality: BigFiveTraits,
    actionType: ActionType
  ): "indirect" | "moderate" | "direct" {
    // Agreeableness bajo + conscientiousness alto = más directo
    // Agreeableness alto = más indirecto/gentil

    let directnessScore = 0.5;

    // Personalidad base
    directnessScore -= (personality.agreeableness / 100) * 0.3; // Menos agradable = más directo
    directnessScore += (personality.conscientiousness / 100) * 0.2; // Más responsable = más directo

    // Acción modifica
    if (actionType === "challenge" || actionType === "set_boundary") {
      directnessScore += 0.3; // Estas acciones requieren más directness
    } else if (actionType === "empathize" || actionType === "support") {
      directnessScore -= 0.2; // Estas acciones son más gentiles
    }

    if (directnessScore > 0.65) return "direct";
    if (directnessScore < 0.35) return "indirect";
    return "moderate";
  }

  /**
   * Mapea mood → pacing (velocidad de habla)
   */
  private mapMoodToPacing(mood: PADMood): "fast" | "normal" | "slow" {
    // Arousal alto = habla más rápido
    // Valence bajo + arousal bajo = habla más lento

    if (mood.arousal > 0.7) return "fast";
    if (mood.arousal < 0.3 && mood.valence < 0) return "slow";
    return "normal";
  }

  /**
   * Genera physical cues (pausas, suspiros, etc.)
   */
  private generatePhysicalCues(emotions: EmotionState, mood: PADMood): string | undefined {
    const cues: string[] = [];

    // Emociones específicas generan cues
    if (emotions.anxiety && emotions.anxiety > 0.6) {
      cues.push("(pausa breve)");
    }

    if (emotions.distress && emotions.distress > 0.7) {
      cues.push("(suspira)");
    }

    if (emotions.excitement && emotions.excitement > 0.7) {
      cues.push("(con energía)");
    }

    if (emotions.sadness && emotions.sadness > 0.6) {
      cues.push("(voz más suave)");
    }

    if (mood.valence < -0.5 && mood.arousal < 0.3) {
      cues.push("...");
    }

    // No usar physical cues si no son muy necesarios
    if (cues.length === 0) return undefined;

    return cues[0]; // Usar solo el más relevante
  }

  /**
   * Genera descripción completa para prompt
   */
  generateBehavioralDescription(cues: BehavioralCues): string {
    const parts: string[] = [];

    parts.push(`Tono: ${cues.tone}`);

    switch (cues.verbosity) {
      case "brief":
        parts.push("Respuestas: cortas y concisas (1-2 oraciones)");
        break;
      case "moderate":
        parts.push("Respuestas: moderadas (2-4 oraciones)");
        break;
      case "expressive":
        parts.push("Respuestas: expresivas y detalladas");
        break;
    }

    switch (cues.directness) {
      case "indirect":
        parts.push("Comunicación: indirecta, gentil, con tacto");
        break;
      case "moderate":
        parts.push("Comunicación: equilibrada entre directa y gentil");
        break;
      case "direct":
        parts.push("Comunicación: directa y clara");
        break;
    }

    switch (cues.pacing) {
      case "fast":
        parts.push("Ritmo: rápido, energético");
        break;
      case "normal":
        parts.push("Ritmo: natural");
        break;
      case "slow":
        parts.push("Ritmo: pausado, reflexivo");
        break;
    }

    if (cues.physicalCues) {
      parts.push(`Expresión física: ${cues.physicalCues}`);
    }

    return parts.join("\n");
  }
}
