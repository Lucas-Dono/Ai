/**
 * Event Types & Schemas
 *
 * Definiciones de tipos de eventos que pueden afectar a agentes en mundos.
 * Cada tipo de evento tiene efectos específicos sobre el estado del agente.
 */

// ========================================
// EVENT TYPES
// ========================================

export enum EventType {
  // HEALTH EVENTS
  ILLNESS = 'ILLNESS',           // Enfermedad (gripe, resfriado, etc.)
  INJURY = 'INJURY',             // Lesión física
  RECOVERY = 'RECOVERY',         // Recuperación de enfermedad/lesión
  EXHAUSTION = 'EXHAUSTION',     // Agotamiento extremo
  ENERGIZED = 'ENERGIZED',       // Energía renovada

  // EMOTION EVENTS
  TRAUMA = 'TRAUMA',             // Trauma psicológico
  HAPPINESS = 'HAPPINESS',       // Felicidad prolongada
  DEPRESSION = 'DEPRESSION',     // Depresión
  ANXIETY = 'ANXIETY',           // Ansiedad
  RELIEF = 'RELIEF',             // Alivio emocional
  INFATUATION = 'INFATUATION',   // Enamoramiento
  HEARTBREAK = 'HEARTBREAK',     // Ruptura amorosa
  GRIEF = 'GRIEF',               // Duelo

  // RELATIONSHIP EVENTS
  CONFLICT = 'CONFLICT',         // Conflicto con otro agente
  ALLIANCE = 'ALLIANCE',         // Alianza formada
  BETRAYAL = 'BETRAYAL',         // Traición
  RECONCILIATION = 'RECONCILIATION', // Reconciliación

  // SKILL EVENTS
  SKILL_LEARNED = 'SKILL_LEARNED',     // Aprendió nueva habilidad
  SKILL_IMPROVED = 'SKILL_IMPROVED',   // Mejoró habilidad existente
  SKILL_FORGOTTEN = 'SKILL_FORGOTTEN', // Olvidó habilidad

  // INVENTORY EVENTS
  ITEM_ACQUIRED = 'ITEM_ACQUIRED',   // Obtuvo item
  ITEM_LOST = 'ITEM_LOST',           // Perdió item
  ITEM_USED = 'ITEM_USED',           // Usó item

  // STATUS EVENTS
  PREGNANCY = 'PREGNANCY',       // Embarazo
  IMPRISONMENT = 'IMPRISONMENT', // Prisión/arresto
  TRAVEL = 'TRAVEL',             // Viaje
  PROMOTION = 'PROMOTION',       // Promoción/ascenso
  DEMOTION = 'DEMOTION',         // Degradación
  CURSE = 'CURSE',               // Maldición (narrativa)
  BLESSING = 'BLESSING',         // Bendición (narrativa)
}

// ========================================
// STATUS EFFECT
// ========================================

export interface StatusEffect {
  type: EventType;
  severity: number; // 0-1 (qué tan severo es el efecto)
  duration: number | null; // Duración en días (null = permanente)
  appliedAt: Date;
  expiresAt: Date | null; // null si es permanente
  metadata: Record<string, any>; // Información específica del evento
  decay?: {
    enabled: boolean;
    rate: number; // Qué tan rápido decae (0-1 por día)
    currentSeverity: number; // Severidad actual con decay
  };
}

// ========================================
// SKILL
// ========================================

export interface Skill {
  name: string;
  level: number; // 0-100
  acquiredAt: Date;
  category?: string; // "combat", "social", "intellectual", etc.
  description?: string;
}

// ========================================
// INVENTORY ITEM
// ========================================

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  acquiredAt: Date;
  category?: string; // "weapon", "tool", "consumable", etc.
  description?: string;
  metadata?: Record<string, any>;
}

// ========================================
// AGENT STATE
// ========================================

export interface AgentState {
  health: number; // 0-1
  energy: number; // 0-1
  skills: Skill[];
  inventory: InventoryItem[];
  statusEffects: StatusEffect[];
  lastStateUpdate?: Date;
}

// ========================================
// EVENT DATA DEFINITIONS
// ========================================

export interface HealthEventData {
  healthDelta: number; // -1 a 1
  energyDelta: number; // -1 a 1
  duration: number | null; // días
  description: string;
}

export interface EmotionEventData {
  emotionType: 'joy' | 'sadness' | 'fear' | 'anger' | 'trust' | 'disgust' | 'surprise' | 'anticipation';
  intensity: number; // 0-1
  duration: number | null; // días
  description: string;
  triggeredBy?: string; // ID del agente que causó el evento (opcional)
}

