/**
 * Emotion Selector Component
 *
 * Allows users to select an emotional tone for their character
 * Supports auto-detection with visual feedback
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius } from '../../theme';
import type { EmotionType, Emotion } from '../../utils/emotion-detection';
import { getAllEmotions } from '../../utils/emotion-detection';

// ============================================================================
// TYPES
// ============================================================================

interface EmotionSelectorProps {
  selectedEmotion: EmotionType | null;
  onSelectEmotion: (emotion: EmotionType) => void;
  detectedEmotion?: EmotionType | null;
  detectionMessage?: string;
  disabled?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EmotionSelector({
  selectedEmotion,
  onSelectEmotion,
  detectedEmotion,
  detectionMessage,
  disabled = false,
}: EmotionSelectorProps) {
  const emotions = getAllEmotions();

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Tono Emocional</Text>
      <Text style={styles.subtitle}>
        Elige el tono que mejor represente al personaje
      </Text>

      {/* Detection Message */}
      {detectedEmotion && detectionMessage && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.detectionBanner}>
          <Text style={styles.detectionIcon}>✨</Text>
          <View style={styles.detectionTextContainer}>
            <Text style={styles.detectionTitle}>Detección Automática</Text>
            <Text style={styles.detectionText}>{detectionMessage}</Text>
          </View>
        </Animated.View>
      )}

      {/* Emotion Grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.emotionsGrid}
      >
        {emotions.map((emotion, index) => {
          const isSelected = selectedEmotion === emotion.id;
          const isDetected = detectedEmotion === emotion.id;

          return (
            <Animated.View
              key={emotion.id}
              entering={FadeIn.delay(index * 50).duration(300)}
            >
              <EmotionCard
                emotion={emotion}
                isSelected={isSelected}
                isDetected={isDetected}
                onPress={() => !disabled && onSelectEmotion(emotion.id)}
                disabled={disabled}
              />
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// EMOTION CARD COMPONENT
// ============================================================================

interface EmotionCardProps {
  emotion: Emotion;
  isSelected: boolean;
  isDetected: boolean;
  onPress: () => void;
  disabled: boolean;
}

function EmotionCard({
  emotion,
  isSelected,
  isDetected,
  onPress,
  disabled,
}: EmotionCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.emotionCard,
        isSelected && styles.emotionCardSelected,
        isDetected && !isSelected && styles.emotionCardDetected,
        pressed && !disabled && styles.emotionCardPressed,
        disabled && styles.emotionCardDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {/* Detection Badge */}
      {isDetected && !isSelected && (
        <View style={styles.detectedBadge}>
          <Text style={styles.detectedBadgeText}>Sugerido</Text>
        </View>
      )}

      {/* Selected Badge */}
      {isSelected && (
        <View style={styles.selectedBadge}>
          <Text style={styles.selectedBadgeText}>✓</Text>
        </View>
      )}

      {/* Emotion Icon */}
      <View
        style={[
          styles.emotionIconContainer,
          isSelected && { backgroundColor: emotion.color + '20' },
        ]}
      >
        <Text style={styles.emotionIcon}>{emotion.icon}</Text>
      </View>

      {/* Emotion Info */}
      <Text
        style={[
          styles.emotionLabel,
          isSelected && { color: emotion.color, fontWeight: '700' },
        ]}
      >
        {emotion.label}
      </Text>
      <Text style={styles.emotionDescription} numberOfLines={1}>
        {emotion.description}
      </Text>
    </Pressable>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },

  // Detection Banner
  detectionBanner: {
    flexDirection: 'row',
    backgroundColor: colors.primary[500] + '15',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  detectionIcon: {
    fontSize: 24,
  },
  detectionTextContainer: {
    flex: 1,
  },
  detectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  detectionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },

  // Emotions Grid
  emotionsGrid: {
    paddingVertical: spacing.xs,
    gap: spacing.md,
  },

  // Emotion Card
  emotionCard: {
    width: 120,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border.light,
    alignItems: 'center',
    position: 'relative',
  },
  emotionCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500] + '10',
  },
  emotionCardDetected: {
    borderColor: colors.primary[400],
    borderStyle: 'dashed',
  },
  emotionCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  emotionCardDisabled: {
    opacity: 0.5,
  },

  // Badges
  detectedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    zIndex: 10,
  },
  detectedBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  selectedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.success.main,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  selectedBadgeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },

  // Emotion Content
  emotionIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emotionIcon: {
    fontSize: 32,
  },
  emotionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
    textAlign: 'center',
  },
  emotionDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
