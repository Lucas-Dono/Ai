/**
 * World State Manager - Gestión de estado en Redis para mundos
 *
 * Maneja el estado temporal de mundos en Redis para reducir memory leaks
 * y mejorar el rendimiento.
 *
 * RESPONSABILIDADES:
 * - Cachear estado de mundos activos en Redis
 * - Marcar mundos como "dirty" cuando necesitan sync a DB
 * - Gestionar locks para evitar race conditions
 * - Liberar memoria de mundos inactivos
 */

import { redis, isRedisConfigured } from '@/lib/redis/config';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const log = createLogger('WorldStateManager');

// TTLs en segundos
const TTL = {
  ACTIVE_WORLD: 60 * 60 * 2, // 2 horas para mundos activos
  LOCK: 60 * 5, // 5 minutos para locks
  LAST_ACTIVITY: 60 * 60 * 24, // 24 horas para tracking de actividad
};

// Prefijos de keys en Redis
const KEYS = {
  STATE: (worldId: string) => `world:state:${worldId}`,
  LOCK: (worldId: string) => `world:lock:${worldId}`,
  DIRTY: (worldId: string) => `world:dirty:${worldId}`,
  LAST_ACTIVITY: (worldId: string) => `world:activity:${worldId}`,
  TEMP_EVENTS: (worldId: string) => `world:events:temp:${worldId}`,
};

export interface WorldStateCache {
  worldId: string;
  status: string;
  currentTurn: number;
  totalInteractions: number;
  lastSpeakerId?: string;
  activeSpeakers: string[];
  recentTopics: string[];
  lastUpdated: string;
}

export class WorldStateManager {
  /**
   * Guarda estado de mundo en Redis
   */
  async saveState(worldId: string, state: WorldStateCache): Promise<void> {
    if (!isRedisConfigured()) {
      log.warn({ worldId }, 'Redis not configured, skipping state save');
      return;
    }

    try {
      const key = KEYS.STATE(worldId);
      await redis.setex(key, TTL.ACTIVE_WORLD, JSON.stringify(state));

      // Actualizar last activity
      await this.touchActivity(worldId);

      log.debug({ worldId }, 'World state saved to Redis');
    } catch (error) {
      log.error({ error, worldId }, 'Failed to save world state to Redis');
    }
  }

  /**
   * Obtiene estado de mundo desde Redis
   */
  async getState(worldId: string): Promise<WorldStateCache | null> {
    if (!isRedisConfigured()) {
      return null;
    }

    try {
      const key = KEYS.STATE(worldId);
      const data = await redis.get(key);

      if (!data) {
        return null;
      }

      return typeof data === 'string' ? JSON.parse(data) : (data as WorldStateCache);
    } catch (error) {
      log.error({ error, worldId }, 'Failed to get world state from Redis');
      return null;
    }
  }

  /**
   * Marca mundo como "dirty" (necesita sincronización a DB)
   */
  async markDirty(worldId: string): Promise<void> {
    if (!isRedisConfigured()) {
      return;
    }

    try {
      const key = KEYS.DIRTY(worldId);
      await redis.setex(key, TTL.ACTIVE_WORLD, Date.now().toString());
      log.debug({ worldId }, 'World marked as dirty');
    } catch (error) {
      log.error({ error, worldId }, 'Failed to mark world as dirty');
    }
  }

  /**
   * Verifica si mundo está "dirty"
   */
  async isDirty(worldId: string): Promise<boolean> {
    if (!isRedisConfigured()) {
      return false;
    }

    try {
      const key = KEYS.DIRTY(worldId);
      const value = await redis.get(key);
      return value !== null;
    } catch (error) {
      log.error({ error, worldId }, 'Failed to check if world is dirty');
      return false;
    }
  }

  /**
   * Limpia flag de "dirty"
   */
  async clearDirty(worldId: string): Promise<void> {
    if (!isRedisConfigured()) {
      return;
    }

    try {
      const key = KEYS.DIRTY(worldId);
      await redis.del(key);
      log.debug({ worldId }, 'World dirty flag cleared');
    } catch (error) {
      log.error({ error, worldId }, 'Failed to clear dirty flag');
    }
  }

  /**
   * Adquiere lock para un mundo (evita race conditions)
   */
  async acquireLock(worldId: string, lockId: string): Promise<boolean> {
    if (!isRedisConfigured()) {
      return true; // Si no hay Redis, permitir (fallback)
    }

    try {
      const key = KEYS.LOCK(worldId);
      // NX = solo si no existe, EX = expira en N segundos
      const result = await redis.set(key, lockId, { nx: true, ex: TTL.LOCK });
      return result === 'OK';
    } catch (error) {
      log.error({ error, worldId, lockId }, 'Failed to acquire lock');
      return false;
    }
  }

  /**
   * Libera lock de un mundo
   */
  async releaseLock(worldId: string, lockId: string): Promise<void> {
    if (!isRedisConfigured()) {
      return;
    }

    try {
      const key = KEYS.LOCK(worldId);
      const currentLock = await redis.get(key);

      // Solo liberar si el lock es nuestro
      if (currentLock === lockId) {
        await redis.del(key);
        log.debug({ worldId, lockId }, 'Lock released');
      }
    } catch (error) {
      log.error({ error, worldId, lockId }, 'Failed to release lock');
    }
  }

  /**
   * Actualiza timestamp de última actividad
   */
  async touchActivity(worldId: string): Promise<void> {
    if (!isRedisConfigured()) {
      return;
    }

    try {
      const key = KEYS.LAST_ACTIVITY(worldId);
      await redis.setex(key, TTL.LAST_ACTIVITY, Date.now().toString());
    } catch (error) {
      log.error({ error, worldId }, 'Failed to touch activity');
    }
  }

