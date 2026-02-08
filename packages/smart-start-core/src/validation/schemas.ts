/**
 * Zod Validation Schemas
 *
 * Runtime validation schemas for all core types
 * Platform-agnostic validation that works on web and mobile
 */

import { z } from 'zod';

// ============================================================================
// GENRE SYSTEM SCHEMAS
// ============================================================================

export const GenreIdSchema = z.enum(['anime', 'gaming', 'movies', 'tv', 'books', 'roleplay']);
export const SubGenreIdSchema = z.string().min(1).max(100);
export const ArchetypeIdSchema = z.string().min(1).max(100);

export const ArchetypeSchema = z.object({
  id: ArchetypeIdSchema,
  name: z.string().min(1).max(200),
  description: z.string().max(1000),
  traits: z.array(z.string().max(100)).optional(),
});

export const SubGenreSchema = z.object({
  id: SubGenreIdSchema,
  name: z.string().min(1).max(200),
  description: z.string().max(1000),
  archetypes: z.array(ArchetypeSchema),
});

export const GenreSchema = z.object({
  id: GenreIdSchema,
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  icon: z.string().optional(),
  subgenres: z.array(SubGenreSchema),
});

// ============================================================================
// CHARACTER CREATION SCHEMAS
// ============================================================================

export const CharacterTypeSchema = z.enum(['existing', 'original']);

export const CharacterDraftSchema = z.object({
  // Basic info
  name: z.string().min(1).max(200).optional(),
  characterType: CharacterTypeSchema.optional(),

  // Genre selection
  genre: GenreIdSchema.optional(),
  subgenre: SubGenreIdSchema.optional(),
  archetype: ArchetypeIdSchema.optional(),

  // Search result reference
  searchResult: z.any().optional(), // Will be defined below

  // Core attributes
  personality: z.string().max(5000).optional(),
  purpose: z.string().max(5000).optional(),
  tone: z.string().max(1000).optional(),
  physicalAppearance: z.string().max(5000).optional(),

  // Advanced settings
  nsfwMode: z.boolean().default(false),
  allowDevelopTraumas: z.boolean().default(false),
  initialBehavior: z.string().max(100).optional(),

  // Metadata
  createdAt: z.date().optional(),
  lastModified: z.date().optional(),
});

// ============================================================================
// SEARCH SYSTEM SCHEMAS
// ============================================================================

export const SearchSourceIdSchema = z.enum([
  'anilist',
  'myanimelist',
  'tvmaze',
  'tmdb',
  'igdb',
  'wikipedia',
  'firecrawl',
]);

export const SearchResultSchema = z.object({
  // Identity
  id: z.string().min(1),
  externalId: z.string().optional(),
  name: z.string().min(1),

  // Content
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),

  // Source
  source: SearchSourceIdSchema,
  sourceUrl: z.string().url().optional(),

  // Metadata
  confidence: z.number().min(0).max(1),
  metadata: z.record(z.string(), z.any()).optional(),

  // Character attributes
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  age: z.number().int().min(0).max(150).optional(),
  traits: z.array(z.string().max(100)).optional(),
  appearance: z.string().max(2000).optional(),
});

export const SearchOptionsSchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
  timeout: z.number().int().min(1000).max(60000).optional(),
  sources: z.array(SearchSourceIdSchema).optional(),
  includeNSFW: z.boolean().optional(),
});

export const SearchResponseSchema = z.object({
  results: z.array(SearchResultSchema),
  cached: z.boolean(),
  source: SearchSourceIdSchema.optional(),
  query: z.string(),
  totalResults: z.number().int().min(0).optional(),
});

// ============================================================================
// PERSONALITY ANALYSIS SCHEMAS
// ============================================================================

export const BigFiveTraitsSchema = z.object({
  openness: z.number().min(0).max(100).int(),
  conscientiousness: z.number().min(0).max(100).int(),
  extraversion: z.number().min(0).max(100).int(),
  agreeableness: z.number().min(0).max(100).int(),
  neuroticism: z.number().min(0).max(100).int(),
});

export const CoreValueSchema = z.object({
  value: z.string().min(1).max(100),
  weight: z.number().min(0).max(1),
  description: z.string().min(1).max(500),
});

export const MoralSchemaSchema = z.object({
  domain: z.string().min(1).max(100),
  stance: z.string().min(1).max(300),
  threshold: z.number().min(0).max(1),
});

export const BaselineEmotionsSchema = z.object({
  joy: z.number().min(0).max(1),
  curiosity: z.number().min(0).max(1),
  anxiety: z.number().min(0).max(1),
  affection: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  melancholy: z.number().min(0).max(1),
});

