'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Sparkles } from 'lucide-react';
import type { SectionProps } from '../types';

export function WorkSection({ data, onChange, isGenerating, onGenerate }: SectionProps) {
  const t = useTranslations('characterCreation.work');

  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  const addSkill = () => {
    if (!newSkill.trim()) return;
    onChange({ skills: [...data.skills, newSkill.trim()] });
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    onChange({ skills: data.skills.filter((_, i) => i !== index) });
  };

  const addAchievement = () => {
    if (!newAchievement.trim()) return;
    onChange({ achievements: [...data.achievements, newAchievement.trim()] });
    setNewAchievement('');
  };

  const removeAchievement = (index: number) => {
    onChange({ achievements: data.achievements.filter((_, i) => i !== index) });
  };

  const handleGenerateProfile = async () => {
    if (!data.occupation) {
      alert(t('errors.needOccupation'));
      return;
    }

    onGenerate(true);
    try {
      const response = await fetch('/api/character-creation/generate-work-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occupation: data.occupation,
          name: data.name,
          age: data.age,
        }),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const result = await response.json();
      onChange({
        skills: result.skills || [],
        achievements: result.achievements || [],
      });
    } catch (error) {
      console.error('Failed to generate work profile:', error);
    } finally {
      onGenerate(false);
    }
  };

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
              {t('description')} <span className="text-red-500">*</span>
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateProfile}
            disabled={isGenerating || !data.occupation}
            className="gap-2"
          >
            <Sparkles className="w-3 h-3" />
            {t('generate')}
          </Button>
        </div>
      </div>

      {/* Occupation */}
      <div className="space-y-2">
        <Label htmlFor="occupation" className="flex items-center gap-1">
          {t('occupation.label')}
          <span className="text-red-500">*</span>
        </Label>
        <Input
          id="occupation"
          value={data.occupation}
          onChange={(e) => onChange({ occupation: e.target.value })}
          placeholder={t('occupation.placeholder')}
          className="text-lg"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('occupation.hint')}
        </p>
      </div>

      {/* Skills */}
      <div className="space-y-3">
        <Label>{t('skills.label')}</Label>

        {/* Skills List */}
        {data.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {data.skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="gap-2 py-1.5 px-3">
                {skill}
                <button
                  onClick={() => removeSkill(index)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Add Skill Input */}
        <div className="flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder={t('skills.placeholder')}
          />
          <Button onClick={addSkill} variant="outline" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('skills.hint')}
        </p>
      </div>

      {/* Achievements */}
      <div className="space-y-3">
        <Label>{t('achievements.label')}</Label>

        {/* Achievements List */}
        {data.achievements.length > 0 && (
          <div className="space-y-2">
            {data.achievements.map((achievement, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium mt-0.5">
                  {index + 1}
                </div>
                <p className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                  {achievement}
                </p>
                <button
                  onClick={() => removeAchievement(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Achievement Input */}
        <div className="flex gap-2">
          <Input
            value={newAchievement}
            onChange={(e) => setNewAchievement(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addAchievement();
              }
            }}
            placeholder={t('achievements.placeholder')}
          />
          <Button onClick={addAchievement} variant="outline" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('achievements.hint')}
        </p>
      </div>
    </div>
  );
}
