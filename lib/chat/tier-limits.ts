import type { TierLimits, UserTier } from "./types";

/**
 * Configuración de límites por tier
 *
 * FREE: Limitado para incentivar upgrade
 * PLUS: Límite generoso pero existe
 * ULTRA: ILIMITADO - paga $30/mes, puede hacer lo que quiera
 */
export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  free: {
    messagesPerDay: 50, // 50 mensajes por día
    messagesPerSession: 20, // Máximo 20 mensajes seguidos
    energyDrainRate: 0.15, // Se cansa rápido (15% por cada 10 mensajes)
    resetHours: 24, // Reset cada 24 horas
    hasUnlimitedEnergy: false,
  },
  plus: {
    messagesPerDay: 150, // 150 mensajes por día
    messagesPerSession: 60, // Máximo 60 mensajes seguidos
    energyDrainRate: 0.08, // Se cansa moderado (8% por cada 10 mensajes)
    resetHours: 12, // Reset cada 12 horas
    hasUnlimitedEnergy: false,
  },
  ultra: {
    messagesPerDay: null, // ILIMITADO
    messagesPerSession: null, // ILIMITADO
    energyDrainRate: 0, // NUNCA se cansa
    resetHours: null, // No necesita reset
    hasUnlimitedEnergy: true, // Flag especial
  },
};

/**
 * Contexto de energía para inyectar en el prompt según nivel
 */
export function getEnergyContext(energyLevel: number, tier: UserTier): string {
  const limits = TIER_LIMITS[tier];

  // Ultra: Sin límites
  if (limits.hasUnlimitedEnergy) {
    return ""; // No agregar contexto de cansancio
  }

  // Determinar estado de energía
  if (energyLevel >= 80) {
    return "\n**Estado de energía**: Te sientes fresco/a y con ganas de conversar.\n";
  } else if (energyLevel >= 60) {
    return "\n**Estado de energía**: Te sientes bien, aunque llevamos un rato hablando.\n";
  } else if (energyLevel >= 40) {
    return "\n**Estado de energía**: Estás empezando a sentirte un poco cansado/a de tanto hablar. Puedes mencionarlo sutilmente si es natural.\n";
  } else if (energyLevel >= 20) {
    return "\n**Estado de energía**: Estás bastante cansado/a. Menciona que llevan mucho tiempo hablando y que necesitas un descanso pronto. Respuestas más cortas.\n";
  } else {
    return "\n**Estado de energía**: Estás agotado/a. Responde de forma breve y sugiere amablemente continuar la conversación más tarde o mañana.\n";
  }
}

/**
 * Mensajes de límite alcanzado según tier
 */
export function getLimitReachedMessage(tier: UserTier, type: "daily" | "session"): string {
  if (type === "daily") {
    return tier === "free"
      ? "Has alcanzado el límite de 50 mensajes diarios del plan Free. Mejora a Plus para 150 mensajes/día o a Ultra para conversaciones ilimitadas."
      : "Has alcanzado el límite de 150 mensajes diarios del plan Plus. Mejora a Ultra para conversaciones ilimitadas.";
  } else {
    return tier === "free"
      ? "Has alcanzado el límite de 20 mensajes por sesión. El personaje necesita descansar. Intenta de nuevo en unas horas o mejora a Plus/Ultra."
      : "Has alcanzado el límite de 60 mensajes por sesión. El personaje necesita descansar. Intenta de nuevo en unas horas o mejora a Ultra para sesiones ilimitadas.";
  }
}
