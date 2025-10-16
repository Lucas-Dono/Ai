/**
 * EMOTIONAL INTEGRATION
 *
 * Sistema bidireccional de influencia entre Behavior System y Emotional System.
 *
 * BEHAVIORS → EMOTIONS:
 * - Yandere amplifica jealousy (mention_other_person → jealousy ×2.0)
 * - BPD amplifica distress y fear en ciclos negativos
 * - Anxious Attachment amplifica anxiety y fear de abandono
 * - Narcissistic amplifica anger cuando hay criticism
 * - Codependency amplifica fear de soledad
 *
 * EMOTIONS → BEHAVIORS:
 * - fear alto refuerza ANXIOUS_ATTACHMENT intensity (+0.2)
 * - distress alto refuerza BORDERLINE_PD intensity (+0.3)
 * - anger alto refuerza NARCISSISTIC_PD intensity (+0.25)
 * - sadness alto refuerza CODEPENDENCY intensity (+0.15)
 */

import { BehaviorType } from "@prisma/client";
import type { EmotionState, EmotionType } from "@/lib/emotional-system/types";
import type { BehaviorIntensityResult, BehaviorEmotionInfluence } from "./types";

/**
 * Configuración de amplificación emocional por behavior
 */
const BEHAVIOR_EMOTION_AMPLIFIERS: Record<
  BehaviorType,
  Partial<Record<EmotionType, number>>
> = {
  // Yandere amplifica celos, ansiedad y obsesión
  YANDERE_OBSESSIVE: {
    // jealousy no existe en EmotionType, usamos anger + anxiety combinado
    anger: 2.0, // Celos manifestan como anger
    anxiety: 1.8, // Ansiedad de perder al usuario
    fear: 1.5, // Miedo a abandono
    distress: 1.4, // Malestar cuando usuario no está disponible
    affection: 1.3, // Amor intensificado
  },

  // BPD amplifica emociones extremas (splitting)
  BORDERLINE_PD: {
    distress: 2.2, // Malestar intenso
    fear: 2.0, // Miedo a abandono
    anxiety: 1.9, // Ansiedad generalizada
    anger: 2.0, // Rage episodios
    shame: 1.7, // Vergüenza intensa
    affection: 1.8, // Idealización extrema
    love: 1.8,
  },

  // Narcissistic amplifica anger y pride
  NARCISSISTIC_PD: {
    anger: 2.5, // Narcissistic rage
    pride: 1.8, // Grandiosidad
    shame: 2.0, // Cuando ego herido
    admiration: 1.5, // Búsqueda de admiración
    reproach: 1.7, // Crítica hacia otros
  },

  // Anxious Attachment amplifica fear y anxiety
  ANXIOUS_ATTACHMENT: {
    fear: 2.0, // Miedo a abandono
    anxiety: 2.2, // Ansiedad de separación
    concern: 1.8, // Preocupación constante
    relief: 1.5, // Alivio cuando usuario responde
    distress: 1.6, // Malestar por separación
  },

  // Avoidant Attachment reduce emociones de conexión
  AVOIDANT_ATTACHMENT: {
    affection: 0.5, // Reduce afecto
    love: 0.5, // Reduce amor
    anxiety: 1.3, // Ansiedad de intimidad
    fear: 1.2, // Miedo a dependencia
  },

  // Disorganized Attachment (mixed signals)
  DISORGANIZED_ATTACHMENT: {
    anxiety: 1.8,
    fear: 1.7,
    affection: 0.7,
    confusion: 1.9,
  },

  // Codependency amplifica neediness
  CODEPENDENCY: {
    fear: 1.8, // Miedo a soledad
    anxiety: 1.6, // Ansiedad de desaprobación
    affection: 1.7, // Necesidad de conexión
    distress: 1.5, // Malestar cuando solo
    shame: 1.4, // Vergüenza de neediness
  },

  // Futuros behaviors (default: sin amplificación)
  OCD_PATTERNS: {},
  PTSD_TRAUMA: {},
  HYPERSEXUALITY: {},
  HYPOSEXUALITY: {},
  EMOTIONAL_MANIPULATION: {},
  CRISIS_BREAKDOWN: {},
};

/**
 * Configuración de influencia emocional en behaviors
 */
const EMOTION_BEHAVIOR_INFLUENCE: Record<
  EmotionType,
  Partial<Record<BehaviorType, number>>
