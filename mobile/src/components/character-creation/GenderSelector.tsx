/**
 * Gender Selector Component - Selector de género con chips
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

interface GenderSelectorProps {
  value: 'male' | 'female' | 'non-binary' | undefined;
  onChange: (gender: 'male' | 'female' | 'non-binary') => void;
}

const genderOptions = [
  { value: 'male' as const, label: 'Masculino', icon: 'male' as const },
  { value: 'female' as const, label: 'Femenino', icon: 'female' as const },
  { value: 'non-binary' as const, label: 'No binario', icon: 'transgender' as const },
];

export function GenderSelector({ value, onChange }: GenderSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Género</Text>
      <View style={styles.options}>
        {genderOptions.map((option) => {
          const isSelected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onChange(option.value)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={option.icon}
                size={20}
                color={isSelected ? colors.primary[400] : colors.text.secondary}
              />
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  options: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
  },
  optionSelected: {
    backgroundColor: colors.primary[900] + '33',
    borderColor: colors.primary[500],
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  optionTextSelected: {
    color: colors.primary[400],
  },
});
