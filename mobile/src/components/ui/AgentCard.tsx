/**
 * Card de agente/compañero para mostrar en feeds
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';

interface AgentCardProps {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  featured?: boolean;
  onPress: () => void;
  onChatPress?: () => void;
}

// Generar gradiente basado en el nombre
const generateGradient = (name: string): string[] => {
  const gradients = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#30cfd0', '#330867'],
    ['#a8edea', '#fed6e3'],
    ['#ff9a9e', '#fecfef'],
    ['#ffecd2', '#fcb69f'],
    ['#ff6e7f', '#bfe9ff'],
  ];

  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
};

// Obtener iniciales
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export function AgentCard({
  name,
  description,
  avatar,
  featured = false,
  onPress,
  onChatPress,
}: AgentCardProps) {
  const gradientColors = generateGradient(name);
  const initials = getInitials(name);

  return (
    <TouchableOpacity
      style={[styles.container, shadows.md]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Imagen de fondo con gradiente overlay */}
      <View style={styles.imageContainer}>
        {avatar ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: avatar }} style={styles.image} resizeMode="cover" />
          </View>
        ) : (
          <LinearGradient
            colors={gradientColors as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.image, styles.placeholderImage]}
          >
            <Text style={styles.initialsText}>{initials}</Text>
          </LinearGradient>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {/* Badge de featured */}
        {featured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={10} color={colors.warning.main} />
            <Text style={styles.featuredText}> Premium</Text>
          </View>
        )}

        {/* Título */}
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>

        {/* Descripción */}
        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}

        {/* Footer con botón */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={(e) => {
              e.stopPropagation();
              if (onChatPress) onChatPress();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble" size={14} color={colors.primary[400]} />
            <Text style={styles.chatText}> Chatear</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 280,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.card,
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '150%', // Más alta para mostrar la parte superior
    position: 'absolute',
    top: 0, // Alinear arriba para mostrar la cara
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  initialsText: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: spacing.sm,
    paddingTop: spacing.xs,
    flex: 1,
    justifyContent: 'space-between',
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warning.main + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredText: {
    fontSize: 10,
    color: colors.warning.light,
    fontWeight: typography.fontWeight.semibold,
  },
  name: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  description: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
  footer: {
    marginTop: 'auto',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500] + '20',
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  chatText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[400],
    fontWeight: typography.fontWeight.semibold,
  },
});