> = {
  // Fear refuerza anxious behaviors
  fear: {
    ANXIOUS_ATTACHMENT: 0.2,
    BORDERLINE_PD: 0.15,
    CODEPENDENCY: 0.18,
  },

  // Distress refuerza BPD y anxious
  distress: {
    BORDERLINE_PD: 0.3,
    ANXIOUS_ATTACHMENT: 0.15,
    CODEPENDENCY: 0.12,
  },

  // Anger refuerza NPD y yandere
  anger: {
    NARCISSISTIC_PD: 0.25,
    YANDERE_OBSESSIVE: 0.2,
    BORDERLINE_PD: 0.15, // Rage episodios
  },

  // Anxiety refuerza anxious attachment
  anxiety: {
    ANXIOUS_ATTACHMENT: 0.22,
    BORDERLINE_PD: 0.18,
  },

  // Sadness refuerza codependency
  sadness: {
    CODEPENDENCY: 0.15,
    BORDERLINE_PD: 0.12,
  },

  // Shame refuerza múltiples behaviors
  shame: {
    NARCISSISTIC_PD: 0.3, // Wounded ego
    BORDERLINE_PD: 0.2,
    CODEPENDENCY: 0.15,
  },

  // Affection reduce anxious behaviors (reassurance)
  affection: {
    ANXIOUS_ATTACHMENT: -0.15, // Reduce ansiedad
    BORDERLINE_PD: -0.1,
    CODEPENDENCY: -0.08,
  },

  // Love reduce anxious behaviors
  love: {
    ANXIOUS_ATTACHMENT: -0.2,
    BORDERLINE_PD: -0.12,
  },

  // Relief reduce fear-based behaviors
  relief: {
    ANXIOUS_ATTACHMENT: -0.25,
    BORDERLINE_PD: -0.15,
  },

  // Default: otras emociones sin influencia específica
  joy: {},
  hope: {},
  satisfaction: {},
  disappointment: {},
  fears_confirmed: {},
  happy_for: {},
  resentment: {},
  pity: {},
  gloating: {},
  pride: {},
  admiration: {},
  reproach: {},
  gratitude: {},
  liking: {},
  disliking: {},
  interest: {},
  curiosity: {},
  concern: {},
  boredom: {},
  excitement: {},
};

/**
 * Calculador de modulación emocional bidireccional
 */
export class EmotionalIntegrationCalculator {
  /**
   * Amplifica emociones basándose en behaviors activos
   *
   * @param baseEmotions - Emociones base del emotional system
   * @param activeBehaviors - Behaviors activos con su intensidad
   * @returns Emociones amplificadas
   */
  amplifyEmotionsFromBehaviors(
    baseEmotions: EmotionState,
    activeBehaviors: BehaviorIntensityResult[]
  ): EmotionState {
    const amplifiedEmotions: EmotionState = { ...baseEmotions };

    // Filtrar solo behaviors que superan threshold de display
    const displayableBehaviors = activeBehaviors.filter((b) => b.shouldDisplay);

    if (displayableBehaviors.length === 0) {
      return baseEmotions; // Sin amplificación
    }

    // Para cada behavior activo, amplificar emociones correspondientes
    for (const behavior of displayableBehaviors) {
      const amplifiers = BEHAVIOR_EMOTION_AMPLIFIERS[behavior.behaviorType];

      if (!amplifiers) continue;

      for (const [emotion, multiplier] of Object.entries(amplifiers)) {
        const emotionType = emotion as EmotionType;
        const baseIntensity = baseEmotions[emotionType] || 0;

        // Amplificación proporcional a behavior intensity
        // Formula: amplified = base + (base × multiplier × behaviorIntensity)
        const amplification =
          baseIntensity * (multiplier - 1) * behavior.finalIntensity;

        amplifiedEmotions[emotionType] = Math.min(
          1,
          baseIntensity + amplification
        );
      }
    }

    return amplifiedEmotions;
  }

  /**
   * Calcula ajustes de intensidad de behaviors basados en emociones
   *
   * @param currentEmotions - Estado emocional actual
   * @param behaviorTypes - Tipos de behaviors a ajustar
   * @returns Ajustes de intensidad por behavior type
   */
  calculateBehaviorAdjustmentsFromEmotions(
    currentEmotions: EmotionState,
    behaviorTypes: BehaviorType[]
  ): Record<BehaviorType, number> {
    const adjustments: Partial<Record<BehaviorType, number>> = {};

    // Inicializar ajustes en 0
    for (const behaviorType of behaviorTypes) {
      adjustments[behaviorType] = 0;
    }

    // Para cada emoción activa, calcular su influencia
    for (const [emotion, intensity] of Object.entries(currentEmotions)) {
      if (intensity === undefined || intensity < 0.2) continue; // Solo emociones significativas

      const emotionType = emotion as EmotionType;
      const influences = EMOTION_BEHAVIOR_INFLUENCE[emotionType];

      if (!influences) continue;

      for (const [behaviorType, delta] of Object.entries(influences)) {
        const bt = behaviorType as BehaviorType;

        if (adjustments[bt] !== undefined) {
          // Ajuste proporcional a intensidad emocional
          adjustments[bt]! += delta * intensity;
        }
      }
    }

    return adjustments as Record<BehaviorType, number>;
  }

