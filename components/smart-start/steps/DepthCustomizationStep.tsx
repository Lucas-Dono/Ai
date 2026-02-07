/**
 * Depth Customization Step - Web Version
 *
 * Allows users to select character generation depth (Basic, Realistic, Ultra)
 * Shows premium features with badges and locks for non-accessible tiers
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DEPTH_LEVELS,
  getFeaturesForDepth,
  canAccessDepth,
  type DepthLevelId,
  type UserTier,
} from '@circuitpromptai/smart-start-core';
import { useTranslations } from 'next-intl';

interface DepthCustomizationStepProps {
  visible: boolean;
  completed: boolean;
  userTier?: UserTier;
  selectedDepth?: DepthLevelId;
  onComplete: (depthId: DepthLevelId) => void;
}

export function DepthCustomizationStep({
  visible,
  completed,
  userTier = 'free',
  selectedDepth: initialDepth,
  onComplete,
}: DepthCustomizationStepProps) {
  const t = useTranslations();
  const [selectedDepth, setSelectedDepth] = useState<DepthLevelId | null>(
    initialDepth || null
  );
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeRequiredTier, setUpgradeRequiredTier] = useState<'plus' | 'ultra'>('plus');

  const handleDepthSelect = useCallback(
    (depthId: DepthLevelId) => {
      // Check if user has access to this depth level
      if (!canAccessDepth(userTier, depthId)) {
        setUpgradeRequiredTier(
          DEPTH_LEVELS[depthId].requiredTier === 'ultra' ? 'ultra' : 'plus'
        );
        setShowUpgradeModal(true);
        return;
      }

      setSelectedDepth(depthId);
      onComplete(depthId);
    },
    [userTier, onComplete]
  );

  const handleUpgradeClick = () => {
    // Navigate to billing page
    window.location.href = '/dashboard/billing';
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-5xl mx-auto py-8 px-4"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-3"
        >
          Nivel de Profundidad
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 dark:text-gray-300"
        >
          Elegí qué tan realista y complejo querés que sea tu personaje
        </motion.p>
      </div>

      {/* Depth Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.values(DEPTH_LEVELS).map((depth, index) => {
          const isAccessible = canAccessDepth(userTier, depth.id);
          const isSelected = selectedDepth === depth.id;
          const features = getFeaturesForDepth(depth.id);

          return (
            <motion.button
              key={depth.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => handleDepthSelect(depth.id)}
              disabled={!isAccessible && completed}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-300
                ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg scale-[1.02]'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }
                ${
                  !isAccessible
                    ? 'opacity-75 cursor-not-allowed'
                    : 'cursor-pointer hover:shadow-md'
                }
              `}
            >
              {/* Premium Badge */}
              {depth.badge && (
                <div
                  className="absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-md"
                  style={{ backgroundColor: depth.color }}
                >
                  {depth.badge}
                </div>
              )}

              {/* Lock Icon for inaccessible tiers */}
              {!isAccessible && (
                <div className="absolute top-4 right-4 text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}

              {/* Icon & Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">{depth.icon}</div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {depth.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {depth.description}
                  </p>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2 mb-4">
                {features.slice(0, 5).map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-base">{feature.icon}</span>
                    <span className="flex-1">{feature.name}</span>
                  </div>
                ))}
                {features.length > 5 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                    +{features.length - 5} características más
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>~{depth.estimatedTime}s</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{depth.targetTokens} tokens</span>
                  </div>
                </div>
              </div>

              {/* Selected Checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center shadow-lg"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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

      {/* Help Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-sm text-gray-500 dark:text-gray-400"
      >
        <p>💡 Podés cambiar el nivel de profundidad en cualquier momento</p>
        <p className="mt-1">
          Los personajes más complejos tardan más en generarse pero ofrecen conversaciones mucho más
          ricas
        </p>
      </motion.div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🔒</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Función Premium
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Esta opción requiere una suscripción{' '}
                  <span className="font-semibold text-primary-500">
                    {upgradeRequiredTier === 'ultra' ? 'Ultra' : 'Plus'}
                  </span>
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Personajes ultra-realistas</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Vida fuera del chat</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Emociones complejas</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Más tarde
                </button>
                <button
                  onClick={handleUpgradeClick}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors"
                >
                  Ver Planes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
