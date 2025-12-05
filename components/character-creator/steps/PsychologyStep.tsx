'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Heart, AlertTriangle, Star, Sparkles, RefreshCw, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { StepContainer } from '../StepContainer';
import { useWizard } from '../WizardShell';
import type {
  BigFiveTraits,
  PersonalityCoreData,
  CoreValue,
} from '@/types/character-creation';
import { DEFAULT_BIG_FIVE, DEFAULT_BASELINE_EMOTIONS } from '@/types/character-creation';

/**
 * PsychologyStep - Step 5: Deep psychology
 *
 * Collects:
 * - Big Five personality traits (with AI generation option)
 * - Core values
 * - Fears
 * - Desires
 * - Coping mechanisms
 */

const BIG_FIVE_INFO: {
  key: keyof BigFiveTraits;
  label: string;
  lowLabel: string;
  highLabel: string;
  description: string;
}[] = [
  {
    key: 'openness',
    label: 'Openness',
    lowLabel: 'Conventional',
    highLabel: 'Creative',
    description: 'Curiosity, creativity, and openness to new experiences',
  },
  {
    key: 'conscientiousness',
    label: 'Conscientiousness',
    lowLabel: 'Flexible',
    highLabel: 'Organized',
    description: 'Organization, self-discipline, and reliability',
  },
  {
    key: 'extraversion',
    label: 'Extraversion',
    lowLabel: 'Introverted',
    highLabel: 'Extroverted',
    description: 'Social energy and enthusiasm in social settings',
  },
  {
    key: 'agreeableness',
    label: 'Agreeableness',
    lowLabel: 'Analytical',
    highLabel: 'Empathetic',
    description: 'Cooperation, empathy, and kindness toward others',
  },
  {
    key: 'neuroticism',
    label: 'Neuroticism',
    lowLabel: 'Stable',
    highLabel: 'Sensitive',
    description: 'Emotional sensitivity and tendency toward anxiety',
  },
];

const SUGGESTED_VALUES = [
  'authenticity',
  'loyalty',
  'creativity',
  'independence',
  'compassion',
  'achievement',
  'adventure',
  'stability',
  'justice',
  'family',
  'growth',
  'freedom',
  'connection',
  'honesty',
  'courage',
];

