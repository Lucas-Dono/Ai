/**
 * EMOTION DECAY & MOOD INERTIA
 *
 * Implementa cambios emocionales naturales:
 * - Decay: Emociones decaen gradualmente hacia baseline
 * - Inertia: Resistencia al cambio emocional abrupto
 * - Mood persistence: El mood cambia más lentamente que emociones específicas
 */

import { EmotionState, PADMood, EmotionDynamics, BigFiveTraits } from "../../types";

export class EmotionDecaySystem {
  /**
   * Aplica decay a emociones actuales
   * Las emociones decaen hacia sus valores baseline
   */
  applyDecay(
    currentEmotions: EmotionState,
    baselineEmotions: EmotionState,
    decayRate: number,
    deltaTimeMinutes: number = 1
  ): EmotionState {
    const decayedEmotions: EmotionState = {};

    // Aplicar decay a cada emoción
    for (const [emotion, intensity] of Object.entries(currentEmotions)) {
      const baseline = baselineEmotions[emotion as keyof EmotionState] || 0;

      // Decay exponencial hacia baseline
      const decayFactor = Math.exp(-decayRate * deltaTimeMinutes);
      const newIntensity = intensity * decayFactor + baseline * (1 - decayFactor);

      // Solo mantener si la intensidad es significativa
      if (newIntensity > 0.05) {
        decayedEmotions[emotion as keyof EmotionState] = newIntensity;
      }
    }

    // Asegurar que al menos las emociones baseline estén presentes
    for (const [emotion, baseline] of Object.entries(baselineEmotions)) {
      if (baseline > 0.05 && !decayedEmotions[emotion as keyof EmotionState]) {
        decayedEmotions[emotion as keyof EmotionState] = baseline;
      }
    }

    return decayedEmotions;
  }

  /**
   * Mezcla emociones nuevas con emociones actuales usando inertia
   * Inertia alta = cambio más lento
   */
  applyInertia(
    currentEmotions: EmotionState,
    newEmotions: EmotionState,
    inertia: number
  ): EmotionState {
    const blendedEmotions: EmotionState = {};

    // Obtener todas las emociones únicas
    const allEmotions = new Set([
      ...Object.keys(currentEmotions),
      ...Object.keys(newEmotions),
    ]);

    for (const emotion of allEmotions) {
      const current = currentEmotions[emotion as keyof EmotionState] || 0;
      const target = newEmotions[emotion as keyof EmotionState] || 0;

      // Blending con inertia
      // inertia = 0 → cambio instantáneo
      // inertia = 1 → no cambia
      const blended = current * inertia + target * (1 - inertia);

      if (blended > 0.05) {
        blendedEmotions[emotion as keyof EmotionState] = blended;
      }
    }

    return blendedEmotions;
  }

  /**
   * Actualiza mood con inertia (mood cambia más lento que emociones)
   */
  updateMoodWithInertia(
    currentMood: PADMood,
    targetMoodShift: Partial<PADMood>,
    moodInertia: number = 0.7 // Mood tiene más inertia que emociones
  ): PADMood {
    const newMood: PADMood = {
      valence: this.smoothTransition(
        currentMood.valence,
        currentMood.valence + (targetMoodShift.valence || 0),
        moodInertia
      ),
      arousal: this.smoothTransition(
        currentMood.arousal,
        currentMood.arousal + (targetMoodShift.arousal || 0),
        moodInertia
      ),
      dominance: this.smoothTransition(
        currentMood.dominance,
        currentMood.dominance + (targetMoodShift.dominance || 0),
        moodInertia
      ),
    };

    // Clamp values
    newMood.valence = Math.max(-1, Math.min(1, newMood.valence));
    newMood.arousal = Math.max(0, Math.min(1, newMood.arousal));
    newMood.dominance = Math.max(0, Math.min(1, newMood.dominance));

    return newMood;
  }

  /**
   * Transición suave entre valores
   */
  private smoothTransition(current: number, target: number, inertia: number): number {
    return current * inertia + target * (1 - inertia);
  }

