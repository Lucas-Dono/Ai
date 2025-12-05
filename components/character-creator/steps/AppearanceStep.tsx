'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Palette, Shirt, Sparkles, RefreshCw, Upload, ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StepContainer } from '../StepContainer';
import { useWizard } from '../WizardShell';
import type {
  CharacterStyle,
  GenderType,
  AgeRange,
  CharacterAppearanceData,
} from '@/types/character-creation';

/**
 * AppearanceStep - Step 3: Physical appearance
 *
 * Collects:
 * - Visual style (realistic, semi-realistic, anime)
 * - Ethnicity
 * - Hair (color, style)
 * - Eye color
 * - Clothing/outfit description
 * - Optional: Reference image upload
 * - AI-generated base prompt for image generation
 */

const STYLE_OPTIONS: { value: CharacterStyle; label: string }[] = [
  { value: 'realistic', label: 'Realistic' },
  { value: 'semi-realistic', label: 'Semi-Realistic' },
  { value: 'anime', label: 'Anime' },
];

const HAIR_COLORS = [
  { value: 'black', label: 'Black' },
  { value: 'brown', label: 'Brown' },
  { value: 'blonde', label: 'Blonde' },
  { value: 'red', label: 'Red' },
  { value: 'auburn', label: 'Auburn' },
  { value: 'gray', label: 'Gray' },
  { value: 'white', label: 'White' },
  { value: 'other', label: 'Other / Custom' },
];

const EYE_COLORS = [
  { value: 'brown', label: 'Brown' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'hazel', label: 'Hazel' },
  { value: 'gray', label: 'Gray' },
  { value: 'amber', label: 'Amber' },
  { value: 'other', label: 'Other / Custom' },
];

const ETHNICITY_OPTIONS = [
  { value: 'caucasian', label: 'Caucasian' },
  { value: 'asian', label: 'Asian' },
  { value: 'hispanic', label: 'Hispanic' },
  { value: 'african', label: 'African' },
  { value: 'middle-eastern', label: 'Middle Eastern' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'other', label: 'Other' },
];

