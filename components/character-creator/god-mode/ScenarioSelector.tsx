'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  STARTING_SCENARIOS,
  type ScenarioId,
  type StartingScenario,
} from '@/types/god-mode';

interface ScenarioSelectorProps {
  scenario: ScenarioId;
  customScenario?: string;
  onScenarioChange: (scenario: ScenarioId) => void;
  onCustomScenarioChange: (customScenario: string) => void;
  locale?: 'en' | 'es';
  disabled?: boolean;
}

export function ScenarioSelector({
  scenario,
  customScenario,
  onScenarioChange,
  onCustomScenarioChange,
  locale = 'en',
  disabled = false,
}: ScenarioSelectorProps) {
  const t = {
    title: locale === 'es' ? 'Escenario de Inicio' : 'Starting Scenario',
    subtitle:
      locale === 'es'
        ? 'Elige la situación donde comienza todo'
        : 'Choose the situation where it all begins',
    viral: locale === 'es' ? 'Popular' : 'Trending',
    nsfw: '+18',
    customPlaceholder:
      locale === 'es'
        ? 'Describe tu escenario personalizado... ¿Dónde están? ¿Qué está pasando? ¿Cuál es la tensión?'
        : 'Describe your custom scenario... Where are you? What is happening? What is the tension?',
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{t.title}</h3>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {STARTING_SCENARIOS.map((sc: StartingScenario, index: number) => {
          const isSelected = scenario === sc.id;
          const label = locale === 'es' ? sc.labelEs : sc.label;
          const description = locale === 'es' ? sc.descriptionEs : sc.description;

          return (
            <motion.button
              key={sc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => !disabled && onScenarioChange(sc.id)}
              disabled={disabled}
              className={cn(
                'relative p-4 rounded-xl border-2 text-left transition-all',
                'hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/20',
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                  : 'border-muted',
                disabled && 'opacity-50 cursor-not-allowed hover:border-muted hover:bg-transparent'
              )}
            >
              {/* Badges */}
              <div className="absolute top-2 right-2 flex gap-1">
                {sc.viral && (
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-orange-400 to-pink-500 text-white border-0 text-xs px-1.5"
                  >
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    {t.viral}
                  </Badge>
                )}
                {sc.nsfw && (
                  <Badge variant="destructive" className="text-xs px-1.5">
                    {t.nsfw}
                  </Badge>
                )}
              </div>

              <div className="flex items-start gap-3 pr-16">
                <span className="text-2xl">{sc.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium block">{label}</span>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {description}
                  </p>
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  layoutId="scenario-selected"
                  className="absolute -top-1 -left-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Custom scenario input */}
      {scenario === 'custom' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2 pt-2"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>{locale === 'es' ? 'Tu escenario personalizado' : 'Your custom scenario'}</span>
          </div>
          <Textarea
            value={customScenario || ''}
            onChange={(e) => onCustomScenarioChange(e.target.value)}
            placeholder={t.customPlaceholder}
            rows={4}
            className="resize-none"
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            {locale === 'es'
              ? 'Sé específico sobre el lugar, la situación y la tensión entre ustedes.'
              : 'Be specific about the place, situation, and tension between you.'}
          </p>
        </motion.div>
      )}
    </div>
  );
}
