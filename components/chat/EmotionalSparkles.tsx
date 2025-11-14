/**
 * Emotional Sparkles - FASE 4: DELIGHT & POLISH
 *
 * Sistema de partículas emocionales que aparecen alrededor de los mensajes
 * basadas en el estado emocional del agente.
 *
 * Emociones visuales:
 * - Joy (Alegría) → Sparkles dorados
 * - Love (Amor) → Corazones rosas
 * - Surprise (Sorpresa) → Estrellas azules
 * - Anger (Enojo) → Chispas rojas
 * - Sadness (Tristeza) → Gotas azules
 * - Fear (Miedo) → Ondas grises
 *
 * Features:
 * - Animaciones con Framer Motion
 * - Partículas que flotan y desaparecen
 * - Colores basados en emoción
 * - Performance optimizado (max 8 partículas simultáneas)
 * - Respeta prefers-reduced-motion
 */

"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { Heart, Sparkles, Star, Zap, Droplet, Waves } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * Tipos de emociones que pueden mostrar sparkles
 */
export type Emotion =
  | "joy"
  | "love"
  | "surprise"
  | "anger"
  | "sadness"
  | "fear"
  | "neutral";

/**
 * Configuración de colores y iconos por emoción
 */
const emotionConfig: Record<
  Emotion,
  {
    icon: React.ElementType;
    colors: string[];
    intensity: number;
  }
> = {
  joy: {
    icon: Sparkles,
    colors: ["text-yellow-400", "text-amber-400", "text-orange-400"],
    intensity: 1,
  },
  love: {
    icon: Heart,
    colors: ["text-pink-400", "text-rose-400", "text-red-400"],
    intensity: 1.2,
  },
  surprise: {
    icon: Star,
    colors: ["text-blue-400", "text-cyan-400", "text-sky-400"],
    intensity: 0.9,
  },
  anger: {
    icon: Zap,
    colors: ["text-red-500", "text-orange-500", "text-red-600"],
    intensity: 1.3,
  },
  sadness: {
    icon: Droplet,
    colors: ["text-blue-300", "text-indigo-300", "text-blue-400"],
    intensity: 0.6,
  },
  fear: {
    icon: Waves,
    colors: ["text-gray-400", "text-slate-400", "text-gray-500"],
    intensity: 0.7,
  },
  neutral: {
    icon: Sparkles,
    colors: ["text-gray-300"],
    intensity: 0.3,
  },
};

/**
 * Interfaz de una partícula individual
 */
interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
  scale: number;
}

/**
 * Props del componente
 */
interface EmotionalSparklesProps {
  emotion: Emotion;
  intensity?: number; // 0-1, overrides emotion default
  enabled?: boolean;
  maxParticles?: number;
  className?: string;
}

/**
 * Variantes de animación para las partículas
 */
const particleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
    rotate: 0,
  },
  visible: (custom: { delay: number; rotation: number; scale: number }) => ({
    opacity: [0, 1, 1, 0],
    scale: [0, custom.scale, custom.scale, 0],
    rotate: custom.rotation,
    y: [0, -80, -120],
    x: (Math.random() - 0.5) * 60,
    transition: {
      duration: 2.5,
      delay: custom.delay,
      ease: "easeOut",
    },
  }),
  exit: {
    opacity: 0,
    scale: 0,
    transition: { duration: 0.2 },
  },
};

/**
 * Componente de Emotional Sparkles
 */
export function EmotionalSparkles({
  emotion,
  intensity,
  enabled = true,
  maxParticles = 6,
  className,
}: EmotionalSparklesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detectar prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Generar partículas basadas en emoción e intensidad
  const generateParticles = useCallback(() => {
    if (!enabled || emotion === "neutral" || prefersReducedMotion) {
      return;
    }

    const config = emotionConfig[emotion];
    const finalIntensity = intensity ?? config.intensity;
    const particleCount = Math.min(
      Math.max(Math.floor(finalIntensity * maxParticles), 2),
      maxParticles
    );

    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      x: (Math.random() - 0.5) * 80,
      y: Math.random() * 20,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      delay: i * 0.15,
      duration: 2 + Math.random() * 0.5,
      rotation: Math.random() * 360,
      scale: 0.8 + Math.random() * 0.4,
    }));

    setParticles(newParticles);

    // Limpiar partículas después de la animación
    setTimeout(() => {
      setParticles([]);
    }, 3000);
  }, [emotion, intensity, enabled, maxParticles, prefersReducedMotion]);

  // Trigger partículas cuando cambia la emoción
  useEffect(() => {
    if (emotion !== "neutral") {
      generateParticles();
    }
  }, [emotion, generateParticles]);

  // Si está deshabilitado o es neutral, no renderizar nada
  if (!enabled || emotion === "neutral" || prefersReducedMotion || particles.length === 0) {
    return null;
  }

  const config = emotionConfig[emotion];
  const Icon = config.icon;

  return (
    <div
      className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}
      aria-hidden="true"
    >
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            custom={{
              delay: particle.delay,
              rotation: particle.rotation,
              scale: particle.scale,
            }}
            variants={particleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: "absolute",
              left: `calc(50% + ${particle.x}px)`,
              bottom: `${particle.y}px`,
            }}
          >
            <Icon className={cn("h-4 w-4", particle.color)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Hook para controlar emotional sparkles
 * Útil para componentes que necesitan mostrar sparkles basados en estado emocional
 */
export function useEmotionalSparkles() {
  const [emotion, setEmotion] = useState<Emotion>("neutral");
  const [intensity, setIntensity] = useState<number>(1);

  const triggerSparkles = useCallback((newEmotion: Emotion, newIntensity: number = 1) => {
    setEmotion(newEmotion);
    setIntensity(newIntensity);

    // Reset después de trigger
    setTimeout(() => {
      setEmotion("neutral");
    }, 100);
  }, []);

  return {
    emotion,
    intensity,
    triggerSparkles,
  };
}

/**
 * Componente wrapper que agrega sparkles a sus children
 * Útil para envolver mensajes o elementos que necesitan feedback emocional
 */
interface SparklesWrapperProps {
  emotion: Emotion;
  intensity?: number;
  enabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function SparklesWrapper({
  emotion,
  intensity,
  enabled = true,
  children,
  className,
}: SparklesWrapperProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      <EmotionalSparkles emotion={emotion} intensity={intensity} enabled={enabled} />
    </div>
  );
}
