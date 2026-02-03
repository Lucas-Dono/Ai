/**
 * Smart Start Wizard Screen
 *
 * Unified vertical wizard for character creation
 * Replaces the 5 separate screens with a single scrollable flow
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressIndicator } from '../../components/smart-start/ProgressIndicator';
import { TypeStep } from './steps/TypeStep';
import { ContextStep } from './steps/ContextStep';
import { GenreStep } from './steps/GenreStep';
import { SearchStep } from './steps/SearchStep';
import { DepthCustomizationStep } from './steps/DepthCustomizationStep';
import { GenerationStep } from './steps/GenerationStep';
import { ReviewStep } from './steps/ReviewStep';
import { useSmartStartContext } from '../../contexts/SmartStartContext';
import type { GenreId, SearchResult, ContextCategoryId, DepthLevelId } from '@circuitpromptai/smart-start-core';
import type { EmotionType } from '../../utils/emotion-detection';
import { colors } from '../../theme';

// ============================================================================
// TYPES
// ============================================================================

type WizardStep = 'type' | 'context' | 'genre' | 'search' | 'depth' | 'generation' | 'review';

interface Props {
  navigation: StackNavigationProp<any>;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function SmartStartWizardScreen({ navigation }: Props) {
  const {
    draft,
    updateDraft,
    resetDraft,
    markStepComplete,
    isStepComplete,
    setCurrentStep,
    setSearchResult,
    setPersonality,
    setAppearance,
    userTier,
  } = useSmartStartContext();

  const parentNavigation = useNavigation();

  // Ref for ScrollView to enable programmatic scrolling
  const scrollViewRef = useRef<ScrollView>(null);

  // Wizard state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([]);

  // Data state
  const [characterType, setCharacterType] = useState<'existing' | 'original' | null>(null);
  const [selectedContext, setSelectedContext] = useState<ContextCategoryId | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<GenreId | null>(null);
  const [selectedSubgenre, setSelectedSubgenre] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<SearchResult | null>(null);
  const [selectedDepth, setSelectedDepth] = useState<DepthLevelId | null>(null);

  // Step order (changes based on character type)
  // Existing: type → search → context → genre → depth → generation → review
  // Original: type → genre → depth → generation → review (no context/search for original)
  const shouldShowSearch = characterType === 'existing';
  const effectiveSteps: WizardStep[] = shouldShowSearch
    ? ['type', 'search', 'context', 'genre', 'depth', 'generation', 'review']
    : ['type', 'genre', 'depth', 'generation', 'review'];

  useEffect(() => {
    setCurrentStep('type');
  }, []);

  // Smart scroll when step changes - positions input near top of screen (RESPONSIVE)
  useEffect(() => {
    if (currentStepIndex > 0) {
      const timer = setTimeout(() => {
        // Obtener altura de pantalla para cálculos responsive
        const screenHeight = Dimensions.get('window').height;

        // Calcular valores basados en porcentaje de altura de pantalla
        // Esto se adapta automáticamente a cualquier tamaño de dispositivo
        const estimatedStepHeight = screenHeight * 0.45; // 45% de altura por paso
        const baseOffset = screenHeight * 0.65; // 30% de altura como offset base

        const scrollPosition = (currentStepIndex - 1) * estimatedStepHeight + baseOffset;

        scrollViewRef.current?.scrollTo({
          y: scrollPosition,
          animated: true
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex]);

  // ============================================================================
  // STEP COMPLETION HANDLERS
  // ============================================================================

  const handleTypeComplete = useCallback((type: 'existing' | 'original') => {
    setCharacterType(type);
    updateDraft({ characterType: type });
    markStepComplete('type');
    setCompletedSteps(prev => [...prev, 'type']);
    // Existing: move to search (index 1)
    // Original: move to genre (index 1)
    setCurrentStepIndex(1);
  }, [updateDraft, markStepComplete]);

  const handleSearchComplete = useCallback((character: SearchResult) => {
    setSelectedCharacter(character);
    setSearchResult(character);
    markStepComplete('search');
    setCompletedSteps(prev => [...prev, 'search']);
    // For existing: search is at index 1, move to context (index 2)
    setCurrentStepIndex(2);
  }, [setSearchResult, markStepComplete]);

  const handleSearchSkip = useCallback(() => {
    markStepComplete('search');
    setCompletedSteps(prev => [...prev, 'search']);
    // For existing: search is at index 1, move to context (index 2)
    setCurrentStepIndex(2);
  }, [markStepComplete]);

  const handleContextComplete = useCallback((
    contextId: ContextCategoryId,
    subcategoryId?: string,
    occupation?: string,
    era?: string
  ) => {
    setSelectedContext(contextId);
    updateDraft({
      context: contextId,
      contextSubcategory: subcategoryId,
      contextOccupation: occupation,
      contextEra: era,
    });
    markStepComplete('context');
    setCompletedSteps(prev => [...prev, 'context']);
    // For existing: context is at index 2, move to genre (index 3)
    setCurrentStepIndex(3);
  }, [updateDraft, markStepComplete]);

  const handleGenreComplete = useCallback((genreId: GenreId, subgenreId?: string) => {
    setSelectedGenre(genreId);
    setSelectedSubgenre(subgenreId || null);
    updateDraft({ genre: genreId, subgenre: subgenreId });
    markStepComplete('genre');
    setCompletedSteps(prev => [...prev, 'genre']);

    // Existing: genre is at index 3, move to depth (index 4)
    // Original: genre is at index 1, move to depth (index 2)
    if (characterType === 'existing') {
      setCurrentStepIndex(4); // depth
    } else {
      setCurrentStepIndex(2); // depth
    }
  }, [characterType, updateDraft, markStepComplete]);

  const handleDepthComplete = useCallback((depthId: DepthLevelId) => {
    setSelectedDepth(depthId);
    updateDraft({ depthLevel: depthId });
    markStepComplete('depth');
    setCompletedSteps(prev => [...prev, 'depth']);

    // Existing: depth is at index 4, move to generation (index 5)
    // Original: depth is at index 2, move to generation (index 3)
    if (characterType === 'existing') {
      setCurrentStepIndex(5); // generation
    } else {
      setCurrentStepIndex(3); // generation
    }
  }, [characterType, updateDraft, markStepComplete]);

  const handleGenerationComplete = useCallback((generatedProfile: any) => {
    markStepComplete('generation');
    setCompletedSteps(prev => [...prev, 'generation']);

    // Existing: generation is at index 5, move to review (index 6)
    // Original: generation is at index 3, move to review (index 4)
    if (characterType === 'existing') {
      setCurrentStepIndex(6); // review
    } else {
      setCurrentStepIndex(4); // review
    }
  }, [characterType, markStepComplete]);


  const handleCreateCharacter = useCallback(async () => {
    try {
      // Import service dynamically
      const { smartStartService } = await import('../../services/smart-start.service');

      // Call API to create character
      const result = await smartStartService.createCharacter({
        name: draft.name || 'Sin nombre',
        characterType: draft.characterType || 'original',
        genre: draft.genre,
        subgenre: draft.subgenre,
        physicalAppearance: draft.physicalAppearance,
        emotionalTone: draft.emotionalTone,
        searchResult: draft.searchResult,
        personality: (draft as any).personality,
        appearance: (draft as any).physicalAppearance,
      } as any);

      // Mark step complete
      markStepComplete('review');

      // Show success
      Alert.alert(
        '¡Personaje creado! ✨',
        `${result.agent.name} ha sido creado exitosamente!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset draft
              resetDraft();

              // Navigate back to home
              parentNavigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('[SmartStartWizard] Create character error:', error);

      Alert.alert(
        'Error',
        'No se pudo crear el personaje. Por favor, intenta nuevamente.',
        [{ text: 'OK' }]
      );
    }
  }, [draft, markStepComplete, resetDraft, parentNavigation]);

  const handleEditSection = useCallback((section: WizardStep) => {
    const sectionIndex = effectiveSteps.indexOf(section);
    if (sectionIndex !== -1) {
      setCurrentStepIndex(sectionIndex);
    }
  }, [effectiveSteps]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* App Header */}
      <View style={styles.appHeader}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={19} color="#8b5cf6" />
          <Text style={styles.appTitle}>Blaniel</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate('CVStyleCreator')}
            style={styles.manualButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="document-text" size={20} color="#8b5cf6" />
            <Text style={styles.manualButtonText}>Manual</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => parentNavigation.goBack()}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Indicator */}
      <ProgressIndicator currentStep={currentStepIndex} totalSteps={effectiveSteps.length} />

      {/* Scrollable Steps */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Step 0: Type (always first) */}
        <TypeStep
          visible={currentStepIndex >= 0}
          completed={completedSteps.includes('type')}
          onComplete={handleTypeComplete}
        />

        {/* EXISTING PATH: Search → Context → Genre → Customize → Review */}
        {characterType === 'existing' && (
          <>
            {/* Step 1: Search */}
            {completedSteps.includes('type') && (
              <SearchStep
                visible={currentStepIndex >= 1}
                completed={completedSteps.includes('search')}
                genre={selectedGenre || undefined}
                onComplete={handleSearchComplete}
                onSkip={handleSearchSkip}
              />
            )}

            {/* Step 2: Context */}
            {completedSteps.includes('search') && (
              <ContextStep
                visible={currentStepIndex >= 2}
                completed={completedSteps.includes('context')}
                characterType={characterType}
                onComplete={handleContextComplete}
              />
            )}

            {/* Step 3: Genre (Archetype) */}
            {completedSteps.includes('context') && (
              <GenreStep
                visible={currentStepIndex >= 3}
                completed={completedSteps.includes('genre')}
                characterType={characterType}
                onComplete={handleGenreComplete}
              />
            )}

            {/* Step 4: Depth Customization */}
            {completedSteps.includes('genre') && (
              <DepthCustomizationStep
                visible={currentStepIndex >= 4}
                completed={completedSteps.includes('depth')}
                userTier={userTier}
                onComplete={handleDepthComplete}
              />
            )}

            {/* Step 5: Generation */}
            {completedSteps.includes('depth') && selectedGenre && (
              <GenerationStep
                visible={currentStepIndex >= 5}
                completed={completedSteps.includes('generation')}
                onComplete={handleGenerationComplete}
              />
            )}

            {/* Step 6: Review */}
            {completedSteps.includes('generation') && (
              <ReviewStep
                visible={currentStepIndex >= 6}
                completed={completedSteps.includes('review')}
                draft={draft}
                onCreateCharacter={handleCreateCharacter}
                onEdit={handleEditSection}
              />
            )}
          </>
        )}

        {/* ORIGINAL PATH: Genre → Depth → Generation → Review */}
        {characterType === 'original' && (
          <>
            {/* Step 1: Genre */}
            {completedSteps.includes('type') && (
              <GenreStep
                visible={currentStepIndex >= 1}
                completed={completedSteps.includes('genre')}
                characterType={characterType}
                onComplete={handleGenreComplete}
              />
            )}

            {/* Step 2: Depth Customization */}
            {completedSteps.includes('genre') && (
              <DepthCustomizationStep
                visible={currentStepIndex >= 2}
                completed={completedSteps.includes('depth')}
                userTier={userTier}
                onComplete={handleDepthComplete}
              />
            )}

            {/* Step 3: Generation */}
            {completedSteps.includes('depth') && selectedGenre && (
              <GenerationStep
                visible={currentStepIndex >= 3}
                completed={completedSteps.includes('generation')}
                onComplete={handleGenerationComplete}
              />
            )}

            {/* Step 4: Review */}
            {completedSteps.includes('generation') && (
              <ReviewStep
                visible={currentStepIndex >= 4}
                completed={completedSteps.includes('review')}
                draft={draft}
                onCreateCharacter={handleCreateCharacter}
                onEdit={handleEditSection}
              />
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  manualButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8b5cf6',
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
    paddingBottom: 120, // Extra padding at bottom for keyboard space
  },
});
