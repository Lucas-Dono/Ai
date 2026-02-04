/**
 * Genre Step Component
 *
 * @deprecated This component is no longer used in the simplified Smart Start flow.
 * Genre/archetype selection is now handled automatically by AI based on the description.
 * The new flow starts directly with DescriptionGenerationStep.
 *
 * Kept for reference only.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolate,
  FadeIn,
  FadeOut,
  SlideInDown,
} from 'react-native-reanimated';
import { GENRES, GenreOption, SubgenreOption, getGenreById } from '../../../data/genres';
import type { GenreId } from '@circuitpromptai/smart-start-core';
import { colors, spacing } from '../../../theme';
import { useSmartStartContext } from '../../../contexts/SmartStartContext';

// ============================================================================
// TYPES
// ============================================================================

export interface GenreStepProps {
  visible: boolean;
  completed: boolean;
  characterType: 'existing' | 'original';
  onComplete: (genreId: GenreId, subgenreId?: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function GenreStep({ visible, completed, characterType, onComplete }: GenreStepProps) {
  const { draft } = useSmartStartContext();
  const [selectedGenre, setSelectedGenre] = useState<GenreOption | null>(null);
  const [expandedGenreId, setExpandedGenreId] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [detectedGenre, setDetectedGenre] = useState<GenreOption | null>(null);

  // Animation
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      fadeIn.value = withSpring(1, { damping: 15, stiffness: 100 });
    }
  }, [visible]);

  // Show confirmation modal when genre is auto-detected from search
  useEffect(() => {
    if (visible && draft.genre && !selectedGenre && !detectedGenre) {
      const genreOption = getGenreById(draft.genre);
      if (genreOption) {
        console.log('[GenreStep] Auto-detected genre:', draft.genre);
        setDetectedGenre(genreOption);
        setShowConfirmationModal(true);
      }
    }
  }, [visible, draft.genre, selectedGenre, detectedGenre]);

  // Handle confirmation of auto-detected genre
  const handleConfirmGenre = useCallback(() => {
    if (detectedGenre) {
      setShowConfirmationModal(false);
      setSelectedGenre(detectedGenre);
      setExpandedGenreId(detectedGenre.id);
    }
  }, [detectedGenre]);

  // Handle rejection of auto-detected genre
  const handleRejectGenre = useCallback(() => {
    setShowConfirmationModal(false);
    setDetectedGenre(null);
    // User can now select manually
  }, []);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: fadeIn.value === 1 ? 0 : -20 }],
  }));

  if (!visible) return null;

  const handleGenreSelect = (genre: GenreOption) => {
    if (genre.subgenres && genre.subgenres.length > 0) {
      // Expand to show subgenres
      setSelectedGenre(genre);
      setExpandedGenreId(genre.id);
    } else {
      // No subgenres, complete immediately
      onComplete(genre.id);
    }
  };

  const handleSubgenreSelect = (subgenre: SubgenreOption) => {
    if (!selectedGenre) return;
    onComplete(selectedGenre.id, subgenre.id);
  };

  const handleSkipSubgenre = () => {
    if (!selectedGenre) return;
    onComplete(selectedGenre.id);
  };

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>¿Qué rol cumple para vos?</Text>
        <Text style={styles.subtitle}>
          {characterType === 'existing'
            ? 'Elegí el tipo de relación que querés tener con este personaje'
            : 'Seleccioná cómo querés interactuar con tu personaje'}
        </Text>
      </View>

      {/* Genre Grid */}
      <View style={styles.genreGrid}>
        {GENRES.map((genre, index) => (
          <GenreCard
            key={genre.id}
            genre={genre}
            index={index}
            isExpanded={expandedGenreId === genre.id}
            onPress={() => handleGenreSelect(genre)}
          />
        ))}
      </View>

      {/* Subgenres Section (Inline) */}
      {selectedGenre && expandedGenreId === selectedGenre.id && (
        <View style={styles.subgenresSection}>
          <View style={styles.subgenresHeader}>
            <Text style={styles.subgenresTitle}>
              Elegí un estilo de relación {selectedGenre.name}
            </Text>
            <Pressable onPress={handleSkipSubgenre} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Omitir</Text>
            </Pressable>
          </View>
          <View style={styles.subgenresList}>
            {selectedGenre.subgenres?.map((subgenre) => (
              <Pressable
                key={subgenre.id}
                style={({ pressed }) => [
                  styles.subgenreChip,
                  pressed && styles.subgenreChipPressed,
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
        </View>
      )}

      {/* Genre Match Confirmation Modal */}
      <Modal
        visible={showConfirmationModal}
        transparent
        animationType="fade"
        onRequestClose={handleRejectGenre}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={SlideInDown.springify().damping(20).stiffness(90)}
            style={styles.modalContent}
          >
            {/* Success Icon */}
            <View style={styles.modalIconContainer}>
              <View style={styles.modalIconCircle}>
                <Feather name="check" size={40} color="#22c55e" />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>¡Arquetipo detectado!</Text>

            {/* Description */}
            <Text style={styles.modalDescription}>
              Se ha detectado el tipo de relación sugerido para este personaje:
            </Text>

            {/* Detected Genre Card */}
            {detectedGenre && (
              <View style={styles.detectedGenreCard}>
                <Text style={styles.detectedGenreIcon}>{detectedGenre.icon}</Text>
                <View style={styles.detectedGenreInfo}>
                  <Text style={styles.detectedGenreName}>{detectedGenre.name}</Text>
                  <Text style={styles.detectedGenreDescription}>
                    {detectedGenre.description}
                  </Text>
                </View>
              </View>
            )}

            {/* Question */}
            <Text style={styles.modalQuestion}>¿Es correcto?</Text>

            {/* Action Buttons */}
            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButtonPrimary,
                  pressed && styles.modalButtonPressed,
                ]}
                onPress={handleConfirmGenre}
              >
                <Feather name="check-circle" size={18} color="#ffffff" />
                <Text style={styles.modalButtonPrimaryText}>Sí, es correcto</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.modalButtonSecondary,
                  pressed && styles.modalButtonPressed,
                ]}
                onPress={handleRejectGenre}
              >
                <Feather name="edit-3" size={16} color="#8b5cf6" />
                <Text style={styles.modalButtonSecondaryText}>Elegir otro</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </Animated.View>
  );
}

