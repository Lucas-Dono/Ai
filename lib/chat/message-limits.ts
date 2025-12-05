import { prisma } from "@/lib/prisma";
import type { MessageLimitStatus, UserTier } from "./types";
import { TIER_LIMITS, getLimitReachedMessage } from "./tier-limits";

/**
 * Sistema de Límites de Mensajes por Tier
 *
 * Trackea cuántos mensajes ha enviado el usuario hoy y por sesión
 * - FREE: 50/día, 20/sesión
 * - PLUS: 150/día, 60/sesión
 * - ULTRA: ILIMITADO
 */

/**
 * Verifica si el usuario puede enviar más mensajes
 */
export async function checkMessageLimit(
  userId: string,
  agentId: string,
  tier: UserTier
): Promise<MessageLimitStatus> {
  const limits = TIER_LIMITS[tier];

  // ULTRA: Siempre permitido
  if (limits.messagesPerDay === null && limits.messagesPerSession === null) {
    return {
      allowed: true,
      messagesUsed: 0,
      messagesLimit: null,
      resetsAt: null,
      energyRemaining: 100,
    };
  }

  // Obtener tracking actual
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let tracking = await prisma.messageTracking.findFirst({
    where: {
      userId,
      agentId,
      date: {
        gte: today,
      },
    },
  });

  if (!tracking) {
    // Crear tracking para hoy
    tracking = await prisma.messageTracking.create({
      data: {
        userId,
        agentId,
        date: today,
        dailyCount: 0,
        sessionCount: 0,
        sessionStartedAt: new Date(),
      },
    });
  }

  // Verificar límite diario
  if (limits.messagesPerDay !== null && tracking.dailyCount >= limits.messagesPerDay) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      allowed: false,
      messagesUsed: tracking.dailyCount,
      messagesLimit: limits.messagesPerDay,
      resetsAt: tomorrow,
      energyRemaining: 0,
      reason: getLimitReachedMessage(tier, "daily"),
    };
  }

  // Verificar límite de sesión
  if (limits.messagesPerSession !== null && tracking.sessionCount >= limits.messagesPerSession) {
    // Verificar si pasó el tiempo de reset de sesión
    const hoursSinceSessionStart =
      (Date.now() - tracking.sessionStartedAt.getTime()) / (1000 * 60 * 60);

    if (limits.resetHours && hoursSinceSessionStart >= limits.resetHours) {
      // Reset de sesión
      await prisma.messageTracking.update({
        where: { id: tracking.id },
        data: {
          sessionCount: 0,
          sessionStartedAt: new Date(),
        },
      });

      tracking.sessionCount = 0;
    } else {
      const resetsAt = new Date(
        tracking.sessionStartedAt.getTime() + (limits.resetHours || 12) * 60 * 60 * 1000
      );

      return {
        allowed: false,
        messagesUsed: tracking.sessionCount,
        messagesLimit: limits.messagesPerSession,
        resetsAt,
        energyRemaining: 0,
        reason: getLimitReachedMessage(tier, "session"),
      };
    }
  }

  // Permitido
  return {
    allowed: true,
    messagesUsed: tracking.dailyCount,
    messagesLimit: limits.messagesPerDay,
    resetsAt: null,
    energyRemaining: 100, // Se calculará después
  };
}

/**
 * Incrementa el contador de mensajes después de enviar uno
 */
export async function incrementMessageCount(userId: string, agentId: string): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.messageTracking.updateMany({
    where: {
      userId,
      agentId,
      date: {
        gte: today,
      },
    },
    data: {
      dailyCount: {
        increment: 1,
      },
      sessionCount: {
        increment: 1,
      },
    },
  });
}

/**
 * Reset manual de sesión (para testing o admin)
 */
export async function resetSession(userId: string, agentId: string): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.messageTracking.updateMany({
    where: {
      userId,
      agentId,
      date: {
        gte: today,
      },
    },
    data: {
      sessionCount: 0,
      sessionStartedAt: new Date(),
    },
  });
}

/**
 * Obtiene estadísticas de uso para mostrar al usuario
 */
export async function getUsageStats(
  userId: string,
  agentId: string,
  tier: UserTier
): Promise<{
  dailyUsed: number;
  dailyLimit: number | null;
  sessionUsed: number;
  sessionLimit: number | null;
  percentageUsed: number;
}> {
  const limits = TIER_LIMITS[tier];

  // Ultra: Stats vacíos
  if (limits.messagesPerDay === null) {
    return {
      dailyUsed: 0,
      dailyLimit: null,
      sessionUsed: 0,
      sessionLimit: null,
      percentageUsed: 0,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tracking = await prisma.messageTracking.findFirst({
    where: {
      userId,
      agentId,
      date: {
        gte: today,
      },
    },
  });

  const dailyUsed = tracking?.dailyCount || 0;
  const sessionUsed = tracking?.sessionCount || 0;

  return {
    dailyUsed,
    dailyLimit: limits.messagesPerDay,
    sessionUsed,
    sessionLimit: limits.messagesPerSession,
    percentageUsed: limits.messagesPerDay ? (dailyUsed / limits.messagesPerDay) * 100 : 0,
  };
}
