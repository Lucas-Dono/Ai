'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import {
  FEELING_OPTIONS,
  POWER_DYNAMICS,
  type FeelingType,
  type PowerDynamic,
  type FeelingOption,
  type PowerDynamicOption,
} from '@/types/god-mode';

interface FeelingsSelectorProps {
  feeling: FeelingType;
  intensity: number;
  powerDynamic: PowerDynamic;
  onFeelingChange: (feeling: FeelingType) => void;
  onIntensityChange: (intensity: number) => void;
  onDynamicChange: (dynamic: PowerDynamic) => void;
  characterName: string;
  locale?: 'en' | 'es';
  disabled?: boolean;
}

export function FeelingsSelector({
  feeling,
  intensity,
  powerDynamic,
  onFeelingChange,
  onIntensityChange,
  onDynamicChange,
  characterName,
  locale = 'en',
  disabled = false,
}: FeelingsSelectorProps) {
  const t = {
    feelingsTitle:
      locale === 'es'
        ? `Cómo se siente ${characterName} hacia ti`
        : `How ${characterName} feels about you`,
    feelingsSubtitle:
      locale === 'es'
        ? 'Define sus sentimientos iniciales'
        : 'Define their initial feelings',
    intensity: locale === 'es' ? 'Intensidad' : 'Intensity',
    dynamicsTitle: locale === 'es' ? 'Dinámica de poder' : 'Power Dynamic',
    dynamicsSubtitle:
      locale === 'es'
        ? 'El balance en la relación'
        : 'The balance in the relationship',
  };

  const selectedFeeling = FEELING_OPTIONS.find((f) => f.id === feeling);
  const effectiveIntensity = intensity || selectedFeeling?.intensity || 0;

  return (
    <div className="space-y-8">
      {/* Feelings Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{t.feelingsTitle}</h3>
          <p className="text-sm text-muted-foreground">{t.feelingsSubtitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {FEELING_OPTIONS.map((option: FeelingOption, index: number) => {
            const isSelected = feeling === option.id;
            const label = locale === 'es' ? option.labelEs : option.label;
            const description = locale === 'es' ? option.descriptionEs : option.description;

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => !disabled && onFeelingChange(option.id)}
                disabled={disabled}
                className={cn(
                  'p-3 rounded-lg border-2 text-left transition-all',
                  'hover:border-pink-300 hover:bg-pink-50/50 dark:hover:bg-pink-900/20',
                  isSelected
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 shadow-md'
                    : 'border-muted',
                  disabled && 'opacity-50 cursor-not-allowed hover:border-muted hover:bg-transparent'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{option.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block">{label}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {description}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Intensity Slider */}
        {feeling !== 'neutral' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3 pt-2"
          >
            <div className="flex items-center justify-between">
              <Label className="text-sm">{t.intensity}</Label>
              <span className="text-sm font-medium text-pink-600 dark:text-pink-400">
                {Math.round(effectiveIntensity * 100)}%
              </span>
            </div>
            <Slider
              value={[effectiveIntensity]}
              onValueChange={([v]) => onIntensityChange(v)}
              min={0}
              max={1}
              step={0.05}
              disabled={disabled}
              className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-pink-500 [&_[role=slider]]:to-red-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{locale === 'es' ? 'Sutil' : 'Subtle'}</span>
              <span>{locale === 'es' ? 'Intenso' : 'Intense'}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Power Dynamics Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{t.dynamicsTitle}</h3>
          <p className="text-sm text-muted-foreground">{t.dynamicsSubtitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {POWER_DYNAMICS.map((option: PowerDynamicOption, index: number) => {
            const isSelected = powerDynamic === option.id;
            const label = locale === 'es' ? option.labelEs : option.label;
            const description = locale === 'es' ? option.descriptionEs : option.description;

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => !disabled && onDynamicChange(option.id)}
                disabled={disabled}
                className={cn(
                  'p-3 rounded-lg border-2 text-left transition-all',
                  'hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-900/20',
                  isSelected
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 shadow-md'
                    : 'border-muted',
                  disabled && 'opacity-50 cursor-not-allowed hover:border-muted hover:bg-transparent'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{option.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block">{label}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {description}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
