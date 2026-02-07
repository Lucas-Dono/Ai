/**
 * Messaging API Client - Wrapper para endpoints de mensajería
 */

import { apiClient } from './client';

export interface Conversation {
  id: string;
  title?: string;
  lastActivityAt: string;
  participants: Array<{
    userId: string;
    user: {
      id: string;
      name: string;
      image?: string;
    };
  }>;
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    sender: {
      id: string;
      name: string;
    };
  };
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: any;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image?: string;
  };
}

export const messagingApi = {
  /**
   * Obtener conversaciones
   */
  async getConversations() {
    const response: any = await apiClient.get('/api/messages/conversations');
    return response.data as Conversation[];
  },

  /**
   * Crear o obtener conversación
   */
  async createConversation(participants: string[], title?: string) {
    const response: any = await apiClient.post('/api/messages/conversations', {
      participants,
      title,
    });
    return response.data as Conversation;
  },

  /**
   * Obtener mensajes de una conversación
   */
  async getMessages(conversationId: string, params?: { page?: number; limit?: number }) {
    const response: any = await apiClient.get(`/messages/conversations/${conversationId}`, {
      params,
    });
    return response.data as any;
  },

  /**
   * Enviar mensaje
   */
  async sendMessage(conversationId: string, content: string, attachments?: any) {
    const response: any = await apiClient.post(
      `/messages/conversations/${conversationId}/send`,
      {
        content,
        attachments,
      }
    );
    return response.data as Message;
  },

  /**
   * Marcar conversación como leída
   */
  async markAsRead(conversationId: string) {
    const response: any = await apiClient.post(`/messages/conversations/${conversationId}/read`);
    return response.data as any;
  },

  /**
   * Eliminar mensaje
   */
  async deleteMessage(messageId: string) {
    const response: any = await apiClient.delete(`/messages/${messageId}`);
    return response.data as any;
  },

  /**
   * Buscar mensajes
   */
  async searchMessages(query: string, limit?: number) {
    const response: any = await apiClient.get('/api/messages/search', {
      params: { q: query, limit },
    });
    return response.data as Message[];
  },
};
