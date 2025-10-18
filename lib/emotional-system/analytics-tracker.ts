/**
 * EMOTIONAL SYSTEM ANALYTICS TRACKER
 *
 * Trackea métricas del sistema emocional híbrido para:
 * - Monitorear performance (Fast vs Deep Path)
 * - Optimizar costos
 * - Detectar problemas (e.g., demasiado Deep Path)
 * - Analytics de uso
 *
 * Métricas trackeadas:
 * - Path usage (fast/deep)
 * - Processing time
 * - Cost per message
 * - Complexity score distribution
 * - Emotional states frequency
 * - Dyads distribution
 *
 * USO:
 * import { analyticsTracker } from "@/lib/emotional-system/analytics-tracker";
 *
 * // Trackear procesamiento
 * analyticsTracker.track({
 *   agentId,
 *   userId,
 *   path: "fast",
 *   processingTimeMs: 50,
 *   costEstimate: 0,
 *   complexityScore: 0.2,
 * });
 *
 * // Obtener stats
 * const stats = await analyticsTracker.getStats(agentId);
 */

import { prisma } from "@/lib/prisma";

export interface AnalyticsEvent {
  agentId: string;
  userId: string;
  path: "fast" | "deep";
  processingTimeMs: number;
  costEstimate: number;
  complexityScore: number;
  primaryEmotion?: string;
  activeDyads?: string[];
  emotionalStability?: number;
  timestamp?: Date;
}

export interface AnalyticsStats {
  totalMessages: number;
  pathDistribution: {
    fast: number;
    deep: number;
    fastPercentage: number;
    deepPercentage: number;
  };
  performance: {
    avgProcessingTimeMs: number;
    avgFastPathTimeMs: number;
    avgDeepPathTimeMs: number;
  };
  costs: {
    totalCost: number;
    avgCostPerMessage: number;
    projectedMonthlyCost: number; // Proyección a 1000 mensajes/mes
  };
  complexity: {
    avgComplexityScore: number;
    distribution: {
      simple: number; // 0-0.3
      moderate: number; // 0.3-0.7
      complex: number; // 0.7-1.0
    };
  };
  emotions: {
    topPrimaryEmotions: Array<{ emotion: string; count: number }>;
    topDyads: Array<{ dyad: string; count: number }>;
    avgEmotionalStability: number;
  };
  period: {
    start: Date;
    end: Date;
    daysTracked: number;
  };
}

/**
 * Estructura para almacenar eventos en memoria antes de flush a DB
 */
interface InMemoryEvent extends AnalyticsEvent {
  timestamp: Date;
}

