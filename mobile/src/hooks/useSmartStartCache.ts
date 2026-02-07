/**
 * useSmartStartCache Hook
 *
 * React hook for accessing Smart Start cache in React Native components
 */

import { useCallback, useEffect, useState } from 'react';
import { getAsyncStorageCache } from '../storage/AsyncStorageCache';

/**
 * Hook to access Smart Start cache with React state integration
 *
 * @example
 * const cache = useSmartStartCache();
 * const data = await cache.get('myKey');
 * await cache.set('myKey', value, 3600000); // 1 hour TTL
 */
export function useSmartStartCache() {
  const cache = getAsyncStorageCache();

  const get = useCallback(
    async <T = any>(key: string): Promise<T | null> => {
      return await cache.get(key);
    },
    [cache]
  );

  const set = useCallback(
    async (key: string, value: any, ttl?: number): Promise<void> => {
      return await cache.set(key, value, ttl);
    },
    [cache]
  );

  const remove = useCallback(
    async (key: string): Promise<void> => {
      return await cache.delete(key);
    },
    [cache]
  );

  const clear = useCallback(async (): Promise<void> => {
    return await cache.clear();
  }, [cache]);

  const has = useCallback(
    async (key: string): Promise<boolean> => {
      return await cache.has(key);
    },
    [cache]
  );

  return {
    get,
    set,
    remove,
    clear,
    has,
    cache, // Exponer instancia directa para casos avanzados
  };
}

/**
 * Hook to get/set a specific cache value with React state
 *
 * @example
 * const [searchResults, setSearchResults, loading] = useCachedValue<SearchResult[]>(
 *   'anime-search-naruto',
 *   [],
 *   3600000 // 1 hour TTL
 * );
 */
export function useCachedValue<T>(
  key: string,
  defaultValue: T,
  ttl?: number
): [T, (value: T) => Promise<void>, boolean] {
  const cache = getAsyncStorageCache();
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  // Load from cache on mount
  useEffect(() => {
    let mounted = true;

    const loadFromCache = async () => {
      try {
        const cached = await cache.get(key);
        if (mounted && cached !== null) {
          setValue(cached);
        }
      } catch (error) {
        console.error(`[useCachedValue] Error loading ${key}:`, error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadFromCache();

    return () => {
      mounted = false;
    };
  }, [key, cache]);

  // Update cache and state
  const updateValue = useCallback(
    async (newValue: T) => {
      try {
        await cache.set(key, newValue, ttl);
        setValue(newValue);
      } catch (error) {
        console.error(`[useCachedValue] Error updating ${key}:`, error);
        throw error;
      }
    },
    [key, cache, ttl]
  );

  return [value, updateValue, loading];
}

/**
 * Hook to track cache statistics
 *
 * @example
 * const { totalKeys, estimatedSize, refresh } = useCacheStats();
 */
export function useCacheStats() {
  const cache = getAsyncStorageCache();
  const [stats, setStats] = useState({ totalKeys: 0, estimatedSize: 0 });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const newStats = await cache.getStats();
      setStats(newStats);
    } catch (error) {
      console.error('[useCacheStats] Error getting stats:', error);
    } finally {
      setLoading(false);
    }
  }, [cache]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    totalKeys: stats.totalKeys,
    estimatedSize: stats.estimatedSize,
    estimatedSizeKB: Math.round(stats.estimatedSize / 1024),
    loading,
    refresh,
  };
}
