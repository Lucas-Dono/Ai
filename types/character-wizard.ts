/**
 * Character Creation Wizard - Type Definitions
 *
 * Re-exports and extends types from the unified character-creation module.
 * This file maintains backward compatibility with existing code.
 *
 * @see types/character-creation.ts for core type definitions
 */

// Re-export everything from unified types
export {
  // Core types
  type CharacterDraft,
  type PersonalityCoreData,
  type CharacterAppearanceData,
  type ImportantPersonData,
  type ImportantEventData,
  type LocationData,
  type GeneratedProfile,

  // Sub-types
  type BigFiveTraits,
  type CoreValue,
  type MoralSchema,
  type BaselineEmotions,
  type PsychologicalNeeds,
  type FearsDesiresData,

  // Enums/Unions
  type CharacterStyle,
  type GenderType,
  type EthnicityType,
  type AgeRange,
  type PersonStatus,
  type RelationshipType,
  type ImportanceLevel,
  type EventType,
  type EventPriority,
  type EmotionalTone,
  type ManualWizardStep,
  type SmartStartStep,

  // Schemas
  CharacterDraftSchema,
  PersonalityCoreDataSchema,
  CharacterAppearanceDataSchema,
  ImportantPersonDataSchema,
  ImportantEventDataSchema,
  LocationDataSchema,
  BigFiveTraitsSchema,
  CoreValueSchema,
  MoralSchemaSchema,
  BaselineEmotionsSchema,
  PsychologicalNeedsSchema,
  FearsDesiresDataSchema,
  GeneratedProfileSchema,

  // Validation helpers
  validateCharacterDraft,
  validatePersonalityCore,
  validateCharacterAppearance,

  // Type guards
  isCharacterDraft,
  hasPersonalityCore,
  hasCharacterAppearance,
  hasImportantPeople,
  hasImportantEvents,

  // Default values
  DEFAULT_BIG_FIVE,
  DEFAULT_BASELINE_EMOTIONS,
  DEFAULT_PSYCHOLOGICAL_NEEDS,
  DEFAULT_PERSONALITY_CORE,
} from './character-creation';

// ============================================================================
// WIZARD-SPECIFIC TYPES
// ============================================================================

/** Steps for Manual Wizard flow - extended version */
export type WizardStep =
  | 'basics'
  | 'personality'
  | 'appearance'
  | 'background'
  | 'psychology'
  | 'relationships'
  | 'review';

/** Configuration for each wizard step */
export interface WizardStepConfig {
  id: WizardStep;
  label: string;
  description: string;
  icon: string;
  isOptional?: boolean;
  requiredFields?: string[];
}

/**
 * All wizard steps in order with their configuration.
 */
export const WIZARD_STEPS: WizardStepConfig[] = [
  {
    id: 'basics',
    label: 'Basics',
    description: 'Name, age, gender, and location',
    icon: 'User',
    isOptional: false,
    requiredFields: ['name', 'age', 'gender'],
  },
  {
    id: 'personality',
    label: 'Personality',
    description: 'Personality traits and Big Five',
    icon: 'Heart',
    isOptional: false,
    requiredFields: ['personality', 'traits'],
  },
  {
    id: 'appearance',
    label: 'Appearance',
    description: 'Physical appearance and style',
    icon: 'Eye',
    isOptional: true,
  },
  {
    id: 'background',
    label: 'Background',
    description: 'Backstory, occupation, education',
    icon: 'Book',
    isOptional: true,
  },
  {
    id: 'psychology',
    label: 'Psychology',
    description: 'Emotions, needs, fears and desires',
    icon: 'Brain',
    isOptional: true,
  },
  {
    id: 'relationships',
    label: 'Relationships',
    description: 'Important people and events',
    icon: 'Users',
    isOptional: true,
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Final review and creation',
    icon: 'CheckCircle',
    isOptional: false,
  },
];

/**
 * Get step index (0-based)
 */
export function getStepIndex(step: WizardStep): number {
  return WIZARD_STEPS.findIndex((s) => s.id === step);
}

/**
 * Get step config by ID
 */
export function getStepConfig(step: WizardStep): WizardStepConfig | undefined {
  return WIZARD_STEPS.find((s) => s.id === step);
}

/**
 * Get next step
 */
export function getNextStep(currentStep: WizardStep): WizardStep | null {
  const index = getStepIndex(currentStep);
  if (index === -1 || index >= WIZARD_STEPS.length - 1) {
    return null;
  }
  return WIZARD_STEPS[index + 1].id;
}

/**
 * Get previous step
 */
export function getPreviousStep(currentStep: WizardStep): WizardStep | null {
  const index = getStepIndex(currentStep);
  if (index <= 0) {
    return null;
  }
  return WIZARD_STEPS[index - 1].id;
}

// Import CharacterDraft for local use
import type { CharacterDraft } from './character-creation';

/**
 * Wizard context value for the WizardShell provider.
 * Provides access to wizard state and navigation functions.
 */
export interface WizardContextValue {
  /** Current active step */
  currentStep: WizardStep;
  /** Set of completed step IDs */
  completedSteps: Set<WizardStep>;
  /** Current character draft data */
  characterDraft: CharacterDraft;
  /** Whether preview panel is open */
  isPreviewOpen: boolean;
  /** Whether save operation is in progress */
  isSaving: boolean;
  /** Whether submit operation is in progress */
  isSubmitting?: boolean;
  /** Validation errors by field */
  validationErrors: Record<string, string[]>;

