/**
 * Smart Timing Service for Notifications
 * Determina el mejor momento para enviar notificaciones basado en:
 * - Preferencias de usuario
 * - Patrones de actividad históricos
 * - Timezone del usuario
 */

import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logging/logger";

interface SmartTimingResult {
  shouldSendNow: boolean;
  suggestedTime?: Date;
  reason: string;
  userTimezone: string;
}

/**
 * Verificar si ahora es buen momento para enviar notificación según preferencias
 */
export async function shouldSendNotificationNow(
  userId: string,
  notificationType: "bond_warning" | "bond_dormant" | "bond_fragile" | "bond_milestone"
): Promise<SmartTimingResult> {
  try {
    // Obtener preferencias del usuario
    const preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    // Si no hay preferencias, usar defaults
    if (!preferences) {
      return {
        shouldSendNow: true,
        reason: "No preferences set, using defaults",
        userTimezone: "America/Argentina/Buenos_Aires",
      };
    }

    // Verificar si las notificaciones están habilitadas
    if (!preferences.bondNotificationsEnabled) {
      return {
        shouldSendNow: false,
        reason: "Bond notifications disabled by user",
        userTimezone: preferences.timezone,
      };
    }

    // Verificar frecuencia según tipo
    const frequencyMap = {
      bond_warning: preferences.bondWarningFrequency,
      bond_dormant: preferences.bondDormantFrequency,
      bond_fragile: preferences.bondFragileFrequency,
      bond_milestone: "daily", // Siempre enviar milestones
    };

    const frequency = frequencyMap[notificationType];

    if (frequency === "never") {
      return {
        shouldSendNow: false,
        reason: `Frequency set to never for ${notificationType}`,
        userTimezone: preferences.timezone,
      };
    }

    // Obtener hora actual en timezone del usuario
    const now = new Date();
    const userHour = getUserCurrentHour(now, preferences.timezone);

    // Verificar si estamos en una hora preferida
    const preferredHours = (preferences.preferredNotificationHours as number[]) || [9, 12, 18, 21];

    if (!preferredHours.includes(userHour)) {
      // Calcular próxima hora preferida
      const nextPreferredHour = getNextPreferredHour(userHour, preferredHours);
      const suggestedTime = new Date(now);
      suggestedTime.setHours(nextPreferredHour, 0, 0, 0);

      // Si la hora preferida ya pasó hoy, programar para mañana
      if (nextPreferredHour < userHour) {
        suggestedTime.setDate(suggestedTime.getDate() + 1);
      }

      return {
        shouldSendNow: false,
        suggestedTime,
        reason: `Current hour ${userHour} not in preferred hours [${preferredHours.join(", ")}]`,
        userTimezone: preferences.timezone,
      };
    }

    // Verificar patrones de actividad históricos
    const activityScore = getActivityScoreForHour(
      userHour,
      preferences.lastActiveHours as Record<string, number>
    );

    // Si el usuario suele estar inactivo a esta hora, mejor esperar
    if (activityScore < 0.2) {
      const bestHour = getBestActivityHour(preferences.lastActiveHours as Record<string, number>);
      const suggestedTime = new Date(now);
      suggestedTime.setHours(bestHour, 0, 0, 0);

      if (bestHour < userHour) {
        suggestedTime.setDate(suggestedTime.getDate() + 1);
      }

      return {
        shouldSendNow: false,
        suggestedTime,
        reason: `Low activity score (${activityScore.toFixed(2)}) for hour ${userHour}`,
        userTimezone: preferences.timezone,
      };
    }

    // Todo OK, enviar ahora
    return {
      shouldSendNow: true,
      reason: `Good time: preferred hour ${userHour}, activity score ${activityScore.toFixed(2)}`,
      userTimezone: preferences.timezone,
    };
  } catch (error) {
    log.error({ error, userId }, "Error checking smart timing");
    // En caso de error, enviar de todos modos
    return {
      shouldSendNow: true,
      reason: "Error checking preferences, sending anyway",
      userTimezone: "America/Argentina/Buenos_Aires",
    };
  }
}

