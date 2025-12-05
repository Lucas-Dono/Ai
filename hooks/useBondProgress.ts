/**
 * Bond Progress Hook V2 - Singleton Pattern
 *
 * Prevents polling spam by using a shared singleton manager.
 * Multiple components can use this hook with the same agentId without creating
 * multiple polling intervals.
 *
 * @example
 * ```tsx
 * const { bondProgress, loading, error, refresh } = useBondProgress(agentId, {
 *   enabled: true,
 *   pollingInterval: 600000, // 10 minutes (shared across all instances)
 * });
 * ```
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface BondProgress {
  hasBond: boolean;
  currentTier: string | null;
  currentAffinityLevel: number;
  durationDays: number;
  totalInteractions: number;
  nextTier: {
    tier: string;
    requiredAffinity: number;
    requiredDays: number;
    requiredInteractions: number;
    progress: {
      affinity: number; // 0-100
      days: number; // 0-100
      interactions: number; // 0-100
      overall: number; // 0-100
    };
  } | null;
  status: 'active' | 'warned' | 'dormant' | 'fragile' | null;
  rarityTier: string | null;
}

interface BondProgressState {
  bondProgress: BondProgress | null;
  loading: boolean;
  error: string | null;
}

type SubscriberCallback = (state: BondProgressState) => void;

interface PollingInstance {
  state: BondProgressState;
  subscribers: Set<SubscriberCallback>;
  pollingIntervalId: NodeJS.Timeout | null;
  lastFetch: number;
  onError?: (error: Error) => void;
  onUpdate?: (progress: BondProgress) => void;
}

/**
 * Singleton manager for bond progress polling
 * Ensures only one polling interval per agentId regardless of how many components use it
 */
class BondProgressManager {
  private instances = new Map<string, PollingInstance>();

  /**
   * Subscribe to bond progress updates for an agent
   * Returns cleanup function to unsubscribe
   */
  subscribe(
    agentId: string,
    callback: SubscriberCallback,
    options: {
      pollingInterval: number;
      enabled: boolean;
      onError?: (error: Error) => void;
      onUpdate?: (progress: BondProgress) => void;
    }
  ) {
    // Get or create instance for this agentId
    const instance = this.getInstance(agentId, options.pollingInterval);

    // Add subscriber
    instance.subscribers.add(callback);

    // Store callbacks
    if (options.onError) instance.onError = options.onError;
    if (options.onUpdate) instance.onUpdate = options.onUpdate;

    // Immediately send current state to new subscriber
    callback(instance.state);

    // Start polling if enabled and not already polling
    if (options.enabled && !instance.pollingIntervalId) {
      this.startPolling(agentId, options);
    }

    // Return cleanup function
    return () => {
      instance.subscribers.delete(callback);

      // If no more subscribers, stop polling and cleanup
      if (instance.subscribers.size === 0) {
        this.stopPolling(agentId);
        this.instances.delete(agentId);
        console.log(`[BondProgress] Cleaned up instance for agent ${agentId}`);
      }
    };
  }

  /**
   * Get or create polling instance for agentId
   */
  private getInstance(agentId: string, pollingInterval: number): PollingInstance {
    if (!this.instances.has(agentId)) {
      this.instances.set(agentId, {
        state: {
          bondProgress: null,
          loading: true,
          error: null,
        },
        subscribers: new Set(),
        pollingIntervalId: null,
        lastFetch: 0,
      });
    }
    return this.instances.get(agentId)!;
  }

  /**
   * Start polling for an agent
   */
  private startPolling(
    agentId: string,
    options: {
      pollingInterval: number;
      enabled: boolean;
      onError?: (error: Error) => void;
      onUpdate?: (progress: BondProgress) => void;
    }
  ) {
    const instance = this.instances.get(agentId);
    if (!instance || instance.pollingIntervalId) return;

    console.log(
      `[BondProgress] Started polling for agent ${agentId} (interval: ${options.pollingInterval}ms)`
    );

    // Immediate fetch
    this.fetchBondProgress(agentId, options);

    // Set up interval
    instance.pollingIntervalId = setInterval(() => {
      if (options.enabled) {
        this.fetchBondProgress(agentId, options);
      }
    }, options.pollingInterval);
  }

  /**
   * Stop polling for an agent
   */
  private stopPolling(agentId: string) {
    const instance = this.instances.get(agentId);
    if (!instance) return;

    if (instance.pollingIntervalId) {
      clearInterval(instance.pollingIntervalId);
      instance.pollingIntervalId = null;
      console.log(`[BondProgress] Stopped polling for agent ${agentId}`);
    }
  }

