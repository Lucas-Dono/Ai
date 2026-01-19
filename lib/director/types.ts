/**
 * Director Conversacional - Sistema de Tipos
 *
 * Define todas las interfaces y tipos para el sistema de dirección narrativa
 * en chats grupales.
 */

import { SceneCategory, SeedStatus } from "@prisma/client";

// ============================================================================
// ESCENAS
// ============================================================================

export interface SceneIntervention {
  role: string; // "PROTAGONISTA", "ANTAGONISTA", etc.
  directive: string; // Instrucción específica para la IA
  delay: number; // Delay en ms desde inicio de escena
  targetRole?: string; // A quién se dirige (opcional)
  emotionalTone?: string; // Tono emocional sugerido
  maxLength?: number; // Longitud máxima sugerida
}

export interface SceneConsequences {
  seeds?: Array<{
    type: string;
    title: string;
    content: string;
    involvedRoles: string[];
    latencyTurns: number;
  }>;
  relations?: Array<{
    roleA: string;
    roleB: string;
    affinityChange: number;
    dynamicToAdd?: string;
  }>;
  effects?: Array<{
    type: string;
    target: string;
    value: any;
  }>;
}

export interface Scene {
  id: string;
  code: string;
  name: string;
  category: SceneCategory;
  subcategory?: string;
  triggerType: string;
  triggerPattern?: string;
  triggerMinEnergy?: number;
  triggerMaxEnergy?: number;
  triggerMinTension?: number;
  triggerMaxTension?: number;
  description: string;
  objectives: string[];
  participantRoles: string[];
  interventionSequence: SceneIntervention[];
  consequences: SceneConsequences;
  variations?: any;
  usageCount: number;
  successRate: number;
  avgEngagement: number;
  isActive: boolean;
  minAIs: number;
  maxAIs: number;
  duration: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// DIRECTOR
// ============================================================================

export interface BufferedMessage {
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
}

export interface GroupContextForDirector {
  aiMembers: Array<{
    id: string;
    name: string;
    personality: any;
  }>;
  recentMessages: any[];
  currentEnergy: number; // 0-1
  currentTension: number; // 0-1
  participationBalance: number; // 0-1
}

export interface DirectorInput {
  groupId: string;
  bufferedMessages: BufferedMessage[];
  groupContext: GroupContextForDirector;
  sceneState: any; // GroupSceneState | null
  activeSeedsCount: number;
  detectedLoops?: LoopPattern[];
}

export interface DirectorOutput {
  sceneCode: string | null; // null = sin escena, flujo natural
  roleAssignments: Record<string, string>; // role -> agentId
  reason: string; // Para debugging
}

// ============================================================================
// SCENE EXECUTOR
// ============================================================================

export interface SceneExecutionPlan {
  scene: Scene;
  roleAssignments: Record<string, string>; // role -> agentId
  interventions: Array<{
    step: number;
    agentId: string;
    role: string;
    directive: string;
    delay: number; // ms desde inicio de escena
    targetAgentIds?: string[];
    emotionalTone?: string;
  }>;
}

export interface SceneDirective {
  sceneCode: string;
  role: string; // "PROTAGONISTA", "ANTAGONISTA", etc.
  directive: string; // Instrucción específica
  targetAgents?: string[]; // IDs de agentes a los que debe dirigirse
  emotionalTone?: string; // Tono emocional esperado
  maxLength?: number; // Longitud sugerida
}

// ============================================================================
// SEMILLAS DE TENSIÓN
// ============================================================================

export interface TensionSeed {
  id: string;
  groupId: string;
  type: string;
  title: string;
  content: string;
  involvedAgents: string[];
  originAgentId?: string;
  status: SeedStatus;
  createdAt: Date;
  lastReference?: Date;
  referenceCount: number;
  latencyTurns: number;
  maxTurns: number;
  currentTurn: number;
  escalationLevel: number;
  escalationNotes?: string;
  resolvedAt?: Date;
  resolution?: string;
  resolutionType?: string;
}

export interface CreateSeedInput {
  groupId: string;
  type: string;
  title: string;
  content: string;
  involvedAgents: string[];
  latencyTurns?: number;
  originAgentId?: string;
}

// ============================================================================
// RELACIONES IA-IA
// ============================================================================

export interface AIRelation {
  id: string;
  groupId: string;
  agentAId: string;
  agentBId: string;
  affinity: number; // -10 a +10
  relationType: string;
  dynamics: string[];
  lastInteraction?: Date;
  interactionCount: number;
  tensionLevel: number;
  sharedMoments: Array<{
    turn: number;
    description: string;
    impact: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateRelationInput {
  affinityChange?: number;
  dynamicToAdd?: string;
  dynamicToRemove?: string;
  newRelationType?: string;
  addSharedMoment?: {
    turn: number;
    description: string;
    impact: number;
  };
}

// ============================================================================
// LOOP DETECTOR
// ============================================================================

export interface LoopPattern {
  type:
    | "agreement"
    | "compliments"
    | "apologies"
    | "questions"
    | "topic"
    | "protagonist";
  count: number;
  threshold: number;
  detectedAt?: Date;
  details?: string;
}

export interface CorrectiveAction {
  suggestedCategories: SceneCategory[];
  directive?: string;
  priority: number;
}

// ============================================================================
// SCENE CATALOG
// ============================================================================

export interface SceneCandidateFilter {
  excludeCategories?: SceneCategory[];
  excludeCodes?: string[];
  energyRange?: { min: number; max: number };
  tensionRange?: { min: number; max: number };
  canCreateSeeds?: boolean;
  minAIs?: number;
  maxAIs?: number;
  requireRoles?: string[];
  preferredCategories?: SceneCategory[];
}

// ============================================================================
// ROLE ASSIGNER
// ============================================================================

export interface RoleAssignmentContext {
  aiMembers: Array<{
    id: string;
    name: string;
    personality: any;
    recentParticipation: number; // Mensajes en últimos N turnos
    lastProtagonistTurn?: number; // Último turno como protagonista
  }>;
  scene: Scene;
  recentMessages: any[];
  activeRelations?: AIRelation[];
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface DirectorSettings {
  dramaFrequency: "low" | "medium" | "high";
  humorTolerance: "low" | "medium" | "high";
  conflictIntensity: "low" | "medium" | "high";
  protagonistRotation: boolean;
  maxSeedsActive: number;
  minTurnsBetweenDrama: number;
  loopDetectionEnabled: boolean;
}

export const DEFAULT_DIRECTOR_SETTINGS: DirectorSettings = {
  dramaFrequency: "medium",
  humorTolerance: "high",
  conflictIntensity: "medium",
  protagonistRotation: true,
  maxSeedsActive: 5,
  minTurnsBetweenDrama: 5,
  loopDetectionEnabled: true,
};

// ============================================================================
// PROMPT BUILDING
// ============================================================================

export interface DirectorPromptContext {
  aiNames: string[];
  energy: number;
  tension: number;
  balance: number;
  recentMessages: Array<{
    authorName: string;
    content: string;
  }>;
  activeSeeds: Array<{
    title: string;
    status: string;
    currentTurn: number;
    maxTurns: number;
  }>;
  detectedLoops: LoopPattern[];
  candidateScenes: Array<{
    code: string;
    name: string;
    description: string;
  }>;
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface SceneAnalytics {
  sceneCode: string;
  totalExecutions: number;
  successfulCompletions: number;
  avgEngagement: number;
  avgDuration: number; // en segundos
  popularInGroups: string[];
  userSatisfaction: number;
}
