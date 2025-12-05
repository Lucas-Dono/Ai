/**
 * Progress Indicator Component
 *
 * Shows current step progress in Smart Start wizard
 * Design: Minimalist, professional progress bar with step counter
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';

// ============================================================================
// TYPES
// ============================================================================

interface ProgressIndicatorProps {
  currentStep: number; // 0-4 (0-indexed)
  totalSteps: number;  // 5
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <View style={styles.container}>
      {/* Step Counter */}
      <Text style={styles.stepText}>
        Paso {currentStep + 1} de {totalSteps}
      </Text>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.background.primary,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8b5cf6', // colors.primary.500
    borderRadius: 2,
  },
});
