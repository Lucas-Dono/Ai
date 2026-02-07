'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WizardShell, useWizard } from './WizardShell';
import { BasicsStep } from './steps/BasicsStep';
import { PersonalityStep } from './steps/PersonalityStep';
import { BackgroundStep } from './steps/BackgroundStep';
import { ReviewStep } from './steps/ReviewStep';
import type { CharacterDraft } from '@/types/character-wizard';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
 * - Clone/fork existing agents
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

interface CharacterCreatorExampleProps {
  cloneId?: string | null;
}

export function CharacterCreatorExample({ cloneId }: CharacterCreatorExampleProps) {
  const router = useRouter();
  const [initialData, setInitialData] = useState<Partial<CharacterDraft> | null>(null);
  const [loading, setLoading] = useState(!!cloneId);

  // Load agent data if cloning
  useEffect(() => {
    if (!cloneId) {
      setInitialData({});
      return;
    }

    async function loadAgentData() {
      try {
        const response = await fetch(`/api/agents/${cloneId}`);
        if (!response.ok) {
          throw new Error('Failed to load agent data');
        }

        const agent = await response.json();

        // Map agent data to CharacterDraft format
        const clonedData: Partial<CharacterDraft> = {
          name: `${agent.name} (Copia)`, // Add suffix to indicate it's a clone
          age: agent.age || undefined,
          gender: agent.gender || undefined,
          occupation: agent.occupation || undefined,
          // Note: location requires full LocationData (city, country, timezone, coordinates)
          // Only include if we have complete data from the agent
          ...(agent.locationCity && agent.locationCountry && agent.timezone && {
            location: {
              city: agent.locationCity,
              country: agent.locationCountry,
              timezone: agent.timezone,
              coordinates: agent.coordinates || { lat: 0, lon: 0 },
              verified: false,
            },
          }),
          personality: agent.personality || undefined,
          purpose: agent.purpose || undefined,
          traits: Array.isArray(agent.traits) ? agent.traits : [],
          backstory: agent.backstory || undefined,
          avatar: agent.avatar || undefined,
          // Additional fields
          physicalAppearance: agent.physicalAppearance || undefined,
          education: agent.education || undefined,
          birthplace: agent.birthplace || undefined,
        };

        setInitialData(clonedData);
        toast.success(`Clonando agente: ${agent.name}`);
      } catch (error) {
        console.error('Error loading agent data:', error);
        toast.error('Error al cargar datos del agente');
        setInitialData({});
      } finally {
        setLoading(false);
      }
    }

    loadAgentData();
  }, [cloneId]);

  // Show loading state while fetching clone data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando datos del agente...</p>
        </div>
      </div>
    );
  }

  if (initialData === null) {
    return null;
  }

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
      body: JSON.stringify({
        draft: character,
        cloneFromId: cloneId || undefined, // Include cloneId if cloning
      }),
    });

    if (response.ok) {
      const created = await response.json();
      // Redirect to the new character's chat page
      router.push(`/agentes/${created.agentId || created.id}`);
    } else {
      const error = await response.json();
      console.error('Failed to create character:', error);
      alert('Failed to create character. Please try again.');
    }
  };

  return (
    <WizardShell onSave={handleSave} onSubmit={handleSubmit} initialData={initialData}>
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
