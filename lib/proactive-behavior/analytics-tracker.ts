/**
 * PROACTIVE ANALYTICS TRACKER - Sistema de tracking de engagement
 *
 * Trackea métricas de mensajes proactivos:
 * - Cuántos se envían
 * - Cuántos reciben respuesta
 * - Tiempo promedio de respuesta
 * - Qué tipos funcionan mejor
 * - A/B testing de templates
 */

import { prisma } from '@/lib/prisma';
import type { TriggerType } from './trigger-detector';
import type { MessageType } from '@/lib/proactive/message-generator';

export interface ProactiveMetrics {
  // Métricas generales
  totalSent: number;
  totalResponded: number;
  responseRate: number; // %

  // Por tipo de mensaje
  byType: Record<
    string,
    {
      sent: number;
      responded: number;
      responseRate: number;
      avgResponseTimeMinutes: number;
    }
  >;

  // Timing
  avgResponseTimeMinutes: number;
  fastestResponseMinutes: number;
  slowestResponseMinutes: number;

  // Engagement por hora
  byHour: Record<number, { sent: number; responded: number }>;

  // Tendencias
  lastWeekTrend: 'up' | 'down' | 'stable';
}

export class ProactiveAnalyticsTracker {
  /**
   * Obtiene métricas completas de mensajes proactivos
   */
  async getMetrics(
    agentId: string,
    userId?: string,
    days: number = 30
  ): Promise<ProactiveMetrics> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Obtener todos los mensajes proactivos
    const proactiveMessages = await prisma.message.findMany({
      where: {
        agentId,
        ...(userId ? { userId } : {}),
        role: 'assistant',
        createdAt: { gte: startDate },
        metadata: {
          path: ['proactive'],
          equals: true,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (proactiveMessages.length === 0) {
      return this.getEmptyMetrics();
    }

    // Analizar cada mensaje proactivo
    const analysis = await Promise.all(
      proactiveMessages.map((msg) => this.analyzeProactiveMessage(msg))
    );

    // Agregar métricas
    const totalSent = proactiveMessages.length;
    const totalResponded = analysis.filter((a) => a.wasResponded).length;
    const responseRate = (totalResponded / totalSent) * 100;

    // Por tipo
    const byType: ProactiveMetrics['byType'] = {};
    for (const msg of proactiveMessages) {
      const metadata = msg.metadata as any;
      const type = metadata.triggerType as string;

      if (!byType[type]) {
        byType[type] = {
          sent: 0,
          responded: 0,
          responseRate: 0,
          avgResponseTimeMinutes: 0,
        };
      }

      byType[type].sent++;
    }

    // Calcular response rate y avg time por tipo
    for (const [type, data] of Object.entries(byType)) {
      const typeMessages = proactiveMessages.filter(
        (m) => (m.metadata as any).triggerType === type
      );
      const typeAnalysis = await Promise.all(
        typeMessages.map((m) => this.analyzeProactiveMessage(m))
      );

      data.responded = typeAnalysis.filter((a) => a.wasResponded).length;
      data.responseRate = (data.responded / data.sent) * 100;

      const responseTimes = typeAnalysis
        .filter((a) => a.responseTimeMinutes !== null)
        .map((a) => a.responseTimeMinutes!);

      data.avgResponseTimeMinutes =
        responseTimes.length > 0
          ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
          : 0;
    }

    // Tiempos de respuesta globales
    const responseTimes = analysis
      .filter((a) => a.responseTimeMinutes !== null)
      .map((a) => a.responseTimeMinutes!);

    const avgResponseTimeMinutes =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
        : 0;

    const fastestResponseMinutes =
      responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
    const slowestResponseMinutes =
      responseTimes.length > 0 ? Math.max(...responseTimes) : 0;

    // Por hora
    const byHour: ProactiveMetrics['byHour'] = {};
    for (let h = 0; h < 24; h++) {
      byHour[h] = { sent: 0, responded: 0 };
    }

    for (let i = 0; i < proactiveMessages.length; i++) {
      const msg = proactiveMessages[i];
      const hour = msg.createdAt.getHours();
      byHour[hour].sent++;

      if (analysis[i].wasResponded) {
        byHour[hour].responded++;
      }
    }

    // Tendencia última semana vs anterior
    const lastWeekTrend = await this.calculateTrend(agentId, userId);

    return {
      totalSent,
      totalResponded,
      responseRate,
      byType,
      avgResponseTimeMinutes,
      fastestResponseMinutes,
      slowestResponseMinutes,
      byHour,
      lastWeekTrend,
    };
  }

  /**
   * Analiza un mensaje proactivo específico
   */
  private async analyzeProactiveMessage(message: any): Promise<{
    wasResponded: boolean;
    responseTimeMinutes: number | null;
  }> {
    // Buscar si usuario respondió después de este mensaje
    const userResponse = await prisma.message.findFirst({
      where: {
        agentId: message.agentId,
        userId: message.userId,
        role: 'user',
        createdAt: { gt: message.createdAt },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!userResponse) {
      return { wasResponded: false, responseTimeMinutes: null };
    }

    // Verificar que no sea demasiado tarde (máximo 48h después)
    const hoursSince =
      (userResponse.createdAt.getTime() - message.createdAt.getTime()) /
      (1000 * 60 * 60);

    if (hoursSince > 48) {
      return { wasResponded: false, responseTimeMinutes: null };
    }

    const responseTimeMinutes = Math.floor(hoursSince * 60);

    return { wasResponded: true, responseTimeMinutes };
  }

  /**
   * Calcula tendencia comparando última semana con anterior
   */
  private async calculateTrend(
    agentId: string,
    userId?: string
  ): Promise<'up' | 'down' | 'stable'> {
    const now = new Date();

    // Última semana
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    // Semana anterior
    const prevWeekStart = new Date(now);
    prevWeekStart.setDate(prevWeekStart.getDate() - 14);
    const prevWeekEnd = new Date(lastWeekStart);

    // Contar mensajes proactivos
    const lastWeekCount = await prisma.message.count({
      where: {
        agentId,
        ...(userId ? { userId } : {}),
        role: 'assistant',
        createdAt: { gte: lastWeekStart },
        metadata: {
          path: ['proactive'],
          equals: true,
        },
      },
    });

    const prevWeekCount = await prisma.message.count({
      where: {
        agentId,
        ...(userId ? { userId } : {}),
        role: 'assistant',
        createdAt: { gte: prevWeekStart, lt: prevWeekEnd },
        metadata: {
          path: ['proactive'],
          equals: true,
        },
      },
    });

    if (lastWeekCount > prevWeekCount * 1.1) return 'up';
    if (lastWeekCount < prevWeekCount * 0.9) return 'down';
    return 'stable';
  }

  /**
   * Obtiene métricas vacías
   */
  private getEmptyMetrics(): ProactiveMetrics {
    const byHour: ProactiveMetrics['byHour'] = {};
    for (let h = 0; h < 24; h++) {
      byHour[h] = { sent: 0, responded: 0 };
    }

    return {
      totalSent: 0,
      totalResponded: 0,
      responseRate: 0,
      byType: {},
      avgResponseTimeMinutes: 0,
      fastestResponseMinutes: 0,
      slowestResponseMinutes: 0,
      byHour,
      lastWeekTrend: 'stable',
    };
  }

  /**
   * Registra evento de mensaje proactivo enviado
   */
  async trackSent(
    agentId: string,
    userId: string,
    triggerType: TriggerType,
    messageType: MessageType
  ): Promise<void> {
    // Ya se trackea en message-generator.ts
    // Este método es por si se necesita tracking adicional
    console.log('[ProactiveAnalytics] Message sent:', {
      agentId,
      userId,
      triggerType,
      messageType,
    });
  }

  /**
   * Genera reporte de performance
   */
  async generateReport(
    agentId: string,
    userId?: string,
    days: number = 30
  ): Promise<string> {
    const metrics = await this.getMetrics(agentId, userId, days);

    let report = `# Reporte de Mensajes Proactivos (últimos ${days} días)\n\n`;

    report += `## Resumen General\n`;
    report += `- Total enviados: ${metrics.totalSent}\n`;
    report += `- Total con respuesta: ${metrics.totalResponded}\n`;
    report += `- Tasa de respuesta: ${metrics.responseRate.toFixed(1)}%\n`;
    report += `- Tiempo promedio de respuesta: ${metrics.avgResponseTimeMinutes.toFixed(0)} minutos\n`;
    report += `- Tendencia: ${metrics.lastWeekTrend === 'up' ? '📈 Al alza' : metrics.lastWeekTrend === 'down' ? '📉 A la baja' : '➡️ Estable'}\n\n`;

    report += `## Performance por Tipo\n`;
    const sortedTypes = Object.entries(metrics.byType).sort(
      (a, b) => b[1].responseRate - a[1].responseRate
    );

    for (const [type, data] of sortedTypes) {
      report += `\n### ${type}\n`;
      report += `- Enviados: ${data.sent}\n`;
      report += `- Con respuesta: ${data.responded}\n`;
      report += `- Tasa de respuesta: ${data.responseRate.toFixed(1)}%\n`;
      report += `- Tiempo promedio: ${data.avgResponseTimeMinutes.toFixed(0)} min\n`;
    }

    report += `\n## Mejores Horarios\n`;
    const hoursByResponseRate = Object.entries(metrics.byHour)
      .filter(([_, data]) => data.sent > 0)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        responseRate: (data.responded / data.sent) * 100,
        sent: data.sent,
      }))
      .sort((a, b) => b.responseRate - a.responseRate)
      .slice(0, 5);

    for (const { hour, responseRate, sent } of hoursByResponseRate) {
      report += `- ${hour}:00 - ${responseRate.toFixed(1)}% (${sent} enviados)\n`;
    }

    return report;
  }

  /**
   * Obtiene insights accionables
   */
  async getInsights(
    agentId: string,
    userId?: string
  ): Promise<Array<{ type: 'success' | 'warning' | 'info'; message: string }>> {
    const metrics = await this.getMetrics(agentId, userId, 30);
    const insights: Array<{ type: 'success' | 'warning' | 'info'; message: string }> =
      [];

    // Insight: Tasa de respuesta
    if (metrics.responseRate >= 70) {
      insights.push({
        type: 'success',
        message: `¡Excelente engagement! ${metrics.responseRate.toFixed(1)}% de tus mensajes proactivos reciben respuesta.`,
      });
    } else if (metrics.responseRate < 40) {
      insights.push({
        type: 'warning',
        message: `Baja tasa de respuesta (${metrics.responseRate.toFixed(1)}%). Considera ajustar el timing o el contenido de los mensajes.`,
      });
    }

    // Insight: Mejor tipo
    const sortedTypes = Object.entries(metrics.byType).sort(
      (a, b) => b[1].responseRate - a[1].responseRate
    );

    if (sortedTypes.length > 0) {
      const bestType = sortedTypes[0];
      if (bestType[1].responseRate > 60) {
        insights.push({
          type: 'info',
          message: `Los mensajes de tipo "${bestType[0]}" tienen mejor performance (${bestType[1].responseRate.toFixed(1)}%). Considera usarlos más.`,
        });
      }
    }

    // Insight: Tendencia
    if (metrics.lastWeekTrend === 'down') {
      insights.push({
        type: 'warning',
        message: 'El engagement está bajando en la última semana. Revisa la estrategia.',
      });
    }

    // Insight: Tiempo de respuesta
    if (metrics.avgResponseTimeMinutes < 30) {
      insights.push({
        type: 'success',
        message: 'Los usuarios responden rápido (promedio: < 30 min). El timing es bueno.',
      });
    }

    return insights;
  }
}

/**
 * Singleton instance
 */
export const proactiveAnalyticsTracker = new ProactiveAnalyticsTracker();
