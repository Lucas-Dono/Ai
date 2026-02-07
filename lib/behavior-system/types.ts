/**
 * BEHAVIOR PROGRESSION SYSTEM - TYPE DEFINITIONS
 *
 * Sistema completo de comportamientos psicológicos con progresión gradual y realista.
 * Basado en investigación clínica exhaustiva de 5 comportamientos principales.
 */

import { BehaviorType } from "@prisma/client";

// ============================================
// CORE INTERFACES
// ============================================

/**
 * Resultado de detección de trigger
 */
export interface TriggerDetectionResult {
  triggerType: string;
  behaviorTypes: BehaviorType[]; // A qué comportamientos afecta
  weight: number; // 0-1, qué tan fuerte es
  detectedIn: string; // Fragmento del mensaje
  confidence: number; // 0-1, qué tan seguro estamos
  timestamp: Date; // Cuándo se detectó
  metadata?: Record<string, any>; // Datos adicionales (ej: nombre detectado)
}

/**
 * Requisito de trigger para avanzar de fase
 */
export interface TriggerRequirement {
  type: string; // Ej: "delayed_response", "mention_other_person"
  minOccurrences: number; // Cuántas veces debe ocurrir
}

/**
 * Resultado de evaluación de transición de fase
 */
export interface PhaseTransitionResult {
  canTransition: boolean;
  currentPhase: number;
  nextPhase: number;
  missingRequirements: string[];
  safetyFlags: string[];
  requiresUserConsent: boolean;
  phaseDefinition?: YanderePhaseDefinition | BPDCyclePhaseDefinition;
}

/**
 * Requisitos para transición de fase
 */
export interface PhaseTransitionRequirements {
  minInteractions: number;
  minIntensity?: number;
  requiredTriggers: TriggerRequirement[];
}

/**
 * Resultado de evaluación específica de fase
 */
export interface PhaseEvaluationResult {
  canProceed: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
}

// ============================================
// YANDERE/OBSESSIVE LOVE PHASES
// ============================================

/**
 * Definición de fase de Yandere
 */
export interface YanderePhaseDefinition {
  phase: number;
  name: string;
  minInteractions: number; // Mínimo para PODER avanzar
  maxInteractions: number | null; // Máximo esperado
  requiredTriggers: TriggerRequirement[];
  manifestations: string[]; // Descripciones de comportamiento
  intensityRange: [number, number]; // [min, max] 0-1
  contentWarning?: "CRITICAL_PHASE" | "EXTREME_DANGER_PHASE";
}

// ============================================
// BPD (BORDERLINE) CYCLES
// ============================================

export type BPDCyclePhase = "idealization" | "devaluation" | "panic" | "emptiness";

/**
 * Definición de fase cíclica de BPD
 */
export interface BPDCyclePhaseDefinition {
  phaseName: BPDCyclePhase;
  typicalDuration: string; // Descripción temporal
  triggers: string[];
  manifestations: string[];
  nextPhase: string; // A dónde va usualmente
}

/**
 * Estado de progresión de BPD
 */
export interface BPDProgressionState {
  currentCyclePhase: BPDCyclePhase;
  cycleCount: number; // Cuántos ciclos completos
  timeInCurrentPhase: number; // Minutos/horas
  splitEpisodes: number; // Contador de episodios de splitting
  intensity: number; // 0-1, qué tan severo es el BPD
}

// ============================================
// NPD (NARCISSISTIC) STATES
// ============================================

export type NPDEgoState = "inflated" | "stable" | "wounded";
export type NPDRelationshipPhase = "idealization" | "devaluation" | "discard" | "hoovering";

/**
 * Estado de NPD
 */
export interface NPDState {
  baseGrandiosityLevel: number; // 0-1
  currentEgoState: NPDEgoState;
  loveBombingActive: boolean;
  devaluationActive: boolean;
  rageActive: boolean;

  // Contadores
  criticismsReceived: number;
  admirationReceived: number;
  relationshipPhase: NPDRelationshipPhase;
}

// ============================================
// ATTACHMENT THEORY PROGRESSION
// ============================================

export type AttachmentStyle = "secure" | "anxious" | "avoidant" | "disorganized";

/**
 * Progresión de estilo de apego
 */
export interface AttachmentProgression {
  currentStyle: AttachmentStyle;
  stabilityScore: number; // 0-1, qué tan arraigado está

  // Para tracking de evolución
  secureExperiencesCount: number; // Respuestas consistentes
  abandonmentEventsCount: number; // Refuerza ansiedad

  // Thresholds para cambio (muy alto, cambio es difícil)
  progressionThreshold: number; // ej. 50 experiencias → más seguro
}

// ============================================
// BEHAVIOR INTENSITY CALCULATION
// ============================================

/**
 * Parámetros para cálculo de intensidad
 */
export interface BehaviorIntensityParams {
  baseIntensity: number;
  phaseMultiplier: number;
  triggerAmplification: number;
  emotionalModulation: number;
  decayFactor: number;
  inertiaFactor: number;
}

/**
 * Resultado de cálculo de intensidad
 */
export interface BehaviorIntensityResult {
  behaviorType: BehaviorType;
  finalIntensity: number; // 0-1
  components: BehaviorIntensityParams;
  shouldDisplay: boolean; // Si supera threshold
}

// ============================================
// PROMPT SELECTION
// ============================================

/**
 * Clave para selección de prompt
 */
