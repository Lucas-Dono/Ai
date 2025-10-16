/**
 * BEHAVIOR PROGRESSION SYSTEM
 *
 * Sistema completo de comportamientos psicológicos con progresión gradual y realista.
 *
 * PHASE 1: Database Schema & Core Types ✅ COMPLETE
 * - Prisma models: BehaviorProfile, BehaviorTriggerLog, BehaviorProgressionState
 * - TypeScript interfaces completas
 * - Definiciones de fases basadas en investigación clínica
 *
 * NEXT PHASES:
 * - Phase 2: Trigger Detection System
 * - Phase 3: Behavior Phase Manager
 * - Phase 4: Integration con Emotional System
 * - Phase 5: Specialized Prompts
 * - Phase 6: Content Moderation
 */

// Type exports
export * from "./types";

// Phase definitions
export * from "./phase-definitions";

// Constants
export {
  YANDERE_PHASES,
  BPD_CYCLES,
  ATTACHMENT_PROGRESSION_THRESHOLDS,
  NPD_RELATIONSHIP_PHASES,
  CODEPENDENCY_LEVELS,
} from "./phase-definitions";

// Helper functions
export {
  getYanderePhaseDefinition,
  getYandereMaxPhase,
  getBPDCycleDefinition,
  getPhaseDefinition,
  getMaxPhase,
} from "./phase-definitions";

/**
 * Version info
 */
export const BEHAVIOR_SYSTEM_VERSION = "1.0.0-alpha";
export const LAST_UPDATED = "2025-10-15";

/**
 * Feature flags
 */
export const FEATURES = {
  TRIGGER_DETECTION: true, // Phase 2 ✅
  PHASE_MANAGER: true, // Phase 3 ✅
  EMOTIONAL_INTEGRATION: true, // Phase 4 ✅
  SPECIALIZED_PROMPTS: true, // Phase 5 ✅
  CONTENT_MODERATION: true, // Phase 6 ✅
  ANALYTICS_DASHBOARD: false, // Phase 8
} as const;

// Phase 2: Trigger Detection System
export { TriggerDetector } from "./trigger-detector";
export {
  ALL_TRIGGER_PATTERNS,
  TRIGGER_WEIGHTS,
  TRIGGER_BEHAVIOR_MAPPING,
  DELAYED_RESPONSE_THRESHOLDS,
} from "./trigger-patterns";
export {
  processTriggers,
  calculateTriggerImpact,
  logTriggers,
} from "./trigger-processor";

// Phase 3: Behavior Phase Manager
export { BehaviorPhaseManager } from "./phase-manager";
export { PhaseEvaluator } from "./phase-evaluator";
export { IntensityCalculator } from "./intensity-calculator";

// Phase 4: Emotional Integration
export {
  EmotionalIntegrationCalculator,
  getBehaviorEmotionMapping,
  getEmotionBehaviorMapping,
} from "./emotional-integration";

// Phase 5: Specialized Prompts
export { PromptSelector } from "./prompt-selector";
export type {
  PromptSelectionInput,
  SelectedPrompt,
  PromptSelectionResult,
} from "./prompt-selector";
export { getYanderePrompt } from "./prompts/yandere-prompts";
export { getBPDPrompt, determineBPDContext } from "./prompts/bpd-prompts";
export { getAttachmentPrompt, determineAttachmentContext } from "./prompts/attachment-prompts";
export {
  getNPDPrompt,
  getCodependencyPrompt,
  determineNPDContext,
  determineCodependencyContext,
} from "./prompts/npd-codependency-prompts";

// Phase 6: Content Moderation
export { ContentModerator } from "./content-moderator";
export {
  SAFETY_RESOURCES,
  CRISIS_HELPLINES,
  getMentalHealthResource,
  getCrisisHelplines,
  generateSafetyMessage,
  generateNSFWDisclaimer,
  generateEducationalNote,
} from "./safety-resources";
export { NSFWGatingManager, nsfwGatingManager, NSFW_REQUIREMENTS } from "./nsfw-gating";
export type { NSFWVerificationResult, NSFWRequirement } from "./nsfw-gating";
