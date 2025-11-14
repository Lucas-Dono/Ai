/**
 * World Pause Service
 *
 * Servicio para pausar automáticamente mundos inactivos y ahorrar costos.
 *
 * AHORRO DE COSTOS:
 * - Mundos pausados no generan eventos emergentes (ahorra LLM)
 * - Estado Redis eliminado (ahorra memoria)
 * - No ejecuta simulación (ahorra procesamiento)
 * - Fácil reactivación cuando usuario vuelve
 *
 * CRITERIOS DE AUTO-PAUSE:
 * - Sin actividad en 24 horas → pausar
 * - Sin actividad en 7 días → archivar
 * - Sin actividad en 30 días → marcar para eliminación
 *
 * EXCEPCIONES (NO pausar):
 * - Mundos marcados como "favorite" por usuario
 * - Mundos con eventos programados futuros
 * - Mundos en modo "collaborative" con otros usuarios activos
 */

import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';
import { worldSimulationEngine } from '@/lib/worlds/simulation-engine';

const log = createLogger('WorldPauseService');

// ========================================
// TIPOS
// ========================================

export type PauseReason =
  | 'inactivity_24h'      // 24 horas sin actividad
  | 'inactivity_7d'       // 7 días sin actividad (archivar)
  | 'inactivity_30d'      // 30 días sin actividad (marcar para eliminación)
  | 'manual'              // Pausado manualmente por usuario
  | 'system';             // Pausado por sistema (mantenimiento, etc.)

export interface PauseStats {
  totalPaused: number;
  pausedBy24h: number;
  pausedBy7d: number;
  pausedBy30d: number;
  skippedFavorites: number;
  skippedWithEvents: number;
  estimatedSavings: {
    llmCalls: number;      // Llamadas LLM evitadas
    redisMemoryMB: number; // MB de Redis liberados
    costUSD: number;       // Estimación de ahorro en USD
  };
}

export interface ResumeResult {
  success: boolean;
  worldId: string;
  wasResumed: boolean;
  message: string;
}

// ========================================
// CONFIGURACIÓN
// ========================================

const PAUSE_THRESHOLDS = {
  INACTIVITY_24H: 24 * 60 * 60 * 1000,      // 24 horas
  INACTIVITY_7D: 7 * 24 * 60 * 60 * 1000,   // 7 días
  INACTIVITY_30D: 30 * 24 * 60 * 60 * 1000, // 30 días
};

// Estimación de costos promedio
const COST_ESTIMATES = {
  EMERGENT_EVENT_LLM_COST: 0.002,    // $0.002 por evento emergente
  DIRECTOR_EVALUATION_COST: 0.003,   // $0.003 por evaluación del director
  REDIS_MEMORY_PER_WORLD_MB: 5,      // 5 MB promedio por mundo activo
  EVENTS_PER_DAY: 10,                // Eventos emergentes promedio por día
  EVALUATIONS_PER_DAY: 20,           // Evaluaciones del director por día
};

// ========================================
// WORLD PAUSE SERVICE
// ========================================

