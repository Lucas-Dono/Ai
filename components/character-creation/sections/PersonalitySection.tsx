'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Sparkles } from 'lucide-react';
import type { SectionProps } from '../types';

export function PersonalitySection({ data, onChange, isGenerating, onGenerate }: SectionProps) {
  const t = useTranslations('characterCreation.personality');

  const [newValue, setNewValue] = useState('');
  const [newFear, setNewFear] = useState('');

  const handleBigFiveChange = (trait: keyof typeof data.bigFive, value: number[]) => {
    onChange({
      bigFive: {
        ...data.bigFive,
        [trait]: value[0],
      },
    });
  };

  const addValue = () => {
    if (!newValue.trim()) return;
    onChange({ coreValues: [...data.coreValues, newValue.trim()] });
    setNewValue('');
  };

  const removeValue = (index: number) => {
    onChange({ coreValues: data.coreValues.filter((_, i) => i !== index) });
  };

  const addFear = () => {
    if (!newFear.trim()) return;
    onChange({ fears: [...data.fears, newFear.trim()] });
    setNewFear('');
  };

  const removeFear = (index: number) => {
    onChange({ fears: data.fears.filter((_, i) => i !== index) });
  };

  const handleGeneratePersonality = async () => {
    onGenerate(true);
    try {
      const response = await fetch('/api/character-creation/generate-personality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          age: data.age,
          occupation: data.occupation,
        }),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const result = await response.json();
      onChange({
        bigFive: result.bigFive || data.bigFive,
        coreValues: result.coreValues || [],
        fears: result.fears || [],
      });
    } catch (error) {
      console.error('Failed to generate personality:', error);
    } finally {
      onGenerate(false);
    }
  };

  const bigFiveTraits = [
    { key: 'openness', label: t('bigFive.openness.label'), description: t('bigFive.openness.description') },
    { key: 'conscientiousness', label: t('bigFive.conscientiousness.label'), description: t('bigFive.conscientiousness.description') },
    { key: 'extraversion', label: t('bigFive.extraversion.label'), description: t('bigFive.extraversion.description') },
    { key: 'agreeableness', label: t('bigFive.agreeableness.label'), description: t('bigFive.agreeableness.description') },
    { key: 'neuroticism', label: t('bigFive.neuroticism.label'), description: t('bigFive.neuroticism.description') },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Section Title */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t('title')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('description')}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGeneratePersonality}
            disabled={isGenerating}
            className="gap-2"
          >
            <Sparkles className="w-3 h-3" />
            {t('generate')}
          </Button>
        </div>
      </div>

      {/* Big Five Traits */}
      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">{t('bigFive.title')}</Label>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('bigFive.description')}
          </p>
        </div>

        {bigFiveTraits.map(({ key, label, description }) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">{label}</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
              </div>
              <span className="text-sm font-semibold text-primary min-w-[3rem] text-right">
                {data.bigFive[key]}
              </span>
            </div>
            <Slider
              value={[data.bigFive[key]]}
              onValueChange={(value) => handleBigFiveChange(key, value)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* Core Values */}
      <div className="space-y-3">
        <div>
          <Label>{t('values.label')}</Label>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('values.description')}
          </p>
        </div>

        {data.coreValues.length > 0 && (
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {data.coreValues.map((value, index) => (
              <Badge key={index} variant="secondary" className="gap-2 py-1.5 px-3">
                {value}
                <button
                  onClick={() => removeValue(index)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addValue();
              }
            }}
            placeholder={t('values.placeholder')}
          />
          <Button onClick={addValue} variant="outline" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Fears */}
      <div className="space-y-3">
        <div>
          <Label>{t('fears.label')}</Label>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('fears.description')}
          </p>
        </div>

        {data.fears.length > 0 && (
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {data.fears.map((fear, index) => (
              <Badge key={index} variant="secondary" className="gap-2 py-1.5 px-3">
                {fear}
                <button
                  onClick={() => removeFear(index)}
                  className="hover:text-red-500 transition-colors"
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addFear();
              }
            }}
            placeholder={t('fears.placeholder')}
          />
          <Button onClick={addFear} variant="outline" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
