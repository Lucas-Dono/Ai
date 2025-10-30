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
    const response = await apiClient.get('/api/community/notifications', { params }) as any;
    return response.data;
  },

  /**
   * Obtener conteo de no leídas
   */
  async getUnreadCount() {
    const response = await apiClient.get('/api/community/notifications/unread-count') as any;
    return response.data;
  },

  /**
   * Marcar como leída
   */
  async markAsRead(id: string) {
    const response = await apiClient.patch(`/community/notifications/${id}`) as any;
    return response.data;
  },

  /**
   * Marcar todas como leídas
   */
  async markAllAsRead() {
    const response = await apiClient.post('/api/community/notifications/mark-all-read') as any;
    return response.data;
  },

  /**
   * Eliminar notificación
   */
  async delete(id: string) {
    const response = await apiClient.delete(`/community/notifications/${id}`) as any;
    return response.data;
  },

  /**
   * Eliminar todas
   */
  async deleteAll() {
    const response = await apiClient.delete('/api/community/notifications') as any;
    return response.data;
  },
};
