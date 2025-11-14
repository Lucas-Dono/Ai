/**
 * Emergent Events Job - Genera eventos emergentes periódicos
 *
 * SCHEDULE: Cada 30 minutos
 *
 * RESPONSABILIDADES:
 * - Generar eventos emergentes para mundos activos en story mode
 * - Evaluar narrativa y crear eventos apropiados
 * - Mantener las historias frescas e interesantes
 * - No sobrecargar con demasiados eventos
 *
 * MÉTRICAS:
 * - Mundos evaluados
 * - Eventos generados
 * - Eventos aplicados
 * - Errores
 */

import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';
import { getEmergentEventsGenerator } from '../emergent-events';
import { getNarrativeAnalyzer, type InteractionForAnalysis } from '../narrative-analyzer';

const log = createLogger('EmergentEventsJob');

export interface EmergentEventsJobMetrics {
  worldsEvaluated: number;
  eventsGenerated: number;
  eventsApplied: number;
  worldsSkipped: number;
  errors: number;
  executionTimeMs: number;
}

export class EmergentEventsJob {
  private isRunning = false;
  private lastMetrics: EmergentEventsJobMetrics | null = null;
  private consecutiveFailures = 0;
  private readonly MAX_CONSECUTIVE_FAILURES = 3;
  private readonly MAX_EXECUTION_TIME = 5 * 60 * 1000; // 5 minutos