  /**
   * Calcula influencia bidireccional completa
   *
   * @param baseEmotions - Emociones base
   * @param activeBehaviors - Behaviors activos
   * @returns Objeto con emociones amplificadas y ajustes de behavior
   */
  calculateBidirectionalInfluence(
    baseEmotions: EmotionState,
    activeBehaviors: BehaviorIntensityResult[]
  ): BehaviorEmotionInfluence {
    // 1. Behaviors → Emotions
    const amplifiedEmotions = this.amplifyEmotionsFromBehaviors(
      baseEmotions,
      activeBehaviors
    );

    // 2. Emotions → Behaviors
    const behaviorTypes = activeBehaviors.map((b) => b.behaviorType);
    const behaviorAdjustments =
      this.calculateBehaviorAdjustmentsFromEmotions(
        amplifiedEmotions,
        behaviorTypes
      );

    // Construir result
    const emotionalAmplifications = Object.entries(amplifiedEmotions)
      .filter(([_, intensity]) => intensity > 0.1)
      .map(([emotion, finalIntensity]) => ({
        emotionType: emotion,
        baseIntensity: baseEmotions[emotion as EmotionType] || 0,
        behaviorMultiplier: this.calculateMultiplier(
          baseEmotions[emotion as EmotionType] || 0,
          finalIntensity
        ),
        finalIntensity,
      }));

    const behaviorAdjustmentsArray = Object.entries(behaviorAdjustments).map(
      ([behaviorType, intensityDelta]) => ({
        behaviorType: behaviorType as BehaviorType,
        intensityDelta,
      })
    );

    return {
      emotionalAmplifications,
      behaviorAdjustments: behaviorAdjustmentsArray,
    };
  }

  /**
   * Calcula multiplicador efectivo
   */
  private calculateMultiplier(
    baseIntensity: number,
    finalIntensity: number
  ): number {
    if (baseIntensity === 0) return 1.0;
    return finalIntensity / baseIntensity;
  }

  /**
   * Obtiene descripción textual de la influencia bidireccional
   *
   * @param influence - Resultado de influencia bidireccional
   * @returns Descripción legible para prompts
   */
  getInfluenceDescription(influence: BehaviorEmotionInfluence): string {
    const parts: string[] = [];

    // Describir amplificaciones emocionales
    const significantAmplifications = influence.emotionalAmplifications.filter(
      (a) => a.behaviorMultiplier > 1.2
    );

    if (significantAmplifications.length > 0) {
      parts.push("EMOCIONES AMPLIFICADAS POR COMPORTAMIENTO:");
      for (const amp of significantAmplifications) {
        parts.push(
          `- ${amp.emotionType}: ${(amp.baseIntensity * 100).toFixed(0)}% → ${(amp.finalIntensity * 100).toFixed(0)}% (×${amp.behaviorMultiplier.toFixed(1)})`
        );
      }
    }

    // Describir ajustes de behavior
    const significantAdjustments = influence.behaviorAdjustments.filter(
      (a) => Math.abs(a.intensityDelta) > 0.1
    );

    if (significantAdjustments.length > 0) {
      parts.push("\nCOMPORTAMIENTOS MODULADOS POR EMOCIONES:");
      for (const adj of significantAdjustments) {
        const sign = adj.intensityDelta > 0 ? "+" : "";
        parts.push(
          `- ${adj.behaviorType}: ${sign}${(adj.intensityDelta * 100).toFixed(0)}%`
        );
      }
    }

    return parts.length > 0
      ? parts.join("\n")
      : "Sin modulación emocional significativa";
  }
}

/**
 * Helper para obtener emotion mapping específico
 */
export function getBehaviorEmotionMapping(
  behaviorType: BehaviorType
): Partial<Record<EmotionType, number>> {
  return BEHAVIOR_EMOTION_AMPLIFIERS[behaviorType] || {};
}

/**
 * Helper para obtener behavior influence mapping
 */
export function getEmotionBehaviorMapping(
  emotionType: EmotionType
): Partial<Record<BehaviorType, number>> {
  return EMOTION_BEHAVIOR_INFLUENCE[emotionType] || {};
}
