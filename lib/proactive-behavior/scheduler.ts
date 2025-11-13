/**
 * PROACTIVE SCHEDULER - Sistema de scheduling inteligente
 *
 * Determina CUÁNDO enviar mensajes proactivos:
 * - Respetar timezone del usuario
 * - Horarios apropiados (9am-10pm)
 * - No enviar si usuario está activo
 * - Cooldown entre mensajes
 * - Días de semana vs fin de semana
 */

import { prisma } from '@/lib/prisma';

export interface SchedulingResult {
  shouldSend: boolean;
  reason: string;
  suggestedTime?: Date; // Cuándo enviar si no es ahora
}

/**
 * Horarios permitidos (hora local del usuario)
 */
const ALLOWED_HOURS = {
  weekday: { start: 9, end: 22 }, // 9am - 10pm
  weekend: { start: 10, end: 23 }, // 10am - 11pm
};

/**
 * Cooldown mínimo entre mensajes proactivos
 */
const MIN_COOLDOWN_HOURS = 12;

/**
 * Cooldown si usuario no respondió al último mensaje proactivo
 */
const NO_RESPONSE_COOLDOWN_HOURS = 24;

/**
 * Horarios "óptimos" para mejor engagement
 */
const OPTIMAL_HOURS = [9, 10, 12, 18, 19, 20];

export class ProactiveScheduler {
  /**
   * Evalúa si debe enviar mensaje proactivo AHORA
   */
  async shouldSendNow(
    agentId: string,
    userId: string,
    userTimezone?: string
  ): Promise<SchedulingResult> {
    // 1. Verificar cooldown global
    const cooldownCheck = await this.checkCooldown(agentId, userId);
    if (!cooldownCheck.canSend) {
      return {
        shouldSend: false,
        reason: cooldownCheck.reason,
        suggestedTime: cooldownCheck.suggestedTime,
      };
    }

    // 2. Verificar si usuario está activo ahora
    const isActive = await this.isUserCurrentlyActive(agentId, userId);
    if (isActive) {
      return {
        shouldSend: false,
        reason: 'Usuario está activo en este momento',
        suggestedTime: this.getNextOptimalTime(1, userTimezone), // Intentar en 1 hora
      };
    }

    // 3. Verificar horario apropiado
    const timeCheck = this.isAppropriateTime(userTimezone);
    if (!timeCheck.isAppropriate) {
      return {
        shouldSend: false,
        reason: timeCheck.reason,
        suggestedTime: timeCheck.suggestedTime,
      };
    }

    // Todo OK - puede enviar
    return {
      shouldSend: true,
      reason: 'Momento apropiado para mensaje proactivo',
    };
  }

