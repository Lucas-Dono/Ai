'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  NSFW_LEVELS,
  type NSFWLevel,
  type NSFWLevelOption,
} from '@/types/god-mode';

interface NSFWSettingsProps {
  level: NSFWLevel;
  onChange: (level: NSFWLevel) => void;
  locale?: 'en' | 'es';
  disabled?: boolean;
}

export function NSFWSettings({
  level,
  onChange,
  locale = 'en',
  disabled = false,
}: NSFWSettingsProps) {
  const t = {
    title: locale === 'es' ? 'Nivel de Contenido' : 'Content Level',
    subtitle:
      locale === 'es'
        ? 'Controla el tipo de contenido permitido'
        : 'Control the type of content allowed',
    privateOnly:
      locale === 'es'
        ? 'Solo disponible en modo privado'
        : 'Only available in private mode',
    warning:
      locale === 'es'
        ? 'Al seleccionar contenido explícito, confirmas que eres mayor de 18 años y aceptas que el contenido generado es para uso personal.'
        : 'By selecting explicit content, you confirm you are over 18 and accept that generated content is for personal use.',
    ageVerification:
      locale === 'es'
        ? 'Confirmo que soy mayor de 18 años'
        : 'I confirm I am over 18 years old',
  };

  // Gradient based on NSFW level
  const getGradient = (levelId: NSFWLevel) => {
    switch (levelId) {
      case 'sfw':
        return 'from-green-500 to-emerald-500';
      case 'romantic':
        return 'from-pink-400 to-rose-500';
      case 'suggestive':
        return 'from-orange-400 to-red-500';
      case 'explicit':
        return 'from-red-500 to-pink-600';
      case 'unrestricted':
        return 'from-purple-600 to-pink-600';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{t.title}</h3>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="space-y-3">
        {NSFW_LEVELS.map((option: NSFWLevelOption, index: number) => {
          const isSelected = level === option.id;
          const label = locale === 'es' ? option.labelEs : option.label;
          const description = locale === 'es' ? option.descriptionEs : option.description;
          const isLocked = option.requiresPrivate && disabled;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => !isLocked && onChange(option.id)}
              disabled={isLocked}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all',
                'hover:shadow-md',
                isSelected
                  ? 'border-transparent shadow-lg'
                  : 'border-muted hover:border-muted-foreground/30',
                isLocked && 'opacity-50 cursor-not-allowed'
              )}
              style={
                isSelected
                  ? {
                      background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                    }
                  : undefined
              }
            >
              <div className="flex items-center gap-4">
                {/* Icon with gradient background */}
                <div
                  className={cn(
                    'p-3 rounded-xl text-white',
                    isSelected ? 'bg-white/20' : `bg-gradient-to-br ${getGradient(option.id)}`
                  )}
                >
                  <span className="text-2xl">{option.icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'font-semibold',
                        isSelected ? 'text-white' : ''
                      )}
                    >
                      {label}
                    </span>
                    {option.requiresPrivate && (
                      <Lock
                        className={cn(
                          'w-4 h-4',
                          isSelected ? 'text-white/70' : 'text-muted-foreground'
                        )}
                      />
                    )}
                  </div>
                  <p
                    className={cn(
                      'text-sm mt-0.5',
                      isSelected ? 'text-white/80' : 'text-muted-foreground'
                    )}
                  >
                    {description}
                  </p>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
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
                  </div>
                )}
              </div>

              {/* Progress bar for intensity visualization */}
              {isSelected && (
                <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width:
                        option.id === 'sfw'
                          ? '20%'
                          : option.id === 'romantic'
                          ? '40%'
                          : option.id === 'suggestive'
                          ? '60%'
                          : option.id === 'explicit'
                          ? '80%'
                          : '100%',
                    }}
                    className="h-full bg-white/50"
                  />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Warning for explicit content */}
      {(level === 'explicit' || level === 'unrestricted') && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {t.warning}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Privacy notice */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <Shield className="w-4 h-4 flex-shrink-0" />
        <span>
          {locale === 'es'
            ? 'Tu contenido privado nunca se comparte y se procesa de forma segura.'
            : 'Your private content is never shared and is processed securely.'}
        </span>
      </div>
    </div>
  );
}
