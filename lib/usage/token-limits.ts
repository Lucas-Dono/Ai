/**
 * Token-Based Limits Tracker
 * Sistema de límites basado en tokens (más justo y preciso)
 */

import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/mercadopago/config";
import { getEffectiveTier } from "./special-events";
import { getTierLimits, isUnlimited } from "./tier-limits";
import { getWeeklyUsage } from "./daily-limits";

// ============================================================================
// CONFIGURACIÓN DE LÍMITES POR TIER
// ============================================================================

export const TOKEN_LIMITS = {
  free: {
    inputTokensPerDay: 10_000,
    outputTokensPerDay: 10_000,
    totalTokensPerDay: 20_000,
  },
  plus: {
    inputTokensPerDay: 1_000_000,
    outputTokensPerDay: 1_000_000,
    totalTokensPerDay: 2_000_000,
  },
  business: {
    inputTokensPerDay: -1, // Unlimited
    outputTokensPerDay: -1,
    totalTokensPerDay: -1,
  },
} as const;

// ============================================================================
// CONVERSIÓN TOKENS <-> MENSAJES (PARA UI)
// ============================================================================

/**
 * Promedio de tokens por mensaje:
 * - Input (usuario): ~150 tokens
 * - Output (compañero): ~200 tokens
 * - Total por intercambio: ~350 tokens
 */
const TOKENS_PER_MESSAGE = {
  input: 150,
  output: 200,
  total: 350,
} as const;

/**
 * Convierte tokens a mensajes estimados (para mostrar en UI)
 */
export function tokensToMessages(tokens: number, type: 'input' | 'output' | 'total' = 'total'): number {
  const divisor = TOKENS_PER_MESSAGE[type];
  return Math.floor(tokens / divisor);
}

/**
 * Convierte mensajes a tokens estimados
 */
export function messagesToTokens(messages: number, type: 'input' | 'output' | 'total' = 'total'): number {
  const multiplier = TOKENS_PER_MESSAGE[type];
  return messages * multiplier;
}

/**
 * Obtiene límites de mensajes estimados para un tier (para UI)
 */
export function getMessageLimitsForTier(tier: keyof typeof TOKEN_LIMITS) {
  const tokenLimits = TOKEN_LIMITS[tier];

  return {
    messagesPerDay: tokensToMessages(tokenLimits.totalTokensPerDay),
    inputMessagesPerDay: tokensToMessages(tokenLimits.inputTokensPerDay, 'input'),
    outputMessagesPerDay: tokensToMessages(tokenLimits.outputTokensPerDay, 'output'),
  };
}

// ============================================================================
// TRACKING DE TOKENS
// ============================================================================

interface DailyTokenUsage {
  userId: string;
  date: string; // YYYY-MM-DD
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  rewardedInputTokens: number;
  rewardedOutputTokens: number;
}

// Cache en memoria (5 minutos)
const tokenUsageCache = new Map<string, DailyTokenUsage>();

/**
 * Obtiene el uso diario de tokens del usuario
 */
