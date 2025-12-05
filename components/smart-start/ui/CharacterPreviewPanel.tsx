'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { CharacterPreview } from './CharacterPreview';
import { useSmartStart } from '../context/SmartStartContext';
import { cn } from '@/lib/utils';

export function CharacterPreviewPanel() {
  const t = useTranslations('smartStart.characterPreview');
  const { characterDraft, currentStep } = useSmartStart();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Don't show on genre/type selection steps
  const shouldShow = currentStep !== 'genre' && currentStep !== 'type';

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block fixed right-8 top-24 w-80 max-h-[calc(100vh-7rem)] overflow-y-auto">
        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('header')}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {t('subtitle')}
            </p>
          </div>
          <CharacterPreview draft={characterDraft} />
        </div>
      </aside>

      {/* Mobile Bottom Sheet */}
      <div className="lg:hidden">
        {/* Trigger Button */}
        <motion.button
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={() => setIsMobileOpen(true)}
          className={cn(
            'fixed bottom-6 right-6 z-40',
            'px-4 py-2 rounded-full shadow-lg',
            'bg-primary text-primary-foreground',
            'hover:bg-primary/90 transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
          )}
        >
          {t('mobileButton')}
        </motion.button>

        {/* Bottom Sheet */}
        <AnimatePresence>
          {isMobileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileOpen(false)}
                className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              />

              {/* Sheet */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
              >
                <div className="bg-white dark:bg-gray-900 rounded-t-2xl shadow-xl max-h-[80vh] overflow-y-auto">
                  {/* Header */}
                  <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          {t('mobileTitle')}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('mobileSubtitle')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMobileOpen(false)}
                        className="flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-6 py-6">
                    <CharacterPreview draft={characterDraft} />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
