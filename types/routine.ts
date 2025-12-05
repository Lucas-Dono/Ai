/**
 * Type definitions for Character Routine System (Premium Feature)
 *
 * This module provides comprehensive type safety for the dynamic routine system
 * that allows characters to have realistic daily schedules with personality-driven variations.
 */

// ============================================
// CORE ROUTINE TYPES
// ============================================

/**
 * Realism levels determine how routines impact character interactions
 */
export type RealismLevel = 'subtle' | 'moderate' | 'immersive';

/**
 * Activity types categorize different routine events
 */
export type ActivityType =
  | 'sleep'     // Sleeping/resting
  | 'work'      // Professional work
  | 'meal'      // Breakfast, lunch, dinner
  | 'exercise'  // Physical activity, gym
  | 'social'    // Meeting friends, social events
  | 'personal'  // Personal care, grooming
  | 'hobby'     // Hobbies, entertainment
  | 'commute'   // Travel, transportation
  | 'other';    // Other activities

/**
 * Priority levels affect how flexible an event is
 */
export type EventPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Instance status tracks the state of a routine event
 */
export type InstanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'skipped';

/**
 * Days of the week (0 = Sunday, 6 = Saturday)
 */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// ============================================
// VARIATION PARAMETERS
// ============================================

/**
 * Parameters that control how variations are generated for a routine event
 */
export interface VariationParameters {
  /** How many minutes the arrival time can vary (±) */
  arrivalTimeVariance?: number;

  /** How many minutes the duration can vary (±) */
  durationVariance?: number;

  /** Probability (0-1) of skipping this event entirely */
  skipProbability?: number;

  /** Probability (0-1) of arriving late */
  lateProbability?: number;

  /** Probability (0-1) of leaving early */
  earlyLeaveProbability?: number;

  /** Big Five personality traits that influence this event */
  personalityFactors?: Array<'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>;

  /** Custom factors specific to this event type */
  customFactors?: Record<string, number>;
}

/**
 * Applied variations describe what actually happened vs. what was planned
 */
export interface AppliedVariations {
  /** Did the character arrive late? */
  arrivedLate?: boolean;

  /** How many minutes late (positive) or early (negative) */
  lateMinutes?: number;

  /** Reason for the variation (AI-generated) */
  reason?: string;

  /** Did the character leave early? */
  leftEarly?: boolean;

  /** How many minutes early */
  earlyMinutes?: number;

  /** Mood during the event */
  moodDuringEvent?: string;

  /** How personality traits influenced the outcome */
  personalityInfluence?: Record<string, string>;

  /** Any unexpected events that occurred */
  unexpectedEvents?: string[];

  /** Quality of execution (0-1, e.g., how well they performed at work) */
  executionQuality?: number;
}

// ============================================
// MOOD IMPACT
// ============================================

/**
 * How an event impacts the character's internal state
 */
export interface MoodImpact {
  /** Energy change (-100 to +100) */
  energy?: number;

  /** Stress change (-100 to +100) */
  stress?: number;

  /** Satisfaction/happiness change (-100 to +100) */
  satisfaction?: number;

  /** Arousal change (PAD model, -1 to +1) */
  arousal?: number;

  /** Valence change (PAD model, -1 to +1) */
  valence?: number;

  /** Dominance change (PAD model, -1 to +1) */
  dominance?: number;

  /** Specific emotion intensities affected */
  emotions?: {
    joy?: number;
    anxiety?: number;
    excitement?: number;
    frustration?: number;
    contentment?: number;
    boredom?: number;
  };
}

// ============================================
// CURRENT ACTIVITY STATE
// ============================================

/**
 * Current activity information for real-time context
 */
export interface CurrentActivity {
  /** ID of the routine instance */
  instanceId: string;

  /** Name of the activity */
  name: string;

  /** Type of activity */
  type: ActivityType;

  /** When it started */
  startedAt: string; // ISO 8601

  /** Expected end time */
  expectedEnd: string; // ISO 8601

  /** Current status */
  status: InstanceStatus;

  /** Can the character respond to messages? */
  canRespond: boolean;

  /** If can respond, what style should be used? */
  responseStyle?: ResponseStyle;

  /** Current mood state during activity */
  currentMood?: {
    valence: number;
    arousal: number;
    dominance: number;
  };

  /** Location where activity is happening */
  location?: string;

  /** Additional contextual notes */
  notes?: string;
}

/**
 * Next activity preview
 */
export interface NextActivity {
  /** ID of the routine instance */
  instanceId: string;

  /** Name of the activity */
  name: string;

  /** Type of activity */
  type: ActivityType;

  /** Scheduled start time */
  scheduledStart: string; // ISO 8601

  /** Expected duration in minutes */
  durationMinutes?: number;
}

// ============================================
// RESPONSE STYLE MODIFIERS
// ============================================