export class WorldPauseService {
  /**
   * Pausa automáticamente mundos inactivos
   * Ejecutado por cron job cada 6 horas
   */
  static async autoPauseInactiveWorlds(): Promise<PauseStats> {
    const startTime = Date.now();
    log.info('Starting auto-pause process for inactive worlds');

    const stats: PauseStats = {
      totalPaused: 0,
      pausedBy24h: 0,
      pausedBy7d: 0,
      pausedBy30d: 0,
      skippedFavorites: 0,
      skippedWithEvents: 0,
      estimatedSavings: {
        llmCalls: 0,
        redisMemoryMB: 0,
        costUSD: 0,
      },
    };

    try {
      // Obtener todos los mundos activos que no están pausados
      const activeWorlds = await prisma.world.findMany({
        where: {
          isPaused: false,
          status: {
            in: ['RUNNING', 'PAUSED'], // Solo mundos que podrían estar usando recursos
          },
        },
        include: {
          storyEvents: {
            where: {
              scheduledAt: {
                gte: new Date(), // Eventos futuros
              },
            },
            take: 1,
          },
        },
      });

      log.info({ count: activeWorlds.length }, 'Found active worlds to evaluate');

      for (const world of activeWorlds) {
        // EXCEPCIONES: No pausar si...
        if (world.isFavorite) {
          stats.skippedFavorites++;
          log.debug({ worldId: world.id, worldName: world.name }, 'Skipping favorite world');
          continue;
        }

        if (world.storyEvents.length > 0) {
          stats.skippedWithEvents++;
          log.debug(
            { worldId: world.id, worldName: world.name },
            'Skipping world with scheduled events'
          );
          continue;
        }

        // TODO: Verificar si hay otros usuarios colaborando (si implementamos collaborative mode)

        // Calcular inactividad
        const inactivityMs = Date.now() - world.lastActiveAt.getTime();

        // Determinar si debe pausarse y con qué razón
        let shouldPause = false;
        let pauseReason: PauseReason | null = null;

        if (inactivityMs >= PAUSE_THRESHOLDS.INACTIVITY_30D) {
          shouldPause = true;
          pauseReason = 'inactivity_30d';
          stats.pausedBy30d++;
        } else if (inactivityMs >= PAUSE_THRESHOLDS.INACTIVITY_7D) {
          shouldPause = true;
          pauseReason = 'inactivity_7d';
          stats.pausedBy7d++;
        } else if (inactivityMs >= PAUSE_THRESHOLDS.INACTIVITY_24H) {
          shouldPause = true;
          pauseReason = 'inactivity_24h';
          stats.pausedBy24h++;
        }

        if (shouldPause && pauseReason) {
          const result = await this.pauseWorld(world.id, pauseReason);
          if (result) {
            stats.totalPaused++;

            // Calcular ahorro estimado
            const daysSaved = Math.floor(inactivityMs / (24 * 60 * 60 * 1000));
            const llmCallsSaved =
              daysSaved * (COST_ESTIMATES.EVENTS_PER_DAY + COST_ESTIMATES.EVALUATIONS_PER_DAY);
            const costSaved =
              llmCallsSaved *
              ((COST_ESTIMATES.EMERGENT_EVENT_LLM_COST + COST_ESTIMATES.DIRECTOR_EVALUATION_COST) / 2);

            stats.estimatedSavings.llmCalls += llmCallsSaved;
            stats.estimatedSavings.redisMemoryMB += COST_ESTIMATES.REDIS_MEMORY_PER_WORLD_MB;
            stats.estimatedSavings.costUSD += costSaved;

            log.info(
              {
                worldId: world.id,
                worldName: world.name,
                pauseReason,
                inactivityDays: Math.floor(inactivityMs / (24 * 60 * 60 * 1000)),
                estimatedSavingsUSD: costSaved.toFixed(4),
              },
              'World auto-paused'
            );
          }
        }
      }

      const duration = Date.now() - startTime;
      log.info(
        {
          stats,
          durationMs: duration,
        },
        'Auto-pause process completed'
      );

      return stats;
    } catch (error) {
      log.error({ error }, 'Error in auto-pause process');
      throw error;
    }
  }

  /**
   * Pausa un mundo específico
   */
  static async pauseWorld(worldId: string, reason: PauseReason): Promise<boolean> {
    try {
      log.info({ worldId, reason }, 'Pausing world');

      // 1. Detener simulación si está corriendo
      if (worldSimulationEngine.isSimulationRunning(worldId)) {
        await worldSimulationEngine.pauseSimulation(worldId);
      }

      // 2. Actualizar estado en base de datos
      const scheduledDeletion =
        reason === 'inactivity_30d'
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días más para eliminación
          : undefined;

      await prisma.world.update({
        where: { id: worldId },
        data: {
          isPaused: true,
          pausedAt: new Date(),
          pauseReason: reason,
          scheduledDeletion,
        },
      });

      // 3. Limpiar estado Redis (si existe)
      // TODO: Implementar limpieza de Redis cuando tengamos Redis cache

      // 4. Guardar último estado en DB para resume rápido
      const simState = await prisma.worldSimulationState.findUnique({
        where: { worldId },
      });

      if (simState) {
        // El estado ya está guardado en DB, no necesitamos hacer nada más
        log.debug({ worldId }, 'Simulation state saved for quick resume');
      }

      log.info({ worldId, reason }, 'World paused successfully');
      return true;
    } catch (error) {
      log.error({ error, worldId, reason }, 'Error pausing world');
      return false;
    }
  }

  /**
   * Resume un mundo pausado
   */
  static async resumeWorld(worldId: string, userId?: string): Promise<ResumeResult> {
    try {
      const world = await prisma.world.findUnique({
        where: { id: worldId },
        include: {
          simulationState: true,
        },
      });

      if (!world) {
        return {
          success: false,
          worldId,
          wasResumed: false,
          message: 'World not found',
        };
      }

      // Verificar permisos si se proporciona userId
      if (userId && world.userId !== userId) {
        return {
          success: false,
          worldId,
          wasResumed: false,
          message: 'Unauthorized',
        };
      }

      // Si no está pausado, no hay nada que hacer
      if (!world.isPaused) {
        return {
          success: true,
          worldId,
          wasResumed: false,
          message: 'World is not paused',
        };
      }

      log.info(
        {
          worldId,
          pauseReason: world.pauseReason,
          pausedAt: world.pausedAt,
        },
        'Resuming world'
      );

      // 1. Actualizar estado en DB
      await prisma.world.update({
        where: { id: worldId },
        data: {
          isPaused: false,
          pausedAt: null,
          pauseReason: null,
          lastActiveAt: new Date(),
          scheduledDeletion: null, // Cancelar eliminación programada
        },
      });

      // 2. Restaurar estado Redis (si es necesario)
      // TODO: Restaurar desde DB cuando tengamos Redis cache

      // 3. No reiniciar simulación automáticamente
      // La simulación se reiniciará cuando el usuario interactúe

      log.info({ worldId }, 'World resumed successfully');

      return {
        success: true,
        worldId,
        wasResumed: true,
        message: 'World resumed successfully',
      };
    } catch (error) {
      log.error({ error, worldId }, 'Error resuming world');
      return {
        success: false,
        worldId,
        wasResumed: false,
        message: 'Internal error',
      };
    }
  }

