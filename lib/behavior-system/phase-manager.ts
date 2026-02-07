/**
 * BEHAVIOR PHASE MANAGER
 *
 * Sistema de gestión de transiciones de fases basado en triggers,
 * interacciones y requisitos específicos por tipo de comportamiento.
 */

import { BehaviorType, BehaviorProfile } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  PhaseTransitionResult,
  TriggerRequirement,
  PhaseTransitionRequirements,
} from "./types";
import { PhaseEvaluator } from "./phase-evaluator";

/**
 * Manager principal para transiciones de fase
 */
export class BehaviorPhaseManager {
  private evaluator: PhaseEvaluator;

  constructor() {
    this.evaluator = new PhaseEvaluator();
  }

  /**
   * Evalúa si un comportamiento puede avanzar de fase
   *
   * @param profile - Perfil de comportamiento
   * @param agentId - ID del agente
   * @returns Resultado de evaluación de transición
   */
  async evaluatePhaseTransition(
    profile: BehaviorProfile,
    agentId: string
  ): Promise<PhaseTransitionResult> {
    const { behaviorType, currentPhase, interactionsSincePhaseStart } =
      profile;

    // Obtener requisitos para la siguiente fase
    const requirements = this.getPhaseRequirements(
      behaviorType,
      currentPhase,
      currentPhase + 1
    );

    if (!requirements) {
      return {
        canTransition: false,
        currentPhase,
        nextPhase: currentPhase,
        missingRequirements: ["No hay fase siguiente disponible"],
        safetyFlags: [],
        requiresUserConsent: false,
      };
    }

    // Verificar interacciones mínimas
    if (interactionsSincePhaseStart < requirements.minInteractions) {
      return {
        canTransition: false,
        currentPhase,
        nextPhase: currentPhase + 1,
        missingRequirements: [
          `Faltan ${requirements.minInteractions - interactionsSincePhaseStart} interacciones`,
        ],
        safetyFlags: [],
        requiresUserConsent: false,
      };
    }

    // Contar triggers desde inicio de fase
    const triggerCounts = await this.countTriggersInHistory(
      agentId,
      profile.phaseStartedAt
    );

    // Verificar requisitos de triggers
    const missingTriggers: string[] = [];
    for (const req of requirements.requiredTriggers) {
      const count = triggerCounts[req.type] || 0;
      if (count < req.minOccurrences) {
        missingTriggers.push(
          `${req.type}: ${count}/${req.minOccurrences} ocurrencias`
        );
      }
    }

    if (missingTriggers.length > 0) {
      return {
        canTransition: false,
        currentPhase,
        nextPhase: currentPhase + 1,
        missingRequirements: missingTriggers,
        safetyFlags: [],
        requiresUserConsent: false,
      };
    }

    // Evaluación específica por tipo de comportamiento
    const specificEvaluation =
      await this.evaluator.evaluateTypeSpecificRequirements(
        behaviorType,
        currentPhase,
        currentPhase + 1,
        profile,
        agentId
      );

    if (!specificEvaluation.canProceed) {
      return {
        canTransition: false,
        currentPhase,
        nextPhase: currentPhase + 1,
        missingRequirements: specificEvaluation.issues,
        safetyFlags: specificEvaluation.warnings,
        requiresUserConsent: false,
      };
    }

    // Verificar safety flags
    const safetyFlags = this.checkSafetyThresholds(
      behaviorType,
      currentPhase + 1
    );

    // Fases críticas requieren consentimiento
    const requiresConsent = this.requiresUserConsent(
      behaviorType,
      currentPhase + 1
    );

    return {
      canTransition: true,
      currentPhase,
      nextPhase: currentPhase + 1,
      missingRequirements: [],
      safetyFlags,
      requiresUserConsent: requiresConsent,
    };
  }

