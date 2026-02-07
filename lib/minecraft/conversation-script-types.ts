/**
 * Sistema de Guiones Conversacionales para Grupos de Minecraft
 *
 * Genera conversaciones completas con estructura coherente:
 * Saludo → Desarrollo → Despedida
 */

/**
 * Fases de una conversación
 */
export enum ConversationPhase {
  GREETING = "greeting", // Saludo inicial (1-2 intercambios)
  TOPIC_INTRODUCTION = "topic_introduction", // Introducción del tema (2-3 intercambios)
  DEVELOPMENT = "development", // Desarrollo del tema (3-5 intercambios)
  CONCLUSION = "conclusion", // Conclusión (1-2 intercambios)
  FAREWELL = "farewell", // Despedida (1-2 intercambios)
}

/**
 * Línea de diálogo individual
 */
export interface DialogueLine {
  agentId: string;
  agentName: string;
  message: string;
  emotion?: string;
  phase: ConversationPhase;
  lineNumber: number; // Número de línea en el guión
}

/**
 * Guión conversacional completo
 */
export interface ConversationScript {
  scriptId: string; // UUID único
  version: number; // Número de versión (incrementa con cada actualización)
  participants: Array<{
    agentId: string;
    name: string;
    personality: string;
  }>;
  topic: string; // Tema principal de la conversación
  location: string;
  contextHint?: string;
  lines: DialogueLine[]; // Todas las líneas del guión (10-15 típicamente)
  duration: number; // Duración estimada en segundos
  createdAt: Date;
  updatedAt: Date; // Última actualización
  generatedBy: "ai" | "template"; // Origen del guión
}

/**
 * Metadata de guión (sin las líneas completas)
 * Usado para verificación de versiones
 */
export interface ScriptMetadata {
  scriptId: string;
  groupHash: string;
  version: number;
  topic: string;
  totalLines: number;
  updatedAt: Date;
  generatedBy: "ai" | "template";
}

/**
 * Estado de progreso de una conversación activa
 */
export interface ConversationProgress {
  scriptId: string;
  groupHash: string; // Hash de participantes
  currentLineIndex: number; // Línea actual del guión
  currentPhase: ConversationPhase;
  startedAt: Date;
  lastAdvanceAt: Date;
  completed: boolean;
  listeners: string[]; // IDs de jugadores que escucharon
}

/**
 * Configuración de timing para avanzar el guión
 */
export interface ScriptTiming {
  minDelayBetweenLines: number; // Mínimo delay entre líneas (segundos)
  maxDelayBetweenLines: number; // Máximo delay entre líneas (segundos)
  pauseAtPhaseChange: number; // Pausa al cambiar de fase (segundos)
  loopAfterCompletion: boolean; // ¿Reiniciar después de completar?
  loopDelay: number; // Delay antes de reiniciar (segundos)
}

/**
 * Template de conversación pre-definido
 */
export interface ConversationTemplate {
  id: string;
  name: string;
  topic: string;
  category: "casual" | "work" | "gossip" | "planning" | "storytelling";
  minParticipants: number;
  maxParticipants: number;
  lines: Array<{
    speakerIndex: number; // 0 = primer participante, 1 = segundo, etc.
    message: string; // Puede contener placeholders: {name}, {personality}
    phase: ConversationPhase;
  }>;
}

/**
 * Opciones para generar un guión
 */
export interface ScriptGenerationOptions {
  participants: Array<{
    agentId: string;
    name: string;
    personality: string;
  }>;
  location: string;
  contextHint?: string;
  topic?: string; // Si no se provee, se genera automáticamente
  desiredLength?: number; // Número deseado de líneas (10-20)
  useTemplate?: boolean; // Si true, intenta usar template primero
  forceAI?: boolean; // Si true, fuerza generación con IA
}

/**
 * Resultado de generación de guión
 */
export interface ScriptGenerationResult {
  script: ConversationScript;
  cached: boolean; // Si se reutilizó un script en caché
  cost: number; // Costo en USD (si usó IA)
  source: "ai" | "template" | "cache";
}