/**
 * Verificar si un bond específico está silenciado
 */
export async function isBondMuted(userId: string, bondId: string): Promise<boolean> {
  try {
    const preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
      select: { mutedBonds: true },
    });

    if (!preferences) return false;

    const mutedBonds = (preferences.mutedBonds as string[]) || [];
    return mutedBonds.includes(bondId);
  } catch (error) {
    log.error({ error, userId, bondId }, "Error checking if bond is muted");
    return false;
  }
}

/**
 * Registrar actividad del usuario para mejorar smart timing
 */
export async function trackUserActivity(userId: string): Promise<void> {
  try {
    const preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Crear preferencias si no existen
      await prisma.notificationPreferences.create({
        data: {
          userId,
          lastActiveHours: { [new Date().getHours()]: 1 },
        },
      });
      return;
    }

    // Actualizar conteo de actividad para la hora actual
    const currentHour = new Date().getHours();
    const activityData = (preferences.lastActiveHours as Record<string, number>) || {};
    activityData[currentHour] = (activityData[currentHour] || 0) + 1;

    await prisma.notificationPreferences.update({
      where: { userId },
      data: { lastActiveHours: activityData },
    });
  } catch (error) {
    log.error({ error, userId }, "Error tracking user activity");
  }
}

/**
 * Obtener hora actual del usuario en su timezone
 */
function getUserCurrentHour(date: Date, timezone: string): number {
  try {
    const userTime = new Date(
      date.toLocaleString("en-US", { timeZone: timezone })
    );
    return userTime.getHours();
  } catch (error) {
    // Si falla, usar hora UTC
    return date.getUTCHours();
  }
}

/**
 * Obtener próxima hora preferida
 */
function getNextPreferredHour(currentHour: number, preferredHours: number[]): number {
  const sorted = [...preferredHours].sort((a, b) => a - b);

  // Buscar primera hora mayor a la actual
  for (const hour of sorted) {
    if (hour > currentHour) {
      return hour;
    }
  }

  // Si no hay ninguna, retornar la primera (será mañana)
  return sorted[0];
}

/**
 * Calcular score de actividad para una hora específica
 */
function getActivityScoreForHour(
  hour: number,
  activityData: Record<string, number>
): number {
  const hourActivity = activityData[hour] || 0;
  const totalActivity = Object.values(activityData).reduce((sum, val) => sum + val, 0);

  if (totalActivity === 0) return 0.5; // Default medio si no hay datos

  return hourActivity / totalActivity;
}

/**
 * Obtener hora con mayor actividad
 */
function getBestActivityHour(activityData: Record<string, number>): number {
  if (Object.keys(activityData).length === 0) return 9; // Default 9 AM

  let maxActivity = 0;
  let bestHour = 9;

  for (const [hour, activity] of Object.entries(activityData)) {
    if (activity > maxActivity) {
      maxActivity = activity;
      bestHour = parseInt(hour);
    }
  }

  return bestHour;
}

/**
 * Verificar frecuencia de notificaciones (daily vs weekly)
 */
export async function shouldSendBasedOnFrequency(
  userId: string,
  bondId: string,
  notificationType: string,
  frequency: "daily" | "weekly" | "never"
): Promise<boolean> {
  if (frequency === "never") return false;
  if (frequency === "daily") return true;

  // Para weekly, verificar última notificación
  try {
    const lastNotification = await prisma.bondNotification.findFirst({
      where: {
        userId,
        bondId,
        type: notificationType,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!lastNotification) return true;

    // Verificar si han pasado 7 días
    const daysSince = Math.floor(
      (Date.now() - lastNotification.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSince >= 7;
  } catch (error) {
    log.error({ error, userId, bondId }, "Error checking notification frequency");
    return true; // En caso de error, enviar de todos modos
  }
}
