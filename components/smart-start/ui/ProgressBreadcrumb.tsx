'use client';

import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SmartStartStep } from '@/lib/smart-start/core/types';
import { useTranslations } from 'next-intl';

interface ProgressBreadcrumbProps {
  currentStep: SmartStartStep;
}

interface BreadcrumbStep {
  id: SmartStartStep;
  labelKey: string;
  order: number;
}

// New flow: type -> search (if existing) -> customize -> review
// 'genre' is optional (only accessed when user wants to change genre)
const BREADCRUMB_STEPS: BreadcrumbStep[] = [
  { id: 'type', labelKey: 'type', order: 0 },
  { id: 'search', labelKey: 'search', order: 1 },
  { id: 'customize', labelKey: 'customize', order: 2 },
  { id: 'review', labelKey: 'review', order: 3 },
  // Optional steps (shown only when active)
  { id: 'genre', labelKey: 'genre', order: -1 },
];

export function ProgressBreadcrumb({ currentStep }: ProgressBreadcrumbProps) {
  const t = useTranslations('smartStart.progress');
  const currentOrder = BREADCRUMB_STEPS.find(s => s.id === currentStep)?.order ?? 0;

  // Filter out optional steps unless they're currently active
  const visibleSteps = BREADCRUMB_STEPS.filter(step => {
    if (step.order === -1) return step.id === currentStep; // Show optional steps only when active
    return true;
  });

  return (
    <nav aria-label="Progress" className="py-4">
      <ol className="flex items-center gap-2 flex-wrap">
        {visibleSteps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.order < currentOrder;
          const isClickable = step.order < currentOrder;

          return (
            <li key={step.id} className="flex items-center gap-2">
              <button
                disabled={!isClickable}
                className={cn(
                  'text-sm font-medium transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md px-2 py-1',
                  isActive && 'text-gray-900 dark:text-gray-100',
                  isCompleted && 'text-primary hover:text-primary/80 cursor-pointer',
                  !isActive && !isCompleted && 'text-gray-400 dark:text-gray-600 cursor-default'
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {t(step.labelKey as any)}
              </button>

              {index < visibleSteps.length - 1 && (
                <ChevronRight
                  className={cn(
                    'w-4 h-4',
                    isCompleted ? 'text-gray-400' : 'text-gray-300 dark:text-gray-700'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