  // Navigation
  /** Navigate to specific step */
  goToStep: (step: WizardStep) => void;
  /** Navigate to next step */
  goToNextStep: () => void;
  /** Navigate to previous step */
  goToPreviousStep: () => void;
  /** Check if can navigate to step */
  canNavigateToStep?: (step: WizardStep) => boolean;

  // Data management
  /** Update character draft with partial data */
  updateCharacter: (updates: Partial<CharacterDraft>) => void;
  /** Reset character draft to initial state */
  resetCharacter?: () => void;
  /** Save draft to localStorage */
  saveDraft: () => Promise<void>;
  /** Submit character to API - returns character ID on success, void on failure */
  submitCharacter: () => Promise<string | void>;
  /** Load draft from localStorage or Smart Start */
  loadDraft?: (draft: Partial<CharacterDraft>) => void;

  // Validation
  /** Validate current step */
  validateCurrentStep: () => boolean;
  /** Validate entire draft */
  validateDraft?: () => boolean;
  /** Clear validation errors */
  clearErrors?: () => void;

  // UI controls
  /** Toggle preview panel */
  togglePreview: () => void;

  // Smart Start integration
  /** Whether this wizard was opened from Smart Start */
  isFromSmartStart?: boolean;
  /** Smart Start session ID if applicable */
  smartStartSessionId?: string;
}

/**
 * Props for step components
 */
export interface StepComponentProps {
  /** Callback when user clicks next/continue */
  onNext: () => void;
  /** Callback when user clicks back */
  onBack: () => void;
  /** Whether step is loading data */
  isLoading?: boolean;
  /** Whether step is disabled */
  disabled?: boolean;
}

// ============================================================================
// VALIDATION UTILITIES FOR WIZARD
// ============================================================================

import { z } from 'zod';

/**
 * Validate a specific wizard step.
 * Returns validation result with errors keyed by field name.
 */
export function validateWizardStep(
  step: WizardStep,
  draft: Partial<CharacterDraft>
): { valid: boolean; errors: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};

  switch (step) {
    case 'basics':
      if (!draft.name || draft.name.length < 1) {
        errors.name = ['Name is required'];
      } else if (draft.name.length > 100) {
        errors.name = ['Name must be 100 characters or less'];
      }

      if (draft.age !== undefined) {
        if (draft.age < 13) {
          errors.age = ['Age must be at least 13'];
        } else if (draft.age > 150) {
          errors.age = ['Age must be 150 or less'];
        }
      }

      if (!draft.gender) {
        errors.gender = ['Gender is required'];
      }
      break;

    case 'personality':
      if (!draft.personality || draft.personality.length < 10) {
        errors.personality = ['Personality description must be at least 10 characters'];
      }

      if (!draft.traits || draft.traits.length < 1) {
        errors.traits = ['At least one trait is required'];
      }
      break;

    case 'appearance':
      // Appearance is optional, but validate if CharacterAppearance is provided
      if (draft.characterAppearance) {
        if (!draft.characterAppearance.gender) {
          errors['characterAppearance.gender'] = ['Gender is required'];
        }
        if (!draft.characterAppearance.style) {
          errors['characterAppearance.style'] = ['Style is required'];
        }
      }
      break;

    case 'background':
      // Background is optional
      if (draft.backstory && draft.backstory.length > 10000) {
        errors.backstory = ['Backstory must be 10,000 characters or less'];
      }
      break;

    case 'psychology':
      // Psychology is optional
      // Validate PersonalityCore Big Five if present
      if (draft.personalityCore) {
        const bigFiveFields = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const;
        for (const field of bigFiveFields) {
          const value = draft.personalityCore[field];
          if (value !== undefined && (value < 0 || value > 100)) {
            errors[`personalityCore.${field}`] = [`${field} must be between 0 and 100`];
          }
        }
      }
      break;

    case 'relationships':
      // Validate important people if present
      if (draft.importantPeople) {
        draft.importantPeople.forEach((person, index) => {
          if (!person.name || person.name.length < 1) {
            errors[`importantPeople.${index}.name`] = ['Name is required'];
          }
          if (!person.relationship) {
            errors[`importantPeople.${index}.relationship`] = ['Relationship is required'];
          }
        });
      }

      // Validate important events if present
      if (draft.importantEvents) {
        draft.importantEvents.forEach((event, index) => {
          if (!event.title || event.title.length < 1) {
            errors[`importantEvents.${index}.title`] = ['Title is required'];
          }
          if (!event.description) {
            errors[`importantEvents.${index}.description`] = ['Description is required'];
          }
        });
      }
      break;

    case 'review':
      // Final validation - check all required fields
      if (!draft.name) {
        errors.name = ['Name is required'];
      }
      if (!draft.personality) {
        errors.personality = ['Personality is required'];
      }
      break;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Get required fields for a step.
 */
export function getRequiredFieldsForStep(step: WizardStep): string[] {
  const config = getStepConfig(step);
  return config?.requiredFields || [];
}

/**
 * Check if a step is complete (all required fields filled).
 */
export function isStepComplete(step: WizardStep, draft: Partial<CharacterDraft>): boolean {
  const { valid } = validateWizardStep(step, draft);
  return valid;
}
