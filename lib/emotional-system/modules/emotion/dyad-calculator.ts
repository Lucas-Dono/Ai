/**
 * DYAD CALCULATOR
 *
 * Calcula las 20 emociones secundarias (dyads) de Plutchik
 * basándose en el estado de emociones primarias.
 *
 * Basado en investigación de Robert Plutchik sobre
 * combinaciones emocionales y psicología afectiva.
 */

import {
  PrimaryEmotion,
  PlutchikEmotionState,
  SecondaryEmotion,
} from "@/lib/emotions/plutchik";

export interface DyadResult {
  name: SecondaryEmotion;
  label: string;
  intensity: number; // 0-1
  components: [PrimaryEmotion, number, PrimaryEmotion, number]; // [emotion1, intensity1, emotion2, intensity2]
  type: "primary" | "secondary" | "tertiary";
}

/**
 * Configuración de dyads con sus componentes
 */
interface DyadDefinition {
  name: SecondaryEmotion;
  label: string;
  components: [PrimaryEmotion, PrimaryEmotion];
  type: "primary" | "secondary" | "tertiary";
  description: string;
}

const DYAD_DEFINITIONS: DyadDefinition[] = [
  // PRIMARY DYADS (adyacentes en la rueda)
  {
    name: "love",
    label: "Amor",
    components: ["joy", "trust"],
    type: "primary",
    description: "Alegría + Confianza = Amor/Afecto profundo",
  },
  {
    name: "submission",
    label: "Sumisión",
    components: ["trust", "fear"],
    type: "primary",
    description: "Confianza + Miedo = Respeto/Obediencia",
  },
  {
    name: "alarm",
    label: "Alarma",
    components: ["fear", "surprise"],
    type: "primary",
    description: "Miedo + Sorpresa = Sobresalto/Alarma",
  },
  {
    name: "disappointment",
    label: "Decepción",
    components: ["surprise", "sadness"],
    type: "primary",
    description: "Sorpresa + Tristeza = Decepción/Expectativas rotas",
  },
  {
    name: "remorse",
    label: "Remordimiento",
    components: ["sadness", "disgust"],
    type: "primary",
    description: "Tristeza + Disgusto = Remordimiento/Autodesprecio",
  },
  {
    name: "contempt",
    label: "Desprecio",
    components: ["disgust", "anger"],
    type: "primary",
    description: "Disgusto + Enojo = Desprecio/Desdén",
  },
  {
    name: "aggression",
    label: "Agresividad",
    components: ["anger", "anticipation"],
    type: "primary",
    description: "Enojo + Anticipación = Agresión dirigida",
  },
  {
    name: "optimism",
    label: "Optimismo",
    components: ["anticipation", "joy"],
    type: "primary",
    description: "Anticipación + Alegría = Optimismo/Esperanza",
  },

  // SECONDARY DYADS (separadas por una emoción)
  {
    name: "guilt",
    label: "Culpa",
    components: ["joy", "fear"],
    type: "secondary",
    description: "Alegría + Miedo = Culpa (placer con ansiedad)",
  },
  {
    name: "curiosity",
    label: "Curiosidad",
    components: ["trust", "surprise"],
    type: "secondary",
    description: "Confianza + Sorpresa = Curiosidad (apertura al descubrimiento)",
  },
  {
    name: "despair",
    label: "Desesperación",
    components: ["fear", "sadness"],
    type: "secondary",
    description: "Miedo + Tristeza = Desesperación (hopelessness)",
  },
  {
    name: "envy",
    label: "Envidia",
    components: ["surprise", "disgust"],
    type: "secondary",
    description: "Sorpresa + Disgusto = Envidia (descubrimiento desagradable)",
  },
  {
    name: "cynicism",
    label: "Cinismo",
    components: ["sadness", "anger"],
    type: "secondary",
    description: "Tristeza + Enojo = Cinismo/Resentimiento",
  },
  {
    name: "pride",
    label: "Orgullo",
    components: ["disgust", "anticipation"],
    type: "secondary",
    description: "Disgusto hacia otros + Anticipación = Orgullo/Arrogancia",
  },
  {
    name: "hope",
    label: "Esperanza",
    components: ["anger", "joy"],
    type: "secondary",
    description: "Enojo + Alegría = Esperanza/Determinación positiva",
  },
  {
    name: "anxiety",
    label: "Ansiedad",
    components: ["anticipation", "trust"],
    type: "secondary",
    description: "Anticipación + Confianza = Ansiedad anticipatoria",
  },

  // TERTIARY DYADS (opuestas)
  {
    name: "ambivalence",
    label: "Ambivalencia",
    components: ["joy", "sadness"],
    type: "tertiary",
    description: "Alegría + Tristeza = Ambivalencia (conflicto emocional)",
  },
  {
    name: "frozenness",
    label: "Paralización",
    components: ["trust", "disgust"],
    type: "tertiary",
    description: "Confianza + Disgusto = Paralización decisional",
  },
  {
    name: "outrage",
    label: "Indignación",
    components: ["fear", "anger"],
    type: "tertiary",
    description: "Miedo + Enojo = Indignación (miedo que se vuelve ira)",
  },
  {
    name: "confusion",
    label: "Confusión",
    components: ["surprise", "anticipation"],
    type: "tertiary",
    description: "Sorpresa + Anticipación = Confusión (expectativas contradictorias)",
  },
];

