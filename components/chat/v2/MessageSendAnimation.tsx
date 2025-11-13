/**
 * Message Send Animation (Swoosh Effect)
 *
 * Animación visual que muestra feedback al enviar un mensaje
 * - Efecto swoosh estilo iMessage
 * - Onda expansiva (ripple)
 * - Timing calibrado para sentirse instantáneo
 *
 * PHASE 4: Delight & Polish - Microinteracciones
 */

"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";

interface MessageSendAnimationProps {
  triggered: boolean;
  onComplete: () => void;
}

export function MessageSendAnimation({
  triggered,
  onComplete,
}: MessageSendAnimationProps) {
  return (
    <AnimatePresence>
      {triggered && (
        <motion.div
          className="absolute inset-0 pointer-events-none flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={onComplete}
        >
          {/* Main swoosh icon */}
          <motion.div
            initial={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
            animate={{
              scale: [1, 1.2, 0.8],
              y: [0, -30, -80],
              opacity: [1, 0.8, 0],
              rotate: [0, 15, 30],
            }}
            transition={{
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1], // Bouncy ease
            }}
            className="relative"
          >
            <Send className="h-8 w-8 text-primary drop-shadow-lg" />

            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-primary/30 blur-xl rounded-full"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          </motion.div>

          {/* First ripple wave */}
          <motion.div
            className="absolute rounded-full border-2 border-primary"
            initial={{ width: 30, height: 30, opacity: 0.6 }}
            animate={{
              width: 120,
              height: 120,
              opacity: 0,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />

          {/* Second ripple wave (delayed) */}
          <motion.div
            className="absolute rounded-full border-2 border-primary/60"
            initial={{ width: 30, height: 30, opacity: 0.4 }}
            animate={{
              width: 150,
              height: 150,
              opacity: 0,
            }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          />

          {/* Third ripple wave (more delayed) */}
          <motion.div
            className="absolute rounded-full border border-primary/40"
            initial={{ width: 30, height: 30, opacity: 0.3 }}
            animate={{
              width: 180,
              height: 180,
              opacity: 0,
            }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook para controlar la animación de envío
 * Uso simplificado en componentes de chat
 */
export function useSendAnimation() {
  const [sendAnimationTriggered, setSendAnimationTriggered] = React.useState(false);

  const triggerSendAnimation = () => {
    setSendAnimationTriggered(true);
  };

  const resetSendAnimation = () => {
    setSendAnimationTriggered(false);
  };

  return {
    sendAnimationTriggered,
    triggerSendAnimation,
    resetSendAnimation,
  };
}
