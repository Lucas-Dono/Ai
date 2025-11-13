/**
 * MOTION SYSTEM
 * Circuit Prompt AI - Sistema de animaciones basado en Material Design 3 Motion
 *
 * Este sistema proporciona:
 * - Tokens de duración y easing
 * - Variants de Framer Motion pre-configuradas
 * - Utilidades para animaciones comunes
 * - Consistencia en toda la aplicación
 *
 * Basado en:
 * - Material Design 3 Motion: https://m3.material.io/styles/motion/overview
 * - Framer Motion: https://www.framer.com/motion/
 */

import { Variants, Transition } from 'framer-motion';

// ============================================
// DURATION TOKENS
// ============================================

/**
 * Duraciones estándar de animación
 * Basado en Material Design 3
 */
export const DURATION = {
  /** 100ms - Instantáneo, feedback inmediato (hover, press) */
  instant: 0.1,

  /** 150ms - Muy rápido, microinteracciones (tooltips, badges) */
  fast: 0.15,

  /** 250ms - Rápido, transiciones standard (botones, cards) ⭐ DEFAULT */
  normal: 0.25,

  /** 350ms - Medio, elementos complejos (modals, panels) */
  moderate: 0.35,

  /** 500ms - Lento, transiciones importantes (page transitions) */
  slow: 0.5,

  /** 700ms - Muy lento, elementos dramáticos (hero animations) */
  slower: 0.7,

  /** 1000ms - Extra lento, efectos especiales (celebrations) */
  slowest: 1.0,
} as const;

// ============================================
// EASING FUNCTIONS
// ============================================

/**
 * Funciones de easing estándar
 * Material Design 3 motion curves
 */
export const EASING = {
  /** Easing estándar - Para la mayoría de animaciones */
  standard: [0.4, 0.0, 0.2, 1] as [number, number, number, number],

  /** Decelerate - Elementos entrando (fade in, slide in) */
  decelerate: [0.0, 0.0, 0.2, 1] as [number, number, number, number],

  /** Accelerate - Elementos saliendo (fade out, slide out) */
  accelerate: [0.4, 0.0, 1, 1] as [number, number, number, number],

  /** Sharp - Cambios abruptos (page transitions) */
  sharp: [0.4, 0.0, 0.6, 1] as [number, number, number, number],

  /** Linear - Progreso continuo (loading bars) */
  linear: [0, 0, 1, 1] as [number, number, number, number],

  /** Bounce - Efectos lúdicos (celebration, success) */
  bounce: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
} as const;

// ============================================
// BASE TRANSITIONS
// ============================================

/**
 * Transiciones base reutilizables
 */
export const TRANSITIONS = {
  /** Transición estándar - Uso general */
  standard: {
    duration: DURATION.normal,
    ease: EASING.standard,
  } as Transition,

  /** Rápida - Microinteracciones */
  fast: {
    duration: DURATION.fast,
    ease: EASING.standard,
  } as Transition,

  /** Lenta - Elementos complejos */
  slow: {
    duration: DURATION.slow,
    ease: EASING.standard,
  } as Transition,

  /** Spring - Física natural */
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 25,
  } as Transition,

  /** Spring suave - Más natural */
  springGentle: {
    type: 'spring',
    stiffness: 200,
    damping: 20,
  } as Transition,

  /** Spring rígido - Más snappy */
  springStiff: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  } as Transition,
} as const;

// ============================================
// ANIMATION VARIANTS
// ============================================

/**
 * FADE ANIMATIONS
 * Transiciones de opacidad
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: TRANSITIONS.standard,
  },
  exit: {
    opacity: 0,
    transition: { ...TRANSITIONS.standard, ease: EASING.accelerate },
  },
};

/**
 * SLIDE IN FROM BOTTOM
 * Elementos entrando desde abajo (modals, sheets)
 */
export const slideUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...TRANSITIONS.standard, ease: EASING.decelerate },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { ...TRANSITIONS.fast, ease: EASING.accelerate },
  },
};

/**
 * SLIDE IN FROM TOP
 * Notificaciones, alerts desde arriba
 */
export const slideDownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...TRANSITIONS.standard, ease: EASING.decelerate },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { ...TRANSITIONS.fast, ease: EASING.accelerate },
  },
};

/**
 * SLIDE IN FROM LEFT
 * Sidebars, drawers desde la izquierda
 */
export const slideRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...TRANSITIONS.standard, ease: EASING.decelerate },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { ...TRANSITIONS.fast, ease: EASING.accelerate },
  },
};

/**
 * SLIDE IN FROM RIGHT
 * Sidebars, drawers desde la derecha
 */
export const slideLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...TRANSITIONS.standard, ease: EASING.decelerate },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { ...TRANSITIONS.fast, ease: EASING.accelerate },
  },
};

/**
 * SCALE ANIMATIONS
 * Elementos que crecen/encogen (modals, popovers)
 */
export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...TRANSITIONS.standard, ease: EASING.decelerate },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { ...TRANSITIONS.fast, ease: EASING.accelerate },
  },
};

/**
 * SCALE + BOUNCE
 * Efectos lúdicos (success, celebration)
 */
export const bounceVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: DURATION.moderate,
      ease: EASING.bounce,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: TRANSITIONS.fast,
  },
};

/**
 * STAGGER CHILDREN
 * Para listas, grids donde items aparecen secuencialmente
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // 100ms entre cada hijo
      delayChildren: 0.05, // 50ms delay antes de empezar
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.standard,
  },
};

/**
 * COLLAPSE/EXPAND
 * Para acordeones, expandable panels
 */
export const collapseVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { ...TRANSITIONS.standard, ease: EASING.accelerate },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: { ...TRANSITIONS.standard, ease: EASING.decelerate },
  },
};

