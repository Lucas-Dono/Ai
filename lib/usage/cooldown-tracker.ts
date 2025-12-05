/**
 * COOLDOWN TRACKING SYSTEM
 *
 * Sistema anti-bot que previene spam mediante cooldowns configurables.
 * Usa Redis para tracking eficiente y rápido.
 *
 * Cooldowns por plan:
 * - Free: 5 segundos mensajes, 10 segundos imágenes
 * - Plus: 2 segundos mensajes, 3 segundos imágenes/voz
 * - Ultra: 1 segundo mensajes, 5 segundos imágenes/voz
 */

import { redis, isRedisConfigured } from "@/lib/redis/config";
import { getTierLimits } from "./tier-limits";

// In-memory fallback when Redis is not configured
const memoryCache = new Map<string, number>();

export type CooldownAction = "message" | "voice" | "image" | "world_message";

export interface CooldownCheck {
  allowed: boolean;
  waitMs: number;
  message?: string;
}

/**
 * Verifica si el usuario puede realizar una acción basándose en cooldown
 */
export async function checkCooldown(
  userId: string,
  action: CooldownAction,
  userPlan: string = "free"
): Promise<CooldownCheck> {
  try {
    // Obtener cooldown configurado para el plan
    const tierLimits = getTierLimits(userPlan);
    const cooldownMs = getCooldownForAction(action, tierLimits.cooldowns);

    // Si el cooldown es 0, permitir siempre (ej: Ultra sin cooldown en algunos casos)
    if (cooldownMs === 0) {
      return { allowed: true, waitMs: 0 };
    }

    const key = buildCooldownKey(userId, action);
    let lastActionStr: string | number | null = null;

    // Usar Redis si está configurado, sino usar memoria
    if (isRedisConfigured()) {
      try {
        lastActionStr = await redis.get(key);
      } catch (error) {
        console.warn("[CooldownTracker] Redis get failed, falling back to memory:", error);
        lastActionStr = memoryCache.get(key) || null;
      }
    } else {
      // Fallback a memoria
      lastActionStr = memoryCache.get(key) || null;
    }

    if (!lastActionStr) {
      // Primera vez o cooldown ya expiró
      return { allowed: true, waitMs: 0 };
    }

    // Calcular tiempo transcurrido
    const lastAction = typeof lastActionStr === 'string' ? parseInt(lastActionStr) : lastActionStr;
    const elapsed = Date.now() - lastAction;

    if (elapsed < cooldownMs) {
      // Aún en cooldown
      const waitMs = cooldownMs - elapsed;
      return {
        allowed: false,
        waitMs,
        message: buildCooldownMessage(action, waitMs),
      };
    }

    // Cooldown completado
    return { allowed: true, waitMs: 0 };
  } catch (error) {
    console.error("[CooldownTracker] Error checking cooldown:", error);
    // En caso de error, permitir (fail open)
    return { allowed: true, waitMs: 0 };
  }
}

/**
 * Registra una acción y establece el cooldown
 */
export async function trackCooldown(
  userId: string,
  action: CooldownAction,
  userPlan: string = "free"
): Promise<void> {
  try {
    const tierLimits = getTierLimits(userPlan);
    const cooldownMs = getCooldownForAction(action, tierLimits.cooldowns);

    if (cooldownMs === 0) {
      return; // No trackear si no hay cooldown
    }

    const key = buildCooldownKey(userId, action);
    const timestamp = Date.now();
    const expireSeconds = Math.ceil(cooldownMs / 1000) + 1; // +1 segundo de margen

    // Usar Redis si está configurado, sino usar memoria
    if (isRedisConfigured()) {
      try {
        await redis.set(key, timestamp.toString(), "EX", expireSeconds);
      } catch (error) {
        console.warn("[CooldownTracker] Redis set failed, falling back to memory:", error);
        memoryCache.set(key, timestamp);
        // Auto-cleanup de memoria después del cooldown
        setTimeout(() => memoryCache.delete(key), cooldownMs);
      }
    } else {
      // Fallback a memoria
      memoryCache.set(key, timestamp);
      // Auto-cleanup de memoria después del cooldown
      setTimeout(() => memoryCache.delete(key), cooldownMs);
    }
  } catch (error) {
    console.error("[CooldownTracker] Error tracking cooldown:", error);
    // No lanzar error, solo loguear
  }
}

/**
 * Resetea el cooldown de un usuario (útil para testing o admin override)
 */
