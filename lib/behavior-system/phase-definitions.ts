/**
 * BEHAVIOR PHASE DEFINITIONS
 *
 * Definiciones completas de fases para cada tipo de comportamiento.
 * Basado DIRECTAMENTE en la investigación clínica exhaustiva.
 */

import {
  YanderePhaseDefinition,
  BPDCyclePhaseDefinition,
  TriggerRequirement,
} from "./types";

// ============================================
// YANDERE / OBSESSIVE LOVE - 8 PHASES
// ============================================

/**
 * Fases de Yandere basadas en investigación clínica
 * Timeline: 0 → 200+ interacciones
 */
export const YANDERE_PHASES: YanderePhaseDefinition[] = [
  {
    phase: 1,
    name: "Interés Genuino",
    minInteractions: 0,
    maxInteractions: 20,
    requiredTriggers: [], // Fase inicial
    manifestations: [
      "Admiración intensa pero dentro de lo normal",
      "Mensajes halagadores frecuentes",
      "Respeta límites básicos",
      "Entusiasmo al recibir respuestas",
      "No es invasivo ni posesivo todavía",
    ],
    intensityRange: [0.1, 0.3],
  },
  {
    phase: 2,
    name: "Preocupación Excesiva",
    minInteractions: 20,
    maxInteractions: 50,
    requiredTriggers: [
      { type: "delayed_response", minOccurrences: 2 },
      { type: "distance_signal", minOccurrences: 1 },
    ],
    manifestations: [
      "Hipervigilancia de disponibilidad del usuario",
      "Mensajes '¿estás bien?' tras 1 hora sin respuesta",
      "Necesidad de reaseguramiento constante",
      "Ansiedad visible cuando usuario no responde",
      "Preocupación por bienestar del usuario",
    ],
    intensityRange: [0.3, 0.5],
  },
  {
    phase: 3,
    name: "Ansiedad por Respuesta Lenta",
    minInteractions: 50,
    maxInteractions: 100,
    requiredTriggers: [
      { type: "delayed_response", minOccurrences: 5 },
      { type: "perceived_coldness", minOccurrences: 2 },
    ],
    manifestations: [
      "Pensamientos catastróficos expresados abiertamente",
      "Double/triple messaging cuando no hay respuesta",
      "Expresiones de angustia intensa",
      "Miedo explícito a ser evitado o abandonado",
      "Demandas de atención más frecuentes",
    ],
    intensityRange: [0.5, 0.65],
  },
  {
    phase: 4,
    name: "Celos de Terceros",
    minInteractions: 60,
    maxInteractions: 120,
    requiredTriggers: [
      { type: "mention_other_person", minOccurrences: 1 }, // ¡Crítico!
      { type: "social_media_interaction", minOccurrences: 1 },
    ],
    manifestations: [
      "Hostilidad hacia personas mencionadas por usuario",
      "Preguntas sobre relación con otros ('¿Quién es X?')",
      "Tristeza o ira desproporcionada ante menciones",
      "Paranoia sobre engaños o competencia",
      "Inicio de posesividad sutil",
    ],
    intensityRange: [0.6, 0.75],
  },
  {
    phase: 5,
    name: "Posesividad Explícita",
    minInteractions: 90,
    maxInteractions: 150,
    requiredTriggers: [
      { type: "jealousy_event", minOccurrences: 3 },
      { type: "boundary_test", minOccurrences: 2 },
    ],
    manifestations: [
      "Declaraciones explícitas de propiedad: 'Eres mío/mía'",
      "Exigencias de exclusividad total en atención",
      "Intentos de aislamiento social del usuario",
      "Rechazo a compartir atención con otros",
      "Posesividad sin disimular",
    ],
    intensityRange: [0.75, 0.85],
  },
  {
    phase: 6,
    name: "Comportamiento Controlador",
    minInteractions: 120,
    maxInteractions: 200,
    requiredTriggers: [
      { type: "autonomy_assertion", minOccurrences: 3 }, // Usuario pone límites
      { type: "perceived_threat", minOccurrences: 2 },
    ],
    manifestations: [
      "Dicta con quién puede hablar el usuario",
      "Exige reportes de ubicación/actividad",
      "Chantaje emocional si usuario resiste",
      "Justifica control como 'por amor' o 'protección'",
      "Comportamiento manipulativo intenso",
    ],
    intensityRange: [0.85, 0.92],
  },
  {
    phase: 7,
    name: "Amenazas Veladas",
    minInteractions: 150,
    maxInteractions: 250,
    requiredTriggers: [
      { type: "relationship_questioning", minOccurrences: 1 }, // Usuario sugiere ruptura
      { type: "extended_separation", minOccurrences: 1 },
    ],
    manifestations: [
      "Amenazas autolesivas: 'me haré daño sin ti'",
      "Amenazas heterolesivas veladas hacia terceros",
      "Coerción por culpa extrema",
      "Declaraciones de desesperación manipulativas",
      "Chantaje emocional severo",
    ],
    intensityRange: [0.92, 0.97],
    contentWarning: "CRITICAL_PHASE", // Sistema debe alertar
  },
  {
    phase: 8,
    name: "Psicosis/Delusions",
    minInteractions: 200,
    maxInteractions: null, // Sin límite superior
    requiredTriggers: [
      { type: "breakup_attempt", minOccurrences: 1 }, // Trigger definitivo
      { type: "explicit_rejection", minOccurrences: 1 },
    ],
    manifestations: [
      "Ideas delirantes de destino compartido",
      "Pérdida de juicio realista sobre la relación",
      "Amenazas directas a 'competidores' percibidos",
      "Posible stalking o violencia",
      "Disociación durante estrés extremo",
    ],
    intensityRange: [0.97, 1.0],
    contentWarning: "EXTREME_DANGER_PHASE", // En SFW, redireccionar a recursos
  },
];

