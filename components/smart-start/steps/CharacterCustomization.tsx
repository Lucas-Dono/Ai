'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Loader2, Settings2, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSmartStart } from '../context/SmartStartContext';
import { GenreDetectionBadge } from '../ui/GenreDetectionBadge';
import { trackGenreFeedback } from '@/lib/smart-start/utils/feedback-tracker';
import { BasicInfoTab } from './tabs/BasicInfoTab';
import { PersonalityTab } from './tabs/PersonalityTab';
import { AppearanceTab } from './tabs/AppearanceTab';
import type { BigFiveTraits, CharacterStyle } from '@/types/character-creation';
import { DEFAULT_BIG_FIVE } from '@/types/character-creation';

// API functions for AI generation
async function generatePersonalityFromAPI(
  personalityText: string,
  context: { name?: string; age?: string; gender?: string; occupation?: string }
): Promise<BigFiveTraits> {
  const response = await fetch('/api/smart-start/generate-personality', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personalityText, context }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate personality');
  }

  const data = await response.json();
  return data.bigFive;
}

async function generateAppearanceFromAPI(context: {
  name?: string;
  age?: string;
  gender?: string;
  personality?: string;
  occupation?: string;
  ethnicity?: string;
  style?: CharacterStyle;
}): Promise<{
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  clothing: string;
}> {
  const response = await fetch('/api/smart-start/generate-appearance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(context),
  });

  if (!response.ok) {
    throw new Error('Failed to generate appearance');
  }

  return response.json();
}