export class EmotionalSystemAnalyticsTracker {
  private events: InMemoryEvent[] = [];
  private readonly FLUSH_INTERVAL_MS = 60000; // 1 minuto
  private readonly MAX_EVENTS_IN_MEMORY = 100;
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    // Auto-flush periódico
    this.startAutoFlush();
  }

  /**
   * Trackea un evento de procesamiento emocional
   */
  track(event: AnalyticsEvent): void {
    const timestampedEvent: InMemoryEvent = {
      ...event,
      timestamp: event.timestamp || new Date(),
    };

    this.events.push(timestampedEvent);

    console.log(
      `[Analytics] Tracked ${event.path} path (${event.processingTimeMs}ms, $${event.costEstimate.toFixed(4)})`
    );

    // Flush si alcanzamos el límite
    if (this.events.length >= this.MAX_EVENTS_IN_MEMORY) {
      this.flush();
    }
  }

  /**
   * Flush eventos a la base de datos
   */
  async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      // Guardar en tabla de analytics
      // (Asumiendo que existe una tabla `EmotionalAnalytics`)
      await prisma.$executeRaw`
        INSERT INTO "EmotionalAnalytics" (
          "agentId",
          "userId",
          "path",
          "processingTimeMs",
          "costEstimate",
          "complexityScore",
          "primaryEmotion",
          "activeDyads",
          "emotionalStability",
          "timestamp"
        )
        VALUES ${eventsToFlush.map((e) => ({
          agentId: e.agentId,
          userId: e.userId,
          path: e.path,
          processingTimeMs: e.processingTimeMs,
          costEstimate: e.costEstimate,
          complexityScore: e.complexityScore,
          primaryEmotion: e.primaryEmotion || null,
          activeDyads: e.activeDyads || [],
          emotionalStability: e.emotionalStability || null,
          timestamp: e.timestamp,
        }))}
      `;

      console.log(`[Analytics] Flushed ${eventsToFlush.length} events to DB`);
    } catch (error) {
      // Si falla, guardar como JSON en un campo alternativo
      console.error("[Analytics] Error flushing to DB:", error);

      try {
        // Fallback: guardar en InternalState como JSON
        for (const event of eventsToFlush) {
          const internalState = await prisma.internalState.findUnique({
            where: { agentId: event.agentId },
          });

          if (internalState) {
            const existingAnalytics =
              (internalState.metadata as any)?.analytics || [];
            const updatedAnalytics = [
              ...existingAnalytics,
              {
                ...event,
                timestamp: event.timestamp.toISOString(),
              },
            ].slice(-100); // Mantener últimos 100

            await prisma.internalState.update({
              where: { agentId: event.agentId },
              data: {
                metadata: {
                  ...(internalState.metadata as any),
                  analytics: updatedAnalytics,
                },
              },
            });
          }
        }

        console.log(
          `[Analytics] Fallback save successful (${eventsToFlush.length} events)`
        );
      } catch (fallbackError) {
        console.error("[Analytics] Fallback also failed:", fallbackError);
        // Restaurar eventos a memoria para no perderlos
        this.events = [...eventsToFlush, ...this.events];
      }
    }
  }

  /**
   * Obtiene estadísticas del sistema emocional
   */
  async getStats(
    agentId: string,
    daysBack: number = 30
  ): Promise<AnalyticsStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Intentar obtener de tabla dedicada primero
    let events: InMemoryEvent[] = [];

    try {
      // Si existe tabla EmotionalAnalytics
      const dbEvents = await prisma.$queryRaw<any[]>`
        SELECT * FROM "EmotionalAnalytics"
        WHERE "agentId" = ${agentId}
          AND "timestamp" >= ${startDate}
        ORDER BY "timestamp" DESC
      `;

      events = dbEvents.map((e) => ({
        agentId: e.agentId,
        userId: e.userId,
        path: e.path,
        processingTimeMs: e.processingTimeMs,
        costEstimate: e.costEstimate,
        complexityScore: e.complexityScore,
        primaryEmotion: e.primaryEmotion,
        activeDyads: e.activeDyads,
        emotionalStability: e.emotionalStability,
        timestamp: new Date(e.timestamp),
      }));
    } catch (error) {
      // Fallback: leer de InternalState
      console.log("[Analytics] Using fallback storage");

      const internalState = await prisma.internalState.findUnique({
        where: { agentId },
      });

      if (internalState && (internalState.metadata as any)?.analytics) {
        const storedEvents = (internalState.metadata as any).analytics;
        events = storedEvents
          .map((e: any) => ({
            ...e,
            timestamp: new Date(e.timestamp),
          }))
          .filter(
            (e: InMemoryEvent) => e.timestamp >= startDate
          ) as InMemoryEvent[];
      }
    }

    // Agregar eventos en memoria
    const inMemoryForAgent = this.events.filter((e) => e.agentId === agentId);
    events = [...events, ...inMemoryForAgent];

    // Calcular estadísticas
    return this.calculateStats(events, startDate, new Date());
  }

  /**
   * Calcula estadísticas a partir de eventos
   */
  private calculateStats(
    events: InMemoryEvent[],
    startDate: Date,
    endDate: Date
  ): AnalyticsStats {
    if (events.length === 0) {
      return this.getEmptyStats(startDate, endDate);
    }

    // Path distribution
    const fastPathEvents = events.filter((e) => e.path === "fast");
    const deepPathEvents = events.filter((e) => e.path === "deep");

    const pathDistribution = {
      fast: fastPathEvents.length,
      deep: deepPathEvents.length,
      fastPercentage: (fastPathEvents.length / events.length) * 100,
      deepPercentage: (deepPathEvents.length / events.length) * 100,
    };

    // Performance
    const avgProcessingTimeMs =
      events.reduce((sum, e) => sum + e.processingTimeMs, 0) / events.length;
    const avgFastPathTimeMs =
      fastPathEvents.length > 0
        ? fastPathEvents.reduce((sum, e) => sum + e.processingTimeMs, 0) /
          fastPathEvents.length
        : 0;
    const avgDeepPathTimeMs =
      deepPathEvents.length > 0
        ? deepPathEvents.reduce((sum, e) => sum + e.processingTimeMs, 0) /
          deepPathEvents.length
        : 0;

    const performance = {
      avgProcessingTimeMs,
      avgFastPathTimeMs,
      avgDeepPathTimeMs,
    };

    // Costs
    const totalCost = events.reduce((sum, e) => sum + e.costEstimate, 0);
    const avgCostPerMessage = totalCost / events.length;
    const projectedMonthlyCost = avgCostPerMessage * 1000; // 1000 mensajes/mes

    const costs = {
      totalCost,
      avgCostPerMessage,
      projectedMonthlyCost,
    };

    // Complexity
    const avgComplexityScore =
      events.reduce((sum, e) => sum + e.complexityScore, 0) / events.length;
    const simple = events.filter((e) => e.complexityScore < 0.3).length;
    const moderate = events.filter(
      (e) => e.complexityScore >= 0.3 && e.complexityScore < 0.7
    ).length;
    const complex = events.filter((e) => e.complexityScore >= 0.7).length;

    const complexity = {
      avgComplexityScore,
      distribution: { simple, moderate, complex },
    };

    // Emotions
    const emotionCounts: Record<string, number> = {};
    const dyadCounts: Record<string, number> = {};
    let totalStability = 0;
    let stabilityCount = 0;

    for (const event of events) {
      if (event.primaryEmotion) {
        emotionCounts[event.primaryEmotion] =
          (emotionCounts[event.primaryEmotion] || 0) + 1;
      }

      if (event.activeDyads) {
        for (const dyad of event.activeDyads) {
          dyadCounts[dyad] = (dyadCounts[dyad] || 0) + 1;
        }
      }

      if (event.emotionalStability !== undefined) {
        totalStability += event.emotionalStability;
        stabilityCount++;
      }
    }

    const topPrimaryEmotions = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topDyads = Object.entries(dyadCounts)
      .map(([dyad, count]) => ({ dyad, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const avgEmotionalStability =
      stabilityCount > 0 ? totalStability / stabilityCount : 0.5;

    const emotions = {
      topPrimaryEmotions,
      topDyads,
      avgEmotionalStability,
    };

    // Period
    const daysTracked = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      totalMessages: events.length,
      pathDistribution,
      performance,
      costs,
      complexity,
      emotions,
      period: {
        start: startDate,
        end: endDate,
        daysTracked,
      },
    };
  }

  /**
   * Stats vacíos
   */
  private getEmptyStats(startDate: Date, endDate: Date): AnalyticsStats {
    return {
      totalMessages: 0,
      pathDistribution: {
        fast: 0,
        deep: 0,
        fastPercentage: 0,
        deepPercentage: 0,
      },
      performance: {
        avgProcessingTimeMs: 0,
        avgFastPathTimeMs: 0,
        avgDeepPathTimeMs: 0,
      },
      costs: {
        totalCost: 0,
        avgCostPerMessage: 0,
        projectedMonthlyCost: 0,
      },
      complexity: {
        avgComplexityScore: 0,
        distribution: { simple: 0, moderate: 0, complex: 0 },
      },
      emotions: {
        topPrimaryEmotions: [],
        topDyads: [],
        avgEmotionalStability: 0.5,
      },
      period: {
        start: startDate,
        end: endDate,
        daysTracked: Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ),
      },
    };
  }

  /**
   * Auto-flush periódico
   */
  private startAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL_MS);
  }

  /**
   * Detener auto-flush (cleanup)
   */
  stopAutoFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
  }

  /**
   * API conveniente: Genera reporte textual
   */
  async generateReport(agentId: string, daysBack: number = 30): Promise<string> {
    const stats = await this.getStats(agentId, daysBack);

    if (stats.totalMessages === 0) {
      return `No hay datos de analytics para los últimos ${daysBack} días.`;
    }

    return `
📊 REPORTE DE ANALYTICS - Sistema Emocional Híbrido
══════════════════════════════════════════════════════

Período: ${stats.period.start.toLocaleDateString()} - ${stats.period.end.toLocaleDateString()} (${stats.period.daysTracked} días)
Total mensajes: ${stats.totalMessages}

🛤️  PATH DISTRIBUTION
  Fast Path: ${stats.pathDistribution.fast} (${stats.pathDistribution.fastPercentage.toFixed(1)}%)
  Deep Path: ${stats.pathDistribution.deep} (${stats.pathDistribution.deepPercentage.toFixed(1)}%)

⚡ PERFORMANCE
  Tiempo promedio: ${stats.performance.avgProcessingTimeMs.toFixed(0)}ms
  Fast Path promedio: ${stats.performance.avgFastPathTimeMs.toFixed(0)}ms
  Deep Path promedio: ${stats.performance.avgDeepPathTimeMs.toFixed(0)}ms

💰 COSTOS
  Costo total: $${stats.costs.totalCost.toFixed(4)}
  Costo promedio/mensaje: $${stats.costs.avgCostPerMessage.toFixed(6)}
  Proyección mensual (1000 msgs): $${stats.costs.projectedMonthlyCost.toFixed(2)}

📈 COMPLEJIDAD
  Score promedio: ${stats.complexity.avgComplexityScore.toFixed(2)}
  Distribución:
    - Simple (0-0.3): ${stats.complexity.distribution.simple}
    - Moderada (0.3-0.7): ${stats.complexity.distribution.moderate}
    - Compleja (0.7-1.0): ${stats.complexity.distribution.complex}

🎭 EMOCIONES
  Estabilidad emocional promedio: ${(stats.emotions.avgEmotionalStability * 100).toFixed(0)}%

  Top emociones primarias:
${stats.emotions.topPrimaryEmotions.map((e) => `    - ${e.emotion}: ${e.count}`).join("\n")}

  Top dyads:
${stats.emotions.topDyads.map((d) => `    - ${d.dyad}: ${d.count}`).join("\n")}
    `.trim();
  }
}

/**
 * Singleton instance
 */
export const analyticsTracker = new EmotionalSystemAnalyticsTracker();

// Cleanup on exit
process.on("beforeExit", () => {
  analyticsTracker.flush();
  analyticsTracker.stopAutoFlush();
});
