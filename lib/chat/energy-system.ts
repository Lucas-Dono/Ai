import { prisma } from "@/lib/prisma";
import type { EnergyState, UserTier } from "./types";
import { TIER_LIMITS } from "./tier-limits";

/**
 * Sistema de Energía por Tier
 *
 * Maneja el cansancio del personaje según cuánto ha conversado.
 * - FREE: Se cansa rápido (incentivo a upgrade)
 * - PLUS: Se cansa moderado
 * - ULTRA: NUNCA se cansa (ilimitado)
 */

// Cache en memoria para evitar writes constantes a DB
const energyCache = new Map<string, EnergyState>();

/**
 * Obtiene o inicializa el estado de energía para un agente
 */
export async function getEnergyState(agentId: string, userId: string): Promise<EnergyState> {
  // Verificar cache
  const cached = energyCache.get(agentId);
  if (cached && Date.now() - cached.lastDecayAt.getTime() < 5 * 60 * 1000) {
    // Cache válido por 5 minutos
    return cached;
  }

  // Buscar en DB o crear nuevo
  let energyState = await prisma.agentEnergyState.findUnique({
    where: { agentId },
  });

  if (!energyState) {
    // Crear nuevo estado
    energyState = await prisma.agentEnergyState.create({
      data: {
        agentId,
        current: 100,
        max: 100,
        lastDecayAt: new Date(),
        conversationStartedAt: new Date(),
        messagesSinceReset: 0,
      },
    });
  }

  const state: EnergyState = {
    current: energyState.current,
    max: energyState.max,
    lastDecayAt: energyState.lastDecayAt,
    conversationStartedAt: energyState.conversationStartedAt,
    messagesSinceReset: energyState.messagesSinceReset,
  };

  // Cachear
  energyCache.set(agentId, state);

  return state;
}

/**
 * Consume energía después de un mensaje
 */
export async function consumeEnergy(
  agentId: string,
  userId: string,
  tier: UserTier
): Promise<EnergyState> {
  const limits = TIER_LIMITS[tier];

  // Ultra: Sin consumo de energía
  if (limits.hasUnlimitedEnergy) {
    return {
      current: 100,
      max: 100,
      lastDecayAt: new Date(),
      conversationStartedAt: new Date(),
      messagesSinceReset: 0,
    };
  }

  const state = await getEnergyState(agentId, userId);

  // Calcular decay
  const messagesSinceReset = state.messagesSinceReset + 1;
  const energyDrain = limits.energyDrainRate * 10; // Drena cada mensaje

  // Nueva energía (no puede bajar de 0)
  const newEnergy = Math.max(0, state.current - energyDrain);

  // Actualizar en DB
  const updated = await prisma.agentEnergyState.update({
    where: { agentId },
    data: {
      current: newEnergy,
      lastDecayAt: new Date(),
      messagesSinceReset,
    },
  });

  const newState: EnergyState = {
    current: updated.current,
    max: updated.max,
    lastDecayAt: updated.lastDecayAt,
    conversationStartedAt: updated.conversationStartedAt,
    messagesSinceReset: updated.messagesSinceReset,
  };

  // Actualizar cache
  energyCache.set(agentId, newState);

  return newState;
}

/**
 * Resetea la energía (después del tiempo de reset)
 */
export async function resetEnergyIfNeeded(
  agentId: string,
  userId: string,
  tier: UserTier
): Promise<boolean> {
  const limits = TIER_LIMITS[tier];

  // Ultra: No necesita reset
  if (limits.hasUnlimitedEnergy || !limits.resetHours) {
    return false;
  }

  const state = await getEnergyState(agentId, userId);

  // Verificar si pasó el tiempo de reset
  const hoursSinceStart = (Date.now() - state.conversationStartedAt.getTime()) / (1000 * 60 * 60);

  if (hoursSinceStart >= limits.resetHours) {
    // Reset completo
    await prisma.agentEnergyState.update({
      where: { agentId },
      data: {
        current: 100,
        conversationStartedAt: new Date(),
        messagesSinceReset: 0,
        lastDecayAt: new Date(),
      },
    });

    // Limpiar cache
    energyCache.delete(agentId);

    return true;
  }

  return false;
}

/**
 * Recuperación gradual de energía (pasivo)
 * Llamar periódicamente o cuando el usuario vuelve después de tiempo
 */
export async function recoverEnergy(agentId: string, tier: UserTier): Promise<void> {
  const limits = TIER_LIMITS[tier];

  // Ultra: Siempre 100%
  if (limits.hasUnlimitedEnergy) {
    return;
  }

  const state = energyCache.get(agentId);
  if (!state) return;

  // Recuperar energía con el tiempo (1% por hora sin hablar)
  const hoursSinceLastMessage = (Date.now() - state.lastDecayAt.getTime()) / (1000 * 60 * 60);
  const recovery = Math.min(100 - state.current, hoursSinceLastMessage * 1);

  if (recovery > 0) {
    await prisma.agentEnergyState.update({
      where: { agentId },
      data: {
        current: Math.min(100, state.current + recovery),
        lastDecayAt: new Date(),
      },
    });

    // Limpiar cache para refrescar
    energyCache.delete(agentId);
  }
}

/**
 * Limpia el cache de energía (para testing o admin)
 */
export function clearEnergyCache(agentId?: string): void {
  if (agentId) {
    energyCache.delete(agentId);
  } else {
    energyCache.clear();
  }
}
