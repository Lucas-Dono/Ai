/**
 * Genre Selection Screen
 *
 * Second step in Smart Start wizard - select genre and optional subgenre
 * Features: Grid layout, bottom sheet for subgenres, smooth animations
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
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
      <Animated.View style={[styles.content, containerAnimatedStyle]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Choose a Genre</Text>
            <Text style={styles.subtitle}>
              {characterType === 'existing'
                ? "Select where your character is from"
                : "What type of character do you want to create?"}
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

      {/* Bottom Sheet for Subgenres */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
      >
        <BottomSheetScrollView contentContainerStyle={styles.bottomSheetContent}>
          {selectedGenre && (
            <>
              <View style={styles.bottomSheetHeader}>
                <Text style={styles.bottomSheetTitle}>
                  {selectedGenre.icon} {selectedGenre.name}
                </Text>
                <Text style={styles.bottomSheetSubtitle}>Choose a subgenre</Text>
              </View>

              <View style={styles.subgenreList}>
                {selectedGenre.subgenres?.map((subgenre) => (
                  <Pressable
                    key={subgenre.id}
                    style={({ pressed }) => [
                      styles.subgenreItem,
                      pressed && styles.subgenreItemPressed,
                    ]}
                    onPress={() => handleSubgenreSelect(subgenre)}
                  >
                    <Text style={styles.subgenreName}>{subgenre.name}</Text>
                    {subgenre.description && (
                      <Text style={styles.subgenreDescription}>{subgenre.description}</Text>
                    )}
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
// GENRE CARD COMPONENT
// ============================================================================

interface GenreCardProps {
  genre: GenreOption;
  index: number;
  onPress: () => void;
}

function GenreCard({ genre, index, onPress }: GenreCardProps) {
  const scale = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withDelay(index * 50, withSpring(1, { damping: 12, stiffness: 120 }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.genreCardWrapper, animatedStyle]}>
      <Pressable
        style={({ pressed }) => [
          styles.genreCard,
          { borderColor: genre.color },
          pressed && styles.genreCardPressed,
        ]}
        onPress={onPress}
      >
        <View style={[styles.genreIcon, { backgroundColor: `${genre.color}20` }]}>
          <Text style={styles.genreIconText}>{genre.icon}</Text>
        </View>
        <Text style={styles.genreName}>{genre.name}</Text>
        <Text style={styles.genreDescription} numberOfLines={2}>
          {genre.description}
        </Text>
        {genre.subgenres && genre.subgenres.length > 0 && (
          <View style={styles.subgenreIndicator}>
            <Text style={styles.subgenreIndicatorText}>
              {genre.subgenres.length} subgenres
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 12;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 20,
  },

  // Header
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
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
  genreCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 160,
  },
  genreCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  genreIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  genreIconText: {
    fontSize: 28,
  },
  genreName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  genreDescription: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 18,
    marginBottom: 8,
  },
  subgenreIndicator: {
    marginTop: 'auto',
    paddingTop: 8,
  },
  subgenreIndicatorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },

  // Bottom Sheet
  bottomSheetBackground: {
    backgroundColor: '#1a1a2e',
  },
  bottomSheetIndicator: {
    backgroundColor: '#4b5563',
  },
  bottomSheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  bottomSheetHeader: {
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  bottomSheetSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },

  // Subgenre List
  subgenreList: {
    gap: 12,
  },
  subgenreItem: {
    backgroundColor: '#0f0f1e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  subgenreItemPressed: {
    backgroundColor: '#1f1f3e',
    borderColor: '#6366f1',
  },
  subgenreName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  subgenreDescription: {
    fontSize: 13,
    color: '#9ca3af',
  },
});
