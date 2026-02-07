'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  RELATIONSHIP_TIERS,
  type InitialRelationshipTier,
  type RelationshipTierOption,
} from '@/types/god-mode';

interface RelationshipSelectorProps {
  value: InitialRelationshipTier;
  onChange: (value: InitialRelationshipTier) => void;
  characterName: string;
  locale?: 'en' | 'es';
  disabled?: boolean;
}

export function RelationshipSelector({
  value,
  onChange,
  characterName,
  locale = 'en',
  disabled = false,
}: RelationshipSelectorProps) {
  const t = {
    title:
      locale === 'es'
        ? `Tu relación con ${characterName}`
        : `Your relationship with ${characterName}`,
    subtitle:
      locale === 'es'
        ? 'Elige cómo quieres empezar'
        : 'Choose how you want to start',
    nsfw: locale === 'es' ? '+18' : '18+',
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{t.title}</h3>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {RELATIONSHIP_TIERS.map((tier: RelationshipTierOption, index: number) => {
          const isSelected = value === tier.id;
          const label = locale === 'es' ? tier.labelEs : tier.label;
          const description = locale === 'es' ? tier.descriptionEs : tier.description;

          return (
            <motion.button
              key={tier.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => !disabled && onChange(tier.id)}
              disabled={disabled}
              className={cn(
                'relative p-4 rounded-xl border-2 text-left transition-all',
                'hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/20',
                isSelected
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-md'
                  : 'border-muted',
                disabled && 'opacity-50 cursor-not-allowed hover:border-muted hover:bg-transparent'
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{tier.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{label}</span>
                    {tier.nsfw && (
                      <Badge variant="destructive" className="text-xs px-1.5 py-0">
                        {t.nsfw}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {description}
                  </p>
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  layoutId="relationship-selected"
                  className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
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

              {/* Affinity preview */}
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${tier.initialAffinity}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {locale === 'es' ? 'Afinidad inicial' : 'Initial affinity'}: {tier.initialAffinity}%
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
