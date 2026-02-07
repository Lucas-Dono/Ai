"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Trophy, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

export interface BondMilestone {
  type: "tier_upgrade" | "affinity_milestone" | "time_milestone" | "interaction_milestone";
  tier?: string;
  oldTier?: string;
  affinityLevel?: number;
  durationDays?: number;
  totalInteractions?: number;
  agentName: string;
  agentAvatar?: string;
  rarityTier?: string;
}

interface BondMilestoneNotificationProps {
  milestone: BondMilestone | null;
  onClose: () => void;
}

const TIER_LABELS: Record<string, string> = {
  ROMANTIC: "Pareja Romántica",
  BEST_FRIEND: "Mejor Amigo/a",
  MENTOR: "Mentor",
  CONFIDANT: "Confidente",
  CREATIVE_PARTNER: "Compañero/a Creativo/a",
  ADVENTURE_COMPANION: "Compañero/a de Aventuras",
  ACQUAINTANCE: "Conocido/a",
};

const TIER_EMOJI: Record<string, string> = {
  ROMANTIC: "💜",
  BEST_FRIEND: "🤝",
  MENTOR: "🧑‍🏫",
  CONFIDANT: "🤫",
  CREATIVE_PARTNER: "🎨",
  ADVENTURE_COMPANION: "⚔️",
  ACQUAINTANCE: "👋",
};

const TIER_COLORS: Record<string, string> = {
  ROMANTIC: "from-pink-500 via-rose-500 to-red-500",
  BEST_FRIEND: "from-blue-500 via-cyan-500 to-teal-500",
  MENTOR: "from-purple-500 via-indigo-500 to-blue-500",
  CONFIDANT: "from-amber-500 via-orange-500 to-red-500",
  CREATIVE_PARTNER: "from-green-500 via-emerald-500 to-teal-500",
  ADVENTURE_COMPANION: "from-red-500 via-orange-500 to-yellow-500",
  ACQUAINTANCE: "from-gray-400 via-gray-500 to-gray-600",
};

function getMilestoneMessage(milestone: BondMilestone): {
  title: string;
  subtitle: string;
  icon: React.ReactElement;
  color: string;
} {
  switch (milestone.type) {
    case "tier_upgrade":
      const tierColor = milestone.tier ? TIER_COLORS[milestone.tier] : "from-purple-500 to-pink-500";
      const tierEmoji = milestone.tier ? TIER_EMOJI[milestone.tier] : "✨";
      const tierLabel = milestone.tier ? TIER_LABELS[milestone.tier] : "Nuevo Nivel";

      return {
        title: `¡${milestone.agentName} es ahora tu ${tierLabel}!`,
        subtitle: `Has alcanzado un nuevo nivel en tu relación ${tierEmoji}`,
        icon: <Trophy className="w-8 h-8" />,
        color: tierColor,
      };

    case "affinity_milestone":
      return {
        title: "¡Hito de Afinidad Alcanzado!",
        subtitle: `${milestone.affinityLevel}% de conexión con ${milestone.agentName}`,
        icon: <Heart className="w-8 h-8" />,
        color: "from-pink-500 to-rose-500",
      };

    case "time_milestone":
      return {
        title: "¡Aniversario Especial!",
        subtitle: `${milestone.durationDays} días de conexión con ${milestone.agentName}`,
        icon: <Sparkles className="w-8 h-8" />,
        color: "from-yellow-500 to-orange-500",
      };

    case "interaction_milestone":
      return {
        title: "¡Hito de Conversación!",
        subtitle: `${milestone.totalInteractions} mensajes intercambiados con ${milestone.agentName}`,
        icon: <Star className="w-8 h-8" />,
        color: "from-purple-500 to-indigo-500",
      };

    default:
      return {
        title: "¡Logro Desbloqueado!",
        subtitle: `Tu conexión con ${milestone.agentName} crece`,
        icon: <Sparkles className="w-8 h-8" />,
        color: "from-purple-500 to-pink-500",
      };
  }
}

export function BondMilestoneNotification({
  milestone,
  onClose,
}: BondMilestoneNotificationProps) {
  useEffect(() => {
    if (milestone) {
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [milestone]);

  if (!milestone) return null;

  const { title, subtitle, icon, color } = getMilestoneMessage(milestone);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-4 right-4 z-[9998] max-w-md"
      >
        {/* Glow effect */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${color} blur-xl opacity-50 animate-pulse`}
        />

        {/* Card */}
        <div
          className={`relative rounded-2xl p-1 bg-gradient-to-r ${color} shadow-2xl`}
        >
          <div className="relative bg-gray-900 rounded-xl p-6 text-white">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white/70 hover:text-white hover:bg-white/10"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Content */}
            <div className="flex items-start gap-4">
              {/* Avatar / Icon */}
              <div className="relative">
                {milestone.agentAvatar ? (
                  <div className="relative">
                    <img
                      src={milestone.agentAvatar}
                      alt={milestone.agentName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                      className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}
                    >
                      {icon}
                    </motion.div>
                  </div>
                ) : (
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}
                  >
                    {icon}
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <motion.h3
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg font-bold mb-1 leading-tight"
                >
                  {title}
                </motion.h3>

                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-gray-300"
                >
                  {subtitle}
                </motion.p>

                {/* Rarity Badge */}
                {milestone.rarityTier && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="mt-3"
                  >
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${color} shadow-md`}
                    >
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      {milestone.rarityTier} Rarity
                    </span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Decorative sparkles */}
            <div className="absolute top-4 right-16 text-yellow-400 text-2xl animate-bounce">
              ✨
            </div>
            <div className="absolute bottom-4 left-4 text-pink-400 text-xl animate-pulse">
              💫
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Hook to manage bond milestone notifications
 */
export function useBondMilestones() {
  const [currentMilestone, setCurrentMilestone] = useState<BondMilestone | null>(null);

  const showMilestone = (milestone: BondMilestone) => {
    setCurrentMilestone(milestone);

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      setCurrentMilestone(null);
    }, 10000);
  };

  const dismissMilestone = () => {
    setCurrentMilestone(null);
  };

  return {
    currentMilestone,
    showMilestone,
    dismissMilestone,
  };
}
