import { z } from "zod";

/**
 * Tipos para el sistema de chat grupal de Minecraft
 *
 * Sistema de coordenadas de Minecraft:
 * - X: Este (+) / Oeste (-)
 * - Y: Arriba (+) / Abajo (-)
 * - Z: Sur (+) / Norte (-)
 * - Yaw: Rotación horizontal (-180 a +180° en Java, 0-360° en Bedrock)
 * - Pitch: Rotación vertical (-90 a +90°)
 */

// ============================================================================
// Posición y Orientación
// ============================================================================

export const MinecraftPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  yaw: z.number().min(-180).max(360).optional(), // Rotación horizontal (soporta ambos formatos)
  pitch: z.number().min(-90).max(90).optional(), // Rotación vertical
  dimensionId: z.string().default("minecraft:overworld"), // overworld, nether, end
});

export type MinecraftPosition = z.infer<typeof MinecraftPositionSchema>;

// ============================================================================
// Entidades (Jugador y Agentes)
// ============================================================================

export const MinecraftPlayerSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string().min(1).max(16),
  position: MinecraftPositionSchema,
  userId: z.string().optional(), // ID del usuario en la BD (si está autenticado)
});

export type MinecraftPlayer = z.infer<typeof MinecraftPlayerSchema>;

export const MinecraftAgentSchema = z.object({
  agentId: z.string(), // ID de Agent en la BD
  entityId: z.number().int(), // ID de la entidad en Minecraft
  name: z.string(),
  position: MinecraftPositionSchema,
  isActive: z.boolean().default(true),
});

export type MinecraftAgent = z.infer<typeof MinecraftAgentSchema>;

// ============================================================================
// Contexto de Proximidad
// ============================================================================

export interface AgentProximityInfo {
  agent: MinecraftAgent;
  distance: number; // En bloques (1 bloque = 2 metros aprox)
  isVisible: boolean; // ¿Está en línea de visión?
  isFacing: boolean; // ¿El jugador lo está mirando?
  confidenceScore: number; // 0-100: probabilidad de que sea el target
  reasons: string[]; // Razones para el score
}

export interface ProximityContext {
  player: MinecraftPlayer;
  nearbyAgents: AgentProximityInfo[];
  primaryTarget: AgentProximityInfo | null; // Agente con mayor score
  isGroupConversation: boolean; // ¿Es conversación grupal o individual?
  detectedAt: Date;
}

export const ProximityContextSchema = z.object({
  player: MinecraftPlayerSchema,
  nearbyAgents: z.array(
    z.object({
      agent: MinecraftAgentSchema,
      distance: z.number(),
      isVisible: z.boolean(),
      isFacing: z.boolean(),
      confidenceScore: z.number().min(0).max(100),
      reasons: z.array(z.string()),
    })
  ),
  primaryTarget: z
    .object({
      agent: MinecraftAgentSchema,
      distance: z.number(),
      isVisible: z.boolean(),
      isFacing: z.boolean(),
      confidenceScore: z.number().min(0).max(100),
      reasons: z.array(z.string()),
    })
    .nullable(),
  isGroupConversation: z.boolean(),
  detectedAt: z.date(),
});

// ============================================================================
// Mensajes de Chat
// ============================================================================

export const MinecraftChatMessageSchema = z.object({
  messageId: z.string().optional(), // Se genera en el servidor
  content: z.string().min(1).max(5000),
  player: MinecraftPlayerSchema,
  proximityContext: ProximityContextSchema.optional(),
  replyToId: z.string().optional(), // ID de mensaje al que responde
  timestamp: z.date().default(() => new Date()),
  metadata: z
    .object({
      worldTime: z.number().optional(), // Tiempo del mundo (0-24000)
      weather: z.enum(["clear", "rain", "thunder"]).optional(),
      biome: z.string().optional(),
    })
    .optional(),
});

export type MinecraftChatMessage = z.infer<typeof MinecraftChatMessageSchema>;

// ============================================================================
// Comandos Embebidos
// ============================================================================