export class DyadCalculator {
  /**
   * Threshold mínimo para considerar una emoción primaria
   */
  private readonly MIN_INTENSITY = 0.25;

  /**
   * Threshold mínimo para que un dyad sea significativo
   */
  private readonly MIN_DYAD_INTENSITY = 0.3;

  /**
   * Calcula todos los dyads activos desde un estado emocional
   */
  calculateDyads(emotionState: PlutchikEmotionState): DyadResult[] {
    const dyads: DyadResult[] = [];

    for (const dyadDef of DYAD_DEFINITIONS) {
      const [emotion1, emotion2] = dyadDef.components;
      const intensity1 = emotionState[emotion1];
      const intensity2 = emotionState[emotion2];

      // Solo calcular dyad si ambas emociones están activas
      if (intensity1 >= this.MIN_INTENSITY && intensity2 >= this.MIN_INTENSITY) {
        // Calcular intensidad del dyad
        // Fórmula: promedio geométrico (más conservador que aritmético)
        // Esto asegura que ambas emociones deben estar presentes
        const dyadIntensity = Math.sqrt(intensity1 * intensity2);

        // Aplicar peso según tipo de dyad
        let weightedIntensity = dyadIntensity;

        if (dyadDef.type === "primary") {
          // Primary dyads son más fáciles de formar (emociones adyacentes)
          weightedIntensity *= 1.2;
        } else if (dyadDef.type === "secondary") {
          // Secondary dyads requieren más intensidad
          weightedIntensity *= 1.0;
        } else if (dyadDef.type === "tertiary") {
          // Tertiary dyads (opuestas) son más difíciles de formar
          // Representan conflicto interno genuino
          weightedIntensity *= 0.8;
        }

        // Clamp entre 0 y 1
        weightedIntensity = Math.min(1.0, weightedIntensity);

        // Solo incluir si supera threshold
        if (weightedIntensity >= this.MIN_DYAD_INTENSITY) {
          dyads.push({
            name: dyadDef.name,
            label: dyadDef.label,
            intensity: weightedIntensity,
            components: [emotion1, intensity1, emotion2, intensity2],
            type: dyadDef.type,
          });
        }
      }
    }

    // Ordenar por intensidad (mayor primero)
    return dyads.sort((a, b) => b.intensity - a.intensity);
  }

  /**
   * Calcula dyads y retorna solo los top N
   */
  getTopDyads(emotionState: PlutchikEmotionState, limit: number = 3): DyadResult[] {
    const allDyads = this.calculateDyads(emotionState);
    return allDyads.slice(0, limit);
  }

