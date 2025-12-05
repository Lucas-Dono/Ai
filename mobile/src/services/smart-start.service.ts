/**
 * Smart Start Service - Mobile
 *
 * Main service for Smart Start character creation in React Native
 * Uses @circuitpromptai/smart-start-core for shared logic
 */

import {
  type SearchResult,
  type GenreId,
  type SearchOptions,
  analyzeBigFive,
  generateCoreValues,
  generatePersonalityCore,
  generateCharacterAppearance,
  type PersonalityCoreData,
  type CharacterAppearanceData,
  type PersonalityContext,
  type AppearanceContext,
  type AnalysisResult,
} from '@circuitpromptai/smart-start-core';

// Search is now handled by backend API
// No need for local SearchRouter or sources

/**
 * Smart Start Service for mobile character creation
 *
 * Provides high-level methods for:
 * - Character search across multiple sources
 * - Personality generation
 * - Appearance generation
 * - Complete character profile generation
 */
class SmartStartService {
  private initialized = false;

  /**
   * Initialize Smart Start service
   * Now only used for logging, actual search is handled by backend API
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    console.log('[SmartStartService] Initialized (using backend API for search)');
  }

  /**
   * Search for characters across multiple sources using backend API
   *
   * @param query - Search query (character name)
   * @param genre - Genre to search in (currently not used by backend, all sources searched)
   * @param options - Search options
   * @returns Search results with cache status
   */
  async searchCharacters(
    query: string,
    genre: GenreId,
    options?: SearchOptions
  ): Promise<{ results: SearchResult[]; cached: boolean }> {
    try {
      const { apiClient } = await import('./api');

      console.log('[SmartStartService] Searching via API:', query);

      const endpoint = `/api/v1/smart-start/search?q=${encodeURIComponent(query)}&limit=${options?.limit || 10}`;

      const response = await apiClient.get<{
        query: string;
        results: Array<{
          id: string;
          source: string;
          name: string;
          description: string;
          imageUrl?: string;
          url?: string;
          confidence: number;
          suggestedGenre?: string;
          genreConfidence?: number;
        }>;
        total: number;
      }>(endpoint);

      // Convert backend results to SearchResult format
      const searchResults: SearchResult[] = response.results.map((result) => ({
        id: result.id,
        name: result.name,
        sourceId: result.source,
        description: result.description,
        imageUrl: result.imageUrl,
        suggestedGenre: result.suggestedGenre,
        genreConfidence: result.genreConfidence,
        metadata: {
          source: result.source,
          url: result.url,
          confidence: result.confidence,
        },
      } as any));

      console.log('[SmartStartService] Found', searchResults.length, 'results');
      console.log('[SmartStartService] Sample result:', {
        name: searchResults[0]?.name,
        imageUrl: searchResults[0]?.imageUrl,
        source: searchResults[0]?.sourceId,
        suggestedGenre: (searchResults[0] as any)?.suggestedGenre,
        genreConfidence: (searchResults[0] as any)?.genreConfidence,
      });

      return {
        results: searchResults,
        cached: false, // Backend handles caching
      };
    } catch (error) {
      console.error('[SmartStartService] Search failed:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a character
   * Note: Currently not needed as search results already include details
   *
   * @param sourceId - Source identifier
   * @param externalId - External ID from source
   * @returns Character details
   */
  async getCharacterDetails(
    sourceId: string,
    externalId: string
  ): Promise<SearchResult | null> {
    // TODO: Implement backend endpoint if detailed character info is needed
    console.log('[SmartStartService] getCharacterDetails not implemented (use search results)');
    return null;
  }

  /**
   * Generate personality analysis from text
   *
   * @param personalityText - Free-form personality description
   * @param context - Additional context
   * @returns Personality analysis result
   */
  async generatePersonality(
    personalityText: string,
    context?: PersonalityContext
  ): Promise<AnalysisResult<PersonalityCoreData>> {
    try {
      return await generatePersonalityCore(personalityText, context, {
        includeMoralSchemas: true,
        valuesCount: 5,
      });
    } catch (error) {
      console.error('[SmartStartService] Personality generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate character appearance
   *
   * @param context - Appearance context
   * @returns Appearance generation result
   */
  async generateAppearance(
    context: AppearanceContext
  ): Promise<AnalysisResult<CharacterAppearanceData>> {
    try {
      return await generateCharacterAppearance(context);
    } catch (error) {
      console.error('[SmartStartService] Appearance generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate complete character profile
   * Combines personality and appearance generation
   *
   * @param personalityText - Personality description
   * @param context - Character context
   * @returns Complete character profile
   */
  async generateCompleteProfile(
    personalityText: string,
    context?: PersonalityContext & AppearanceContext
  ): Promise<{
    personality?: PersonalityCoreData;
    appearance?: CharacterAppearanceData;
    errors: string[];
    tokensUsed: { input: number; output: number };
  }> {
    const errors: string[] = [];
    let totalTokens = { input: 0, output: 0 };

    try {
      // Generate personality and appearance in parallel
      const [personalityResult, appearanceResult] = await Promise.all([
        this.generatePersonality(personalityText, context),
        this.generateAppearance(context || {}),
      ]);

      // Collect results
      const personality = personalityResult.success
        ? personalityResult.data
        : undefined;
      const appearance = appearanceResult.success
        ? appearanceResult.data
        : undefined;

      // Collect errors
      if (!personalityResult.success) {
        errors.push(personalityResult.error || 'Personality generation failed');
      }
      if (!appearanceResult.success) {
        errors.push(appearanceResult.error || 'Appearance generation failed');
      }

      // Sum tokens
      if (personalityResult.tokensUsed) {
        totalTokens.input += personalityResult.tokensUsed.input;
        totalTokens.output += personalityResult.tokensUsed.output;
      }
      if (appearanceResult.tokensUsed) {
        totalTokens.input += appearanceResult.tokensUsed.input;
        totalTokens.output += appearanceResult.tokensUsed.output;
      }

      return {
        personality,
        appearance,
        errors,
        tokensUsed: totalTokens,
      };
    } catch (error) {
      console.error('[SmartStartService] Complete profile generation failed:', error);
      errors.push(error instanceof Error ? error.message : 'Unknown error');

      return {
        errors,
        tokensUsed: totalTokens,
      };
    }
  }

  /**
   * Test connectivity of all search sources
   * Note: Sources are tested by backend, this is a no-op
   */
  async testSources(): Promise<Map<string, boolean>> {
    console.log('[SmartStartService] testSources not needed (backend handles this)');
    return new Map([
      ['wikipedia', true],
      ['jikan', true],
      ['fandom', true],
    ]);
  }

  /**
   * Get available sources for a genre
   * Note: Backend searches all sources regardless of genre
   */
  async getSourcesForGenre(genre: GenreId) {
    console.log('[SmartStartService] getSourcesForGenre not needed (backend searches all)');
    return ['wikipedia', 'jikan', 'fandom'];
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Generate deep character profile using AI
   * Calls backend API to generate comprehensive character data
   *
   * @param input - Generation input data
   * @returns Generated profile with all sections
   */
  async generateProfile(input: {
    name: string;
    context: string; // ContextCategoryId
    archetype: string; // GenreId
    contextSubcategory?: string;
    contextOccupation?: string;
    contextEra?: string;
    searchResult?: SearchResult;
    customDescription?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other' | 'unknown';
    language?: 'es' | 'en';
  }): Promise<{
    success: boolean;
    profile: any; // SmartStartGeneratedProfile
    generationTime: number;
  }> {
    try {
      const { apiClient } = await import('./api');

      console.log('[SmartStartService] Generating profile:', {
        name: input.name,
        context: input.context,
        archetype: input.archetype,
      });

      // Use extended timeout for AI generation (2 minutes)
      // Profile generation can take 30-90 seconds depending on tier and complexity
      const response = await apiClient.post<{
        success: boolean;
        profile: any;
        generationTime: number;
      }>('/api/v1/smart-start/generate', input, {
        timeout: 120000, // 2 minutes timeout for AI generation
      });

      console.log('[SmartStartService] Profile generated successfully in', response.generationTime, 'ms');
      return response;
    } catch (error) {
      console.error('[SmartStartService] Failed to generate profile:', error);
      throw error;
    }
  }

  /**
   * Create character using Smart Start data
   * Calls backend API to persist the character
   *
   * @param draft - Complete character draft from Smart Start context
   * @returns Created character data
   */
  async createCharacter(draft: {
    name: string;
    characterType: 'existing' | 'original';
    genre?: string;
    subgenre?: string;
    physicalAppearance?: string;
    emotionalTone?: string;
    searchResult?: SearchResult;
    personalityCore?: PersonalityCoreData;
    characterAppearance?: CharacterAppearanceData;
  }): Promise<{
    success: boolean;
    agent: {
      id: string;
      name: string;
      description: string;
      imageUrl: string | null;
    };
  }> {
    try {
      const { apiClient } = await import('./api');

      // Use extended timeout for character creation (90 seconds)
      // Character creation involves database writes and complex data processing
      const response = await apiClient.post<{
        success: boolean;
        agent: {
          id: string;
          name: string;
          description: string;
          imageUrl: string | null;
        };
      }>('/api/v1/smart-start/create', draft, {
        timeout: 90000, // 90 seconds timeout for character creation
      });

      console.log('[SmartStartService] Character created successfully:', response.agent.id);
      return response;
    } catch (error) {
      console.error('[SmartStartService] Failed to create character:', error);
      throw error;
    }
  }

  /**
   * Cancel ongoing search
   * Note: This is a no-op stub for compatibility
   */
  cancelSearch(): void {
    console.log('[SmartStartService] cancelSearch is a no-op (backend handles search)');
  }

  /**
   * Reset service (clear cache, reinitialize)
   */
  async reset(): Promise<void> {
    this.initialized = false;
    await this.initialize();
  }
}

// Export singleton instance
export const smartStartService = new SmartStartService();

/**
 * Initialize Smart Start service
 * Call this in your App.tsx or root component
 *
 * @example
 * import { initSmartStart } from './services/smart-start.service';
 *
 * useEffect(() => {
 *   initSmartStart();
 * }, []);
 */
export async function initSmartStart(): Promise<void> {
  await smartStartService.initialize();
}

/**
 * Hook to use Smart Start service in components
 */
export function useSmartStart() {
  return smartStartService;
}
