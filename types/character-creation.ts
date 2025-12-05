/**
 * Character Creation System - Unified Type Definitions
 *
 * Types compartidos entre Smart Start y Manual Wizard.
 * 100% compatibles con Prisma schema para PersonalityCore, InternalState,
 * CharacterAppearance, ImportantPerson, e ImportantEvent.
 *
 * @author System
 * @version 2.0.0
 */

import { z } from 'zod';

// ============================================================================
// PERSONALITY CORE TYPES
// Compatible with Prisma model PersonalityCore
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

export const BigFiveTraitsSchema = z.object({
  openness: z.number().min(0).max(100).default(50),
  conscientiousness: z.number().min(0).max(100).default(50),
  extraversion: z.number().min(0).max(100).default(50),
  agreeableness: z.number().min(0).max(100).default(50),
  neuroticism: z.number().min(0).max(100).default(50),
});

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

export const CoreValueSchema = z.object({
  value: z.string().min(1).max(100),
  weight: z.number().min(0).max(1),
  description: z.string().max(500),
});

/**
 * Moral schema that guides ethical decisions.
 * Defines stance and threshold for different moral domains.
 */
export interface MoralSchema {
  /** The moral domain (e.g., "honesty", "loyalty", "justice") */
  domain: string;
  /** Character's stance on this domain */
  stance: string;
  /** Threshold 0-1 for when character will act on this value */
  threshold: number;
}

export const MoralSchemaSchema = z.object({
  domain: z.string().min(1).max(100),
  stance: z.string().max(300),
  threshold: z.number().min(0).max(1),
});

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
  /** Additional custom emotions */
  [key: string]: number;
}

export const BaselineEmotionsSchema = z.object({
  joy: z.number().min(0).max(1).default(0.5),
  curiosity: z.number().min(0).max(1).default(0.5),
  anxiety: z.number().min(0).max(1).default(0.3),
  affection: z.number().min(0).max(1).default(0.5),
  confidence: z.number().min(0).max(1).default(0.5),
  melancholy: z.number().min(0).max(1).default(0.2),
}).catchall(z.number().min(0).max(1));

/**
 * Complete PersonalityCore compatible with Prisma model.
 */
export interface PersonalityCoreData extends BigFiveTraits {
  /** Core values that drive the character (JSON array in Prisma) */
  coreValues: CoreValue[];
  /** Moral schemas for ethical decisions (JSON array in Prisma) */
  moralSchemas: MoralSchema[];
  /** Character's backstory (optional, can be long) */
  backstory?: string;
  /** Default emotional baseline (JSON object in Prisma) */
  baselineEmotions: BaselineEmotions;
}

export const PersonalityCoreDataSchema = BigFiveTraitsSchema.extend({
  coreValues: z.array(CoreValueSchema).min(1).max(10),
  moralSchemas: z.array(MoralSchemaSchema).max(10).default([]),
  backstory: z.string().max(10000).optional(),
  baselineEmotions: BaselineEmotionsSchema,
});

// ============================================================================
// PSYCHOLOGICAL NEEDS TYPES
// Compatible with Prisma model InternalState
// ============================================================================

/**
 * Psychological needs based on Self-Determination Theory.
 * All values are 0-1 representing current satisfaction level.
 */
export interface PsychologicalNeeds {
  /** Need for meaningful relationships and belonging */
  connection: number;
  /** Need for independence and self-direction */
  autonomy: number;
  /** Need to feel capable and effective */
  competence: number;
  /** Need for new experiences and stimulation */
  novelty: number;
}

export const PsychologicalNeedsSchema = z.object({
  connection: z.number().min(0).max(1).default(0.5),
  autonomy: z.number().min(0).max(1).default(0.5),
  competence: z.number().min(0).max(1).default(0.5),
  novelty: z.number().min(0).max(1).default(0.5),
});

/**
 * Character's fears and desires for deeper psychology.
 */
export interface FearsDesiresData {
  /** Things the character fears */
  fears: string[];
  /** Things the character desires */
  desires: string[];
  /** How character handles stress */
  copingMechanisms: string[];
}