  /**
   * Obtiene el dyad dominante (más intenso)
   */
  getDominantDyad(emotionState: PlutchikEmotionState): DyadResult | null {
    const dyads = this.calculateDyads(emotionState);
    return dyads.length > 0 ? dyads[0] : null;
  }

  /**
   * Verifica si un dyad específico está activo
   */
  isDyadActive(
    emotionState: PlutchikEmotionState,
    dyadName: SecondaryEmotion
  ): boolean {
    const dyads = this.calculateDyads(emotionState);
    return dyads.some((dyad) => dyad.name === dyadName);
  }

  /**
   * Obtiene intensidad de un dyad específico
   */
  getDyadIntensity(
    emotionState: PlutchikEmotionState,
    dyadName: SecondaryEmotion
  ): number {
    const dyads = this.calculateDyads(emotionState);
    const dyad = dyads.find((d) => d.name === dyadName);
    return dyad ? dyad.intensity : 0;
  }

  /**
   * Genera descripción textual de dyads activos
   */
  describeDyads(emotionState: PlutchikEmotionState): string {
    const dyads = this.getTopDyads(emotionState, 3);

    if (dyads.length === 0) {
      return "Sin emociones secundarias significativas";
    }

    return dyads
      .map((dyad) => {
        const intensityPercent = (dyad.intensity * 100).toFixed(0);
        return `${dyad.label} (${intensityPercent}% - ${dyad.components[0]}+${dyad.components[2]})`;
      })
      .join(", ");
  }

  /**
   * Detecta conflictos emocionales (tertiary dyads activos)
   */
  detectEmotionalConflicts(emotionState: PlutchikEmotionState): DyadResult[] {
    const allDyads = this.calculateDyads(emotionState);
    return allDyads.filter((dyad) => dyad.type === "tertiary");
  }

  /**
   * Calcula "estabilidad emocional" basada en presencia de dyads terciarios
   */
  calculateEmotionalStability(emotionState: PlutchikEmotionState): number {
    const conflicts = this.detectEmotionalConflicts(emotionState);

    if (conflicts.length === 0) {
      return 1.0; // Máxima estabilidad
    }

    // Reducir estabilidad según intensidad de conflictos
    const totalConflict = conflicts.reduce((sum, dyad) => sum + dyad.intensity, 0);
    const stability = Math.max(0, 1.0 - totalConflict);

    return stability;
  }

  /**
   * Genera recomendación clínica basada en dyads
   * (útil para simulación de trastornos)
   */
  getClinicalInsights(emotionState: PlutchikEmotionState): {
    stability: number;
    dominantDyad: DyadResult | null;
    conflicts: DyadResult[];
    recommendation: string;
  } {
    const stability = this.calculateEmotionalStability(emotionState);
    const dominantDyad = this.getDominantDyad(emotionState);
    const conflicts = this.detectEmotionalConflicts(emotionState);

    let recommendation = "";

    if (stability < 0.4) {
      recommendation = "Alto conflicto emocional - considerar intervención terapéutica";
    } else if (stability < 0.7) {
      recommendation = "Conflicto emocional moderado - monitorear";
    } else {
      recommendation = "Estado emocional relativamente estable";
    }

    // Agregar insight del dyad dominante
    if (dominantDyad) {
      if (dominantDyad.name === "despair" && dominantDyad.intensity > 0.7) {
        recommendation += " | Desesperación alta - riesgo de depresión clínica";
      } else if (dominantDyad.name === "anxiety" && dominantDyad.intensity > 0.7) {
        recommendation += " | Ansiedad alta - posible trastorno de ansiedad";
      } else if (dominantDyad.name === "contempt" && dominantDyad.intensity > 0.7) {
        recommendation += " | Desprecio alto - potencial conflicto interpersonal";
      }
    }

    return {
      stability,
      dominantDyad,
      conflicts,
      recommendation,
    };
  }
}

/**
 * Singleton instance
 */
export const dyadCalculator = new DyadCalculator();
