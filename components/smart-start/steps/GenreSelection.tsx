'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GenreCard } from '../ui/GenreCard';
import { useSmartStart } from '../context/SmartStartContext';
import type { Genre, SubGenre, Archetype } from '../context/SmartStartContext';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useKeyboardShortcuts, commonShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp, useKeyboardShortcutsHelp } from '../ui/accessible/KeyboardShortcutsHelp';
import { focusVisibleClasses } from '@/lib/utils/focus';

type FocusLevel = 'genre' | 'subgenre' | 'archetype' | 'button';

export function GenreSelection() {
  const { availableGenres, selectGenre, isLoading } = useSmartStart();
  const t = useTranslations('smartStart.genreSelection');
  const tCommon = useTranslations('smartStart.common');
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [selectedSubgenre, setSelectedSubgenre] = useState<SubGenre | null>(null);
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const [showSubgenres, setShowSubgenres] = useState(false);
  const [focusLevel, setFocusLevel] = useState<FocusLevel>('genre');
  const [genreIndex, setGenreIndex] = useState(0);
  const [subgenreIndex, setSubgenreIndex] = useState(0);
  const [archetypeIndex, setArchetypeIndex] = useState(0);

  // Help overlay
  const helpOverlay = useKeyboardShortcutsHelp();

  // Refs for auto-scroll
  const subgenresSectionRef = useRef<HTMLDivElement>(null);
  const archetypesSectionRef = useRef<HTMLDivElement>(null);
  const genreRefs = useRef<(HTMLDivElement | null)[]>([]);
  const subgenreRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const archetypeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  if (isLoading && availableGenres.length === 0) {
    return <GenreSelectionSkeleton />;
  }

  const handleGenreSelect = (genre: Genre) => {
    setSelectedGenre(genre);
    setSelectedSubgenre(null);
    setSelectedArchetype(null);
    setShowSubgenres(true);
  };

  const handleContinue = useCallback(async () => {
    if (!selectedGenre) return;
    await selectGenre(selectedGenre, selectedSubgenre || undefined, selectedArchetype || undefined);
  }, [selectedGenre, selectedSubgenre, selectedArchetype, selectGenre]);

  // Global keyboard shortcuts
  useKeyboardShortcuts(
    [
      commonShortcuts.help(helpOverlay.toggle),
      commonShortcuts.submit(() => {
        if (selectedGenre && !isLoading) {
          handleContinue();
        }
      }),
    ],
    { enabled: true }
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      const currentGenres = availableGenres;
      const currentSubgenres = selectedGenre?.subGenres || [];
      const currentArchetypes = selectedSubgenre?.archetypes || [];

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (focusLevel === 'genre') {
            if (genreIndex === 0) {
              // Already at first, do nothing
            } else {
              setGenreIndex(prev => prev - 1);
            }
          } else if (focusLevel === 'subgenre') {
            if (subgenreIndex === 0) {
              // Move to genres
              setFocusLevel('genre');
              setGenreIndex(Math.min(genreIndex, currentGenres.length - 1));
            } else {
              setSubgenreIndex(prev => prev - 1);
            }
          } else if (focusLevel === 'archetype') {
            if (archetypeIndex === 0) {
              // Move to subgenres
              setFocusLevel('subgenre');
              setSubgenreIndex(Math.min(subgenreIndex, currentSubgenres.length - 1));
            } else {
              setArchetypeIndex(prev => prev - 1);
            }
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (focusLevel === 'genre') {
            if (genreIndex === currentGenres.length - 1) {
              // Move to subgenres if available
              if (selectedGenre && currentSubgenres.length > 0) {
                setFocusLevel('subgenre');
                setSubgenreIndex(0);
              }
            } else {
              setGenreIndex(prev => prev + 1);
            }
          } else if (focusLevel === 'subgenre') {
            if (subgenreIndex === currentSubgenres.length - 1) {
              // Move to archetypes if available
              if (selectedSubgenre && currentArchetypes.length > 0) {
                setFocusLevel('archetype');
                setArchetypeIndex(0);
              }
            } else {
              setSubgenreIndex(prev => prev + 1);
            }
          } else if (focusLevel === 'archetype') {
            if (archetypeIndex === currentArchetypes.length - 1) {
              // Move to button if available
              if (selectedGenre) {
                setFocusLevel('button');
              }
            } else {
              setArchetypeIndex(prev => prev + 1);
            }
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (focusLevel === 'genre') {
            if (genreIndex < 3) {
              // In first row, do nothing
            } else {
              setGenreIndex(prev => prev - 3);
            }
          } else if (focusLevel === 'subgenre') {
            if (subgenreIndex < 2) {
              // In first row, move to genres
              setFocusLevel('genre');
              setGenreIndex(Math.min(genreIndex, currentGenres.length - 1));
            } else {
              setSubgenreIndex(prev => prev - 2);
            }
          } else if (focusLevel === 'archetype') {
            if (archetypeIndex < 3) {
              // In first row, move to subgenres
              setFocusLevel('subgenre');
              setSubgenreIndex(Math.min(subgenreIndex, currentSubgenres.length - 1));
            } else {
              setArchetypeIndex(prev => prev - 3);
            }
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (focusLevel === 'genre') {
            const newGenreIndex = genreIndex + 3;
            if (newGenreIndex >= currentGenres.length) {
              // Would go past last, move to subgenres if available
              if (selectedGenre && currentSubgenres.length > 0) {
                setFocusLevel('subgenre');
                setSubgenreIndex(0);
              }
            } else {
              setGenreIndex(newGenreIndex);
            }
          } else if (focusLevel === 'subgenre') {
            const newSubgenreIndex = subgenreIndex + 2;
            if (newSubgenreIndex >= currentSubgenres.length) {
              // Would go past last, move to archetypes if available
              if (selectedSubgenre && currentArchetypes.length > 0) {
                setFocusLevel('archetype');
                setArchetypeIndex(0);
              } else if (selectedGenre) {
                // No archetypes, move to button
                setFocusLevel('button');
              }
            } else {
              setSubgenreIndex(newSubgenreIndex);
            }
          } else if (focusLevel === 'archetype') {
            const newArchetypeIndex = archetypeIndex + 3;
            if (newArchetypeIndex >= currentArchetypes.length) {
              // Would go past last, move to button if available
              if (selectedGenre) {
                setFocusLevel('button');
              }
            } else {
              setArchetypeIndex(newArchetypeIndex);
            }
          } else if (focusLevel === 'button') {
            // Do nothing, already at button
          }
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusLevel === 'genre' && currentGenres[genreIndex]) {
            handleGenreSelect(currentGenres[genreIndex]);
            setFocusLevel('subgenre');
            setSubgenreIndex(0);
          } else if (focusLevel === 'subgenre' && currentSubgenres[subgenreIndex]) {
            setSelectedSubgenre(currentSubgenres[subgenreIndex]);
            setSelectedArchetype(null);
            if (currentSubgenres[subgenreIndex].archetypes.length > 0) {
              setFocusLevel('archetype');
              setArchetypeIndex(0);
            } else {
              setFocusLevel('button');
            }
          } else if (focusLevel === 'archetype' && currentArchetypes[archetypeIndex]) {
            setSelectedArchetype(currentArchetypes[archetypeIndex]);
            setFocusLevel('button');
          } else if (focusLevel === 'button' && selectedGenre) {
            handleContinue();
          }
          break;

        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            // Go back
            if (focusLevel === 'button') {
              if (currentArchetypes.length > 0) {
                setFocusLevel('archetype');
              } else if (currentSubgenres.length > 0) {
                setFocusLevel('subgenre');
              } else {
                setFocusLevel('genre');
              }
            } else if (focusLevel === 'archetype') {
              setFocusLevel('subgenre');
            } else if (focusLevel === 'subgenre') {
              setFocusLevel('genre');
            }
          } else {
            // Go forward
            if (focusLevel === 'genre' && selectedGenre && currentSubgenres.length > 0) {
              setFocusLevel('subgenre');
            } else if (focusLevel === 'subgenre' && selectedSubgenre && currentArchetypes.length > 0) {
              setFocusLevel('archetype');
            } else if ((focusLevel === 'archetype' && selectedArchetype) || (focusLevel === 'subgenre' && selectedSubgenre && currentArchetypes.length === 0)) {
              setFocusLevel('button');
            }
          }
          break;

        case 'Escape':
          e.preventDefault();
          setFocusLevel('genre');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusLevel, genreIndex, subgenreIndex, archetypeIndex, availableGenres, selectedGenre, selectedSubgenre, selectedArchetype, handleContinue]);

  // Auto-scroll to subgenres when they appear
  useEffect(() => {
    if (showSubgenres && subgenresSectionRef.current) {
      setTimeout(() => {
        subgenresSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      }, 350); // Delay to allow animation to complete
    }
  }, [showSubgenres]);

  // Auto-scroll to archetypes when they appear
  useEffect(() => {
    if (selectedSubgenre && archetypesSectionRef.current) {
      setTimeout(() => {
        archetypesSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      }, 350); // Delay to allow animation to complete
    }
  }, [selectedSubgenre]);

  // Auto-scroll to focused element during keyboard navigation
  useEffect(() => {
    const scrollToFocused = () => {
      let element: HTMLElement | null = null;

      if (focusLevel === 'genre' && genreRefs.current[genreIndex]) {
        element = genreRefs.current[genreIndex];
      } else if (focusLevel === 'subgenre' && subgenreRefs.current[subgenreIndex]) {
        element = subgenreRefs.current[subgenreIndex];
      } else if (focusLevel === 'archetype' && archetypeRefs.current[archetypeIndex]) {
        element = archetypeRefs.current[archetypeIndex];
      } else if (focusLevel === 'button' && continueButtonRef.current) {
        element = continueButtonRef.current;
      }

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }
    };

    // Small delay to ensure refs are updated
    const timer = setTimeout(scrollToFocused, 50);
    return () => clearTimeout(timer);
  }, [focusLevel, genreIndex, subgenreIndex, archetypeIndex]);

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

      {/* Genre Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {availableGenres.map((genre, idx) => (
          <div
            key={genre.id}
            ref={(el) => (genreRefs.current[idx] = el)}
            className={cn(
              'rounded-xl transition-all',
              focusLevel === 'genre' && idx === genreIndex && 'ring-2 ring-primary ring-offset-2'
            )}
          >
            <GenreCard
              genre={genre}
              selected={selectedGenre?.id === genre.id}
              onSelect={() => handleGenreSelect(genre)}
            />
          </div>
        ))}
      </motion.div>

      {/* Subgenre Selection */}
      {showSubgenres && selectedGenre && selectedGenre.subGenres.length > 0 && (
        <motion.div
          ref={subgenresSectionRef}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('showSubgenres')}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {t('selectArchetype')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedGenre.subGenres.map((subgenre, idx) => (
              <button
                key={subgenre.id}
                ref={(el) => (subgenreRefs.current[idx] = el)}
                onClick={() => {
                  setSelectedSubgenre(subgenre);
                  setSelectedArchetype(null);
                }}
                className={cn(
                  'p-4 rounded-lg border-2 text-left transition-all',
                  'hover:border-primary/50',
                  focusVisibleClasses.primary,
                  selectedSubgenre?.id === subgenre.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 dark:border-gray-800',
                  focusLevel === 'subgenre' && idx === subgenreIndex && 'ring-2 ring-primary ring-offset-2'
                )}
              >
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {subgenre.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subgenre.description}
                </p>
              </button>
            ))}
          </div>

          {/* Archetype Selection */}
          {selectedSubgenre && selectedSubgenre.archetypes.length > 0 && (
            <motion.div
              ref={archetypesSectionRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div>
                <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {t('selectArchetype')}
                </h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {t('selectArchetype')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {selectedSubgenre.archetypes.map((archetype, idx) => (
                  <button
                    key={archetype.id}
                    ref={(el) => (archetypeRefs.current[idx] = el)}
                    onClick={() => setSelectedArchetype(archetype)}
                    className={cn(
                      'p-3 rounded-lg border-2 text-left transition-all',
                      'hover:border-primary/50',
                      focusVisibleClasses.primary,
                      selectedArchetype?.id === archetype.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 dark:border-gray-800',
                      focusLevel === 'archetype' && idx === archetypeIndex && 'ring-2 ring-primary ring-offset-2'
                    )}
                  >
                    <h5 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-0.5">
                      {archetype.name}
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {archetype.description}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <Button
          ref={continueButtonRef}
          size="lg"
          disabled={!selectedGenre || isLoading}
          onClick={handleContinue}
          className={cn(
            focusLevel === 'button' && 'ring-2 ring-primary ring-offset-2'
          )}
        >
          {isLoading ? t('loading') : tCommon('next')}
        </Button>
      </div>

      {/* Keyboard hints */}
      <div className="flex justify-center gap-6 text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">←→↑↓</kbd>
          <span>Navegar</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">Enter</kbd>
          <span>Seleccionar</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">Tab</kbd>
          <span>Siguiente nivel</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">?</kbd>
          <span>Ayuda</span>
        </div>
      </div>

      {/* Help Overlay */}
      <KeyboardShortcutsHelp
        isOpen={helpOverlay.isOpen}
        onClose={helpOverlay.close}
      />
    </div>
  );
}

function GenreSelectionSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse" />
        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

