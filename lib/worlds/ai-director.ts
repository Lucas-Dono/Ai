/**
 * AI Director - Sistema de dirección narrativa inteligente
 *
 * El Director AI es el cerebro invisible que toma decisiones narrativas
 * para mantener la historia interesante, coherente y emocionalmente resonante.
 *
 * Opera en 3 niveles:
 * - MACRO: Eventos y progreso general de la historia
 * - MESO: Desarrollo de personajes y relaciones
 * - MICRO: Dirección de escenas individuales
 */

import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';
import { getVeniceClient } from '@/lib/emotional-system/llm/venice';
import {
  DirectorContext,
  DirectorDecision,
  buildMacroDecisionPrompt,
  buildMesoDecisionPrompt,
  buildMicroDecisionPrompt,
  buildRelationshipAnalysisPrompt,
  buildImportanceEvaluationPrompt,
  parseDirectorResponse,
  summarizeContext,
} from './director-prompts';
import { getStoryEngine } from './story-engine';
import { getCharacterImportanceManager } from './character-importance-manager';

const log = createLogger('AIDirector');

// ========================================
// CONFIGURACIÓN
// ========================================

const DIRECTOR_CONFIG = {
  // Frecuencia de evaluaciones
  MACRO_DECISION_INTERVAL: 10, // Cada 10 interacciones
  MESO_DECISION_INTERVAL: 5, // Cada 5 interacciones
  MICRO_DECISION_ALWAYS: true, // Cada interacción

  // Modelos a usar
  MODEL_MACRO: 'llama-3.3-70b', // Decisiones estratégicas
  MODEL_MESO: 'llama-3.1-8b', // Decisiones tácticas
  MODEL_MICRO: 'llama-3.1-8b', // Decisiones inmediatas

  // Umbrales
  MIN_CONFIDENCE_TO_ACT: 0.7,
  RELATIONSHIP_CHANGE_THRESHOLD: 0.05,
};

// ========================================
// TIPOS
// ========================================

export interface MacroDecision {
  shouldActivateEvent: boolean;
  eventToActivate: string | null;
  newBeat: string | null;
  reasoning: string;
  pacingAssessment: 'too_slow' | 'good' | 'too_fast';
  toneAdjustment: 'more_comedy' | 'more_drama' | 'more_romance' | 'balanced';
}

export interface MesoDecision {
  focusCharacter: string;
  reasoning: string;
  suggestedRelationshipDevelopment: Array<{
    subject: string;
    target: string;
    type: 'romance' | 'friendship' | 'rivalry';
  }>;
  characterPromotionSuggestions: Array<{
    character: string;
    action: 'promote' | 'demote';
    reason: string;
  }>;
  arcProgressionNeeded: Array<{
    character: string;
    currentStage: string;
    nextAction: string;
  }>;
}

export interface MicroDecision {
  sceneDirection: {
    tone: 'comedic' | 'dramatic' | 'romantic' | 'tense' | 'heartwarming';
    emotionalIntensity: number;
    pacing: 'slow' | 'medium' | 'fast';
  };
  nextSpeakerSuggestion: string;
  narrativeGuidance: string;
  subtextToHighlight: string[];
}

export interface DirectorState {
  lastMacroDecision: number; // Interacción en la que se tomó
  lastMesoDecision: number;
  currentFocus: string | null; // Personaje en foco
  activeGuidance: {
    tone: string;
    pacing: string;
    relationships: string[];
  };
}

// ========================================
// AI DIRECTOR CLASS
// ========================================

export class AIDirector {
  private worldId: string;
  private state: DirectorState;

  constructor(worldId: string) {
    this.worldId = worldId;
    this.state = {
      lastMacroDecision: 0,
      lastMesoDecision: 0,
      currentFocus: null,
      activeGuidance: {
        tone: 'balanced',
        pacing: 'medium',
        relationships: [],
      },
    };
  }