export async function getDailyTokenUsage(userId: string): Promise<DailyTokenUsage> {
  const today = new Date().toISOString().split("T")[0];
  const cacheKey = `${userId}-${today}`;

  // Verificar cache
  const cached = tokenUsageCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Buscar en DB
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const usageRecords = await prisma.usage.findMany({
    where: {
      userId,
      resourceType: {
        in: ['input_tokens', 'output_tokens', 'rewarded_input_tokens', 'rewarded_output_tokens']
      },
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const usage: DailyTokenUsage = {
    userId,
    date: today,
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    rewardedInputTokens: 0,
    rewardedOutputTokens: 0,
  };

  for (const record of usageRecords) {
    switch (record.resourceType) {
      case 'input_tokens':
        usage.inputTokens += record.quantity;
        break;
      case 'output_tokens':
        usage.outputTokens += record.quantity;
        break;
      case 'rewarded_input_tokens':
        usage.rewardedInputTokens += record.quantity;
        break;
      case 'rewarded_output_tokens':
        usage.rewardedOutputTokens += record.quantity;
        break;
    }
  }

  usage.totalTokens = usage.inputTokens + usage.outputTokens;

  // Cachear por 5 minutos
  tokenUsageCache.set(cacheKey, usage);
  setTimeout(() => tokenUsageCache.delete(cacheKey), 5 * 60 * 1000);

  return usage;
}

/**
 * Verifica si el usuario puede enviar un mensaje (basado en tokens)
 */
export async function canSendMessage(
  userId: string,
  userPlan: string = "free",
  estimatedInputTokens: number = TOKENS_PER_MESSAGE.input
): Promise<{
  allowed: boolean;
  reason?: string;
  inputTokensUsed: number;
  inputTokensLimit: number;
  outputTokensUsed: number;
  outputTokensLimit: number;
  messagesUsedToday: number;
  messagesLimitToday: number;
  canUseRewarded: boolean;
  effectiveTier?: string;
  tempTierInfo?: {
    eventName: string;
    expiresAt: Date;
  };
}> {
  // Verificar tier efectivo (con special events)
  const effectiveTier = await getEffectiveTier(userId, userPlan);
  const limits = TOKEN_LIMITS[effectiveTier as keyof typeof TOKEN_LIMITS] || TOKEN_LIMITS.free;

  // Obtener info del temp tier si existe
  let tempTierInfo;
  if (effectiveTier !== userPlan) {
    const { getActiveTempTier } = await import("./special-events");
    const tempTier = await getActiveTempTier(userId);
    if (tempTier && tempTier.hasTempTier) {
      tempTierInfo = {
        eventName: tempTier.eventName || 'Evento especial',
        expiresAt: tempTier.expiresAt!,
      };
    }
  }

  // Planes pagos/upgraded tienen tokens ilimitados
  if (limits.inputTokensPerDay === -1) {
    return {
      allowed: true,
      inputTokensUsed: 0,
      inputTokensLimit: -1,
      outputTokensUsed: 0,
      outputTokensLimit: -1,
      messagesUsedToday: 0,
      messagesLimitToday: -1,
      canUseRewarded: false,
      effectiveTier,
      tempTierInfo,
    };
  }

  const usage = await getDailyTokenUsage(userId);

  // STEP 1: Verificar límite DIARIO de tokens
  const inputRemaining = limits.inputTokensPerDay - usage.inputTokens;
  const outputRemaining = limits.outputTokensPerDay - usage.outputTokens;

  // Convertir a mensajes estimados para UI
  const messagesUsed = tokensToMessages(usage.totalTokens);
  const messagesLimit = tokensToMessages(limits.totalTokensPerDay);

  // Si no tiene suficientes tokens diarios, bloquear
  if (inputRemaining < estimatedInputTokens || outputRemaining < TOKENS_PER_MESSAGE.output) {
    // Verificar si puede usar rewarded tokens
    const rewardedTotal = usage.rewardedInputTokens + usage.rewardedOutputTokens;
    const maxRewardedTokens = 100_000; // 100k tokens rewarded por día (~285 mensajes)
    const canUseRewarded = rewardedTotal < maxRewardedTokens;

    return {
      allowed: false,
      reason: canUseRewarded
        ? "Límite diario de tokens alcanzado. Mira un video para obtener más tokens."
        : "Límite diario de tokens alcanzado. Vuelve mañana o actualiza tu plan.",
      inputTokensUsed: usage.inputTokens,
      inputTokensLimit: limits.inputTokensPerDay,
      outputTokensUsed: usage.outputTokens,
      outputTokensLimit: limits.outputTokensPerDay,
      messagesUsedToday: messagesUsed,
      messagesLimitToday: messagesLimit,
      canUseRewarded,
      effectiveTier,
      tempTierInfo,
    };
  }

  // STEP 2: Verificar límite SEMANAL de tokens (ANTI-ABUSE)
  const tierLimits = getTierLimits(effectiveTier);
  const weeklyLimit = tierLimits.resources.totalTokensPerWeek;

  if (!isUnlimited(weeklyLimit) && weeklyLimit > 0) {
    const weeklyUsage = await getWeeklyUsage(userId, "tokens");

    if (weeklyUsage >= weeklyLimit) {
      return {
        allowed: false,
        reason: `Límite semanal de tokens alcanzado (${tokensToMessages(weeklyLimit)} mensajes/semana aprox). Se resetea el domingo.`,
        inputTokensUsed: usage.inputTokens,
        inputTokensLimit: limits.inputTokensPerDay,
        outputTokensUsed: usage.outputTokens,
        outputTokensLimit: limits.outputTokensPerDay,
        messagesUsedToday: messagesUsed,
        messagesLimitToday: messagesLimit,
        canUseRewarded: false,
        effectiveTier,
        tempTierInfo,
      };
    }
  }

  // STEP 3: Permitido - tiene suficientes tokens diarios y semanales
  return {
    allowed: true,
    inputTokensUsed: usage.inputTokens,
    inputTokensLimit: limits.inputTokensPerDay,
    outputTokensUsed: usage.outputTokens,
    outputTokensLimit: limits.outputTokensPerDay,
    messagesUsedToday: messagesUsed,
    messagesLimitToday: messagesLimit,
    canUseRewarded: false,
    effectiveTier,
    tempTierInfo,
  };
}

/**
 * Registra el uso de tokens (SOLO cuenta tokens del usuario, NO system prompts/context)
 */
export async function trackTokenUsage(
  userId: string,
  inputTokens: number,
  outputTokens: number,
  metadata?: {
    agentId?: string;
    messageId?: string;
    userMessageContent?: string; // Para debugging
  },
  isRewarded: boolean = false
): Promise<void> {
  const inputType = isRewarded ? 'rewarded_input_tokens' : 'input_tokens';
  const outputType = isRewarded ? 'rewarded_output_tokens' : 'output_tokens';

  // Registrar input tokens
  await prisma.usage.create({
    data: {
      userId,
      resourceType: inputType,
      quantity: inputTokens,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    },
  });

  // Registrar output tokens
  await prisma.usage.create({
    data: {
      userId,
      resourceType: outputType,
      quantity: outputTokens,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    },
  });

  // Invalidar cache
  const today = new Date().toISOString().split("T")[0];
  tokenUsageCache.delete(`${userId}-${today}`);
}

/**
 * Otorga tokens rewarded por ver un video ad
 */
export async function grantRewardedTokens(
  userId: string,
  userPlan: string = "free"
): Promise<{ success: boolean; tokensGranted: number; messagesGranted: number; reason?: string }> {
  const tokensPerVideo = 10_000; // 10k tokens = ~28 mensajes

  // Verificar límite diario de rewarded tokens
  const usage = await getDailyTokenUsage(userId);
  const rewardedTotal = usage.rewardedInputTokens + usage.rewardedOutputTokens;
  const maxRewardedTokens = 100_000; // 100k tokens/día

  if (rewardedTotal >= maxRewardedTokens) {
    return {
      success: false,
      tokensGranted: 0,
      messagesGranted: 0,
      reason: "Has alcanzado el límite diario de tokens rewarded (100,000 tokens/día).",
    };
  }

  const actualGranted = Math.min(tokensPerVideo, maxRewardedTokens - rewardedTotal);

  // Distribuir 50/50 entre input y output
  const inputGranted = Math.floor(actualGranted / 2);
  const outputGranted = actualGranted - inputGranted;

  await trackTokenUsage(userId, inputGranted, outputGranted, {}, true);

  return {
    success: true,
    tokensGranted: actualGranted,
    messagesGranted: tokensToMessages(actualGranted),
  };
}

/**
 * Obtiene estadísticas de uso de tokens para mostrar al usuario
 */
export async function getTokenUsageStats(userId: string, userPlan: string = "free") {
  const effectiveTier = await getEffectiveTier(userId, userPlan);
  const limits = TOKEN_LIMITS[effectiveTier as keyof typeof TOKEN_LIMITS] || TOKEN_LIMITS.free;
  const usage = await getDailyTokenUsage(userId);

  // Convertir a mensajes para UI
  const messagesUsed = tokensToMessages(usage.totalTokens);
  const messagesLimit = limits.totalTokensPerDay === -1 ? -1 : tokensToMessages(limits.totalTokensPerDay);

  return {
    tokens: {
      input: {
        used: usage.inputTokens,
        limit: limits.inputTokensPerDay,
        remaining: limits.inputTokensPerDay === -1 ? -1 : limits.inputTokensPerDay - usage.inputTokens,
      },
      output: {
        used: usage.outputTokens,
        limit: limits.outputTokensPerDay,
        remaining: limits.outputTokensPerDay === -1 ? -1 : limits.outputTokensPerDay - usage.outputTokens,
      },
      total: {
        used: usage.totalTokens,
        limit: limits.totalTokensPerDay,
        remaining: limits.totalTokensPerDay === -1 ? -1 : limits.totalTokensPerDay - usage.totalTokens,
      },
      rewarded: {
        input: usage.rewardedInputTokens,
        output: usage.rewardedOutputTokens,
        total: usage.rewardedInputTokens + usage.rewardedOutputTokens,
      },
    },
    // Para mostrar en UI (más user-friendly)
    messages: {
      used: messagesUsed,
      limit: messagesLimit,
      remaining: messagesLimit === -1 ? -1 : messagesLimit - messagesUsed,
    },
    tier: effectiveTier,
  };
}

/**
 * HELPER: Estima tokens de un mensaje de texto
 * Aproximación simple: ~0.75 tokens por palabra (inglés)
 * ~1 token por palabra (español)
 */
export function estimateTokensFromText(text: string): number {
  const words = text.trim().split(/\s+/).length;
  // Promedio conservador: 1 token por palabra
  return Math.ceil(words * 1.0);
}
