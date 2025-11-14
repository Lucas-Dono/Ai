/**
 * Sync Job - Sincroniza estado de Redis a Database
 *
 * SCHEDULE: Cada 5 minutos
 *
 * RESPONSABILIDADES:
 * - Sincronizar estado Redis → DB para mundos marcados como "dirty"
 * - Actualizar lastActiveAt en mundos activos
 * - Persistir estadísticas críticas
 * - Mantener consistencia de datos
 *
 * MÉTRICAS:
 * - Mundos sincronizados
 * - Actualizaciones exitosas
 * - Errores de sincronización
 * - Tiempo de ejecución
 */

import { worldStateManager, WorldStateCache } from '../world-state-manager';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';
import { isRedisConfigured } from '@/lib/redis/config';
import { v4 as uuidv4 } from 'uuid';

const log = createLogger('SyncJob');

export interface SyncJobMetrics {
  worldsSynced: number;
  successfulUpdates: number;
  failedUpdates: number;
  executionTimeMs: number;
  errors: number;
}

export class SyncJob {
  private isRunning = false;
  private lastMetrics: SyncJobMetrics | null = null;
  private consecutiveFailures = 0;
  private readonly MAX_CONSECUTIVE_FAILURES = 3;
  private readonly MAX_EXECUTION_TIME = 5 * 60 * 1000; // 5 minutos

  /**
   * Ejecuta el job de sincronización
   */
  async execute(): Promise<SyncJobMetrics> {
    if (this.isRunning) {
      log.warn('Sync job already running, skipping');
      return this.lastMetrics || this.getEmptyMetrics();
    }

    if (!isRedisConfigured()) {
      log.info('Redis not configured, skipping sync job');
      return this.getEmptyMetrics();
    }

    this.isRunning = true;
    const startTime = Date.now();

    const metrics: SyncJobMetrics = {
      worldsSynced: 0,
      successfulUpdates: 0,
      failedUpdates: 0,
      executionTimeMs: 0,
      errors: 0,
    };

    try {
      log.info('🔄 Starting sync job...');

      // Obtener mundos que necesitan sincronización
      const dirtyWorldIds = await worldStateManager.getDirtyWorldIds();

      if (dirtyWorldIds.length === 0) {
        log.debug('No dirty worlds to sync');
        metrics.executionTimeMs = Date.now() - startTime;
        this.lastMetrics = metrics;
        return metrics;
      }

      log.info({ count: dirtyWorldIds.length }, 'Found dirty worlds to sync');

      // Sincronizar cada mundo
      for (const worldId of dirtyWorldIds) {
        // Verificar timeout
        if (Date.now() - startTime > this.MAX_EXECUTION_TIME) {
          log.warn({ processed: metrics.worldsSynced }, 'Sync job timeout, stopping');
          break;
        }

        try {
          const success = await this.syncWorld(worldId);
          metrics.worldsSynced++;

          if (success) {
            metrics.successfulUpdates++;
          } else {
            metrics.failedUpdates++;
          }
        } catch (error) {
          log.error({ error, worldId }, 'Error syncing world');
          metrics.failedUpdates++;
          metrics.errors++;
        }
      }

      metrics.executionTimeMs = Date.now() - startTime;

      log.info(
        {
          synced: metrics.worldsSynced,
          successful: metrics.successfulUpdates,
          failed: metrics.failedUpdates,
          duration: metrics.executionTimeMs + 'ms',
        },
        '✅ Sync job completed'
      );

      this.consecutiveFailures = 0;
      this.lastMetrics = metrics;
      return metrics;
    } catch (error) {
      metrics.errors++;
      metrics.executionTimeMs = Date.now() - startTime;

      log.error({ error, metrics }, '❌ Sync job failed');

      this.consecutiveFailures++;
      if (this.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
        log.error(
          { consecutiveFailures: this.consecutiveFailures },
          '🚨 ALERT: Sync job failed 3 times consecutively!'
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
   * Sincroniza un mundo específico desde Redis a DB
   */
  private async syncWorld(worldId: string): Promise<boolean> {
    const lockId = uuidv4();

    try {
      // Intentar adquirir lock
      const lockAcquired = await worldStateManager.acquireLock(worldId, lockId);
      if (!lockAcquired) {
        log.debug({ worldId }, 'Could not acquire lock, skipping sync');
        return false;
      }

      // Obtener estado desde Redis
      const state = await worldStateManager.getState(worldId);
      if (!state) {
        log.debug({ worldId }, 'No state in Redis, clearing dirty flag');
        await worldStateManager.clearDirty(worldId);
        return true;
      }

      // Verificar que el mundo existe en DB
      const world = await prisma.world.findUnique({
        where: { id: worldId },
        include: { simulationState: true },
      });

      if (!world) {
        log.warn({ worldId }, 'World not found in DB, clearing Redis state');
        await worldStateManager.clearWorldState(worldId);
        return true;
      }

      // Actualizar mundo en DB
      await this.updateWorldInDB(worldId, world, state);

      // Limpiar flag de dirty
      await worldStateManager.clearDirty(worldId);

      log.debug({ worldId }, 'World synced successfully');
      return true;
    } catch (error) {
      log.error({ error, worldId }, 'Failed to sync world');
      return false;
    } finally {
      // Liberar lock
      await worldStateManager.releaseLock(worldId, lockId);
    }
  }

  /**
   * Actualiza mundo en la base de datos
   */
  private async updateWorldInDB(
    worldId: string,
    world: any,
    state: WorldStateCache
  ): Promise<void> {
    // Actualizar World
    await prisma.world.update({
      where: { id: worldId },
      data: {
        status: state.status as any,
        updatedAt: new Date(),
      },
    });

    // Actualizar SimulationState
    if (world.simulationState) {
      await prisma.worldSimulationState.update({
        where: { id: world.simulationState.id },
        data: {
          currentTurn: state.currentTurn,
          totalInteractions: state.totalInteractions,
          lastSpeakerId: state.lastSpeakerId,
          activeSpeakers: state.activeSpeakers,
          recentTopics: state.recentTopics,
          lastUpdated: new Date(state.lastUpdated),
        },
      });
    } else {
      // Crear SimulationState si no existe
      await prisma.worldSimulationState.create({
        data: {
          worldId,
          currentTurn: state.currentTurn,
          totalInteractions: state.totalInteractions,
          lastSpeakerId: state.lastSpeakerId,
          activeSpeakers: state.activeSpeakers,
          recentTopics: state.recentTopics,
          lastUpdated: new Date(state.lastUpdated),
        },
      });
    }

    log.debug({ worldId, turn: state.currentTurn }, 'World updated in DB');
  }

  /**
   * Obtiene métricas vacías
   */
  private getEmptyMetrics(): SyncJobMetrics {
    return {
      worldsSynced: 0,
      successfulUpdates: 0,
      failedUpdates: 0,
      executionTimeMs: 0,
      errors: 0,
    };
  }

  /**
   * Obtiene las últimas métricas
   */
  getLastMetrics(): SyncJobMetrics | null {
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
export const syncJob = new SyncJob();
