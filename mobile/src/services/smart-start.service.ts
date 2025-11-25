/**
 * Smart Start Service - Mobile
 *
 * Main service for Smart Start character creation in React Native
 * Uses @circuitpromptai/smart-start-core for shared logic
 */

import {
  SearchRouter,
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

import { getAsyncStorageCache } from '../storage/AsyncStorageCache';

// TODO: Import and configure search sources when they are extracted to shared package
// For now, we'll need to create mobile-specific source implementations
// import { AniListSource, WikipediaSource, etc. } from '@circuitpromptai/smart-start-core';

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
  private searchRouter: SearchRouter | null = null;
  private initialized = false;

  /**
   * Initialize Smart Start service
   * Must be called before using other methods
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Get AsyncStorage cache instance
      const cache = getAsyncStorageCache('smart-start');

      // TODO: Initialize search sources when they're available in shared package
      // For now, we'll create an empty SearchRouter
      // const sources = [
      //   new AniListSource(),
      //   new WikipediaSource(),
      //   // ... other sources
      // ];

      this.searchRouter = new SearchRouter(
        [], // Empty sources for now
        {
          cache,
          searchTimeout: 10000,
          detailsTimeout: 5000,
        }
      );

      this.initialized = true;
      console.log('[SmartStartService] Initialized successfully');
    } catch (error) {
      console.error('[SmartStartService] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Search for characters across multiple sources
   *
   * @param query - Search query (character name)
   * @param genre - Genre to search in
   * @param options - Search options
   * @returns Search results with cache status
   */
  async searchCharacters(
    query: string,
    genre: GenreId,
    options?: SearchOptions
  ): Promise<{ results: SearchResult[]; cached: boolean }> {
    this.ensureInitialized();

    try {
      return await this.searchRouter!.search(query, genre, options);
    } catch (error) {
      console.error('[SmartStartService] Search failed:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a character
   *
   * @param sourceId - Source identifier
   * @param externalId - External ID from source
   * @returns Character details
   */
  async getCharacterDetails(
    sourceId: string,
    externalId: string
  ): Promise<SearchResult | null> {
    this.ensureInitialized();

    try {
      return await this.searchRouter!.getDetails(
        sourceId as any,
        externalId
      );
    } catch (error) {
      console.error('[SmartStartService] Get details failed:', error);
      return null;
    }
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
   */
  async testSources(): Promise<Map<string, boolean>> {
    this.ensureInitialized();

    try {
      return await this.searchRouter!.testAllSources();
    } catch (error) {
      console.error('[SmartStartService] Test sources failed:', error);
      return new Map();
    }
  }

  /**
   * Get available sources for a genre
   */
  getSourcesForGenre(genre: GenreId) {
    this.ensureInitialized();
    return this.searchRouter!.getSourcesForGenre(genre);
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Reset service (clear cache, reinitialize)
   */
  async reset(): Promise<void> {
    this.initialized = false;
    this.searchRouter = null;
    await this.initialize();
  }

  /**
   * Ensure service is initialized before use
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.searchRouter) {
      throw new Error(
        'SmartStartService not initialized. Call initialize() first.'
      );
    }
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