export interface RelationshipEventData {
  targetAgentId: string;
  relationshipDelta: number; // -1 a 1 (afecta trust/affinity)
  description: string;
}

export interface SkillEventData {
  skillName: string;
  skillLevel?: number; // 0-100 (para nuevas skills o mejoras)
  category?: string;
  description: string;
}

export interface InventoryEventData {
  itemId?: string; // Para items existentes
  itemName: string;
  quantity: number;
  category?: string;
  description: string;
}

export interface StatusEventData {
  duration: number | null; // días (null = permanente)
  severity: number; // 0-1
  description: string;
  metadata?: Record<string, any>;
}

// Union type para todos los event data
export type EventData =
  | HealthEventData
  | EmotionEventData
  | RelationshipEventData
  | SkillEventData
  | InventoryEventData
  | StatusEventData;

// ========================================
// EVENT APPLICATION REQUEST
// ========================================

export interface ApplyEventRequest {
  worldId: string;
  agentId: string;
  eventType: EventType;
  eventData: EventData;
  reason?: string; // Razón narrativa del evento
}

// ========================================
// EVENT APPLICATION RESULT
// ========================================

export interface ApplyEventResult {
  success: boolean;
  agentId: string;
  eventType: EventType;
  stateChanges: {
    health?: { before: number; after: number };
    energy?: { before: number; after: number };
    skillsAdded?: string[];
    skillsRemoved?: string[];
    itemsAdded?: string[];
    itemsRemoved?: string[];
    effectsAdded?: StatusEffect[];
    effectsRemoved?: string[]; // IDs de efectos removidos
  };
  message: string;
  timestamp: Date;
}

// ========================================
// EVENT TEMPLATES
// ========================================

