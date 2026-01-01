/**
 * Cache Cleanup Service
 *
 * Automatic cleanup of expired cache entries for AsyncStorageCache
 * Runs periodically in the background to keep cache size manageable
 */

import { AppState, AppStateStatus } from 'react-native';
import { getAsyncStorageCache } from '../storage/AsyncStorageCache';

class CacheCleanupService {
  private intervalId: number | null = null;
  private isRunning = false;
  private appStateSubscription: any = null;

  /**
   * Start automatic cache cleanup
   *
   * @param intervalMs - Cleanup interval in milliseconds (default: 1 hour)
   */
  start(intervalMs: number = 3600000): void {
    if (this.isRunning) {
      console.log('[CacheCleanup] Already running');
      return;
    }

    this.isRunning = true;

    // Run cleanup immediately on start
    this.runCleanup();

    // Schedule periodic cleanup
    this.intervalId = setInterval(() => {
      this.runCleanup();
    }, intervalMs);

    // Listen to app state changes
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange
    );

    console.log(`[CacheCleanup] Started with interval: ${intervalMs}ms`);
  }

  /**
   * Stop automatic cache cleanup
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    this.isRunning = false;
    console.log('[CacheCleanup] Stopped');
  }

  /**
   * Run cleanup manually
   */
  async runCleanup(): Promise<void> {
    try {
      const cache = getAsyncStorageCache();
      const removed = await cache.cleanupExpired();

      if (removed > 0) {
        console.log(`[CacheCleanup] Removed ${removed} expired entries`);
      }

      // Get stats after cleanup
      const stats = await cache.getStats();
      console.log(
        `[CacheCleanup] Stats: ${stats.totalKeys} keys, ${Math.round(
          stats.estimatedSize / 1024
        )}KB`
      );
    } catch (error) {
      console.error('[CacheCleanup] Error during cleanup:', error);
    }
  }

  /**
   * Handle app state changes
   * Run cleanup when app becomes active
   */
  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (nextAppState === 'active') {
      console.log('[CacheCleanup] App became active, running cleanup');
      this.runCleanup();
    }
  };

  /**
   * Get cleanup service status
   */
  getStatus(): { isRunning: boolean } {
    return { isRunning: this.isRunning };
  }
}

// Export singleton instance
export const cacheCleanupService = new CacheCleanupService();

/**
 * Initialize cache cleanup on app start
 * Call this in your App.tsx or index.js
 *
 * @example
 * import { initCacheCleanup } from './services/cache-cleanup.service';
 *
 * // In App.tsx useEffect:
 * useEffect(() => {
 *   initCacheCleanup();
 * }, []);
 */
export function initCacheCleanup(intervalMs?: number): void {
  cacheCleanupService.start(intervalMs);
}

/**
 * Stop cache cleanup (useful for testing or cleanup on app unmount)
 */
export function stopCacheCleanup(): void {
  cacheCleanupService.stop();
}