/**
 * How the character's response style should be modified based on current activity
 */
export type ResponseStyle =
  | 'normal'                    // Default, no modification
  | 'brief_professional'        // At work, keeps it professional and brief
  | 'brief_casual'              // Busy but can chat casually
  | 'delayed'                   // Will respond but with delay
  | 'drowsy'                    // Just woke up or about to sleep
  | 'energetic'                 // After exercise, very energetic
  | 'relaxed'                   // During leisure time, very relaxed
  | 'distracted'                // During commute or while multitasking
  | 'unavailable';              // Cannot respond (immersive mode only)

/**
 * Detailed response modification rules
 */
export interface ResponseModification {
  /** Style to apply */
  style: ResponseStyle;

  /** How long responses should be (0-1, where 1 is normal length) */
  lengthMultiplier?: number;

  /** Simulated delay in seconds before responding */
  delaySeconds?: number;

  /** Additional context to inject into system prompt */
  contextPrompt?: string;

  /** Whether to show typing indicators */
  showTyping?: boolean;

  /** Whether character can initiate conversations */
  canInitiate?: boolean;
}

// ============================================
// ROUTINE GENERATION
// ============================================

/**
 * Input for AI-powered routine generation
 */
export interface RoutineGenerationInput {
  /** Agent ID */
  agentId: string;

  /** Character's occupation (from profile) */
  occupation?: string;

  /** Character's personality traits */
  personalityTraits?: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };

  /** Character's backstory summary */
  backstory?: string;

  /** Character's hobbies and interests */
  hobbies?: string[];

  /** Character's timezone */
  timezone: string;

  /** Desired realism level */
  realismLevel?: RealismLevel;

  /** Custom prompt additions */
  customPrompt?: string;

  /** Existing routine to modify (for regeneration) */
  existingRoutineId?: string;
}

/**
 * Output from routine generation
 */
export interface GeneratedRoutine {
  /** Timezone for this routine */
  timezone: string;

  /** Generated routine templates */
  templates: GeneratedTemplate[];

  /** Generation metadata */
  metadata: {
    /** Prompt used for generation */
    generationPrompt: string;

    /** Timestamp */
    generatedAt: string;

    /** Model used */
    model?: string;

    /** Reasoning/explanation */
    reasoning?: string;
  };
}

/**
 * A generated routine template
 */
export interface GeneratedTemplate {
  /** Template name */
  name: string;

  /** Description */
  description?: string;

  /** Activity type */
  type: ActivityType;

  /** Start time (HH:MM format) */
  startTime: string;

  /** End time (HH:MM format) */
  endTime: string;

  /** Days of week */
  daysOfWeek: DayOfWeek[];

  /** Priority */
  priority: EventPriority;

  /** Is flexible? */
  isFlexible: boolean;

  /** Variation parameters */
  variationParameters?: VariationParameters;

  /** Mood impact */
  moodImpact?: MoodImpact;

  /** Location */
  location?: string;
}

// ============================================
// SIMULATION ENGINE
// ============================================

/**
 * Input for simulating a routine instance
 */
export interface SimulationInput {
  /** Template to simulate from */
  templateId: string;

  /** Date to simulate for */
  date: Date;

  /** Character's personality core */
  personalityCore: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };

  /** Current internal state */
  internalState?: {
    moodValence: number;
    moodArousal: number;
    moodDominance: number;
    needConnection: number;
    needAutonomy: number;
    needCompetence: number;
    needNovelty: number;
  };

  /** Variation intensity (0-1) */
  variationIntensity: number;

  /** Random seed for deterministic simulation */
  seed?: number;
}

/**
 * Output from simulation
 */
export interface SimulationOutput {
  /** Instance ID */
  instanceId: string;

  /** Scheduled times */
  scheduledStart: Date;
  scheduledEnd: Date;

  /** Actual times (with variations) */
  actualStart: Date;
  actualEnd: Date;

  /** Applied variations */
  variations: AppliedVariations;

  /** Mood impact */
  moodImpact: MoodImpact;

  /** Generated notes/narrative */
  notes: string;

  /** Status */
  status: InstanceStatus;
}

// ============================================
// CONTEXT GENERATION
// ============================================

/**
 * Context information to inject into system prompts
 */
export interface RoutineContext {
  /** Current activity (if any) */
  currentActivity?: CurrentActivity;

  /** Next activity (if any) */
  nextActivity?: NextActivity;

  /** Response modification rules */
  responseModification?: ResponseModification;

  /** Full context string ready for prompt injection */
  promptContext: string;

  /** Metadata */
  generatedAt: Date;
  timezone: string;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

/**
 * Request to create a new routine
 */
export interface CreateRoutineRequest {
  agentId: string;
  timezone?: string;
  realismLevel?: RealismLevel;
  autoGenerateVariations?: boolean;
  variationIntensity?: number;

