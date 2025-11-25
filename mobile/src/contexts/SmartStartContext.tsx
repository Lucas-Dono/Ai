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
  PersonalityCoreData,
  CharacterAppearanceData,
} from '@circuitpromptai/smart-start-core';
import { getAsyncStorageCache } from '../storage/AsyncStorageCache';

// ============================================================================
// TYPES
// ============================================================================

interface SmartStartState {
  // Current draft
  draft: CharacterDraft;

  // Wizard progress
  currentStep: 'type' | 'genre' | 'search' | 'customize' | 'review';
  completedSteps: string[];

  // Auto-save status
  isSaving: boolean;
  lastSaved: Date | null;

  // Generation status
  isGenerating: boolean;
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

  // Character data
  setSearchResult: (result: SearchResult) => void;
  setPersonality: (personality: PersonalityCoreData) => void;
  setAppearance: (appearance: CharacterAppearanceData) => void;
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
  });

  // Auto-save draft to AsyncStorage
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

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
   * Set search result
   */
  const setSearchResult = useCallback((result: SearchResult) => {
    updateDraft({
      name: result.name,
      searchResult: result as any, // TODO: fix type
      physicalAppearance: result.description,
    });
  }, [updateDraft]);

  /**
   * Set personality data
   */
  const setPersonality = useCallback((personality: PersonalityCoreData) => {
    updateDraft({
      personalityCore: personality as any, // TODO: fix type after extracting types
    });
  }, [updateDraft]);

  /**
   * Set appearance data
   */
  const setAppearance = useCallback((appearance: CharacterAppearanceData) => {
    updateDraft({
      characterAppearance: appearance as any, // TODO: fix type
    });
  }, [updateDraft]);

  const value: SmartStartContextValue = {
    ...state,
    updateDraft,
    resetDraft,
    loadDraft,
    setCurrentStep,
    markStepComplete,
    isStepComplete,
    setGenerating,
    setSearchResult,
    setPersonality,
    setAppearance,
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
