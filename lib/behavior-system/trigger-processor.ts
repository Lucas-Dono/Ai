/**
 * TRIGGER PROCESSOR - BEHAVIOR PROGRESSION SYSTEM
 *
 * Pipeline de procesamiento de triggers detectados.
 * Actualiza BehaviorProfiles, calcula impacto en intensidad, loguea en DB.
 *
 * FLUJO:
 * 1. Recibir triggers detectados
 * 2. Calcular impacto por behavior type
 * 3. Actualizar baseIntensity en BehaviorProfile
 * 4. Crear BehaviorTriggerLog entries
 * 5. Incrementar interactionsSincePhaseStart
 *
 * @module trigger-processor
 */

import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { BehaviorType } from "@prisma/client";
import type { TriggerDetectionResult, BehaviorProfile } from "./types";

/**
 * PROCESAR TRIGGERS DETECTADOS
 *
 * Función principal que procesa todos los triggers y actualiza los BehaviorProfiles.
 *
 * @param triggers - Array de triggers detectados por TriggerDetector
 * @param behaviorProfiles - Profiles activos del agente
 * @param messageId - ID del mensaje que generó los triggers
 * @param agentId - ID del agente
 */
export async function processTriggers(
  triggers: TriggerDetectionResult[],
  behaviorProfiles: BehaviorProfile[],
  messageId: string,
  agentId: string
): Promise<void> {
  if (triggers.length === 0) return;

  try {
    // 1. Loguear todos los triggers en DB
    await logTriggers(triggers, messageId);

    // 2. Procesar cada behavior profile
    for (const profile of behaviorProfiles) {
      // Calcular impacto total para este behavior
      const impact = calculateTriggerImpact(triggers, profile.behaviorType);

      if (impact === 0) continue; // No hay triggers relevantes

      // Calcular nueva intensidad
      const newIntensity = calculateNewIntensity(
        profile.baseIntensity,
        impact,
        profile.escalationRate,
        profile.deEscalationRate
      );

      // Actualizar profile en DB
      await prisma.behaviorProfile.update({
        where: { id: profile.id },
        data: {
          baseIntensity: newIntensity,
          interactionsSincePhaseStart: {
            increment: 1, // Cada mensaje cuenta como interacción
          },
          updatedAt: new Date(),
        },
      });

      console.log(
        `[TriggerProcessor] Updated ${profile.behaviorType}: ${profile.baseIntensity.toFixed(3)} → ${newIntensity.toFixed(3)} (impact: ${impact >= 0 ? "+" : ""}${impact.toFixed(3)})`
      );
    }

    // 3. Actualizar progression state global
    await updateProgressionState(agentId, triggers);
  } catch (error) {
    console.error("[TriggerProcessor] Error processing triggers:", error);
    throw error;
  }
}

/**
 * CALCULAR IMPACTO DE TRIGGERS EN INTENSIDAD
 *
 * Suma los weights de todos los triggers que afectan a un behavior type específico.
 * Triggers positivos (reassurance) reducen intensidad (peso negativo).
 *
 * @param triggers - Triggers detectados
 * @param behaviorType - Tipo de behavior a evaluar
 * @returns Impacto total (puede ser negativo)
 */
export function calculateTriggerImpact(
  triggers: TriggerDetectionResult[],
  behaviorType: BehaviorType
): number {
  let totalImpact = 0;

  for (const trigger of triggers) {
    // Verificar si este trigger afecta al behavior type
    if (trigger.behaviorTypes.includes(behaviorType)) {
      // Aplicar weight × confidence
      const impact = trigger.weight * trigger.confidence;
      totalImpact += impact;
    }
  }

  return totalImpact;
}

/**
 * CALCULAR NUEVA INTENSIDAD
 *
 * Aplica el impacto de triggers a la intensidad base usando escalation/de-escalation rates.
 *
 * Formula:
 * - Si impact > 0: newIntensity = baseIntensity + (impact × escalationRate)
 * - Si impact < 0: newIntensity = baseIntensity + (impact × deEscalationRate)
 *
 * @param baseIntensity - Intensidad actual (0-1)
 * @param impact - Impacto calculado (puede ser negativo)
 * @param escalationRate - Tasa de escalación (típicamente 0.1)
 * @param deEscalationRate - Tasa de de-escalación (típicamente 0.05)
 * @returns Nueva intensidad clamped entre 0-1
 */
export function calculateNewIntensity(
  baseIntensity: number,
  impact: number,
  escalationRate: number,
  deEscalationRate: number
): number {
  let newIntensity = baseIntensity;

  if (impact > 0) {
    // Escalación (triggers negativos)
    newIntensity += impact * escalationRate;
  } else if (impact < 0) {
    // De-escalación (triggers positivos como reassurance)
    newIntensity += impact * deEscalationRate; // impact ya es negativo
  }

  // Clamp entre 0-1
  return Math.min(1.0, Math.max(0.0, newIntensity));
}

/**
 * LOGUEAR TRIGGERS EN DATABASE
 *
 * Crea entries en BehaviorTriggerLog para analytics y debugging.
 *
 * @param triggers - Triggers detectados
 * @param messageId - ID del mensaje que generó los triggers
 */
