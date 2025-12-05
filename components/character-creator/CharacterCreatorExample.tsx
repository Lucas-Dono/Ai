'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { WizardShell, useWizard } from './WizardShell';
import { BasicsStep } from './steps/BasicsStep';
import { PersonalityStep } from './steps/PersonalityStep';
import { BackgroundStep } from './steps/BackgroundStep';
import { ReviewStep } from './steps/ReviewStep';
import type { CharacterDraft } from '@/types/character-wizard';

/**
 * CharacterCreatorExample - Complete V2 wizard implementation
 *
 * This is the production-ready character creator using the new V2 wizard system.
 * Features:
 * - 4-step wizard: Basics → Personality → Background → Review
 * - Auto-save to localStorage with 500ms debouncing
 * - AI suggestions for personality, purpose, traits, backstory
 * - Character name availability check
 * - Image upload with drag & drop
 * - Enhanced preview panel
 * - Keyboard shortcuts (⌘/Ctrl + Enter, ⌘/Ctrl + S, etc.)
 *
 * Usage:
 * ```tsx
 * import { CharacterCreatorExample } from '@/components/character-creator';
 *
 * export default function CreateCharacterPage() {
 *   return <CharacterCreatorExample />;
 * }
 * ```
 */

export function CharacterCreatorExample() {
  const router = useRouter();

  const handleSave = async (draft: CharacterDraft) => {
    // Auto-save is handled by useDraftAutosave hook
    // This is for manual save button
    console.log('Manual save:', draft);
  };

  const handleSubmit = async (character: CharacterDraft) => {
    // Submit to API
    const response = await fetch('/api/v2/characters/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(character),
    });

    if (response.ok) {
      const created = await response.json();
      // Redirect to the new character's chat page
      router.push(`/agentes/${created.id}`);
    } else {
      const error = await response.json();
      console.error('Failed to create character:', error);
      alert('Failed to create character. Please try again.');
    }
  };

  return (
    <WizardShell onSave={handleSave} onSubmit={handleSubmit}>
      <StepRouter />
    </WizardShell>
  );
}

/**
 * StepRouter - Routes to the appropriate step component
 * based on the current wizard state
 *
 * Wizard flow: Basics → Personality → Background → Review
 */
function StepRouter() {
  const { currentStep } = useWizard();

  switch (currentStep) {
    case 'basics':
      return <BasicsStep />;

    case 'personality':
      return <PersonalityStep />;

    case 'background':
      return <BackgroundStep />;

    case 'review':
      return <ReviewStep />;

    default:
      return <BasicsStep />;
  }
}