export const AgentCommandSchema = z.object({
  type: z.enum([
    "move_closer", // IA se acerca al jugador (si distancia > 4m)
    "walk_to_agent", // IA camina hacia otro agente (si < 20m)
    "teleport_to_agent", // IA teletransporta hacia otro agente (si > 20m, o uso el "sigueme")
    "redirect_question", // IA redirige pregunta a otro agente
    "wait_for_arrival", // Pausa hasta que NPC llegue
    "look_at_player", // IA mira al jugador
    "look_at_agent", // IA mira a otro agente
  ]),
  targetAgentId: z.string().optional(), // ID del agente objetivo
  targetPosition: MinecraftPositionSchema.optional(), // Posición objetivo
  pauseMessage: z.boolean().default(false), // Si true, pausa mensaje hasta completar comando
  question: z.string().optional(), // Pregunta a redirigir
  estimatedDuration: z.number().optional(), // Duración estimada en ms
});

export type AgentCommand = z.infer<typeof AgentCommandSchema>;

// ============================================================================
// Respuesta Estructurada (con partes)
// ============================================================================

export const ResponsePartSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("speech"),
    content: z.string(),
    emotion: z.string().optional(),
    animationHint: z
      .enum([
        "idle",
        "talking",
        "happy",
        "sad",
        "angry",
        "surprised",
        "thinking",
        "waving",
        "pointing",
        "beckoning",
      ])
      .optional(),
  }),
  z.object({
    type: z.literal("command"),
    command: AgentCommandSchema,
  }),
  z.object({
    type: z.literal("continuation"),
    content: z.string(),
    continuesAfterCommand: z.boolean().default(true),
  }),
]);

export type ResponsePart = z.infer<typeof ResponsePartSchema>;

export const MinecraftAgentResponseSchema = z.object({
  messageId: z.string(),
  agentId: z.string(),
  agentName: z.string(),
  content: z.string(), // Texto completo (para retrocompatibilidad)
  parts: z.array(ResponsePartSchema).optional(), // Partes estructuradas
  emotion: z.string().optional(), // Emoción primaria
  emotionalIntensity: z.number().min(0).max(1).optional(),
  timestamp: z.date(),
  turnNumber: z.number().int(), // Número de turno en la conversación
  voiceUrl: z.string().url().optional(), // URL del audio (si TTS habilitado)
  animationHint: z
    .enum([
      "idle",
      "talking",
      "happy",
      "sad",
      "angry",
      "surprised",
      "thinking",
      "waving",
      "pointing",
      "beckoning",
    ])
    .optional(),
});

export type MinecraftAgentResponse = z.infer<typeof MinecraftAgentResponseSchema>;

// ============================================================================
// Contexto Conversacional (historial reciente)
// ============================================================================

export interface ConversationContext {
  recentMessages: Array<{
    agentId: string;
    content: string;
    timestamp: Date;
  }>;
  lastSpokenAgentId: string | null; // Último agente con el que habló
  lastSpokenAt: Date | null; // Cuándo fue la última interacción
  conversationContinuity: boolean; // ¿Es continuación de conversación reciente?
}

// ============================================================================
// Análisis del Director (quién debe responder)
// ============================================================================

export interface DirectorAnalysis {
  conversationType: "individual" | "group" | "redirected";
  primaryResponderId: string; // Agente principal que responde
  secondaryResponders: string[]; // Agentes secundarios (si es grupal)
  reasoning: string; // Por qué se eligió este set de responders
  detectedContext: {
    isFacingNPC: boolean; // ¿Está mirando a un NPC específico?
    facingNPCId: string | null;
    hasRecentHistory: boolean; // ¿Hay historial reciente?
    mentionedAgents: string[]; // Agentes mencionados por nombre
    groupKeywords: string[]; // Palabras clave grupales encontradas
    hasAmbiguity: boolean; // ¿Hay ambigüedad que requiere redirección?
    ambiguousReference: string | null; // Ej: "tu amiga", "él"
  };
  requiresMovement: boolean; // ¿Algún agente necesita moverse?
  movementPlan: Array<{
    agentId: string;
    action: "move_closer" | "walk_to_agent" | "teleport_to_agent";
    reason: string;
  }>;
}