// ============================================================================
// GENRE CARD COMPONENT
// ============================================================================

interface GenreCardProps {
  genre: GenreOption;
  index: number;
  isExpanded: boolean;
  onPress: () => void;
}

function GenreCard({ genre, index, isExpanded, onPress }: GenreCardProps) {
  const scale = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withDelay(index * 40, withSpring(1, { damping: 12, stiffness: 120 }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(scale.value, [0.8, 1], [0, 1]),
  }));

  return (
    <Animated.View style={[styles.genreCardWrapper, animatedStyle]}>
      <Pressable
        style={({ pressed }) => [
          styles.genreCard,
          pressed && styles.genreCardPressed,
          isExpanded && styles.genreCardExpanded,
        ]}
        onPress={onPress}
      >
        {/* Icon */}
        <View style={styles.genreIconContainer}>
          <Text style={styles.genreIcon}>{genre.icon}</Text>
        </View>

        {/* Content */}
        <Text style={styles.genreName}>{genre.name}</Text>
        <Text style={styles.genreDescription} numberOfLines={2}>
          {genre.description}
        </Text>

        {/* Subgenre Indicator */}
        {genre.subgenres && genre.subgenres.length > 0 && (
          <View style={styles.subgenreIndicator}>
            <Feather name="layers" size={12} color="#8b5cf6" />
            <Text style={styles.subgenreIndicatorText}>
              {genre.subgenres.length} estilos
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
const HORIZONTAL_PADDING = 24;
const CARD_GAP = 16;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },

  // Header
  header: {
    marginBottom: 28,
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
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 18,
    minHeight: 180,
  },
  genreCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  genreCardExpanded: {
    borderColor: '#8b5cf6',
    borderWidth: 2,
  },
  genreIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  genreIcon: {
    fontSize: 32,
  },
  genreName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  genreDescription: {
    fontSize: 13,
    color: '#a1a1a1',
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
    color: '#8b5cf6',
    letterSpacing: 0.2,
  },

  // Subgenres Section (Inline)
  subgenresSection: {
    marginTop: 24,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  subgenresHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subgenresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a1a1a1',
  },
  subgenresList: {
    gap: 10,
  },
  subgenreChip: {
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  subgenreChipPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  subgenreName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  subgenreDescription: {
    fontSize: 13,
    color: '#a1a1a1',
    lineHeight: 19,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
  },
  modalIconContainer: {
    marginBottom: 20,
  },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  modalDescription: {
    fontSize: 15,
    color: '#a1a1a1',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  detectedGenreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 2,
    borderColor: '#8b5cf6',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 20,
    gap: 16,
  },
  detectedGenreIcon: {
    fontSize: 48,
  },
  detectedGenreInfo: {
    flex: 1,
  },
  detectedGenreName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  detectedGenreDescription: {
    fontSize: 14,
    color: '#a1a1a1',
    lineHeight: 20,
  },
  modalQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  modalButtonPrimary: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalButtonSecondary: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  modalButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8b5cf6',
    letterSpacing: 0.2,
  },
});