  /**
   * Punto de entrada principal - llamar después de cada interacción
   */
  async evaluateAndAct(interactionCount: number): Promise<void> {
    log.info({ worldId: this.worldId, interactionCount }, '🎬 Director evaluation started');

    try {
      // 1. Recolectar contexto completo
      const context = await this.gatherContext();
      log.debug({ worldId: this.worldId, summary: summarizeContext(context) }, 'Context gathered');

      // 2. Decisiones MACRO (estratégicas)
      if (interactionCount - this.state.lastMacroDecision >= DIRECTOR_CONFIG.MACRO_DECISION_INTERVAL) {
        await this.makeMacroDecision(context, interactionCount);
      }

      // 3. Decisiones MESO (tácticas)
      if (interactionCount - this.state.lastMesoDecision >= DIRECTOR_CONFIG.MESO_DECISION_INTERVAL) {
        await this.makeMesoDecision(context, interactionCount);
      }

      // 4. Decisiones MICRO (inmediatas) - siempre
      if (DIRECTOR_CONFIG.MICRO_DECISION_ALWAYS) {
        await this.makeMicroDecision(context);
      }

      log.info({ worldId: this.worldId, interactionCount }, '✅ Director evaluation completed');
    } catch (error) {
      log.error({ worldId: this.worldId, error }, '❌ Director evaluation failed');
    }
  }

  /**
   * Recolecta todo el contexto necesario del mundo
   */
  private async gatherContext(): Promise<DirectorContext> {
    const world = await prisma.world.findUnique({
      where: { id: this.worldId },
      include: {
        worldAgents: {
          include: {
            agent: true,
          },
          where: { isActive: true },
        },
        agentRelations: true,
        storyEvents: {
          where: {
            OR: [{ isActive: true }, { isCompleted: false }],
          },
        },
        characterArcs: {
          where: { isActive: true },
        },
        simulationState: true,
      },
    });

    if (!world) {
      throw new Error(`World ${this.worldId} not found`);
    }

    // Obtener últimas interacciones
    const recentInteractions = await prisma.worldInteraction.findMany({
      where: { worldId: this.worldId },
      orderBy: { turn: 'desc' },
      take: 20,
      include: {
        speaker: {
          select: { name: true },
        },
      },
    });

    // Construir contexto
    const context: DirectorContext = {
      worldName: world.name,
      storyProgress: world.storyProgress || 0,
      currentBeat: world.currentStoryBeat || 'introduction',
      recentInteractions: recentInteractions.reverse().map(i => ({
        speaker: i.speaker.name,
        content: i.content,
        sentiment: i.sentiment || 'neutral',
      })),
      activeCharacters: world.worldAgents.map(wa => ({
        name: wa.agent.name,
        importanceLevel: wa.importanceLevel,
        screenTime: wa.screenTime,
        promotionScore: wa.promotionScore,
        emotionalState: wa.emotionalState as any,
        currentArc: world.characterArcs
          .filter(arc => arc.agentId === wa.agentId)
          .map(arc => ({
            name: arc.arcName,
            progress: arc.progress,
            currentMilestone: (arc.milestones as any)[arc.currentMilestone]?.name || 'unknown',
          }))[0],
      })),
      relationships: world.agentRelations.map(r => ({
        subject: world.worldAgents.find(wa => wa.agentId === r.subjectId)?.agent.name || 'unknown',
        target: world.worldAgents.find(wa => wa.agentId === r.targetId)?.agent.name || 'unknown',
        trust: r.trust,
        affinity: r.affinity,
        attraction: r.attraction,
      })),
      pendingEvents: world.storyEvents
        .filter(e => !e.isActive && !e.isCompleted)
        .map(e => ({
          name: e.eventName,
          description: e.description,
          requiredProgress: e.requiredProgress || 0,
        })),
      activeEvents: world.storyEvents
        .filter(e => e.isActive)
        .map(e => ({
          name: e.eventName,
          description: e.description,
        })),
    };

    return context;
  }

  /**
   * MACRO: Toma decisiones estratégicas sobre la historia
   */
  private async makeMacroDecision(context: DirectorContext, interactionCount: number): Promise<void> {
    log.info({ worldId: this.worldId }, '🎯 Making MACRO decision...');

    const prompt = buildMacroDecisionPrompt(context);

    const veniceClient = getVeniceClient();
    const response = await veniceClient.generate({
      prompt,
      model: DIRECTOR_CONFIG.MODEL_MACRO,
      temperature: 0.7,
    });

    const decision = parseDirectorResponse<MacroDecision>(response.text, 'macro');

    if (!decision) {
      log.warn({ worldId: this.worldId }, 'Failed to parse macro decision');
      return;
    }

    log.info(
      {
        worldId: this.worldId,
        decision: {
          shouldActivateEvent: decision.shouldActivateEvent,
          eventToActivate: decision.eventToActivate,
          newBeat: decision.newBeat,
          pacing: decision.pacingAssessment,
          tone: decision.toneAdjustment,
        },
        reasoning: decision.reasoning,
      },
      '📋 MACRO Decision'
    );

    // Aplicar decisión
    await this.applyMacroDecision(decision);

    this.state.lastMacroDecision = interactionCount;
    this.state.activeGuidance.tone = decision.toneAdjustment;
    this.state.activeGuidance.pacing = decision.pacingAssessment;
  }