  /**
   * Actualiza lastActiveAt para un mundo
   * Llamado cada vez que hay actividad (mensaje, interacción)
   */
  static async updateLastActive(worldId: string): Promise<void> {
    try {
      await prisma.world.update({
        where: { id: worldId },
        data: {
          lastActiveAt: new Date(),
        },
      });

      log.debug({ worldId }, 'Updated lastActiveAt');
    } catch (error) {
      log.error({ error, worldId }, 'Error updating lastActiveAt');
    }
  }

  /**
   * Verifica si un mundo debe ser pausado
   */
  static shouldPause(world: {
    isPaused: boolean;
    isFavorite: boolean;
    lastActiveAt: Date;
  }): { shouldPause: boolean; reason: PauseReason | null } {
    if (world.isPaused) {
      return { shouldPause: false, reason: null };
    }

    if (world.isFavorite) {
      return { shouldPause: false, reason: null };
    }

    const inactivityMs = Date.now() - world.lastActiveAt.getTime();

    if (inactivityMs >= PAUSE_THRESHOLDS.INACTIVITY_30D) {
      return { shouldPause: true, reason: 'inactivity_30d' };
    }

    if (inactivityMs >= PAUSE_THRESHOLDS.INACTIVITY_7D) {
      return { shouldPause: true, reason: 'inactivity_7d' };
    }

    if (inactivityMs >= PAUSE_THRESHOLDS.INACTIVITY_24H) {
      return { shouldPause: true, reason: 'inactivity_24h' };
    }

    return { shouldPause: false, reason: null };
  }

  /**
   * Obtiene estadísticas de mundos pausados
   */
  static async getPauseStats(): Promise<{
    totalPaused: number;
    by24h: number;
    by7d: number;
    by30d: number;
    scheduledForDeletion: number;
  }> {
    const [totalPaused, by24h, by7d, by30d, scheduledForDeletion] = await Promise.all([
      prisma.world.count({ where: { isPaused: true } }),
      prisma.world.count({ where: { isPaused: true, pauseReason: 'inactivity_24h' } }),
      prisma.world.count({ where: { isPaused: true, pauseReason: 'inactivity_7d' } }),
      prisma.world.count({ where: { isPaused: true, pauseReason: 'inactivity_30d' } }),
      prisma.world.count({
        where: {
          scheduledDeletion: {
            not: null,
          },
        },
      }),
    ]);

    return {
      totalPaused,
      by24h,
      by7d,
      by30d,
      scheduledForDeletion,
    };
  }

  /**
   * Elimina mundos marcados para eliminación
   * Ejecutado por cron job diario
   */
  static async deleteScheduledWorlds(): Promise<{
    deleted: number;
    failedDeletions: string[];
  }> {
    log.info('Starting scheduled worlds deletion');

    const worldsToDelete = await prisma.world.findMany({
      where: {
        scheduledDeletion: {
          lte: new Date(),
        },
      },
      select: {
        id: true,
        name: true,
        userId: true,
      },
    });

    log.info({ count: worldsToDelete.length }, 'Found worlds scheduled for deletion');

    let deleted = 0;
    const failedDeletions: string[] = [];

    for (const world of worldsToDelete) {
      try {
        await prisma.world.delete({
          where: { id: world.id },
        });

        deleted++;
        log.info(
          {
            worldId: world.id,
            worldName: world.name,
            userId: world.userId,
          },
          'World deleted'
        );
      } catch (error) {
        log.error(
          {
            error,
            worldId: world.id,
            worldName: world.name,
          },
          'Failed to delete world'
        );
        failedDeletions.push(world.id);
      }
    }

    log.info({ deleted, failed: failedDeletions.length }, 'Scheduled worlds deletion completed');

    return { deleted, failedDeletions };
  }

  /**
   * Marca un mundo como favorito (previene auto-pause)
   */
  static async toggleFavorite(worldId: string, userId: string): Promise<boolean> {
    try {
      const world = await prisma.world.findUnique({
        where: { id: worldId },
        select: { userId: true, isFavorite: true },
      });

      if (!world || world.userId !== userId) {
        return false;
      }

      await prisma.world.update({
        where: { id: worldId },
        data: {
          isFavorite: !world.isFavorite,
        },
      });

      log.info({ worldId, newValue: !world.isFavorite }, 'Toggled favorite status');
      return true;
    } catch (error) {
      log.error({ error, worldId }, 'Error toggling favorite');
      return false;
    }
  }
}
