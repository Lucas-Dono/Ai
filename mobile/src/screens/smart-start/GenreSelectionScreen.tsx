/**
 * @deprecated This screen is deprecated. Use SmartStartWizardScreen with GenreStep instead.
 * Kept for reference only. Do not use in active navigation.
 *
 * Genre Selection Screen
 *
 * Second step in Smart Start wizard - select genre and optional subgenre
 * Features: Vibrant gradients, glassmorphism cards, professional icons, delightful animations
 */

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { SmartStartStackParamList } from '../../navigation/SmartStartStack';
import { useSmartStartContext } from '../../contexts/SmartStartContext';
import { GENRES, GenreOption, SubgenreOption } from '../../data/genres';
import type { GenreId } from '@circuitpromptai/smart-start-core';

// ============================================================================
// TYPES
// ============================================================================

type GenreSelectionScreenNavigationProp = StackNavigationProp<
  SmartStartStackParamList,
  'GenreSelection'
>;

type GenreSelectionScreenRouteProp = RouteProp<SmartStartStackParamList, 'GenreSelection'>;

interface Props {
  navigation: GenreSelectionScreenNavigationProp;
  route: GenreSelectionScreenRouteProp;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function GenreSelectionScreen({ navigation, route }: Props) {
  const { characterType } = route.params;
  const { updateDraft, markStepComplete, setCurrentStep } = useSmartStartContext();

  // Bottom sheet ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedGenre, setSelectedGenre] = React.useState<GenreOption | null>(null);

  // Snap points for bottom sheet
  const snapPoints = useMemo(() => ['50%', '75%'], []);

  // Animation values
  const fadeIn = useSharedValue(0);

  // Entrance animations
  useEffect(() => {
    setCurrentStep('genre');
    fadeIn.value = withSpring(1, { damping: 15, stiffness: 100 });
  }, []);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleGenreSelect = useCallback(
    (genre: GenreOption) => {
      if (genre.subgenres && genre.subgenres.length > 0) {
        // Show bottom sheet for subgenre selection
        setSelectedGenre(genre);
        bottomSheetRef.current?.expand();
      } else {
        // No subgenres, go directly to next step
        proceedWithGenre(genre.id);
      }
    },
    [characterType]
  );

  const handleSubgenreSelect = useCallback(
    (subgenre: SubgenreOption) => {
      if (!selectedGenre) return;

      // Close bottom sheet
      bottomSheetRef.current?.close();

      // Proceed with genre and subgenre
      proceedWithGenre(selectedGenre.id, subgenre.id);
    },
    [selectedGenre, characterType]
  );

  const proceedWithGenre = useCallback(
    (genreId: GenreId, subgenreId?: string) => {
      // Update draft
      updateDraft({
        genre: genreId,
        subgenre: subgenreId,
      });

      // Mark step complete
      markStepComplete('genre');

      // Navigate to next step
      if (characterType === 'existing') {
        // Existing character: go to search
        navigation.navigate('CharacterSearch', {
          characterType,
          genre: genreId,
          subgenre: subgenreId,
        });
      } else {
        // Original character: skip search, go to customize
        navigation.navigate('CharacterCustomize', {
          characterType,
          genre: genreId,
        });
      }
    },
    [characterType, updateDraft, markStepComplete, navigation]
  );

  // Bottom sheet backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#1a0b2e', '#2d1b4e', '#4a2472']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.content, containerAnimatedStyle]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header - Emotional */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#06b6d4', '#22d3ee']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerIconGradient}
            >
              <Feather name="layers" size={28} color="#ffffff" />
            </LinearGradient>
            <Text style={styles.title}>Choose Your{'\n'}Universe</Text>
            <Text style={styles.subtitle}>
              {characterType === 'existing'
                ? "Pick the world where your character lives"
                : "Select the style and setting for your creation"}
            </Text>
          </View>

          {/* Genre Grid */}
          <View style={styles.genreGrid}>
            {GENRES.map((genre, index) => (
              <GenreCard
                key={genre.id}
                genre={genre}
                index={index}
                onPress={() => handleGenreSelect(genre)}
              />
            ))}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Bottom Sheet for Subgenres - Redesigned */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
      >
        <LinearGradient
          colors={['#2d1b4e', '#1a0b2e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <BottomSheetScrollView contentContainerStyle={styles.bottomSheetContent}>
          {selectedGenre && (
            <>
              <View style={styles.bottomSheetHeader}>
                <View style={styles.bottomSheetIconWrapper}>
                  <Text style={styles.bottomSheetIcon}>{selectedGenre.icon}</Text>
                </View>
                <Text style={styles.bottomSheetTitle}>{selectedGenre.name}</Text>
                <Text style={styles.bottomSheetSubtitle}>Choose a specific style</Text>
              </View>

              <View style={styles.subgenreList}>
                {selectedGenre.subgenres?.map((subgenre, index) => (
                  <Pressable
                    key={subgenre.id}
                    style={({ pressed }) => [
                      styles.subgenreItem,
                      pressed && styles.subgenreItemPressed,
                    ]}
                    onPress={() => handleSubgenreSelect(subgenre)}
                  >
                    <LinearGradient
                      colors={['rgba(167, 139, 250, 0.1)', 'rgba(124, 58, 237, 0.05)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.subgenreGradient}
                    >
                      <BlurView intensity={15} tint="dark" style={styles.subgenreBlur}>
                        <Feather name="chevron-right" size={20} color="#a78bfa" />
                        <View style={styles.subgenreTextContainer}>
                          <Text style={styles.subgenreName}>{subgenre.name}</Text>
                          {subgenre.description && (
                            <Text style={styles.subgenreDescription}>{subgenre.description}</Text>
                          )}
                        </View>
                      </BlurView>
                    </LinearGradient>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

// ============================================================================
// GENRE CARD COMPONENT - Redesigned with Glassmorphism
// ============================================================================

interface GenreCardProps {
  genre: GenreOption;
  index: number;
  onPress: () => void;
}

function GenreCard({ genre, index, onPress }: GenreCardProps) {
  const scale = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withDelay(index * 40, withSpring(1, { damping: 12, stiffness: 120 }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(scale.value, [0.8, 1], [0, 1]),
  }));

  const getGradientColors = (color: string): [string, string] => {
    const gradients: Record<string, [string, string]> = {
      '#8b5cf6': ['rgba(139, 92, 246, 0.2)', 'rgba(124, 58, 237, 0.1)'],
      '#ec4899': ['rgba(236, 72, 153, 0.2)', 'rgba(244, 114, 182, 0.1)'],
      '#06b6d4': ['rgba(6, 182, 212, 0.2)', 'rgba(34, 211, 238, 0.1)'],
      '#f59e0b': ['rgba(245, 158, 11, 0.2)', 'rgba(251, 191, 36, 0.1)'],
      '#10b981': ['rgba(16, 185, 129, 0.2)', 'rgba(52, 211, 153, 0.1)'],
      '#ef4444': ['rgba(239, 68, 68, 0.2)', 'rgba(248, 113, 113, 0.1)'],
    };
    return gradients[color] || ['rgba(167, 139, 250, 0.2)', 'rgba(124, 58, 237, 0.1)'];
  };

  const gradientColors = getGradientColors(genre.color);

  return (
    <Animated.View style={[styles.genreCardWrapper, animatedStyle]}>
      <Pressable
        style={({ pressed }) => [
          styles.genreCardPressable,
          pressed && styles.genreCardPressed,
        ]}
        onPress={onPress}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.genreCardGradient}
        >
          <BlurView intensity={15} tint="dark" style={styles.genreCardBlur}>
            {/* Icon - Kept as emoji for now but with better styling */}
            <View style={[styles.genreIconContainer, { backgroundColor: `${genre.color}30` }]}>
              <Text style={styles.genreIconText}>{genre.icon}</Text>
            </View>

            {/* Content */}
            <Text style={styles.genreName}>{genre.name}</Text>
            <Text style={styles.genreDescription} numberOfLines={2}>
              {genre.description}
            </Text>

            {/* Subgenre Indicator */}
            {genre.subgenres && genre.subgenres.length > 0 && (
              <View style={styles.subgenreIndicator}>
                <Feather name="layers" size={12} color={genre.color} />
                <Text style={[styles.subgenreIndicatorText, { color: genre.color }]}>
                  {genre.subgenres.length} styles
                </Text>
              </View>
            )}
          </BlurView>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 24;
const CARD_GAP = 16;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0b2e',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 32,
    paddingBottom: 40,
  },

  // Header - Emotional
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  headerIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    fontWeight: '400',
  },

  // Genre Grid
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  genreCardWrapper: {
    width: CARD_WIDTH,
  },
  genreCardPressable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  genreCardGradient: {
    borderRadius: 20,
    padding: 2,
  },
  genreCardBlur: {
    borderRadius: 18,
    padding: 18,
    minHeight: 180,
    overflow: 'hidden',
  },
  genreCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  genreIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  genreIconText: {
    fontSize: 32,
  },
  genreName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  genreDescription: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 19,
    marginBottom: 12,
    fontWeight: '400',
  },
  subgenreIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 'auto',
    paddingTop: 8,
  },
  subgenreIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Bottom Sheet - Redesigned
  bottomSheetBackground: {
    backgroundColor: 'transparent',
  },
  bottomSheetIndicator: {
    backgroundColor: '#a78bfa',
    width: 48,
    height: 5,
  },
  bottomSheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  bottomSheetHeader: {
    alignItems: 'center',
    marginBottom: 28,
    paddingTop: 8,
  },
  bottomSheetIconWrapper: {
    width: 72,
    height: 72,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  bottomSheetIcon: {
    fontSize: 40,
  },
  bottomSheetTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  bottomSheetSubtitle: {
    fontSize: 15,
    color: '#cbd5e1',
    fontWeight: '400',
  },

  // Subgenre List
  subgenreList: {
    gap: 12,
  },
  subgenreItem: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  subgenreGradient: {
    borderRadius: 16,
    padding: 2,
  },
  subgenreBlur: {
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
  },
  subgenreItemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  subgenreTextContainer: {
    flex: 1,
  },
  subgenreName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  subgenreDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    fontWeight: '400',
  },
});
