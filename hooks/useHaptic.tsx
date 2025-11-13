/**
 * USE HAPTIC HOOK
 * Sistema de feedback háptico para mobile
 *
 * Proporciona vibración táctil para mejorar la UX en dispositivos móviles
 * Compatible con iOS (Taptic Engine) y Android (Vibration API)
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

export type HapticStyle =
  | 'light' // Tap ligero (hover, focus)
  | 'medium' // Tap medio (button press, selection)
  | 'heavy' // Tap fuerte (error, success)
  | 'success' // Patrón de éxito
  | 'warning' // Patrón de advertencia
  | 'error' // Patrón de error
  | 'selection'; // Cambio de selección (scroll picker)

interface HapticFeedbackOptions {
  /** Deshabilitar haptics globalmente */
  disabled?: boolean;
  /** Solo en mobile */
  mobileOnly?: boolean;
}

/**
 * Hook principal de haptic feedback
 */
export function useHaptic(options: HapticFeedbackOptions = {}) {
  const { disabled = false, mobileOnly = true } = options;
  const [isSupported, setIsSupported] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar soporte de vibration API
    const vibrationSupported = 'vibrate' in navigator;
    setIsSupported(vibrationSupported);

    // Detectar mobile
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobile);
  }, []);

  /**
   * Trigger haptic feedback
   */
  const trigger = useCallback(
    (style: HapticStyle = 'medium') => {
      // Si está deshabilitado, no hacer nada
      if (disabled) return;

      // Si es solo mobile y no es mobile, no hacer nada
      if (mobileOnly && !isMobile) return;

      // Si no está soportado, no hacer nada
      if (!isSupported) return;

      // Ejecutar vibración según el estilo
      vibrate(style);
    },
    [disabled, mobileOnly, isMobile, isSupported]
  );

  /**
   * Helpers específicos
   */
  const light = useCallback(() => trigger('light'), [trigger]);
  const medium = useCallback(() => trigger('medium'), [trigger]);
  const heavy = useCallback(() => trigger('heavy'), [trigger]);
  const success = useCallback(() => trigger('success'), [trigger]);
  const warning = useCallback(() => trigger('warning'), [trigger]);
  const error = useCallback(() => trigger('error'), [trigger]);
  const selection = useCallback(() => trigger('selection'), [trigger]);

  return {
    /** Trigger haptic con estilo específico */
    trigger,
    /** Tap ligero */
    light,
    /** Tap medio */
    medium,
    /** Tap fuerte */
    heavy,
    /** Patrón de éxito */
    success,
    /** Patrón de advertencia */
    warning,
    /** Patrón de error */
    error,
    /** Cambio de selección */
    selection,
    /** Si haptics está soportado */
    isSupported,
    /** Si es mobile */
    isMobile,
  };
}

/**
 * Ejecuta vibración según el estilo
 */
function vibrate(style: HapticStyle): void {
  if (!('vibrate' in navigator)) return;

  // Patrones de vibración (en milisegundos)
  // [vibrate, pause, vibrate, pause, ...]
  const patterns: Record<HapticStyle, number | number[]> = {
    light: 10, // 10ms - Muy sutil
    medium: 20, // 20ms - Standard
    heavy: 30, // 30ms - Fuerte

    // Patrones complejos
    success: [10, 50, 10], // Double tap rápido
    warning: [20, 100, 20, 100, 20], // Triple tap espaciado
    error: [30, 100, 30], // Double tap fuerte
    selection: 5, // 5ms - Muy ligero
  };

  const pattern = patterns[style];

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.warn('[Haptic] Vibration failed:', error);
  }
}

/**
 * HOC: Agregar haptic feedback a un componente
 */
export function withHaptic<P extends object>(
  Component: React.ComponentType<P>,
  style: HapticStyle = 'medium'
) {
  return function HapticComponent(props: P) {
    const { trigger } = useHaptic();

    return (
      <div onClick={() => trigger(style)}>
        <Component {...props} />
      </div>
    );
  };
}

/**
 * Hook: Haptic feedback en eventos
 */
export function useHapticEvents() {
  const haptic = useHaptic();

  return {
    /** onClick con haptic medium */
    onClick: useCallback(
      (handler?: () => void) => ({
        onClick: () => {
          haptic.medium();
          handler?.();
        },
      }),
      [haptic]
    ),

    /** onFocus con haptic light */
    onFocus: useCallback(
      (handler?: () => void) => ({
        onFocus: () => {
          haptic.light();
          handler?.();
        },
      }),
      [haptic]
    ),

    /** onChange con haptic selection */
    onChange: useCallback(
      (handler?: (e: any) => void) => ({
        onChange: (e: any) => {
          haptic.selection();
          handler?.(e);
        },
      }),
      [haptic]
    ),

    /** onSuccess con haptic success */
    onSuccess: useCallback(
      (handler?: () => void) => ({
        onClick: () => {
          haptic.success();
          handler?.();
        },
      }),
      [haptic]
    ),

    /** onError con haptic error */
    onError: useCallback(
      (handler?: () => void) => ({
        onClick: () => {
          haptic.error();
          handler?.();
        },
      }),
      [haptic]
    ),
  };
}

/**
 * Componente: Wrapper con haptic feedback
 */
interface HapticWrapperProps {
  children: React.ReactNode;
  style?: HapticStyle;
  on?: 'click' | 'hover' | 'focus';
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export function HapticWrapper({
  children,
  style = 'medium',
  on = 'click',
  disabled = false,
  className,
  onClick,
}: HapticWrapperProps) {
  const { trigger } = useHaptic({ disabled });

  const handleInteraction = () => {
    trigger(style);
    onClick?.();
  };

  const props: any = {
    className,
  };

  if (on === 'click') {
    props.onClick = handleInteraction;
  } else if (on === 'hover') {
    props.onMouseEnter = handleInteraction;
  } else if (on === 'focus') {
    props.onFocus = handleInteraction;
  }

  return <div {...props}>{children}</div>;
}

/**
 * Hook: Haptic feedback en scroll
 */
export function useHapticScroll(threshold: number = 100) {
  const { selection } = useHaptic();
  const [lastTrigger, setLastTrigger] = useState(0);

  const handleScroll = useCallback(
    (scrollY: number) => {
      // Trigger cada X pixels
      const currentThreshold = Math.floor(scrollY / threshold);

      if (currentThreshold !== lastTrigger) {
        selection();
        setLastTrigger(currentThreshold);
      }
    },
    [threshold, lastTrigger, selection]
  );

  return handleScroll;
}

/**
 * Utilidades de haptic feedback
 */
export const hapticUtils = {
  /**
   * Vibración personalizada
   */
  custom: (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.warn('[Haptic] Custom vibration failed:', error);
      }
    }
  },

  /**
   * Detener vibración
   */
  stop: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
  },

  /**
   * Check support
   */
  isSupported: (): boolean => {
    return 'vibrate' in navigator;
  },

  /**
   * Check if mobile
   */
  isMobile: (): boolean => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  },
};