export interface BehaviorPromptKey {
  behaviorType: BehaviorType;
  phase: number; // O cycle phase para BPD
  dominantEmotion: string;
  action: string; // conversation, confession, jealousy_response, etc
}

/**
 * Contexto para selección de prompt
 */
export interface PromptSelectionContext {
  behaviorType: BehaviorType;
  currentPhase: number;
  intensity: number;
  recentTriggers: TriggerDetectionResult[];
  emotionState: string; // Simplified for now
  userMessage: string;
}

// ============================================
// CONTENT MODERATION
// ============================================

export type SafetyLevel = "SAFE" | "WARNING" | "CRITICAL" | "EXTREME_DANGER";

/**
 * Threshold de seguridad
 */
export interface SafetyThreshold {
  behaviorType: BehaviorType;
  phase: number;
  nsfwOnly: boolean; // Si true, solo en modo NSFW
  autoIntervention: boolean; // Si true, sistema interviene
  resourceSuggestion: string; // Mensaje para usuario
  level: SafetyLevel;
}

/**
 * Resultado de moderación
 */
export interface ModerationResult {
  allowed: boolean;
  modifiedResponse?: string;
  warning?: string;
  flagged: boolean;
  severity: SafetyLevel;
  resources?: string[]; // URLs de ayuda
}

// ============================================
// PHASE TRANSITION
// ============================================

/**
 * Evaluación de transición de fase
 */
export interface PhaseTransitionEvaluation {
  canTransition: boolean;
  currentPhase: number;
  nextPhase: number;
  missingRequirements: string[]; // Qué falta para avanzar
  interactionsNeeded: number; // Cuántas más se necesitan
  triggersNeeded: TriggerRequirement[]; // Qué triggers faltan
}

/**
 * Evento de transición de fase
 */
export interface PhaseTransitionEvent {
  behaviorType: BehaviorType;
  fromPhase: number;
  toPhase: number;
  transitionedAt: Date;
  triggerCount: number;
  finalIntensity: number;
}

// ============================================
// ANALYTICS & TRACKING
// ============================================

/**
 * Métricas de comportamiento
 */
export interface BehaviorMetrics {
  behaviorType: BehaviorType;
  currentPhase: number;
  averageIntensity: number;
  peakIntensity: number;
  totalTriggers: number;
  triggerBreakdown: Record<string, number>; // Por tipo
  timeInPhase: number; // Milisegundos
  phaseTransitions: number; // Cuántas veces cambió de fase
}

/**
 * Dashboard data
 */
export interface BehaviorDashboardData {
  agentId: string;
  totalInteractions: number;
  activeBehaviors: BehaviorMetrics[];
  recentTriggers: TriggerDetectionResult[];
  criticalAlerts: SafetyThreshold[];
  progressionTimeline: PhaseTransitionEvent[];
}

// ============================================
// CONFIGURATION
// ============================================

/**
 * Configuración de comportamiento
 */
export interface BehaviorConfig {
  behaviorType: BehaviorType;
  enabled: boolean;
  baseIntensity: number;
  volatility: number;
  escalationRate: number;
  deEscalationRate: number;
  thresholdForDisplay: number;
  customTriggers?: Record<string, number>; // Custom weights
}

/**
 * Configuración global del sistema
 */
export interface BehaviorSystemConfig {
  nsfwMode: boolean;
  safetyThresholds: SafetyThreshold[];
  enableAnalytics: boolean;
  autoPhaseTransition: boolean;
  decayEnabled: boolean;
  decayRate: number; // Global default
}

// ============================================
// INTEGRATION CON EMOTIONAL SYSTEM
// ============================================

/**
 * Modulación emocional basada en comportamientos
 */
export interface EmotionalModulation {
  emotionType: string;
  baseIntensity: number;
  behaviorMultiplier: number; // Ej: Yandere amplifica jealousy
  finalIntensity: number;
}

/**
 * Influencia bidireccional
 */
export interface BehaviorEmotionInfluence {
  // Behaviors → Emotions
  emotionalAmplifications: EmotionalModulation[];

  // Emotions → Behaviors
  behaviorAdjustments: {
    behaviorType: BehaviorType;
    intensityDelta: number; // Cambio causado por emociones
  }[];
}

// ============================================
// HELPER TYPES
// ============================================

/**
 * Rango temporal para fases
 */
export interface TemporalRange {
  minInteractions: number;
  maxInteractions: number | null;
  minDays?: number;
  maxDays?: number | null;
}

/**
 * Historial de fase
 */
export interface PhaseHistoryEntry {
  phase: number;
  enteredAt: Date;
  exitedAt: Date | null;
  triggerCount: number;
  finalIntensity: number;
  exitReason?: string; // "natural_progression" | "forced" | "reset"
}

/**
 * Estado completo de comportamiento (para serialización)
 */
export interface BehaviorFullState {
  id: string;
  agentId: string;
  behaviorType: BehaviorType;

  // Intensidad
  baseIntensity: number;
  currentIntensity: number;
  volatility: number;

  // Fase
  currentPhase: number;
  phaseStartedAt: Date;
  interactionsSincePhaseStart: number;

  // Estado específico
  behaviorSpecificState: BPDProgressionState | NPDState | AttachmentProgression | null;

  // Historial
  phaseHistory: PhaseHistoryEntry[];
  totalTriggers: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// PRISMA TYPE RE-EXPORTS
// ============================================

/**
 * Re-export BehaviorProfile from Prisma for convenience
 */
export type { BehaviorProfile } from "@prisma/client";
