'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Heart,
  BookOpen,
  Brain,
  Users,
  CheckCircle2,
  Circle,
  Sparkles,
  Eye,
} from 'lucide-react';
import type { WizardStep, WizardStepConfig } from '@/types/character-wizard';
import { WIZARD_STEPS } from '@/types/character-wizard';

/**
 * ProgressIndicator - Revolutionary step indicator inspired by Linear's navigation
 *
 * Design Philosophy:
 * - Vertical layout that feels like a journey
 * - Each step is a "waypoint" in the character creation story
 * - Animated connections that flow like neural pathways
 * - Subtle glow effects to guide attention
 * - NO boring horizontal circles
 *
 * Visual Inspiration: Linear's sidebar, Arc's tab design, Stripe's checkout flow
 */

interface ProgressIndicatorProps {
  currentStep: WizardStep;
  completedSteps: Set<WizardStep>;
  onStepClick: (step: WizardStep) => void;
  className?: string;
}

// Use the centralized WIZARD_STEPS config with custom descriptions for the sidebar
const STEP_CONFIGS: WizardStepConfig[] = WIZARD_STEPS.map(step => ({
  ...step,
  // Custom shorter descriptions for the progress sidebar
  description: {
    basics: 'Identity & location',
    personality: 'Character & traits',
    appearance: 'Physical appearance',
    background: 'History & story',
    psychology: 'Mind & emotions',
    relationships: 'People & events',
    review: 'Finalize & create',
  }[step.id] || step.description,
}));

const ICON_MAP = {
  User,
  Heart,
  Eye,
  Book: BookOpen,
  BookOpen,
  Brain,
  Users,
  Sparkles,
  CheckCircle: CheckCircle2,
};

export function ProgressIndicator({
  currentStep,
  completedSteps,
  onStepClick,
  className = '',
}: ProgressIndicatorProps) {
  const currentIndex = STEP_CONFIGS.findIndex((s) => s.id === currentStep);

  return (
    <div className={`relative ${className}`}>
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-primary-400/5 via-brand-secondary-500/5 to-transparent blur-3xl pointer-events-none" />

      <nav
        className="relative space-y-2"
        aria-label="Character creation progress"
      >
        {STEP_CONFIGS.map((step, index) => {
          const Icon = ICON_MAP[step.icon as keyof typeof ICON_MAP];
          const isCompleted = completedSteps.has(step.id);
          const isCurrent = step.id === currentStep;
          const isPast = index < currentIndex;
          const isFuture = index > currentIndex;
          const isClickable = isCompleted || isPast || isCurrent;

          return (
            <div key={step.id} className="relative">
              {/* Connection line to next step */}
              {index < STEP_CONFIGS.length - 1 && (
                <motion.div
                  className="absolute left-[23px] top-12 w-0.5 h-8"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: isPast || isCurrent ? 32 : 32,
                    opacity: isPast || isCurrent ? 1 : 0.2,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: isPast ? 0 : 0.2,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  {/* Gradient line that "flows" when active */}
                  <div
                    className={`w-full h-full rounded-full transition-colors duration-500 ${
                      isPast
                        ? 'bg-gradient-to-b from-brand-primary-400 to-brand-secondary-500'
                        : isCurrent
                        ? 'bg-gradient-to-b from-brand-primary-400/60 to-brand-secondary-500/40'
                        : 'bg-gradient-to-b from-border to-border'
                    }`}
                  />

                  {/* Animated pulse for current connection */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-b from-brand-primary-400 to-brand-secondary-500 rounded-full"
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{
                        opacity: [0.5, 0, 0.5],
                        scaleY: [0, 1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                </motion.div>
              )}

              {/* Step button */}
              <motion.button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={`
                  relative w-full flex items-center gap-4 p-3 rounded-2xl
                  transition-all duration-300 ease-out
                  ${
                    isCurrent
                      ? 'bg-gradient-to-r from-brand-primary-400/10 to-brand-secondary-500/10 border-l-2 border-brand-primary-400'
                      : 'hover:bg-muted/50'
                  }
                  ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                  ${!isFuture ? 'hover:bg-muted/80' : ''}
                `}
                whileHover={isClickable ? { x: 4 } : {}}
                whileTap={isClickable ? { scale: 0.98 } : {}}
                aria-current={isCurrent ? 'step' : undefined}
                aria-disabled={!isClickable}
              >
                {/* Icon container */}
                <motion.div
                  className={`
                    relative flex items-center justify-center w-12 h-12 rounded-xl
                    ${
                      isCurrent
                        ? 'bg-gradient-to-br from-brand-primary-400 to-brand-secondary-500 text-white shadow-lg shadow-brand-primary-400/30'
                        : isCompleted
                        ? 'bg-gradient-to-br from-brand-primary-400/80 to-brand-secondary-500/80 text-white'
                        : 'bg-muted text-muted-foreground'
                    }
                  `}
                  animate={{
                    scale: isCurrent ? [1, 1.05, 1] : 1,
                  }}
                  transition={{
                    duration: 2,
                    repeat: isCurrent ? Infinity : 0,
                    ease: 'easeInOut',
                  }}
                >
                  {/* Completion checkmark */}
                  {isCompleted && !isCurrent ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 15,
                      }}
                    >
                      <CheckCircle2 className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}

                  {/* Glow effect for current step */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-primary-400 to-brand-secondary-500 blur-xl"
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                </motion.div>

                {/* Step text */}
                <div className="flex-1 text-left">
                  <motion.div
                    className={`
                      font-semibold text-sm
                      ${
                        isCurrent
                          ? 'text-foreground'
                          : isCompleted || isPast
                          ? 'text-foreground/90'
                          : 'text-muted-foreground'
                      }
                    `}
                    animate={{
                      x: isCurrent ? [0, 2, 0] : 0,
                    }}
                    transition={{
                      duration: 2,
                      repeat: isCurrent ? Infinity : 0,
                      ease: 'easeInOut',
                    }}
                  >
                    {step.label}
                  </motion.div>
                  <div
                    className={`
                      text-xs
                      ${
                        isCurrent
                          ? 'text-muted-foreground'
                          : 'text-muted-foreground/70'
                      }
                    `}
                  >
                    {step.description}
                  </div>
                </div>

                {/* Future step indicator */}
                {isFuture && !isCompleted && (
                  <Circle className="w-4 h-4 text-muted-foreground/30" />
                )}
              </motion.button>
            </div>
          );
        })}
      </nav>

      {/* Completion percentage */}
      <motion.div
        className="mt-8 pt-6 border-t border-border"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Progress
          </span>
          <span className="text-sm font-semibold text-foreground">
            {Math.round((completedSteps.size / STEP_CONFIGS.length) * 100)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-primary-400 to-brand-secondary-500 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${(completedSteps.size / STEP_CONFIGS.length) * 100}%`,
            }}
            transition={{
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1],
            }}
          />

          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 1,
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
