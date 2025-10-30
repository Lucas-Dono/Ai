/**
 * Story Engine - Sistema de narrativa guiada para mundos con historia
 * Gestiona eventos, arcos de personajes y progresión narrativa
 */

import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const log = createLogger('StoryEngine');

// ========================================
// TIPOS
// ========================================

export interface StoryMilestone {
  id: string;
  name: string;
  description: string;
  requiredConditions: {
    type: 'interaction_count' | 'relationship_level' | 'event_completion' | 'character_action';
    target?: string; // character ID
    value: number | string;
  }[];
  rewards?: {
    promotionBoost?: number;
    relationshipChange?: { targetId: string; amount: number }[];
  };
}

export interface StoryArcTemplate {
  name: string;
  type: 'romance' | 'friendship' | 'rivalry' | 'personal_growth' | 'comedy';
  description: string;
  milestones: StoryMilestone[];
  emotionalTone: 'comedic' | 'dramatic' | 'heartwarming' | 'bittersweet';
}

export interface StoryEventTemplate {
  type: string;
  name: string;
  description: string;
  triggerType: 'automatic' | 'progress_based' | 'character_action';
  requiredProgress?: number;
  involvedCharacters: 'all' | 'main' | string[]; // IDs específicos o rol
  focusCharacter?: string;
  duration?: number; // En turnos
  outcomes: {
    success: { impact: any; nextEvents?: string[] };
    failure: { impact: any; nextEvents?: string[] };
  };
}

// ========================================
// STORY ENGINE CLASS
// ========================================

export class StoryEngine {
  private worldId: string;

  constructor(worldId: string) {
    this.worldId = worldId;
  }

  /**
   * Inicializa el sistema de narrativa para un mundo
   */
  async initializeStory(storyScript: any) {
    log.info({ worldId: this.worldId }, 'Initializing story system');

    await prisma.world.update({
      where: { id: this.worldId },
      data: {
        storyMode: true,
        storyScript: storyScript as any,
        storyProgress: 0,
        currentStoryBeat: storyScript.initialBeat || 'introduction',
      },
    });

    // Crear eventos iniciales
    if (storyScript.events) {
      for (const eventTemplate of storyScript.events) {
        if (eventTemplate.triggerType === 'automatic' && eventTemplate.requiredProgress === 0) {
          await this.createEvent(eventTemplate);
        }
      }
    }

    log.info({ worldId: this.worldId }, 'Story system initialized');
  }

  /**
   * Crea un evento en la base de datos
   */
  async createEvent(template: StoryEventTemplate) {
    const world = await prisma.world.findUnique({
      where: { id: this.worldId },
      include: { worldAgents: true },
    });

    if (!world) return null;

    // Resolver personajes involucrados
    let involvedCharacterIds: string[] = [];
    if (template.involvedCharacters === 'all') {
      involvedCharacterIds = world.worldAgents.map(wa => wa.agentId);
    } else if (template.involvedCharacters === 'main') {
      involvedCharacterIds = world.worldAgents
        .filter(wa => wa.importanceLevel === 'main')
        .map(wa => wa.agentId);
    } else {
      involvedCharacterIds = template.involvedCharacters;
    }

    const event = await prisma.storyEvent.create({
      data: {
        worldId: this.worldId,
        eventType: template.type,
        eventName: template.name,
        description: template.description,
        triggerType: template.triggerType,
        requiredProgress: template.requiredProgress,
        involvedCharacters: involvedCharacterIds as any,
        focusCharacter: template.focusCharacter,
        storyImpact: template.outcomes as any,
      },
    });

    log.info({ worldId: this.worldId, eventId: event.id, eventName: template.name }, 'Story event created');
    return event;
  }

  /**
   * Crea un arco de personaje
   */
  async createCharacterArc(agentId: string, arcTemplate: StoryArcTemplate) {
    const arc = await prisma.characterArc.create({
      data: {
        worldId: this.worldId,
        agentId,
        arcName: arcTemplate.name,
        arcType: arcTemplate.type,
        description: arcTemplate.description,
        milestones: arcTemplate.milestones as any,
        emotionalTone: arcTemplate.emotionalTone,
        currentMilestone: 0,
        progress: 0,
      },
    });

    log.info({ worldId: this.worldId, agentId, arcId: arc.id, arcName: arcTemplate.name }, 'Character arc created');
    return arc;
  }

  /**
   * Actualiza el progreso de la historia basado en interacciones
   */
  async updateStoryProgress() {
    const world = await prisma.world.findUnique({
      where: { id: this.worldId },
      include: {
        simulationState: true,
        worldAgents: true,
        storyEvents: { where: { isCompleted: false } },
        characterArcs: { where: { isActive: true } },
      },
    });

    if (!world || !world.storyMode) return;

    const totalInteractions = world.simulationState?.totalInteractions || 0;
    const maxInteractions = world.maxInteractions || 1000;
    const newProgress = Math.min(totalInteractions / maxInteractions, 1);

    // Actualizar progreso general
    await prisma.world.update({
      where: { id: this.worldId },
      data: { storyProgress: newProgress },
    });

    // Verificar y activar eventos pendientes
    for (const event of world.storyEvents) {
      if (
        !event.isActive &&
        event.triggerType === 'progress_based' &&
        event.requiredProgress !== null &&
        newProgress >= event.requiredProgress
      ) {
        await this.activateEvent(event.id);
      }
    }

    // Actualizar progreso de arcos de personajes
    for (const arc of world.characterArcs) {
      await this.updateCharacterArcProgress(arc.id);
    }

    log.debug({ worldId: this.worldId, newProgress }, 'Story progress updated');
  }

