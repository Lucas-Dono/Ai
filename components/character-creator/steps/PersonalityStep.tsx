'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, X, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { StepContainer, StepSection } from '../StepContainer';
import { useWizard } from '../WizardShell';

/**
 * PersonalityStep - Step 2: Character personality
 *
 * Collects (required by backend):
 * - Personality description (min 10, max 2000 chars)
 * - Purpose/role (min 10, max 2000 chars)
 * - Personality traits (array, min 1, max 10)
 *
 * Design: Clean, focused on the key fields
 */

const CONVERSATION_STYLES = [
  {
    value: 'formal',
    label: 'Formal',
    description: 'Professional and structured',
  },
  {
    value: 'casual',
    label: 'Casual',
    description: 'Relaxed and friendly',
  },
  {
    value: 'playful',
    label: 'Playful',
    description: 'Fun and lighthearted',
  },
  {
    value: 'intellectual',
    label: 'Intellectual',
    description: 'Thoughtful and deep',
  },
  {
    value: 'mysterious',
    label: 'Mysterious',
    description: 'Enigmatic and intriguing',
  },
] as const;

const HUMOR_TYPES = [
  { value: 'sarcastic', label: 'Sarcastic', emoji: '😏' },
  { value: 'witty', label: 'Witty', emoji: '🤓' },
  { value: 'wholesome', label: 'Wholesome', emoji: '😊' },
  { value: 'dark', label: 'Dark', emoji: '🖤' },
  { value: 'none', label: 'Serious', emoji: '😐' },
] as const;

const SUGGESTED_TRAITS = [
  'Empathetic',
  'Ambitious',
  'Creative',
  'Analytical',
  'Adventurous',
  'Patient',
  'Curious',
  'Confident',
  'Thoughtful',
  'Spontaneous',
];

