'use client';

import { X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSmartStart } from '../context/SmartStartContext';
import { useTranslations } from 'next-intl';

interface WizardHeaderProps {
  onSkip: () => void;
}

export function WizardHeader({ onSkip }: WizardHeaderProps) {
  const { currentStep, goBack } = useSmartStart();
  const t = useTranslations('smartStart');

  const showBackButton = currentStep !== 'genre';

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Back button or logo */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                aria-label={t('common.back')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back')}
              </Button>
            )}
            {!showBackButton && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">AI</span>
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {t('header.title')}
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('header.subtitle')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right side - Skip button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            aria-label={t('common.skip')}
          >
            {t('common.skip')}
            <X className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </header>
  );
}
