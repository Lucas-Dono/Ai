/**
 * Notification Context - Contexto global para notificaciones
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { notificationApi } from '../services/api/notification.api';
import { pushNotificationService } from '../services/push-notifications';

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Cargar conteo inicial
    refreshUnreadCount();

    // Actualizar badge del ícono de la app
    updateAppBadge();

    // Refrescar cada 60 segundos
    const interval = setInterval(() => {
      refreshUnreadCount();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const refreshUnreadCount = async () => {
    try {
      const result = await notificationApi.getUnreadCount();
      setUnreadCount(result.count);
      await updateAppBadge(result.count);
    } catch (error) {
      console.error('Error refreshing unread count:', error);
    }
  };

  const updateAppBadge = async (count?: number) => {
    try {
      const badgeCount = count !== undefined ? count : unreadCount;
      await pushNotificationService.setBadgeCount(badgeCount);
    } catch (error) {
      console.error('Error updating app badge:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      await refreshUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      await pushNotificationService.clearBadge();
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        refreshUnreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
