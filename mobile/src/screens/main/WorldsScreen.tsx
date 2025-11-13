/**
 * Pantalla de mundos (conversaciones) - Estilo WhatsApp/Telegram
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MainStackParamList } from '../../navigation/types';
import { WorldsService, buildAvatarUrl } from '../../services/api';
import worldApi from '../../services/api/world.api';
import { colors, spacing, typography, borderRadius } from '../../theme';

type WorldsScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList>;
};

interface World {
  id: string;
  name: string;
  description: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  isActive?: boolean;
  avatar?: string;
  category?: string;
}

// Generar gradiente basado en el nombre
const generateGradient = (name: string): string[] => {
  const gradients = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
};

// Formatear tiempo relativo
const formatTime = (date?: Date): string => {
  if (!date) return '';

  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return new Date(date).toLocaleDateString('es', { day: '2-digit', month: '2-digit' });
};

export default function WorldsScreen({ navigation }: WorldsScreenProps) {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWorlds();
  }, []);

  const loadWorlds = async () => {
    try {
      setLoading(true);
      const response: any = await WorldsService.list({ limit: 50 });

      if (response?.worlds) {
        const mapped = response.worlds.map((world: any) => ({
          id: world.id,
          name: world.name,
          description: world.description,
          lastMessage: world.lastMessage?.content || world.description,
          lastMessageTime: world.updatedAt ? new Date(world.updatedAt) : undefined,
          unreadCount: 0, // Implementar después
          isActive: world.status === 'active',
          avatar: buildAvatarUrl(world.agents?.[0]?.avatar),
          category: world.category,
        }));

        // Ordenar por última actualización
        mapped.sort((a: World, b: World) => {
          if (!a.lastMessageTime) return 1;
          if (!b.lastMessageTime) return -1;
          return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
        });

        setWorlds(mapped);
      }
    } catch (error) {
      console.error('Error loading worlds:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWorlds();
    setRefreshing(false);
  }, []);

  const renderWorldItem = ({ item }: { item: World }) => {
    const gradientColors = generateGradient(item.name);

    return (
      <TouchableOpacity
        style={styles.worldItem}
        onPress={() => navigation.navigate('Chat', { worldId: item.id })}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={gradientColors as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          )}

          {/* Online indicator */}
          {item.isActive && (
            <View style={styles.onlineIndicator} />
          )}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <Text style={styles.worldName} numberOfLines={1}>
              {item.name || 'Sin nombre'}
            </Text>
            {item.lastMessageTime && (
              <Text style={styles.timestamp}>
                {formatTime(item.lastMessageTime)}
              </Text>
            )}
          </View>

          {/* Last message row */}
          <View style={styles.messageRow}>
            <Text
              style={[
                styles.lastMessage,
                (item.unreadCount ?? 0) > 0 && styles.lastMessageUnread
              ]}
              numberOfLines={1}
            >
              {item.lastMessage || item.description || 'Sin descripción'}
            </Text>
          </View>

          {/* Category badge */}
          {item.category && typeof item.category === 'string' && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
        </View>

        {/* Unread badge */}
        {(item.unreadCount ?? 0) > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {item.unreadCount! > 99 ? '99+' : item.unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <LinearGradient
          colors={[colors.primary[500], colors.secondary[500]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyIconGradient}
        >
          <Ionicons name="planet-outline" size={64} color="rgba(255,255,255,0.9)" />
        </LinearGradient>
      </View>

      <Text style={styles.emptyTitle}>No tienes conversaciones</Text>
      <Text style={styles.emptySubtitle}>
        Explora compañeros increíbles en la página de inicio
      </Text>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
      >
        <LinearGradient
          colors={[colors.primary[500], colors.primary[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.createButtonGradient}
        >
          <Ionicons name="home" size={20} color="#fff" />
          <Text style={styles.createButtonText}> Ir al Inicio</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mundos</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mundos</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('CreateWorld')}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.primary[500]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={worlds}
        renderItem={renderWorldItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          worlds.length === 0 && styles.listEmpty
        ]}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingVertical: spacing.xs,
  },
  listEmpty: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  worldItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background.elevated,
  },
  avatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success.main,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  worldName: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lastMessage: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  lastMessageUnread: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary[500] + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: 2,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[400],
    fontWeight: typography.fontWeight.semibold,
  },
  unreadBadge: {
    backgroundColor: colors.primary[500],
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: spacing.sm,
  },
  unreadText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: spacing.lg + 56 + spacing.md, // Alinear con el texto
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  emptyIconContainer: {
    marginBottom: spacing.xl,
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  createButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  createButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
});
