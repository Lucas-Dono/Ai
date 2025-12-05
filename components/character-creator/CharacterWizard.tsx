'use client';

import React from 'react';
import { WizardShell, useWizard } from './WizardShell';
import { BasicsStep } from './steps/BasicsStep';
import { PersonalityStep } from './steps/PersonalityStep';
import { AppearanceStep } from './steps/AppearanceStep';
import { BackgroundStep } from './steps/BackgroundStep';
import { PsychologyStep } from './steps/PsychologyStep';
import { RelationshipsStep } from './steps/RelationshipsStep';
import { ReviewStep } from './steps/ReviewStep';
import type { CharacterDraft } from '@/types/character-wizard';

/**
 * CharacterWizard - Main wizard orchestrator
 *
 * Renders the appropriate step based on wizard state (7 steps):
 * 1. Basics - Name, age, gender, location
 * 2. Personality - Traits, description
 * 3. Appearance - Physical appearance, style
 * 4. Background - Backstory, occupation
 * 5. Psychology - Big Five, values, fears, desires
 * 6. Relationships - Important people and events
 * 7. Review - Final review and creation
 *
 * Wraps everything in WizardShell for context and layout
 */

interface CharacterWizardProps {
  initialData?: Partial<CharacterDraft>;
  onSave?: (draft: CharacterDraft) => Promise<void>;
  onSubmit?: (character: CharacterDraft) => Promise<void>;
}

// Step Renderer Component (must be inside WizardShell to access context)
function WizardStepRenderer() {
  const { currentStep } = useWizard();

  switch (currentStep) {
    case 'basics':
      return <BasicsStep />;
    case 'personality':
      return <PersonalityStep />;
    case 'appearance':
      return <AppearanceStep />;
    case 'background':
      return <BackgroundStep />;
    case 'psychology':
      return <PsychologyStep />;
    case 'relationships':
      return <RelationshipsStep />;
    case 'review':
      return <ReviewStep />;
    default:
      return <BasicsStep />;
  }
}

// Main Wizard Component
export function CharacterWizard({
  initialData,
  onSave,
  onSubmit,
}: CharacterWizardProps) {
  return (
    <WizardShell
      initialData={initialData}
      onSave={onSave}
      onSubmit={onSubmit}
    >
      <WizardStepRenderer />
    </WizardShell>
  );
}
