/**
 * Core types for Smart Start system
 * Shared between web and mobile platforms
 */

// ============================================================================
// CONTEXT SYSTEM (Character Nature/Origin)
// ============================================================================

/**
 * Context defines WHO/WHAT the character is (their nature/origin)
 * Examples: Historical figure, cultural icon, fictional character, real person, original creation
 */
export type ContextCategoryId =
  | 'historical'      // Historical figures (pre-2000)
  | 'cultural-icon'   // Contemporary celebrities/public figures
  | 'fictional'       // Fictional characters from media
  | 'real-person'     // Real contemporary people (not famous)
  | 'original';       // Original creations

export type ContextSubcategoryId = string;

export interface ContextCategory {
  id: ContextCategoryId;
  name: string;
  icon: string;
  color: string;
  description: string;
  subcategories: ContextSubcategory[];
}

export interface ContextSubcategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

// ============================================================================
// ARCHETYPE SYSTEM (Relationship Type)
// ============================================================================

/**
 * Archetype defines the RELATIONSHIP between user and character
 * Examples: Romance, Friendship, Mentor, Professional, Roleplay, Wellness
 *
 * Note: This replaces the old media-based genre system (anime, movies, TV, etc.)
 */
export type GenreId =
  | 'romance'         // Romantic/intimate connection
  | 'friendship'      // Platonic companionship
  | 'professional'    // Mentor, learning, guidance, work
  | 'roleplay'        // Narrative storytelling and adventure
  | 'wellness';       // Mental health, self-care, therapeutic

export type SubGenreId = string;
export type ArchetypeId = string;

export interface Genre {
  id: GenreId;
  name: string;
  description: string;
  icon?: string;
  subgenres: SubGenre[];
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
  traits?: string[];
}

// ============================================================================
// DEPTH CUSTOMIZATION SYSTEM
// ============================================================================

/**
 * Depth level determines how realistic/detailed the character will be.
 * This affects generation complexity, features available, and token usage.
 */
export type DepthLevelId = 'basic' | 'realistic' | 'ultra';

/**
 * User subscription tier that determines available depth levels
 */
export type UserTier = 'free' | 'plus' | 'ultra';

/**
 * Individual feature that can be enabled/disabled based on depth level
 */
export interface DepthFeature {
  /** Unique feature identifier */
  id: string;
  /** Display name */
  name: string;
  /** Short description of what this feature does */
  description: string;
  /** Icon for UI display */
  icon?: string;
  /** Which depth levels include this feature */
  availableIn: DepthLevelId[];
}

/**
 * Complete depth level configuration
 */
export interface DepthLevel {
  /** Unique identifier */
  id: DepthLevelId;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Icon for UI */
  icon: string;
  /** Color theme */
  color: string;
  /** Minimum tier required to use this depth */
  requiredTier: UserTier;
  /** Badge label (e.g., "Plus", "Ultra") */
  badge?: string;
  /** Features included at this depth */
  features: string[]; // Feature IDs
  /** Target max output tokens for generation */
  targetTokens: number;
  /** Expected generation time (seconds) */
  estimatedTime: number;
  /** Prompt complexity level */
  promptComplexity: 'simple' | 'moderate' | 'complex';
}

// ============================================================================
// CHARACTER CREATION
// ============================================================================

export type CharacterType = 'existing' | 'original';

export interface CharacterDraft {
  // Basic info
  name?: string;
  characterType?: CharacterType;

  // Context (WHO/WHAT the character is)
  context?: ContextCategoryId;
  contextSubcategory?: ContextSubcategoryId;
  contextOccupation?: string;
  contextEra?: string; // e.g., "1950s", "Contemporary", "Medieval"

  // Archetype (Relationship type - formerly genre)
  genre?: GenreId; // Kept as 'genre' for backward compatibility, but now represents archetype
  subgenre?: SubGenreId;
  archetype?: ArchetypeId;

  // Depth customization (NEW)
  depthLevel?: DepthLevelId;

  // Search result (if existing character)
  searchResult?: SearchResult;

  // Core attributes
  personality?: string;
  purpose?: string;
  tone?: string;
  physicalAppearance?: string;
  emotionalTone?: string; // Detected or selected emotional tone (romantic, adventurous, etc.)

  // Advanced settings
  nsfwMode?: boolean;
  allowDevelopTraumas?: boolean;
  initialBehavior?: string;

  // Metadata
  createdAt?: Date;
  lastModified?: Date;
}

