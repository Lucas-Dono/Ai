'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ThumbsUp, ThumbsDown, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GenreDetectionResult } from '@/lib/smart-start/services/genre-detector';
import type { Genre } from '@/components/smart-start/context/SmartStartContext';

interface GenreDetectionBadgeProps {
  detectedGenre: GenreDetectionResult;
  selectedGenre: Genre | null;
  onFeedback?: (isCorrect: boolean) => void;
  onChangeGenre?: () => void;
  className?: string;
}

/**
 * GenreDetectionBadge - Shows auto-detected genre with feedback system
 * Displays confidence level and allows user to confirm/reject detection
 */
export function GenreDetectionBadge({
  detectedGenre,
  selectedGenre,
  onFeedback,
  onChangeGenre,
  className,
}: GenreDetectionBadgeProps) {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleFeedback = (isCorrect: boolean) => {
    setFeedbackGiven(true);
    onFeedback?.(isCorrect);

    // Auto-hide after animation
    setTimeout(() => setFeedbackGiven(false), 3000);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'Alta confianza';
    if (confidence >= 0.7) return 'Confianza media';
    return 'Baja confianza';
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" />
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Género detectado:
            </p>
            <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
              {selectedGenre?.name || detectedGenre.genre}
            </p>
          </div>
        </div>

        {/* Confidence indicator */}
        <div className="flex items-center gap-2 ml-auto">
          <div
            className={cn(
              'px-2 py-1 rounded-md text-xs font-semibold',
              getConfidenceColor(detectedGenre.confidence)
            )}
          >
            {Math.round(detectedGenre.confidence * 100)}%
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
            title="Ver detalles"
          >
            <Info className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </motion.div>

      {/* Details Panel */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Razón de detección:
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {detectedGenre.reasoning}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nivel de confianza:
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${detectedGenre.confidence * 100}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className={cn(
                          'h-full rounded-full',
                          detectedGenre.confidence >= 0.9 && 'bg-green-500',
                          detectedGenre.confidence >= 0.7 && detectedGenre.confidence < 0.9 && 'bg-yellow-500',
                          detectedGenre.confidence < 0.7 && 'bg-orange-500'
                        )}
                      />
                    </div>
                    <span className={cn('text-xs font-semibold', getConfidenceColor(detectedGenre.confidence))}>
                      {getConfidenceLabel(detectedGenre.confidence)}
                    </span>
                  </div>
                </div>

                {detectedGenre.alternativeGenres && detectedGenre.alternativeGenres.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Alternativas detectadas:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {detectedGenre.alternativeGenres.map((alt, index) => (
                        <div
                          key={index}
                          className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                        >
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {alt.genre}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {Math.round(alt.confidence * 100)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Section */}
      <AnimatePresence mode="wait">
        {!feedbackGiven ? (
          <motion.div
            key="feedback-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿La detección es correcta?
            </p>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFeedback(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm font-medium">Sí</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFeedback(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <ThumbsDown className="w-4 h-4" />
                <span className="text-sm font-medium">No</span>
              </motion.button>
            </div>

            {onChangeGenre && (
              <button
                onClick={onChangeGenre}
                className="ml-auto text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium underline"
              >
                Cambiar género
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="feedback-thanks"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
          >
            <Sparkles className="w-4 h-4" />
            <p className="text-sm font-medium">
              ¡Gracias por tu feedback! Nos ayuda a mejorar.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