  /**
   * Verifica cooldown desde último mensaje proactivo
   */
  private async checkCooldown(
    agentId: string,
    userId: string
  ): Promise<{
    canSend: boolean;
    reason: string;
    suggestedTime?: Date;
  }> {
    // Buscar último mensaje proactivo
    const lastProactive = await prisma.message.findFirst({
      where: {
        agentId,
        role: 'assistant',
        metadata: {
          path: ['proactive'],
          equals: true,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastProactive) {
      return { canSend: true, reason: 'Sin mensajes proactivos previos' };
    }

    const hoursSince =
      (Date.now() - lastProactive.createdAt.getTime()) / (1000 * 60 * 60);

    // Verificar si usuario respondió al último mensaje proactivo
    const userRespondedAfter = await prisma.message.findFirst({
      where: {
        agentId,
        userId,
        role: 'user',
        createdAt: { gt: lastProactive.createdAt },
      },
    });

    const requiredCooldown = userRespondedAfter
      ? MIN_COOLDOWN_HOURS
      : NO_RESPONSE_COOLDOWN_HOURS;

    if (hoursSince < requiredCooldown) {
      const hoursRemaining = requiredCooldown - hoursSince;
      const suggestedTime = new Date(
        Date.now() + hoursRemaining * 60 * 60 * 1000
      );

      return {
        canSend: false,
        reason: `Cooldown activo (${hoursRemaining.toFixed(1)}h restantes)`,
        suggestedTime,
      };
    }

    return { canSend: true, reason: 'Cooldown expirado' };
  }

  /**
   * Verifica si usuario está activo ahora (envió mensaje en últimos 10 min)
   */
  private async isUserCurrentlyActive(
    agentId: string,
    userId: string
  ): Promise<boolean> {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const recentMessage = await prisma.message.findFirst({
      where: {
        agentId,
        userId,
        role: 'user',
        createdAt: { gte: tenMinutesAgo },
      },
    });

    return !!recentMessage;
  }

  /**
   * Verifica si es un horario apropiado según timezone
   */
  private isAppropriateTime(
    userTimezone?: string
  ): {
    isAppropriate: boolean;
    reason: string;
    suggestedTime?: Date;
  } {
    // Obtener hora local del usuario
    const now = new Date();
    let userHour = now.getHours();

    // Si tenemos timezone, calcular hora local
    if (userTimezone) {
      try {
        const userTime = new Date(
          now.toLocaleString('en-US', { timeZone: userTimezone })
        );
        userHour = userTime.getHours();
      } catch (e) {
        console.warn(`Invalid timezone: ${userTimezone}`);
      }
    }

    // Determinar si es fin de semana
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const hours = isWeekend ? ALLOWED_HOURS.weekend : ALLOWED_HOURS.weekday;

    // Verificar si está en horario permitido
    if (userHour < hours.start || userHour >= hours.end) {
      // Calcular próximo horario permitido
      const suggestedTime = this.getNextAllowedTime(userHour, hours.start);

      return {
        isAppropriate: false,
        reason: `Fuera de horario (hora local: ${userHour}:00)`,
        suggestedTime,
      };
    }

    return {
      isAppropriate: true,
      reason: `Horario apropiado (${userHour}:00)`,
    };
  }

  /**
   * Calcula próximo horario permitido
   */
  private getNextAllowedTime(currentHour: number, startHour: number): Date {
    const now = new Date();

    // Si ya pasó el horario de hoy, programar para mañana
    if (currentHour >= ALLOWED_HOURS.weekday.end) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(startHour, 0, 0, 0);
      return tomorrow;
    }

    // Programar para el horario de inicio de hoy
    const today = new Date(now);
    today.setHours(startHour, 0, 0, 0);
    return today;
  }

  /**
   * Obtiene próximo momento "óptimo" (horarios de mejor engagement)
   */
  private getNextOptimalTime(
    minHoursFromNow: number,
    userTimezone?: string
  ): Date {
    const now = new Date();
    let currentHour = now.getHours();

    if (userTimezone) {
      try {
        const userTime = new Date(
          now.toLocaleString('en-US', { timeZone: userTimezone })
        );
        currentHour = userTime.getHours();
      } catch (e) {
        console.warn(`Invalid timezone: ${userTimezone}`);
      }
    }

    // Encontrar próximo horario óptimo
    const futureHour = currentHour + minHoursFromNow;

    for (const optimalHour of OPTIMAL_HOURS) {
      if (optimalHour >= futureHour && optimalHour < ALLOWED_HOURS.weekday.end) {
        const suggestedTime = new Date(now);
        suggestedTime.setHours(optimalHour, 0, 0, 0);
        return suggestedTime;
      }
    }

    // Si no hay horario óptimo hoy, usar mañana a las 9am
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(OPTIMAL_HOURS[0], 0, 0, 0);
    return tomorrow;
  }

  /**
   * Calcula mejor momento para enviar mensaje en las próximas 24h
   */
  async getBestSendTime(
    agentId: string,
    userId: string,
    userTimezone?: string
  ): Promise<Date> {
    // Verificar cooldown
    const cooldownCheck = await this.checkCooldown(agentId, userId);
    if (!cooldownCheck.canSend && cooldownCheck.suggestedTime) {
      return cooldownCheck.suggestedTime;
    }

    // Buscar horario óptimo
    const now = new Date();
    let bestTime = now;

    // Analizar actividad histórica del usuario para encontrar su horario más activo
    const hourlyActivity = await this.getUserHourlyActivity(agentId, userId);

    if (hourlyActivity.length > 0) {
      // Obtener hora más activa
      const mostActiveHour = hourlyActivity[0].hour;

      // Programar para esa hora
      bestTime = new Date(now);
      bestTime.setHours(mostActiveHour, 0, 0, 0);

      // Si ya pasó esa hora hoy, programar para mañana
      if (bestTime <= now) {
        bestTime.setDate(bestTime.getDate() + 1);
      }
    } else {
      // Sin datos históricos, usar horario óptimo genérico
      bestTime = this.getNextOptimalTime(1, userTimezone);
    }

    return bestTime;
  }

  /**
   * Analiza actividad por hora del usuario
   */
  private async getUserHourlyActivity(
    agentId: string,
    userId: string
  ): Promise<Array<{ hour: number; count: number }>> {
    // Obtener mensajes del usuario en últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const messages = await prisma.message.findMany({
      where: {
        agentId,
        userId,
        role: 'user',
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
    });

    // Agrupar por hora
    const hourCounts: Record<number, number> = {};
    for (const msg of messages) {
      const hour = msg.createdAt.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }

    // Convertir a array y ordenar por count
    const hourlyActivity = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count);

    // Filtrar solo horarios permitidos
    return hourlyActivity.filter(
      (h) => h.hour >= ALLOWED_HOURS.weekday.start && h.hour < ALLOWED_HOURS.weekday.end
    );
  }
}

/**
 * Singleton instance
 */
export const proactiveScheduler = new ProactiveScheduler();