export const PersonalityCoreDataSchema = BigFiveTraitsSchema.extend({
  coreValues: z.array(CoreValueSchema).min(1).max(10),
  moralSchemas: z.array(MoralSchemaSchema).max(10),
  backstory: z.string().max(10000).optional(),
  baselineEmotions: BaselineEmotionsSchema,
});

export const PersonalityContextSchema = z.object({
  name: z.string().max(100).optional(),
  age: z.union([z.string().max(20), z.number().int().min(0).max(150)]).optional(),
  gender: z.string().max(50).optional(),
  occupation: z.string().max(200).optional(),
  backstory: z.string().max(10000).optional(),
});

export const AnalysisResultSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    tokensUsed: z.object({
      input: z.number().int().min(0),
      output: z.number().int().min(0),
    }).optional(),
  });

// ============================================================================
// APPEARANCE GENERATION SCHEMAS
// ============================================================================

export const CharacterStyleSchema = z.enum(['realistic', 'anime', 'semi-realistic']);
export const GenderTypeSchema = z.enum(['male', 'female', 'non-binary', 'other']);
export const AgeRangeSchema = z.enum(['18-22', '23-27', '28-35', '36-45', '46-60', '60+']);

export const CharacterAppearanceDataSchema = z.object({
  gender: GenderTypeSchema,
  age: z.union([AgeRangeSchema, z.string().min(1).max(20)]),
  ethnicity: z.string().max(50).optional(),
  hairColor: z.string().max(100).optional(),
  hairStyle: z.string().max(200).optional(),
  eyeColor: z.string().max(50).optional(),
  clothing: z.string().max(500).optional(),
  style: CharacterStyleSchema,
  basePrompt: z.string().min(1).max(2000),
  negativePrompt: z.string().max(1000).optional(),
  referencePhotoUrl: z.string().url().optional(),
  basePhotoUrl: z.string().url().optional(),
  seed: z.number().int().optional(),
  preferredProvider: z.enum(['gemini', 'huggingface', 'stable-diffusion']).optional(),
});

export const AppearanceContextSchema = z.object({
  name: z.string().max(100).optional(),
  age: z.union([z.string().max(20), z.number().int().min(0).max(150)]).optional(),
  gender: z.string().max(50).optional(),
  personality: z.string().max(5000).optional(),
  occupation: z.string().max(200).optional(),
  ethnicity: z.string().max(50).optional(),
  style: CharacterStyleSchema.optional(),
  existingAppearance: z.string().max(2000).optional(),
});

// ============================================================================
// CONFIGURATION SCHEMAS
// ============================================================================

export const SmartStartConfigSchema = z.object({
  apiBaseUrl: z.string().url().optional(),
  searchTimeout: z.number().int().min(1000).max(60000).optional(),
  searchLimit: z.number().int().min(1).max(100).optional(),
  enabledSources: z.array(SearchSourceIdSchema).optional(),
  cacheEnabled: z.boolean().optional(),
  cacheTTL: z.number().int().min(0).optional(),
  enableHighConfidenceDetection: z.boolean().optional(),
  enableAutoSave: z.boolean().optional(),
});

// ============================================================================
// VALIDATION ERROR SCHEMAS
// ============================================================================

export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string().optional(),
});

export const ServiceErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  statusCode: z.number().int().optional(),
  details: z.any().optional(),
});

// ============================================================================
// HELPER VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate and parse data with a Zod schema
 * Returns typed result with success/error
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}

/**
 * Validate and throw on error
 */
export function validateOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  errorMessage?: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = errorMessage || 'Validation failed';
      const details = (error as z.ZodError).issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`${message}: ${details}`);
    }
    throw error;
  }
}

/**
 * Check if data is valid without throwing
 */
export function isValid<T>(schema: z.ZodSchema<T>, data: unknown): data is T {
  return schema.safeParse(data).success;
}

// ============================================================================
// TYPE INFERENCE HELPERS
// ============================================================================

// Export inferred types from schemas for convenience
export type InferredBigFiveTraits = z.infer<typeof BigFiveTraitsSchema>;
export type InferredCoreValue = z.infer<typeof CoreValueSchema>;
export type InferredBaselineEmotions = z.infer<typeof BaselineEmotionsSchema>;
export type InferredPersonalityCoreData = z.infer<typeof PersonalityCoreDataSchema>;
export type InferredCharacterAppearanceData = z.infer<typeof CharacterAppearanceDataSchema>;
export type InferredSearchResult = z.infer<typeof SearchResultSchema>;
export type InferredCharacterDraft = z.infer<typeof CharacterDraftSchema>;
