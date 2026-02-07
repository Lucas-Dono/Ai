/**
 * Tipos para el sistema de conversaciones y "Mi Círculo"
 */

export interface ConversationWithAgent {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar: string | null;
  staticDescription: string;
  unreadCount: number;
  lastMessageAt: Date | string;
  isPinned: boolean;
  totalMessages: number;
}

export interface RecentConversationsResponse {
  conversations: ConversationWithAgent[];
  totalUnread: number;
}
