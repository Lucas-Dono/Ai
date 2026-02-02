'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import type { SectionProps } from '../types';

export function IdentitySection({ data, onChange, isGenerating, onGenerate }: SectionProps) {
  const t = useTranslations('characterCreation.identity');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadMode, setUploadMode] = useState<'upload' | 'generate' | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar archivo
    if (!file.type.startsWith('image/')) {
      alert(t('avatar.errors.invalidFormat'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(t('avatar.errors.tooLarge'));
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/smart-start/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      onChange({ avatarUrl: result.url });
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert(t('avatar.errors.uploadFailed'));
    }
  };

  const handleGenerateAvatar = async () => {
    if (!data.physicalDescription) {
      alert(t('avatar.errors.needDescription'));
      return;
    }

    onGenerate(true);
    try {
      // TODO: Llamar a API de generación de imágenes
      const response = await fetch('/api/smart-start/generate-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: data.physicalDescription,
          age: data.age,
          gender: data.gender,
        }),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const result = await response.json();
      onChange({ avatarUrl: result.url });
    } catch (error) {
      console.error('Failed to generate avatar:', error);
      alert(t('avatar.errors.generationFailed'));
    } finally {
      onGenerate(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!data.name || !data.age || !data.gender) {
      alert(t('description.errors.needBasicInfo'));
      return;
    }

    onGenerate(true);
    try {
      const response = await fetch('/api/character-creation/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          age: data.age,
          gender: data.gender,
          occupation: data.occupation,
        }),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const result = await response.json();
      onChange({ physicalDescription: result.description });
    } catch (error) {
      console.error('Failed to generate description:', error);
    } finally {
      onGenerate(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Title */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t('title')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('description')} <span className="text-red-500">*</span>
        </p>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-1">
            {t('name.label')}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t('name.placeholder')}
            className="text-lg font-medium"
          />
        </div>

        {/* Age */}
        <div className="space-y-2">
          <Label htmlFor="age" className="flex items-center gap-1">
            {t('age.label')}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="age"
            type="number"
            min="1"
            max="200"
            value={data.age || ''}
            onChange={(e) => onChange({ age: parseInt(e.target.value) || undefined })}
            placeholder={t('age.placeholder')}
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender" className="flex items-center gap-1">
            {t('gender.label')}
            <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.gender}
            onValueChange={(value) => onChange({ gender: value as any })}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder={t('gender.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t('gender.options.male')}</SelectItem>
              <SelectItem value="female">{t('gender.options.female')}</SelectItem>
              <SelectItem value="non-binary">{t('gender.options.nonBinary')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Origin */}
        <div className="space-y-2">
          <Label htmlFor="origin">
            {t('origin.label')}
          </Label>
          <Input
            id="origin"
            value={data.origin}
            onChange={(e) => onChange({ origin: e.target.value })}
            placeholder={t('origin.placeholder')}
          />
        </div>
      </div>

      {/* Physical Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description" className="flex items-center gap-1">
            {t('description.label')}
            <span className="text-red-500">*</span>
          </Label>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateDescription}
            disabled={isGenerating || !data.name || !data.age || !data.gender}
            className="gap-2"
          >
            <Sparkles className="w-3 h-3" />
            {t('description.generate')}
          </Button>
        </div>
        <Textarea
          id="description"
          value={data.physicalDescription}
          onChange={(e) => onChange({ physicalDescription: e.target.value })}
          placeholder={t('description.placeholder')}
          rows={6}
          className="resize-none"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('description.hint')}
        </p>
      </div>

      {/* Avatar Upload/Generation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1">
            {t('avatar.label')}
            <span className="text-red-500">*</span>
          </Label>
        </div>

        {!data.avatarUrl ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Upload Option */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('avatar.upload')}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                PNG, JPG, WEBP (max 5MB)
              </span>
            </button>

            {/* Generate Option */}
            <button
              onClick={handleGenerateAvatar}
              disabled={!data.physicalDescription || isGenerating}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('avatar.generate')}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('avatar.generateHint')}
              </span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        ) : (
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <img
              src={data.avatarUrl}
              alt="Avatar preview"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t('avatar.uploaded')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('avatar.uploadedHint')}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onChange({ avatarUrl: null })}
            >
              {t('avatar.change')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