  /** If true, AI generates templates automatically */
  autoGenerate?: boolean;

  /** Custom generation parameters */
  generationInput?: Partial<RoutineGenerationInput>;
}

/**
 * Request to update a routine
 */
export interface UpdateRoutineRequest {
  timezone?: string;
  enabled?: boolean;
  realismLevel?: RealismLevel;
  autoGenerateVariations?: boolean;
  variationIntensity?: number;
}

/**
 * Request to create a template
 */
export interface CreateTemplateRequest {
  routineId: string;
  name: string;
  description?: string;
  type: ActivityType;
  startTime: string;
  endTime: string;
  daysOfWeek: DayOfWeek[];
  priority?: EventPriority;
  isFlexible?: boolean;
  allowVariations?: boolean;
  variationParameters?: VariationParameters;
  moodImpact?: MoodImpact;
  location?: string;
}

/**
 * Request to update a template
 */
export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  type?: ActivityType;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: DayOfWeek[];
  priority?: EventPriority;
  isFlexible?: boolean;
  allowVariations?: boolean;
  variationParameters?: VariationParameters;
  moodImpact?: MoodImpact;
  location?: string;
}

/**
 * Request to regenerate routine with AI
 */
export interface RegenerateRoutineRequest {
  routineId: string;
  customPrompt?: string;
  preserveManualEdits?: boolean;
}

/**
 * Response with routine and current state
 */
export interface RoutineWithStateResponse {
  routine: any; // Full CharacterRoutine from Prisma
  templates: any[]; // RoutineTemplate[]
  currentState?: RoutineContext;
  stats?: {
    totalEvents: number;
    completedToday: number;
    upcomingToday: number;
    currentActivity?: string;
    nextActivity?: string;
  };
}

// ============================================
// ANALYTICS & STATISTICS
// ============================================

/**
 * Statistics about a character's routine adherence
 */
export interface RoutineStatistics {
  /** Time period */
  period: {
    start: Date;
    end: Date;
  };

  /** Total events scheduled */
  totalScheduled: number;

  /** Events completed */
  completed: number;

  /** Events skipped */
  skipped: number;

  /** Events cancelled */
  cancelled: number;

  /** Average lateness in minutes */
  averageLateness: number;

  /** Punctuality score (0-100) */
  punctualityScore: number;

  /** Most common variation reasons */
  topVariationReasons: Array<{
    reason: string;
    count: number;
  }>;

  /** Activity breakdown */
  activityBreakdown: Record<ActivityType, {
    count: number;
    totalMinutes: number;
    averageDuration: number;
  }>;

  /** Personality influence analysis */
  personalityInfluence: {
    conscientiousness: {
      punctualityCorrelation: number; // -1 to 1
      skipRateCorrelation: number;
    };
    neuroticism: {
      stressRelatedVariations: number;
    };
    extraversion: {
      socialEventAdherence: number;
    };
  };
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validates time format (HH:MM)
 */
export function isValidTimeFormat(time: string): boolean {
  return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}

/**
 * Validates day of week
 */
export function isValidDayOfWeek(day: number): day is DayOfWeek {
  return Number.isInteger(day) && day >= 0 && day <= 6;
}

/**
 * Validates realism level
 */
export function isValidRealismLevel(level: string): level is RealismLevel {
  return ['subtle', 'moderate', 'immersive'].includes(level);
}

/**
 * Validates activity type
 */
export function isValidActivityType(type: string): type is ActivityType {
  return ['sleep', 'work', 'meal', 'exercise', 'social', 'personal', 'hobby', 'commute', 'other'].includes(type);
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Partial routine template for editing
 */
export type PartialTemplate = Partial<GeneratedTemplate> & {
  id?: string;
};

/**
 * Routine with all relations loaded
 */
export interface FullRoutine {
  routine: any; // CharacterRoutine
  templates: any[]; // RoutineTemplate[]
  instances: any[]; // RoutineInstance[]
  state: any; // RoutineSimulationState
  agent: {
    id: string;
    name: string;
    personalityCore?: any;
    internalState?: any;
  };
}

/**
 * Configuration for routine system
 */
export interface RoutineSystemConfig {
  /** Enable routine system globally */
  enabled: boolean;

  /** Default realism level for new routines */
  defaultRealismLevel: RealismLevel;

  /** Default variation intensity */
  defaultVariationIntensity: number;

  /** How far in advance to simulate instances (days) */
  simulationHorizonDays: number;

  /** How often to update simulation state (minutes) */
  stateUpdateIntervalMinutes: number;

  /** Model to use for generation */
  generationModel: string;

  /** Model to use for variation simulation */
  simulationModel: string;

  /** Whether to require premium plan */
  requirePremium: boolean;

  /** Premium plans that have access */
  allowedPlans: string[];
}