  /**
   * Obtiene timestamp de última actividad
   */
  async getLastActivity(worldId: string): Promise<Date | null> {
    if (!isRedisConfigured()) {
      return null;
    }

    try {
      const key = KEYS.LAST_ACTIVITY(worldId);
      const timestamp = await redis.get(key);

      if (!timestamp) {
        return null;
      }

      const ts = typeof timestamp === 'string' ? parseInt(timestamp) : Number(timestamp);
      return new Date(ts);
    } catch (error) {
      log.error({ error, worldId }, 'Failed to get last activity');
      return null;
    }
  }

  /**
   * Limpia estado de mundo inactivo desde Redis
   */
  async clearWorldState(worldId: string): Promise<void> {
    if (!isRedisConfigured()) {
      return;
    }

    try {
      const keys = [
        KEYS.STATE(worldId),
        KEYS.DIRTY(worldId),
        KEYS.LAST_ACTIVITY(worldId),
        KEYS.TEMP_EVENTS(worldId),
      ];

      await redis.del(...keys);
      log.info({ worldId }, 'World state cleared from Redis');
    } catch (error) {
      log.error({ error, worldId }, 'Failed to clear world state');
    }
  }

  /**
   * Limpia locks huérfanos (locks que expiraron pero no se liberaron)
   */
  async cleanupOrphanLocks(): Promise<number> {
    if (!isRedisConfigured()) {
      return 0;
    }

    try {
      // Buscar todos los locks
      const lockPattern = 'world:lock:*';
      const keys = (await redis.keys(lockPattern)) as string[];

      let cleaned = 0;

      for (const key of keys) {
        const ttl = await redis.ttl(key);

        // Si el TTL es muy bajo (< 1 min), considerar huérfano
        if (ttl !== null && ttl > 0 && ttl < 60) {
          await redis.del(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        log.info({ cleaned }, 'Orphan locks cleaned');
      }

      return cleaned;
    } catch (error) {
      log.error({ error }, 'Failed to cleanup orphan locks');
      return 0;
    }
  }

  /**
   * Obtiene lista de mundos activos en Redis
   */
  async getActiveWorldIds(): Promise<string[]> {
    if (!isRedisConfigured()) {
      return [];
    }

    try {
      const pattern = 'world:state:*';
      const keys = await redis.keys(pattern);

      // Extraer worldIds de las keys
      const worldIds = keys.map(key => key.replace('world:state:', ''));

      return worldIds;
    } catch (error) {
      log.error({ error }, 'Failed to get active world IDs');
      return [];
    }
  }

  /**
   * Obtiene lista de mundos "dirty" que necesitan sync
   */
  async getDirtyWorldIds(): Promise<string[]> {
    if (!isRedisConfigured()) {
      return [];
    }

    try {
      const pattern = 'world:dirty:*';
      const keys = await redis.keys(pattern);

      const worldIds = keys.map(key => key.replace('world:dirty:', ''));

      return worldIds;
    } catch (error) {
      log.error({ error }, 'Failed to get dirty world IDs');
      return [];
    }
  }

  /**
   * Guarda evento temporal (se borra después de N turnos)
   */
  async saveTempEvent(worldId: string, event: any): Promise<void> {
    if (!isRedisConfigured()) {
      return;
    }

    try {
      const key = KEYS.TEMP_EVENTS(worldId);
      await redis.lpush(key, JSON.stringify(event));
      await redis.expire(key, 60 * 60); // Expira en 1 hora
      log.debug({ worldId, eventType: event.type }, 'Temp event saved');
    } catch (error) {
      log.error({ error, worldId }, 'Failed to save temp event');
    }
  }

  /**
   * Limpia eventos temporales viejos
   */
  async cleanupOldTempEvents(worldId: string, maxAge: number = 3600000): Promise<void> {
    if (!isRedisConfigured()) {
      return;
    }

    try {
      const key = KEYS.TEMP_EVENTS(worldId);
      const events = await redis.lrange(key, 0, -1);

      const now = Date.now();
      const validEvents = [];

      for (const eventStr of events) {
        const event = typeof eventStr === 'string' ? JSON.parse(eventStr) : eventStr;
        const age = now - new Date(event.timestamp).getTime();

        if (age < maxAge) {
          validEvents.push(eventStr);
        }
      }

      // Reemplazar lista con eventos válidos
      if (validEvents.length !== events.length) {
        await redis.del(key);
        if (validEvents.length > 0) {
          await redis.rpush(key, ...validEvents);
        }
        log.debug({ worldId, removed: events.length - validEvents.length }, 'Old temp events cleaned');
      }
    } catch (error) {
      log.error({ error, worldId }, 'Failed to cleanup old temp events');
    }
  }

  /**
   * Obtiene estadísticas de Redis
   */
  async getStats(): Promise<{
    activeWorlds: number;
    dirtyWorlds: number;
    activeLocks: number;
  }> {
    if (!isRedisConfigured()) {
      return {
        activeWorlds: 0,
        dirtyWorlds: 0,
        activeLocks: 0,
      };
    }

    try {
      const [stateKeys, dirtyKeys, lockKeys] = await Promise.all([
        redis.keys('world:state:*'),
        redis.keys('world:dirty:*'),
        redis.keys('world:lock:*'),
      ]);

      return {
        activeWorlds: stateKeys.length,
        dirtyWorlds: dirtyKeys.length,
        activeLocks: lockKeys.length,
      };
    } catch (error) {
      log.error({ error }, 'Failed to get Redis stats');
      return {
        activeWorlds: 0,
        dirtyWorlds: 0,
        activeLocks: 0,
      };
    }
  }
}

// Singleton
export const worldStateManager = new WorldStateManager();
