/**
 * Card pequeña para mostrar compañeros en scroll horizontal
 * Diseño moderno inspirado en home.tsx
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface CompanionCardProps {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  status?: 'online' | 'offline';
  onPress: () => void;
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

export function CompanionCard({
  name,
  role,
  avatar,
  status = 'offline',
  onPress,
}: CompanionCardProps) {
  const gradientColors = generateGradient(name);
  const initials = getInitials(name);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Imagen de fondo */}
      <View style={styles.imageContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.image} resizeMode="cover" />
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

        {/* Overlay con gradiente */}
        <LinearGradient
          colors={['transparent', 'rgba(15, 17, 26, 0.95)']}
          locations={[0.3, 1]}
          style={styles.overlay}
        />

        {/* Indicador de estado online/offline */}
        <View style={[
          styles.statusDot,
          { backgroundColor: status === 'online' ? '#4ADE80' : colors.neutral[500] }
        ]} />
      </View>

      {/* Información del compañero */}
      <View style={styles.infoContainer}>
        {/* Línea divisoria decorativa */}
        <View style={styles.divider} />

        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>

        {role && (
          <Text style={styles.role} numberOfLines={2}>
            {role}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 144,
    height: 192,
    borderRadius: 24,
    backgroundColor: colors.background.card,
    marginRight: spacing.md,
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
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  statusDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.background.card,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  divider: {
    width: 32,
    height: 2,
    backgroundColor: colors.primary[600],
    borderRadius: 1,
    marginBottom: 6,
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
    lineHeight: 14,
  },
});
