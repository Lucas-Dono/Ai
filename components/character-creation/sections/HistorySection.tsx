'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Sparkles, Calendar } from 'lucide-react';
import { nanoid } from 'nanoid';
import type { SectionProps, HistoryEvent } from '../types';

export function HistorySection({ data, onChange, isGenerating, onGenerate }: SectionProps) {
  const t = useTranslations('characterCreation.history');

  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<HistoryEvent>>({
    year: undefined,
    title: '',
    description: '',
  });

  const [newTrauma, setNewTrauma] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  const addEvent = () => {
    if (!newEvent.year || !newEvent.title?.trim()) {
      alert(t('events.errors.required'));
      return;
    }

    const event: HistoryEvent = {
      id: nanoid(),
      year: newEvent.year,
      title: newEvent.title.trim(),
      description: newEvent.description?.trim() || '',
    };

    onChange({
      importantEvents: [...data.importantEvents, event].sort((a, b) => a.year - b.year),
    });
    setNewEvent({ year: undefined, title: '', description: '' });
    setIsAddingEvent(false);
  };

  const removeEvent = (id: string) => {
    onChange({ importantEvents: data.importantEvents.filter((e) => e.id !== id) });
  };

  const addTrauma = () => {
    if (!newTrauma.trim()) return;
    onChange({ traumas: [...data.traumas, newTrauma.trim()] });
    setNewTrauma('');
  };

  const removeTrauma = (index: number) => {
    onChange({ traumas: data.traumas.filter((_, i) => i !== index) });
  };

  const addAchievement = () => {
    if (!newAchievement.trim()) return;
    onChange({ personalAchievements: [...data.personalAchievements, newAchievement.trim()] });
    setNewAchievement('');
  };

  const removeAchievement = (index: number) => {
    onChange({ personalAchievements: data.personalAchievements.filter((_, i) => i !== index) });
  };

  const handleGenerateHistory = async () => {
    onGenerate(true);
    try {
      const response = await fetch('/api/character-creation/generate-history', {
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
        importantEvents: result.events || [],
        traumas: result.traumas || [],
        personalAchievements: result.achievements || [],
      });
    } catch (error) {
      console.error('Failed to generate history:', error);
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
              {t('description')}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateHistory}
            disabled={isGenerating}
            className="gap-2"
          >
            <Sparkles className="w-3 h-3" />
            {t('generate')}
          </Button>
        </div>
      </div>

      {/* Timeline of Events */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>{t('events.label')}</Label>
          {!isAddingEvent && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddingEvent(true)}
              className="gap-2"
            >
              <Plus className="w-3 h-3" />
              {t('events.add')}
            </Button>
          )}
        </div>

        {/* Events Timeline */}
        {data.importantEvents.length > 0 && (
          <div className="relative space-y-4 pl-8">
            {/* Timeline Line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-700" />

            {data.importantEvents.map((event) => (
              <div key={event.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute left-[-2rem] top-2 w-3 h-3 rounded-full bg-primary border-2 border-white dark:border-gray-900" />

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">{event.year}</span>
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                        {event.title}
                      </h4>
                      {event.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeEvent(event.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Event Form */}
        {isAddingEvent && (
          <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventYear">{t('events.form.year')}</Label>
                <Input
                  id="eventYear"
                  type="number"
                  value={newEvent.year || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, year: parseInt(e.target.value) || undefined })}
                  placeholder="2020"
                />
              </div>
              <div className="col-span-3 space-y-2">
                <Label htmlFor="eventTitle">{t('events.form.title')}</Label>
                <Input
                  id="eventTitle"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder={t('events.form.titlePlaceholder')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventDescription">{t('events.form.description')}</Label>
              <Textarea
                id="eventDescription"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder={t('events.form.descriptionPlaceholder')}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={() => {
                setIsAddingEvent(false);
                setNewEvent({ year: undefined, title: '', description: '' });
              }}>
                {t('events.form.cancel')}
              </Button>
              <Button size="sm" onClick={addEvent}>
                {t('events.form.save')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Traumas */}
      <div className="space-y-3">
        <Label>{t('traumas.label')}</Label>

        {data.traumas.length > 0 && (
          <div className="space-y-2">
            {data.traumas.map((trauma, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-lg group"
              >
                <p className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                  {trauma}
                </p>
                <button
                  onClick={() => removeTrauma(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={newTrauma}
            onChange={(e) => setNewTrauma(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTrauma();
              }
            }}
            placeholder={t('traumas.placeholder')}
          />
          <Button onClick={addTrauma} variant="outline" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Personal Achievements */}
      <div className="space-y-3">
        <Label>{t('achievements.label')}</Label>

        {data.personalAchievements.length > 0 && (
          <div className="space-y-2">
            {data.personalAchievements.map((achievement, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/50 rounded-lg group"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold mt-0.5">
                  ✓
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
      </div>
    </div>
  );
}
