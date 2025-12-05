'use client';

import { Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SearchResult } from '@/lib/smart-start/core/types';
import Image from 'next/image';
import { AccessibleModal } from './accessible/AccessibleModal';
import { useKeyboardShortcuts, commonShortcuts } from '@/hooks/useKeyboardShortcuts';

interface HighConfidenceMatchModalProps {
  isOpen: boolean;
  result: SearchResult;
  matchScore: number;
  onConfirm: () => void;
  onShowMore: () => void;
  onClose: () => void;
}

/**
 * HighConfidenceMatchModal - Shows when search finds a near-perfect match
 * Displays character bio and asks user to confirm before proceeding
 *
 * Accessibility Features:
 * - Full keyboard navigation (Tab, Enter, Escape)
 * - ARIA attributes for screen readers
 * - Focus trap keeps focus within modal
 * - Auto-focuses first button on open
 * - Restores focus on close
 * - Keyboard shortcuts (Enter to confirm, Escape to close)
 */
export function HighConfidenceMatchModal({
  isOpen,
  result,
  matchScore,
  onConfirm,
  onShowMore,
  onClose,
}: HighConfidenceMatchModalProps) {
  const isPerfectMatch = matchScore >= 0.95;
  const imageUrl = result.imageUrl || result.image;

  // Keyboard shortcuts
  useKeyboardShortcuts(
    [
      commonShortcuts.submit(onConfirm),
      commonShortcuts.close(onClose),
    ],
    { enabled: isOpen }
  );

  const title = isPerfectMatch ? '¡Match Perfecto!' : '¡Match de Alta Confianza!';
  const description = `Encontramos un resultado con ${Math.round(matchScore * 100)}% de coincidencia`;

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="xl"
      closeOnBackdropClick={true}
      closeOnEscape={true}
      showCloseButton={true}
    >
      <div className="space-y-6">
        {/* Character Info */}
        <div className="flex gap-6">
          {/* Image */}
          {imageUrl && (
            <div className="flex-shrink-0">
              <div className="relative w-32 h-40 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
                <Image
                  src={imageUrl}
                  alt={result.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {result.name}
              </h3>

              {(result.alternateName || result.nameNative) && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {result.alternateName || result.nameNative}
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {result.source.toUpperCase()}
              </span>

              {result.metadata?.show && (
                <span className="px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {result.metadata.show}
                </span>
              )}

              {result.metadata?.year && (
                <span className="px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {result.metadata.year}
                </span>
              )}

              {result.gender && (
                <span className="px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {result.gender}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Biography/Description */}
        {result.description && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Biografía
            </h4>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {result.description}
              </p>
            </div>
          </div>
        )}

        {/* Additional Info */}
        {(result.age || result.species || result.actorName) && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            {result.age && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Edad
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                  {result.age}
                </p>
              </div>
            )}

            {result.species && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Especie
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                  {result.species}
                </p>
              </div>
            )}

            {result.actorName && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Actor/Actriz
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                  {result.actorName}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Question */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
            ¿Este personaje es el que estabas buscando?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={onConfirm}
            className="flex-1"
            size="lg"
            autoFocus
          >
            <Check className="w-5 h-5 mr-2" />
            Sí, buscaba ese personaje
          </Button>

          <Button
            onClick={onShowMore}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            No, muéstrame más opciones
          </Button>
        </div>

        {/* Keyboard hint */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <span>
            Presiona <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">Enter</kbd> para confirmar o{' '}
            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">Esc</kbd> para cerrar
          </span>
        </div>
      </div>
    </AccessibleModal>
  );
}
