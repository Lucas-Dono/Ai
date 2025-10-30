/**
 * Tipos para el sistema de creación de mundos
 */

// ============================================
// TIPOS DE MUNDOS
// ============================================

export type WorldFormat = 'chat' | 'visual_novel';

export type WorldType =
  | 'chat'          // Conversaciones libres
  | 'story'         // Historia guiada (visual novel)
  | 'professional'  // Simulación profesional
  | 'roleplay'      // Roleplay/fantasía
  | 'educational';  // Educativo/aprendizaje

export type WorldComplexity = 'simple' | 'medium' | 'complex';

export type UserTier = 'free' | 'plus' | 'ultra';

export type WorldCategory =
  | 'social'
  | 'profesional'
  | 'fantasia'
  | 'educativo'
  | 'ciencia'
  | 'otro';

export type WorldDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type WorldVisibility = 'private' | 'public' | 'shared';

// ============================================
// ESPECIFICACIÓN DEL MUNDO (Editable)
// ============================================

export interface WorldSpec {
  // Metadata
  version: string; // Para versionado de specs
  creationMode: 'simple' | 'advanced';

  // Básico
  name: string;
  description?: string;
  category?: WorldCategory;
  difficulty?: WorldDifficulty;
  featured?: boolean;

  // Escenario
  scenario?: string;
  initialContext?: string;
  topicFocus?: string;

  // Simulación
  simulation: {
    autoMode: boolean;
    turnsPerCycle: number; // 1-10
    interactionDelay: number; // ms
    maxInteractions?: number;
    allowEmotionalBonds: boolean;
    allowConflicts: boolean;
  };

  // Visibilidad
  visibility: WorldVisibility;

  // Reglas personalizadas
  rules?: Record<string, any>;

  // Sistema de historia
  storyMode: boolean;
  storyScript?: StoryScript;

  // Personajes (referencia a agentes o configuración para crear)
  characters: CharacterSpec[];

  // Relaciones iniciales (opcional)
  initialRelations?: InitialRelation[];
}

// ============================================
// PERSONAJES
// ============================================

export interface CharacterSpec {
  // Usar agente existente
  useExisting?: {
    agentId: string;
    role?: string;
    importanceLevel?: 'main' | 'secondary' | 'filler';
  };

  // O configuración para crear nuevo agente
  createNew?: {
    name: string;
    gender: string;
    description: string;
    systemPrompt: string;

    // Nivel de importancia (para story mode)
    importanceLevel: 'main' | 'secondary' | 'filler';

    // Rol en el mundo
    role?: string;

    // Personalidad básica
    personality: {
      openness: number; // 0-1
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
      coreValues: string[];
      moralSchemas: Record<string, number>;
      backstory: string;
      baselineEmotions: Record<string, number>;
    };

    // Arco de personaje (opcional, para main)
    arc?: CharacterArc;
  };
}

export interface CharacterArc {
  name: string;
  type: 'romance' | 'friendship' | 'rivalry' | 'personal_growth' | 'comedy';
  description: string;
  milestones: ArcMilestone[];
  emotionalTone: 'comedic' | 'dramatic' | 'heartwarming' | 'bittersweet';
}

export interface ArcMilestone {
  name: string;
  description: string;
  requiredProgress: number; // 0-1
  emotionalImpact?: Record<string, number>;
}

// ============================================
// HISTORIA
// ============================================

export interface StoryScript {
  title: string;
  genre: string;
  initialBeat: string;
  totalActs: number;
  events: StoryEvent[];
}

export interface StoryEvent {
  type: string;
  name: string;
  description: string;
  triggerType: 'automatic' | 'progress_based' | 'manual';
  requiredProgress?: number; // 0-1
  involvedCharacters: 'all' | 'main' | 'secondary' | string[]; // nombres específicos
  focusCharacter?: string;
  outcomes: {
    success?: EventOutcome;
    failure?: EventOutcome;
  };
}

export interface EventOutcome {
  impact: string;
  nextEvents?: string[];
  relationshipChanges?: RelationshipChange[];
}