// ============================================================================
// SEARCH SYSTEM
// ============================================================================

export type SearchSourceId =
  | 'anilist'
  | 'myanimelist'
  | 'jikan'
  | 'mal'
  | 'tvmaze'
  | 'tmdb'
  | 'igdb'
  | 'wikipedia'
  | 'firecrawl';

export interface SearchResult {
  // Identity
  id: string;
  externalId?: string;
  name: string;
  alternateName?: string;

  // Content
  description?: string;
  imageUrl?: string;
  thumbnailUrl?: string;

  // Source
  source: SearchSourceId;
  sourceId: SearchSourceId;
  sourceTitle?: string;
  sourceUrl?: string;

  // Metadata
  confidence: number;
  metadata?: Record<string, any>;

  // Character attributes (extracted)
  gender?: 'male' | 'female' | 'other' | 'unknown';
  age?: number;
  traits?: string[];
  appearance?: string;

  // Context detection (auto-detected by backend)
  suggestedContext?: ContextCategoryId;
  contextSubcategory?: ContextSubcategoryId;
  contextConfidence?: number;
  contextOccupation?: string;
  contextEra?: string;

  // Archetype detection (auto-detected by backend)
  suggestedArchetype?: GenreId;
  archetypeConfidence?: number;

  // Legacy genre field (for backward compatibility)
  suggestedGenre?: GenreId;
  genreConfidence?: number;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  page?: number;
  timeout?: number;
  sources?: SearchSourceId[];
  includeNSFW?: boolean;
}

export interface SearchResponse {
  results: SearchResult[];
  cached: boolean;
  source?: SearchSourceId;
  query: string;
  totalResults?: number;
}

// ============================================================================
// SEARCH SOURCES
// ============================================================================

export interface SearchSource {
  sourceId: SearchSourceId;
  name: string;
  supportedGenres: GenreId[];
  rateLimit?: {
    requests: number;
    per: number; // milliseconds
  };

  /**
   * Search for characters matching the query
   */
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;

  /**
   * Get detailed information about a specific character
   */
  getDetails(id: string): Promise<SearchResult | null>;

  /**
   * Test if the source is available and properly configured
   */
  testConnection(): Promise<boolean>;
}

// ============================================================================
// CACHE INTERFACE
// ============================================================================

export interface ICache {
  /**
   * Get a value from cache
   */
  get(key: string): Promise<any | null>;

  /**
   * Set a value in cache with optional TTL
   * @param ttl Time to live in milliseconds
   */
  set(key: string, value: any, ttl?: number): Promise<void>;

  /**
   * Delete a value from cache
   */
  delete(key: string): Promise<void>;

  /**
   * Clear all cache entries (optional)
   */
  clear?(): Promise<void>;
}

// ============================================================================
// VALIDATION & ERROR HANDLING
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ServiceError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

// ============================================================================
// AI SERVICES - PERSONALITY ANALYSIS
// ============================================================================

/**
 * Big Five personality model scores.
 * Each trait is scored 0-100 where:
 * - 0-30: Low (below average)
 * - 31-50: Below average
 * - 51-70: Average to above average
 * - 71-100: High (significantly above average)
 */
export interface BigFiveTraits {
  /** Curiosity, creativity, openness to new experiences */
  openness: number;
  /** Organization, self-discipline, reliability */
  conscientiousness: number;
  /** Social energy, assertiveness, enthusiasm */
  extraversion: number;
  /** Cooperation, empathy, kindness */
  agreeableness: number;
  /** Emotional instability (higher = more anxious/volatile) */
  neuroticism: number;
}

/**
 * Core value that drives character behavior.
 * Weight determines priority when values conflict.
 */
export interface CoreValue {
  /** The value name (e.g., "authenticity", "loyalty", "creativity") */
  value: string;
  /** Importance weight 0-1 (1 = highest priority) */
  weight: number;
  /** Description of what this value means to the character */
  description: string;
}

/**
 * Moral schema that guides ethical decisions.
 */
export interface MoralSchema {
  /** The moral domain (e.g., "honesty", "loyalty", "justice") */
  domain: string;
  /** Character's stance on this domain */
  stance: string;
  /** Threshold 0-1 for when character will act on this value */
  threshold: number;
}

/**
 * Baseline emotions that define character's default emotional state.
 * All values are 0-1 representing intensity.
 */
