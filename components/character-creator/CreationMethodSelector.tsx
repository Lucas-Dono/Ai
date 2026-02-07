'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export function CreationMethodSelector() {
  const t = useTranslations('characterCreator');
  const router = useRouter();
  const [selected, setSelected] = useState<'smart' | 'manual' | null>('smart');

  const handleContinue = useCallback(() => {
    if (selected === 'smart') {
      router.push('/create-character?mode=smart-start');
    } else {
      router.push('/create-character?mode=manual');
    }
  }, [selected, router]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          setSelected('smart');
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          setSelected('manual');
          break;
        case 'Enter':
          e.preventDefault();
          if (selected) {
            handleContinue();
          }
          break;
        case '1':
          e.preventDefault();
          setSelected('smart');
          break;
        case '2':
          e.preventDefault();
          setSelected('manual');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, handleContinue]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('methodSelector.title')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('methodSelector.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <MethodCard
            type="smart"
            icon={Sparkles}
            title={t('methodSelector.smartStart.title')}
            description={t('methodSelector.smartStart.description')}
            badge={t('methodSelector.smartStart.badge')}
            features={[
              t('methodSelector.smartStart.feature1'),
              t('methodSelector.smartStart.feature2'),
              t('methodSelector.smartStart.feature3'),
              t('methodSelector.smartStart.feature4'),
            ]}
            selected={selected === 'smart'}
            onSelect={() => setSelected('smart')}
          />

          <MethodCard
            type="manual"
            icon={Settings}
            title={t('methodSelector.manual.title')}
            description={t('methodSelector.manual.description')}
            features={[
              t('methodSelector.manual.feature1'),
              t('methodSelector.manual.feature2'),
              t('methodSelector.manual.feature3'),
            ]}
            selected={selected === 'manual'}
            onSelect={() => setSelected('manual')}
          />
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            disabled={!selected}
            onClick={handleContinue}
            className="min-w-[200px]"
          >
            {t('methodSelector.continue')}
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
            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">1</kbd>
            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">2</kbd>
            <span>Acceso rápido</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MethodCardProps {
  type: 'smart' | 'manual';
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
  features: string[];
  selected: boolean;
  onSelect: () => void;
}

function MethodCard({
  type,
  icon: Icon,
  title,
  description,
  badge,
  features,
  selected,
  onSelect,
}: MethodCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      tabIndex={0}
      aria-label={`${title}: ${description}`}
      aria-pressed={selected}
      className={cn(
        "relative p-6 rounded-xl border-2 transition-all text-left",
        "hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        selected
          ? "border-primary bg-primary/5"
          : "border-gray-200 dark:border-gray-800"
      )}
    >
      {badge && (
        <div className="absolute top-4 right-4">
          <span className="px-2 py-1 text-xs font-semibold bg-primary text-white rounded-full">
            {badge}
          </span>
        </div>
      )}

      <div className={cn(
        "w-14 h-14 rounded-lg flex items-center justify-center mb-4",
        "bg-gradient-to-br",
        selected
          ? "from-primary/20 to-primary/30"
          : "from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700"
      )}>
        <Icon className={cn(
          "w-7 h-7",
          selected ? "text-primary" : "text-gray-600 dark:text-gray-400"
        )} />
      </div>

      <h3 className="font-bold text-xl mb-2">
        {title}
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {description}
      </p>

      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="text-primary mt-0.5">✓</span>
            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      {selected && (
        <motion.div
          layoutId="method-selection"
          className="absolute inset-0 rounded-xl ring-2 ring-primary pointer-events-none"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
  );
}
