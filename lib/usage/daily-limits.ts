/**
 * Daily Limits Tracker
 * Rastrea límites diarios de mensajes para usuarios gratuitos
 */

import prisma from "@/lib/prisma";
import { PLANS } from "@/lib/mercadopago/config";

interface DailyUsage {
  userId: string;
  date: string; // YYYY-MM-DD
  messagesCount: number;
  imagesAnalyzed: number;
  rewardedMessagesUsed: number;
  rewardedImagesUsed: number;
}

// Cache en memoria para evitar hits constantes a la DB
const dailyUsageCache = new Map<string, DailyUsage>();

/**
 * Obtiene el uso diario del usuario
 */
async function getDailyUsage(userId: string): Promise<DailyUsage> {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const cacheKey = `${userId}-${today}`;

  // Verificar cache
  const cached = dailyUsageCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Buscar en la tabla Usage
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const usageRecords = await prisma.usage.findMany({
    where: {
      userId,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const usage: DailyUsage = {
    userId,
    date: today,
    messagesCount: 0,
    imagesAnalyzed: 0,
    rewardedMessagesUsed: 0,
    rewardedImagesUsed: 0,
  };

  for (const record of usageRecords) {
    if (record.resourceType === "message") {
      usage.messagesCount += record.quantity;
    } else if (record.resourceType === "image_analysis") {
      usage.imagesAnalyzed += record.quantity;
    } else if (record.resourceType === "rewarded_messages") {
      usage.rewardedMessagesUsed += record.quantity;
    } else if (record.resourceType === "rewarded_images") {
      usage.rewardedImagesUsed += record.quantity;
    }
  }

  // Cachear por 5 minutos
  dailyUsageCache.set(cacheKey, usage);
  setTimeout(() => dailyUsageCache.delete(cacheKey), 5 * 60 * 1000);

  return usage;
}

/**
 * Verifica si el usuario puede enviar un mensaje
 */
export async function canSendMessage(
  userId: string,
  userPlan: string = "free"
): Promise<{
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number;
  canUseRewarded: boolean;
}> {
  const plan = PLANS[userPlan as keyof typeof PLANS] || PLANS.free;

  // Planes pagos no tienen límite diario
  if (plan.limits.messagesPerDay === -1) {
    return {
      allowed: true,
      current: 0,
      limit: -1,
      canUseRewarded: false,
    };
  }

  const usage = await getDailyUsage(userId);
  const limit = plan.limits.messagesPerDay || 20;

  // Verificar límite normal
  if (usage.messagesCount < limit) {
    return {
      allowed: true,
      current: usage.messagesCount,
      limit,
      canUseRewarded: false,
    };
  }

  // Ya alcanzó el límite, verificar si puede usar rewarded messages
  const rewardedLimit = plan.limits.rewardedMessagesPerVideo || 10;
  const canUseRewarded = usage.rewardedMessagesUsed < rewardedLimit * 10; // Máximo 10 videos/día

  return {
    allowed: false,
    reason: canUseRewarded
      ? "Límite diario alcanzado. Mira un video para obtener más mensajes."
      : "Límite diario alcanzado. Vuelve mañana o actualiza tu plan.",
    current: usage.messagesCount,
    limit,
    canUseRewarded,
  };
}

/**
 * Verifica si el usuario puede analizar una imagen
 */
export async function canAnalyzeImage(
  userId: string,
  userPlan: string = "free"
): Promise<{
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number;
  canUseRewarded: boolean;
}> {
  const plan = PLANS[userPlan as keyof typeof PLANS] || PLANS.free;

  // Planes pagos tienen límites mensuales, no diarios
  if (userPlan !== "free") {
    // Verificar límite mensual en lugar de diario
    const monthlyUsage = await getMonthlyImageUsage(userId);
    const monthlyLimit = plan.limits.imageAnalysisPerMonth || 0;

    if (monthlyLimit === -1 || monthlyUsage < monthlyLimit) {
      return {
        allowed: true,
        current: monthlyUsage,
        limit: monthlyLimit,
        canUseRewarded: false,
      };
    }

    return {
      allowed: false,
      reason: "Límite mensual de análisis de imágenes alcanzado.",
      current: monthlyUsage,
      limit: monthlyLimit,
      canUseRewarded: false,
    };
  }

  // Para usuarios free: límite mensual
  const monthlyUsage = await getMonthlyImageUsage(userId);
  const monthlyLimit = plan.limits.imageAnalysisPerMonth || 5;

  if (monthlyUsage < monthlyLimit) {
    return {
      allowed: true,
      current: monthlyUsage,
      limit: monthlyLimit,
      canUseRewarded: false,
    };
  }

  // Ya alcanzó el límite mensual, verificar rewarded
  const rewardedLimit = plan.limits.imageAnalysisRewardedMax || 60;
  const rewardedUsed = await getMonthlyRewardedImageUsage(userId);
  const canUseRewarded = rewardedUsed < rewardedLimit;

  return {
    allowed: false,
    reason: canUseRewarded
      ? "Límite mensual alcanzado. Mira videos para obtener más análisis."
      : "Límite mensual alcanzado. Actualiza tu plan para más análisis.",
    current: monthlyUsage,
    limit: monthlyLimit,
    canUseRewarded,
  };
}

/**
 * Registra el uso de un mensaje
 */
export async function trackMessageUsage(
  userId: string,
  isRewarded: boolean = false
): Promise<void> {
  await prisma.usage.create({
    data: {
      userId,
      resourceType: isRewarded ? "rewarded_messages" : "message",
      quantity: 1,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
  });

  // Invalidar cache
  const today = new Date().toISOString().split("T")[0];
  dailyUsageCache.delete(`${userId}-${today}`);
}

/**
 * Registra el uso de análisis de imagen
 */
export async function trackImageAnalysisUsage(
  userId: string,
  isRewarded: boolean = false
): Promise<void> {
  await prisma.usage.create({
    data: {
      userId,
      resourceType: isRewarded ? "rewarded_images" : "image_analysis",
      quantity: 1,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
  });
}

/**
 * Otorga créditos de mensajes por ver un video ad
 */
export async function grantRewardedMessages(
  userId: string,
  userPlan: string = "free"
): Promise<{ success: boolean; messagesGranted: number; reason?: string }> {
  const plan = PLANS[userPlan as keyof typeof PLANS] || PLANS.free;
  const messagesPerVideo = plan.limits.rewardedMessagesPerVideo || 10;

  // Verificar límite diario de videos (máximo 10 videos/día)
  const usage = await getDailyUsage(userId);
  const videosWatchedToday = Math.floor(usage.rewardedMessagesUsed / messagesPerVideo);

  if (videosWatchedToday >= 10) {
    return {
      success: false,
      messagesGranted: 0,
      reason: "Has alcanzado el límite diario de videos (10 videos/día).",
    };
  }

  // Registrar los mensajes rewarded
  for (let i = 0; i < messagesPerVideo; i++) {
    await trackMessageUsage(userId, true);
  }

  return {
    success: true,
    messagesGranted: messagesPerVideo,
  };
}

/**
 * Otorga créditos de análisis de imágenes por ver un video ad
 */
export async function grantRewardedImages(
  userId: string,
  videoLengthSeconds: number,
  userPlan: string = "free"
): Promise<{ success: boolean; imagesGranted: number; reason?: string }> {
  const plan = PLANS[userPlan as keyof typeof PLANS] || PLANS.free;
  const imagesPerMinute = plan.limits.imageAnalysisPerMinuteVideo || 4;
  const rewardedMax = plan.limits.imageAnalysisRewardedMax || 60;

  // Calcular imágenes a otorgar (4 por cada minuto completo)
  const minutesWatched = Math.floor(videoLengthSeconds / 60);
  const imagesGranted = minutesWatched * imagesPerMinute;

  if (imagesGranted === 0) {
    return {
      success: false,
      imagesGranted: 0,
      reason: "Debes ver al menos 1 minuto completo del video.",
    };
  }

  // Verificar límite mensual de rewarded images
  const rewardedUsed = await getMonthlyRewardedImageUsage(userId);

  if (rewardedUsed >= rewardedMax) {
    return {
      success: false,
      imagesGranted: 0,
      reason: `Has alcanzado el límite mensual de análisis rewarded (${rewardedMax}/mes).`,
    };
  }

  const actualGranted = Math.min(imagesGranted, rewardedMax - rewardedUsed);

  // Registrar los análisis rewarded
  for (let i = 0; i < actualGranted; i++) {
    await trackImageAnalysisUsage(userId, true);
  }

  return {
    success: true,
    imagesGranted: actualGranted,
  };
}

/**
 * Obtiene el uso mensual de análisis de imágenes
 */
async function getMonthlyImageUsage(userId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const usage = await prisma.usage.findMany({
    where: {
      userId,
      resourceType: "image_analysis",
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  return usage.reduce((sum, record) => sum + record.quantity, 0);
}

/**
 * Obtiene el uso mensual de análisis de imágenes rewarded
 */
async function getMonthlyRewardedImageUsage(userId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const usage = await prisma.usage.findMany({
    where: {
      userId,
      resourceType: "rewarded_images",
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  return usage.reduce((sum, record) => sum + record.quantity, 0);
}

/**
 * Obtiene estadísticas de uso para mostrar al usuario
 */
export async function getUserUsageStats(userId: string, userPlan: string = "free") {
  const plan = PLANS[userPlan as keyof typeof PLANS] || PLANS.free;
  const dailyUsage = await getDailyUsage(userId);
  const monthlyImages = await getMonthlyImageUsage(userId);
  const monthlyRewardedImages = await getMonthlyRewardedImageUsage(userId);

  return {
    today: {
      messages: {
        used: dailyUsage.messagesCount,
        limit: plan.limits.messagesPerDay,
        rewarded: dailyUsage.rewardedMessagesUsed,
      },
    },
    thisMonth: {
      images: {
        used: monthlyImages,
        limit: plan.limits.imageAnalysisPerMonth,
        rewarded: monthlyRewardedImages,
        rewardedMax: plan.limits.imageAnalysisRewardedMax,
      },
    },
  };
}
