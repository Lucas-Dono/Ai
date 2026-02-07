/**
 * Componente de card con gradiente y glassmorphism
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, shadows } from '../../theme';

interface GradientCardProps {
  children: React.ReactNode;
  gradient?: string[];
  style?: ViewStyle;
  opacity?: number;
}

export function GradientCard({
  children,
  gradient = [colors.primary[600], colors.primary[800]],
  style,
  opacity = 0.1,
}: GradientCardProps) {
  return (
    <View style={[styles.container, shadows.md, style]}>
      <LinearGradient
        colors={[...gradient, colors.background.card] as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      <View style={[styles.overlay, { backgroundColor: `rgba(30, 41, 59, ${opacity})` }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.card,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
