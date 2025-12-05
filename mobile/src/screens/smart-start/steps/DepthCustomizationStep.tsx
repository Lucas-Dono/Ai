/**
 * Depth Customization Step Component
 *
 * Allows users to select how detailed/realistic their character should be.
 * Three tiers: Basic (Free), Realistic (Plus), Ultra-Realistic (Ultra)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import {
  type DepthLevelId,
  type UserTier,
  DEPTH_LEVELS,
  getFeaturesForDepth,
  canAccessDepth,
} from '@circuitpromptai/smart-start-core';
import { colors, spacing } from '../../../theme';
import { useSmartStartContext } from '../../../contexts/SmartStartContext';

// ============================================================================
// TYPES
// ============================================================================

export interface DepthCustomizationStepProps {
  visible: boolean;
  completed: boolean;
  userTier?: UserTier; // User's subscription tier (default: 'free')
  onComplete: (depthId: DepthLevelId) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DepthCustomizationStep({
  visible,
  completed,
  userTier = 'free',
  onComplete,
}: DepthCustomizationStepProps) {
  const { draft } = useSmartStartContext();
  const [selectedDepth, setSelectedDepth] = useState<DepthLevelId | null>(null);

  // Animation
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      fadeIn.value = withSpring(1, { damping: 15, stiffness: 100 });
    }
  }, [visible]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: fadeIn.value === 1 ? 0 : -20 }],
  }));

  const handleDepthSelect = useCallback(
    (depthId: DepthLevelId) => {
      // Check if user can access this depth level
      if (!canAccessDepth(userTier, depthId)) {
        Alert.alert(
          'Función Premium',
          `Esta opción requiere una suscripción ${DEPTH_LEVELS[depthId].badge}. ¿Querés actualizar tu plan?`,
          [
            { text: 'Más tarde', style: 'cancel' },
            { text: 'Ver Planes', onPress: () => console.log('Navigate to billing') },
          ]
        );
        return;
      }

      setSelectedDepth(depthId);
      onComplete(depthId);
    },
    [userTier, onComplete]
  );

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>¿Qué tan realista querés que sea?</Text>
        <Text style={styles.subtitle}>
          Elegí el nivel de profundidad para tu personaje. Podés usar personajes simples para chats
          rápidos o ultra-realistas para experiencias inmersivas.
        </Text>
      </View>

      {/* Depth Options */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.depthList}
        showsVerticalScrollIndicator={false}
      >
        {Object.values(DEPTH_LEVELS).map((depth, index) => {
          const isAccessible = canAccessDepth(userTier, depth.id);
          const isSelected = selectedDepth === depth.id;
          const features = getFeaturesForDepth(depth.id);

          return (
            <Animated.View key={depth.id} entering={FadeIn.delay(index * 100)}>
              <Pressable
                onPress={() => handleDepthSelect(depth.id)}
                style={[
                  styles.depthCard,
                  isSelected && styles.depthCardSelected,
                  !isAccessible && styles.depthCardLocked,
                ]}
                disabled={!isAccessible}
              >
                {/* Header with icon and badge */}
                <View style={styles.depthCardHeader}>
                  <View style={styles.depthCardTitleRow}>
                    <Text style={styles.depthCardIcon}>{depth.icon}</Text>
                    <View style={styles.depthCardTitleContainer}>
                      <Text style={styles.depthCardTitle}>{depth.name}</Text>
                      {depth.badge && (
                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: `${depth.color}20`, borderColor: depth.color },
                          ]}
                        >
                          <Text style={[styles.badgeText, { color: depth.color }]}>
                            {depth.badge}
                          </Text>
                        </View>
                      )}
                      {!isAccessible && (
                        <Feather name="lock" size={16} color="#6b7280" style={styles.lockIcon} />
                      )}
                    </View>
                  </View>
                  {isSelected && (
                    <Feather name="check-circle" size={24} color={depth.color} />
                  )}
                </View>

                {/* Description */}
                <Text style={styles.depthCardDescription}>{depth.description}</Text>

                {/* Stats */}
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Feather name="clock" size={14} color="#6b7280" />
                    <Text style={styles.statText}>~{depth.estimatedTime}s</Text>
                  </View>
                  <View style={styles.stat}>
                    <Feather name="zap" size={14} color="#6b7280" />
                    <Text style={styles.statText}>{depth.targetTokens} tokens</Text>
                  </View>
                </View>

                {/* Features List */}
                <View style={styles.featuresContainer}>
                  <Text style={styles.featuresTitle}>Incluye:</Text>
                  {features.map((feature) => (
                    <View key={feature.id} style={styles.featureRow}>
                      <Text style={styles.featureIcon}>{feature.icon}</Text>
                      <Text style={styles.featureName}>{feature.name}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Info footer */}
      <View style={styles.infoFooter}>
        <Feather name="info" size={16} color="#6b7280" />
        <Text style={styles.infoText}>
          Podés cambiar este ajuste en cualquier momento al crear un nuevo personaje.
        </Text>
      </View>
    </Animated.View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },

  header: {
    marginBottom: spacing.xl,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    letterSpacing: -0.2,
  },

  scrollView: {
    maxHeight: 600,
  },

  depthList: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },

  // Depth Card
  depthCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },

  depthCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTransparent,
  },

  depthCardLocked: {
    opacity: 0.6,
  },

  depthCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },

  depthCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },

  depthCardIcon: {
    fontSize: 32,
  },

  depthCardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },

  depthCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  lockIcon: {
    marginLeft: spacing.xs,
  },

  depthCardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
    letterSpacing: -0.1,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  statText: {
    fontSize: 13,
    color: colors.textTertiary,
    fontWeight: '500',
  },

  // Features
  featuresContainer: {
    gap: spacing.xs,
  },

  featuresTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 4,
  },

  featureIcon: {
    fontSize: 16,
  },

  featureName: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    letterSpacing: -0.1,
  },

  // Info Footer
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
  },

  infoText: {
    fontSize: 13,
    color: colors.textTertiary,
    flex: 1,
    lineHeight: 18,
  },
});