export function PsychologyStep() {
  const { characterDraft, updateCharacter } = useWizard();
  const [isGenerating, setIsGenerating] = useState(false);
  const [bigFiveOpen, setBigFiveOpen] = useState(true);
  const [valuesOpen, setValuesOpen] = useState(true);
  const [fearsOpen, setFearsOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // New item inputs
  const [newFear, setNewFear] = useState('');
  const [newDesire, setNewDesire] = useState('');
  const [newCoping, setNewCoping] = useState('');
  const [newValue, setNewValue] = useState('');

  // Get current psychology data
  const personalityCore: PersonalityCoreData = characterDraft.personalityCore || {
    ...DEFAULT_BIG_FIVE,
    coreValues: [],
    moralSchemas: [],
    baselineEmotions: DEFAULT_BASELINE_EMOTIONS,
  };

  // Get fears/desires from fearsDesires or top-level fears
  const fears = characterDraft.fearsDesires?.fears || characterDraft.fears || [];
  const desires = characterDraft.fearsDesires?.desires || [];
  const copingMechanisms = characterDraft.fearsDesires?.copingMechanisms || [];

  // Update Big Five trait
  const updateBigFive = useCallback(
    (trait: keyof BigFiveTraits, value: number) => {
      updateCharacter({
        personalityCore: {
          ...personalityCore,
          [trait]: value,
        },
      });
    },
    [personalityCore, updateCharacter]
  );

  // Generate Big Five from AI
  const handleGenerateBigFive = useCallback(async () => {
    if (!characterDraft.personality) return;

    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/smart-start/generate-personality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalityText: characterDraft.personality,
          context: {
            name: characterDraft.name,
            age: characterDraft.age,
            gender: characterDraft.gender,
            occupation: characterDraft.occupation,
          },
        }),
        signal,
      });

      if (response.ok) {
        const data = await response.json();
        updateCharacter({
          personalityCore: {
            ...personalityCore,
            ...data.bigFive,
          },
        });
      }
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Failed to generate Big Five:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [characterDraft, personalityCore, updateCharacter]);

  // Add/remove core values
  const addValue = useCallback(
    (value: string) => {
      if (!value.trim()) return;
      const newCoreValue: CoreValue = {
        value: value.trim(),
        weight: 0.7,
        description: '',
      };
      updateCharacter({
        personalityCore: {
          ...personalityCore,
          coreValues: [...personalityCore.coreValues, newCoreValue],
        },
      });
      setNewValue('');
    },
    [personalityCore, updateCharacter]
  );

  const removeValue = useCallback(
    (index: number) => {
      const newValues = [...personalityCore.coreValues];
      newValues.splice(index, 1);
      updateCharacter({
        personalityCore: {
          ...personalityCore,
          coreValues: newValues,
        },
      });
    },
    [personalityCore, updateCharacter]
  );

  // Helper to update fearsDesires
  const updateFearsDesires = useCallback(
    (updates: Partial<{ fears: string[]; desires: string[]; copingMechanisms: string[] }>) => {
      updateCharacter({
        fearsDesires: {
          fears: characterDraft.fearsDesires?.fears || characterDraft.fears || [],
          desires: characterDraft.fearsDesires?.desires || [],
          copingMechanisms: characterDraft.fearsDesires?.copingMechanisms || [],
          ...updates,
        },
      });
    },
    [characterDraft.fearsDesires, characterDraft.fears, updateCharacter]
  );

  // Add/remove fears
  const addFear = useCallback(() => {
    if (!newFear.trim()) return;
    updateFearsDesires({ fears: [...fears, newFear.trim()] });
    setNewFear('');
  }, [newFear, fears, updateFearsDesires]);

  const removeFear = useCallback(
    (index: number) => {
      const newFears = [...fears];
      newFears.splice(index, 1);
      updateFearsDesires({ fears: newFears });
    },
    [fears, updateFearsDesires]
  );

  // Add/remove desires
  const addDesire = useCallback(() => {
    if (!newDesire.trim()) return;
    updateFearsDesires({ desires: [...desires, newDesire.trim()] });
    setNewDesire('');
  }, [newDesire, desires, updateFearsDesires]);

  const removeDesire = useCallback(
    (index: number) => {
      const newDesires = [...desires];
      newDesires.splice(index, 1);
      updateFearsDesires({ desires: newDesires });
    },
    [desires, updateFearsDesires]
  );

  // Add/remove coping mechanisms
  const addCoping = useCallback(() => {
    if (!newCoping.trim()) return;
    updateFearsDesires({ copingMechanisms: [...copingMechanisms, newCoping.trim()] });
    setNewCoping('');
  }, [newCoping, copingMechanisms, updateFearsDesires]);

  const removeCoping = useCallback(
    (index: number) => {
      const newCopingList = [...copingMechanisms];
      newCopingList.splice(index, 1);
      updateFearsDesires({ copingMechanisms: newCopingList });
    },
    [copingMechanisms, updateFearsDesires]
  );

  return (
    <StepContainer
      title="Psychology & Inner World"
      description="Define the deeper psychological traits that drive your character's behavior and decisions."
    >
      <div className="space-y-6">
        {/* Big Five Section */}
        <Collapsible open={bigFiveOpen} onOpenChange={setBigFiveOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                <span className="font-medium">Big Five Personality Model</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${bigFiveOpen ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              {/* AI Generate Button */}
              <div className="flex items-center justify-between pb-3 border-b">
                <p className="text-sm text-muted-foreground">
                  Generate from personality description
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateBigFive}
                  disabled={isGenerating || !characterDraft.personality}
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Generate
                </Button>
              </div>

              {/* Sliders */}
              {BIG_FIVE_INFO.map(({ key, label, lowLabel, highLabel, description }) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">{label}</Label>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {personalityCore[key]}
                    </span>
                  </div>
                  <Slider
                    value={[personalityCore[key]]}
                    onValueChange={([value]) => updateBigFive(key, value)}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{lowLabel}</span>
                    <span>{highLabel}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Core Values Section */}
        <Collapsible open={valuesOpen} onOpenChange={setValuesOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span className="font-medium">Core Values</span>
                <Badge variant="secondary" className="ml-2">
                  {personalityCore.coreValues.length}
                </Badge>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${valuesOpen ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              {/* Current values */}
              {personalityCore.coreValues.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {personalityCore.coreValues.map((cv, index) => (
                    <Badge key={index} variant="outline" className="gap-1 pr-1">
                      {cv.value}
                      <button
                        onClick={() => removeValue(index)}
                        className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add new value */}
              <div className="flex gap-2">
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Add a core value..."
                  onKeyDown={(e) => e.key === 'Enter' && addValue(newValue)}
                />
                <Button onClick={() => addValue(newValue)} size="icon" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Suggested values */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Suggestions:</p>
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_VALUES.filter(
                    (v) => !personalityCore.coreValues.some((cv) => cv.value === v)
                  )
                    .slice(0, 8)
                    .map((value) => (
                      <Badge
                        key={value}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => addValue(value)}
                      >
                        + {value}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Fears & Desires Section */}
        <Collapsible open={fearsOpen} onOpenChange={setFearsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Fears, Desires & Coping</span>
                <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${fearsOpen ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <div className="space-y-6 p-4 bg-muted/30 rounded-lg">
              {/* Fears */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Fears
                </Label>
                {fears.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {fears.map((fear: string, index: number) => (
                      <Badge key={index} variant="outline" className="gap-1 pr-1">
                        {fear}
                        <button
                          onClick={() => removeFear(index)}
                          className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={newFear}
                    onChange={(e) => setNewFear(e.target.value)}
                    placeholder="What does this character fear?"
                    onKeyDown={(e) => e.key === 'Enter' && addFear()}
                  />
                  <Button onClick={addFear} size="icon" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Desires */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Desires
                </Label>
                {desires.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {desires.map((desire: string, index: number) => (
                      <Badge key={index} variant="outline" className="gap-1 pr-1">
                        {desire}
                        <button
                          onClick={() => removeDesire(index)}
                          className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={newDesire}
                    onChange={(e) => setNewDesire(e.target.value)}
                    placeholder="What does this character desire most?"
                    onKeyDown={(e) => e.key === 'Enter' && addDesire()}
                  />
                  <Button onClick={addDesire} size="icon" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Coping Mechanisms */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-green-500" />
                  Coping Mechanisms
                </Label>
                {copingMechanisms.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {copingMechanisms.map((coping: string, index: number) => (
                      <Badge key={index} variant="outline" className="gap-1 pr-1">
                        {coping}
                        <button
                          onClick={() => removeCoping(index)}
                          className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={newCoping}
                    onChange={(e) => setNewCoping(e.target.value)}
                    placeholder="How does this character cope with stress?"
                    onKeyDown={(e) => e.key === 'Enter' && addCoping()}
                  />
                  <Button onClick={addCoping} size="icon" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </StepContainer>
  );
}