export interface BaselineEmotions {
  /** Happiness and contentment */
  joy: number;
  /** Desire to learn and explore */
  curiosity: number;
  /** Nervousness and worry */
  anxiety: number;
  /** Warmth and care for others */
  affection: number;
  /** Self-assurance */
  confidence: number;
  /** Subtle sadness or melancholy */
  melancholy: number;
}

/**
 * Complete PersonalityCore data structure
 */
export interface PersonalityCoreData extends BigFiveTraits {
  /** Core values that drive the character */
  coreValues: CoreValue[];
  /** Moral schemas for ethical decisions */
  moralSchemas: MoralSchema[];
  /** Character's backstory (optional) */
  backstory?: string;
  /** Default emotional baseline */
  baselineEmotions: BaselineEmotions;
}

/**
 * Context for personality analysis
 */
export interface PersonalityContext {
  name?: string;
  age?: string | number;
  gender?: string;
  occupation?: string;
  backstory?: string;
}

/**
 * Generic result type for AI analysis operations
 */
export interface AnalysisResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  tokensUsed?: {
    input: number;
    output: number;
  };
}

/**
 * Default Big Five trait values (neutral)
 */
export const DEFAULT_BIG_FIVE: BigFiveTraits = {
  openness: 50,
  conscientiousness: 50,
  extraversion: 50,
  agreeableness: 50,
  neuroticism: 50,
};

/**
 * Default baseline emotions (neutral)
 */
export const DEFAULT_BASELINE_EMOTIONS: BaselineEmotions = {
  joy: 0.5,
  curiosity: 0.5,
  anxiety: 0.3,
  affection: 0.5,
  confidence: 0.5,
  melancholy: 0.2,
};

// ============================================================================
// AI SERVICES - APPEARANCE GENERATION
// ============================================================================

/** Visual style for character generation */
export type CharacterStyle = 'realistic' | 'anime' | 'semi-realistic';

/** Gender options */
export type GenderType = 'male' | 'female' | 'non-binary' | 'other';

/** Age range options */
export type AgeRange =
  | '18-22'
  | '23-27'
  | '28-35'
  | '36-45'
  | '46-60'
  | '60+';

/**
 * Complete CharacterAppearance data structure
 */
export interface CharacterAppearanceData {
  /** Character's gender */
  gender: GenderType;
  /** Age range string */
  age: AgeRange | string;
  /** Ethnicity (optional) */
  ethnicity?: string;
  /** Hair color */
  hairColor?: string;
  /** Hair style description */
  hairStyle?: string;
  /** Eye color */
  eyeColor?: string;
  /** Typical clothing/outfit description */
  clothing?: string;
  /** Visual style for generation */
  style: CharacterStyle;
  /** Full Stable Diffusion / Gemini prompt */
  basePrompt: string;
  /** Negative prompt for generation (optional) */
  negativePrompt?: string;
  /** Reference photo URL uploaded by user */
  referencePhotoUrl?: string;
  /** Generated base photo URL (neutral expression) */
  basePhotoUrl?: string;
  /** Seed for consistent generation */
  seed?: number;
  /** Preferred image generation provider */
  preferredProvider?: 'gemini' | 'huggingface' | 'stable-diffusion';
}

/**
 * Context for appearance generation
 */
export interface AppearanceContext {
  name?: string;
  age?: string | number;
  gender?: string;
  personality?: string;
  occupation?: string;
  ethnicity?: string;
  style?: CharacterStyle;
  existingAppearance?: string; // From extracted character
}

export interface PersonalityAnalysis {
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  behaviorPatterns: string[];
  confidence: number;
}

export interface AppearanceGenerationOptions {
  gender?: 'male' | 'female' | 'other';
  ethnicity?: string;
  ageRange?: 'child' | 'teen' | 'young_adult' | 'adult' | 'elderly';
  bodyType?: string;
  hairStyle?: string;
  distinctiveFeatures?: string[];
}

export interface GeneratedAppearance {
  description: string;
  detailedDescription: string;
  promptForImageGeneration?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface SmartStartConfig {
  // API endpoints (optional, can be platform-specific)
  apiBaseUrl?: string;

  // Search configuration
  searchTimeout?: number;
  searchLimit?: number;
  enabledSources?: SearchSourceId[];

  // Cache configuration
  cacheEnabled?: boolean;
  cacheTTL?: number;

  // Feature flags
  enableHighConfidenceDetection?: boolean;
  enableAutoSave?: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<T>;

/**
 * Helper type for making specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Helper type for making specific properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
