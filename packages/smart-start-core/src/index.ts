/**
 * @circuitpromptai/smart-start-core
 *
 * Smart Start core functionality shared between web and mobile platforms
 */

// ============================================================================
// TYPES
// ============================================================================

export type * from './types';

// ============================================================================
// CACHE
// ============================================================================

export type { ICache } from './search/ICache';
export { MemoryCache } from './search/ICache';

// ============================================================================
// SEARCH
// ============================================================================

export { SearchRouter } from './search/SearchRouter';
export type { SearchRouterConfig } from './search/SearchRouter';

// Search Sources - Now fully functional and platform-agnostic!
export * from './search/sources';

// ============================================================================
// SERVICES
// ============================================================================

export {
  analyzeBigFive,
  generateCoreValues,
  calculateBaselineEmotions,
  generateMoralSchemas,
  generatePersonalityCore,
} from './services/personality-analysis';

export {
  generateAppearanceAttributes,
  generateImagePrompt,
  generateCharacterAppearance,
} from './services/appearance-generator';

// Will be added later:
// export * from './services/ai-service';
// export * from './services/validation-service';

// ============================================================================
// VALIDATION
// ============================================================================

export * from './validation/schemas';

// ============================================================================
// UTILITIES
// ============================================================================

export { withTimeout } from './utils/withTimeout';

// Will be added later:
// export * from './utils/string-similarity';
// export * from './utils/character-extractor';

// ============================================================================
// CONFIGURATION
// ============================================================================

export {
  DEPTH_LEVELS,
  DEPTH_FEATURES,
  getFeaturesForDepth,
  isFeatureAvailable,
  getDefaultDepthForTier,
  canAccessDepth,
  getAccessibleDepths,
} from './config/depth-levels';

// ============================================================================
// DATA (will be added in Sprint 3.5)
// ============================================================================

// export * from './data/genres';
// export * from './data/popular-characters';
