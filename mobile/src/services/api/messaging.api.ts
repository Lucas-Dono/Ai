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
    const response = await apiClient.get('/api/messages/conversations') as any;
    return response.data as Conversation[];
  },

  /**
   * Crear o obtener conversación
   */
  async createConversation(participants: string[], title?: string) {
    const response = await apiClient.post('/api/messages/conversations', {
      participants,
      title,
    });
    return response.data as Conversation;
  },

  /**
   * Obtener mensajes de una conversación
   */
  async getMessages(conversationId: string, params?: { page?: number; limit?: number }) {
    const response = await apiClient.get(`/messages/conversations/${conversationId}`, {
      params,
    });
    return response.data;
  },

  /**
   * Enviar mensaje
   */
  async sendMessage(conversationId: string, content: string, attachments?: any) {
    const response = await apiClient.post(
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
    const response = await apiClient.post(`/messages/conversations/${conversationId}/read`) as any;
    return response.data;
  },

  /**
   * Eliminar mensaje
   */
  async deleteMessage(messageId: string) {
    const response = await apiClient.delete(`/messages/${messageId}`) as any;
    return response.data;
  },

  /**
   * Buscar mensajes
   */
  async searchMessages(query: string, limit?: number) {
    const response = await apiClient.get('/api/messages/search', {
      params: { q: query, limit },
    });
    return response.data as Message[];
  },
};