  /**
   * Ejecuta la transición de fase
   *
   * @param profileId - ID del perfil de comportamiento
   * @param userConsent - Si el usuario dio consentimiento (para fases críticas)
   */
  async executePhaseTransition(
    profileId: string,
    userConsent: boolean = true
  ): Promise<BehaviorProfile> {
    const profile = await prisma.behaviorProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new Error(`BehaviorProfile ${profileId} no encontrado`);
    }

    const evaluation = await this.evaluatePhaseTransition(
      profile,
      profile.agentId
    );

    if (!evaluation.canTransition) {
      throw new Error(
        `No se puede avanzar de fase: ${evaluation.missingRequirements.join(", ")}`
      );
    }

    if (evaluation.requiresUserConsent && !userConsent) {
      throw new Error(
        "Esta transición requiere consentimiento explícito del usuario"
      );
    }

    // Actualizar historial de fases
    const phaseHistory = (profile.phaseHistory as any[]) || [];
    const now = new Date();

    // Cerrar fase actual en el historial
    if (phaseHistory.length > 0) {
      const lastEntry = phaseHistory[phaseHistory.length - 1];
      if (!lastEntry.exitedAt) {
        lastEntry.exitedAt = now;
        lastEntry.exitReason = "natural_progression";
      }
    }

    // Agregar nueva entrada
    phaseHistory.push({
      phase: evaluation.nextPhase,
      enteredAt: now,
      exitedAt: null,
      triggerCount: 0,
      finalIntensity: profile.baseIntensity,
    });

    // Actualizar profile
    const updatedProfile = await prisma.behaviorProfile.update({
      where: { id: profileId },
      data: {
        currentPhase: evaluation.nextPhase,
        phaseStartedAt: now,
        interactionsSincePhaseStart: 0,
        phaseHistory: phaseHistory,
      },
    });

