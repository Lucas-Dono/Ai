/**
 * Redis Sync Initializer
 *
 * Inicializa el background job de sincronización Redis -> DB
 * para mundos virtuales.
 *
 * IMPORTANTE: Llamar startSyncBackgroundJob() al inicio de la app
 */

import { startSyncBackgroundJob } from './world-state-redis';
import { createLogger } from '@/lib/logger';

const log = createLogger('RedisSyncInit');

let initialized = false;

/**
 * Inicializa el sistema de sincronización Redis
 */
export function initializeRedisSync(): void {
  if (initialized) {
    log.warn('Redis sync already initialized');
    return;
  }

  try {
    // Iniciar background job
    startSyncBackgroundJob();

    initialized = true;
    log.info('✅ Redis sync system initialized');

  } catch (error) {
    log.error({ error }, '❌ Failed to initialize Redis sync');
  }
}

/**
 * Para tests: resetea el estado de inicialización
 */
export function resetInitialization(): void {
  initialized = false;
}
