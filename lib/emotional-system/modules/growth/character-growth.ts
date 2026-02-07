/**
 * CHARACTER GROWTH SYSTEM
 *
 * Actualiza el crecimiento del personaje a lo largo del tiempo:
 * - Trust & Intimacy levels
 * - Personality drift (cambios sutiles en Big Five)
 * - Learned patterns sobre el usuario
 * - Consolidación de experiencias
 */

import {
  CharacterGrowth,
  AppraisalScores,
  EmotionState,
  PersonalityDrift,
  ConflictEvent,
} from "../../types";
import { prisma } from "@/lib/prisma";

export interface GrowthUpdateParams {
  agentId: string;
  appraisal: AppraisalScores;
  emotions: EmotionState;
  actionType: string;
  wasPositiveInteraction: boolean;
}

export class CharacterGrowthSystem {
  /**
   * Actualiza growth después de una conversación
   */
  async updateGrowth(params: GrowthUpdateParams): Promise<void> {
    console.log("[CharacterGrowth] Updating character growth...");

    try {
      const currentGrowth = await prisma.characterGrowth.findUnique({
        where: { agentId: params.agentId },
      });

      if (!currentGrowth) {
        console.error("[CharacterGrowth] No growth record found");
        return;
      }

      // 1. Actualizar trust level
      const newTrustLevel = this.calculateNewTrustLevel(
        currentGrowth.trustLevel,
        params.appraisal,
        params.wasPositiveInteraction
      );

      // 2. Actualizar intimacy level
      const newIntimacyLevel = this.calculateNewIntimacyLevel(
        currentGrowth.intimacyLevel,
        params.appraisal,
        params.actionType
      );

      // 3. Actualizar contadores
      const positiveCount = params.wasPositiveInteraction
        ? currentGrowth.positiveEventsCount + 1
        : currentGrowth.positiveEventsCount;

      const negativeCount = !params.wasPositiveInteraction
        ? currentGrowth.negativeEventsCount + 1
        : currentGrowth.negativeEventsCount;

      // 4. Detectar conflicto
      let conflictHistory = currentGrowth.conflictHistory as any[];
      if (params.appraisal.valueAlignment < -0.6) {
        const newConflict: ConflictEvent = {
          description: "Conflicto de valores detectado",
          severity: Math.abs(params.appraisal.valueAlignment),
          resolved: false,
          timestamp: new Date(),
        };
        conflictHistory = [...conflictHistory, newConflict];
      }

      // 5. Actualizar personality drift (solo cada N conversaciones)
      const shouldUpdateDrift = currentGrowth.conversationCount % 10 === 0;
      let personalityDrift = currentGrowth.personalityDrift;

      if (shouldUpdateDrift) {
        personalityDrift = await this.updatePersonalityDrift(
          params.agentId,
          currentGrowth.personalityDrift as any,
          params.appraisal,
          params.emotions
        );
      }

      // 6. Guardar cambios
      await prisma.characterGrowth.update({
        where: { agentId: params.agentId },
        data: {
          trustLevel: newTrustLevel,
          intimacyLevel: newIntimacyLevel,
          positiveEventsCount: positiveCount,
          negativeEventsCount: negativeCount,
          conflictHistory: conflictHistory as any,
          personalityDrift: personalityDrift as any,
          conversationCount: currentGrowth.conversationCount + 1,
          lastSignificantEvent: params.wasPositiveInteraction ? new Date() : currentGrowth.lastSignificantEvent,
          lastUpdated: new Date(),
        },
      });

      console.log(`[CharacterGrowth] Growth updated - Trust: ${newTrustLevel.toFixed(2)}, Intimacy: ${newIntimacyLevel.toFixed(2)}`);
    } catch (error) {
      console.error("[CharacterGrowth] Error updating growth:", error);
    }
  }

  /**
   * Calcula nuevo trust level
   */
  private calculateNewTrustLevel(
    currentTrust: number,
    appraisal: AppraisalScores,
    wasPositive: boolean
  ): number {
    let trustChange = 0;

    if (wasPositive) {
      // Interacciones positivas aumentan trust gradualmente
      trustChange = 0.02; // +2% por interacción positiva

      // Si el usuario fue vulnerable (compartió algo personal), más trust
      if (appraisal.desirabilityForUser < -0.5) {
        trustChange += 0.03; // Usuario vulnerable = más trust building
      }
    } else {
      // Interacciones negativas reducen trust
      trustChange = -0.05; // -5% por interacción negativa

      // Si hubo violación de valores, más impacto
      if (appraisal.valueAlignment < -0.6) {
        trustChange -= 0.05;
      }
    }

    const newTrust = currentTrust + trustChange;
    return Math.max(0, Math.min(1, newTrust)); // Clamp 0-1
  }

