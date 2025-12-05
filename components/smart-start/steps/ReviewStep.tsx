'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, AlertCircle, Crown, Lock, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useSmartStart } from '../context/SmartStartContext';
import { GodModeModal, DEFAULT_GOD_MODE_CONFIG } from '@/components/character-creator/god-mode';
import type { GodModeConfig } from '@/types/god-mode';

export function ReviewStep() {
  const t = useTranslations('smartStart.reviewStep');
  const router = useRouter();
  const { characterDraft, finalizeCharacter, goBack } = useSmartStart();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [godModeOpen, setGodModeOpen] = useState(false);
  const [godModeConfig, setGodModeConfig] = useState<GodModeConfig>(DEFAULT_GOD_MODE_CONFIG);

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);

    try {
      // Pass God Mode config if enabled
      const characterId = await finalizeCharacter(
        godModeConfig.enabled ? godModeConfig : undefined
      );

      // Success - redirect to character page
      router.push(`/characters/${characterId}`);
    } catch (err) {
      console.error('Failed to create character:', err);
      setError(err instanceof Error ? err.message : 'Failed to create character');
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {t('title')}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('subtitle')}
        </p>
      </div>

      {/* Character Summary */}
      <div className="space-y-6">
        {/* Name */}
        <ReviewField
          label={t('fields.name')}
          value={characterDraft.name || t('unnamedCharacter')}
        />

        {/* Appearance */}
        {characterDraft.appearance && (
          <ReviewField
            label={t('fields.appearance')}
            value={characterDraft.appearance}
          />
        )}

        {/* Personality */}
        {characterDraft.personality && (
          <ReviewField
            label={t('fields.personality')}
            value={
              Array.isArray(characterDraft.personality)
                ? characterDraft.personality.join(', ')
                : characterDraft.personality
            }
          />
        )}

        {/* Background */}
        {characterDraft.background && (
          <ReviewField
            label={t('fields.background')}
            value={characterDraft.background}
          />
        )}

        {/* Additional fields if present */}
        {characterDraft.occupation && (
          <ReviewField
            label={t('fields.occupation')}
            value={characterDraft.occupation}
          />
        )}

        {characterDraft.age && (
          <ReviewField
            label={t('fields.age')}
            value={String(characterDraft.age)}
          />
        )}

        {characterDraft.gender && (
          <ReviewField
            label={t('fields.gender')}
            value={characterDraft.gender}
          />
        )}
      </div>

      {/* God Mode Section */}
      <div className="p-5 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">God Mode</h3>
                <Badge variant="secondary" className="text-xs">BETA</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {godModeConfig.enabled
                  ? `${godModeConfig.visibility === 'private' ? 'Private' : 'Public'} • ${godModeConfig.initialRelationship !== 'stranger' ? 'Custom relationship' : 'Standard'}`
                  : 'Advanced relationship settings'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {godModeConfig.enabled && (
              <div className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400">
                {godModeConfig.visibility === 'private' ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
              </div>
            )}
            <Button
              variant={godModeConfig.enabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setGodModeOpen(true)}
              className={godModeConfig.enabled ? 'bg-gradient-to-r from-purple-600 to-pink-500' : ''}
            >
              <Crown className="w-4 h-4 mr-2" />
              {godModeConfig.enabled ? 'Edit' : 'Configure'}
            </Button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={isCreating}
          className="flex-1"
        >
          {t('goBackButton')}
        </Button>

        <Button
          onClick={handleCreate}
          disabled={isCreating}
          className="flex-1"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('creating')}
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              {t('createButton')}
            </>
          )}
        </Button>
      </div>

      {/* Confirmation message */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('confirmationMessage')}
        </p>
      </div>

      {/* God Mode Modal */}
      <GodModeModal
        open={godModeOpen}
        onOpenChange={setGodModeOpen}
        config={godModeConfig}
        onConfigChange={setGodModeConfig}
        characterName={characterDraft.name || 'Character'}
      />
    </div>
  );
}

interface ReviewFieldProps {
  label: string;
  value: string;
}

function ReviewField({ label, value }: ReviewFieldProps) {
  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
      <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
        {label}
      </dt>
      <dd className="text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
        {value}
      </dd>
    </div>
  );
}
