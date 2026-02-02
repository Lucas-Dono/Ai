/**
 * Psychological Analysis System - Public API
 *
 * Exporta todos los tipos, schemas y utilidades del sistema de análisis psicológico.
 *
 * @version 1.0.0
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  // Big Five Facets
  OpennessFacets,
  ConscientiousnessFacets,
  ExtraversionFacets,
  AgreeablenessFacets,
  NeuroticismFacets,
  BigFiveFacets,
  // Dark Triad
  DarkTriad,
  DarkTriadWarningLevel,
  // Attachment
  AttachmentStyle,
  AttachmentProfile,
  // Enriched Profile
  EnrichedPersonalityProfile,
  // Conflict Detection
  ConflictSeverity,
  ConflictWarning,
  ConflictRule,
  // Behavior Prediction
  BehaviorType,
  BehaviorPrediction,
  PredictionRule,
  // Authenticity Scoring
  AuthenticityBreakdown,
  AuthenticityScore,
  // Analysis Result
  PsychologicalAnalysis,
  // Presets
  BigFivePreset,
  DarkTriadPreset,
  AttachmentPreset,
} from './types';

// ============================================================================
// SCHEMA EXPORTS
// ============================================================================

export {
  OpennessFacetsSchema,
  ConscientiousnessFacetsSchema,
  ExtraversionFacetsSchema,
  AgreeablenessFacetsSchema,
  NeuroticismFacetsSchema,
  BigFiveFacetsSchema,
  DarkTriadSchema,
  AttachmentProfileSchema,
  EnrichedPersonalityProfileSchema,
  ConflictWarningSchema,
  BehaviorPredictionSchema,
  AuthenticityScoreSchema,
  PsychologicalAnalysisSchema,
} from './types';

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export {
  getDarkTriadWarningLevel,
  getAuthenticityLevel,
  createDefaultFacets,
  hasEnrichedDimensions,
  hasFacets,
  hasDarkTriad,
  hasAttachment,
  DEFAULT_DARK_TRIAD,
  DEFAULT_ATTACHMENT_PROFILE,
  ATTACHMENT_DESCRIPTIONS,
} from './types';