  /**
   * Calcula nuevo intimacy level
   */
  private calculateNewIntimacyLevel(
    currentIntimacy: number,
    appraisal: AppraisalScores,
    actionType: string
  ): number {
    let intimacyChange = 0;

    // Intimacy aumenta con vulnerabilidad compartida
    if (actionType === "be_vulnerable" || actionType === "share_experience") {
      intimacyChange = 0.03; // +3% por vulnerabilidad
    }

    // Usuario compartiendo algo muy personal
    if (appraisal.novelty > 0.7 && appraisal.desirabilityForUser < 0) {
      intimacyChange += 0.02; // Usuario se abre = más intimacy
    }

    // Conflictos pueden reducir intimacy temporalmente
    if (appraisal.valueAlignment < -0.5) {
      intimacyChange -= 0.02;
    }

    const newIntimacy = currentIntimacy + intimacyChange;
    return Math.max(0, Math.min(1, newIntimacy));
  }

  /**
   * Actualiza personality drift (cambios sutiles en Big Five)
   */
  private async updatePersonalityDrift(
    agentId: string,
    currentDrift: PersonalityDrift | null,
    appraisal: AppraisalScores,
    emotions: EmotionState
  ): Promise<PersonalityDrift> {
    // Obtener personalidad actual
    const personalityCore = await prisma.personalityCore.findUnique({
      where: { agentId },
    });

    if (!personalityCore) {
      return currentDrift || {};
    }

    const drift: PersonalityDrift = currentDrift || {};

    // Ejemplo: Si el usuario expone al personaje a mucha novedad, Openness puede aumentar ligeramente
    if (appraisal.novelty > 0.8) {
      if (!drift.openness) {
        drift.openness = {
          current: personalityCore.openness,
          initial: personalityCore.openness,
          influencedBy: [],
        };
      }

      // Aumentar openness muy sutilmente (máximo +5 puntos en toda la vida del personaje)
      const maxDrift = 5;
      const currentDriftAmount = drift.openness.current - drift.openness.initial;

      if (currentDriftAmount < maxDrift) {
        drift.openness.current += 0.1;
        drift.openness.influencedBy.push("Exposición a experiencias nuevas del usuario");

        // Actualizar en BD si el drift es significativo
        if (Math.abs(currentDriftAmount) > 1) {
          await prisma.personalityCore.update({
            where: { agentId },
            data: { openness: Math.round(drift.openness.current) },
          });
        }
      }
    }

    // Otros drifts se pueden agregar similarmente...
    // Ej: Neuroticism puede bajar con relación estable y segura
    // Ej: Agreeableness puede cambiar basado en conflictos/armonía

    return drift;
  }

  /**
   * Actualiza relationship stage basado en trust + intimacy
   */
  async updateRelationshipStage(agentId: string): Promise<void> {
    const growth = await prisma.characterGrowth.findUnique({
      where: { agentId },
    });

    if (!growth) return;

    const semanticMemory = await prisma.semanticMemory.findUnique({
      where: { agentId },
    });

    if (!semanticMemory) return;

    let newStage = semanticMemory.relationshipStage;

    // Determinar stage basado en trust + intimacy
    const combinedLevel = (growth.trustLevel + growth.intimacyLevel) / 2;

    if (combinedLevel < 0.3) {
      newStage = "first_meeting";
    } else if (combinedLevel < 0.5) {
      newStage = "acquaintance";
    } else if (combinedLevel < 0.7) {
      newStage = "friend";
    } else if (combinedLevel < 0.85) {
      newStage = "close_friend";
    } else {
      newStage = "intimate";
    }

    // Detectar relación tensa por conflictos
    const conflictHistory = (growth.conflictHistory as unknown) as ConflictEvent[];
    const unresolvedConflicts = conflictHistory.filter((c) => !c.resolved);

    if (unresolvedConflicts.length > 2) {
      newStage = "strained";
    }

    // Actualizar si cambió
    if (newStage !== semanticMemory.relationshipStage) {
      await prisma.semanticMemory.update({
        where: { agentId },
        data: { relationshipStage: newStage },
      });

      console.log(`[CharacterGrowth] Relationship stage updated: ${semanticMemory.relationshipStage} → ${newStage}`);
    }
  }
}