  /**
   * Activa un evento
   */
  async activateEvent(eventId: string) {
    await prisma.storyEvent.update({
      where: { id: eventId },
      data: {
        isActive: true,
        startedAt: new Date(),
      },
    });

    log.info({ worldId: this.worldId, eventId }, 'Story event activated');
  }

  /**
   * Completa un evento
   */
  async completeEvent(eventId: string, outcome: 'success' | 'failure') {
    const event = await prisma.storyEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) return;

    await prisma.storyEvent.update({
      where: { id: eventId },
      data: {
        isCompleted: true,
        isActive: false,
        completedAt: new Date(),
        outcome,
      },
    });

    // Aplicar impacto del evento
    const impact = (event.storyImpact as any)?.[outcome];
    if (impact) {
      // Aquí puedes aplicar cambios a personajes, relaciones, etc.
      log.info({ worldId: this.worldId, eventId, outcome, impact }, 'Applying story event impact');
    }

    log.info({ worldId: this.worldId, eventId, outcome }, 'Story event completed');
  }

  /**
   * Actualiza el progreso de un arco de personaje
   */
  async updateCharacterArcProgress(arcId: string) {
    // First get arc to know agentId
    const arcBasic = await prisma.characterArc.findUnique({
      where: { id: arcId },
      select: { agentId: true, isActive: true },
    });

    if (!arcBasic || !arcBasic.isActive) return;

    const arc = await prisma.characterArc.findUnique({
      where: { id: arcId },
      include: {
        world: {
          include: {
            worldAgents: true,
            agentRelations: {
              where: { subjectId: arcBasic.agentId },
            },
          },
        },
      },
    });

    if (!arc || !arc.isActive) return;

    const milestones = arc.milestones as any as StoryMilestone[];
    const currentMilestone = milestones[arc.currentMilestone];

    if (!currentMilestone) return;

    // Verificar si se cumplieron las condiciones del milestone actual
    const worldAgent = arc.world.worldAgents.find(wa => wa.agentId === arc.agentId);
    if (!worldAgent) return;

    let allConditionsMet = true;
    for (const condition of currentMilestone.requiredConditions) {
      switch (condition.type) {
        case 'interaction_count':
          if (worldAgent.totalInteractions < (condition.value as number)) {
            allConditionsMet = false;
          }
          break;
        case 'relationship_level':
          const relation = arc.world.agentRelations.find(
            (r: any) => r.targetId === condition.target
          );
          if (!relation || relation.trust < (condition.value as number)) {
            allConditionsMet = false;
          }
          break;
        // Agregar más tipos de condiciones según necesites
      }
    }

    // Si se cumplieron todas las condiciones, avanzar al siguiente milestone
    if (allConditionsMet) {
      const nextMilestoneIndex = arc.currentMilestone + 1;
      const isCompleted = nextMilestoneIndex >= milestones.length;

      await prisma.characterArc.update({
        where: { id: arcId },
        data: {
          currentMilestone: isCompleted ? arc.currentMilestone : nextMilestoneIndex,
          progress: isCompleted ? 1 : nextMilestoneIndex / milestones.length,
          isCompleted,
          completedAt: isCompleted ? new Date() : undefined,
          keyMoments: [
            ...(arc.keyMoments as any[]),
            {
              milestone: currentMilestone.name,
              completedAt: new Date(),
            },
          ] as any,
        },
      });

      // Aplicar recompensas del milestone
      if (currentMilestone.rewards?.promotionBoost) {
        await prisma.worldAgent.update({
          where: {
            worldId_agentId: {
              worldId: this.worldId,
              agentId: arc.agentId,
            },
          },
          data: {
            promotionScore: {
              increment: currentMilestone.rewards.promotionBoost,
            },
          },
        });
      }

      log.info(
        { worldId: this.worldId, arcId, agentId: arc.agentId, milestone: currentMilestone.name },
        'Character arc milestone completed'
      );
    }
  }

  /**
   * Obtiene el estado actual de la narrativa
   */
  async getStoryState() {
    const world = await prisma.world.findUnique({
      where: { id: this.worldId },
      include: {
        storyEvents: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
        characterArcs: {
          where: { isActive: true },
          include: {
            world: {
              select: {
                worldAgents: {
                  select: { agent: { select: { name: true } } },
                },
              },
            },
          },
        },
      },
    });

    return {
      storyMode: world?.storyMode,
      currentBeat: world?.currentStoryBeat,
      progress: world?.storyProgress,
      activeEvents: [],
      activeArcs: [],
    };
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Obtiene el motor de historia para un mundo
 */
export function getStoryEngine(worldId: string): StoryEngine {
  return new StoryEngine(worldId);
}