  /**
   * MESO: Toma decisiones sobre desarrollo de personajes
   */
  private async makeMesoDecision(context: DirectorContext, interactionCount: number): Promise<void> {
    log.info({ worldId: this.worldId }, '🎯 Making MESO decision...');

    const prompt = buildMesoDecisionPrompt(context);

    const veniceClient = getVeniceClient();
    const response = await veniceClient.generate({
      prompt,
      model: DIRECTOR_CONFIG.MODEL_MESO,
      temperature: 0.7,
    });

    const decision = parseDirectorResponse<MesoDecision>(response.text, 'meso');

    if (!decision) {
      log.warn({ worldId: this.worldId }, 'Failed to parse meso decision');
      return;
    }

    log.info(
      {
        worldId: this.worldId,
        decision: {
          focusCharacter: decision.focusCharacter,
          relationshipDevelopment: decision.suggestedRelationshipDevelopment.length,
          promotionSuggestions: decision.characterPromotionSuggestions.length,
          arcProgression: decision.arcProgressionNeeded.length,
        },
        reasoning: decision.reasoning,
      },
      '📋 MESO Decision'
    );

    // Aplicar decisión
    await this.applyMesoDecision(decision);

    this.state.lastMesoDecision = interactionCount;
    this.state.currentFocus = decision.focusCharacter;
    this.state.activeGuidance.relationships = decision.suggestedRelationshipDevelopment.map(
      r => `${r.subject}-${r.target}`
    );
  }

  /**
   * MICRO: Toma decisiones sobre la escena actual
   */
  private async makeMicroDecision(context: DirectorContext): Promise<void> {
    log.debug({ worldId: this.worldId }, '🎯 Making MICRO decision...');

    const lastInteraction = context.recentInteractions[context.recentInteractions.length - 1];
    const availableSpeakers = context.activeCharacters
      .filter(c => c.importanceLevel !== 'filler' || c.screenTime > 0)
      .map(c => c.name);

    const prompt = buildMicroDecisionPrompt(
      context,
      lastInteraction?.speaker || 'unknown',
      availableSpeakers
    );

    const veniceClient = getVeniceClient();
    const response = await veniceClient.generate({
      prompt,
      model: DIRECTOR_CONFIG.MODEL_MICRO,
      temperature: 0.8,
    });

    const decision = parseDirectorResponse<MicroDecision>(response.text, 'micro');

    if (!decision) {
      log.debug({ worldId: this.worldId }, 'Failed to parse micro decision (non-critical)');
      return;
    }

    log.debug(
      {
        worldId: this.worldId,
        decision: {
          tone: decision.sceneDirection.tone,
          intensity: decision.sceneDirection.emotionalIntensity,
          pacing: decision.sceneDirection.pacing,
          nextSpeaker: decision.nextSpeakerSuggestion,
        },
        guidance: decision.narrativeGuidance,
      },
      '📋 MICRO Decision'
    );

    // Guardar decisión para influenciar speaker selection
    await this.storeMicroGuidance(decision);
  }

  /**
   * Aplica una decisión MACRO
   */
  private async applyMacroDecision(decision: MacroDecision): Promise<void> {
    const storyEngine = getStoryEngine(this.worldId);

    // Activar evento si es necesario
    if (decision.shouldActivateEvent && decision.eventToActivate) {
      const event = await prisma.storyEvent.findFirst({
        where: {
          worldId: this.worldId,
          eventName: { contains: decision.eventToActivate },
          isActive: false,
        },
      });

      if (event) {
        await storyEngine.activateEvent(event.id);
        log.info(
          { worldId: this.worldId, eventId: event.id, eventName: event.eventName },
          '🎪 Event activated by Director'
        );
      }
    }

    // Cambiar beat si es necesario
    if (decision.newBeat) {
      await prisma.world.update({
        where: { id: this.worldId },
        data: { currentStoryBeat: decision.newBeat },
      });
      log.info({ worldId: this.worldId, newBeat: decision.newBeat }, '🎵 Story beat changed by Director');
    }

    // Guardar análisis de ritmo y tono
    await prisma.world.update({
      where: { id: this.worldId },
      data: {
        directorState: {
          lastMacroDecision: new Date(),
          pacingAssessment: decision.pacingAssessment,
          toneAdjustment: decision.toneAdjustment,
          reasoning: decision.reasoning,
        } as any,
      },
    });
  }

