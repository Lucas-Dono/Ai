'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Sparkles, User } from 'lucide-react';
import { nanoid } from 'nanoid';
import type { SectionProps, ImportantPerson } from '../types';

export function RelationshipsSection({ data, onChange, isGenerating, onGenerate }: SectionProps) {
  const t = useTranslations('characterCreation.relationships');

  const [isAdding, setIsAdding] = useState(false);
  const [newPerson, setNewPerson] = useState<Partial<ImportantPerson>>({
    name: '',
    relationship: '',
    description: '',
  });

  const addPerson = () => {
    if (!newPerson.name?.trim() || !newPerson.relationship?.trim()) {
      alert(t('people.errors.required'));
      return;
    }

    const person: ImportantPerson = {
      id: nanoid(),
      name: newPerson.name.trim(),
      relationship: newPerson.relationship.trim(),
      description: newPerson.description?.trim() || '',
    };

    onChange({ importantPeople: [...data.importantPeople, person] });
    setNewPerson({ name: '', relationship: '', description: '' });
    setIsAdding(false);
  };

  const removePerson = (id: string) => {
    onChange({ importantPeople: data.importantPeople.filter((p) => p.id !== id) });
  };

  const handleGenerateRelationships = async () => {
    onGenerate(true);
    try {
      const response = await fetch('/api/character-creation/generate-relationships', {
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
        importantPeople: result.people || [],
        maritalStatus: result.maritalStatus,
      });
    } catch (error) {
      console.error('Failed to generate relationships:', error);
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
            onClick={handleGenerateRelationships}
            disabled={isGenerating}
            className="gap-2"
          >
            <Sparkles className="w-3 h-3" />
            {t('generate')}
          </Button>
        </div>
      </div>

      {/* Marital Status */}
      <div className="space-y-2">
        <Label htmlFor="maritalStatus">{t('maritalStatus.label')}</Label>
        <Select
          value={data.maritalStatus}
          onValueChange={(value) => onChange({ maritalStatus: value as any })}
        >
          <SelectTrigger id="maritalStatus">
            <SelectValue placeholder={t('maritalStatus.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">{t('maritalStatus.options.single')}</SelectItem>
            <SelectItem value="married">{t('maritalStatus.options.married')}</SelectItem>
            <SelectItem value="divorced">{t('maritalStatus.options.divorced')}</SelectItem>
            <SelectItem value="widowed">{t('maritalStatus.options.widowed')}</SelectItem>
            <SelectItem value="complicated">{t('maritalStatus.options.complicated')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Important People */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>{t('people.label')}</Label>
          {!isAdding && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAdding(true)}
              className="gap-2"
            >
              <Plus className="w-3 h-3" />
              {t('people.add')}
            </Button>
          )}
        </div>

        {/* People List */}
        {data.importantPeople.length > 0 && (
          <div className="space-y-3">
            {data.importantPeople.map((person) => (
              <div
                key={person.id}
                className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {person.name}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      • {person.relationship}
                    </span>
                  </div>
                  {person.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {person.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removePerson(person.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Person Form */}
        {isAdding && (
          <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="personName">{t('people.form.name')}</Label>
                <Input
                  id="personName"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                  placeholder={t('people.form.namePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">{t('people.form.relationship')}</Label>
                <Input
                  id="relationship"
                  value={newPerson.relationship}
                  onChange={(e) => setNewPerson({ ...newPerson, relationship: e.target.value })}
                  placeholder={t('people.form.relationshipPlaceholder')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="personDescription">{t('people.form.description')}</Label>
              <Textarea
                id="personDescription"
                value={newPerson.description}
                onChange={(e) => setNewPerson({ ...newPerson, description: e.target.value })}
                placeholder={t('people.form.descriptionPlaceholder')}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={() => {
                setIsAdding(false);
                setNewPerson({ name: '', relationship: '', description: '' });
              }}>
                {t('people.form.cancel')}
              </Button>
              <Button size="sm" onClick={addPerson}>
                {t('people.form.save')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
