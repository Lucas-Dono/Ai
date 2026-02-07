/**
 * Notifications Screen - Pantalla de notificaciones
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { notificationApi } from '../../services/api';
import { useNotifications } from '../../contexts/NotificationContext';
import { Ionicons } from '@expo/vector-icons';

const NOTIFICATION_ICONS: Record<string, string> = {
  new_post: 'newspaper',
  new_comment: 'chatbubble',
  comment_reply: 'arrow-undo',
  post_milestone: 'trophy',
  award_received: 'gift',
  answer_accepted: 'checkmark-circle',
  new_follower: 'person-add',
  event_invitation: 'calendar',
  event_reminder: 'alarm',
  badge_earned: 'medal',
  level_up: 'arrow-up-circle',
  direct_message: 'mail',
  project_accepted: 'checkmark-done',
};

const NOTIFICATION_COLORS: Record<string, string> = {
  new_post: '#3b82f6',
  new_comment: '#8b5cf6',
  comment_reply: '#8b5cf6',
  post_milestone: '#f59e0b',
  award_received: '#ec4899',
  answer_accepted: '#10b981',
  new_follower: '#06b6d4',
  event_invitation: '#3b82f6',
  event_reminder: '#f59e0b',
  badge_earned: '#f59e0b',
  level_up: '#10b981',
  direct_message: '#6366f1',
  project_accepted: '#10b981',
};

export const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { markAsRead, markAllAsRead, refreshUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        setPage(1);
      } else {
        setLoading(true);
      }

      const result = await notificationApi.list({
        page: refresh ? 1 : page,
        limit: 25,
      });

      if (refresh) {
        setNotifications(result.notifications);
      } else {
        setNotifications([...notifications, ...result.notifications]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleNotificationPress = async (notification: any) => {
    // Marcar como leída
    if (!notification.isRead) {
      await markAsRead(notification.id);
      setNotifications(
        notifications.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
    }

    // Navegar según actionUrl
    if (notification.actionUrl) {
      const url = notification.actionUrl;

      if (url.includes('/community/posts/')) {
        const postId = url.split('/').pop();
        navigation.navigate('PostDetail', { postId });
      } else if (url.includes('/community/events/')) {
        const eventId = url.split('/').pop();
        navigation.navigate('EventDetail', { eventId });
      } else if (url.includes('/messages/')) {
        const conversationId = url.split('/').pop();
        navigation.navigate('Conversation', { conversationId });
      } else if (url === '/profile') {
        // Navigate to Profile tab in MainTabs
        navigation.navigate('MainTabs', { screen: 'Profile' });
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const renderNotification = ({ item }: { item: any }) => {
    const icon = NOTIFICATION_ICONS[item.type] || 'notifications';
    const color = NOTIFICATION_COLORS[item.type] || '#6b7280';

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.isRead && styles.notificationUnread]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>

        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.notificationTime}>
            {formatTimeAgo(new Date(item.createdAt))}
          </Text>
        </View>

        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        {notifications.some((n) => !n.isRead) && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllButton}>Marcar todas</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              loadNotifications(true);
              refreshUnreadCount();
            }}
          />
        }
        onEndReached={() => {
          if (!loading) {
            setPage(page + 1);
            loadNotifications();
          }
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>No tienes notificaciones</Text>
            </View>
          )
        }
      />
    </View>
  );
};

// Helper function para formatear tiempo relativo
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Hace un momento';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)}d`;

  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  markAllButton: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3b82f6',
  },
  listContent: {
    paddingVertical: 8,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  notificationUnread: {
    backgroundColor: '#eff6ff',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
    marginLeft: 8,
  },
  loader: {
    marginTop: 32,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
});