  /**
   * Calcula decay rate dinámico basado en personalidad
   * Neuroticismo alto → emociones duran más
   */
  calculateDecayRate(baseDecayRate: number, personality: BigFiveTraits): number {
    // Neuroticismo alto = emociones persisten más (decay más lento)
    const neuroticismFactor = 1 - (personality.neuroticism / 100) * 0.5;

    // Extraversión alta = cambios emocionales más rápidos
    const extraversionFactor = 1 + (personality.extraversion / 100) * 0.3;

    return baseDecayRate * neuroticismFactor * extraversionFactor;
  }

  /**
   * Calcula inertia dinámica basada en personalidad
   * Neuroticismo alto + evento negativo = más resistencia al cambio positivo
   */
  calculateDynamicInertia(
    baseInertia: number,
    personality: BigFiveTraits,
    currentMoodValence: number,
    targetMoodValence: number
  ): number {
    let dynamicInertia = baseInertia;

    // Si está en mood negativo y neuroticismo alto, más difícil salir
    if (currentMoodValence < -0.3 && personality.neuroticism > 60) {
      const neuroticismBoost = (personality.neuroticism / 100) * 0.3;
      dynamicInertia += neuroticismBoost;
    }

    // Si está muy alegre y algo malo pasa, caída más abrupta (menor inertia)
    if (currentMoodValence > 0.5 && targetMoodValence < -0.5) {
      dynamicInertia *= 0.7; // Menos resistencia a cambio negativo
    }

    return Math.max(0, Math.min(0.95, dynamicInertia));
  }

  /**
   * Genera fluctuaciones espontáneas de mood (human-like)
   * Ocasionalmente, sin razón aparente, el mood fluctúa ligeramente
   */
  generateSpontaneousFluctuation(
    currentMood: PADMood,
    fluctuationProbability: number = 0.05
  ): PADMood {
    if (Math.random() > fluctuationProbability) {
      return currentMood; // No fluctuación
    }

    // Pequeña fluctuación aleatoria
    const fluctuationMagnitude = 0.1;

    return {
      valence: Math.max(
        -1,
        Math.min(
          1,
          currentMood.valence + (Math.random() - 0.5) * fluctuationMagnitude
        )
      ),
      arousal: Math.max(
        0,
        Math.min(
          1,
          currentMood.arousal + (Math.random() - 0.5) * fluctuationMagnitude
        )
      ),
      dominance: currentMood.dominance, // Dominance más estable
    };
  }

  /**
   * Actualiza sistema emocional completo
   */
  updateEmotionalSystem(params: {
    currentEmotions: EmotionState;
    newEmotions: EmotionState;
    baselineEmotions: EmotionState;
    currentMood: PADMood;
    targetMoodShift: Partial<PADMood>;
    dynamics: EmotionDynamics;
    personality: BigFiveTraits;
    deltaTimeMinutes?: number;
  }): {
    emotions: EmotionState;
    mood: PADMood;
  } {
    const {
      currentEmotions,
      newEmotions,
      baselineEmotions,
      currentMood,
      targetMoodShift,
      dynamics,
      personality,
      deltaTimeMinutes = 0, // 0 = update inmediato sin decay temporal
    } = params;

    // 1. Aplicar decay si ha pasado tiempo
    let workingEmotions = currentEmotions;
    if (deltaTimeMinutes > 0) {
      workingEmotions = this.applyDecay(
        currentEmotions,
        baselineEmotions,
        dynamics.decayRate,
        deltaTimeMinutes
      );
    }

    // 2. Mezclar con nuevas emociones usando inertia
    const dynamicInertia = this.calculateDynamicInertia(
      dynamics.inertia,
      personality,
      currentMood.valence,
      currentMood.valence + (targetMoodShift.valence || 0)
    );

    const blendedEmotions = this.applyInertia(
      workingEmotions,
      newEmotions,
      dynamicInertia
    );

    // 3. Actualizar mood con inertia
    const updatedMood = this.updateMoodWithInertia(
      currentMood,
      targetMoodShift,
      0.7 // Mood tiene alta inertia
    );

    // 4. Ocasionalmente agregar fluctuación espontánea
    const finalMood = this.generateSpontaneousFluctuation(updatedMood, 0.05);

    return {
      emotions: blendedEmotions,
      mood: finalMood,
    };
  }
}