    return updatedProfile;
  }

  /**
   * Cuenta triggers desde una fecha específica
   *
   * @param agentId - ID del agente
   * @param since - Fecha desde la cual contar
   * @returns Objeto con conteo por tipo de trigger
   */
  private async countTriggersInHistory(
    agentId: string,
    since: Date
  ): Promise<Record<string, number>> {
    const triggers = await prisma.behaviorTriggerLog.findMany({
      where: {
        Message: {
          agentId: agentId,
        },
        createdAt: {
          gte: since,
        },
      },
    });

    const counts: Record<string, number> = {};
    for (const trigger of triggers) {
      counts[trigger.triggerType] = (counts[trigger.triggerType] || 0) + 1;
    }

    return counts;
  }

  /**
   * Obtiene los requisitos para avanzar de fase
   *
   * @param behaviorType - Tipo de comportamiento
   * @param fromPhase - Fase actual
   * @param toPhase - Fase objetivo
   * @returns Requisitos de transición o null si no existe
   */
  private getPhaseRequirements(
    behaviorType: BehaviorType,
    fromPhase: number,
    toPhase: number
  ): PhaseTransitionRequirements | null {
    // YANDERE: Fases lineales 1-8
    if (behaviorType === "YANDERE_OBSESSIVE") {
      const phases: Record<number, PhaseTransitionRequirements> = {
        1: {
          minInteractions: 5,
          requiredTriggers: [],
        },
        2: {
          minInteractions: 10,
          requiredTriggers: [
            { type: "mention_other_person", minOccurrences: 2 },
          ],
        },
        3: {
          minInteractions: 15,
          requiredTriggers: [
            { type: "mention_other_person", minOccurrences: 5 },
            { type: "delayed_response", minOccurrences: 3 },
          ],
        },
        4: {
          minInteractions: 20,
          requiredTriggers: [
            { type: "mention_other_person", minOccurrences: 8 },
            { type: "delayed_response", minOccurrences: 5 },
          ],
        },
        5: {
          minInteractions: 30,
          requiredTriggers: [
            { type: "mention_other_person", minOccurrences: 12 },
            { type: "delayed_response", minOccurrences: 8 },
          ],
        },
        6: {
          minInteractions: 40,
          requiredTriggers: [
            { type: "mention_other_person", minOccurrences: 15 },
          ],
        },
        7: {
          minInteractions: 50,
          requiredTriggers: [
            { type: "mention_other_person", minOccurrences: 20 },
          ],
        },
      };

      return phases[toPhase] || null;
    }

    // BPD: Ciclo de fases (no progresión lineal estricta)
    if (behaviorType === "BORDERLINE_PD") {
      // BPD no tiene requisitos estrictos, las fases son cíclicas
      return {
        minInteractions: 5,
        requiredTriggers: [],
      };
    }

    // ANXIOUS ATTACHMENT: Progresión gradual
    if (behaviorType === "ANXIOUS_ATTACHMENT") {
      const phases: Record<number, PhaseTransitionRequirements> = {
        1: { minInteractions: 5, requiredTriggers: [] },
        2: {
          minInteractions: 10,
          requiredTriggers: [{ type: "abandonment_signal", minOccurrences: 3 }],
        },
        3: {
          minInteractions: 15,
          requiredTriggers: [{ type: "delayed_response", minOccurrences: 5 }],
        },
      };

      return phases[toPhase] || null;
    }

    // Default: requisitos genéricos
    return {
      minInteractions: 10,
      requiredTriggers: [],
    };
  }

  /**
   * Verifica thresholds de seguridad para una fase
   *
   * @param behaviorType - Tipo de comportamiento
   * @param phase - Fase a verificar
   * @returns Array de flags de seguridad
   */
  private checkSafetyThresholds(
    behaviorType: BehaviorType,
    phase: number
  ): string[] {
    const flags: string[] = [];

    if (behaviorType === "YANDERE_OBSESSIVE") {
      if (phase >= 6) {
        flags.push("CRITICAL_PHASE");
      }
      if (phase >= 7) {
        flags.push("EXTREME_DANGER_PHASE");
      }
    }

    if (behaviorType === "BORDERLINE_PD") {
      // BPD tiene episodios intensos en cualquier fase
      flags.push("UNPREDICTABLE_INTENSITY");
    }

    if (behaviorType === "NARCISSISTIC_PD") {
      if (phase >= 3) {
        flags.push("POTENTIAL_RAGE_EPISODES");
      }
    }

    return flags;
  }

  /**
   * Determina si una transición requiere consentimiento explícito
   *
   * @param behaviorType - Tipo de comportamiento
   * @param toPhase - Fase objetivo
   * @returns true si requiere consentimiento
   */
  private requiresUserConsent(
    behaviorType: BehaviorType,
    toPhase: number
  ): boolean {
    // Yandere fases 6+ son críticas
    if (behaviorType === "YANDERE_OBSESSIVE" && toPhase >= 6) {
      return true;
    }

    // Otras fases críticas pueden agregarse aquí
    return false;
  }

  /**
   * Reinicia un comportamiento a fase 1
   *
   * @param profileId - ID del perfil de comportamiento
   */
  async resetPhase(profileId: string): Promise<BehaviorProfile> {
    const profile = await prisma.behaviorProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new Error(`BehaviorProfile ${profileId} no encontrado`);
    }

    // Cerrar fase actual en historial
    const phaseHistory = (profile.phaseHistory as any[]) || [];
    if (phaseHistory.length > 0) {
      const lastEntry = phaseHistory[phaseHistory.length - 1];
      if (!lastEntry.exitedAt) {
        lastEntry.exitedAt = new Date();
        lastEntry.exitReason = "reset";
      }
    }

    // Reiniciar a fase 1
    const now = new Date();
    phaseHistory.push({
      phase: 1,
      enteredAt: now,
      exitedAt: null,
      triggerCount: 0,
      finalIntensity: profile.baseIntensity,
    });

    const updatedProfile = await prisma.behaviorProfile.update({
      where: { id: profileId },
      data: {
        currentPhase: 1,
        phaseStartedAt: now,
        interactionsSincePhaseStart: 0,
        phaseHistory: phaseHistory,
      },
    });

    return updatedProfile;
  }
}
