/**
 * Depth Level Configuration
 *
 * Defines available depth levels and features for character generation.
 * This controls the complexity and realism of generated characters.
 */

import { DepthLevel, DepthFeature, DepthLevelId } from '../types';

// ============================================================================
// FEATURES CATALOG
// ============================================================================

/**
 * All available features that can be enabled based on depth level
 */
export const DEPTH_FEATURES: Record<string, DepthFeature> = {
  // Basic features (available in all tiers)
  'personality-core': {
    id: 'personality-core',
    name: 'Personalidad (Big Five)',
    description: 'Rasgos de personalidad fundamentales basados en el modelo Big Five',
    icon: '🧠',
    availableIn: ['basic', 'realistic', 'ultra'],
  },
  'physical-description': {
    id: 'physical-description',
    name: 'Descripción física',
    description: 'Apariencia física básica del personaje',
    icon: '👤',
    availableIn: ['basic', 'realistic', 'ultra'],
  },
  'basic-dialogs': {
    id: 'basic-dialogs',
    name: '3-5 Diálogos de ejemplo',
    description: 'Ejemplos de cómo habla el personaje',
    icon: '💬',
    availableIn: ['basic', 'realistic', 'ultra'],
  },

  // Realistic features (Plus tier)
  'emotional-tree': {
    id: 'emotional-tree',
    name: 'Árbol emocional avanzado',
    description: 'Sistema de emociones complejas y transiciones emocionales',
    icon: '🌳',
    availableIn: ['realistic', 'ultra'],
  },
  'past-life': {
    id: 'past-life',
    name: 'Vida pasada detallada',
    description: 'Historia de vida con eventos importantes y relaciones',
    icon: '📖',
    availableIn: ['realistic', 'ultra'],
  },
  'extended-dialogs': {
    id: 'extended-dialogs',
    name: '7-10 Diálogos de ejemplo',
    description: 'Mayor variedad de ejemplos conversacionales',
    icon: '💬',
    availableIn: ['realistic', 'ultra'],
  },
  'core-values': {
    id: 'core-values',
    name: 'Valores fundamentales',
    description: 'Sistema de valores y moral que guía sus decisiones',
    icon: '⚖️',
    availableIn: ['realistic', 'ultra'],
  },

  // Ultra features (Ultra tier only)
  'daily-routines': {
    id: 'daily-routines',
    name: 'Rutinas diarias',
    description: 'Vida fuera del chat: qué hace en diferentes momentos del día',
    icon: '📅',
    availableIn: ['ultra'],
  },
  'internal-conflicts': {
    id: 'internal-conflicts',
    name: 'Conflictos internos profundos',
    description: 'Luchas psicológicas, contradicciones y dilemas personales',
    icon: '⚔️',
    availableIn: ['ultra'],
  },
  'traumas-pivotal': {
    id: 'traumas-pivotal',
    name: 'Traumas y momentos pivotales',
    description: 'Eventos transformadores que moldearon su personalidad',
    icon: '💔',
    availableIn: ['ultra'],
  },
  'temporal-patterns': {
    id: 'temporal-patterns',
    name: 'Patrones temporales',
    description: 'Variación de comportamiento según hora del día, día de la semana, etc.',
    icon: '🕐',
    availableIn: ['ultra'],
  },
  'relationship-dynamics': {
    id: 'relationship-dynamics',
    name: 'Dinámicas relacionales complejas',
    description: 'Cómo se relaciona con diferentes tipos de personas y situaciones',
    icon: '🤝',
    availableIn: ['ultra'],
  },
};

// ============================================================================
// DEPTH LEVEL DEFINITIONS
// ============================================================================

/**
 * Available depth levels for character generation
 */
export const DEPTH_LEVELS: Record<DepthLevelId, DepthLevel> = {
  basic: {
    id: 'basic',
    name: 'Básico',
    description: 'Chat casual y directo. Ideal para conversaciones simples y rápidas.',
    icon: '✓',
    color: '#10b981', // green
    requiredTier: 'free',
    badge: undefined, // No badge for free tier
    features: [
      'personality-core',
      'physical-description',
      'basic-dialogs',
    ],
    targetTokens: 3000,
    estimatedTime: 15,
    promptComplexity: 'simple',
  },

  realistic: {
    id: 'realistic',
    name: 'Realista',
    description: 'Personaje con profundidad emocional e historia. Para conversaciones significativas.',
    icon: '🌟',
    color: '#8b5cf6', // purple
    requiredTier: 'plus',
    badge: 'Plus',
    features: [
      'personality-core',
      'physical-description',
      'basic-dialogs',
      'emotional-tree',
      'past-life',
      'extended-dialogs',
      'core-values',
    ],
    targetTokens: 5000,
    estimatedTime: 30,
    promptComplexity: 'moderate',
  },

  ultra: {
    id: 'ultra',
    name: 'Ultra-Realista',
    description: 'Personaje completamente vivo con vida propia. La experiencia más inmersiva.',
    icon: '⚡',
    color: '#f59e0b', // amber
    requiredTier: 'ultra',
    badge: 'Ultra',
    features: [
      'personality-core',
      'physical-description',
      'basic-dialogs',
      'emotional-tree',
      'past-life',
      'extended-dialogs',
      'core-values',
      'daily-routines',
      'internal-conflicts',
      'traumas-pivotal',
      'temporal-patterns',
      'relationship-dynamics',
    ],
    targetTokens: 8000,
    estimatedTime: 45,
    promptComplexity: 'complex',
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all features for a specific depth level
 */
export function getFeaturesForDepth(depthId: DepthLevelId): DepthFeature[] {
  const level = DEPTH_LEVELS[depthId];
  return level.features.map(featureId => DEPTH_FEATURES[featureId]);
}

/**
 * Check if a feature is available at a given depth level
 */
export function isFeatureAvailable(featureId: string, depthId: DepthLevelId): boolean {
  const feature = DEPTH_FEATURES[featureId];
  return feature?.availableIn.includes(depthId) || false;
}

/**
 * Get the default depth level for a user tier
 */
export function getDefaultDepthForTier(tier: 'free' | 'plus' | 'ultra'): DepthLevelId {
  switch (tier) {
    case 'ultra':
      return 'ultra';
    case 'plus':
      return 'realistic';
    case 'free':
    default:
      return 'basic';
  }
}

/**
 * Check if a user can access a depth level based on their tier
 */
export function canAccessDepth(userTier: 'free' | 'plus' | 'ultra', depthId: DepthLevelId): boolean {
  const level = DEPTH_LEVELS[depthId];

  const tierOrder = { free: 0, plus: 1, ultra: 2 };
  return tierOrder[userTier] >= tierOrder[level.requiredTier];
}

/**
 * Get all depth levels accessible to a user tier
 */
export function getAccessibleDepths(userTier: 'free' | 'plus' | 'ultra'): DepthLevel[] {
  return Object.values(DEPTH_LEVELS).filter(level =>
    canAccessDepth(userTier, level.id)
  );
}
