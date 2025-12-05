/**
 * Type Step Component
 *
 * First step: Choose between existing or original character
 * Extracted from CharacterTypeSelectionScreen - maintains same clean design
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius } from '../../../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface TypeStepProps {
  visible: boolean;
  completed: boolean;
  onComplete: (type: 'existing' | 'original') => void;
}

type CharacterTypeOption = 'existing' | 'original';

// ============================================================================
// COMPONENT
// ============================================================================

export function TypeStep({ visible, completed, onComplete }: TypeStepProps) {
  // Animation values
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      fadeIn.value = withSpring(1, { damping: 20, stiffness: 90 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: fadeIn.value === 1 ? 0 : -20 }],
  }));

  if (!visible) return null;

  const handleSelectType = (type: CharacterTypeOption) => {
    onComplete(type);
  };

  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Nuevo personaje</Text>
        <Text style={styles.heroSubtitle}>
          Elegí cómo querés empezar
        </Text>
      </View>

      {/* Cards */}
      <View style={[styles.cardsContainer, isTablet && styles.cardsContainerTablet]}>
        {/* Search Card - Horizontal, Bordered */}
        <Pressable
          style={({ pressed }) => [
            styles.searchCard,
            pressed && styles.cardPressed,
            isTablet && styles.cardTablet,
          ]}
          onPress={() => handleSelectType('existing')}
        >
          <View style={styles.searchCardContent}>
            <View style={styles.searchCardLeft}>
              <Feather name="search" size={20} color="#8b5cf6" />
            </View>
            <View style={styles.searchCardCenter}>
              <Text style={styles.searchCardTitle}>Buscar personaje conocido</Text>
              <Text style={styles.searchCardDescription}>
                Explorá personajes de anime, cine y juegos
              </Text>
            </View>
            <View style={styles.searchCardRight}>
              <Feather name="arrow-right" size={20} color="#666666" />
            </View>
          </View>
        </Pressable>

        {/* Create Card - Vertical, Solid Background */}
        <Pressable
          style={({ pressed }) => [
            styles.createCard,
            pressed && styles.cardPressed,
            isTablet && styles.cardTablet,
          ]}
          onPress={() => handleSelectType('original')}
        >
          <View style={styles.createCardContent}>
            <View style={styles.createCardIcon}>
              <Feather name="edit-3" size={22} color="#8b5cf6" />
            </View>
            <Text style={styles.createCardTitle}>Crear desde cero</Text>
            <Text style={styles.createCardDescription}>
              Diseñalo paso a paso según tu estilo
            </Text>
            <View style={styles.createCardCTA}>
              <Text style={styles.createCardCTAText}>Empezar</Text>
              <Feather name="arrow-right" size={18} color="#9333ea" />
            </View>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },

  // Hero Section
  heroSection: {
    alignItems: 'flex-start',
    marginBottom: 40,
    paddingTop: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#a1a1a1',
    fontWeight: '400',
    letterSpacing: 0.3,
    lineHeight: 26,
  },

  // Cards Container
  cardsContainer: {
    gap: 16,
  },
  cardsContainerTablet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Shared Card Styles
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardTablet: {
    flex: 1,
    marginHorizontal: 8,
  },

  // Search Card - Horizontal, Bordered
  searchCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  searchCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 16,
  },
  searchCardLeft: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchCardCenter: {
    flex: 1,
  },
  searchCardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  searchCardDescription: {
    fontSize: 14,
    color: '#a1a1a1',
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: -0.1,
  },
  searchCardRight: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Create Card - Vertical, Solid Background
  createCard: {
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  createCardContent: {
    padding: 20,
    minHeight: 200,
  },
  createCardIcon: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  createCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  createCardDescription: {
    fontSize: 15,
    color: '#a1a1a1',
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: '400',
    letterSpacing: -0.1,
  },
  createCardCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
  },
  createCardCTAText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9333ea',
    letterSpacing: -0.2,
  },
});
