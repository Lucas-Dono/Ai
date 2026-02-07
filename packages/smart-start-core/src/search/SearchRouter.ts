/**
 * Search Router - Intelligent source selection and fallback system
 * Platform-agnostic version that uses ICache interface
 *
 * Routes searches to the most appropriate source based on genre and query
 * Implements fallback chain for resilience
 */

import {
  SearchSource,
  SearchResult,
  SearchOptions,
  GenreId,
  SearchSourceId,
} from '../types';
import { ICache } from './ICache';
import { withTimeout } from '../utils/withTimeout';

// Timeout configuration
const SEARCH_TIMEOUT_MS = 10000; // 10 seconds per source
const DETAILS_TIMEOUT_MS = 5000; // 5 seconds for getDetails calls

// Source priority configuration per genre
interface SourceConfig {
  source: SearchSource;
  priority: number;
}

export interface SearchRouterConfig {
  cache?: ICache;
  searchTimeout?: number;
  detailsTimeout?: number;
}

export class SearchRouter {
  private sources: Map<SearchSourceId, SearchSource>;
  private cache: ICache;
  private sourcesByGenre: Map<GenreId, SourceConfig[]>;
  private searchTimeout: number;
  private detailsTimeout: number;

  constructor(
    sources: SearchSource[],
    config: SearchRouterConfig = {}
  ) {
    this.sources = new Map();
    this.sourcesByGenre = new Map();
    this.searchTimeout = config.searchTimeout || SEARCH_TIMEOUT_MS;
    this.detailsTimeout = config.detailsTimeout || DETAILS_TIMEOUT_MS;

    // Use provided cache or create a no-op cache
    this.cache = config.cache || new NoOpCache();

    // Register sources
    for (const source of sources) {
      this.sources.set(source.sourceId, source);
    }

    this.configureGenrePriorities();
  }

  /**
   * Configure source priorities per genre
   * This can be overridden by platform-specific implementations
   */
  private configureGenrePriorities(): void {
    // Helper to get source safely
    const getSource = (id: SearchSourceId) => this.sources.get(id);

    // Anime: AniList and MAL first
    const animeSource = getSource('anilist');
    const malSource = getSource('myanimelist');
    const tvmazeSource = getSource('tvmaze');
    const tmdbSource = getSource('tmdb');
    const igdbSource = getSource('igdb');
    const wikiSource = getSource('wikipedia');
    const firecrawlSource = getSource('firecrawl');

    // Define priorities for each genre (relationship-based genres)
    const genreConfigs: Record<GenreId, SourceConfig[]> = {
      roleplay: [
        animeSource && { source: animeSource, priority: 10 },
        malSource && { source: malSource, priority: 9 },
        igdbSource && { source: igdbSource, priority: 8 },
        tmdbSource && { source: tmdbSource, priority: 7 },
        tvmazeSource && { source: tvmazeSource, priority: 6 },
        wikiSource && { source: wikiSource, priority: 5 },
        firecrawlSource && { source: firecrawlSource, priority: 1 },
      ].filter(Boolean) as SourceConfig[],

      romance: [
        wikiSource && { source: wikiSource, priority: 10 },
        firecrawlSource && { source: firecrawlSource, priority: 5 },
      ].filter(Boolean) as SourceConfig[],

      friendship: [
        wikiSource && { source: wikiSource, priority: 10 },
        firecrawlSource && { source: firecrawlSource, priority: 5 },
      ].filter(Boolean) as SourceConfig[],

      professional: [
        wikiSource && { source: wikiSource, priority: 10 },
        firecrawlSource && { source: firecrawlSource, priority: 5 },
      ].filter(Boolean) as SourceConfig[],

      wellness: [
        wikiSource && { source: wikiSource, priority: 10 },
        firecrawlSource && { source: firecrawlSource, priority: 5 },
      ].filter(Boolean) as SourceConfig[],
    };

    // Set all genre configurations
    for (const [genre, configs] of Object.entries(genreConfigs)) {
      this.sourcesByGenre.set(genre as GenreId, configs);
    }
  }

