/**
 * AsyncStorage Cache Adapter
 *
 * Implements ICache interface from @circuitpromptai/smart-start-core
 * using React Native's AsyncStorage for persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ICache } from '@circuitpromptai/smart-start-core';

interface CacheEntry<T = any> {
  value: T;
  expiry: number | null;
  createdAt: number;
}

/**
 * AsyncStorage-based cache implementation for React Native
 *
 * Features:
 * - TTL support with automatic expiration
 * - JSON serialization/deserialization
 * - Error handling and logging
 * - Optional namespace prefix
 */
export class AsyncStorageCache implements ICache {
  private prefix: string;

  constructor(prefix: string = 'smart-start') {
    this.prefix = prefix;
  }

  /**
   * Get value from cache
   * Returns null if not found or expired
   */
  async get(key: string): Promise<any | null> {
    try {
      const fullKey = this.getFullKey(key);
      const data = await AsyncStorage.getItem(fullKey);

      if (!data) {
        return null;
      }

      const entry: CacheEntry = JSON.parse(data);

      // Check if expired
      if (entry.expiry && Date.now() > entry.expiry) {
        // Clean up expired entry
        await this.delete(key);
        return null;
      }

      return entry.value;
    } catch (error) {
      console.error(`[AsyncStorageCache] Error getting key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL (in milliseconds)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      const entry: CacheEntry = {
        value,
        expiry: ttl ? Date.now() + ttl : null,
        createdAt: Date.now(),
      };

      await AsyncStorage.setItem(fullKey, JSON.stringify(entry));
    } catch (error) {
      console.error(`[AsyncStorageCache] Error setting key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      await AsyncStorage.removeItem(fullKey);
    } catch (error) {
      console.error(`[AsyncStorageCache] Error deleting key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Clear all cache entries with this prefix
   */
  async clear(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const prefixKeys = allKeys.filter(key => key.startsWith(`${this.prefix}:`));

      if (prefixKeys.length > 0) {
        await AsyncStorage.multiRemove(prefixKeys);
      }
    } catch (error) {
      console.error('[AsyncStorageCache] Error clearing cache:', error);
      throw error;
    }
  }

  /**
   * Check if key exists and is not expired
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Get all keys with this prefix
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      return allKeys
        .filter(key => key.startsWith(`${this.prefix}:`))
        .map(key => key.substring(this.prefix.length + 1));
    } catch (error) {
      console.error('[AsyncStorageCache] Error getting all keys:', error);
      return [];
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalKeys: number;
    estimatedSize: number;
  }> {
    try {
      const keys = await this.getAllKeys();
      let estimatedSize = 0;

      for (const key of keys) {
        const fullKey = this.getFullKey(key);
        const data = await AsyncStorage.getItem(fullKey);
        if (data) {
          estimatedSize += data.length;
        }
      }

      return {
        totalKeys: keys.length,
        estimatedSize,
      };
    } catch (error) {
      console.error('[AsyncStorageCache] Error getting stats:', error);
      return { totalKeys: 0, estimatedSize: 0 };
    }
  }

  /**
   * Remove all expired entries
   */
  async cleanupExpired(): Promise<number> {
    try {
      const keys = await this.getAllKeys();
      let removed = 0;

      for (const key of keys) {
        const fullKey = this.getFullKey(key);
        const data = await AsyncStorage.getItem(fullKey);

        if (data) {
          try {
            const entry: CacheEntry = JSON.parse(data);
            if (entry.expiry && Date.now() > entry.expiry) {
              await this.delete(key);
              removed++;
            }
          } catch {
            // Invalid entry, remove it
            await this.delete(key);
            removed++;
          }
        }
      }

      return removed;
    } catch (error) {
      console.error('[AsyncStorageCache] Error cleaning up expired entries:', error);
      return 0;
    }
  }

  /**
   * Get full key with prefix
   */
  private getFullKey(key: string): string {
    return `${this.prefix}:${key}`;
  }
}

/**
 * Create a singleton instance of AsyncStorageCache
 */
let defaultInstance: AsyncStorageCache | null = null;

export function getAsyncStorageCache(prefix?: string): AsyncStorageCache {
  if (!defaultInstance || (prefix && defaultInstance['prefix'] !== prefix)) {
    defaultInstance = new AsyncStorageCache(prefix);
  }
  return defaultInstance;
}