export function PersonalityStep() {
  const { characterDraft, updateCharacter } = useWizard();
  const [traitInput, setTraitInput] = useState('');
  const [isGeneratingTraits, setIsGeneratingTraits] = useState(false);
  const [isGeneratingPersonality, setIsGeneratingPersonality] = useState(false);
  const [isGeneratingPurpose, setIsGeneratingPurpose] = useState(false);

  const traits = characterDraft.traits || [];
  const personalityLength = characterDraft.personality?.length || 0;
  const purposeLength = characterDraft.purpose?.length || 0;

  const addTrait = (trait: string) => {
    const trimmedTrait = trait.trim();
    if (trimmedTrait && !traits.includes(trimmedTrait) && traits.length < 10) {
      updateCharacter({ traits: [...traits, trimmedTrait] });
      setTraitInput('');
    }
  };

  const removeTrait = (trait: string) => {
    updateCharacter({ traits: traits.filter((t) => t !== trait) });
  };

  const handleTraitKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTrait(traitInput);
    }
  };

  // AI Suggestion functions
  const generateTraitsSuggestion = async () => {
    setIsGeneratingTraits(true);
    try {
      const response = await fetch('/api/v2/characters/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'traits',
          context: {
            name: characterDraft.name,
            age: characterDraft.age,
            gender: characterDraft.gender,
            location: characterDraft.location?.city,
            occupation: characterDraft.occupation,
          },
        }),
      });

      const data = await response.json();
      if (data.suggestion && Array.isArray(data.suggestion)) {
        // Add suggested traits (avoid duplicates)
        const newTraits = data.suggestion.filter((t: string) => !traits.includes(t)).slice(0, 10 - traits.length);
        updateCharacter({ traits: [...traits, ...newTraits] });
      }
    } catch (error) {
      console.error('Failed to generate traits:', error);
    } finally {
      setIsGeneratingTraits(false);
    }
  };

  const generatePersonalitySuggestion = async () => {
    setIsGeneratingPersonality(true);
    try {
      const response = await fetch('/api/v2/characters/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'personality',
          context: {
            name: characterDraft.name,
            age: characterDraft.age,
            gender: characterDraft.gender,
            location: characterDraft.location?.city,
            occupation: characterDraft.occupation,
            existingText: characterDraft.personality,
          },
        }),
      });

      const data = await response.json();
      if (data.suggestion) {
        updateCharacter({ personality: data.suggestion });
      }
    } catch (error) {
      console.error('Failed to generate personality:', error);
    } finally {
      setIsGeneratingPersonality(false);
    }
  };

  const generatePurposeSuggestion = async () => {
    setIsGeneratingPurpose(true);
    try {
      const response = await fetch('/api/v2/characters/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'purpose',
          context: {
            name: characterDraft.name,
            age: characterDraft.age,
            gender: characterDraft.gender,
            location: characterDraft.location?.city,
            occupation: characterDraft.occupation,
            existingText: characterDraft.purpose,
          },
        }),
      });

      const data = await response.json();
      if (data.suggestion) {
        updateCharacter({ purpose: data.suggestion });
      }
    } catch (error) {
      console.error('Failed to generate purpose:', error);
    } finally {
      setIsGeneratingPurpose(false);
    }
  };

  return (
    <StepContainer
      title="Define their personality"
      description="Describe how your character thinks, feels, and expresses themselves"
    >
      <div className="space-y-8">
        {/* Personality Description */}
        <StepSection
          title="Personality Description"
          description="Describe your character's personality in detail"
        >
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex gap-2">
              <Textarea
                placeholder="e.g., A curious and empathetic person who loves learning about others. Often reserved at first but warms up quickly once trust is established. Has a dry sense of humor and tends to see the best in people..."
                value={characterDraft.personality || ''}
                onChange={(e) => updateCharacter({ personality: e.target.value })}
                className="min-h-[120px] resize-none flex-1"
                maxLength={2000}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={generatePersonalitySuggestion}
                disabled={isGeneratingPersonality}
                className="shrink-0"
              >
                {isGeneratingPersonality ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="flex justify-between text-sm">
              <span className={personalityLength < 10 ? 'text-destructive' : 'text-muted-foreground'}>
                {personalityLength < 10 && 'Minimum 10 characters required'}
              </span>
              <span className="text-muted-foreground">
                {personalityLength} / 2000
              </span>
            </div>
          </motion.div>
        </StepSection>

        {/* Purpose / Role */}
        <StepSection
          title="Purpose & Role"
          description="What is this character's purpose? What role will they play?"
        >
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex gap-2">
              <Textarea
                placeholder="e.g., A supportive friend and confidante who provides emotional support and engaging conversation. Someone to discuss creative ideas with and explore new topics together..."
                value={characterDraft.purpose || ''}
                onChange={(e) => updateCharacter({ purpose: e.target.value })}
                className="min-h-[100px] resize-none flex-1"
                maxLength={2000}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={generatePurposeSuggestion}
                disabled={isGeneratingPurpose}
                className="shrink-0"
              >
                {isGeneratingPurpose ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="flex justify-between text-sm">
              <span className={purposeLength < 10 ? 'text-destructive' : 'text-muted-foreground'}>
                {purposeLength < 10 && 'Minimum 10 characters required'}
              </span>
              <span className="text-muted-foreground">
                {purposeLength} / 2000
              </span>
            </div>
          </motion.div>
        </StepSection>

        {/* Personality Traits */}
        <StepSection
          title="Personality Traits"
          description="Add specific traits (1-10 traits)"
        >
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Trait input */}
            <div className="flex gap-2">
              <Input
                value={traitInput}
                onChange={(e) => setTraitInput(e.target.value)}
                onKeyDown={handleTraitKeyDown}
                placeholder="Add a trait..."
                className="flex-1 h-12"
              />
              <Button
                onClick={() => addTrait(traitInput)}
                disabled={!traitInput.trim()}
                size="lg"
                className="px-6"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={generateTraitsSuggestion}
                disabled={isGeneratingTraits || traits.length >= 10}
                className="px-4"
              >
                {isGeneratingTraits ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Current traits */}
            {traits.length > 0 && (
              <motion.div
                className="flex flex-wrap gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {traits.map((trait, index) => (
                  <motion.div
                    key={trait}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Badge
                      variant="secondary"
                      className="pl-3 pr-1 py-2 text-sm bg-gradient-to-r from-brand-primary-400/10 to-brand-secondary-500/10 border-brand-primary-400/20 hover:border-brand-primary-400/40"
                    >
                      {trait}
                      <button
                        onClick={() => removeTrait(trait)}
                        className="ml-2 p-1 rounded-full hover:bg-destructive/20 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Suggested traits */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Quick add:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TRAITS.filter((t) => !traits.includes(t)).map(
                  (trait) => (
                    <Button
                      key={trait}
                      variant="outline"
                      size="sm"
                      onClick={() => addTrait(trait)}
                      className="text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {trait}
                    </Button>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </StepSection>
      </div>
    </StepContainer>
  );
}
