/**
 * Emotional Sparkles Effect
 *
 * Efecto de sparkles/brillos que aparece en momentos emocionales:
 * - Mensajes con high emotional intensity
 * - Interacciones positivas
 * - Logros y milestones
 *
 * Features:
 * - Particles animados con framer-motion
 * - Colores configurables según emoción
 * - Intensidad ajustable
 * - No intrusivo (overlay transparente)
 *
 * PHASE 4: Delight & Polish - Microinteracciones
 */

"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles as SparklesIcon } from "lucide-react";

interface SparklesProps {
  /** Control de visibilidad del efecto */
  show: boolean;
  /** Tipo de emoción que determina color */
  emotion?: "joy" | "love" | "excitement" | "achievement" | "surprise";
  /** Intensidad del efecto (1-10) */
  intensity?: number;
  /** Duración en segundos */
  duration?: number;
  /** Callback cuando termina la animación */
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  size: number;
  rotation: number;
  color: string;
}

const emotionColors = {
  joy: ["#FFD700", "#FFA500", "#FF6B35"],
  love: ["#FF69B4", "#FF1493", "#C71585"],
  excitement: ["#9370DB", "#8A2BE2", "#7B68EE"],
  achievement: ["#00CED1", "#1E90FF", "#4169E1"],
  surprise: ["#FF6347", "#FF4500", "#DC143C"],
};

export function Sparkles({
  show,
  emotion = "joy",
  intensity = 5,
  duration = 2,
  onComplete,
}: SparklesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (show) {
      // Generate particles based on intensity
      const count = Math.min(intensity * 3, 30); // Max 30 particles
      const colors = emotionColors[emotion];

      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100, // Position in percentage
        y: Math.random() * 100,
        delay: Math.random() * 0.5,
        size: Math.random() * 8 + 4, // 4-12px
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));

      setParticles(newParticles);

      // Clear particles after animation completes
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, duration * 1000);

      return () => clearTimeout(timer);
    }
  }, [show, emotion, intensity, duration, onComplete]);

  return (
    <AnimatePresence>
      {show && particles.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
        >
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                opacity: 0,
                scale: 0,
                rotate: 0,
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1.2, 0],
                rotate: [0, particle.rotation, particle.rotation + 180],
                y: [-20, -40, -60],
              }}
              transition={{
                duration: duration,
                delay: particle.delay,
                ease: [0.34, 1.56, 0.64, 1], // Bouncy ease
              }}
              className="absolute"
              style={{
                width: particle.size,
                height: particle.size,
              }}
            >
              <SparklesIcon
                className="w-full h-full"
                style={{ color: particle.color }}
                fill={particle.color}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook para controlar sparkles emocionales
 * Simplifica la activación en componentes
 */
export function useEmotionalSparkles() {
  const [showSparkles, setShowSparkles] = useState(false);
  const [sparklesConfig, setSparklesConfig] = useState<Omit<SparklesProps, "show">>({
    emotion: "joy",
    intensity: 5,
    duration: 2,
  });

  const triggerSparkles = (
    config: Partial<Omit<SparklesProps, "show">> = {}
  ) => {
    setSparklesConfig({
      emotion: config.emotion || "joy",
      intensity: config.intensity || 5,
      duration: config.duration || 2,
      onComplete: config.onComplete,
    });
    setShowSparkles(true);
  };

  const hideSparkles = () => {
    setShowSparkles(false);
  };

  return {
    showSparkles,
    sparklesConfig,
    triggerSparkles,
    hideSparkles,
  };
}

/**
 * Sparkles Button - Botón con efecto de sparkles al hacer click
 */
interface SparklesButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  emotion?: SparklesProps["emotion"];
  intensity?: number;
  children: React.ReactNode;
}

export function SparklesButton({
  emotion = "joy",
  intensity = 5,
  onClick,
  children,
  className,
  ...props
}: SparklesButtonProps) {
  const { showSparkles, sparklesConfig, triggerSparkles } = useEmotionalSparkles();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerSparkles({ emotion, intensity });
    onClick?.(e);
  };

  return (
    <>
      <button onClick={handleClick} className={className} {...props}>
        {children}
      </button>
      <Sparkles show={showSparkles} {...sparklesConfig} />
    </>
  );
}
