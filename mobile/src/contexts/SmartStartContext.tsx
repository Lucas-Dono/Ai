/**
 * Smart Start Context
 *
 * Global state management for Smart Start wizard flow
 * Handles draft character data, auto-save, and navigation state
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type {
  CharacterDraft,
  SearchResult,
  GenreId,
  DepthLevelId,
  UserTier,
  // ContextCategoryId, // Temporalmente comentado hasta que se compile smart-start-core
  // PersonalityCoreData, // Temporalmente comentado
  // CharacterAppearanceData, // Temporalmente comentado
} from '@circuitpromptai/smart-start-core';
import { getAsyncStorageCache } from '../storage/AsyncStorageCache';
import { getDefaultDepthForTier } from '@circuitpromptai/smart-start-core';

// TEMPORAL: Tipos locales hasta que se compile smart-start-core
type ContextCategoryId = 'historical' | 'cultural-icon' | 'fictional' | 'real-person' | 'original';
type PersonalityCoreData = any;
type CharacterAppearanceData = any;

// ============================================================================
// TYPES
// ============================================================================

interface SmartStartState {
  // Current draft
  draft: CharacterDraft;

  // Wizard progress
  currentStep: 'type' | 'context' | 'genre' | 'search' | 'depth' | 'generation' | 'review';
  completedSteps: string[];

  // Auto-save status
  isSaving: boolean;
  lastSaved: Date | null;

  // Generation status
  isGenerating: boolean;
  generatedProfile: any | null; // SmartStartGeneratedProfile

  // User tier for depth customization
  userTier: UserTier;
}

interface SmartStartContextValue extends SmartStartState {
  // Draft manipulation
  updateDraft: (updates: Partial<CharacterDraft>) => void;
  resetDraft: () => void;
  loadDraft: () => Promise<boolean>;

  // Navigation helpers
  setCurrentStep: (step: SmartStartState['currentStep']) => void;
  markStepComplete: (step: string) => void;
  isStepComplete: (step: string) => boolean;

  // Generation
  setGenerating: (isGenerating: boolean) => void;
  setGeneratedProfile: (profile: any) => void;

  // Character data
  setSearchResult: (result: SearchResult) => void;
  setPersonality: (personality: PersonalityCoreData) => void;
  setAppearance: (appearance: CharacterAppearanceData) => void;
  setDepthLevel: (depthLevel: DepthLevelId) => void;

  // User tier
  setUserTier: (tier: UserTier) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const SmartStartContext = createContext<SmartStartContextValue | null>(null);

const DRAFT_KEY = 'smart-start-draft';
const AUTO_SAVE_INTERVAL = 3000; // 3 seconds

// ============================================================================
// PROVIDER
// ============================================================================

export function SmartStartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SmartStartState>({
    draft: {},
    currentStep: 'type',
    completedSteps: [],
    isSaving: false,
    lastSaved: null,
    isGenerating: false,
    generatedProfile: null,
    userTier: 'free', // Default to free tier (should be fetched from user profile)
  });

  // Auto-save draft to AsyncStorage
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const saveDraft = async () => {
      if (Object.keys(state.draft).length === 0) {
        return; // Don't save empty draft
      }

      setState(prev => ({ ...prev, isSaving: true }));

      try {
        const cache = getAsyncStorageCache();
        await cache.set(DRAFT_KEY, state.draft, 86400000); // 24 hour TTL

        setState(prev => ({
          ...prev,
          isSaving: false,
          lastSaved: new Date(),
        }));
      } catch (error) {
        console.error('[SmartStart] Failed to save draft:', error);
        setState(prev => ({ ...prev, isSaving: false }));
      }
    };

    // Debounce auto-save
    timeoutId = setTimeout(saveDraft, AUTO_SAVE_INTERVAL);

    return () => clearTimeout(timeoutId);
  }, [state.draft]);

  /**
   * Load draft from AsyncStorage
   */
  const loadDraft = useCallback(async (): Promise<boolean> => {
    try {
      const cache = getAsyncStorageCache();
      const savedDraft = await cache.get(DRAFT_KEY);

      if (savedDraft) {
        setState(prev => ({
          ...prev,
          draft: savedDraft,
        }));
        return true;
      }

      return false;
    } catch (error) {
      console.error('[SmartStart] Failed to load draft:', error);
      return false;
    }
  }, []);

  /**
   * Update draft with partial data
   */
  const updateDraft = useCallback((updates: Partial<CharacterDraft>) => {
    setState(prev => ({
      ...prev,
      draft: {
        ...prev.draft,
        ...updates,
        lastModified: new Date(),
      },
    }));
  }, []);

  /**
   * Reset draft and wizard state
   */
  const resetDraft = useCallback(async () => {
    setState({
      draft: {},
      currentStep: 'type',
      completedSteps: [],
      isSaving: false,
      lastSaved: null,
      isGenerating: false,
      generatedProfile: null,
      userTier: 'free',
    });

    // Clear saved draft
    try {
      const cache = getAsyncStorageCache();
      await cache.delete(DRAFT_KEY);
    } catch (error) {
      console.error('[SmartStart] Failed to clear draft:', error);
    }
  }, []);

  /**
   * Set current wizard step
   */
  const setCurrentStep = useCallback((step: SmartStartState['currentStep']) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  /**
   * Mark a step as complete
   */
  const markStepComplete = useCallback((step: string) => {
    setState(prev => {
      if (prev.completedSteps.includes(step)) {
        return prev;
      }
      return {
        ...prev,
        completedSteps: [...prev.completedSteps, step],
      };
    });
  }, []);

  /**
   * Check if step is complete
   */
  const isStepComplete = useCallback(
    (step: string): boolean => {
      return state.completedSteps.includes(step);
    },
    [state.completedSteps]
  );

  /**
   * Set generation status
   */
  const setGenerating = useCallback((isGenerating: boolean) => {
    setState(prev => ({ ...prev, isGenerating }));
  }, []);

  /**
   * Set generated profile from AI
   */
  const setGeneratedProfile = useCallback((profile: any) => {
    setState(prev => ({ ...prev, generatedProfile: profile }));
  }, []);

  /**
   * Set search result
   * Automatically sets context and archetype if detected by backend
   */
  const setSearchResult = useCallback((result: SearchResult) => {
    const updates: any = {
      name: result.name,
      searchResult: result,
      physicalAppearance: result.description,
    };

    // Auto-set context if detected by backend
    if ((result as any).suggestedContext) {
      updates.context = (result as any).suggestedContext;
      updates.contextSubcategory = (result as any).contextSubcategory;
      updates.contextOccupation = (result as any).contextOccupation;
      updates.contextEra = (result as any).contextEra;
      console.log('[SmartStart] Auto-detected context:', (result as any).suggestedContext,
        'subcategory:', (result as any).contextSubcategory,
        'confidence:', (result as any).contextConfidence);
    }

    // Auto-set archetype (genre) if detected by backend
    if ((result as any).suggestedArchetype || (result as any).suggestedGenre) {
      updates.genre = (result as any).suggestedArchetype || (result as any).suggestedGenre;
      console.log('[SmartStart] Auto-detected archetype:', updates.genre,
        'confidence:', (result as any).archetypeConfidence || (result as any).genreConfidence);
    }

    updateDraft(updates);
  }, [updateDraft]);

  /**
   * Set personality data
   */
  const setPersonality = useCallback((personality: PersonalityCoreData) => {
    updateDraft({
      personality: personality as any, // Usando 'personality' que es el campo correcto en CharacterDraft
    });
  }, [updateDraft]);

  /**
   * Set appearance data
   */
  const setAppearance = useCallback((appearance: CharacterAppearanceData) => {
    updateDraft({
      physicalAppearance: JSON.stringify(appearance), // CharacterDraft uses physicalAppearance as string
    } as any);
  }, [updateDraft]);

  /**
   * Set depth level for character generation
   */
  const setDepthLevel = useCallback((depthLevel: DepthLevelId) => {
    updateDraft({ depthLevel });
  }, [updateDraft]);

  /**
   * Set user tier (free, plus, ultra)
   * This should typically be called when user profile is loaded
   */
  const setUserTier = useCallback((tier: UserTier) => {
    setState(prev => ({ ...prev, userTier: tier }));
  }, []);

  const value: SmartStartContextValue = {
    ...state,
    updateDraft,
    resetDraft,
    loadDraft,
    setCurrentStep,
    markStepComplete,
    isStepComplete,
    setGenerating,
    setGeneratedProfile,
    setSearchResult,
    setPersonality,
    setAppearance,
    setDepthLevel,
    setUserTier,
  };

  return (
    <SmartStartContext.Provider value={value}>
      {children}
    </SmartStartContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useSmartStartContext() {
  const context = useContext(SmartStartContext);

  if (!context) {
    throw new Error('useSmartStartContext must be used within SmartStartProvider');
  }

  return context;
}
