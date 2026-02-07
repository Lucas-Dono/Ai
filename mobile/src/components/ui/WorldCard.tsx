/**
 * Card de mundo/IA para mostrar en feeds
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';

interface WorldCardProps {
  id: string;
  name: string;
  description: string;
  image?: string;
  category?: string;
  messagesCount?: number;
  isActive?: boolean;
  onPress: () => void;
}

export function WorldCard({
  name,
  description,
  image,
  category,
  messagesCount = 0,
  isActive = false,
  onPress,
}: WorldCardProps) {

  return (
    <TouchableOpacity
      style={[styles.container, shadows.md]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Imagen de fondo con gradiente overlay */}
      <View style={styles.imageContainer}>
        {image ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
          </View>
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Ionicons name="planet" size={32} color={colors.primary[300]} />
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {/* Badge de categoría */}
        {category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        )}

        {/* Status badge si está activo */}
        {isActive && (
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>Activo</Text>
          </View>
        )}

        {/* Título y descripción */}
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>

        {/* Footer con stats */}
        <View style={styles.footer}>
          <View style={styles.stat}>
            <Ionicons name="chatbubble-outline" size={12} color={colors.text.tertiary} />
            <Text style={styles.statText}>{messagesCount || 0}</Text>
          </View>

          <Ionicons name="chevron-forward" size={14} color={colors.text.tertiary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
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
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    position: 'relative',
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
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary[500] + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    color: colors.primary[400],
    fontWeight: typography.fontWeight.semibold,
  },
  activeBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success.main + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.success.main,
    marginRight: 3,
  },
  activeText: {
    fontSize: 10,
    color: colors.success.light,
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
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
});
