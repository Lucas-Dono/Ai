/**
 * Chip de filtro para categorías de vibe
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';

export type VibeType = 'love' | 'chaos' | 'conflict' | 'stable';

interface VibeChipProps {
  type: VibeType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
  onPress: () => void;
}

const VIBE_COLORS: Record<VibeType, string> = {
  love: '#EC4899',
  chaos: '#FACC15',
  conflict: '#EF4444',
  stable: '#10B981',
};

export function VibeChip({ type, label, icon, selected = false, onPress }: VibeChipProps) {
  const color = VIBE_COLORS[type];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && { ...styles.selected, borderColor: color + '80' }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={14}
        color={color}
      />
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginRight: spacing.xs,
  },
  selected: {
    backgroundColor: colors.background.elevated,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  selectedLabel: {
    color: colors.text.primary,
  },
});
