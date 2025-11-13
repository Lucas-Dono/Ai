/**
 * useNotifications Hook
 * Hook para manejar notificaciones con SWR
 */

import useSWR, { mutate } from 'swr';
import { useState, useCallback } from 'react';
import type { Notification, NotificationsResponse } from '@/types/notifications';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Error fetching notifications');
  }
  return res.json();
};

interface UseNotificationsOptions {
  page?: number;
  limit?: number;
  filter?: 'all' | 'unread' | 'mentions' | 'interactions';
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { page = 1, limit = 20, filter = 'all' } = options;

  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch notificaciones
  const { data, error, isLoading } = useSWR<NotificationsResponse>(
    `/api/community/notifications?page=${page}&limit=${limit}`,
    fetcher,
    {
      refreshInterval: 30000, // Actualizar cada 30 segundos
      revalidateOnFocus: true,
    }
  );

  // Fetch unread count
  const { data: unreadData } = useSWR<{ count: number }>(
    '/api/community/notifications/unread-count',
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  // Filtrar notificaciones según el filtro
  const filteredNotifications = data?.notifications?.filter((notification) => {
    if (filter === 'unread') {
      return !notification.isRead;
    }
    if (filter === 'mentions') {
      return notification.type === 'mention';
    }
    if (filter === 'interactions') {
      return ['new_comment', 'comment_reply', 'upvote', 'award_received'].includes(
        notification.type
      );
    }
    return true; // 'all'
  }) || [];

  // Marcar como leída
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const res = await fetch(`/api/community/notifications/${notificationId}`, {
        method: 'PATCH',
      });

      if (!res.ok) {
        throw new Error('Error marking notification as read');
      }

      // Revalidar datos
      await mutate(`/api/community/notifications?page=${page}&limit=${limit}`);
      await mutate('/api/community/notifications/unread-count');

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }, [page, limit]);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    setIsMarkingAsRead(true);
    try {
      const res = await fetch('/api/community/notifications/mark-all-read', {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Error marking all as read');
      }

      // Revalidar datos
      await mutate(`/api/community/notifications?page=${page}&limit=${limit}`);
      await mutate('/api/community/notifications/unread-count');

      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    } finally {
      setIsMarkingAsRead(false);
    }
  }, [page, limit]);

  // Eliminar notificación
  const deleteNotification = useCallback(async (notificationId: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/community/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Error deleting notification');
      }

      // Revalidar datos
      await mutate(`/api/community/notifications?page=${page}&limit=${limit}`);
      await mutate('/api/community/notifications/unread-count');

      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [page, limit]);

  // Eliminar todas
  const deleteAllNotifications = useCallback(async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/community/notifications', {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Error deleting all notifications');
      }

      // Revalidar datos
      await mutate(`/api/community/notifications?page=${page}&limit=${limit}`);
      await mutate('/api/community/notifications/unread-count');

      return true;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [page, limit]);

  // Refetch manual
  const refetch = useCallback(() => {
    mutate(`/api/community/notifications?page=${page}&limit=${limit}`);
    mutate('/api/community/notifications/unread-count');
  }, [page, limit]);

  return {
    notifications: filteredNotifications,
    unreadCount: unreadData?.count || 0,
    total: data?.total || 0,
    totalPages: data?.totalPages || 0,
    currentPage: data?.page || page,
    isLoading,
    isError: !!error,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refetch,
    isMarkingAsRead,
    isDeleting,
  };
}

// Hook para solo el contador de no leídas
export function useUnreadCount() {
  const { data, error } = useSWR<{ count: number }>(
    '/api/community/notifications/unread-count',
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    count: data?.count || 0,
    isLoading: !error && !data,
    isError: !!error,
  };
}
