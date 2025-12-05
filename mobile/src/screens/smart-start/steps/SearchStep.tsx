/**
 * Search Step Component
 *
 * Third step: Search for existing characters (only if characterType === 'existing')
 * Redesigned: No gradients, no blur, professional solid design
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SectionList,
  Pressable,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { smartStartService } from '../../../services/smart-start.service';
import type { SearchResult, GenreId } from '@circuitpromptai/smart-start-core';
import { colors } from '../../../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface SearchStepProps {
  visible: boolean;
  completed: boolean;
  genre?: GenreId; // Optional: allow general search first
  onComplete: (character: SearchResult) => void;
  onSkip: () => void;
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

export function SearchStep({ visible, completed, genre, onComplete, onSkip }: SearchStepProps) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<SearchResult | null>(null);

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

  if (!visible) return null;

  // ============================================================================
  // SEARCH LOGIC
  // ============================================================================

  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const { results: searchResults } = await smartStartService.searchCharacters(
          query,
          (genre || 'anime') as any, // Default to 'anime' if no genre selected yet
          { limit: 20 }
        );

        setResults(searchResults);
        setHasSearched(true);
      } catch (err) {
        console.error('[SearchStep] Search error:', err);
        setError(err instanceof Error ? err.message : 'Búsqueda fallida');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [genre]
  );

  // Handle manual search submission (keyboard search button)
  const handleSearchSubmit = useCallback(() => {
    Keyboard.dismiss(); // Close keyboard
    performSearch(searchQuery); // Trigger search
  }, [searchQuery, performSearch]);

  // ============================================================================
  // GROUP RESULTS BY CATEGORY
  // ============================================================================

  const groupedResults = useMemo(() => {
    if (results.length === 0) {
      return [];
    }

    const grouped = results.reduce((acc, result) => {
      const sourceId = result.sourceId || 'unknown';
      if (!acc[sourceId]) {
        acc[sourceId] = [];
      }
      acc[sourceId].push(result);
      return acc;
    }, {} as Record<string, SearchResult[]>);

    const sections: SearchResultSection[] = Object.entries(grouped)
      .map(([sourceId, data]) => ({
        sourceId,
        title: SOURCE_NAMES[sourceId] || sourceId.toUpperCase(),
        data,
      }))
      .sort((a, b) => b.data.length - a.data.length);

    return sections;
  }, [results]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSearchResult = useCallback(
    ({ item, index }: { item: SearchResult; index: number }) => (
      <Animated.View entering={FadeIn.delay(index * 50).duration(300)}>
        <SearchResultCard
          character={item}
          onPress={() => setSelectedCharacter(item)}
        />
      </Animated.View>
    ),
    []
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
          <Text style={styles.emptyStateIcon}>🔍</Text>
          <Text style={styles.emptyStateTitle}>Empezá tu búsqueda</Text>
          <Text style={styles.emptyStateText}>
            Escribí el nombre de tu personaje favorito
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>⚠️</Text>
          <Text style={styles.emptyStateTitle}>Error de búsqueda</Text>
          <Text style={styles.emptyStateText}>{error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>😕</Text>
        <Text style={styles.emptyStateTitle}>Sin resultados</Text>
        <Text style={styles.emptyStateText}>
          Probá con otro término o creá un personaje original
        </Text>
        <Pressable style={styles.skipButtonMain} onPress={onSkip}>
          <Text style={styles.skipButtonMainText}>Crear personaje original</Text>
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
  // COLLAPSED VIEW (After Selection)
  // ============================================================================

  if (selectedCharacter) {
    return (
      <Animated.View style={[styles.container, containerAnimatedStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>✓ Personaje seleccionado</Text>
        </View>

        {/* Selected Character Card (Compact) */}
        <View style={styles.selectedCard}>
          {selectedCharacter.imageUrl ? (
            <Image
              source={selectedCharacter.imageUrl}
              style={styles.selectedImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.selectedImage, styles.selectedImagePlaceholder]}>
              <Text style={styles.selectedImagePlaceholderText}>
                {selectedCharacter.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.selectedContent}>
            <Text style={styles.selectedName} numberOfLines={1}>
              {selectedCharacter.name}
            </Text>
            {selectedCharacter.description && (
              <Text style={styles.selectedDescription} numberOfLines={2}>
                {selectedCharacter.description}
              </Text>
            )}
          </View>
        </View>

        {/* Confirmation Section */}
        <View style={styles.confirmationSection}>
          <Text style={styles.confirmationText}>
            ¿No es este el resultado que querías?
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.changeButton,
              pressed && styles.changeButtonPressed,
            ]}
            onPress={() => setSelectedCharacter(null)}
          >
            <Feather name="edit-2" size={16} color="#8b5cf6" />
            <Text style={styles.changeButtonText}>Cambiar selección</Text>
          </Pressable>
        </View>

        {/* Confirm Button */}
        <Pressable
          style={({ pressed }) => [
            styles.confirmButton,
            pressed && styles.confirmButtonPressed,
          ]}
          onPress={() => onComplete(selectedCharacter)}
        >
          <Text style={styles.confirmButtonText}>Continuar con este personaje</Text>
          <Feather name="arrow-right" size={16} color="#ffffff" />
        </Pressable>

        {/* Skip Option */}
        <Pressable
          style={({ pressed }) => [styles.skipButtonCompact, pressed && styles.skipButtonPressed]}
          onPress={onSkip}
        >
          <Text style={styles.skipButtonText}>O saltar este paso</Text>
        </Pressable>
      </Animated.View>
    );
  }

  // ============================================================================
  // EXPANDED SEARCH VIEW (Default)
  // ============================================================================

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Buscá tu personaje</Text>
        <Text style={styles.subtitle}>
          Escribí el nombre del personaje que querés crear
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#8b5cf6" />
          <TextInput
            style={styles.searchInput}
            placeholder={genre ? `Buscar personajes de ${genre}...` : "Buscar personajes..."}
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={handleSearchSubmit}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Feather name="x-circle" size={18} color="#666666" />
            </Pressable>
          )}
        </View>
        {/* Instructional Text */}
        <Text style={styles.searchHint}>
          Presioná el botón de búsqueda en el teclado para buscar
        </Text>
      </View>

      {/* Loading Overlay - Shows prominently during search */}
      {isSearching && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text style={styles.loadingText}>Buscando personajes...</Text>
          </View>
        </View>
      )}

      {/* Results List */}
      {!isSearching && (
        <SectionList
          sections={groupedResults}
          renderItem={renderSearchResult}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item, index) => `${item.sourceId}-${item.id}-${index}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={true}
          scrollEnabled={false}
          nestedScrollEnabled={false}
        />
      )}

      {/* Skip Button (bottom) */}
      {results.length > 0 && (
        <View style={styles.skipContainer}>
          <Pressable
            style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.8 }]}
            onPress={onSkip}
          >
            <Feather name="edit" size={16} color="#8b5cf6" />
            <Text style={styles.skipButtonText}>O crear un personaje original</Text>
          </Pressable>
        </View>
      )}
    </Animated.View>
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
  const [imageError, setImageError] = React.useState(false);

  return (
    <Pressable
      style={({ pressed }) => [styles.resultCard, pressed && styles.resultCardPressed]}
      onPress={onPress}
    >
      {/* Image */}
      {character.imageUrl && !imageError ? (
        <Image
          source={character.imageUrl}
          style={styles.resultImage}
          contentFit="cover"
          transition={200}
          onError={(error) => {
            console.log('[SearchResultCard] Image load error:', character.name, error);
            setImageError(true);
          }}
          onLoad={() => {
            console.log('[SearchResultCard] Image loaded successfully:', character.name);
          }}
        />
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
          <View style={styles.resultSourceContainer}>
            <Feather name="book-open" size={12} color="#666666" />
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
          <View style={styles.sourceTag}>
            <Text style={styles.sourceTagText}>{character.sourceId}</Text>
          </View>
          {character.confidence !== undefined && (
            <View style={styles.confidenceContainer}>
              <Feather name="check-circle" size={12} color="#22c55e" />
              <Text style={styles.confidenceText}>
                {Math.round(character.confidence * 100)}%
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Header
  header: {
    marginBottom: 20,
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: '#a1a1a1',
    lineHeight: 24,
    fontWeight: '400',
  },

  // Search Bar
  searchBarContainer: {
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  searchHint: {
    fontSize: 13,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: -0.1,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
    borderRadius: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
    marginRight: 8,
  },
  sectionCount: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    minWidth: 28,
    alignItems: 'center',
  },
  sectionCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },

  // List
  listContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },

  // Result Card
  resultCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  resultCardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  resultImagePlaceholder: {
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultImagePlaceholderText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  resultContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  resultSourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  resultSource: {
    fontSize: 13,
    color: '#666666',
    flex: 1,
    fontWeight: '500',
  },
  resultDescription: {
    fontSize: 13,
    color: '#a1a1a1',
    lineHeight: 18,
    marginBottom: 8,
    fontWeight: '400',
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
  },
  sourceTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#06b6d4',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22c55e',
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
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#a1a1a1',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
  skipButtonMain: {
    marginTop: 28,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
  },
  skipButtonMainText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },

  // Loading
  loadingFooter: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },

  // Skip Button (bottom)
  skipContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: colors.background.primary,
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },

  // Collapsed View (Selected Character)
  selectedCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#8b5cf6',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  selectedImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  selectedImagePlaceholder: {
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImagePlaceholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  selectedContent: {
    flex: 1,
    gap: 4,
  },
  selectedName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  selectedDescription: {
    fontSize: 14,
    color: '#a1a1a1',
    lineHeight: 20,
  },

  // Confirmation Section
  confirmationSection: {
    marginBottom: 20,
    alignItems: 'center',
    gap: 16,
  },
  confirmationText: {
    fontSize: 15,
    color: '#a1a1a1',
    textAlign: 'center',
    lineHeight: 22,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  changeButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  changeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8b5cf6',
    letterSpacing: 0.2,
  },

  // Confirm Button
  confirmButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  confirmButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },

  // Skip Button Compact
  skipButtonCompact: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonPressed: {
    opacity: 0.7,
  },
});
