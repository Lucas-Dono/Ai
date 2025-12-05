/**
 * Cache interface for platform-agnostic caching
 *
 * Implementations:
 * - Web: RedisCache (using Redis)
 * - Mobile: AsyncStorageCache (using AsyncStorage)
 */

export interface ICache {
  /**
   * Get a value from cache
   * @param key Cache key
   * @returns The cached value or null if not found/expired
   */
  get(key: string): Promise<any | null>;

  /**
   * Set a value in cache with optional TTL
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in milliseconds (optional)
   */
  set(key: string, value: any, ttl?: number): Promise<void>;

  /**
   * Delete a value from cache
   * @param key Cache key
   */
  delete(key: string): Promise<void>;

  /**
   * Clear all cache entries
   * Optional: not all implementations may support this
   */
  clear?(): Promise<void>;

  /**
   * Check if a key exists in cache
   * @param key Cache key
   * @returns true if key exists and is not expired
   */
  has?(key: string): Promise<boolean>;
}

/**
 * In-memory cache implementation (for testing or fallback)
 */
export class MemoryCache implements ICache {
  private cache = new Map<string, { value: any; expiry: number | null }>();

  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (entry.expiry && Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expiry = ttl ? Date.now() + ttl : null;
    this.cache.set(key, { value, expiry });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (entry.expiry && Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}
