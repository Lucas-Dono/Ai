/**
 * BEHAVIOR INTENSITY CALCULATOR
 *
 * Cálculos avanzados de intensidad basados en múltiples factores:
 * - Base intensity (configurado)
 * - Phase multiplier (cada fase amplifica)
 * - Trigger amplification (triggers recientes)
 * - Emotional modulation (estado emocional actual)
 * - Decay factor (decaimiento temporal)
 * - Inertia factor (resistencia al cambio)
 */

import { BehaviorType, BehaviorProfile } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { BehaviorIntensityResult, BehaviorIntensityParams } from "./types";

/**
 * Calculador de intensidad de comportamientos
 */
export class IntensityCalculator {
  /**
   * Calcula intensidad final de un comportamiento
   *
   * @param profile - Perfil de comportamiento
   * @param agentId - ID del agente
   * @param emotionalModulation - Modulación emocional (0-1), default 1.0
   * @returns Resultado con intensidad y componentes
   */
  async calculateIntensity(
    profile: BehaviorProfile,
    agentId: string,
    emotionalModulation: number = 1.0
  ): Promise<BehaviorIntensityResult> {
    // Componentes del cálculo
    const baseIntensity = profile.baseIntensity;
    const phaseMultiplier = this.calculatePhaseMultiplier(
      profile.behaviorType,
      profile.currentPhase
    );
    const triggerAmplification = await this.calculateTriggerAmplification(
      agentId,
      profile.behaviorType,
      profile.phaseStartedAt
    );
    const decayFactor = this.calculateDecay(
      profile.phaseStartedAt,
      profile.volatility
    );
    const inertiaFactor = this.calculateInertia(
      profile.phaseStartedAt,
      profile.interactionsSincePhaseStart
    );

    // Fórmula final:
    // intensity = (base * phaseMultiplier + triggerAmplification) * emotionalModulation * decayFactor * inertiaFactor
    const intensity =
      (baseIntensity * phaseMultiplier + triggerAmplification) *
      emotionalModulation *
      decayFactor *
      inertiaFactor;

    // Clamp entre 0 y 1
    const finalIntensity = Math.max(0, Math.min(1, intensity));

    const components: BehaviorIntensityParams = {
      baseIntensity,
      phaseMultiplier,
      triggerAmplification,
      emotionalModulation,
      decayFactor,
      inertiaFactor,
    };

    return {
      behaviorType: profile.behaviorType,
      finalIntensity,
      components,
      shouldDisplay: finalIntensity >= profile.thresholdForDisplay,
    };
  }

  /**
   * Calcula multiplicador de fase
   *
   * Cada fase incrementa la intensidad base.
   *
   * @param behaviorType - Tipo de comportamiento
   * @param phase - Fase actual
   * @returns Multiplicador (ej: 1.0, 1.2, 1.5, 2.0)
   */
  private calculatePhaseMultiplier(
    behaviorType: BehaviorType,
    phase: number
  ): number {
    if (behaviorType === "YANDERE_OBSESSIVE") {
      // Yandere escala exponencialmente
      const multipliers = [1.0, 1.15, 1.35, 1.6, 2.0, 2.5, 3.0, 4.0];
      return multipliers[phase - 1] || 1.0;
    }

    if (behaviorType === "ANXIOUS_ATTACHMENT") {
      // Anxious attachment escala linealmente
      const multipliers = [1.0, 1.2, 1.5, 1.8, 2.0];
      return multipliers[phase - 1] || 1.0;
    }

    if (behaviorType === "BORDERLINE_PD") {
      // BPD tiene intensidad alta en todas las fases
      return 1.5 + phase * 0.2;
    }

    if (behaviorType === "NARCISSISTIC_PD") {
      // NPD varía según la fase (idealización vs devaluación)
      const multipliers = [1.2, 1.8, 2.0, 1.5]; // idealization, devaluation, discard, hoovering
      return multipliers[phase - 1] || 1.0;
    }

    // Default: escalado lineal moderado
    return 1.0 + (phase - 1) * 0.15;
  }

  /**
   * Calcula amplificación por triggers recientes
   *
   * Triggers en los últimos 7 días amplifican la intensidad.
   *
   * @param agentId - ID del agente
   * @param behaviorType - Tipo de comportamiento
   * @param since - Fecha desde la cual buscar triggers
   * @returns Amplificación (0 a 0.5)
   */
  private async calculateTriggerAmplification(
    agentId: string,
    behaviorType: BehaviorType,
    since: Date
  ): Promise<number> {
    // Buscar triggers recientes (últimos 7 días)
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 7);