export function CharacterCustomization() {
  const t = useTranslations('smartStart.characterCustomization');
  const tTabs = useTranslations('smartStart.customize');
  const router = useRouter();

  const {
    characterDraft,
    updateCharacterDraft,
    generateCharacter,
    goToStep,
    isGenerating,
    characterType,
    detectedGenre,
    selectedGenre,
    sessionId,
    selectedSearchResult,
  } = useSmartStart();

  const [activeTab, setActiveTab] = useState('basic');
  const [isGeneratingBigFive, setIsGeneratingBigFive] = useState(false);
  const [isGeneratingAppearance, setIsGeneratingAppearance] = useState(false);
  const [hasGeneratedProfile, setHasGeneratedProfile] = useState(false);

  // Local state for form fields
  const [localDraft, setLocalDraft] = useState({
    // Basic
    name: characterDraft.name || '',
    age: String(characterDraft.age || '23-27'),
    gender: characterDraft.gender || '',
    occupation: characterDraft.occupation || '',
    // Personality
    personality: Array.isArray(characterDraft.personality)
      ? characterDraft.personality.join(', ')
      : characterDraft.personality || '',
    traits: Array.isArray(characterDraft.traits)
      ? characterDraft.traits.join(', ')
      : '',
    bigFive: (characterDraft.personalityCore as BigFiveTraits) || DEFAULT_BIG_FIVE,
    // Appearance
    hairColor: characterDraft.characterAppearance?.hairColor || '',
    hairStyle: characterDraft.characterAppearance?.hairStyle || '',
    eyeColor: characterDraft.characterAppearance?.eyeColor || '',
    clothing: characterDraft.characterAppearance?.clothing || '',
    style: (characterDraft.characterAppearance?.style as CharacterStyle) || 'realistic',
    ethnicity: characterDraft.characterAppearance?.ethnicity || '',
  });

  // Sync from context when characterDraft changes
  useEffect(() => {
    if (characterDraft.name) {
      setLocalDraft((prev) => ({
        ...prev,
        name: characterDraft.name || prev.name,
        age: String(characterDraft.age || prev.age),
        gender: characterDraft.gender || prev.gender,
        personality: Array.isArray(characterDraft.personality)
          ? characterDraft.personality.join(', ')
          : characterDraft.personality || prev.personality,
        traits: Array.isArray(characterDraft.traits)
          ? characterDraft.traits.join(', ')
          : prev.traits,
      }));
    }
  }, [characterDraft]);

  // Update handler for individual fields
  const handleUpdate = useCallback((field: string, value: string | BigFiveTraits) => {
    setLocalDraft((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Generate Big Five from personality text
  const handleGenerateBigFive = useCallback(async () => {
    if (!localDraft.personality) return;

    setIsGeneratingBigFive(true);
    try {
      const bigFive = await generatePersonalityFromAPI(localDraft.personality, {
        name: localDraft.name,
        age: localDraft.age,
        gender: localDraft.gender,
        occupation: localDraft.occupation,
      });
      setLocalDraft((prev) => ({ ...prev, bigFive }));
    } catch (error) {
      console.error('Failed to generate Big Five:', error);
    } finally {
      setIsGeneratingBigFive(false);
    }
  }, [localDraft.personality, localDraft.name, localDraft.age, localDraft.gender, localDraft.occupation]);

  // Generate appearance from context
  const handleGenerateAppearance = useCallback(async () => {
    setIsGeneratingAppearance(true);
    try {
      const appearance = await generateAppearanceFromAPI({
        name: localDraft.name,
        age: localDraft.age,
        gender: localDraft.gender,
        personality: localDraft.personality,
        occupation: localDraft.occupation,
        ethnicity: localDraft.ethnicity,
        style: localDraft.style,
      });
      setLocalDraft((prev) => ({
        ...prev,
        hairColor: appearance.hairColor,
        hairStyle: appearance.hairStyle,
        eyeColor: appearance.eyeColor,
        clothing: appearance.clothing,
      }));
    } catch (error) {
      console.error('Failed to generate appearance:', error);
    } finally {
      setIsGeneratingAppearance(false);
    }
  }, [localDraft]);

  // Generate full character profile
  const handleGenerate = async () => {
    // Save current inputs before generating
    syncToContext();
    await generateCharacter();
    setHasGeneratedProfile(true);
  };

  // Sync local state to context
  const syncToContext = useCallback(() => {
    updateCharacterDraft({
      name: localDraft.name,
      age: parseInt(localDraft.age) || 25,
      gender: localDraft.gender as 'male' | 'female' | 'non-binary' | 'other',
      occupation: localDraft.occupation,
      personality: localDraft.personality,
      traits: localDraft.traits.split(',').map((t) => t.trim()).filter(Boolean),
      personalityCore: {
        ...localDraft.bigFive,
        coreValues: [],
        moralSchemas: [],
        baselineEmotions: {
          joy: 0.5,
          curiosity: 0.5,
          anxiety: 0.3,
          affection: 0.5,
          confidence: 0.5,
          melancholy: 0.2,
        },
      },
      characterAppearance: {
        gender: localDraft.gender as 'male' | 'female' | 'non-binary' | 'other',
        age: localDraft.age,
        ethnicity: localDraft.ethnicity,
        hairColor: localDraft.hairColor,
        hairStyle: localDraft.hairStyle,
        eyeColor: localDraft.eyeColor,
        clothing: localDraft.clothing,
        style: localDraft.style,
        basePrompt: '', // Will be generated
      },
    });
  }, [localDraft, updateCharacterDraft]);

  // Continue to review
  const handleContinue = useCallback(() => {
    syncToContext();
    goToStep('review');
  }, [syncToContext, goToStep]);

  // Open Manual Wizard with current data
  const handleCustomizeMore = useCallback(() => {
    syncToContext();
    // Store session data and redirect to manual wizard
    const params = new URLSearchParams({
      fromSmartStart: 'true',
      sessionId: sessionId || '',
    });
    router.push(`/dashboard/wizard?${params.toString()}`);
  }, [syncToContext, sessionId, router]);

  // Genre feedback handler
  const handleGenreFeedback = useCallback(
    (isCorrect: boolean) => {
      if (!sessionId || !detectedGenre) return;
      trackGenreFeedback({
        sessionId,
        searchResultId: selectedSearchResult?.id,
        detectedGenre: detectedGenre.genre,
        confidence: detectedGenre.confidence,
        isCorrect,
        metadata: {
          source: selectedSearchResult?.source,
          reasoning: detectedGenre.reasoning,
        },
      });
    },
    [sessionId, detectedGenre, selectedSearchResult]
  );

  const handleChangeGenre = useCallback(() => {
    goToStep('genre');
  }, [goToStep]);

  const isExistingCharacter = characterType === 'existing';
  const isAnyGenerating = isGenerating || isGeneratingBigFive || isGeneratingAppearance;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!hasGeneratedProfile && !isAnyGenerating) {
          handleGenerate();
        } else if (hasGeneratedProfile && !isAnyGenerating) {
          handleContinue();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasGeneratedProfile, isAnyGenerating, handleContinue]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          {isExistingCharacter ? t('titleExisting') : t('titleOriginal')}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {isExistingCharacter ? t('subtitleExisting') : t('subtitleOriginal')}
        </p>
      </div>

      {/* Genre Detection Badge */}
      {detectedGenre && (
        <GenreDetectionBadge
          detectedGenre={detectedGenre}
          selectedGenre={selectedGenre}
          onFeedback={handleGenreFeedback}
          onChangeGenre={handleChangeGenre}
        />
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">{tTabs('tabs.basic')}</TabsTrigger>
          <TabsTrigger value="personality">{tTabs('tabs.personality')}</TabsTrigger>
          <TabsTrigger value="appearance">{tTabs('tabs.appearance')}</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <BasicInfoTab
            name={localDraft.name}
            age={localDraft.age}
            gender={localDraft.gender}
            occupation={localDraft.occupation}
            onUpdate={handleUpdate}
            disabled={isAnyGenerating}
          />
        </TabsContent>

        <TabsContent value="personality" className="mt-6">
          <PersonalityTab
            personality={localDraft.personality}
            traits={localDraft.traits}
            bigFive={localDraft.bigFive}
            onUpdate={handleUpdate}
            onGenerateBigFive={handleGenerateBigFive}
            isGenerating={isGeneratingBigFive}
            disabled={isAnyGenerating}
          />
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <AppearanceTab
            hairColor={localDraft.hairColor}
            hairStyle={localDraft.hairStyle}
            eyeColor={localDraft.eyeColor}
            clothing={localDraft.clothing}
            style={localDraft.style}
            ethnicity={localDraft.ethnicity}
            onUpdate={handleUpdate}
            onGenerateAppearance={handleGenerateAppearance}
            isGenerating={isGeneratingAppearance}
            disabled={isAnyGenerating}
          />
        </TabsContent>
      </Tabs>

      {/* AI Generation Prompt */}
      {!isExistingCharacter && !hasGeneratedProfile && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>{t('aiPrompt')}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <div className="flex gap-3">
          {!isExistingCharacter && (
            <Button
              onClick={handleGenerate}
              disabled={!localDraft.name.trim() || isAnyGenerating}
              variant="outline"
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('generating')}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {hasGeneratedProfile ? t('regenerateButton') : t('generateButton')}
                </>
              )}
            </Button>
          )}

          <Button
            onClick={handleContinue}
            disabled={!localDraft.name.trim() || isAnyGenerating}
            className="flex-1"
          >
            {t('continueButton')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Customize More Button */}
        <Button
          variant="ghost"
          onClick={handleCustomizeMore}
          disabled={isAnyGenerating}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          <Settings2 className="w-4 h-4 mr-2" />
          {tTabs('customizeMore')}
        </Button>
      </div>

      {/* Keyboard hints */}
      <div className="flex justify-center gap-6 text-xs text-muted-foreground pt-4 border-t">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-muted rounded border text-xs">Tab</kbd>
          <span>{t('keyboard.navigateFields')}</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-muted rounded border text-xs">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-2 py-1 bg-muted rounded border text-xs">Enter</kbd>
          <span>{hasGeneratedProfile ? t('keyboard.continue') : t('keyboard.generate')}</span>
        </div>
      </div>
    </div>
  );
}