/**
 * ROTATE
 * Para iconos que rotan (chevrons, arrows)
 */
export const rotateVariants: Variants = {
  initial: { rotate: 0 },
  rotated: {
    rotate: 180,
    transition: TRANSITIONS.standard,
  },
};

/**
 * SHAKE
 * Para errores, validación fallida
 */
export const shakeVariants: Variants = {
  initial: { x: 0 },
  shake: {
    x: [-10, 10, -10, 10, -5, 5, 0],
    transition: {
      duration: 0.5,
      ease: EASING.linear,
    },
  },
};

/**
 * PULSE
 * Para loading, atención
 */
export const pulseVariants: Variants = {
  initial: { scale: 1, opacity: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: EASING.standard,
    },
  },
};

/**
 * GLOW
 * Para destacar elementos (hover, focus)
 */
export const glowVariants: Variants = {
  initial: {
    boxShadow: '0 0 0 0 rgba(192, 132, 252, 0)',
  },
  glow: {
    boxShadow: [
      '0 0 0 0 rgba(192, 132, 252, 0)',
      '0 0 20px 5px rgba(192, 132, 252, 0.3)',
      '0 0 0 0 rgba(192, 132, 252, 0)',
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: EASING.standard,
    },
  },
};

// ============================================
// SPECIAL EFFECTS
// ============================================

/**
 * SWOOSH EFFECT
 * Para mensajes enviados, acciones completadas
 */
export const swooshVariants: Variants = {
  initial: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  swoosh: {
    x: [0, 30, 100],
    opacity: [1, 0.8, 0],
    scale: [1, 0.95, 0.9],
    transition: {
      duration: 0.4,
      ease: EASING.accelerate,
    },
  },
};

/**
 * SPARKLE
 * Para efectos emocionales, delight moments
 */
export const sparkleVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  sparkle: {
    scale: [0, 1.2, 1],
    opacity: [0, 1, 0],
    transition: {
      duration: 0.6,
      ease: EASING.bounce,
    },
  },
};

// ============================================
// UTILITIES
// ============================================

/**
 * Helper: Crear delay escalonado para listas
 * @param index - Índice del elemento
 * @param baseDelay - Delay base en segundos
 */
export function getStaggerDelay(index: number, baseDelay: number = 0.05): number {
  return index * baseDelay;
}

/**
 * Helper: Combinar variants
 * @param variants - Array de variants a combinar
 */
export function combineVariants(...variants: Variants[]): Variants {
  return variants.reduce((acc, variant) => ({ ...acc, ...variant }), {});
}

/**
 * Helper: Crear transición personalizada
 */
export function createTransition(options: {
  duration?: number;
  delay?: number;
  ease?: typeof EASING[keyof typeof EASING];
  type?: 'tween' | 'spring';
  stiffness?: number;
  damping?: number;
}): Transition {
  const {
    duration = DURATION.normal,
    delay = 0,
    ease = EASING.standard,
    type = 'tween',
    stiffness,
    damping,
  } = options;

  if (type === 'spring') {
    return {
      type: 'spring',
      stiffness: stiffness || 300,
      damping: damping || 25,
      delay,
    };
  }

  return {
    duration,
    delay,
    ease,
  };
}

/**
 * Helper: Reducir motion (respeta prefers-reduced-motion)
 */
export function respectReducedMotion<T extends Variants>(variants: T): T {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Eliminar todas las animaciones, solo mantener estados final
    const reduced: any = {};
    Object.keys(variants).forEach((key) => {
      const variant = variants[key];
      if (typeof variant === 'object' && variant !== null) {
        // Mantener solo los valores finales, sin transiciones
        const { transition, ...rest } = variant as any;
        reduced[key] = {
          ...rest,
          transition: { duration: 0 },
        };
      } else {
        reduced[key] = variant;
      }
    });
    return reduced as T;
  }
  return variants;
}

// ============================================
// PRESET COMBINATIONS
// ============================================

/**
 * PRESET: Modal con backdrop
 */
export const modalPreset = {
  backdrop: fadeVariants,
  modal: scaleVariants,
};

/**
 * PRESET: Bottom sheet (mobile)
 */
export const bottomSheetPreset = {
  backdrop: fadeVariants,
  sheet: slideUpVariants,
};

/**
 * PRESET: Toast notification
 */
export const toastPreset = {
  toast: slideDownVariants,
};

/**
 * PRESET: Lista con stagger
 */
export const listPreset = {
  container: staggerContainerVariants,
  item: staggerItemVariants,
};

// ============================================
// EXPORT TYPES
// ============================================

export type DurationToken = typeof DURATION[keyof typeof DURATION];
export type EasingToken = typeof EASING[keyof typeof EASING];
export type TransitionPreset = typeof TRANSITIONS[keyof typeof TRANSITIONS];

/**
 * EJEMPLO DE USO:
 *
 * import { motion } from 'framer-motion';
 * import { fadeVariants, slideUpVariants, TRANSITIONS } from '@/lib/motion/system';
 *
 * // Fade in simple
 * <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit">
 *   Content
 * </motion.div>
 *
 * // Modal con scale
 * <motion.div variants={scaleVariants} initial="hidden" animate="visible" exit="exit">
 *   Modal content
 * </motion.div>
 *
 * // Lista con stagger
 * <motion.ul variants={staggerContainerVariants} initial="hidden" animate="visible">
 *   {items.map((item) => (
 *     <motion.li key={item.id} variants={staggerItemVariants}>
 *       {item.name}
 *     </motion.li>
 *   ))}
 * </motion.ul>
 *
 * // Custom transition
 * <motion.div
 *   animate={{ opacity: 1 }}
 *   transition={TRANSITIONS.spring}
 * >
 *   Content
 * </motion.div>
 */
