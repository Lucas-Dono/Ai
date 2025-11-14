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

import { redis } from "@/lib/redis/config";
import { getTierLimits } from "./tier-limits";

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

    // Buscar última acción en Redis
    const key = buildCooldownKey(userId, action);
    const lastActionStr = await redis.get(key);

    if (!lastActionStr) {
      // Primera vez o cooldown ya expiró
      return { allowed: true, waitMs: 0 };
    }

    // Calcular tiempo transcurrido
    const lastAction = parseInt(lastActionStr);
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
    const expireSeconds = Math.ceil(cooldownMs / 1000) + 1; // +1 segundo de margen

    // Guardar timestamp actual con expiración automática
    await redis.set(key, Date.now().toString(), "EX", expireSeconds);
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
    const lastActionStr = await redis.get(key);

    if (!lastActionStr) {
      result[action] = { active: false, remainingMs: 0 };
    } else {
      const lastAction = parseInt(lastActionStr);
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