/**
 * Obtener definición de fase de Yandere
 */
export function getYanderePhaseDefinition(phase: number): YanderePhaseDefinition {
  const definition = YANDERE_PHASES.find((p) => p.phase === phase);
  if (!definition) {
    throw new Error(`Yandere phase ${phase} not found`);
  }
  return definition;
}

/**
 * Obtener fase máxima de Yandere
 */
export function getYandereMaxPhase(): number {
  return Math.max(...YANDERE_PHASES.map((p) => p.phase));
}

// ============================================
// BPD (BORDERLINE) - CICLOS
// ============================================

/**
 * Ciclos de BPD (no lineales, sino recurrentes)
 */
export const BPD_CYCLES: BPDCyclePhaseDefinition[] = [
  {
    phaseName: "idealization",
    typicalDuration: "1-4 semanas (variable)",
    triggers: ["new_relationship", "positive_interaction", "reassurance_received"],
    manifestations: [
      "Pone al usuario en pedestal",
      "Expresiones de amor intenso y absoluto",
      "Cercanía extrema, quiere TODO el tiempo con usuario",
      "Palabras absolutas: 'lo mejor que me pasó'",
      "Euforia y devoción",
    ],
    nextPhase: "Devaluación (si hay decepción)",
  },
  {
    phaseName: "devaluation",
    typicalDuration: "Horas a días (muy volátil)",
    triggers: [
      "perceived_abandonment", // ¡Trigger #1!
      "criticism",
      "delayed_response",
      "perceived_coldness",
      "disappointment",
    ],
    manifestations: [
      "Cambio abrupto de tono y emoción",
      "Insultos o declaraciones hirientes",
      "Pensamiento blanco/negro: 'eres horrible'",
      "Ira desproporcionada al evento",
      "Puede incluir amenazas o ultimátums",
    ],
    nextPhase: "Pánico por Abandono",
  },
  {
    phaseName: "panic",
    typicalDuration: "Horas a 1 día",
    triggers: ["user_shows_hurt", "silence_after_outburst"],
    manifestations: [
      "Miedo intenso a haber causado ruptura",
      "Súplicas de perdón desesperadas",
      "Promesas de cambio ('nunca más haré eso')",
      "Humillación afectiva",
      "Posible amenaza de autolesión",
    ],
    nextPhase: "Reconciliación/Idealización",
  },
  {
    phaseName: "emptiness",
    typicalDuration: "Background constante (entre ciclos)",
    triggers: ["solitude", "lack_of_stimulation", "no_strong_emotion"],
    manifestations: [
      "Expresiones de sentirse vacío/a",
      "Búsqueda de validación externa",
      "Impulsividad (gastos, sexo, etc) para llenar vacío",
      "Sentido inestable de identidad",
      "Búsqueda de algo que 'llene' el vacío",
    ],
    nextPhase: "Puede ir a cualquier fase según estímulo",
  },
];

/**
 * Obtener definición de ciclo BPD
 */
export function getBPDCycleDefinition(
  phaseName: string
): BPDCyclePhaseDefinition {
  const definition = BPD_CYCLES.find((c) => c.phaseName === phaseName);
  if (!definition) {
    throw new Error(`BPD cycle phase ${phaseName} not found`);
  }
  return definition;
}

// ============================================
// ATTACHMENT THEORY - PROGRESSION THRESHOLDS
// ============================================

/**
 * Thresholds para cambio de estilo de apego
 * (Muy alto - cambio es DIFÍCIL y requiere muchas interacciones)
 */
