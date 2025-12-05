/**
 * Context Step Component
 *
 * Shows auto-detected character context (Historical, Cultural Icon, Fictional, etc.)
 * Allows user to confirm or manually select context category and subcategory
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  SlideInDown,
} from 'react-native-reanimated';
import { CONTEXTS, getContextById, getContextLabel } from '../../../data/contexts';
import type { ContextCategoryId } from '@circuitpromptai/smart-start-core';
import { colors, spacing } from '../../../theme';
import { useSmartStartContext } from '../../../contexts/SmartStartContext';

// ============================================================================
// TYPES
// ============================================================================

export interface ContextStepProps {
  visible: boolean;
  completed: boolean;
  characterType: 'existing' | 'original';
  onComplete: (
    contextId: ContextCategoryId,
    subcategoryId?: string,
    occupation?: string,
    era?: string
  ) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ContextStep({ visible, completed, characterType, onComplete }: ContextStepProps) {
  const { draft } = useSmartStartContext();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [detectedContext, setDetectedContext] = useState<{
    category: ContextCategoryId;
    subcategory?: string;
    occupation?: string;
    era?: string;
    confidence?: number;
  } | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<ContextCategoryId | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

  // Show confirmation modal when context is auto-detected from search
  useEffect(() => {
    if (
      visible &&
      draft.searchResult &&
      (draft.searchResult as any).suggestedContext &&
      !detectedContext
    ) {
      const result = draft.searchResult as any;
      console.log('[ContextStep] Auto-detected context:', result.suggestedContext);
      setDetectedContext({
        category: result.suggestedContext,
        subcategory: result.contextSubcategory,
        occupation: result.contextOccupation,
        era: result.contextEra,
        confidence: result.contextConfidence,
      });
      setShowConfirmationModal(true);
    }
  }, [visible, draft.searchResult, detectedContext]);

  // Handle confirmation of auto-detected context
  const handleConfirmContext = useCallback(() => {
    if (detectedContext) {
      setShowConfirmationModal(false);
      onComplete(
        detectedContext.category,
        detectedContext.subcategory,
        detectedContext.occupation,
        detectedContext.era
      );
    }
  }, [detectedContext, onComplete]);

  // Handle rejection of auto-detected context
  const handleRejectContext = useCallback(() => {
    setShowConfirmationModal(false);
    setDetectedContext(null);
    // User can now select manually
  }, []);

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

  const handleCategorySelect = (categoryId: ContextCategoryId) => {
    const category = getContextById(categoryId);
    if (!category) return;

    if (category.subcategories && category.subcategories.length > 0) {
      // Show subcategories
      setSelectedCategoryId(categoryId);
    } else {
      // No subcategories, complete immediately
      onComplete(categoryId);
    }
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    if (!selectedCategoryId) return;
    setSelectedSubcategoryId(subcategoryId);
    onComplete(selectedCategoryId, subcategoryId);
  };

  const handleSkipSubcategory = () => {
    if (!selectedCategoryId) return;
    onComplete(selectedCategoryId);
  };

  const selectedCategory = selectedCategoryId ? getContextById(selectedCategoryId) : null;

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Contexto del personaje</Text>
        <Text style={styles.subtitle}>
          {characterType === 'existing'
            ? 'Confirmá el tipo de personaje detectado'
            : 'Seleccioná el tipo de personaje que querés crear'}
        </Text>
      </View>

      {/* Context Categories Grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.categoriesGrid}>
          {CONTEXTS.map((context) => (
            <Pressable
              key={context.id}
              style={({ pressed }) => [
                styles.categoryCard,
                pressed && styles.categoryCardPressed,
                selectedCategoryId === context.id && styles.categoryCardSelected,
              ]}
              onPress={() => handleCategorySelect(context.id)}
            >
              <View style={[styles.categoryIconContainer, { backgroundColor: context.color + '20' }]}>
                <Text style={styles.categoryIcon}>{context.icon}</Text>
              </View>
              <View style={styles.categoryTextContainer}>
                <Text style={styles.categoryName}>{context.name}</Text>
                <Text style={styles.categoryDescription} numberOfLines={2}>
                  {context.description}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Subcategories Section */}
        {selectedCategory && (
          <View style={styles.subcategoriesSection}>
            <View style={styles.subcategoriesHeader}>
              <Text style={styles.subcategoriesTitle}>
                Seleccioná una subcategoría de {selectedCategory.name}
              </Text>
              <Pressable onPress={handleSkipSubcategory} style={styles.skipButton}>
                <Text style={styles.skipButtonText}>Omitir</Text>
              </Pressable>
            </View>
            <View style={styles.subcategoriesList}>
              {selectedCategory.subcategories.map((subcategory) => (
                <Pressable
                  key={subcategory.id}
                  style={({ pressed }) => [
                    styles.subcategoryChip,
                    pressed && styles.subcategoryChipPressed,
                    selectedSubcategoryId === subcategory.id && styles.subcategoryChipSelected,
                  ]}
                  onPress={() => handleSubcategorySelect(subcategory.id)}
                >
                  <Text style={styles.subcategoryIcon}>{subcategory.icon}</Text>
                  <View style={styles.subcategoryInfo}>
                    <Text style={styles.subcategoryName}>{subcategory.name}</Text>
                    {subcategory.description && (
                      <Text style={styles.subcategoryDescription}>{subcategory.description}</Text>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Context Match Confirmation Modal */}
      <Modal
        visible={showConfirmationModal}
        transparent
        animationType="fade"
        onRequestClose={handleRejectContext}
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={SlideInDown.springify().damping(20).stiffness(90)} style={styles.modalContent}>
            {/* Success Icon */}
            <View style={styles.modalIconContainer}>
              <View style={styles.modalIconCircle}>
                <Feather name="check" size={40} color="#22c55e" />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>¡Contexto detectado!</Text>

            {/* Description */}
            <Text style={styles.modalDescription}>
              Se ha detectado automáticamente el contexto de tu personaje:
            </Text>

            {/* Detected Context Card */}
            {detectedContext && (
              <View style={styles.detectedContextCard}>
                <View style={styles.detectedContextHeader}>
                  <Text style={styles.detectedContextIcon}>
                    {getContextById(detectedContext.category)?.icon || '✨'}
                  </Text>
                  <View style={styles.detectedContextInfo}>
                    <Text style={styles.detectedContextLabel}>
                      {getContextLabel(
                        detectedContext.category,
                        detectedContext.subcategory,
                        detectedContext.occupation,
                        detectedContext.era
                      )}
                    </Text>
                    {detectedContext.confidence && (
                      <Text style={styles.detectedContextConfidence}>
                        Confianza: {Math.round(detectedContext.confidence * 100)}%
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={styles.detectedContextDescription}>
                  {getContextById(detectedContext.category)?.description}
                </Text>
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
                onPress={handleConfirmContext}
              >
                <Feather name="check-circle" size={18} color="#ffffff" />
                <Text style={styles.modalButtonPrimaryText}>Sí, es correcto</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.modalButtonSecondary,
                  pressed && styles.modalButtonPressed,
                ]}
                onPress={handleRejectContext}
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
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 24,
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

  // Categories Grid
  categoriesGrid: {
    gap: 16,
  },
  categoryCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  categoryCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  categoryCardSelected: {
    borderColor: '#8b5cf6',
    borderWidth: 2,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryTextContainer: {
    flex: 1,
    gap: 4,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  categoryDescription: {
    fontSize: 13,
    color: '#a1a1a1',
    lineHeight: 19,
  },

  // Subcategories Section
  subcategoriesSection: {
    marginTop: 24,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  subcategoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subcategoriesTitle: {
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
  subcategoriesList: {
    gap: 10,
  },
  subcategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    gap: 12,
  },
  subcategoryChipPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  subcategoryChipSelected: {
    borderColor: '#8b5cf6',
    borderWidth: 2,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  subcategoryIcon: {
    fontSize: 28,
  },
  subcategoryInfo: {
    flex: 1,
  },
  subcategoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  subcategoryDescription: {
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
  detectedContextCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 2,
    borderColor: '#8b5cf6',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  detectedContextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  detectedContextIcon: {
    fontSize: 40,
  },
  detectedContextInfo: {
    flex: 1,
  },
  detectedContextLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  detectedContextConfidence: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
  },
  detectedContextDescription: {
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
