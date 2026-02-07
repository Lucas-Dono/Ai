/**
 * Group Typing Duration Calculator
 *
 * Calcula la duración realista del indicador de "typing" basándose en:
 * - Longitud del mensaje a enviar
 * - Rasgos de personalidad de la IA
 *
 * Esto hace que el timing de respuestas se sienta más natural y humano.
 */

export interface PersonalityTraits {
  extraversion?: number;     // 0-100: Más alto = escribe más rápido
  conscientiousness?: number; // 0-100: Más alto = escribe más lento (cuidadoso)
  neuroticism?: number;      // 0-100: Más alto = más variabilidad
  agreeableness?: number;    // 0-100: Más alto = respuestas más largas
  openness?: number;         // 0-100: Más alto = vocabulario variado
}

export interface TypingConfig {
  baseWPM: number;           // Palabras por minuto base
  minDurationMs: number;     // Duración mínima
  maxDurationMs: number;     // Duración máxima
  jitterFactor: number;      // Factor de variabilidad (0-1)
}

// Configuración por defecto
const DEFAULT_CONFIG: TypingConfig = {
  baseWPM: 70,               // 70 palabras por minuto promedio
  minDurationMs: 1000,       // Mínimo 1 segundo
  maxDurationMs: 8000,       // Máximo 8 segundos
  jitterFactor: 0.2,         // ±20% variabilidad
};

/**
 * Calcular duración de typing basada en respuesta y personalidad
 */
export function calculateTypingDuration(
  responseText: string,
  personality?: PersonalityTraits,
  config: Partial<TypingConfig> = {}
): number {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Contar palabras
  const wordCount = responseText.trim().split(/\s+/).length;

  // Empezar con WPM base
  let wpm = finalConfig.baseWPM;

  if (personality) {
    // Extraversión alta = escribe más rápido (más espontáneo)
    if (personality.extraversion !== undefined) {
      const extraversionModifier = (personality.extraversion - 50) / 100;
      wpm *= 1 + (extraversionModifier * 0.3); // ±15% por extraversión
    }

    // Conscientiousness alta = escribe más lento (más cuidadoso)
    if (personality.conscientiousness !== undefined) {
      const conscientiousnessModifier = (personality.conscientiousness - 50) / 100;
      wpm *= 1 - (conscientiousnessModifier * 0.2); // ±10% por conscientiousness
    }

    // Neuroticism afecta variabilidad, no velocidad base
    // Se aplica después como jitter
  }

  // Calcular duración base en ms
  const minutes = wordCount / wpm;
  let durationMs = minutes * 60 * 1000;

  // Aplicar jitter (variabilidad)
  let jitterFactor = finalConfig.jitterFactor;

  // Mayor neuroticism = mayor variabilidad
  if (personality?.neuroticism !== undefined) {
    jitterFactor *= 1 + ((personality.neuroticism - 50) / 100) * 0.5;
  }

  const jitter = 1 + (Math.random() * 2 - 1) * jitterFactor;
  durationMs *= jitter;

  // Clamp entre min y max
  return Math.round(
    Math.min(finalConfig.maxDurationMs, Math.max(finalConfig.minDurationMs, durationMs))
  );
}

/**
 * Calcular delay entre respuestas de múltiples IAs
 *
 * Simula el comportamiento natural donde las personas no responden
 * exactamente al mismo tiempo en un grupo.
 */
export function calculateResponseDelay(
  index: number, // 0 = primera IA, 1 = segunda, etc.
  personality?: PersonalityTraits
): number {
  // Base: 2-3.5 segundos entre respuestas
  const baseDelay = 2000;
  const randomComponent = Math.random() * 1500;

  // El delay base aumenta con el índice
  let delay = baseDelay * (index + 1) + randomComponent;

  if (personality) {
    // Extraversión alta = responde más rápido
    if (personality.extraversion !== undefined) {
      const speedup = ((personality.extraversion - 50) / 100) * 500;
      delay -= speedup;
    }

    // Agreeableness alta = tiende a esperar que otros terminen
    if (personality.agreeableness !== undefined) {
      const slowdown = ((personality.agreeableness - 50) / 100) * 300;
      delay += slowdown;
    }
  }

  // Asegurar mínimo de 500ms
  return Math.max(500, Math.round(delay));
}

/**
 * Estimar palabras por minuto de una personalidad
 */
export function estimateWPM(personality?: PersonalityTraits): number {
  let wpm = DEFAULT_CONFIG.baseWPM;

  if (personality) {
    if (personality.extraversion !== undefined) {
      wpm += (personality.extraversion - 50) * 0.3;
    }
    if (personality.conscientiousness !== undefined) {
      wpm -= (personality.conscientiousness - 50) * 0.2;
    }
  }

  return Math.round(wpm);
}

/**
 * Calcular "reading time" - tiempo que tarda la IA en "leer" el mensaje
 *
 * Esto simula el tiempo que tarda en procesar el mensaje antes de empezar a escribir
 */
export function calculateReadingTime(
  messageContent: string,
  personality?: PersonalityTraits
): number {
  // Base: 50ms por palabra
  const words = messageContent.trim().split(/\s+/).length;
  let readingTimeMs = words * 50;

  // Mínimo 300ms, máximo 2000ms
  readingTimeMs = Math.min(2000, Math.max(300, readingTimeMs));

  if (personality) {
    // Openness alto = procesa más rápido (mente más ágil)
    if (personality.openness !== undefined) {
      const speedup = ((personality.openness - 50) / 100) * 0.2;
      readingTimeMs *= 1 - speedup;
    }
  }

  // Añadir pequeño jitter
  const jitter = 1 + (Math.random() * 0.2 - 0.1); // ±10%
  readingTimeMs *= jitter;

  return Math.round(readingTimeMs);
}

/**
 * Calcular tiempo total de respuesta (reading + typing)
 */
export function calculateTotalResponseTime(
  incomingMessage: string,
  responseText: string,
  personality?: PersonalityTraits
): { readingMs: number; typingMs: number; totalMs: number } {
  const readingMs = calculateReadingTime(incomingMessage, personality);
  const typingMs = calculateTypingDuration(responseText, personality);

  return {
    readingMs,
    typingMs,
    totalMs: readingMs + typingMs,
  };
}