  /**
   * Fetch bond progress from API
   */
  private async fetchBondProgress(
    agentId: string,
    options: {
      onError?: (error: Error) => void;
      onUpdate?: (progress: BondProgress) => void;
    }
  ) {
    const instance = this.instances.get(agentId);
    if (!instance) return;

    // Rate limiting: Don't fetch more than once every 30 seconds
    const now = Date.now();
    if (now - instance.lastFetch < 30000) {
      return;
    }

    try {
      const res = await fetch(`/api/bonds/progress/${agentId}`);

      if (!res.ok) {
        if (res.status === 404) {
          // No bond exists yet - this is normal
          const noBondState: BondProgress = {
            hasBond: false,
            currentTier: null,
            currentAffinityLevel: 0,
            durationDays: 0,
            totalInteractions: 0,
            nextTier: null,
            status: null,
            rarityTier: null,
          };

          // Update state
          this.updateState(agentId, {
            bondProgress: noBondState,
            loading: false,
            error: null,
          });

          instance.lastFetch = now;
          return;
        }

        if (res.status === 401) {
          // User not authenticated - don't spam errors
          return;
        }

        throw new Error('Failed to fetch bond progress');
      }

      const data: BondProgress = await res.json();

      // Check if bond progress actually changed
      const prevProgress = instance.state.bondProgress;
      const hasChanged =
        !prevProgress ||
        prevProgress.currentTier !== data.currentTier ||
        prevProgress.currentAffinityLevel !== data.currentAffinityLevel ||
        prevProgress.totalInteractions !== data.totalInteractions;

      // Update state
      this.updateState(agentId, {
        bondProgress: data,
        loading: false,
        error: null,
      });

      instance.lastFetch = now;

      // Trigger onUpdate callback if progress changed
      if (hasChanged && options.onUpdate) {
        options.onUpdate(data);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');

      console.error(`[BondProgress] Error fetching for agent ${agentId}:`, error);

      // Update error state
      this.updateState(agentId, {
        bondProgress: instance.state.bondProgress, // Keep previous data
        loading: false,
        error: error.message,
      });

      // Trigger onError callback
      if (options.onError) {
        options.onError(error);
      }
    }
  }

  /**
   * Update state and notify all subscribers
   */
  private updateState(agentId: string, newState: BondProgressState) {
    const instance = this.instances.get(agentId);
    if (!instance) return;

    instance.state = newState;

    // Notify all subscribers
    instance.subscribers.forEach((callback) => {
      callback(newState);
    });
  }

  /**
   * Manually refresh bond progress for an agent
   */
  refresh(agentId: string) {
    const instance = this.instances.get(agentId);
    if (!instance) return;

    // Reset rate limit to allow immediate fetch
    instance.lastFetch = 0;

    this.fetchBondProgress(agentId, {
      onError: instance.onError,
      onUpdate: instance.onUpdate,
    });
  }
}

// Global singleton instance
const manager = new BondProgressManager();

/**
 * Hook options
 */
interface UseBondProgressOptions {
  /**
   * Enable/disable polling
   * @default true
   */
  enabled?: boolean;

  /**
   * Polling interval in milliseconds
   * @default 600000 (10 minutes)
   */
  pollingInterval?: number;

  /**
   * Callback when bond progress changes
   */
  onUpdate?: (progress: BondProgress) => void;

  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void;
}

/**
 * Hook to get bond progress for an agent with shared singleton polling
 *
 * Multiple components can use this hook with the same agentId without creating
 * multiple polling intervals. The state is shared between all instances.
 */
export function useBondProgress(
  agentId: string,
  options: UseBondProgressOptions = {}
) {
  const {
    enabled = true,
    pollingInterval = 600000, // 10 minutes default
    onUpdate,
    onError,
  } = options;

  const [state, setState] = useState<BondProgressState>({
    bondProgress: null,
    loading: true,
    error: null,
  });

  // Store callbacks in refs to prevent recreating subscription
  const onUpdateRef = useRef(onUpdate);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Stable refresh function
  const refresh = useCallback(() => {
    if (agentId) {
      manager.refresh(agentId);
    }
  }, [agentId]);

  // Subscribe to manager
  useEffect(() => {
    if (!agentId) {
      setState({
        bondProgress: null,
        loading: false,
        error: 'No agentId provided',
      });
      return;
    }

    const cleanup = manager.subscribe(agentId, setState, {
      pollingInterval,
      enabled,
      onError: (error) => onErrorRef.current?.(error),
      onUpdate: (progress) => onUpdateRef.current?.(progress),
    });

    return cleanup;
  }, [agentId, pollingInterval, enabled]);

  return {
    bondProgress: state.bondProgress,
    loading: state.loading,
    error: state.error,
    refresh,
  };
}
