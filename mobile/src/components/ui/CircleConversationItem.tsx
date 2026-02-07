/**
 * Item de conversación para la sección "Mi Círculo"
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface CircleConversationItemProps {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unread?: number;
  onPress: () => void;
}

// Generar gradiente basado en el nombre
const generateGradient = (name: string): string[] => {
  const gradients = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
  ];

  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export function CircleConversationItem({
  name,
  avatar,
  lastMessage,
  time,
  unread = 0,
  onPress,
}: CircleConversationItemProps) {
  const gradientColors = generateGradient(name);
  const initials = getInitials(name);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <LinearGradient
            colors={gradientColors as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.initialsText}>{initials}</Text>
          </LinearGradient>
        )}

        {/* Badge de mensajes no leídos */}
        {unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unread > 9 ? '9+' : unread}</Text>
          </View>
        )}
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.time}>{time}</Text>
        </View>

        <Text
          style={[
            styles.lastMessage,
            unread > 0 && styles.unreadMessage
          ]}
          numberOfLines={1}
        >
          {lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary[600],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: colors.background.card,
  },
  unreadText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  time: {
    fontSize: 10,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  lastMessage: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  unreadMessage: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
});
