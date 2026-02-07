'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Globe, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * VisibilitySelector - Selector de visibilidad para personajes
 *
 * Permite elegir si un personaje será:
 * - private: Solo visible para el creador
 * - public: Visible en comunidad/marketplace
 *
 * IMPORTANTE: Contenido NSFW (suggestive, explicit, unrestricted)
 * debe ser siempre privado.
 */

export interface VisibilitySelectorProps {
  value: 'private' | 'public';
  onChange: (value: 'private' | 'public') => void;
  disabled?: boolean;
  nsfwMode?: boolean;
  className?: string;
}

interface VisibilityOption {
  value: 'private' | 'public';
  label: string;
  labelEs: string;
  description: string;
  descriptionEs: string;
  icon: React.ReactNode;
}

const VISIBILITY_OPTIONS: VisibilityOption[] = [
  {
    value: 'private',
    label: 'Private',
    labelEs: 'Privado',
    description: 'Only you can see and chat with this character',
    descriptionEs: 'Solo tú puedes ver y chatear con este personaje',
    icon: <Lock className="w-5 h-5" />,
  },
  {
    value: 'public',
    label: 'Public',
    labelEs: 'Público',
    description: 'Anyone can discover this character in the community',
    descriptionEs: 'Cualquiera puede descubrir este personaje en la comunidad',
    icon: <Globe className="w-5 h-5" />,
  },
];

export function VisibilitySelector({
  value,
  onChange,
  disabled = false,
  nsfwMode = false,
  className,
}: VisibilitySelectorProps) {
  // Si NSFW está activado, forzar a privado
  const effectiveValue = nsfwMode ? 'private' : value;
  const isPublicDisabled = disabled || nsfwMode;

  return (
    <div className={cn('space-y-3', className)}>
      <Label className="flex items-center gap-2 text-base">
        {effectiveValue === 'private' ? (
          <Lock className="w-4 h-4 text-brand-primary-400" />
        ) : (
          <Globe className="w-4 h-4 text-brand-primary-400" />
        )}
        Visibilidad del personaje
      </Label>

      <div className="grid grid-cols-2 gap-3">
        {VISIBILITY_OPTIONS.map((option) => {
          const isSelected = effectiveValue === option.value;
          const isDisabled = option.value === 'public' ? isPublicDisabled : disabled;

          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => !isDisabled && onChange(option.value)}
              disabled={isDisabled}
              className={cn(
                'relative p-4 rounded-xl border-2 text-left transition-all',
                'focus:outline-none focus:ring-2 focus:ring-brand-primary-400 focus:ring-offset-2',
                isSelected
                  ? 'border-brand-primary-400 bg-brand-primary-400/10'
                  : 'border-border bg-card hover:border-brand-primary-400/50 hover:bg-card/80',
                isDisabled && 'opacity-50 cursor-not-allowed hover:border-border hover:bg-card'
              )}
              whileHover={!isDisabled ? { scale: 1.02 } : undefined}
              whileTap={!isDisabled ? { scale: 0.98 } : undefined}
            >
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  className="absolute top-2 right-2 w-3 h-3 rounded-full bg-brand-primary-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'p-2 rounded-lg',
                    isSelected
                      ? 'bg-brand-primary-400 text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {option.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      'font-semibold',
                      isSelected ? 'text-brand-primary-400' : 'text-foreground'
                    )}
                  >
                    {option.labelEs}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {option.descriptionEs}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* NSFW Warning */}
      {nsfwMode && (
        <motion.div
          className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-orange-600 dark:text-orange-400">
            Los personajes con contenido NSFW solo pueden ser privados para cumplir con las políticas de la comunidad.
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default VisibilitySelector;
