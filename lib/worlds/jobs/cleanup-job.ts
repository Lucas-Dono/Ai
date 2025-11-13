/**
 * Cleanup Job - Limpia estado de mundos inactivos
 *
 * SCHEDULE: Cada 1 hora
 *
 * RESPONSABILIDADES:
 * - Eliminar estado Redis de mundos inactivos (> 1h sin actividad)
 * - Limpiar locks huérfanos
 * - Borrar eventos temporales viejos
 * - Liberar memoria no utilizada
 *
 * MÉTRICAS:
 * - Mundos limpiados
 * - Locks huérfanos removidos
 * - Eventos temporales eliminados
 * - Memoria liberada (estimado)
 */

import { worldStateManager } from '../world-state-manager';
import { createLogger } from '@/lib/logger';
import { isRedisConfigured } from '@/lib/redis/config';

const log = createLogger('CleanupJob');

export interface CleanupJobMetrics {
  worldsCleaned: number;
  orphanLocksRemoved: number;
  tempEventsCleanedCount: number;
  estimatedMemoryFreedMB: number;
  executionTimeMs: number;
  errors: number;
}

export class CleanupJob {
  private isRunning = false;
  private lastMetrics: CleanupJobMetrics | null = null;
  private consecutiveFailures = 0;
  private readonly MAX_CONSECUTIVE_FAILURES = 3;

  /**
   * Ejecuta el job de cleanup
   */
  async execute(): Promise<CleanupJobMetrics> {
    if (this.isRunning) {
      log.warn('Cleanup job already running, skipping');
      return this.lastMetrics || this.getEmptyMetrics();
    }

    if (!isRedisConfigured()) {
      log.info('Redis not configured, skipping cleanup job');
      return this.getEmptyMetrics();
    }

    this.isRunning = true;
    const startTime = Date.now();

    const metrics: CleanupJobMetrics = {
      worldsCleaned: 0,
      orphanLocksRemoved: 0,
      tempEventsCleanedCount: 0,
      estimatedMemoryFreedMB: 0,
      executionTimeMs: 0,
      errors: 0,
    };

    try {
      log.info('🧹 Starting cleanup job...');

      // 1. Limpiar mundos inactivos
      metrics.worldsCleaned = await this.cleanupInactiveWorlds();

      // 2. Limpiar locks huérfanos
      metrics.orphanLocksRemoved = await this.cleanupOrphanLocks();

      // 3. Limpiar eventos temporales viejos
      metrics.tempEventsCleanedCount = await this.cleanupOldTempEvents();

      // 4. Estimar memoria liberada (aprox 10KB por mundo + 1KB por lock + 500B por evento)
      metrics.estimatedMemoryFreedMB =
        (metrics.worldsCleaned * 10 +
          metrics.orphanLocksRemoved * 1 +
          metrics.tempEventsCleanedCount * 0.5) /
        1024;

      metrics.executionTimeMs = Date.now() - startTime;

      log.info(
        {
          worldsCleaned: metrics.worldsCleaned,
          locksRemoved: metrics.orphanLocksRemoved,
          eventsRemoved: metrics.tempEventsCleanedCount,
          memoryFreed: metrics.estimatedMemoryFreedMB.toFixed(2) + ' MB',
          duration: metrics.executionTimeMs + 'ms',
        },
        '✅ Cleanup job completed'
      );

      this.consecutiveFailures = 0;
      this.lastMetrics = metrics;
      return metrics;
    } catch (error) {
      metrics.errors++;
      metrics.executionTimeMs = Date.now() - startTime;

      log.error({ error, metrics }, '❌ Cleanup job failed');

      this.consecutiveFailures++;
      if (this.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
        log.error(
          { consecutiveFailures: this.consecutiveFailures },
          '🚨 ALERT: Cleanup job failed 3 times consecutively!'
        );
        // TODO: Enviar alerta (email, Slack, PagerDuty, etc.)
      }

      this.lastMetrics = metrics;
      return metrics;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Limpia mundos inactivos (> 1 hora sin actividad)
   */
  private async cleanupInactiveWorlds(): Promise<number> {
    try {
      const activeWorldIds = await worldStateManager.getActiveWorldIds();
      const inactiveThreshold = Date.now() - 60 * 60 * 1000; // 1 hora
      let cleaned = 0;

      for (const worldId of activeWorldIds) {
        try {
          const lastActivity = await worldStateManager.getLastActivity(worldId);

          if (!lastActivity || lastActivity.getTime() < inactiveThreshold) {
            // Mundo inactivo, limpiarlo
            await worldStateManager.clearWorldState(worldId);
            cleaned++;

            log.debug(
              {
                worldId,
                lastActivity: lastActivity ? lastActivity.toISOString() : 'never',
              },
              'Inactive world cleaned'
            );
          }
        } catch (error) {
          log.error({ error, worldId }, 'Error cleaning inactive world');
        }
      }

      return cleaned;
    } catch (error) {
      log.error({ error }, 'Error in cleanupInactiveWorlds');
      return 0;
    }
  }

  /**
   * Limpia locks huérfanos
   */
  private async cleanupOrphanLocks(): Promise<number> {
    try {
      return await worldStateManager.cleanupOrphanLocks();
    } catch (error) {
      log.error({ error }, 'Error cleaning orphan locks');
      return 0;
    }
  }

  /**
   * Limpia eventos temporales viejos (> 1 hora)
   */
  private async cleanupOldTempEvents(): Promise<number> {
    try {
      const activeWorldIds = await worldStateManager.getActiveWorldIds();
      const maxAge = 60 * 60 * 1000; // 1 hora
      let totalCleaned = 0;

      for (const worldId of activeWorldIds) {
        try {
          await worldStateManager.cleanupOldTempEvents(worldId, maxAge);
          totalCleaned++; // Contamos por mundo limpiado
        } catch (error) {
          log.error({ error, worldId }, 'Error cleaning temp events for world');
        }
      }

      return totalCleaned;
    } catch (error) {
      log.error({ error }, 'Error in cleanupOldTempEvents');
      return 0;
    }
  }

  /**
   * Obtiene métricas vacías
   */
  private getEmptyMetrics(): CleanupJobMetrics {
    return {
      worldsCleaned: 0,
      orphanLocksRemoved: 0,
      tempEventsCleanedCount: 0,
      estimatedMemoryFreedMB: 0,
      executionTimeMs: 0,
      errors: 0,
    };
  }

  /**
   * Obtiene las últimas métricas
   */
  getLastMetrics(): CleanupJobMetrics | null {
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
export const cleanupJob = new CleanupJob();
