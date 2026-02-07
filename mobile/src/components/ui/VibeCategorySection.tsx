/**
 * Sección de categoría de vibe con carrusel horizontal
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../../theme';

export type VibeType = 'love' | 'chaos' | 'conflict' | 'stable';

interface VibeItem {
  id: string;
  name: string;
  role?: string;
  image?: string;
}

interface VibeCategorySectionProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  items: VibeItem[];
  onItemPress: (id: string) => void;
  onViewAll?: () => void;
}

// Generar gradiente para placeholder
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

export function VibeCategorySection({
  title,
  subtitle,
  icon,
  color,
  items,
  onItemPress,
  onViewAll,
}: VibeCategorySectionProps) {
  const renderItem = ({ item }: { item: VibeItem }) => {
    const gradientColors = generateGradient(item.name);
    const initials = getInitials(item.name);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onItemPress(item.id)}
        activeOpacity={0.8}
      >
        {/* Imagen de fondo */}
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={gradientColors as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.image}
            >
              <Text style={styles.initialsText}>{initials}</Text>
            </LinearGradient>
          )}

          {/* Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(15, 17, 26, 0.95)']}
            locations={[0.4, 1]}
            style={styles.overlay}
          />
        </View>

        {/* Información */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {item.role && (
            <Text style={styles.role} numberOfLines={1}>
              {item.role}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={18} color={color} />
          </View>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>

        {onViewAll && (
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Carrusel */}
      <FlatList
        horizontal
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: 144,
    height: 192,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.card,
    marginRight: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  name: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  role: {
    fontSize: 10,
    color: colors.text.secondary,
  },
});
