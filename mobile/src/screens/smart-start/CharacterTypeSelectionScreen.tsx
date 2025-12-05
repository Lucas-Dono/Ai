/**
 * @deprecated This screen is deprecated. Use SmartStartWizardScreen with TypeStep instead.
 * Kept for reference only. Do not use in active navigation.
 *
 * Character Type Selection Screen
 *
 * First step in Smart Start wizard - choose between existing or original character
 * Clean, professional design inspired by Apple, Stripe, and Linear
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { SmartStartStackParamList } from '../../navigation/SmartStartStack';
import { useSmartStartContext } from '../../contexts/SmartStartContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

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

  // Animation values - subtle fade in only
  const fadeIn = useSharedValue(0);

  // Entrance animation
  useEffect(() => {
    setCurrentStep('type');
    fadeIn.value = withSpring(1, { damping: 20, stiffness: 90 });
  }, []);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
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

  const parentNavigation = useNavigation();
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  return (
    <View style={styles.container}>
      {/* App Header */}
      <View style={styles.appHeader}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={19} color="#8b5cf6" />
          <Text style={styles.appTitle}>Circuit Prompt</Text>
        </View>
        <TouchableOpacity
          onPress={() => parentNavigation.goBack()}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, containerAnimatedStyle]}>
          {/* Hero Section - Minimal & Left-aligned */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Nuevo personaje</Text>
            <Text style={styles.heroSubtitle}>
              Elegí cómo querés empezar
            </Text>
          </View>

          {/* Cards - Differentiated Design */}
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
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },

  // App Header
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 72,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  // Scroll Content
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Hero Section - Minimal & Left-aligned
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
