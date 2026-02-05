/**
 * Local Cache Service for Offline Support
 *
 * Stores messages, agents, and chat data locally for offline access
 * Professional implementation similar to WhatsApp/Telegram
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  MESSAGES: (agentId: string, userId: string) => `@messages:${agentId}:${userId}`,
  AGENT_DATA: (agentId: string) => `@agent:${agentId}`,
  CHAT_LIST: (userId: string) => `@chats:${userId}`,
  LAST_SYNC: (agentId: string, userId: string) => `@sync:${agentId}:${userId}`,
} as const;

export interface CachedMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: string; // ISO string for serialization
  messageType?: 'text' | 'audio' | 'gif';
  audioDuration?: number;
  agentName?: string;
  agentAvatar?: string;
  synced: boolean; // true if saved to backend
  localOnly?: boolean; // true if pending upload
}

export interface CachedAgent {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  personality?: string;
  kind?: string;
  lastUpdated: string;
}

export interface ChatListItem {
  agentId: string;
  agentName: string;
  agentAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const CacheService = {
  // ==================== MESSAGES ====================

  /**
   * Save messages to local cache
   */
  async saveMessages(
    agentId: string,
    userId: string,
    messages: CachedMessage[]
  ): Promise<void> {
    try {
      const key = KEYS.MESSAGES(agentId, userId);
      await AsyncStorage.setItem(key, JSON.stringify(messages));
      console.log(`[Cache] Saved ${messages.length} messages for agent ${agentId}`);
    } catch (error) {
      console.error('[Cache] Error saving messages:', error);
      throw error;
    }
  },

  /**
   * Load messages from local cache
   */
  async loadMessages(
    agentId: string,
    userId: string
  ): Promise<CachedMessage[]> {
    try {
      const key = KEYS.MESSAGES(agentId, userId);
      const data = await AsyncStorage.getItem(key);

      if (!data) {
        console.log(`[Cache] No cached messages for agent ${agentId}`);
        return [];
      }

      const messages: CachedMessage[] = JSON.parse(data);
      console.log(`[Cache] Loaded ${messages.length} messages for agent ${agentId}`);
      return messages;
    } catch (error) {
      console.error('[Cache] Error loading messages:', error);
      return [];
    }
  },

  /**
   * Add a single message to cache (optimistic update)
   */
  async addMessage(
    agentId: string,
    userId: string,
    message: CachedMessage
  ): Promise<void> {
    try {
      const existing = await this.loadMessages(agentId, userId);
      const updated = [...existing, message];
      await this.saveMessages(agentId, userId, updated);
    } catch (error) {
      console.error('[Cache] Error adding message:', error);
    }
  },

  /**
   * Update message status (e.g., mark as synced)
   */
  async updateMessage(
    agentId: string,
    userId: string,
    messageId: string,
    updates: Partial<CachedMessage>
  ): Promise<void> {
    try {
      const existing = await this.loadMessages(agentId, userId);
      const updated = existing.map(msg =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      );
      await this.saveMessages(agentId, userId, updated);
    } catch (error) {
      console.error('[Cache] Error updating message:', error);
    }
  },

  /**
   * Get unsynced messages (pending upload)
   */
  async getUnsyncedMessages(
    agentId: string,
    userId: string
  ): Promise<CachedMessage[]> {
    try {
      const messages = await this.loadMessages(agentId, userId);
      return messages.filter(msg => !msg.synced && msg.localOnly);
    } catch (error) {
      console.error('[Cache] Error getting unsynced messages:', error);
      return [];
    }
  },

  // ==================== AGENT DATA ====================

  /**
   * Save agent data to cache
   */
  async saveAgent(agent: CachedAgent): Promise<void> {
    try {
      const key = KEYS.AGENT_DATA(agent.id);
      await AsyncStorage.setItem(key, JSON.stringify({
        ...agent,
        lastUpdated: new Date().toISOString(),
      }));
      console.log(`[Cache] Saved agent data: ${agent.name}`);
    } catch (error) {
      console.error('[Cache] Error saving agent:', error);
    }
  },

  /**
   * Load agent data from cache
   */
  async loadAgent(agentId: string): Promise<CachedAgent | null> {
    try {
      const key = KEYS.AGENT_DATA(agentId);
      const data = await AsyncStorage.getItem(key);

      if (!data) {
        console.log(`[Cache] No cached data for agent ${agentId}`);
        return null;
      }

      const agent: CachedAgent = JSON.parse(data);
      console.log(`[Cache] Loaded agent data: ${agent.name}`);
      return agent;
    } catch (error) {
      console.error('[Cache] Error loading agent:', error);
      return null;
    }
  },

  // ==================== CHAT LIST ====================

  /**
   * Update chat list with latest message
   */
  async updateChatList(
    userId: string,
    agentId: string,
    agentName: string,
    agentAvatar: string | undefined,
    lastMessage: string
  ): Promise<void> {
    try {
      const key = KEYS.CHAT_LIST(userId);
      const data = await AsyncStorage.getItem(key);
      const chatList: ChatListItem[] = data ? JSON.parse(data) : [];

      // Find or create chat item
      const existingIndex = chatList.findIndex(chat => chat.agentId === agentId);
      const chatItem: ChatListItem = {
        agentId,
        agentName,
        agentAvatar,
        lastMessage,
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
      };

      if (existingIndex >= 0) {
        chatList[existingIndex] = chatItem;
      } else {
        chatList.unshift(chatItem);
      }

      // Sort by most recent
      chatList.sort((a, b) =>
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      await AsyncStorage.setItem(key, JSON.stringify(chatList));
      console.log(`[Cache] Updated chat list`);
    } catch (error) {
      console.error('[Cache] Error updating chat list:', error);
    }
  },

  /**
   * Get chat list for home screen
   */
  async getChatList(userId: string): Promise<ChatListItem[]> {
    try {
      const key = KEYS.CHAT_LIST(userId);
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Cache] Error getting chat list:', error);
      return [];
    }
  },

  // ==================== SYNC TRACKING ====================

  /**
   * Save last sync timestamp
   */
  async saveLastSync(agentId: string, userId: string): Promise<void> {
    try {
      const key = KEYS.LAST_SYNC(agentId, userId);
      await AsyncStorage.setItem(key, new Date().toISOString());
    } catch (error) {
      console.error('[Cache] Error saving sync time:', error);
    }
  },

  /**
   * Get last sync timestamp
   */
  async getLastSync(agentId: string, userId: string): Promise<Date | null> {
    try {
      const key = KEYS.LAST_SYNC(agentId, userId);
      const data = await AsyncStorage.getItem(key);
      return data ? new Date(data) : null;
    } catch (error) {
      console.error('[Cache] Error getting sync time:', error);
      return null;
    }
  },

  // ==================== UTILITIES ====================

  /**
   * Clear all cache for an agent
   */
  async clearAgentCache(agentId: string, userId: string): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(KEYS.MESSAGES(agentId, userId)),
        AsyncStorage.removeItem(KEYS.AGENT_DATA(agentId)),
        AsyncStorage.removeItem(KEYS.LAST_SYNC(agentId, userId)),
      ]);
      console.log(`[Cache] Cleared cache for agent ${agentId}`);
    } catch (error) {
      console.error('[Cache] Error clearing cache:', error);
    }
  },

  /**
   * Get cache statistics
   */
  async getCacheStats(userId: string): Promise<{
    totalChats: number;
    totalMessages: number;
    cacheSize: string;
  }> {
    try {
      const chatList = await this.getChatList(userId);
      let totalMessages = 0;

      for (const chat of chatList) {
        const messages = await this.loadMessages(chat.agentId, userId);
        totalMessages += messages.length;
      }

      return {
        totalChats: chatList.length,
        totalMessages,
        cacheSize: '~calculating~', // Could calculate actual size if needed
      };
    } catch (error) {
      console.error('[Cache] Error getting stats:', error);
      return { totalChats: 0, totalMessages: 0, cacheSize: '0 KB' };
    }
  },

  /**
   * Clear ALL cache data (nuclear option)
   * Use this when:
   * - User logs out
   * - Database was reset
   * - Need to force full re-sync
   */
  async clearAll(): Promise<void> {
    try {
      console.log('[Cache] 🗑️  Clearing ALL cache data...');

      // Get all AsyncStorage keys
      const allKeys = await AsyncStorage.getAllKeys();

      // Filter keys that belong to our app
      const ourKeys = allKeys.filter(
        key =>
          key.startsWith('@messages:') ||
          key.startsWith('@agent:') ||
          key.startsWith('@chats:') ||
          key.startsWith('@sync:')
      );

      console.log(`[Cache] Found ${ourKeys.length} cache keys to delete`);

      if (ourKeys.length > 0) {
        await AsyncStorage.multiRemove(ourKeys);
        console.log('[Cache] ✅ All cache data cleared successfully');
      } else {
        console.log('[Cache] ℹ️  No cache data to clear');
      }
    } catch (error) {
      console.error('[Cache] ❌ Error clearing cache:', error);
      throw error;
    }
  },

  /**
   * Clear cache for a specific user
   */
  async clearUserCache(userId: string): Promise<void> {
    try {
      console.log(`[Cache] 🗑️  Clearing cache for user ${userId}...`);

      const allKeys = await AsyncStorage.getAllKeys();

      // Filter keys that belong to this user
      const userKeys = allKeys.filter(
        key =>
          key.includes(`:${userId}`) ||
          key === KEYS.CHAT_LIST(userId)
      );

      console.log(`[Cache] Found ${userKeys.length} keys for user ${userId}`);

      if (userKeys.length > 0) {
        await AsyncStorage.multiRemove(userKeys);
        console.log('[Cache] ✅ User cache cleared successfully');
      }
    } catch (error) {
      console.error('[Cache] ❌ Error clearing user cache:', error);
      throw error;
    }
  },

  /**
   * Clear cache for a specific agent
   */
  async clearAgentCache(agentId: string, userId?: string): Promise<void> {
    try {
      console.log(`[Cache] 🗑️  Clearing cache for agent ${agentId}...`);

      const keysToDelete: string[] = [
        KEYS.AGENT_DATA(agentId),
      ];

      // If userId provided, also clear messages and sync data
      if (userId) {
        keysToDelete.push(
          KEYS.MESSAGES(agentId, userId),
          KEYS.LAST_SYNC(agentId, userId)
        );
      }

      await AsyncStorage.multiRemove(keysToDelete);
      console.log(`[Cache] ✅ Cleared ${keysToDelete.length} cache keys for agent`);
    } catch (error) {
      console.error('[Cache] ❌ Error clearing agent cache:', error);
      throw error;
    }
  },
};
