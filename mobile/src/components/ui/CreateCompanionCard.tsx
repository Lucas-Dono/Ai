/**
 * Card especial para botón de "Crear Compañero"
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface CreateCompanionCardProps {
  onPress: () => void;
}

export function CreateCompanionCard({ onPress }: CreateCompanionCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="add" size={24} color={colors.text.primary} />
      </View>
      <Text style={styles.label}>Crear</Text>
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
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
});
