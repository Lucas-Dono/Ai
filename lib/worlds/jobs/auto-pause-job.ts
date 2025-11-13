/**
 * Auto-pause Job - Pausa mundos abandonados automáticamente
 *
 * SCHEDULE: Cada 6 horas
 *
 * RESPONSABILIDADES:
 * - Detectar mundos sin actividad > 24 horas
 * - Marcar mundos como PAUSED
 * - Liberar recursos de simulación
 * - Notificar a usuarios (opcional)
 *
 * MÉTRICAS:
 * - Mundos pausados
 * - Mundos evaluados
 * - Errores
 * - Tiempo de ejecución
 */

import { worldSimulationEngine } from '../simulation-engine';
import { worldStateManager } from '../world-state-manager';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const log = createLogger('AutoPauseJob');

export interface AutoPauseJobMetrics {
  worldsEvaluated: number;
  worldsPaused: number;
  worldsAlreadyPaused: number;
  errors: number;
  executionTimeMs: number;
}

export class AutoPauseJob {
  private isRunning = false;
  private lastMetrics: AutoPauseJobMetrics | null = null;
  private consecutiveFailures = 0;
  private readonly MAX_CONSECUTIVE_FAILURES = 3;
  private readonly MAX_EXECUTION_TIME = 5 * 60 * 1000; // 5 minutos
  private readonly INACTIVITY_THRESHOLD = 24 * 60 * 60 * 1000; // 24 horas

  /**
   * Ejecuta el job de auto-pause
   */
  async execute(): Promise<AutoPauseJobMetrics> {
    if (this.isRunning) {
      log.warn('Auto-pause job already running, skipping');
      return this.lastMetrics || this.getEmptyMetrics();
    }

    this.isRunning = true;
    const startTime = Date.now();

    const metrics: AutoPauseJobMetrics = {
      worldsEvaluated: 0,
      worldsPaused: 0,
      worldsAlreadyPaused: 0,
      errors: 0,
      executionTimeMs: 0,
    };

    try {
      log.info('⏸️  Starting auto-pause job...');

      // Obtener mundos activos (RUNNING) en DB
      const runningWorlds = await prisma.world.findMany({
        where: {
          status: 'RUNNING',
        },
        include: {
          simulationState: true,
        },
      });

      log.info({ count: runningWorlds.length }, 'Found running worlds');

      for (const world of runningWorlds) {
        // Verificar timeout
        if (Date.now() - startTime > this.MAX_EXECUTION_TIME) {
          log.warn({ processed: metrics.worldsEvaluated }, 'Auto-pause job timeout, stopping');
          break;
        }

        metrics.worldsEvaluated++;

        try {
          const shouldPause = await this.shouldPauseWorld(world);

          if (shouldPause) {
            await this.pauseWorld(world.id);
            metrics.worldsPaused++;

            log.info(
              {
                worldId: world.id,
                worldName: world.name,
                lastActivity: world.simulationState?.lastUpdated,
              },
              'World auto-paused due to inactivity'
            );
          }
        } catch (error) {
          log.error({ error, worldId: world.id }, 'Error evaluating world for auto-pause');
          metrics.errors++;
        }
      }

      metrics.executionTimeMs = Date.now() - startTime;

      log.info(
        {
          evaluated: metrics.worldsEvaluated,
          paused: metrics.worldsPaused,
          duration: metrics.executionTimeMs + 'ms',
        },
        '✅ Auto-pause job completed'
      );

      this.consecutiveFailures = 0;
      this.lastMetrics = metrics;
      return metrics;
    } catch (error) {
      metrics.errors++;
      metrics.executionTimeMs = Date.now() - startTime;

      log.error({ error, metrics }, '❌ Auto-pause job failed');

      this.consecutiveFailures++;
      if (this.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
        log.error(
          { consecutiveFailures: this.consecutiveFailures },
          '🚨 ALERT: Auto-pause job failed 3 times consecutively!'
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
   * Determina si un mundo debe ser pausado
   */
  private async shouldPauseWorld(world: any): Promise<boolean> {
    const now = Date.now();

    // Verificar última actividad en Redis primero
    const lastActivityRedis = await worldStateManager.getLastActivity(world.id);
    if (lastActivityRedis) {
      const inactiveTime = now - lastActivityRedis.getTime();
      if (inactiveTime < this.INACTIVITY_THRESHOLD) {
        return false; // Activo en Redis, no pausar
      }
    }

    // Verificar última actividad en DB
    const lastUpdatedDB = world.simulationState?.lastUpdated;
    if (lastUpdatedDB) {
      const inactiveTime = now - new Date(lastUpdatedDB).getTime();
      if (inactiveTime < this.INACTIVITY_THRESHOLD) {
        return false; // Activo en DB, no pausar
      }
    }

    // Si hay un intervalo activo en el simulation engine, no pausar
    const isSimulationActive = worldSimulationEngine.isSimulationRunning(world.id);
    if (isSimulationActive) {
      log.debug(
        { worldId: world.id },
        'World has active simulation, not pausing despite inactivity'
      );
      return false;
    }

    // Mundo inactivo > 24h, pausar
    return true;
  }

  /**
   * Pausa un mundo
   */
  private async pauseWorld(worldId: string): Promise<void> {
    try {
      // Pausar simulación si está corriendo
      const isRunning = worldSimulationEngine.isSimulationRunning(worldId);
      if (isRunning) {
        await worldSimulationEngine.pauseSimulation(worldId);
      }

      // Actualizar estado en DB (por si acaso no se actualizó)
      await prisma.world.update({
        where: { id: worldId },
        data: {
          status: 'PAUSED',
          updatedAt: new Date(),
        },
      });

      // Actualizar SimulationState
      await prisma.worldSimulationState.updateMany({
        where: { worldId },
        data: {
          pausedAt: new Date(),
        },
      });

      // Limpiar estado de Redis para liberar memoria
      await worldStateManager.clearWorldState(worldId);

      log.info({ worldId }, 'World paused successfully');
    } catch (error) {
      log.error({ error, worldId }, 'Failed to pause world');
      throw error;
    }
  }

  /**
   * Obtiene métricas vacías
   */
  private getEmptyMetrics(): AutoPauseJobMetrics {
    return {
      worldsEvaluated: 0,
      worldsPaused: 0,
      worldsAlreadyPaused: 0,
      errors: 0,
      executionTimeMs: 0,
    };
  }

  /**
   * Obtiene las últimas métricas
   */
  getLastMetrics(): AutoPauseJobMetrics | null {
    return this.lastMetrics;
  }

  /**
   * Verifica si el job está corriendo
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Configura umbral de inactividad (para testing)
   */
  setInactivityThreshold(ms: number): void {
    (this as any).INACTIVITY_THRESHOLD = ms;
  }
}

// Singleton
export const autoPauseJob = new AutoPauseJob();
