/**
 * @deprecated This screen is deprecated. Use SmartStartWizardScreen with SearchStep instead.
 * Kept for reference only. Do not use in active navigation.
 *
 * Character Search Screen
 *
 * Third step in Smart Start wizard (for existing characters only)
 * Features: Vibrant gradients, professional search UI, delightful animations, glassmorphism
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SectionList,
  Pressable,
  ActivityIndicator,
  Image,
  RefreshControl,
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
  FadeIn,
} from 'react-native-reanimated';
import { SmartStartStackParamList } from '../../navigation/SmartStartStack';
import { useSmartStartContext } from '../../contexts/SmartStartContext';
import { smartStartService } from '../../services/smart-start.service';
import type { SearchResult } from '@circuitpromptai/smart-start-core';
import { colors, spacing, typography, borderRadius } from '../../theme';

// ============================================================================
// TYPES
// ============================================================================

type CharacterSearchScreenNavigationProp = StackNavigationProp<
  SmartStartStackParamList,
  'CharacterSearch'
>;

type CharacterSearchScreenRouteProp = RouteProp<SmartStartStackParamList, 'CharacterSearch'>;

interface Props {
  navigation: CharacterSearchScreenNavigationProp;
  route: CharacterSearchScreenRouteProp;
}

interface SearchResultSection {
  title: string;
  data: SearchResult[];
  sourceId: string;
}

// Source ID to friendly name mapping
const SOURCE_NAMES: Record<string, string> = {
  wikipedia: 'Wikipedia',
  anilist: 'Anime (AniList)',
  myanimelist: 'MyAnimeList',
  vndb: 'Visual Novels',
  tvdb: 'TV Shows',
  tmdb: 'Movies',
  rawg: 'Games',
  igdb: 'Games (IGDB)',
  comicvine: 'Comics',
  bookapi: 'Books',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function CharacterSearchScreen({ navigation, route }: Props) {
  const { characterType, genre, subgenre } = route.params;
  const { setSearchResult, markStepComplete } = useSmartStartContext();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Animation
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withSpring(1, { damping: 15, stiffness: 100 });
  }, []);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  // ============================================================================
  // SEARCH LOGIC
  // ============================================================================

  const performSearch = useCallback(
    async (query: string, isRefresh: boolean = false) => {
      if (!query.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsSearching(true);
      }
      setError(null);

      try {
        const { results: searchResults, cached } = await smartStartService.searchCharacters(
          query,
          genre,
          { limit: 20 }
        );

        setResults(searchResults);
        setHasSearched(true);

        console.log(
          `[CharacterSearch] Found ${searchResults.length} results (cached: ${cached})`
        );
      } catch (err) {
        console.error('[CharacterSearch] Search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsSearching(false);
        setIsRefreshing(false);
      }
    },
    [genre]
  );

  // Debounced search - 1 second delay
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 1000); // 1000ms debounce (1 second)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  // ============================================================================
  // GROUP AND SORT RESULTS BY CATEGORY
  // ============================================================================

  const groupedResults = useMemo(() => {
    if (results.length === 0) {
      return [];
    }

    // Group results by sourceId
    const grouped = results.reduce((acc, result) => {
      const sourceId = result.sourceId || 'unknown';
      if (!acc[sourceId]) {
        acc[sourceId] = [];
      }
      acc[sourceId].push(result);
      return acc;
    }, {} as Record<string, SearchResult[]>);

    // Convert to array of sections and sort by count (descending)
    const sections: SearchResultSection[] = Object.entries(grouped)
      .map(([sourceId, data]) => ({
        sourceId,
        title: SOURCE_NAMES[sourceId] || sourceId.toUpperCase(),
        data,
      }))
      .sort((a, b) => b.data.length - a.data.length); // More results first

    return sections;
  }, [results]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSelectCharacter = useCallback(
    (character: SearchResult) => {
      // Save search result
      setSearchResult(character);

      // Mark step complete
      markStepComplete('search');

      // Navigate to customize
      navigation.navigate('CharacterCustomize', {
        character,
        genre,
        characterType,
      });
    },
    [genre, characterType, setSearchResult, markStepComplete, navigation]
  );

  const handleRefresh = useCallback(() => {
    performSearch(searchQuery, true);
  }, [searchQuery, performSearch]);

  const handleSkipSearch = useCallback(() => {
    // Mark step complete (even though skipped)
    markStepComplete('search');

    // Navigate to customize without a character
    navigation.navigate('CharacterCustomize', {
      genre,
      characterType,
    });
  }, [genre, characterType, markStepComplete, navigation]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSearchResult = useCallback(
    ({ item, index }: { item: SearchResult; index: number }) => (
      <Animated.View entering={FadeIn.delay(index * 50).duration(300)}>
        <SearchResultCard character={item} onPress={() => handleSelectCharacter(item)} />
      </Animated.View>
    ),
    [handleSelectCharacter]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: SearchResultSection }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <View style={styles.sectionCount}>
          <Text style={styles.sectionCountText}>{section.data.length}</Text>
        </View>
      </View>
    ),
    []
  );

  const renderEmptyState = () => {
    if (isSearching) {
      return null;
    }

    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <LinearGradient
            colors={['#06b6d4', '#22d3ee']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emptyStateIconGradient}
          >
            <Feather name="search" size={40} color="#ffffff" />
          </LinearGradient>
          <Text style={styles.emptyStateTitle}>Start Your Search</Text>
          <Text style={styles.emptyStateText}>
            Type the name of your favorite character from {genre}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <LinearGradient
            colors={['#ef4444', '#f87171']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emptyStateIconGradient}
          >
            <Feather name="alert-circle" size={40} color="#ffffff" />
          </LinearGradient>
          <Text style={styles.emptyStateTitle}>Search Error</Text>
          <Text style={styles.emptyStateText}>{error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <LinearGradient
          colors={['#f59e0b', '#fbbf24']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyStateIconGradient}
        >
          <Feather name="meh" size={40} color="#ffffff" />
        </LinearGradient>
        <Text style={styles.emptyStateTitle}>No results found</Text>
        <Text style={styles.emptyStateText}>
          Try a different search term or create an original character
        </Text>
        <Pressable style={styles.skipButton} onPress={handleSkipSearch}>
          <LinearGradient
            colors={['#ec4899', '#f472b6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.skipButtonGradient}
          >
            <Feather name="edit" size={20} color="#ffffff" />
            <Text style={styles.skipButtonText}>Create Original Instead</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isSearching) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  };

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
        {/* Search Bar - Redesigned */}
        <View style={styles.searchBarContainer}>
          <LinearGradient
            colors={['rgba(167, 139, 250, 0.15)', 'rgba(124, 58, 237, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.searchBarGradient}
          >
            <BlurView intensity={20} tint="dark" style={styles.searchBarBlur}>
              <Feather name="search" size={22} color="#a78bfa" />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${genre} characters...`}
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
                  <Feather name="x-circle" size={20} color="#64748b" />
                </Pressable>
              )}
            </BlurView>
          </LinearGradient>
        </View>

        {/* Results List - Grouped by Category */}
        <SectionList
          sections={groupedResults}
          renderItem={renderSearchResult}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item, index) => `${item.sourceId}-${item.id}-${index}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#8b5cf6"
            />
          }
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={true}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={10}
        />

        {/* Skip Button (bottom) - Redesigned */}
        {results.length > 0 && (
          <View style={styles.skipContainer}>
            <Pressable
              style={({ pressed }) => [styles.skipFloatingButton, pressed && { opacity: 0.8 }]}
              onPress={handleSkipSearch}
            >
              <LinearGradient
                colors={['rgba(236, 72, 153, 0.15)', 'rgba(244, 114, 182, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.skipButtonGradient}
              >
                <BlurView intensity={20} tint="dark" style={styles.skipButtonBlur}>
                  <Feather name="edit" size={18} color="#f472b6" />
                  <Text style={styles.skipFloatingButtonText}>
                    Or create an original character
                  </Text>
                </BlurView>
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

// ============================================================================
// SEARCH RESULT CARD COMPONENT - Redesigned
// ============================================================================

interface SearchResultCardProps {
  character: SearchResult;
  onPress: () => void;
}

function SearchResultCard({ character, onPress }: SearchResultCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.resultCardPressable, pressed && styles.resultCardPressed]}
      onPress={onPress}
    >
      <LinearGradient
        colors={['rgba(167, 139, 250, 0.1)', 'rgba(124, 58, 237, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.resultCardGradient}
      >
        <BlurView intensity={15} tint="dark" style={styles.resultCardBlur}>
          {/* Image */}
          {character.imageUrl ? (
            <Image source={{ uri: character.imageUrl }} style={styles.resultImage} />
          ) : (
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.resultImage, styles.resultImagePlaceholder]}
            >
              <Text style={styles.resultImagePlaceholderText}>
                {character.name.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          )}

          {/* Content */}
          <View style={styles.resultContent}>
            <Text style={styles.resultName} numberOfLines={1}>
              {character.name}
            </Text>
            {character.sourceTitle && (
              <View style={styles.resultSourceContainer}>
                <Feather name="book-open" size={14} color="#94a3b8" />
                <Text style={styles.resultSource} numberOfLines={1}>
                  {character.sourceTitle}
                </Text>
              </View>
            )}
            {character.description && (
              <Text style={styles.resultDescription} numberOfLines={2}>
                {character.description}
              </Text>
            )}

            {/* Metadata */}
            <View style={styles.resultMeta}>
              <LinearGradient
                colors={['rgba(6, 182, 212, 0.2)', 'rgba(34, 211, 238, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sourceTag}
              >
                <Text style={styles.sourceTagText}>{character.sourceId}</Text>
              </LinearGradient>
              {character.confidence !== undefined && (
                <View style={styles.confidenceContainer}>
                  <Feather name="check-circle" size={14} color="#10b981" />
                  <Text style={styles.confidenceText}>
                    {Math.round(character.confidence * 100)}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    </Pressable>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0b2e',
  },
  content: {
    flex: 1,
  },

  // Search Bar - Redesigned
  searchBarContainer: {
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 20,
  },
  searchBarGradient: {
    borderRadius: 18,
    padding: 2,
  },
  searchBarBlur: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },

  // Section Headers - Redesigned
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  sectionCount: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
  },
  sectionCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },

  // List
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },

  // Result Card - Redesigned
  resultCardPressable: {
    marginBottom: 14,
    borderRadius: 18,
    overflow: 'hidden',
  },
  resultCardGradient: {
    borderRadius: 18,
    padding: 2,
  },
  resultCardBlur: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    overflow: 'hidden',
  },
  resultCardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  resultImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
  },
  resultImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultImagePlaceholderText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
  },
  resultContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  resultName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  resultSourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  resultSource: {
    fontSize: 14,
    color: '#94a3b8',
    flex: 1,
    fontWeight: '500',
  },
  resultDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 10,
    fontWeight: '400',
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sourceTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  sourceTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06b6d4',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confidenceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10b981',
  },

  // Empty State - Redesigned
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyStateIconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },

  // Loading
  loadingFooter: {
    paddingVertical: 24,
    alignItems: 'center',
  },

  // Skip Buttons - Redesigned
  skipButton: {
    marginTop: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  skipButtonGradient: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  skipContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'rgba(26, 11, 46, 0.95)',
  },
  skipFloatingButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  skipButtonBlur: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    overflow: 'hidden',
  },
  skipFloatingButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
});