// ============================================================================
// Configuración del Sistema
// ============================================================================

export interface MinecraftChatConfig {
  proximityRadius: number; // Radio de detección en bloques (default: 16)
  maxResponders: number; // Máximo de agentes que responden (default: 3)
  responseDelay: number; // Delay entre respuestas en ms (default: 2000)
  facingAngleThreshold: number; // Ángulo para considerar "mirando" (default: 45°)
  confidenceThresholdIndividual: number; // Threshold para conversación 1:1 (default: 60)
  enableVoice: boolean; // ¿Habilitar TTS? (default: false)
  enableAnimations: boolean; // ¿Habilitar hints de animación? (default: true)
}

export const DEFAULT_MINECRAFT_CHAT_CONFIG: MinecraftChatConfig = {
  proximityRadius: 16, // 32 metros aprox
  maxResponders: 3,
  responseDelay: 2000, // 2 segundos
  facingAngleThreshold: 45, // ±45° del centro
  confidenceThresholdIndividual: 60,
  enableVoice: false, // Costoso, off por defecto
  enableAnimations: true,
};

// ============================================================================
// Constantes del Director
// ============================================================================

export const DIRECTOR_CONSTANTS = {
  INDIVIDUAL_DISTANCE_THRESHOLD: 7, // metros (< 7m + mirando = individual)
  MOVE_CLOSER_THRESHOLD: 4, // metros (> 4m = acercarse a 3m)
  WALK_TO_AGENT_THRESHOLD: 20, // metros (< 20m = caminar, > 20m = "sigueme")
  TARGET_DISTANCE: 3, // metros (distancia objetivo al acercarse)
  CONVERSATION_CONTINUITY_WINDOW: 60000, // ms (1 minuto para continuidad)
} as const;

export const GROUP_KEYWORDS = [
  "todos",
  "chicos",
  "chicas",
  "equipo",
  "grupo",
  "amigos",
  "ustedes",
  "vosotros",
  "hey all",
  "everyone",
  "guys",
  "gente",
] as const;

export const AMBIGUOUS_REFERENCES = [
  "amiga",
  "amigo",
  "ella",
  "él",
  "ellos",
  "ellas",
  "esa persona",
  "ese",
  "esa",
  "friend",
  "she",
  "he",
  "they",
  "that person",
] as const;

// ============================================================================
// Request/Response de API
// ============================================================================

export const MinecraftMessageRequestSchema = z.object({
  content: z.string().min(1).max(5000),
  player: MinecraftPlayerSchema,
  nearbyAgents: z.array(MinecraftAgentSchema),
  replyToId: z.string().optional(),
  config: z
    .object({
      proximityRadius: z.number().optional(),
      maxResponders: z.number().optional(),
      responseDelay: z.number().optional(),
      enableVoice: z.boolean().optional(),
    })
    .optional(),
});

export type MinecraftMessageRequest = z.infer<typeof MinecraftMessageRequestSchema>;

export interface MinecraftMessageResponse {
  success: boolean;
  userMessage: {
    messageId: string;
    content: string;
    timestamp: Date;
  };
  proximityContext: ProximityContext;
  agentResponses: MinecraftAgentResponse[];
  metadata: {
    responseTime: number; // En ms
    agentsEvaluated: number;
    agentsResponded: number;
  };
}

// ============================================================================
// Tipos de Error
// ============================================================================

export class MinecraftChatError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "MinecraftChatError";
  }
}

// Códigos de error específicos
export const MINECRAFT_ERROR_CODES = {
  INVALID_POSITION: "INVALID_POSITION",
  NO_AGENTS_NEARBY: "NO_AGENTS_NEARBY",
  AGENT_NOT_FOUND: "AGENT_NOT_FOUND",
  PLAYER_NOT_AUTHENTICATED: "PLAYER_NOT_AUTHENTICATED",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  INVALID_MESSAGE: "INVALID_MESSAGE",
  GENERATION_FAILED: "GENERATION_FAILED",
} as const;
