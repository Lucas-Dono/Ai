/**
 * Notification API Client - Wrapper para endpoints de notificaciones
 */

import { apiClient } from './client';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  metadata: any;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  /**
   * Obtener notificaciones del usuario
   */
  async list(params?: { page?: number; limit?: number }) {
    const response: any = await apiClient.get('/api/community/notifications', { params });
    return response.data as any;
  },

  /**
   * Obtener conteo de no leídas
   */
  async getUnreadCount() {
    const response: any = await apiClient.get('/api/community/notifications/unread-count');
    return response.data as any;
  },

  /**
   * Marcar como leída
   */
  async markAsRead(id: string) {
    const response: any = await apiClient.patch(`/community/notifications/${id}`);
    return response.data as any;
  },

  /**
   * Marcar todas como leídas
   */
  async markAllAsRead() {
    const response: any = await apiClient.post('/api/community/notifications/mark-all-read');
    return response.data as any;
  },

  /**
   * Eliminar notificación
   */
  async delete(id: string) {
    const response: any = await apiClient.delete(`/community/notifications/${id}`);
    return response.data as any;
  },

  /**
   * Eliminar todas
   */
  async deleteAll() {
    const response: any = await apiClient.delete('/api/community/notifications');
    return response.data as any;
  },
};
