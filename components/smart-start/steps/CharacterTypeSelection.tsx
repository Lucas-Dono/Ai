'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSmartStart } from '../context/SmartStartContext';
import { useTranslations } from 'next-intl';
import { useKeyboardShortcuts, commonShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp, useKeyboardShortcutsHelp } from '../ui/accessible/KeyboardShortcutsHelp';
import { focusVisibleClasses } from '@/lib/utils/focus';

export function CharacterTypeSelection() {
  const { selectCharacterType, isLoading } = useSmartStart();
  const t = useTranslations('smartStart.characterType');
  const tCommon = useTranslations('smartStart.common');
  const [selected, setSelected] = useState<'existing' | 'original' | null>('existing');

  // Help overlay
  const helpOverlay = useKeyboardShortcutsHelp();

  const handleContinue = useCallback(async () => {
    if (!selected) return;
    await selectCharacterType(selected);
  }, [selected, selectCharacterType]);

  // Global keyboard shortcuts
  useKeyboardShortcuts(
    [
      commonShortcuts.help(helpOverlay.toggle),
      commonShortcuts.submit(() => {
        if (selected && !isLoading) {
          handleContinue();
        }
      }),
    ],
    { enabled: true }
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation(); // Prevent global handler from triggering
          setSelected('existing');
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation(); // Prevent global handler from triggering
          setSelected('original');
          break;
        case 'Enter':
          e.preventDefault();
          if (selected) {
            handleContinue();
          }
          break;
        case '1':
          e.preventDefault();
          setSelected('existing');
          break;
        case '2':
          e.preventDefault();
          setSelected('original');
          break;
      }
    };

    // Use capture phase to handle event before global handler
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [selected, handleContinue]);

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

      {/* Type Options */}
      <div className="grid md:grid-cols-2 gap-6">
        <TypeOption
          type="existing"
          icon={Search}
          title={t('existing.title')}
          description={t('existing.description')}
          selected={selected === 'existing'}
          onSelect={() => setSelected('existing')}
        />

        <TypeOption
          type="original"
          icon={Sparkles}
          title={t('original.title')}
          description={t('original.description')}
          selected={selected === 'original'}
          onSelect={() => setSelected('original')}
        />
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <Button
          size="lg"
          disabled={!selected || isLoading}
          onClick={handleContinue}
        >
          {isLoading ? tCommon('loading') : tCommon('next')}
        </Button>
      </div>

      {/* Keyboard hints */}
      <div className="flex justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">←</kbd>
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">→</kbd>
          <span>Navegar</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">Enter</kbd>
          <span>Continuar</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">1-2</kbd>
          <span>Acceso rápido</span>
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

interface TypeOptionProps {
  type: 'existing' | 'original';
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

function TypeOption({ type, icon: Icon, title, description, selected, onSelect }: TypeOptionProps) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
      className={cn(
        'relative p-6 rounded-xl border-2 transition-all text-left',
        'hover:border-primary/50 hover:shadow-md',
        focusVisibleClasses.primary,
        selected
          ? 'border-primary bg-primary/5'
          : 'border-gray-200 dark:border-gray-800'
      )}
      role="radio"
      aria-checked={selected}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
          'bg-gradient-to-br transition-colors',
          selected
            ? 'from-primary/20 to-primary/30'
            : 'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700'
        )}
      >
        <Icon
          className={cn(
            'w-6 h-6',
            selected ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
          )}
        />
      </div>

      {/* Title */}
      <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>

      {/* Selection indicator */}
      {selected && (
        <motion.div
          layoutId="type-selection"
          className="absolute inset-0 rounded-xl ring-2 ring-primary pointer-events-none"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
  );
}
