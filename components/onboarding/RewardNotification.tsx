"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Award, Zap, Sparkles as SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TourReward } from "@/lib/onboarding/gamification";
import { useClientLocale } from "@/hooks/useClientLocale";
import { Sparkles, useEmotionalSparkles } from "@/components/effects/Sparkles";

interface RewardNotificationProps {
  reward: TourReward | null;
  onClose: () => void;
}

const rarityColors = {
  common: "from-gray-500 to-gray-600",
  rare: "from-blue-500 to-blue-600",
  epic: "from-purple-500 to-purple-600",
  legendary: "from-yellow-500 to-orange-600",
};

export function RewardNotification({ reward, onClose }: RewardNotificationProps) {
  const locale = useClientLocale();
  const isEnglish = locale === 'en';
  const { showSparkles, sparklesConfig, triggerSparkles } = useEmotionalSparkles();

  // Trigger sparkles when reward appears
  React.useEffect(() => {
    if (reward) {
      const emotion = reward.badge?.rarity === 'legendary' ? 'achievement' :
                     reward.badge?.rarity === 'epic' ? 'excitement' : 'joy';
      const intensity = reward.badge?.rarity === 'legendary' ? 10 :
                       reward.badge?.rarity === 'epic' ? 8 : 6;
      triggerSparkles({ emotion, intensity, duration: 3 });
    }
  }, [reward]);

  if (!reward) return null;

  const badgeGradient = reward.badge ? rarityColors[reward.badge.rarity] : rarityColors.common;

  return (
    <AnimatePresence>
      {reward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="pointer-events-auto relative"
          >
            {/* Background blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm -z-10"
              onClick={onClose}
            />

            {/* Reward card */}
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-purple-500/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              {/* Sparkles animation */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: "100%", opacity: 1 }}
                    animate={{ y: "-100%", opacity: 0 }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                    className="absolute"
                    style={{
                      left: `${Math.random() * 100}%`,
                      fontSize: "1rem",
                    }}
                  >
                    ✨
                  </motion.div>
                ))}
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="relative z-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mb-4"
                >
                  <Award className="w-16 h-16 mx-auto text-yellow-400" />
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  {isEnglish ? "Congratulations!" : "¡Felicitaciones!"}
                </motion.h2>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-300 mb-6"
                >
                  {isEnglish ? "You completed a tour!" : "¡Completaste un tour!"}
                </motion.p>

                {/* Karma reward */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center gap-2 mb-6"
                >
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <span className="text-3xl font-bold text-yellow-400">
                    +{reward.karma}
                  </span>
                  <span className="text-gray-400">karma</span>
                </motion.div>

                {/* Badge */}
                {reward.badge && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className={`bg-gradient-to-r ${badgeGradient} rounded-2xl p-6 mb-6`}
                  >
                    <div className="text-5xl mb-3">{reward.badge.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {isEnglish ? reward.badge.nameEn : reward.badge.name}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {isEnglish ? reward.badge.descriptionEn : reward.badge.description}
                    </p>
                  </motion.div>
                )}

                {/* Unlock notification */}
                {reward.unlock && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="bg-purple-500/20 border border-purple-500/50 rounded-2xl p-4 mb-6"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <SparklesIcon className="w-5 h-5 text-purple-400" />
                      <span className="font-semibold text-purple-300">
                        {isEnglish ? "Feature Unlocked!" : "¡Característica Desbloqueada!"}
                      </span>
                    </div>
                    <p className="text-sm text-purple-200">
                      {isEnglish ? reward.unlockDescriptionEn : reward.unlockDescription}
                    </p>
                  </motion.div>
                )}

                {/* Continue button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isEnglish ? "Continue" : "Continuar"}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Sparkles effect for achievement */}
      <Sparkles show={showSparkles} {...sparklesConfig} />
    </AnimatePresence>
  );
}
