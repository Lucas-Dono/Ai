/**
 * useShake Hook
 *
 * Hook para agregar animación de shake (sacudida) en errores
 * Útil para:
 * - Inputs con validación fallida
 * - Formularios con errores
 * - Botones con acciones inválidas
 * - Feedback visual de errores
 *
 * PHASE 4: Delight & Polish - Microinteracciones
 */

"use client";

import { useState, useCallback, useEffect } from "react";

interface UseShakeOptions {
  /** Duración de la animación en ms */
  duration?: number;
  /** Número de sacudidas */
  intensity?: number;
  /** Callback cuando termina la animación */
  onComplete?: () => void;
}

export function useShake(options: UseShakeOptions = {}) {
  const { duration = 500, intensity = 3, onComplete } = options;
  const [isShaking, setIsShaking] = useState(false);

  const trigger = useCallback(() => {
    if (isShaking) return; // Prevent multiple triggers

    setIsShaking(true);

    // Reset after animation completes
    const timer = setTimeout(() => {
      setIsShaking(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [isShaking, duration, onComplete]);

  // CSS classes for shake animation
  const shakeClass = isShaking ? "animate-shake" : "";

  // Inline styles for shake animation (if CSS classes not available)
  const shakeStyle = isShaking
    ? {
        animation: `shake ${duration}ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both`,
      }
    : {};

  return {
    isShaking,
    trigger,
    shakeClass,
    shakeStyle,
  };
}

/**
 * Hook con detección automática de errores en formularios
 * Se integra con React Hook Form o similar
 */
export function useShakeOnError(hasError: boolean, options: UseShakeOptions = {}) {
  const shake = useShake(options);

  useEffect(() => {
    if (hasError) {
      shake.trigger();
    }
  }, [hasError]); // eslint-disable-line react-hooks/exhaustive-deps

  return shake;
}