    const triggers = await prisma.behaviorTriggerLog.findMany({
      where: {
        Message: {
          agentId: agentId,
        },
        behaviorType: behaviorType,
        createdAt: {
          gte: recentDate,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20, // Máximo 20 triggers recientes
    });

    if (triggers.length === 0) return 0;

    // Sumar pesos con decaimiento temporal
    let totalAmplification = 0;
    const now = new Date().getTime();

    for (const trigger of triggers) {
      const ageInHours =
        (now - trigger.createdAt.getTime()) / (1000 * 60 * 60);

      // Decay exponencial: más reciente = más impacto
      const timeFactor = Math.exp(-ageInHours / 48); // Half-life de 48h

      totalAmplification += trigger.weight * timeFactor;
    }

    // Normalizar (máximo 0.5)
    return Math.min(0.5, totalAmplification / 5);
  }

  /**
   * Calcula factor de decaimiento temporal
   *
   * Con el tiempo, la intensidad decae si no hay nuevos triggers.
   *
   * @param phaseStartedAt - Fecha de inicio de fase
   * @param volatility - Volatilidad (0-1), mayor = decae más rápido
   * @returns Factor de decaimiento (0.5 a 1.0)
   */
  private calculateDecay(phaseStartedAt: Date, volatility: number): number {
    const now = new Date().getTime();
    const phaseAgeInHours =
      (now - phaseStartedAt.getTime()) / (1000 * 60 * 60);

    // Volatilidad alta = decaimiento más rápido
    const decayRate = 0.01 + volatility * 0.02;

    // Decay exponencial
    const decay = Math.exp(-decayRate * phaseAgeInHours);

    // Mínimo 0.5 (nunca decae completamente)
    return Math.max(0.5, decay);
  }

  /**
   * Calcula factor de inercia
   *
   * Más interacciones = comportamiento más "arraigado" = mayor inercia.
   *
   * @param phaseStartedAt - Fecha de inicio de fase
   * @param interactionCount - Número de interacciones en esta fase
   * @returns Factor de inercia (0.8 a 1.2)
   */
  private calculateInertia(
    phaseStartedAt: Date,
    interactionCount: number
  ): number {
    // Más interacciones = más resistencia a cambio = mayor intensidad
    // Curva logarítmica para evitar explosión
    const inertia = 0.8 + Math.log10(Math.max(1, interactionCount)) * 0.2;

    // Clamp entre 0.8 y 1.2
    return Math.max(0.8, Math.min(1.2, inertia));
  }

  /**
   * Calcula intensidades para todos los comportamientos de un agente
   *
   * @param agentId - ID del agente
   * @param emotionalModulation - Modulación emocional opcional
   * @returns Array de resultados de intensidad
   */
  async calculateAllIntensities(
    agentId: string,
    emotionalModulation: number = 1.0
  ): Promise<BehaviorIntensityResult[]> {
    const profiles = await prisma.behaviorProfile.findMany({
      where: { agentId },
    });

    const results: BehaviorIntensityResult[] = [];

    for (const profile of profiles) {
      const result = await this.calculateIntensity(
        profile,
        agentId,
        emotionalModulation
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Obtiene el comportamiento dominante (mayor intensidad)
   *
   * @param agentId - ID del agente
   * @returns Resultado de intensidad del comportamiento dominante o null
   */
  async getDominantBehavior(
    agentId: string
  ): Promise<BehaviorIntensityResult | null> {
    const results = await this.calculateAllIntensities(agentId);

    if (results.length === 0) return null;

    // Filtrar solo los que superan threshold
    const visible = results.filter((r) => r.shouldDisplay);

    if (visible.length === 0) return null;

    // Retornar el de mayor intensidad
    return visible.reduce((max, current) =>
      current.finalIntensity > max.finalIntensity ? current : max
    );
  }

  /**
   * Actualiza el cache de intensidades en BehaviorProgressionState
   *
   * @param agentId - ID del agente
   */
  async updateIntensityCache(agentId: string): Promise<void> {
    const results = await this.calculateAllIntensities(agentId);

    // Convertir a objeto para JSON
    const intensities: Record<string, number> = {};
    for (const result of results) {
      intensities[result.behaviorType] = result.finalIntensity;
    }

    // Actualizar o crear cache
    await prisma.behaviorProgressionState.upsert({
      where: { agentId },
      update: {
        currentIntensities: intensities,
        lastCalculatedAt: new Date(),
      },
      create: {
        id: nanoid(),
        updatedAt: new Date(),
        agentId,
        currentIntensities: intensities,
        lastCalculatedAt: new Date(),
      },
    });
  }
}
