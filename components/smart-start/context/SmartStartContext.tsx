'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type {
  GenreId,
  SubGenreId,
  ArchetypeId,
  SearchResult,
  CharacterDraft,
  SmartStartStep,
  DepthLevelId,
  UserTier,
} from '@/lib/smart-start/core/types';
import { genreDetector, type GenreDetectionResult } from '@/lib/smart-start/services/genre-detector';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Genre {
  id: GenreId;
  name: string;
  description: string;
  icon: string;
  gradient: {
    from: string;
    to: string;
  };
  tags: string[];
  subGenres: SubGenre[];
}

export interface SubGenre {
  id: SubGenreId;
  name: string;
  description: string;
  archetypes: Archetype[];
}

export interface Archetype {
  id: ArchetypeId;
  name: string;
  description: string;
}

interface SmartStartState {
  // Session management
  sessionId: string | null;
  currentStep: SmartStartStep;
  isLoading: boolean;
  error: string | null;

  // Available options
  availableGenres: Genre[];

  // User selections
  selectedGenre: Genre | null;
  selectedSubgenre: SubGenre | null;
  selectedArchetype: Archetype | null;
  characterType: 'existing' | 'original' | null;

  // Depth customization
  selectedDepth: DepthLevelId | null;
  userTier: UserTier;

  // Search flow
  searchQuery: string;
  searchResults: SearchResult[];
  selectedSearchResult: SearchResult | null;
  isSearching: boolean;

  // Character draft
  characterDraft: Partial<CharacterDraft>;
  isGenerating: boolean;

  // Genre detection
  detectedGenre: GenreDetectionResult | null;
}

interface SmartStartContextValue extends SmartStartState {
  // Session management
  initializeSession: () => Promise<void>;

  // Genre selection
  selectGenre: (genre: Genre, subgenre?: SubGenre, archetype?: Archetype) => Promise<void>;

  // Type selection
  selectCharacterType: (type: 'existing' | 'original') => Promise<void>;

  // Depth selection
  selectDepthLevel: (depthLevel: DepthLevelId) => void;
  setUserTier: (tier: UserTier) => void;

  // Search
  searchCharacters: (query: string) => Promise<void>;
  selectSearchResult: (result: SearchResult) => Promise<void>;

  // Genre detection
  detectGenre: (result: SearchResult) => GenreDetectionResult;

  // Generation
  generateCharacter: () => Promise<void>;

  // Customization
  updateCharacterDraft: (updates: Partial<CharacterDraft>) => void;

  // Navigation
  goToStep: (step: SmartStartStep) => void;
  goBack: () => void;
  skip: () => void;

  // Finalization
  finalizeCharacter: () => Promise<string>;

  // Error handling
  clearError: () => void;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const SmartStartContext = createContext<SmartStartContextValue | null>(null);

const INITIAL_STATE: SmartStartState = {
  sessionId: null,
  currentStep: 'type',
  isLoading: false,
  error: null,
  availableGenres: [],
  selectedGenre: null,
  selectedSubgenre: null,
  selectedArchetype: null,
  characterType: null,
  selectedDepth: null,
  userTier: 'free', // Default to free tier (will be fetched from user profile)
  searchQuery: '',
  searchResults: [],
  selectedSearchResult: null,
  isSearching: false,
  characterDraft: {},
  isGenerating: false,
  detectedGenre: null,
};

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface SmartStartProviderProps {
  children: ReactNode;
}

export function SmartStartProvider({ children }: SmartStartProviderProps) {
  const [state, setState] = useState<SmartStartState>(INITIAL_STATE);

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  const initializeSession = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/smart-start/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session');
      }

      const data = await response.json();