export function AppearanceStep() {
  const { characterDraft, updateCharacter } = useWizard();
  const [isGenerating, setIsGenerating] = useState(false);
  const [customHairColor, setCustomHairColor] = useState('');
  const [customEyeColor, setCustomEyeColor] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Get current appearance data or defaults
  const appearance = characterDraft.characterAppearance || {
    gender: characterDraft.gender as GenderType || 'other',
    age: String(characterDraft.age || '23-27') as AgeRange,
    style: 'realistic' as CharacterStyle,
    basePrompt: '',
  };

  // Update appearance helper
  const updateAppearance = useCallback(
    (updates: Partial<CharacterAppearanceData>) => {
      updateCharacter({
        characterAppearance: {
          ...appearance,
          ...updates,
          gender: updates.gender || appearance.gender || (characterDraft.gender as GenderType) || 'other',
          age: updates.age || appearance.age || String(characterDraft.age || '23-27'),
          style: updates.style || appearance.style || 'realistic',
          basePrompt: updates.basePrompt || appearance.basePrompt || '',
        },
      });
    },
    [appearance, characterDraft.gender, characterDraft.age, updateCharacter]
  );

  // Generate appearance from AI
  const handleGenerateAppearance = useCallback(async () => {
    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/smart-start/generate-appearance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: characterDraft.name,
          age: characterDraft.age,
          gender: characterDraft.gender,
          personality: characterDraft.personality,
          occupation: characterDraft.occupation,
          ethnicity: appearance.ethnicity,
          style: appearance.style,
        }),
        signal,
      });

      if (response.ok) {
        const data = await response.json();
        updateAppearance({
          hairColor: data.hairColor,
          hairStyle: data.hairStyle,
          eyeColor: data.eyeColor,
          clothing: data.clothing,
        });
      }
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Failed to generate appearance:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [characterDraft, appearance.ethnicity, appearance.style, updateAppearance]);

  // Handle hair color selection (with custom option)
  const handleHairColorChange = (value: string) => {
    if (value === 'other') {
      // Show custom input
      setCustomHairColor(appearance.hairColor || '');
    } else {
      updateAppearance({ hairColor: value });
    }
  };

  // Handle eye color selection (with custom option)
  const handleEyeColorChange = (value: string) => {
    if (value === 'other') {
      setCustomEyeColor(appearance.eyeColor || '');
    } else {
      updateAppearance({ eyeColor: value });
    }
  };

  return (
    <StepContainer
      title="Physical Appearance"
      description="Define how your character looks. You can let AI generate suggestions or customize manually."
    >
      {/* AI Generation Button */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-6">
        <div>
          <p className="font-medium">AI Appearance Generator</p>
          <p className="text-sm text-muted-foreground">
            Generate appearance based on personality and context
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleGenerateAppearance}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </>
          )}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Visual Style */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <Label htmlFor="style" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Visual Style
          </Label>
          <Select
            value={appearance.style}
            onValueChange={(value) => updateAppearance({ style: value as CharacterStyle })}
          >
            <SelectTrigger id="style">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              {STYLE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            This affects how images will be generated for your character
          </p>
        </motion.div>

        {/* Ethnicity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-2"
        >
          <Label htmlFor="ethnicity">Ethnicity</Label>
          <Select
            value={appearance.ethnicity || ''}
            onValueChange={(value) => updateAppearance({ ethnicity: value })}
          >
            <SelectTrigger id="ethnicity">
              <SelectValue placeholder="Select ethnicity (optional)" />
            </SelectTrigger>
            <SelectContent>
              {ETHNICITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Hair Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hair Color */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor="hairColor">Hair Color</Label>
            <Select
              value={HAIR_COLORS.find((c) => c.value === appearance.hairColor)?.value || 'other'}
              onValueChange={handleHairColorChange}
            >
              <SelectTrigger id="hairColor">
                <SelectValue placeholder="Select hair color" />
              </SelectTrigger>
              <SelectContent>
                {HAIR_COLORS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(customHairColor !== '' || !HAIR_COLORS.find((c) => c.value === appearance.hairColor)) && (
              <Input
                placeholder="Custom hair color..."
                value={customHairColor || appearance.hairColor || ''}
                onChange={(e) => {
                  setCustomHairColor(e.target.value);
                  updateAppearance({ hairColor: e.target.value });
                }}
                className="mt-2"
              />
            )}
          </motion.div>

          {/* Eye Color */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-2"
          >
            <Label htmlFor="eyeColor">Eye Color</Label>
            <Select
              value={EYE_COLORS.find((c) => c.value === appearance.eyeColor)?.value || 'other'}
              onValueChange={handleEyeColorChange}
            >
              <SelectTrigger id="eyeColor">
                <SelectValue placeholder="Select eye color" />
              </SelectTrigger>
              <SelectContent>
                {EYE_COLORS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(customEyeColor !== '' || !EYE_COLORS.find((c) => c.value === appearance.eyeColor)) && (
              <Input
                placeholder="Custom eye color..."
                value={customEyeColor || appearance.eyeColor || ''}
                onChange={(e) => {
                  setCustomEyeColor(e.target.value);
                  updateAppearance({ eyeColor: e.target.value });
                }}
                className="mt-2"
              />
            )}
          </motion.div>
        </div>

        {/* Hair Style */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label htmlFor="hairStyle">Hair Style</Label>
          <Input
            id="hairStyle"
            value={appearance.hairStyle || ''}
            onChange={(e) => updateAppearance({ hairStyle: e.target.value })}
            placeholder="e.g., long and wavy, short pixie cut, messy bun..."
          />
        </motion.div>

        {/* Clothing */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-2"
        >
          <Label htmlFor="clothing" className="flex items-center gap-2">
            <Shirt className="w-4 h-4" />
            Typical Clothing / Style
          </Label>
          <Textarea
            id="clothing"
            value={appearance.clothing || ''}
            onChange={(e) => updateAppearance({ clothing: e.target.value })}
            placeholder="Describe typical outfit, fashion style, accessories..."
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            What does this character usually wear? Include accessories, jewelry, etc.
          </p>
        </motion.div>

        {/* Reference Image Upload (placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <Label className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Reference Image (Optional)
          </Label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/30">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag and drop an image, or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG up to 5MB. This will be used as a reference for AI image generation.
            </p>
            <Button variant="outline" size="sm" className="mt-3" disabled>
              Coming Soon
            </Button>
          </div>
        </motion.div>
      </div>
    </StepContainer>
  );
}
