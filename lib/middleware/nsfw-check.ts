/**
 * NSFW Content Middleware
 * Verifica si el usuario tiene acceso a contenido NSFW
 */

import { PLANS } from "@/lib/mercadopago/config";

export interface NSFWCheckResult {
  allowed: boolean;
  reason?: string;
  requiresPlan?: string; // Plan mínimo requerido
}

/**
 * Verifica si el usuario puede acceder a contenido NSFW
 */
export function canAccessNSFW(userPlan: string = "free"): NSFWCheckResult {
  const plan = PLANS[userPlan as keyof typeof PLANS] || PLANS.free;

  if (plan.limits.nsfwMode) {
    return {
      allowed: true,
    };
  }

  return {
    allowed: false,
    reason:
      "El contenido NSFW requiere un plan de pago. Actualiza a Plus o Ultra para desbloquear contenido sin restricciones.",
    requiresPlan: "plus",
  };
}

/**
 * Verifica si el usuario puede usar comportamientos avanzados (Yandere, BPD, NPD, etc.)
 */
export function canUseAdvancedBehaviors(
  userPlan: string = "free"
): NSFWCheckResult {
  const plan = PLANS[userPlan as keyof typeof PLANS] || PLANS.free;

  if (plan.limits.advancedBehaviors) {
    return {
      allowed: true,
    };
  }

  return {
    allowed: false,
    reason:
      "Los comportamientos psicológicos avanzados (Yandere, BPD, NPD, etc.) requieren un plan de pago. Actualiza a Plus o Ultra.",
    requiresPlan: "plus",
  };
}

/**
 * Detecta si un mensaje contiene contenido NSFW
 * (Esto es una implementación básica, puedes mejorarla con NLP)
 */
export function detectNSFWContent(text: string): boolean {
  const nsfwKeywords = [
    // Keywords básicos (expandir según necesidad)
    "nsfw",
    "explícito",
    "sexual",
    "desnudo",
    "erótico",
    // Agregar más según tu modelo de moderación
  ];

  const lowerText = text.toLowerCase();
  return nsfwKeywords.some((keyword) => lowerText.includes(keyword));
}

/**
 * Sanitiza el mensaje si el usuario no tiene acceso a NSFW
 */
export function sanitizeNSFWContent(
  text: string,
  userPlan: string = "free"
): {
  sanitized: string;
  wasBlocked: boolean;
  reason?: string;
} {
  const check = canAccessNSFW(userPlan);

  if (check.allowed) {
    return {
      sanitized: text,
      wasBlocked: false,
    };
  }

  // Si el contenido es NSFW y el usuario no tiene acceso, bloquearlo
  if (detectNSFWContent(text)) {
    return {
      sanitized: "",
      wasBlocked: true,
      reason: check.reason,
    };
  }

  return {
    sanitized: text,
    wasBlocked: false,
  };
}
