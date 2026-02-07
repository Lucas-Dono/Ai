'use client';

import { User, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { CharacterDraft } from '@/lib/smart-start/core/types';

interface CharacterPreviewProps {
  draft: Partial<CharacterDraft>;
  className?: string;
}

export function CharacterPreview({ draft, className }: CharacterPreviewProps) {
  const t = useTranslations('smartStart.characterPreview');

  const hasContent = !!(
    draft.name ||
    draft.physicalAppearance ||
    draft.personality ||
    draft.backstory
  );

  if (!hasContent) {
    return <EmptyPreview className={className} />;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center flex-shrink-0">
          {draft.imageUrl ? (
            <img
              src={draft.imageUrl}
              alt={draft.name || 'Character'}
              className="w-full h-full rounded-xl object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-primary" />
          )}
        </div>

        {/* Name & Meta */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {draft.name || t('newCharacter')}
          </h3>
          <div className="flex flex-wrap gap-2 mt-1">
            {draft.age && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {t('fields.age')}: {draft.age}
              </span>
            )}
            {draft.gender && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {draft.gender}
              </span>
            )}
            {draft.occupation && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {draft.occupation}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Appearance */}
      {draft.physicalAppearance && (
        <PreviewSection title={t('fields.appearance')} content={draft.physicalAppearance} />
      )}

      {/* Personality */}
      {draft.personality && (
        <PreviewSection
          title={t('fields.personality')}
          content={
            Array.isArray(draft.personality)
              ? draft.personality.join(', ')
              : draft.personality
          }
        />
      )}

      {/* Background */}
      {draft.backstory && (
        <PreviewSection title={t('fields.background')} content={draft.backstory} />
      )}

      {/* Additional fields */}
      {draft.likes && draft.likes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('fields.likes')}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {draft.likes.map((like, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
              >
                {like}
              </span>
            ))}
          </div>
        </div>
      )}

      {draft.dislikes && draft.dislikes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('fields.dislikes')}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {draft.dislikes.map((dislike, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
              >
                {dislike}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface PreviewSectionProps {
  title: string;
  content: string;
}

function PreviewSection({ title, content }: PreviewSectionProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {title}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
}

function EmptyPreview({ className }: { className?: string }) {
  const t = useTranslations('smartStart.characterPreview.emptyState');

  return (
    <div className={cn('text-center py-12', className)}>
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
        {t('title')}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t('message')}
      </p>
    </div>
  );
}
