/**
 * Character Type Selection Screen
 *
 * First step in Smart Start wizard - choose between existing or original character
 * Features: Native cards, animations, haptic feedback
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { SmartStartStackParamList } from '../../navigation/SmartStartStack';
import { useSmartStartContext } from '../../contexts/SmartStartContext';

// ============================================================================
// TYPES
// ============================================================================

type CharacterTypeSelectionScreenNavigationProp = StackNavigationProp<
  SmartStartStackParamList,
  'CharacterTypeSelection'
>;

interface Props {
  navigation: CharacterTypeSelectionScreenNavigationProp;
}

type CharacterTypeOption = 'existing' | 'original';

// ============================================================================
// COMPONENT
// ============================================================================

export default function CharacterTypeSelectionScreen({ navigation }: Props) {
  const { updateDraft, markStepComplete, setCurrentStep } = useSmartStartContext();

  // Animation values
  const fadeIn = useSharedValue(0);
  const existingCardScale = useSharedValue(0.8);
  const originalCardScale = useSharedValue(0.8);

  // Entrance animations
  useEffect(() => {
    setCurrentStep('type');

    fadeIn.value = withSpring(1, { damping: 15, stiffness: 100 });
    existingCardScale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 120 }));
    originalCardScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 120 }));
  }, []);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  const existingCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: existingCardScale.value },
      {
        translateY: interpolate(
          existingCardScale.value,
          [0.8, 1],
          [20, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const originalCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: originalCardScale.value },
      {
        translateY: interpolate(
          originalCardScale.value,
          [0.8, 1],
          [20, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSelectType = (type: CharacterTypeOption) => {
    // Update draft
    updateDraft({
      characterType: type,
    });

    // Mark step complete
    markStepComplete('type');

    // Navigate to genre selection
    navigation.navigate('GenreSelection', { characterType: type });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, containerAnimatedStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Your AI Character</Text>
            <Text style={styles.subtitle}>
              Choose how you want to start your character creation journey
            </Text>
          </View>

          {/* Cards */}
          <View style={styles.cardsContainer}>
            {/* Existing Character Card */}
            <Animated.View style={existingCardAnimatedStyle}>
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  styles.existingCard,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => handleSelectType('existing')}
                android_ripple={{ color: 'rgba(139, 92, 246, 0.2)' }}
              >
                <View style={styles.cardIcon}>
                  <Text style={styles.cardIconText}>🔍</Text>
                </View>
                <Text style={styles.cardTitle}>Existing Character</Text>
                <Text style={styles.cardDescription}>
                  Search for a character from anime, games, movies, TV shows, or books.
                  We'll help you bring them to life with AI.
                </Text>
                <View style={styles.cardFeatures}>
                  <FeatureBadge text="Multi-source search" />
                  <FeatureBadge text="Auto-fill personality" />
                  <FeatureBadge text="High accuracy" />
                </View>
              </Pressable>
            </Animated.View>

            {/* Original Character Card */}
            <Animated.View style={originalCardAnimatedStyle}>
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  styles.originalCard,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => handleSelectType('original')}
                android_ripple={{ color: 'rgba(236, 72, 153, 0.2)' }}
              >
                <View style={styles.cardIcon}>
                  <Text style={styles.cardIconText}>✨</Text>
                </View>
                <Text style={styles.cardTitle}>Original Character</Text>
                <Text style={styles.cardDescription}>
                  Create a completely original character from scratch.
                  Design their personality, appearance, and backstory.
                </Text>
                <View style={styles.cardFeatures}>
                  <FeatureBadge text="Full customization" />
                  <FeatureBadge text="AI-assisted" />
                  <FeatureBadge text="Unique creation" />
                </View>
              </Pressable>
            </Animated.View>
          </View>

          {/* Helper Text */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't worry, you can customize everything later
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ============================================================================
// FEATURE BADGE COMPONENT
// ============================================================================

function FeatureBadge({ text }: { text: string }) {
  return (
    <View style={styles.featureBadge}>
      <Text style={styles.featureBadgeText}>{text}</Text>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const { width } = Dimensions.get('window');
const CARD_HORIZONTAL_MARGIN = 20;
const CARD_WIDTH = width - CARD_HORIZONTAL_MARGIN * 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: CARD_HORIZONTAL_MARGIN,
  },

  // Header
  header: {
    marginBottom: 32,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Cards Container
  cardsContainer: {
    gap: 16,
  },

  // Card Base
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  // Existing Card (Purple)
  existingCard: {
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },

  // Original Card (Pink)
  originalCard: {
    borderColor: '#ec4899',
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
  },

  // Card Content
  cardIcon: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconText: {
    fontSize: 36,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 22,
    marginBottom: 16,
  },

  // Features
  cardFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  featureBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  // Footer
  footer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