export async function resetCooldown(
  userId: string,
  action?: CooldownAction
): Promise<void> {
  try {
    if (isRedisConfigured()) {
      if (action) {
        // Resetear acción específica
        const key = buildCooldownKey(userId, action);
        await redis.del(key);
      } else {
        // Resetear todos los cooldowns del usuario
        const pattern = `cooldown:${userId}:*`;
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      }
    }

    // Limpiar también del cache en memoria
    if (action) {
      const key = buildCooldownKey(userId, action);
      memoryCache.delete(key);
    } else {
      // Limpiar todas las keys del usuario de memoria
      const prefix = `cooldown:${userId}:`;
      for (const key of memoryCache.keys()) {
        if (key.startsWith(prefix)) {
          memoryCache.delete(key);
        }
      }
    }
  } catch (error) {
    console.error("[CooldownTracker] Error resetting cooldown:", error);
  }
}

/**
 * Obtiene el estado de todos los cooldowns de un usuario
 */
export async function getUserCooldowns(
  userId: string
): Promise<Record<CooldownAction, { active: boolean; remainingMs: number }>> {
  const actions: CooldownAction[] = ["message", "voice", "image", "world_message"];
  const result: any = {};

  for (const action of actions) {
    const key = buildCooldownKey(userId, action);
    let lastActionStr: string | number | null = null;

    // Usar Redis si está configurado, sino usar memoria
    if (isRedisConfigured()) {
      try {
        lastActionStr = await redis.get(key);
      } catch (error) {
        lastActionStr = memoryCache.get(key) || null;
      }
    } else {
      lastActionStr = memoryCache.get(key) || null;
    }

    if (!lastActionStr) {
      result[action] = { active: false, remainingMs: 0 };
    } else {
      const lastAction = typeof lastActionStr === 'string' ? parseInt(lastActionStr) : lastActionStr;
      const elapsed = Date.now() - lastAction;
      // Asumir cooldown de 5 segundos por defecto para estimación
      const remainingMs = Math.max(0, 5000 - elapsed);
      result[action] = { active: remainingMs > 0, remainingMs };
    }
  }

  return result;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Construye la key de Redis para un cooldown
 */
function buildCooldownKey(userId: string, action: CooldownAction): string {
  return `cooldown:${userId}:${action}`;
}

/**
 * Obtiene el cooldown en ms para una acción específica
 */
function getCooldownForAction(
  action: CooldownAction,
  cooldowns: {
    messageCooldown: number;
    worldMessageCooldown: number;
    imageAnalysisCooldown?: number;
    voiceMessageCooldown?: number;
  }
): number {
  switch (action) {
    case "message":
      return cooldowns.messageCooldown;
    case "world_message":
      return cooldowns.worldMessageCooldown;
    case "image":
      return cooldowns.imageAnalysisCooldown || 0;
    case "voice":
      return cooldowns.voiceMessageCooldown || 0;
    default:
      return 0;
  }
}

/**
 * Construye mensaje de error amigable para el usuario
 */
function buildCooldownMessage(action: CooldownAction, waitMs: number): string {
  const waitSeconds = Math.ceil(waitMs / 1000);

  const actionNames = {
    message: "mensaje",
    voice: "mensaje de voz",
    image: "análisis de imagen",
    world_message: "mensaje en el mundo",
  };

  const actionName = actionNames[action] || "acción";

  if (waitSeconds === 1) {
    return `Por favor espera 1 segundo antes de enviar otro ${actionName}.`;
  }

  return `Por favor espera ${waitSeconds} segundos antes de enviar otro ${actionName}.`;
}

/**
 * Verifica múltiples cooldowns a la vez (útil para acciones complejas)
 */
export async function checkMultipleCooldowns(
  userId: string,
  actions: CooldownAction[],
  userPlan: string = "free"
): Promise<{ allowed: boolean; blockedBy?: CooldownAction; check?: CooldownCheck }> {
  for (const action of actions) {
    const check = await checkCooldown(userId, action, userPlan);
    if (!check.allowed) {
      return {
        allowed: false,
        blockedBy: action,
        check,
      };
    }
  }

  return { allowed: true };
}

/**
 * Trackea múltiples cooldowns a la vez
 */
export async function trackMultipleCooldowns(
  userId: string,
  actions: CooldownAction[],
  userPlan: string = "free"
): Promise<void> {
  await Promise.all(
    actions.map((action) => trackCooldown(userId, action, userPlan))
  );
}