export async function logTriggers(
  triggers: TriggerDetectionResult[],
  messageId: string
): Promise<void> {
  if (triggers.length === 0) return;

  try {
    // Crear un log entry por cada behavior type afectado por cada trigger
    const logEntries = triggers.flatMap((trigger) =>
      trigger.behaviorTypes.map((behaviorType) => ({
        id: nanoid(),
        updatedAt: new Date(),
        messageId: messageId,
        behaviorType: behaviorType,
        triggerType: trigger.triggerType,
        weight: trigger.weight * trigger.confidence, // Weight ajustado por confidence
        detectedText: trigger.detectedIn.substring(0, 500), // Limitar a 500 chars
      }))
    );

    // Bulk create
    await prisma.behaviorTriggerLog.createMany({
      data: logEntries,
      skipDuplicates: true,
    });

    console.log(`[TriggerProcessor] Logged ${logEntries.length} trigger entries`);
  } catch (error) {
    console.error("[TriggerProcessor] Error logging triggers:", error);
    // No throw - logging no debe bloquear el flujo principal
  }
}

/**
 * ACTUALIZAR PROGRESSION STATE GLOBAL
 *
 * Actualiza el estado de progresión global del agente con contadores de interacciones.
 *
 * @param agentId - ID del agente
 * @param triggers - Triggers detectados (para clasificar como positiva/negativa)
 */
async function updateProgressionState(
  agentId: string,
  triggers: TriggerDetectionResult[]
): Promise<void> {
  try {
    // Clasificar interacción como positiva/negativa/neutral
    const hasNegativeTrigger = triggers.some((t) => t.weight > 0);
    const hasPositiveTrigger = triggers.some((t) => t.weight < 0);

    const updateData: any = {
      totalInteractions: { increment: 1 },
      lastCalculatedAt: new Date(),
    };

    if (hasPositiveTrigger && !hasNegativeTrigger) {
      updateData.positiveInteractions = { increment: 1 };
    } else if (hasNegativeTrigger && !hasPositiveTrigger) {
      updateData.negativeInteractions = { increment: 1 };
    }

    // Upsert (crear si no existe, actualizar si existe)
    await prisma.behaviorProgressionState.upsert({
      where: { agentId: agentId },
      create: {
        id: nanoid(),
        updatedAt: new Date(),
        agentId: agentId,
        totalInteractions: 1,
        positiveInteractions: hasPositiveTrigger && !hasNegativeTrigger ? 1 : 0,
        negativeInteractions: hasNegativeTrigger && !hasPositiveTrigger ? 1 : 0,
        currentIntensities: {},
        lastCalculatedAt: new Date(),
      },
      update: updateData,
    });
  } catch (error) {
    console.error("[TriggerProcessor] Error updating progression state:", error);
    // No throw - no bloquear flujo principal
  }
}

/**
 * OBTENER TRIGGERS RECIENTES
 *
 * Utility function para obtener triggers recientes de un agente (para analytics).
 *
 * @param agentId - ID del agente
 * @param limit - Número máximo de triggers a retornar
 * @returns Array de trigger logs
 */
export async function getRecentTriggers(agentId: string, limit: number = 50) {
  try {
    const triggers = await prisma.behaviorTriggerLog.findMany({
      where: {
        Message: {
          agentId: agentId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        Message: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    return triggers;
  } catch (error) {
    console.error("[TriggerProcessor] Error fetching recent triggers:", error);
    return [];
  }
}

/**
 * OBTENER CONTEO DE TRIGGERS POR TIPO
 *
 * Analytics: Conteo de triggers detectados agrupados por tipo.
 *
 * @param agentId - ID del agente
 * @param since - Fecha desde la cual contar (opcional)
 * @returns Object con conteos por trigger type
 */
export async function getTriggerCountsByType(
  agentId: string,
  since?: Date
): Promise<Record<string, number>> {
  try {
    const whereClause: any = {
      message: {
        agentId: agentId,
      },
    };

    if (since) {
      whereClause.createdAt = {
        gte: since,
      };
    }

    const triggers = await prisma.behaviorTriggerLog.findMany({
      where: whereClause,
      select: {
        triggerType: true,
      },
    });

    // Agrupar por tipo
    const counts: Record<string, number> = {};
    for (const trigger of triggers) {
      counts[trigger.triggerType] = (counts[trigger.triggerType] || 0) + 1;
    }

    return counts;
  } catch (error) {
    console.error("[TriggerProcessor] Error fetching trigger counts:", error);
    return {};
  }
}

/**
 * APLICAR DECAY TEMPORAL
 *
 * Reduce gradualmente la intensidad de behaviors si no hay triggers recientes.
 * Se debe llamar periódicamente (ej: cada mensaje o cada 24 horas).
 *
 * @param profile - BehaviorProfile a evaluar
 * @param hoursSinceLastTrigger - Horas desde el último trigger relevante
 * @returns Nueva intensidad con decay aplicado
 */
export function applyDecay(
  profile: BehaviorProfile,
  hoursSinceLastTrigger: number
): number {
  // Solo aplicar decay después de 24 horas sin triggers
  if (hoursSinceLastTrigger < 24) {
    return profile.baseIntensity;
  }

  // Decay factor: Max 50% de reducción en 1 semana (168 horas)
  const decayFactor = Math.min(hoursSinceLastTrigger / 168, 0.5);

  // Aplicar decay usando deEscalationRate
  const decayAmount = decayFactor * profile.deEscalationRate;
  const newIntensity = profile.baseIntensity * (1 - decayAmount);

  // Clamp entre 0-1
  return Math.min(1.0, Math.max(0.0, newIntensity));
}

/**
 * BATCH PROCESS TRIGGERS
 *
 * Procesar múltiples mensajes a la vez (útil para migraciones o reprocesamiento).
 *
 * @param agentId - ID del agente
 * @param messageIds - IDs de mensajes a procesar
 */
export async function batchProcessTriggers(
  agentId: string,
  messageIds: string[]
): Promise<void> {
  console.log(
    `[TriggerProcessor] Batch processing ${messageIds.length} messages for agent ${agentId}`
  );

  // TODO: Implementar cuando sea necesario para migraciones
  // Por ahora, solo placeholder
}
