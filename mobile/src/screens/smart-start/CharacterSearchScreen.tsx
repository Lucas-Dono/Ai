/**
 * Character Search Screen
 *
 * Third step in Smart Start wizard (for existing characters only)
 * Features: Real-time search, infinite scroll, pull-to-refresh, loading states
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
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
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

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

  // Debounced search
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 500); // 500ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

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

  const renderEmptyState = () => {
    if (isSearching) {
      return null;
    }

    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🔍</Text>
          <Text style={styles.emptyStateTitle}>Search for a character</Text>
          <Text style={styles.emptyStateText}>
            Type the name of your favorite character from {genre}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>❌</Text>
          <Text style={styles.emptyStateTitle}>Search Error</Text>
          <Text style={styles.emptyStateText}>{error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>😔</Text>
        <Text style={styles.emptyStateTitle}>No results found</Text>
        <Text style={styles.emptyStateText}>
          Try a different search term or create an original character
        </Text>
        <Pressable style={styles.skipButton} onPress={handleSkipSearch}>
          <Text style={styles.skipButtonText}>Create Original Instead</Text>
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
      <Animated.View style={[styles.content, containerAnimatedStyle]}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${genre} characters...`}
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Results List */}
        <FlatList
          data={results}
          renderItem={renderSearchResult}
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
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={10}
        />

        {/* Skip Button (bottom) */}
        {results.length > 0 && (
          <View style={styles.skipContainer}>
            <Pressable
              style={({ pressed }) => [styles.skipFloatingButton, pressed && { opacity: 0.8 }]}
              onPress={handleSkipSearch}
            >
              <Text style={styles.skipFloatingButtonText}>
                Or create an original character
              </Text>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

// ============================================================================
// SEARCH RESULT CARD COMPONENT
// ============================================================================

interface SearchResultCardProps {
  character: SearchResult;
  onPress: () => void;
}

function SearchResultCard({ character, onPress }: SearchResultCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.resultCard, pressed && styles.resultCardPressed]}
      onPress={onPress}
    >
      {/* Image */}
      {character.imageUrl ? (
        <Image source={{ uri: character.imageUrl }} style={styles.resultImage} />
      ) : (
        <View style={[styles.resultImage, styles.resultImagePlaceholder]}>
          <Text style={styles.resultImagePlaceholderText}>
            {character.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.resultContent}>
        <Text style={styles.resultName} numberOfLines={1}>
          {character.name}
        </Text>
        {character.sourceTitle && (
          <Text style={styles.resultSource} numberOfLines={1}>
            From: {character.sourceTitle}
          </Text>
        )}
        {character.description && (
          <Text style={styles.resultDescription} numberOfLines={2}>
            {character.description}
          </Text>
        )}

        {/* Metadata */}
        <View style={styles.resultMeta}>
          <View style={styles.sourceTag}>
            <Text style={styles.sourceTagText}>{character.sourceId}</Text>
          </View>
          {character.confidence !== undefined && (
            <Text style={styles.confidenceText}>{Math.round(character.confidence * 100)}%</Text>
          )}
        </View>
      </View>
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
    backgroundColor: '#0f0f1e',
  },
  content: {
    flex: 1,
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchIcon: {
    fontSize: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#6b7280',
  },

  // List
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  // Result Card
  resultCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  resultCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  resultImagePlaceholder: {
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultImagePlaceholderText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#9ca3af',
  },
  resultContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  resultName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  resultSource: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 13,
    color: '#d1d5db',
    lineHeight: 18,
    marginBottom: 8,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceTag: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sourceTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Loading
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  // Skip Buttons
  skipButton: {
    marginTop: 24,
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  skipContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#0f0f1e',
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  skipFloatingButton: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  skipFloatingButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    textAlign: 'center',
  },
});