export const FearsDesiresDataSchema = z.object({
  fears: z.array(z.string().max(200)).max(10).default([]),
  desires: z.array(z.string().max(200)).max(10).default([]),
  copingMechanisms: z.array(z.string().max(500)).max(10).default([]),
});

// ============================================================================
// CHARACTER APPEARANCE TYPES
// Compatible with Prisma model CharacterAppearance
// ============================================================================

/** Visual style for character generation */
export type CharacterStyle = 'realistic' | 'anime' | 'semi-realistic';

/** Gender options */
export type GenderType = 'male' | 'female' | 'non-binary' | 'other';

/** Ethnicity options (optional) */
export type EthnicityType =
  | 'caucasian'
  | 'asian'
  | 'hispanic'
  | 'african'
  | 'middle-eastern'
  | 'mixed'
  | 'other';

/** Age range options */
export type AgeRange =
  | '18-22'
  | '23-27'
  | '28-35'
  | '36-45'
  | '46-60'
  | '60+';

/**
 * Complete CharacterAppearance data compatible with Prisma model.
 */
export interface CharacterAppearanceData {
  /** Character's gender */
  gender: GenderType;
  /** Age range string */
  age: AgeRange | string;
  /** Ethnicity (optional) */
  ethnicity?: EthnicityType | string;
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

export const CharacterAppearanceDataSchema = z.object({
  gender: z.enum(['male', 'female', 'non-binary', 'other']),
  age: z.string().min(1).max(20),
  ethnicity: z.string().max(50).optional(),
  hairColor: z.string().max(50).optional(),
  hairStyle: z.string().max(200).optional(),
  eyeColor: z.string().max(50).optional(),
  clothing: z.string().max(500).optional(),
  style: z.enum(['realistic', 'anime', 'semi-realistic']).default('realistic'),
  basePrompt: z.string().min(1).max(2000),
  negativePrompt: z.string().max(1000).optional(),
  referencePhotoUrl: z.string().url().optional(),
  basePhotoUrl: z.string().url().optional(),
  seed: z.number().int().optional(),
  preferredProvider: z.enum(['gemini', 'huggingface', 'stable-diffusion']).optional(),
});

// ============================================================================
// IMPORTANT PERSON TYPES
// Compatible with Prisma model ImportantPerson
// ============================================================================

/** Status of an important person */
export type PersonStatus = 'alive' | 'deceased' | 'unknown' | 'estranged';

/** Relationship types */
export type RelationshipType =
  | 'mother'
  | 'father'
  | 'sister'
  | 'brother'
  | 'child'
  | 'partner'
  | 'spouse'
  | 'ex-partner'
  | 'best-friend'
  | 'friend'
  | 'colleague'
  | 'mentor'
  | 'rival'
  | 'pet'
  | 'other';

/** Importance level */
export type ImportanceLevel = 'low' | 'medium' | 'high';

/** ISO date string validation - allows ISO dates and relative date strings */
const isoDateStringSchema = z.string().refine(
  (val) => {
    // Allow ISO dates, year-month-day, or relative strings like "5 years ago"
    const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
    const relativeRegex = /^\d+\s+(year|month|week|day)s?\s+ago$/i;
    return isoRegex.test(val) || relativeRegex.test(val) || !isNaN(Date.parse(val));
  },
  { message: 'Invalid date format' }
);

/**
 * Important person in character's life.
 * Compatible with Prisma model ImportantPerson.
 *
 * @note Fields align with Prisma schema ImportantPerson model
 */
export interface ImportantPersonData {
  /** Person's name */
  name: string;
  /** Relationship to the character (hermana, pareja, amigo, madre, mascota, etc.) */
  relationship: RelationshipType | string;
  /** Age of the person (optional) */
  age?: number;
  /** Gender of the person */
  gender?: GenderType | string;
  /** Description of this person and relationship */
  description?: string;
  /** Person's interests (for conversation context) */
  interests?: string;
  /** Health information if relevant */
  healthInfo?: string;
  /** Birthday (for anniversary tracking) */
  birthday?: Date | string;
  /** When this person was last mentioned in conversation */
  lastMentioned?: Date | string;
  /** How many times this person has been mentioned */
  mentionCount?: number;
  /** Importance level based on relationship depth */
  importance: ImportanceLevel;
  /** Additional flexible metadata */
  metadata?: Record<string, unknown>;
}

export const ImportantPersonDataSchema = z.object({
  name: z.string().min(1).max(100),
  relationship: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150).optional(),
  gender: z.string().max(20).optional(),
  description: z.string().max(2000).optional(),
  interests: z.string().max(1000).optional(),
  healthInfo: z.string().max(1000).optional(),
  birthday: z.union([z.date(), isoDateStringSchema]).optional(),
  lastMentioned: z.union([z.date(), z.string().datetime()]).optional(),
  mentionCount: z.number().int().min(0).default(0),
  importance: z.enum(['low', 'medium', 'high']).default('medium'),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ============================================================================
// IMPORTANT EVENT TYPES
// Compatible with Prisma model ImportantEvent
// ============================================================================

/** Event type categories */
export type EventType =
  | 'birthday'
  | 'anniversary'
  | 'graduation'
  | 'achievement'
  | 'loss'
  | 'trauma'
  | 'relationship'
  | 'career'
  | 'medical'
  | 'travel'
  | 'milestone'
  | 'other';

/** Event priority */
export type EventPriority = 'low' | 'medium' | 'high' | 'critical';

/** Emotional tone of event */
export type EmotionalTone =
  | 'joyful'
  | 'proud'
  | 'bittersweet'
  | 'anxious'
  | 'sad'
  | 'neutral'
  | 'traumatic';

/**
 * Important event in character's life (past or scheduled).
 * Compatible with Prisma model ImportantEvent.
 *
 * @note Fields align with Prisma schema ImportantEvent model
 */
export interface ImportantEventData {
  /** Short title for the event (UI convenience, not in Prisma) */
  title?: string;
  /** Event type/category (birthday, medical, exam, special, anniversary, other) */
  type: EventType | string;
  /** Detailed description of the event */
  description: string;
  /** Date of the event */
  eventDate: Date | string;
  /** Priority level (low, medium, high, critical) */
  priority: EventPriority;
  /** Whether the AI has already mentioned this event */
  mentioned?: boolean;
  /** When the event was last mentioned by AI */
  reminderSentAt?: Date | string;
  /** Whether the event has already happened */
  eventHappened?: boolean;
  /** User's feedback about how the event went */
  userFeedback?: string;
  /** For recurring events (birthdays, anniversaries) */
  isRecurring?: boolean;
  /** Day of month for recurring events (1-31) */
  recurringDay?: number;
  /** Month for recurring events (1-12) */
  recurringMonth?: number;
  /** Who this event affects (user, family, pet, friend) */
  relationship?: string;
  /** Emotional tone of the event */
  emotionalTone?: EmotionalTone;
  /** Additional flexible metadata */
  metadata?: Record<string, unknown>;
}

export const ImportantEventDataSchema = z.object({
  title: z.string().max(200).optional(), // UI convenience field
  type: z.string().min(1).max(50),
  description: z.string().min(1).max(5000),
  eventDate: z.union([z.date(), isoDateStringSchema]),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  mentioned: z.boolean().default(false),
  reminderSentAt: z.union([z.date(), z.string().datetime()]).optional(),
  eventHappened: z.boolean().default(false),
  userFeedback: z.string().max(1000).optional(),
  isRecurring: z.boolean().default(false),
  recurringDay: z.number().int().min(1).max(31).optional(),
  recurringMonth: z.number().int().min(1).max(12).optional(),
  relationship: z.string().max(100).optional(),
  emotionalTone: z.enum(['joyful', 'proud', 'bittersweet', 'anxious', 'sad', 'neutral', 'traumatic']).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ============================================================================
// LOCATION DATA TYPES
// Compatible with validation.service.ts
// ============================================================================

/**
 * Location data with timezone and coordinates.
 */
export interface LocationData {
  /** City name */
  city: string;
  /** Country name */
  country: string;
  /** Region/State (optional) */
  region?: string;
  /** IANA timezone string (e.g., "America/Buenos_Aires") */
  timezone: string;
  /** Geographic coordinates */
  coordinates: {
    lat: number;
    lon: number;
  };
  /** Whether location has been verified via geocoding */
  verified: boolean;
}

export const LocationDataSchema = z.object({
  city: z.string().min(1),
  country: z.string().min(1),
  region: z.string().optional(),
  timezone: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
  verified: z.boolean(),
});

// ============================================================================
// UNIFIED CHARACTER DRAFT
// Master type used by both Smart Start and Manual Wizard
// ============================================================================

/**
 * Complete character draft used during creation process.
 * This is the unified type that both Smart Start and Manual Wizard use.
 */
export interface CharacterDraft {
  // ─────────────────────────────────────────────────────────────────────────
  // IDENTITY (Step 1)
  // ─────────────────────────────────────────────────────────────────────────
  /** Character name */
  name?: string;
  /** Alternate name (aliases, nicknames) */
  alternateName?: string;
  /** Age in years */
  age?: number;
  /** Gender identity */
  gender?: GenderType;
  /** Location with timezone for real-time features */
  location?: LocationData;
  /** Current occupation */
  occupation?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // PERSONALITY (Step 2)
  // ─────────────────────────────────────────────────────────────────────────
  /** Free-form personality description */
  personality?: string;
  /** Character's purpose/role (what they're meant to be for the user) */
  purpose?: string;
  /** Simple trait tags (e.g., ["curious", "empathetic"]) */
  traits?: string[];
  /** Complete PersonalityCore data (Big Five, values, etc.) */
  personalityCore?: PersonalityCoreData;

  // ─────────────────────────────────────────────────────────────────────────
  // APPEARANCE (Step 3)
  // ─────────────────────────────────────────────────────────────────────────
  /** Free-form physical appearance description */
  physicalAppearance?: string;
  /** Avatar image URL */
  avatar?: string;
  /** Reference image URL for consistent generation */
  referenceImage?: string;
  /** Complete CharacterAppearance data */
  characterAppearance?: CharacterAppearanceData;

  // ─────────────────────────────────────────────────────────────────────────
  // BACKGROUND (Step 4)
  // ─────────────────────────────────────────────────────────────────────────
  /** Full backstory text */
  backstory?: string;
  /** Educational background */
  education?: string;
  /** Birthplace */
  birthplace?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // PSYCHOLOGY (Step 5)
  // ─────────────────────────────────────────────────────────────────────────
  /** Psychological needs configuration */
  psychologicalNeeds?: PsychologicalNeeds;
  /** Fears, desires, and coping mechanisms */
  fearsDesires?: FearsDesiresData;

  // ─────────────────────────────────────────────────────────────────────────
  // RELATIONSHIPS (Step 6)
  // ─────────────────────────────────────────────────────────────────────────
  /** Important people in character's life */
  importantPeople?: ImportantPersonData[];
  /** Important events (past and scheduled) */
  importantEvents?: ImportantEventData[];

  // ─────────────────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────────────────
  /** Allow NSFW/adult content */
  nsfwMode?: boolean;
  /** Allow character to develop traumas over time */
  allowDevelopTraumas?: boolean;
  /** Initial behavior type preset */
  initialBehavior?: string;
  /** Generated system prompt */
  systemPrompt?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // SMART START SPECIFIC
  // ─────────────────────────────────────────────────────────────────────────
  /** Description (used by Smart Start) */
  description?: string;
  /** Image URL from search result */
  imageUrl?: string;
  /** Thumbnail URL */
  thumbnailUrl?: string;
  /** Genre ID from Smart Start */
  genreId?: string;
  /** Subgenre ID from Smart Start */
  subgenreId?: string;
  /** Archetype ID from Smart Start */
  archetypeId?: string;
  /** Character source info if based on existing character */
  characterSource?: {
    name: string;
    source: string;
    description: string;
    url?: string;
  };
  /** Tags/categories */
  tags?: string[];
  /** Communication style */
  communicationStyle?: string;
  /** Signature phrases */
  catchphrases?: string[];
  /** Things the character likes */
  likes?: string[];
  /** Things the character dislikes */
  dislikes?: string[];
  /** Skills and abilities */
  skills?: string[];
  /** Character's fears (simple list) */
  fears?: string[];
  /** Fields generated by AI */
  aiGeneratedFields?: string[];
  /** Fields edited by user */
  userEditedFields?: string[];

  // ─────────────────────────────────────────────────────────────────────────
  // METADATA
  // ─────────────────────────────────────────────────────────────────────────
  /** Created via Smart Start flow */
  createdViaSmartStart?: boolean;
  /** Smart Start session ID for tracking */
  smartStartSessionId?: string;
  /** Draft version */
  version?: '2.0';
  /** Creation timestamp */
  createdAt?: Date;
  /** Last modified timestamp */
  lastModified?: Date;

  // ─────────────────────────────────────────────────────────────────────────
  // UI STATE (not persisted)
  // ─────────────────────────────────────────────────────────────────────────
  _uiState?: {
    /** Raw location input before validation */
    locationInput?: string;
    /** Is location being validated */
    isValidatingLocation?: boolean;
    /** Current wizard step */
    currentStep?: string;
    /** Steps that have been completed */
    completedSteps?: string[];
  };
}

// Zod schema for full validation
export const CharacterDraftSchema = z.object({
  // Identity
  name: z.string().min(1).max(100).optional(),
  alternateName: z.string().max(100).optional(),
  age: z.number().int().min(13).max(150).optional(),
  gender: z.enum(['male', 'female', 'non-binary', 'other']).optional(),
  location: LocationDataSchema.optional(),
  occupation: z.string().max(200).optional(),

  // Personality
  personality: z.string().max(5000).optional(),
  purpose: z.string().max(5000).optional(),
  traits: z.array(z.string().max(100)).max(20).optional(),
  personalityCore: PersonalityCoreDataSchema.optional(),

  // Appearance
  physicalAppearance: z.string().max(5000).optional(),
  avatar: z.string().url().optional(),
  referenceImage: z.string().url().optional(),
  characterAppearance: CharacterAppearanceDataSchema.optional(),

  // Background
  backstory: z.string().max(10000).optional(),
  education: z.string().max(1000).optional(),
  birthplace: z.string().max(200).optional(),

  // Psychology
  psychologicalNeeds: PsychologicalNeedsSchema.optional(),
  fearsDesires: FearsDesiresDataSchema.optional(),

  // Relationships
  importantPeople: z.array(ImportantPersonDataSchema).max(50).optional(),
  importantEvents: z.array(ImportantEventDataSchema).max(100).optional(),

  // Configuration
  nsfwMode: z.boolean().default(false),
  allowDevelopTraumas: z.boolean().default(false),
  initialBehavior: z.string().max(100).optional(),
  systemPrompt: z.string().max(20000).optional(),

  // Smart Start specific
  description: z.string().max(5000).optional(),
  imageUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  genreId: z.string().max(100).optional(),
  subgenreId: z.string().max(100).optional(),
  archetypeId: z.string().max(100).optional(),
  characterSource: z.object({
    name: z.string(),
    source: z.string(),
    description: z.string(),
    url: z.string().url().optional(),
  }).optional(),
  tags: z.array(z.string().max(50)).max(30).optional(),
  communicationStyle: z.string().max(500).optional(),
  catchphrases: z.array(z.string().max(200)).max(10).optional(),
  likes: z.array(z.string().max(100)).max(20).optional(),
  dislikes: z.array(z.string().max(100)).max(20).optional(),
  skills: z.array(z.string().max(100)).max(20).optional(),
  fears: z.array(z.string().max(200)).max(10).optional(),
  aiGeneratedFields: z.array(z.string()).optional(),
  userEditedFields: z.array(z.string()).optional(),

  // Metadata
  createdViaSmartStart: z.boolean().optional(),
  smartStartSessionId: z.string().optional(),
  version: z.literal('2.0').optional(),
  createdAt: z.date().optional(),
  lastModified: z.date().optional(),

  // UI state fields (explicitly defined for security)
  _uiState: z.object({
    locationInput: z.string().optional(),
    isValidatingLocation: z.boolean().optional(),
    currentStep: z.string().optional(),
    completedSteps: z.array(z.string()).optional(),
  }).optional(),
}); // Using strict mode - unknown fields will be stripped

// ============================================================================
// GENERATED PROFILE TYPE (Output from AI generation)
// ============================================================================

/**
 * Profile generated by AI during Smart Start.
 * This is the output format from the generation service.
 */
export interface GeneratedProfile {
  // Basic info
  name: string;
  alternateName?: string;
  description?: string;
  gender?: GenderType;
  age?: string | number;
  occupation?: string;

  // Personality text
  personality: string;
  traits: string[];
  backstory?: string;
  physicalAppearance?: string;

  // Structured PersonalityCore
  personalityCore: PersonalityCoreData;

  // Structured CharacterAppearance
  characterAppearance: CharacterAppearanceData;

  // Rich personality data
  interests?: string[];
  values?: string[];
  goals?: string;
  fears?: string;
  quirks?: string[];
  catchphrases?: string[];
  likes?: string[];
  dislikes?: string[];
  skills?: string[];
  communicationStyle?: string;

  // Generated system prompt
  systemPrompt: string;

  // Smart Start metadata
  genreId?: string;
  subgenreId?: string;
  archetypeId?: string;
  imageUrl?: string;
  thumbnailUrl?: string;

  // Suggested relationships (optional)
  suggestedPeople?: ImportantPersonData[];
  suggestedEvents?: ImportantEventData[];

  // Generation metadata
  generatedBy: 'gemini' | 'mistral' | 'openai';
  generationMethod: 'template' | 'ai-generated' | 'hybrid' | 'extracted';
  tokensUsed: {
    input: number;
    output: number;
  };
  generationTime?: number;
  aiGeneratedFields: string[];
  userEditedFields?: string[];
}

export const GeneratedProfileSchema = z.object({
  name: z.string().min(1),
  alternateName: z.string().optional(),
  description: z.string().optional(),
  gender: z.enum(['male', 'female', 'non-binary', 'other']).optional(),
  age: z.union([z.string(), z.number()]).optional(),
  occupation: z.string().optional(),
  personality: z.string().min(1),
  traits: z.array(z.string()),
  backstory: z.string().optional(),
  physicalAppearance: z.string().optional(),
  personalityCore: PersonalityCoreDataSchema,
  characterAppearance: CharacterAppearanceDataSchema,
  interests: z.array(z.string()).optional(),
  values: z.array(z.string()).optional(),
  goals: z.string().optional(),
  fears: z.string().optional(),
  quirks: z.array(z.string()).optional(),
  catchphrases: z.array(z.string()).optional(),
  likes: z.array(z.string()).optional(),
  dislikes: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  communicationStyle: z.string().optional(),
  systemPrompt: z.string(),
  genreId: z.string().optional(),
  subgenreId: z.string().optional(),
  archetypeId: z.string().optional(),
  imageUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  suggestedPeople: z.array(ImportantPersonDataSchema).optional(),
  suggestedEvents: z.array(ImportantEventDataSchema).optional(),
  generatedBy: z.enum(['gemini', 'mistral', 'openai']),
  generationMethod: z.enum(['template', 'ai-generated', 'hybrid', 'extracted']),
  tokensUsed: z.object({
    input: z.number(),
    output: z.number(),
  }),
  generationTime: z.number().optional(),
  aiGeneratedFields: z.array(z.string()),
  userEditedFields: z.array(z.string()).optional(),
});

// ============================================================================
// WIZARD STEP TYPES
// ============================================================================

/** Steps for Smart Start flow */
export type SmartStartStep =
  | 'type'
  | 'search'
  | 'customize'
  | 'depth'
  | 'review'
  | 'genre'; // Optional - accessed from customize when changing genre

/** Steps for Manual Wizard flow */
export type ManualWizardStep =
  | 'basics'
  | 'personality'
  | 'appearance'
  | 'background'
  | 'psychology'
  | 'relationships'
  | 'review';

/** Wizard step configuration */
export interface WizardStepConfig {
  id: ManualWizardStep | SmartStartStep;
  label: string;
  description: string;
  icon: string;
  isOptional?: boolean;
  requiredFields?: string[];
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates a CharacterDraft and returns typed errors.
 */
export function validateCharacterDraft(draft: unknown): {
  valid: boolean;
  data?: CharacterDraft;
  errors?: Record<string, string[]>;
} {
  try {
    const result = CharacterDraftSchema.safeParse(draft);
    if (result.success) {
      return { valid: true, data: result.data as CharacterDraft };
    }

    // Convert Zod errors to simple record
    const errors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(issue.message);
    }

    return { valid: false, errors };
  } catch (error) {
    return {
      valid: false,
      errors: { _root: ['Invalid draft format'] },
    };
  }
}

/**
 * Validates PersonalityCore data.
 */
export function validatePersonalityCore(data: unknown): {
  valid: boolean;
  data?: PersonalityCoreData;
  errors?: Record<string, string[]>;
} {
  const result = PersonalityCoreDataSchema.safeParse(data);
  if (result.success) {
    return { valid: true, data: result.data };
  }

  const errors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }

  return { valid: false, errors };
}

/**
 * Validates CharacterAppearance data.
 */
export function validateCharacterAppearance(data: unknown): {
  valid: boolean;
  data?: CharacterAppearanceData;
  errors?: Record<string, string[]>;
} {
  const result = CharacterAppearanceDataSchema.safeParse(data);
  if (result.success) {
    return { valid: true, data: result.data };
  }

  const errors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }

  return { valid: false, errors };
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isCharacterDraft(value: unknown): value is CharacterDraft {
  return validateCharacterDraft(value).valid;
}

export function hasPersonalityCore(
  draft: CharacterDraft
): draft is CharacterDraft & { personalityCore: PersonalityCoreData } {
  return draft.personalityCore !== undefined;
}

export function hasCharacterAppearance(
  draft: CharacterDraft
): draft is CharacterDraft & { characterAppearance: CharacterAppearanceData } {
  return draft.characterAppearance !== undefined;
}

export function hasImportantPeople(
  draft: CharacterDraft
): draft is CharacterDraft & { importantPeople: ImportantPersonData[] } {
  return Array.isArray(draft.importantPeople) && draft.importantPeople.length > 0;
}

export function hasImportantEvents(
  draft: CharacterDraft
): draft is CharacterDraft & { importantEvents: ImportantEventData[] } {
  return Array.isArray(draft.importantEvents) && draft.importantEvents.length > 0;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_BIG_FIVE: BigFiveTraits = {
  openness: 50,
  conscientiousness: 50,
  extraversion: 50,
  agreeableness: 50,
  neuroticism: 50,
};

export const DEFAULT_BASELINE_EMOTIONS: BaselineEmotions = {
  joy: 0.5,
  curiosity: 0.5,
  anxiety: 0.3,
  affection: 0.5,
  confidence: 0.5,
  melancholy: 0.2,
};

export const DEFAULT_PSYCHOLOGICAL_NEEDS: PsychologicalNeeds = {
  connection: 0.5,
  autonomy: 0.5,
  competence: 0.5,
  novelty: 0.5,
};

export const DEFAULT_PERSONALITY_CORE: PersonalityCoreData = {
  ...DEFAULT_BIG_FIVE,
  coreValues: [
    { value: 'authenticity', weight: 0.7, description: 'Being true to oneself' },
  ],
  moralSchemas: [],
  baselineEmotions: DEFAULT_BASELINE_EMOTIONS,
};

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  CharacterDraft as UnifiedCharacterDraft,
};
