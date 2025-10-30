/**
 * Hybrid Sync Service
 *
 * Intelligent synchronization between local cache and backend
 * - Offline-first: Always load from cache immediately
 * - Background sync: Fetch updates from backend when online
 * - Conflict resolution: Merge local and remote messages
 * - Pending uploads: Retry failed messages when connection returns
 */

import NetInfo from '@react-native-community/netinfo';
import { apiClient } from './api';
import { CacheService, CachedMessage, CachedAgent } from './cache';

export interface SyncResult {
  source: 'cache' | 'backend' | 'hybrid';
  messages: CachedMessage[];
  agent: CachedAgent | null;
  hasNewMessages: boolean;
  isOnline: boolean;
}

export const SyncService = {
  /**
   * Check if device is online
   */
  async isOnline(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected ?? false;
    } catch (error) {
      console.error('[Sync] Error checking connection:', error);
      return false;
    }
  },

  /**
   * Sync messages for an agent (hybrid approach with pagination)
   *
   * 1. Load from cache immediately (fast)
   * 2. Fetch from backend in background (if online) - only recent messages
   * 3. Merge and update cache
   * 4. Return combined result
   *
   * Note: Only syncs the most recent messages (default 100) for performance.
   * Older messages remain in cache until explicitly loaded.
   */
  async syncMessages(
    agentId: string,
    userId: string,
    limit: number = 100
  ): Promise<SyncResult> {
    console.log('[Sync] Starting hybrid sync for agent:', agentId);

    // Step 1: Load from cache immediately (ALWAYS)
    const cachedMessages = await CacheService.loadMessages(agentId, userId);
    const cachedAgent = await CacheService.loadAgent(agentId);

    console.log(`[Sync] Loaded ${cachedMessages.length} messages from cache`);

    // Step 2: Check if online
    const online = await this.isOnline();

    if (!online) {
      console.log('[Sync] Offline - using cache only');
      return {
        source: 'cache',
        messages: cachedMessages,
        agent: cachedAgent,
        hasNewMessages: false,
        isOnline: false,
      };
    }

    // Step 3: Fetch from backend (online)
    try {
      console.log(`[Sync] Online - fetching last ${limit} messages from backend...`);

      const [messagesResponse, agentResponse] = await Promise.allSettled([
        apiClient.get(`/api/agents/${agentId}/message?limit=${limit}`),
        apiClient.get(`/api/agents/${agentId}`),
      ]);

      let backendMessages: any[] = [];
      let backendAgent: any = null;

      // Extract messages if successful
      if (messagesResponse.status === 'fulfilled' && messagesResponse.value) {
        const data: any = messagesResponse.value;
        backendMessages = data.messages || [];
        console.log(`[Sync] Fetched ${backendMessages.length} messages from backend`);
      } else {
        console.warn('[Sync] Failed to fetch messages from backend, using cache');
      }

      // Extract agent if successful
      if (agentResponse.status === 'fulfilled' && agentResponse.value) {
        backendAgent = agentResponse.value;
        console.log(`[Sync] Fetched agent data from backend: ${backendAgent.name}`);
      } else {
        console.warn('[Sync] Failed to fetch agent from backend, using cache');
      }

      // Step 4: Merge messages (deduplicate by ID)
      const merged = this.mergeMessages(cachedMessages, backendMessages);
      const hasNewMessages = merged.length > cachedMessages.length;
      const messagesDeleted = merged.length < cachedMessages.length;

      // Step 5: Update cache with backend data
      // Important: ALWAYS update cache when online to sync deletions (e.g., conversation reset)
      if (backendMessages.length >= 0) {
        await CacheService.saveMessages(agentId, userId, merged);

        if (messagesDeleted) {
          console.log(`[Sync] ⚠️  Messages deleted on server (${cachedMessages.length} → ${merged.length}). Cache updated.`);
        } else if (hasNewMessages) {
          console.log(`[Sync] 📥 New messages from server (${cachedMessages.length} → ${merged.length}). Cache updated.`);
        } else {
          console.log(`[Sync] ✅ Cache is in sync (${merged.length} messages)`);
        }
      }

      // Step 6: Update agent cache
      if (backendAgent) {
        const agentData: CachedAgent = {
          id: backendAgent.id,
          name: backendAgent.name,
          description: backendAgent.description,
          avatar: backendAgent.avatar,
          personality: backendAgent.personality,
          kind: backendAgent.kind,
          lastUpdated: new Date().toISOString(),
        };
        await CacheService.saveAgent(agentData);
      }

      // Step 7: Save sync timestamp
      await CacheService.saveLastSync(agentId, userId);

      return {
        source: 'hybrid',
        messages: merged,
        agent: backendAgent ? {
          id: backendAgent.id,
          name: backendAgent.name,
          description: backendAgent.description,
          avatar: backendAgent.avatar,
          personality: backendAgent.personality,
          kind: backendAgent.kind,
          lastUpdated: new Date().toISOString(),
        } : cachedAgent,
        hasNewMessages,
        isOnline: true,
      };

    } catch (error) {
      console.error('[Sync] Error syncing with backend:', error);

      // Fallback to cache on error
      return {
        source: 'cache',
        messages: cachedMessages,
        agent: cachedAgent,
        hasNewMessages: false,
        isOnline: false,
      };
    }
  },

  /**
   * Merge local and backend messages
   *
   * Strategy: Backend is source of truth
   * - Use all messages from backend (synced)
   * - Add any local-only messages (pending upload)
   * - Discard cached messages not in backend (they were deleted)
   */
  mergeMessages(
    cachedMessages: CachedMessage[],
    backendMessages: any[]
  ): CachedMessage[] {
    // Convert backend messages to CachedMessage format
    const backendConverted: CachedMessage[] = backendMessages.map(msg => ({
      id: msg.id,
      content: msg.content,
      sender: msg.role === 'user' ? 'user' as const : 'agent' as const,
      timestamp: msg.createdAt,
      messageType: 'text' as const,
      agentName: msg.agentName,
      agentAvatar: msg.agentAvatar,
      synced: true,
      localOnly: false,
    }));

    // Create a map with BACKEND messages as base (source of truth)
    const messageMap = new Map<string, CachedMessage>();

    // Add all backend messages first
    backendConverted.forEach(msg => {
      messageMap.set(msg.id, msg);
    });

    // Only add cached messages that are pending upload (localOnly)
    cachedMessages.forEach(msg => {
      if (msg.localOnly && !messageMap.has(msg.id)) {
        messageMap.set(msg.id, msg);
      }
    });

    // Convert back to array and sort by timestamp
    const merged = Array.from(messageMap.values()).sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    console.log(`[Sync] Merged: ${backendConverted.length} from backend + ${merged.length - backendConverted.length} pending = ${merged.length} total`);

    return merged;
  },

  /**
   * Upload pending messages to backend
   */
  async uploadPendingMessages(
    agentId: string,
    userId: string
  ): Promise<number> {
    const online = await this.isOnline();
    if (!online) {
      console.log('[Sync] Offline - skipping upload');
      return 0;
    }

    const pending = await CacheService.getUnsyncedMessages(agentId, userId);
    if (pending.length === 0) {
      console.log('[Sync] No pending messages to upload');
      return 0;
    }

    console.log(`[Sync] Uploading ${pending.length} pending messages...`);

    let uploaded = 0;

    for (const message of pending) {
      try {
        // Upload to backend
        const response: any = await apiClient.post(`/api/agents/${agentId}/message`, {
          content: message.content,
          messageType: message.messageType,
        });

        // Update cache with real ID and mark as synced
        await CacheService.updateMessage(agentId, userId, message.id, {
          id: response.userMessage.id, // Use real ID from backend
          synced: true,
          localOnly: false,
        });

        uploaded++;
        console.log(`[Sync] Uploaded message ${message.id}`);

      } catch (error) {
        console.error(`[Sync] Failed to upload message ${message.id}:`, error);
        // Keep as pending for next retry
      }
    }

    console.log(`[Sync] Uploaded ${uploaded}/${pending.length} pending messages`);
    return uploaded;
  },

  /**
   * Add optimistic message (save locally, upload later)
   */
  async addOptimisticMessage(
    agentId: string,
    userId: string,
    content: string,
    messageType: 'text' | 'audio' | 'gif' = 'text'
  ): Promise<CachedMessage> {
    const message: CachedMessage = {
      id: `temp-${Date.now()}-${Math.random()}`,
      content,
      sender: 'user',
      timestamp: new Date().toISOString(),
      messageType,
      synced: false,
      localOnly: true, // Needs to be uploaded
    };

    // Save to cache immediately
    await CacheService.addMessage(agentId, userId, message);
    console.log('[Sync] Added optimistic message:', message.id);

    // Try to upload in background
    const online = await this.isOnline();
    if (online) {
      this.uploadPendingMessages(agentId, userId).catch(error => {
        console.error('[Sync] Background upload failed:', error);
      });
    }

    return message;
  },

  /**
   * Listen for connection changes and auto-sync
   */
  startConnectionListener(
    agentId: string,
    userId: string,
    onSync: (result: SyncResult) => void
  ): () => void {
    console.log('[Sync] Starting connection listener');

    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false;

      console.log(`[Sync] Connection changed: ${isConnected ? 'ONLINE' : 'OFFLINE'}`);

      if (isConnected) {
        // Back online - sync immediately
        console.log('[Sync] Back online - triggering sync...');

        this.syncMessages(agentId, userId)
          .then(result => {
            console.log('[Sync] Auto-sync completed');
            onSync(result);
          })
          .catch(error => {
            console.error('[Sync] Auto-sync failed:', error);
          });
      }
    });

    return () => {
      console.log('[Sync] Stopping connection listener');
      unsubscribe();
    };
  },
};