  /**
   * Aplica una decisión MESO
   */
  private async applyMesoDecision(decision: MesoDecision): Promise<void> {
    const importanceManager = getCharacterImportanceManager(this.worldId);

    // Procesar sugerencias de promoción/degradación
    for (const suggestion of decision.characterPromotionSuggestions) {
      const agent = await prisma.agent.findFirst({
        where: { name: suggestion.character },
      });

      if (!agent) continue;

      log.info(
        {
          worldId: this.worldId,
          character: suggestion.character,
          action: suggestion.action,
          reason: suggestion.reason,
        },
        '⭐ Character importance change suggested by Director'
      );

      // Ejecutar promoción/degradación si la confianza es alta
      if (suggestion.action === 'promote') {
        await importanceManager.forcePromote(agent.id);
      } else if (suggestion.action === 'demote') {
        await importanceManager.forceDemote(agent.id);
      }
    }

    // Marcar personaje en foco
    if (decision.focusCharacter) {
      const agent = await prisma.agent.findFirst({
        where: { name: decision.focusCharacter },
      });

      if (agent) {
        await prisma.worldAgent.update({
          where: {
            worldId_agentId: {
              worldId: this.worldId,
              agentId: agent.id,
            },
          },
          data: {
            isFocused: true,
            focusedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
          },
        });

        log.info(
          { worldId: this.worldId, character: decision.focusCharacter },
          '🎯 Character marked as focus by Director'
        );
      }
    }
  }

  /**
   * Almacena guidance MICRO para influenciar próxima interacción
   */
  private async storeMicroGuidance(decision: MicroDecision): Promise<void> {
    await prisma.world.update({
      where: { id: this.worldId },
      data: {
        currentSceneDirection: {
          tone: decision.sceneDirection.tone,
          emotionalIntensity: decision.sceneDirection.emotionalIntensity,
          pacing: decision.sceneDirection.pacing,
          nextSpeakerSuggestion: decision.nextSpeakerSuggestion,
          narrativeGuidance: decision.narrativeGuidance,
          subtextToHighlight: decision.subtextToHighlight,
          timestamp: new Date(),
        } as any,
      },
    });
  }

  /**
   * Obtiene la guidance actual del director
   */
  async getCurrentGuidance(): Promise<{
    tone: string;
    pacing: string;
    focusCharacter: string | null;
    nextSpeakerSuggestion?: string;
    narrativeGuidance?: string;
  }> {
    const world = await prisma.world.findUnique({
      where: { id: this.worldId },
      select: { currentSceneDirection: true },
    });

    const sceneDirection = world?.currentSceneDirection as any;

    return {
      tone: this.state.activeGuidance.tone,
      pacing: this.state.activeGuidance.pacing,
      focusCharacter: this.state.currentFocus,
      nextSpeakerSuggestion: sceneDirection?.nextSpeakerSuggestion,
      narrativeGuidance: sceneDirection?.narrativeGuidance,
    };
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Obtiene el Director AI para un mundo
 */
export function getAIDirector(worldId: string): AIDirector {
  return new AIDirector(worldId);
}

/**
 * Evalúa si el Director debe intervenir (llamar desde simulation engine)
 *
 * OPTIMIZACIÓN: Director solo cada 20 turnos (batch analysis)
 * - Analiza múltiples turnos a la vez
 * - Más eficiente que analizar cada turno
 * - Reduce costos un 95% vs análisis por turno
 */
export async function shouldDirectorEvaluate(worldId: string, interactionCount: number): Promise<boolean> {
  const world = await prisma.world.findUnique({
    where: { id: worldId },
    select: { storyMode: true },
  });

  // El Director solo opera en mundos con storyMode activado
  if (world?.storyMode !== true) return false;

  // Ejecutar cada 20 turnos (batch analysis más eficiente)
  // El Director analiza múltiples turnos a la vez = mejor decisión + menor costo
  return interactionCount > 0 && interactionCount % 20 === 0;
}

/**
 * Fuerza evaluación del Director (útil cuando el usuario interactúa)
 * Permite análisis on-demand sin esperar al ciclo automático
 */
export async function triggerDirectorEvaluation(worldId: string): Promise<void> {
  const world = await prisma.world.findUnique({
    where: { id: worldId },
    select: { storyMode: true, simulationState: true },
  });

  if (world?.storyMode !== true) return;

  const director = getAIDirector(worldId);
  const interactionCount = world.simulationState?.totalInteractions || 0;

  await director.evaluateAndAct(interactionCount);

  log.info({ worldId }, '🎬 Director evaluation triggered manually');
}