      setState(prev => ({
        ...prev,
        sessionId: data.session.id,
        availableGenres: data.availableGenres || [],
        // Flow starts with 'type' - user chooses existing vs original character
        currentStep: data.session.currentStep || 'type',
      }));
    } catch (error) {
      console.error('[SmartStart] Failed to initialize session:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize session',
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // ============================================================================
  // GENRE SELECTION
  // ============================================================================

  const selectGenre = useCallback(
    async (genre: Genre, subgenre?: SubGenre, archetype?: Archetype) => {
      if (!state.sessionId) {
        setState(prev => ({ ...prev, error: 'No active session' }));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch('/api/smart-start/session', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: state.sessionId,
            action: {
              type: 'select_genre',
              data: {
                genreId: genre.id,
                subgenreId: subgenre?.id,
                archetypeId: archetype?.id,
              },
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update session');
        }

        setState(prev => ({
          ...prev,
          selectedGenre: genre,
          selectedSubgenre: subgenre || null,
          selectedArchetype: archetype || null,
          currentStep: 'type',
        }));
      } catch (error) {
        console.error('[SmartStart] Failed to select genre:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to select genre',
        }));
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    },
    [state.sessionId]
  );

  // ============================================================================
  // CHARACTER TYPE SELECTION
  // ============================================================================

  const selectCharacterType = useCallback(
    async (type: 'existing' | 'original') => {
      if (!state.sessionId) {
        setState(prev => ({ ...prev, error: 'No active session' }));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch('/api/smart-start/session', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: state.sessionId,
            action: {
              type: 'select_type',
              data: { type },
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update session');
        }

        setState(prev => ({
          ...prev,
          characterType: type,
          currentStep: type === 'existing' ? 'search' : 'customize',
        }));
      } catch (error) {
        console.error('[SmartStart] Failed to select character type:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to select character type',
        }));
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    },
    [state.sessionId]
  );

  // ============================================================================
  // DEPTH CUSTOMIZATION
  // ============================================================================

  const selectDepthLevel = useCallback((depthLevel: DepthLevelId) => {
    setState(prev => ({
      ...prev,
      selectedDepth: depthLevel,
      characterDraft: {
        ...prev.characterDraft,
        depthLevel,
      },
    }));
  }, []);

  const setUserTier = useCallback((tier: UserTier) => {
    setState(prev => ({ ...prev, userTier: tier }));
  }, []);

  // ============================================================================
  // CHARACTER SEARCH
  // ============================================================================

  const searchCharacters = useCallback(
    async (query: string) => {
      if (!state.sessionId) {
        setState(prev => ({ ...prev, error: 'Session not initialized' }));
        return;
      }

      setState(prev => ({
        ...prev,
        searchQuery: query,
        isSearching: true,
        error: null,
      }));

      try {
        const response = await fetch('/api/smart-start/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: state.sessionId,
            query,
            // Genre will be auto-detected from search results
            genreId: state.selectedGenre?.id,
          }),
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();

        setState(prev => ({
          ...prev,
          searchResults: data.results || [],
        }));
      } catch (error) {
        console.error('[SmartStart] Search failed:', error);
        setState(prev => ({
          ...prev,
          error: 'Search failed. Please try again.',
          searchResults: [],
        }));
      } finally {
        setState(prev => ({ ...prev, isSearching: false }));
      }
    },
    [state.sessionId, state.selectedGenre]
  );

  const selectSearchResult = useCallback(
    async (result: SearchResult) => {
      if (!state.sessionId) {
        setState(prev => ({ ...prev, error: 'No active session' }));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Auto-detect genre from search result
      const detection = genreDetector.detectFromSearchResult(result);

      try {
        // STEP 1: Fetch complete details if externalId is available
        let completeResult = result;
        if (result.externalId && result.source) {
          try {
            console.log('[SmartStart] Fetching complete details from source:', result.source);

            const detailsResponse = await fetch('/api/smart-start/details', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sourceId: result.source,
                externalId: result.externalId,
              }),
            });

            if (detailsResponse.ok) {
              const detailsData = await detailsResponse.json();
              if (detailsData.details) {
                completeResult = detailsData.details;
                console.log('[SmartStart] Complete details loaded successfully');
              }
            } else {
              console.warn('[SmartStart] Failed to fetch complete details, using original result');
            }
          } catch (detailsError) {
            console.warn('[SmartStart] Error fetching details, using original result:', detailsError);
            // Continue with original result if details fetch fails
          }
        }

        // STEP 2: Generate character from complete or original result
        const response = await fetch('/api/smart-start/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: state.sessionId,
            searchResult: completeResult, // Send complete result instead of just ID
            fromScratch: false,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.details || errorData.error || 'Failed to extract character';
          throw new Error(errorMessage);
        }

        const data = await response.json();

        // Find the detected genre in availableGenres
        const detectedGenreObj = state.availableGenres.find(g => g.id === detection.genre);

        setState(prev => ({
          ...prev,
          selectedSearchResult: completeResult, // Store complete result
          selectedGenre: detectedGenreObj || null,
          characterDraft: data.characterDraft || {},
          detectedGenre: detection,
          currentStep: 'customize',
        }));
      } catch (error) {
        console.error('[SmartStart] Failed to select search result:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to extract character data',
        }));
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    },
    [state.sessionId, state.availableGenres]
  );

  // ============================================================================
  // GENRE DETECTION
  // ============================================================================

  const detectGenre = useCallback((result: SearchResult): GenreDetectionResult => {
    return genreDetector.detectFromSearchResult(result);
  }, []);

  // ============================================================================
  // CHARACTER GENERATION
  // ============================================================================

  const generateCharacter = useCallback(async () => {
    if (!state.sessionId) {
      setState(prev => ({ ...prev, error: 'No active session' }));
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const response = await fetch('/api/smart-start/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          fromScratch: true,
          customizations: state.characterDraft,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details || errorData.error || 'Generation failed';
        throw new Error(errorMessage);
      }

      const data = await response.json();

      setState(prev => ({
        ...prev,
        characterDraft: { ...prev.characterDraft, ...data.characterDraft },
        currentStep: 'review',
      }));
    } catch (error) {
      console.error('[SmartStart] Generation failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate character. Please try again.',
      }));
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [
    state.sessionId,
    state.selectedGenre,
    state.selectedSubgenre,
    state.selectedArchetype,
    state.characterDraft,
  ]);

  // ============================================================================
  // CHARACTER CUSTOMIZATION
  // ============================================================================

  const updateCharacterDraft = useCallback((updates: Partial<CharacterDraft>) => {
    setState(prev => ({
      ...prev,
      characterDraft: {
        ...prev.characterDraft,
        ...updates,
      },
    }));
  }, []);

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  const goToStep = useCallback((step: SmartStartStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const goBack = useCallback(() => {
    setState(prev => {
      // Flow: type -> search (if existing) OR customize (if original) -> depth -> review
      // 'genre' step is optional (only accessed from customize when changing genre)

      // Handle back navigation based on current step
      let previousStep: SmartStartStep = prev.currentStep;

      switch (prev.currentStep) {
        case 'type':
          // Can't go back from type - it's the first step
          previousStep = 'type';
          break;
        case 'search':
          previousStep = 'type';
          break;
        case 'depth':
          // If came from search flow, go back to search; otherwise go to customize
          previousStep = prev.characterType === 'existing' ? 'search' : 'customize';
          break;
        case 'customize':
          // If came from search, go back to search; otherwise go to type
          previousStep = prev.characterType === 'existing' ? 'search' : 'type';
          break;
        case 'review':
          previousStep = 'depth';
          break;
        case 'genre':
          // If on genre selection (changing genre), go back to customize
          previousStep = 'customize';
          break;
        default:
          // Stay on current step
          break;
      }

      return { ...prev, currentStep: previousStep };
    });
  }, []);

  const skip = useCallback(() => {
    // Implement skip logic - could redirect to manual character creation
    if (typeof window !== 'undefined') {
      window.location.href = '/create-character';
    }
  }, []);

  // ============================================================================
  // FINALIZATION
  // ============================================================================

  const finalizeCharacter = useCallback(async (): Promise<string> => {
    if (!state.sessionId) {
      throw new Error('No active session');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Create the actual character through the API
      const response = await fetch('/api/v2/characters/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...state.characterDraft,
          createdViaSmartStart: true,
          smartStartSessionId: state.sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create character');
      }

      const data = await response.json();

      // Mark session as complete
      await fetch('/api/smart-start/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          action: {
            type: 'complete',
            data: { characterId: data.id },
          },
        }),
      });

      return data.id;
    } catch (error) {
      console.error('[SmartStart] Failed to finalize character:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to create character',
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.sessionId, state.characterDraft]);

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: SmartStartContextValue = {
    ...state,
    initializeSession,
    selectGenre,
    selectCharacterType,
    selectDepthLevel,
    setUserTier,
    searchCharacters,
    selectSearchResult,
    detectGenre,
    generateCharacter,
    updateCharacterDraft,
    goToStep,
    goBack,
    skip,
    finalizeCharacter,
    clearError,
  };

  return (
    <SmartStartContext.Provider value={contextValue}>
      {children}
    </SmartStartContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useSmartStart() {
  const context = useContext(SmartStartContext);

  if (!context) {
    throw new Error('useSmartStart must be used within SmartStartProvider');
  }

  return context;
}