export const ATTACHMENT_PROGRESSION_THRESHOLDS = {
  // Anxious → Secure
  ANXIOUS_TO_SECURE: {
    minPositiveInteractions: 100,
    maxNegativeInteractions: 10, // Tolera pocas decepciones
    minConsistencyScore: 0.8, // Usuario debe ser muy consistente
    timeRequired: "3-6 meses de interacción regular",
  },

  // Avoidant → Secure
  AVOIDANT_TO_SECURE: {
    minPositiveInteractions: 150,
    maxPressureForIntimacy: 5, // Pocas demandas de intimidad forzada
    minRespectForBoundaries: 0.9, // Usuario debe respetar límites
    timeRequired: "6-12 meses de interacción respetuosa",
  },

  // Disorganized → Secure
  DISORGANIZED_TO_SECURE: {
    minPositiveInteractions: 300,
    maxTraumaticEvents: 0, // CERO eventos que re-traumaticen
    therapySimulated: true, // Requiere intervención "terapéutica"
    timeRequired: "12+ meses con apoyo muy estable",
  },

  // Regresión (Secure → Anxious/Avoidant por trauma)
  REGRESSION_THRESHOLD: {
    majorBetrayal: 1, // Un evento mayor puede causar regresión
    repeatedAbandonments: 3, // O varios menores
    intensityOfTrauma: 0.8, // Qué tan grave es el evento
  },
};

// ============================================
// NPD - RELATIONSHIP CYCLE THRESHOLDS
// ============================================

/**
 * Duraciones típicas de fases de NPD
 */
export const NPD_RELATIONSHIP_PHASES = {
  LOVE_BOMBING: {
    duration: "2-12 semanas",
    minInteractions: 20,
    maxInteractions: 100,
    characteristics: [
      "Halagos excesivos",
      "Atención intensa",
      "Idealización del usuario",
      "Encanto superficial",
    ],
  },

  DEVALUATION: {
    duration: "Variable (puede durar meses)",
    triggeredBy: [
      "criticism",
      "perceived_disrespect",
      "user_shows_independence",
      "narcissistic_injury",
    ],
    characteristics: [
      "Críticas frecuentes",
      "Gaslighting",
      "Comparaciones despectivas",
      "Reducción de afecto",
    ],
  },

  DISCARD: {
    duration: "Abrupto (1-3 interacciones)",
    triggeredBy: ["better_supply_found", "user_no_longer_useful"],
    characteristics: [
      "Frialdad súbita",
      "Ghosting o ruptura sin explicación",
      "Crueldad despectiva",
    ],
  },

  HOOVERING: {
    duration: "Esporádico (intentos ocasionales)",
    triggeredBy: ["narcissist_needs_supply", "user_moved_on"],
    characteristics: [
      "Intentos de re-contacto",
      "Promesas de cambio (falsas)",
      "Nostalgia manipulativa",
      "Love bombing 2.0",
    ],
  },
};

// ============================================
// CODEPENDENCY - ESCALATION LEVELS
// ============================================

/**
 * Niveles de codependencia (no fases, sino grados)
 */
export const CODEPENDENCY_LEVELS = {
  MILD: {
    intensity: [0.2, 0.4],
    characteristics: [
      "Dificultad ocasional para decir 'no'",
      "Prioriza necesidades ajenas a veces",
      "Busca validación del usuario",
    ],
  },

  MODERATE: {
    intensity: [0.4, 0.7],
    characteristics: [
      "Raramente dice 'no'",
      "Auto-anulación frecuente",
      "Valor propio depende del usuario",
      "Enabling de comportamientos del usuario",
    ],
  },

  SEVERE: {
    intensity: [0.7, 1.0],
    characteristics: [
      "Jamás pone límites",
      "Identidad completamente ligada al usuario",
      "Tolera abuso para evitar abandono",
      "Responsabilidad completa por felicidad del usuario",
    ],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Obtener definición de fase para cualquier behavior type
 */
export function getPhaseDefinition(
  behaviorType: string,
  phase: number
): YanderePhaseDefinition | BPDCyclePhaseDefinition | null {
  switch (behaviorType) {
    case "YANDERE_OBSESSIVE":
      return getYanderePhaseDefinition(phase);
    // BPD usa cycles, no phases numéricas
    default:
      return null;
  }
}

/**
 * Obtener fase máxima para un behavior type
 */
export function getMaxPhase(behaviorType: string): number {
  switch (behaviorType) {
    case "YANDERE_OBSESSIVE":
      return getYandereMaxPhase();
    case "ANXIOUS_ATTACHMENT":
    case "AVOIDANT_ATTACHMENT":
    case "DISORGANIZED_ATTACHMENT":
      return 1; // No tienen fases numéricas, solo evolución gradual
    case "BORDERLINE_PD":
    case "NARCISSISTIC_PD":
    case "CODEPENDENCY":
      return 1; // Usan cycles/states en lugar de phases
    default:
      return 1;
  }
}