  /**
   * Main search method - tries sources in priority order with fallback
   * Returns results with metadata indicating if they came from cache
   */
  async search(
    query: string,
    genre: GenreId,
    options: SearchOptions = {}
  ): Promise<{ results: SearchResult[]; cached: boolean }> {
    // 1. Check cache
    const cacheKey = this.getCacheKey(query, genre);
    const cachedData = await this.cache.get(cacheKey);

    if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
      console.log(`[SearchRouter] Cache hit for "${query}" in ${genre}`);
      return { results: cachedData, cached: true };
    }

    // 2. Get prioritized sources for this genre
    const sourcesConfig = this.sourcesByGenre.get(genre) || [];
    const sortedSources = sourcesConfig
      .filter(config => config.source)
      .sort((a, b) => b.priority - a.priority);

    console.log(
      `[SearchRouter] Searching "${query}" in ${genre} with ${sortedSources.length} sources`
    );

    // 3. Try each source in priority order with timeout
    const errors: Array<{ source: string; error: any }> = [];

    for (const config of sortedSources) {
      try {
        console.log(`[SearchRouter] Trying ${config.source.sourceId}...`);
        const startTime = Date.now();

        // Execute search with timeout
        const results = await withTimeout(
          config.source.search(query, options),
          this.searchTimeout,
          `Search timeout (${this.searchTimeout}ms) for ${config.source.sourceId}`
        );

        const searchTime = Date.now() - startTime;
        console.log(`[SearchRouter] ${config.source.sourceId} completed in ${searchTime}ms`);

        if (results.length > 0) {
          console.log(
            `[SearchRouter] Found ${results.length} results from ${config.source.sourceId}`
          );

          // Cache successful results (24 hours TTL)
          await this.cache.set(cacheKey, results, 86400000);

          return { results, cached: false };
        }

        console.log(`[SearchRouter] No results from ${config.source.sourceId}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isTimeout = errorMessage.includes('timeout');

        console.error(
          `[SearchRouter] ${config.source.sourceId} ${isTimeout ? 'timed out' : 'failed'}:`,
          errorMessage
        );
        errors.push({ source: config.source.sourceId, error });
        // Continue to next source
      }
    }

    // 4. If all sources failed or returned empty, try fallback
    console.log('[SearchRouter] All sources exhausted, trying fallback...');

    const fallbackResults = await this.fallbackSearch(query, options);

    if (fallbackResults.length > 0) {
      await this.cache.set(cacheKey, fallbackResults, 86400000);
      return { results: fallbackResults, cached: false };
    }

    return { results: [], cached: false };
  }

  /**
   * Fallback search using Firecrawl with timeout
   */
  private async fallbackSearch(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const firecrawl = this.sources.get('firecrawl');
    if (!firecrawl) return [];

    try {
      console.log('[SearchRouter] Using Firecrawl fallback...');
      const startTime = Date.now();

      const results = await withTimeout(
        firecrawl.search(query, { ...options, limit: 5 }),
        this.searchTimeout,
        `Firecrawl fallback timeout (${this.searchTimeout}ms)`
      );

      const searchTime = Date.now() - startTime;
      console.log(`[SearchRouter] Firecrawl fallback completed in ${searchTime}ms`);

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isTimeout = errorMessage.includes('timeout');

      console.error(
        `[SearchRouter] Firecrawl fallback ${isTimeout ? 'timed out' : 'failed'}:`,
        errorMessage
      );
      return [];
    }
  }

  /**
   * Get details from a specific source with timeout
   */
  async getDetails(sourceId: SearchSourceId, externalId: string): Promise<SearchResult | null> {
    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error(`Unknown source: ${sourceId}`);
    }

    try {
      console.log(`[SearchRouter] Fetching details from ${sourceId} for ${externalId}`);
      const startTime = Date.now();

      // Execute getDetails with timeout
      const details = await withTimeout(
        source.getDetails(externalId),
        this.detailsTimeout,
        `getDetails timeout (${this.detailsTimeout}ms) for ${sourceId}`
      );

      const fetchTime = Date.now() - startTime;
      console.log(`[SearchRouter] Details fetched from ${sourceId} in ${fetchTime}ms`);

      return details;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isTimeout = errorMessage.includes('timeout');

      console.error(
        `[SearchRouter] getDetails ${isTimeout ? 'timed out' : 'failed'} for ${sourceId}:`,
        errorMessage
      );
      return null;
    }
  }

  /**
   * Enrich search results by fetching full details for high-confidence matches
   * Sprint 3.3 & 3.4: High confidence detection + getDetails chain
   */
  async enrichHighConfidenceResults(
    results: SearchResult[],
    minConfidence: number = 0.7
  ): Promise<SearchResult[]> {
    const enrichedResults: SearchResult[] = [];

    for (const result of results) {
      // If confidence is high enough, fetch full details
      if (result.confidence >= minConfidence && result.sourceId && result.externalId) {
        console.log(
          `[SearchRouter] High confidence result (${result.confidence.toFixed(2)}): "${result.name}" - Fetching full details...`
        );

        const fullDetails = await this.getDetails(result.sourceId, result.externalId);

        if (fullDetails) {
          console.log(`[SearchRouter] Successfully enriched "${result.name}" with full details`);
          enrichedResults.push(fullDetails);
        } else {
          console.log(`[SearchRouter] Failed to fetch details for "${result.name}", using original result`);
          enrichedResults.push(result);
        }
      } else {
        // Low confidence or missing IDs - use original result
        enrichedResults.push(result);
      }
    }

    return enrichedResults;
  }

  /**
   * Search with automatic enrichment for high-confidence results
   * Combines search + getDetails chain in one call
   */
  async searchWithEnrichment(
    query: string,
    genre: GenreId,
    options: SearchOptions & { minConfidence?: number } = {}
  ): Promise<{ results: SearchResult[]; cached: boolean }> {
    // First, perform regular search
    const searchResponse = await this.search(query, genre, options);

    // If results came from cache or user disabled enrichment, return as-is
    if (searchResponse.cached || options.minConfidence === undefined) {
      return searchResponse;
    }

    // Enrich high-confidence results with full details
    const enrichedResults = await this.enrichHighConfidenceResults(
      searchResponse.results,
      options.minConfidence || 0.7
    );

    return {
      results: enrichedResults,
      cached: false,
    };
  }

  /**
   * Filter results by confidence threshold
   */
  filterByConfidence(results: SearchResult[], minConfidence: number): SearchResult[] {
    return results.filter(r => r.confidence >= minConfidence);
  }

  /**
   * Test all sources connectivity
   */
  async testAllSources(): Promise<Map<SearchSourceId, boolean>> {
    const results = new Map<SearchSourceId, boolean>();

    for (const [sourceId, source] of this.sources) {
      try {
        const isConnected = await source.testConnection();
        results.set(sourceId, isConnected);
      } catch (error) {
        results.set(sourceId, false);
      }
    }

    return results;
  }

  /**
   * Get source by ID
   */
  getSource(sourceId: SearchSourceId): SearchSource | undefined {
    return this.sources.get(sourceId);
  }

  /**
   * Get all available sources
   */
  getAllSources(): SearchSource[] {
    return Array.from(this.sources.values());
  }

  /**
   * Get sources for a specific genre
   */
  getSourcesForGenre(genre: GenreId): SearchSource[] {
    const config = this.sourcesByGenre.get(genre) || [];
    return config
      .sort((a, b) => b.priority - a.priority)
      .map(c => c.source)
      .filter(Boolean);
  }

  /**
   * Generate cache key for query and genre
   */
  private getCacheKey(query: string, genre: GenreId): string {
    const normalizedQuery = query.toLowerCase().trim();
    return `smart-start:search:${genre}:${normalizedQuery}`;
  }
}

/**
 * No-op cache implementation (when cache is not available)
 */
class NoOpCache implements ICache {
  async get(_key: string): Promise<any | null> {
    return null;
  }

  async set(_key: string, _value: any, _ttl?: number): Promise<void> {
    // Do nothing
  }

  async delete(_key: string): Promise<void> {
    // Do nothing
  }
}
