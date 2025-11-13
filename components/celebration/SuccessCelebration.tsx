/**
 * Success Celebration Modal with Confetti
 *
 * Modal de celebración que muestra cuando el usuario alcanza un hito:
 * - Crear primer agente
 * - Completar onboarding
 * - Alcanzar logro especial
 *
 * Features:
 * - Confetti effect con canvas-confetti
 * - Avatar animado del agente
 * - Mensaje personalizado
 * - Botón de acción principal
 *
 * PHASE 4: Delight & Polish - Microinteracciones
 */

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeVariants, scaleVariants } from "@/lib/motion/system";
import { cn } from "@/lib/utils";

interface SuccessCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  agentName?: string;
  agentAvatar?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  type?: "agent-created" | "milestone" | "achievement";
}

export function SuccessCelebration({
  isOpen,
  onClose,
  title,
  message,
  agentName,
  agentAvatar,
  primaryAction,
  secondaryAction,
  type = "agent-created",
}: SuccessCelebrationProps) {
  const [hasPlayedConfetti, setHasPlayedConfetti] = useState(false);

  // Trigger confetti when modal opens
  useEffect(() => {
    if (isOpen && !hasPlayedConfetti) {
      // Delay confetti slightly for better effect
      setTimeout(() => {
        triggerConfetti();
        setHasPlayedConfetti(true);
      }, 300);
    }

    if (!isOpen) {
      setHasPlayedConfetti(false);
    }
  }, [isOpen, hasPlayedConfetti]);

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    // Multi-burst confetti effect
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });

    // Add sparkles effect with emoji
    confetti({
      particleCount: 30,
      spread: 360,
      startVelocity: 30,
      decay: 0.9,
      scalar: 1.2,
      shapes: ['circle'],
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#9370DB', '#00CED1'],
      origin: {
        x: 0.5,
        y: 0.5,
      },
      zIndex: 9999,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
            <motion.div
              variants={scaleVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="relative max-w-md w-full bg-gradient-to-br from-white via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors z-10"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>

              {/* Content */}
              <div className="relative p-8 text-center">
                {/* Animated decorative sparkles */}
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-4 left-4"
                >
                  <Sparkles className="h-8 w-8 text-yellow-400" />
                </motion.div>

                <motion.div
                  animate={{
                    rotate: [0, -360],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                  className="absolute top-4 right-12"
                >
                  <Heart className="h-6 w-6 text-pink-400 fill-pink-400" />
                </motion.div>

                {/* Agent Avatar (if provided) */}
                {agentAvatar && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.2,
                    }}
                    className="mb-6 inline-block"
                  >
                    <div className="relative">
                      <img
                        src={agentAvatar}
                        alt={agentName || "Agent"}
                        className="h-24 w-24 rounded-2xl shadow-xl border-4 border-white dark:border-gray-700"
                      />
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-2xl blur-xl -z-10" />
                    </div>
                  </motion.div>
                )}

                {/* Title */}
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent"
                >
                  {title}
                </motion.h2>

                {/* Agent Name (if provided) */}
                {agentName && (
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl font-bold mb-4 text-gray-900 dark:text-white"
                  >
                    "{agentName}"
                  </motion.p>
                )}

                {/* Message */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed"
                >
                  {message}
                </motion.p>

                {/* Actions */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col gap-3"
                >
                  {primaryAction && (
                    <Button
                      onClick={() => {
                        primaryAction.onClick();
                        onClose();
                      }}
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px]"
                    >
                      {primaryAction.label}
                    </Button>
                  )}

                  {secondaryAction && (
                    <Button
                      onClick={() => {
                        secondaryAction.onClick();
                        onClose();
                      }}
                      variant="outline"
                      size="lg"
                      className="w-full min-h-[44px]"
                    >
                      {secondaryAction.label}
                    </Button>
                  )}

                  {!primaryAction && !secondaryAction && (
                    <Button
                      onClick={onClose}
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white min-h-[44px]"
                    >
                      ¡Genial!
                    </Button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook para controlar el modal de celebración
 * Simplifica el uso en componentes
 */
export function useCelebration() {
  const [isOpen, setIsOpen] = useState(false);
  const [celebrationData, setCelebrationData] = useState<
    Omit<SuccessCelebrationProps, "isOpen" | "onClose">
  >({
    title: "",
    message: "",
  });

  const celebrate = (
    data: Omit<SuccessCelebrationProps, "isOpen" | "onClose">
  ) => {
    setCelebrationData(data);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    celebrationData,
    celebrate,
    close,
  };
}