  /**
   * Ejecuta el job de eventos emergentes
   */
  async execute(): Promise<EmergentEventsJobMetrics> {
    if (this.isRunning) {
      log.warn('Emergent events job already running, skipping');
      return this.lastMetrics || this.getEmptyMetrics();
    }

    this.isRunning = true;
    const startTime = Date.now();

    const metrics: EmergentEventsJobMetrics = {
      worldsEvaluated: 0,
      eventsGenerated: 0,
      eventsApplied: 0,
      worldsSkipped: 0,
      errors: 0,
      executionTimeMs: 0,
    };

    try {
      log.info('✨ Starting emergent events job...');

      // Encontrar mundos activos en story mode
      const activeStoryWorlds = await this.findActiveStoryWorlds();

      log.info({ count: activeStoryWorlds.length }, 'Found active story worlds');

      for (const world of activeStoryWorlds) {
        // Verificar timeout
        if (Date.now() - startTime > this.MAX_EXECUTION_TIME) {
          log.warn({ processed: metrics.worldsEvaluated }, 'Job timeout, stopping');
          break;
        }

        metrics.worldsEvaluated++;

        try {
          const eventGenerated = await this.evaluateAndGenerateEvent(world);

          if (eventGenerated) {
            metrics.eventsGenerated++;
            metrics.eventsApplied++;
          } else {
            metrics.worldsSkipped++;
          }
        } catch (error) {
          log.error({ error, worldId: world.id }, 'Error generating event for world');
          metrics.errors++;
        }
      }

      metrics.executionTimeMs = Date.now() - startTime;

      log.info(
        {
          evaluated: metrics.worldsEvaluated,
          generated: metrics.eventsGenerated,
          skipped: metrics.worldsSkipped,
          duration: metrics.executionTimeMs + 'ms',
        },
        '✅ Emergent events job completed'
      );

      this.consecutiveFailures = 0;
      this.lastMetrics = metrics;
      return metrics;
    } catch (error) {
      metrics.errors++;
      metrics.executionTimeMs = Date.now() - startTime;

      log.error({ error, metrics }, '❌ Emergent events job failed');

      this.consecutiveFailures++;
      if (this.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
        log.error(
          { consecutiveFailures: this.consecutiveFailures },
          '🚨 ALERT: Emergent events job failed 3 times consecutively!'
        );
        // TODO: Enviar alerta
      }

      this.lastMetrics = metrics;
      return metrics;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Encuentra mundos activos en story mode
   */
  private async findActiveStoryWorlds(): Promise<any[]> {
    // Mundos que:
    // 1. Están en RUNNING
    // 2. Tienen storyMode = true
    // 3. No tienen evento emergente activo (o ya expiró)
    // 4. Tienen interacciones recientes (últimas 2 horas)

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const worlds = await prisma.world.findMany({
      where: {
        status: 'RUNNING',
        storyMode: true,
        simulationState: {
          lastUpdated: {
            gte: twoHoursAgo,
          },
        },
      },
      include: {
        simulationState: true,
        worldAgents: {
          where: { isActive: true },
          include: { agent: true },
        },
      },
    });

    // Filtrar mundos que ya tienen evento emergente activo reciente
    const filtered = worlds.filter(world => {
      const event = world.currentEmergentEvent as any;
      if (!event) return true; // No tiene evento, incluir

      // Verificar si el evento expiró (más de 3 turnos)
      const eventTurn = event.turnTriggered || 0;
      const currentTurn = world.simulationState?.totalInteractions || 0;
      const turnsSinceEvent = currentTurn - eventTurn;

      return turnsSinceEvent >= 3; // Evento ya expiró, puede generar nuevo
    });

    return filtered;
  }

  /**
   * Evalúa y genera evento emergente para un mundo
   */
  private async evaluateAndGenerateEvent(world: any): Promise<boolean> {
    const worldId = world.id;

    try {
      // Obtener interacciones recientes para análisis
      const recentInteractions = await prisma.worldInteraction.findMany({
        where: { worldId },
        orderBy: { turn: 'desc' },
        take: 20,
        include: {
          speaker: {
            select: { name: true },
          },
        },
      });

      if (recentInteractions.length < 5) {
        log.debug({ worldId }, 'Not enough interactions for analysis, skipping');
        return false;
      }

      // Preparar para análisis narrativo
      const interactionsForAnalysis: InteractionForAnalysis[] = recentInteractions
        .reverse()
        .map(i => ({
          id: i.id,
          speakerId: i.speakerId,
          speakerName: i.speaker.name,
          content: i.content,
          sentiment: i.sentiment || undefined,
          turn: i.turnNumber,
          emotionalState: i.speakerEmotion as any,
        }));

      // Analizar narrativa
      const analyzer = getNarrativeAnalyzer(worldId);
      const { metrics, warnings } = await analyzer.analyze(interactionsForAnalysis);

      log.debug(
        {
          worldId,
          repetition: metrics.repetitionScore.toFixed(2),
          tension: metrics.dramaticTension.toFixed(2),
          engagement: metrics.engagementScore.toFixed(2),
        },
        'Narrative metrics'
      );

      // Generar evento emergente si es apropiado
      const generator = getEmergentEventsGenerator(worldId);
      const emergentEvent = await generator.evaluateAndGenerate(metrics, warnings);

      if (!emergentEvent) {
        log.debug({ worldId }, 'No emergent event generated (conditions not met)');
        return false;
      }

      // Aplicar evento al mundo
      const currentTurn = world.simulationState?.totalInteractions || 0;
      await generator.applyEvent(emergentEvent, currentTurn);

      log.info(
        {
          worldId,
          worldName: world.name,
          eventType: emergentEvent.template.type,
          eventName: emergentEvent.template.name,
          characters: emergentEvent.involvedCharacters.length,
        },
        '🎪 Emergent event applied'
      );

      return true;
    } catch (error) {
      log.error({ error, worldId }, 'Error evaluating/generating event');
      throw error;
    }
  }

  /**
   * Obtiene métricas vacías
   */
  private getEmptyMetrics(): EmergentEventsJobMetrics {
    return {
      worldsEvaluated: 0,
      eventsGenerated: 0,
      eventsApplied: 0,
      worldsSkipped: 0,
      errors: 0,
      executionTimeMs: 0,
    };
  }

  /**
   * Obtiene las últimas métricas
   */
  getLastMetrics(): EmergentEventsJobMetrics | null {
    return this.lastMetrics;
  }

  /**
   * Verifica si el job está corriendo
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }
}

// Singleton
export const emergentEventsJob = new EmergentEventsJob();