export interface RelationshipChange {
  from: string; // character name
  to: string;
  changes: Record<string, number>; // { trust: +0.2, affinity: -0.1, etc }
}

// ============================================
// RELACIONES INICIALES
// ============================================

export interface InitialRelation {
  from: string; // character name
  to: string;
  trust?: number; // 0-1
  affinity?: number;
  respect?: number;
  attraction?: number;
}

// ============================================
// RESPUESTA DE IA (Gemini)
// ============================================

export interface AIWorldGeneration {
  scenario: string;
  initialContext: string;
  suggestedAgents: SuggestedAgent[];
  suggestedEvents?: SuggestedEvent[];
  tips?: string[];
  storyScript?: Partial<StoryScript>;
  existingAgentIds?: string[]; // IDs de agentes existentes del usuario
}

export interface SuggestedAgent {
  name: string;
  role: string;
  description: string;
  archetype: string; // ej: "detective_noir", "assistant", "love_interest"
  importanceLevel: 'main' | 'secondary' | 'filler';
  personality?: {
    traits: string[];
    baselineEmotions?: Record<string, number>;
  };
  backstory?: string;
}

export interface SuggestedEvent {
  name: string;
  description: string;
  type: string;
  triggerType: 'automatic' | 'progress_based';
  requiredProgress?: number;
  involvedCharacters: 'all' | 'main' | 'secondary';
}

// ============================================
// REQUEST/RESPONSE API
// ============================================

export interface GenerateWorldRequest {
  description: string; // Descripción en lenguaje natural
  worldType?: WorldType; // Opcional cuando se usa templateId
  complexity?: WorldComplexity;
  characterCount?: number; // Número sugerido de personajes
  templateId?: string; // ID del template si se usa uno
  format?: WorldFormat; // 'chat' o 'visual_novel'
  detailedMode?: boolean; // Modo detallado con descripciones individuales
  characterDescriptions?: string[]; // Descripciones individuales de personajes
}

export interface GenerateWorldResponse {
  success: boolean;
  data?: AIWorldGeneration;
  error?: string;
}

export interface ValidateWorldSpecRequest {
  spec: WorldSpec;
}

export interface ValidateWorldSpecResponse {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'critical';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// ============================================
// VALORES POR DEFECTO
// ============================================

export const DEFAULT_WORLD_SPEC: Partial<WorldSpec> = {
  version: '1.0.0',
  creationMode: 'simple',
  simulation: {
    autoMode: true,
    turnsPerCycle: 1,
    interactionDelay: 3000,
    allowEmotionalBonds: true,
    allowConflicts: true,
  },
  visibility: 'private',
  storyMode: false,
  characters: [],
  category: 'social',
};

export const WORLD_TYPE_CONFIG: Record<WorldType, {
  label: string;
  description: string;
  complexity: WorldComplexity;
  icon: string;
  defaultStoryMode: boolean;
  suggestedCharacterCount: number;
}> = {
  chat: {
    label: 'Chat Social',
    description: 'Conversaciones libres entre IAs sin guión predefinido',
    complexity: 'simple',
    icon: '💬',
    defaultStoryMode: false,
    suggestedCharacterCount: 3,
  },
  story: {
    label: 'Historia Guiada',
    description: 'Visual novel con eventos programados y arcos de personajes',
    complexity: 'complex',
    icon: '🎭',
    defaultStoryMode: true,
    suggestedCharacterCount: 5,
  },
  professional: {
    label: 'Simulación Profesional',
    description: 'Escenarios de trabajo, negocios y reuniones',
    complexity: 'medium',
    icon: '🏢',
    defaultStoryMode: false,
    suggestedCharacterCount: 4,
  },
  roleplay: {
    label: 'Roleplay/Fantasía',
    description: 'Aventuras y juegos de rol con narrativa flexible',
    complexity: 'medium',
    icon: '🎲',
    defaultStoryMode: true,
    suggestedCharacterCount: 4,
  },
  educational: {
    label: 'Educativo',
    description: 'Simulaciones educativas y de aprendizaje',
    complexity: 'medium',
    icon: '🎓',
    defaultStoryMode: false,
    suggestedCharacterCount: 3,
  },
};