export const EVENT_TEMPLATES: Record<EventType, {
  defaultDuration: number | null;
  healthImpact: number;
  energyImpact: number;
  severity: number;
  description: string;
}> = {
  // HEALTH
  [EventType.ILLNESS]: {
    defaultDuration: 5, // 5 días
    healthImpact: -0.3,
    energyImpact: -0.4,
    severity: 0.6,
    description: 'El agente está enfermo',
  },
  [EventType.INJURY]: {
    defaultDuration: 10, // 10 días
    healthImpact: -0.5,
    energyImpact: -0.3,
    severity: 0.8,
    description: 'El agente está lesionado',
  },
  [EventType.RECOVERY]: {
    defaultDuration: null, // Instantáneo
    healthImpact: 0.3,
    energyImpact: 0.2,
    severity: 0,
    description: 'El agente se está recuperando',
  },
  [EventType.EXHAUSTION]: {
    defaultDuration: 2, // 2 días
    healthImpact: -0.1,
    energyImpact: -0.6,
    severity: 0.5,
    description: 'El agente está exhausto',
  },
  [EventType.ENERGIZED]: {
    defaultDuration: 1, // 1 día
    healthImpact: 0.1,
    energyImpact: 0.4,
    severity: 0,
    description: 'El agente está energizado',
  },

  // EMOTION
  [EventType.TRAUMA]: {
    defaultDuration: 30, // 30 días con decay
    healthImpact: -0.1,
    energyImpact: -0.2,
    severity: 0.9,
    description: 'El agente ha sufrido un trauma',
  },
  [EventType.HAPPINESS]: {
    defaultDuration: 7, // 7 días
    healthImpact: 0.1,
    energyImpact: 0.2,
    severity: 0,
    description: 'El agente está muy feliz',
  },
  [EventType.DEPRESSION]: {
    defaultDuration: 14, // 14 días
    healthImpact: -0.2,
    energyImpact: -0.4,
    severity: 0.7,
    description: 'El agente está deprimido',
  },
  [EventType.ANXIETY]: {
    defaultDuration: 7, // 7 días
    healthImpact: -0.1,
    energyImpact: -0.3,
    severity: 0.6,
    description: 'El agente tiene ansiedad',
  },
  [EventType.RELIEF]: {
    defaultDuration: 3, // 3 días
    healthImpact: 0.1,
    energyImpact: 0.2,
    severity: 0,
    description: 'El agente siente alivio',
  },
  [EventType.INFATUATION]: {
    defaultDuration: 14, // 14 días
    healthImpact: 0,
    energyImpact: 0.2,
    severity: 0.5,
    description: 'El agente está enamorado',
  },
  [EventType.HEARTBREAK]: {
    defaultDuration: 21, // 21 días
    healthImpact: -0.2,
    energyImpact: -0.3,
    severity: 0.8,
    description: 'El agente tiene el corazón roto',
  },
  [EventType.GRIEF]: {
    defaultDuration: 30, // 30 días
    healthImpact: -0.1,
    energyImpact: -0.3,
    severity: 0.8,
    description: 'El agente está de duelo',
  },

  // RELATIONSHIP
  [EventType.CONFLICT]: {
    defaultDuration: 7, // 7 días
    healthImpact: 0,
    energyImpact: -0.1,
    severity: 0.5,
    description: 'El agente tiene un conflicto',
  },
  [EventType.ALLIANCE]: {
    defaultDuration: null, // Permanente hasta que se rompa
    healthImpact: 0,
    energyImpact: 0.1,
    severity: 0,
    description: 'El agente formó una alianza',
  },
  [EventType.BETRAYAL]: {
    defaultDuration: 21, // 21 días
    healthImpact: -0.1,
    energyImpact: -0.2,
    severity: 0.9,
    description: 'El agente fue traicionado',
  },
  [EventType.RECONCILIATION]: {
    defaultDuration: null, // Instantáneo
    healthImpact: 0,
    energyImpact: 0.2,
    severity: 0,
    description: 'El agente se reconcilió',
  },

  // SKILL
  [EventType.SKILL_LEARNED]: {
    defaultDuration: null, // Permanente
    healthImpact: 0,
    energyImpact: 0.1,
    severity: 0,
    description: 'El agente aprendió una nueva habilidad',
  },
  [EventType.SKILL_IMPROVED]: {
    defaultDuration: null, // Permanente
    healthImpact: 0,
    energyImpact: 0.05,
    severity: 0,
    description: 'El agente mejoró una habilidad',
  },
  [EventType.SKILL_FORGOTTEN]: {
    defaultDuration: null, // Permanente
    healthImpact: 0,
    energyImpact: -0.05,
    severity: 0.3,
    description: 'El agente olvidó una habilidad',
  },

  // INVENTORY
  [EventType.ITEM_ACQUIRED]: {
    defaultDuration: null, // Permanente hasta que se use/pierda
    healthImpact: 0,
    energyImpact: 0,
    severity: 0,
    description: 'El agente obtuvo un item',
  },
  [EventType.ITEM_LOST]: {
    defaultDuration: null, // Instantáneo
    healthImpact: 0,
    energyImpact: -0.1,
    severity: 0.3,
    description: 'El agente perdió un item',
  },
  [EventType.ITEM_USED]: {
    defaultDuration: null, // Instantáneo
    healthImpact: 0,
    energyImpact: 0,
    severity: 0,
    description: 'El agente usó un item',
  },

  // STATUS
  [EventType.PREGNANCY]: {
    defaultDuration: 270, // ~9 meses
    healthImpact: -0.1,
    energyImpact: -0.2,
    severity: 0.5,
    description: 'El agente está embarazado',
  },
  [EventType.IMPRISONMENT]: {
    defaultDuration: 30, // Variable según contexto
    healthImpact: -0.2,
    energyImpact: -0.3,
    severity: 0.8,
    description: 'El agente está encarcelado',
  },
  [EventType.TRAVEL]: {
    defaultDuration: 7, // Variable
    healthImpact: 0,
    energyImpact: -0.2,
    severity: 0.3,
    description: 'El agente está de viaje',
  },
  [EventType.PROMOTION]: {
    defaultDuration: null, // Permanente
    healthImpact: 0.1,
    energyImpact: 0.2,
    severity: 0,
    description: 'El agente fue promovido',
  },
  [EventType.DEMOTION]: {
    defaultDuration: null, // Permanente
    healthImpact: -0.1,
    energyImpact: -0.2,
    severity: 0.6,
    description: 'El agente fue degradado',
  },
  [EventType.CURSE]: {
    defaultDuration: null, // Hasta que se rompa
    healthImpact: -0.2,
    energyImpact: -0.2,
    severity: 0.7,
    description: 'El agente está maldito',
  },
  [EventType.BLESSING]: {
    defaultDuration: null, // Hasta que expire
    healthImpact: 0.2,
    energyImpact: 0.2,
    severity: 0,
    description: 'El agente está bendecido',
  },
};
