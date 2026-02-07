'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * StepContainer - Generic wrapper for wizard steps
 *
 * Handles:
 * - Smooth enter/exit animations
 * - Loading states with skeleton
 * - Error states with retry
 * - Consistent spacing and layout
 * - Accessibility (ARIA attributes)
 *
 * Design: Clean, spacious, lets content breathe
 */

interface StepContainerProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  className?: string;
}

export function StepContainer({
  children,
  title,
  description,
  isLoading = false,
  error,
  onRetry,
  className = '',
}: StepContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className={`w-full max-w-3xl mx-auto ${className}`}
    >
      {/* Header */}
      <div className="mb-8 space-y-2">
        <motion.h2
          className="text-3xl font-bold tracking-tight"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {title}
        </motion.h2>

        {description && (
          <motion.p
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {description}
          </motion.p>
        )}
      </div>

      {/* Error state */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <Alert variant="destructive" className="border-destructive/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="ml-4 text-sm font-medium underline underline-offset-4 hover:no-underline"
                  >
                    Retry
                  </button>
                )}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <LoadingSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * LoadingSkeleton - Beautiful loading state
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Large skeleton */}
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded-lg animate-pulse w-24" />
        <div className="h-12 bg-muted rounded-xl animate-pulse" />
      </div>

      {/* Medium skeletons */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded-lg animate-pulse w-20" />
          <div className="h-12 bg-muted rounded-xl animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded-lg animate-pulse w-20" />
          <div className="h-12 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Shimmer effect overlay */}
      <div className="relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Loading indicator */}
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary-400" />
      </div>
    </div>
  );
}

/**
 * StepSection - Subsection within a step
 * Use this to organize complex steps into logical groups
 */
interface StepSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function StepSection({
  title,
  description,
  children,
  className = '',
}: StepSectionProps) {
  return (
    <section className={`space-y-4 ${className}`}>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
