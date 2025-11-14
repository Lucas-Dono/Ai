/**
 * Event Application Service
 *
 * Servicio que aplica eventos a agentes en mundos y mantiene estado persistente.
 * Los eventos tienen impacto real y duradero en los agentes.
 */

import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';
import {
  EventType,
  StatusEffect,
  Skill,
  InventoryItem,
  AgentState,
  ApplyEventRequest,
  ApplyEventResult,
  EVENT_TEMPLATES,
  HealthEventData,
  EmotionEventData,
  RelationshipEventData,
  SkillEventData,
  InventoryEventData,
  StatusEventData,
} from './event-types';

const log = createLogger('EventApplicationService');

// ========================================
// EVENT APPLICATION SERVICE
// ========================================

export class EventApplicationService {
  private worldId: string;

  constructor(worldId: string) {
    this.worldId = worldId;
  }

  /**
   * Aplica un evento a un agente
   */
  async applyEvent(request: ApplyEventRequest): Promise<ApplyEventResult> {
    const startTime = Date.now();
    const { agentId, eventType, eventData, reason } = request;

    log.info(
      { worldId: this.worldId, agentId, eventType, reason },
      '🎯 Applying event to agent'
    );

    // 1. Obtener estado actual del agente
    const worldAgent = await prisma.worldAgent.findUnique({
      where: {
        worldId_agentId: {
          worldId: this.worldId,
          agentId,
        },
      },
    });

    if (!worldAgent) {
      throw new Error(`WorldAgent not found: ${agentId} in world ${this.worldId}`);
    }

    const currentState = this.parseAgentState(worldAgent);
    const beforeState = { ...currentState };

    // 2. Aplicar efecto según tipo de evento
    const result = await this.applyEventByType(eventType, eventData, currentState, agentId);

    // 3. Actualizar estado en DB
    await this.updateAgentState(agentId, currentState);

    // 4. Construir resultado
    const applyResult: ApplyEventResult = {
      success: true,
      agentId,
      eventType,
      stateChanges: {
        health: beforeState.health !== currentState.health
          ? { before: beforeState.health, after: currentState.health }
          : undefined,
        energy: beforeState.energy !== currentState.energy
          ? { before: beforeState.energy, after: currentState.energy }
          : undefined,
        ...result,
      },
      message: this.buildResultMessage(eventType, result),
      timestamp: new Date(),
    };

    const duration = Date.now() - startTime;
    log.info(
      {
        worldId: this.worldId,
        agentId,
        eventType,
        duration,
        stateChanges: applyResult.stateChanges,
      },
      '✅ Event applied successfully'
    );

    return applyResult;
  }

  /**
   * Aplica evento según su tipo
   */
  private async applyEventByType(
    eventType: EventType,
    eventData: any,
    state: AgentState,
    agentId: string
  ): Promise<{
    skillsAdded?: string[];
    skillsRemoved?: string[];
    itemsAdded?: string[];
    itemsRemoved?: string[];
    effectsAdded?: StatusEffect[];
    effectsRemoved?: string[];
  }> {
    const template = EVENT_TEMPLATES[eventType];
    const result: any = {};

    // Aplicar según categoría
    if (this.isHealthEvent(eventType)) {
      const data = eventData as HealthEventData;
      this.applyHealthEvent(eventType, data, state);
      result.effectsAdded = [this.createStatusEffect(eventType, template.severity, data.duration || template.defaultDuration, data)];
    } else if (this.isEmotionEvent(eventType)) {
      const data = eventData as EmotionEventData;
      this.applyEmotionEvent(eventType, data, state);
      result.effectsAdded = [this.createStatusEffect(eventType, data.intensity, data.duration || template.defaultDuration, data)];
    } else if (this.isRelationshipEvent(eventType)) {
      const data = eventData as RelationshipEventData;
      await this.applyRelationshipEvent(eventType, data, state, agentId);
      result.effectsAdded = [this.createStatusEffect(eventType, template.severity, template.defaultDuration, data)];
    } else if (this.isSkillEvent(eventType)) {
      const data = eventData as SkillEventData;
      const skillResult = this.applySkillEvent(eventType, data, state);
      result.skillsAdded = skillResult.added;
      result.skillsRemoved = skillResult.removed;
    } else if (this.isInventoryEvent(eventType)) {
      const data = eventData as InventoryEventData;
      const invResult = this.applyInventoryEvent(eventType, data, state);
      result.itemsAdded = invResult.added;
      result.itemsRemoved = invResult.removed;
    } else if (this.isStatusEvent(eventType)) {
      const data = eventData as StatusEventData;
      this.applyStatusEvent(eventType, data, state);
      result.effectsAdded = [this.createStatusEffect(eventType, data.severity, data.duration || template.defaultDuration, data)];
    }

    return result;
  }

  /**
   * Aplica evento de salud
   */
  private applyHealthEvent(eventType: EventType, data: HealthEventData, state: AgentState): void {
    // Aplicar cambios de health y energy
    state.health = this.clamp(state.health + data.healthDelta, 0, 1);
    state.energy = this.clamp(state.energy + data.energyDelta, 0, 1);

    // Agregar efecto de status si tiene duración
    if (data.duration && data.duration > 0) {
      const effect = this.createStatusEffect(eventType, Math.abs(data.healthDelta), data.duration, data);
      state.statusEffects.push(effect);
    }

    log.debug(
      { eventType, health: state.health, energy: state.energy },
      'Health event applied'
    );
  }

  /**
   * Aplica evento emocional
   */
  private applyEmotionEvent(eventType: EventType, data: EmotionEventData, state: AgentState): void {
    // Los eventos emocionales afectan energy según intensidad
    const energyImpact = data.intensity * 0.3 * (data.emotionType === 'sadness' || data.emotionType === 'fear' ? -1 : 1);
    state.energy = this.clamp(state.energy + energyImpact, 0, 1);

    // Agregar efecto con decay si tiene duración
    if (data.duration && data.duration > 0) {
      const effect = this.createStatusEffect(eventType, data.intensity, data.duration, data);
      // Habilitar decay para eventos emocionales largos
      if (data.duration > 7) {
        effect.decay = {
          enabled: true,
          rate: 1 / data.duration, // Decae linealmente hasta 0
          currentSeverity: data.intensity,
        };
      }
      state.statusEffects.push(effect);
    }

    log.debug(
      { eventType, emotionType: data.emotionType, intensity: data.intensity },
      'Emotion event applied'
    );
  }

  /**
   * Aplica evento de relación
   */
  private async applyRelationshipEvent(
    eventType: EventType,
    data: RelationshipEventData,
    state: AgentState,
    agentId: string
  ): Promise<void> {
    // Actualizar relación en DB
    const relation = await prisma.agentToAgentRelation.upsert({
      where: {
        worldId_subjectId_targetId: {
          worldId: this.worldId,
          subjectId: agentId,
          targetId: data.targetAgentId,
        },
      },
      create: {
        worldId: this.worldId,
        subjectId: agentId,
        targetId: data.targetAgentId,
        trust: 0.5 + data.relationshipDelta * 0.5,
        affinity: 0.5 + data.relationshipDelta * 0.5,
        respect: 0.5,
        attraction: 0.5,
      },
      update: {
        trust: { increment: data.relationshipDelta * 0.3 },
        affinity: { increment: data.relationshipDelta * 0.5 },
        lastInteractionAt: new Date(),
      },
    });

    // Agregar efecto de status
    const template = EVENT_TEMPLATES[eventType];
    const effect = this.createStatusEffect(eventType, template.severity, template.defaultDuration, data);
    state.statusEffects.push(effect);

    log.debug(
      { eventType, targetAgentId: data.targetAgentId, delta: data.relationshipDelta },
      'Relationship event applied'
    );
  }

  /**
   * Aplica evento de skill
   */
  private applySkillEvent(
    eventType: EventType,
    data: SkillEventData,
    state: AgentState
  ): { added?: string[]; removed?: string[] } {
    const result: { added?: string[]; removed?: string[] } = {};

    if (eventType === EventType.SKILL_LEARNED) {
      // Agregar nueva skill
      const newSkill: Skill = {
        name: data.skillName,
        level: data.skillLevel || 10, // Nivel inicial
        acquiredAt: new Date(),
        category: data.category,
        description: data.description,
      };
      state.skills.push(newSkill);
      result.added = [data.skillName];

      log.debug({ skillName: data.skillName, level: newSkill.level }, 'Skill learned');
    } else if (eventType === EventType.SKILL_IMPROVED) {
      // Mejorar skill existente
      const skill = state.skills.find(s => s.name === data.skillName);
      if (skill) {
        skill.level = Math.min(100, skill.level + (data.skillLevel || 10));
        log.debug({ skillName: data.skillName, newLevel: skill.level }, 'Skill improved');
      } else {
        log.warn({ skillName: data.skillName }, 'Skill not found for improvement, learning instead');
        // Si no existe, aprenderla
        const newSkill: Skill = {
          name: data.skillName,
          level: data.skillLevel || 20,
          acquiredAt: new Date(),
          category: data.category,
          description: data.description,
        };
        state.skills.push(newSkill);
        result.added = [data.skillName];
      }
    } else if (eventType === EventType.SKILL_FORGOTTEN) {
      // Remover skill
      const index = state.skills.findIndex(s => s.name === data.skillName);
      if (index !== -1) {
        state.skills.splice(index, 1);
        result.removed = [data.skillName];
        log.debug({ skillName: data.skillName }, 'Skill forgotten');
      }
    }

    return result;
  }

  /**
   * Aplica evento de inventario
   */
  private applyInventoryEvent(
    eventType: EventType,
    data: InventoryEventData,
    state: AgentState
  ): { added?: string[]; removed?: string[] } {
    const result: { added?: string[]; removed?: string[] } = {};

    if (eventType === EventType.ITEM_ACQUIRED) {
      // Agregar item o incrementar cantidad
      const existingItem = state.inventory.find(i => i.name === data.itemName);
      if (existingItem) {
        existingItem.quantity += data.quantity;
        log.debug({ itemName: data.itemName, newQuantity: existingItem.quantity }, 'Item quantity increased');
      } else {
        const newItem: InventoryItem = {
          id: data.itemId || `item_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          name: data.itemName,
          quantity: data.quantity,
          acquiredAt: new Date(),
          category: data.category,
          description: data.description,
        };
        state.inventory.push(newItem);
        result.added = [data.itemName];
        log.debug({ itemName: data.itemName, quantity: data.quantity }, 'Item acquired');
      }
    } else if (eventType === EventType.ITEM_LOST || eventType === EventType.ITEM_USED) {
      // Remover item o decrementar cantidad
      const item = state.inventory.find(i => i.name === data.itemName);
      if (item) {
        item.quantity -= data.quantity;
        if (item.quantity <= 0) {
          const index = state.inventory.findIndex(i => i.name === data.itemName);
          state.inventory.splice(index, 1);
          result.removed = [data.itemName];
          log.debug({ itemName: data.itemName }, 'Item removed from inventory');
        } else {
          log.debug({ itemName: data.itemName, newQuantity: item.quantity }, 'Item quantity decreased');
        }
      }
    }

    return result;
  }

  /**
   * Aplica evento de status general
   */
  private applyStatusEvent(eventType: EventType, data: StatusEventData, state: AgentState): void {
    const template = EVENT_TEMPLATES[eventType];

    // Aplicar impactos en health/energy
    state.health = this.clamp(state.health + template.healthImpact, 0, 1);
    state.energy = this.clamp(state.energy + template.energyImpact, 0, 1);

    // Agregar efecto de status
    const effect = this.createStatusEffect(eventType, data.severity, data.duration || template.defaultDuration, data);
    state.statusEffects.push(effect);

    log.debug({ eventType, severity: data.severity }, 'Status event applied');
  }

  /**
   * Crea un StatusEffect
   */
  private createStatusEffect(
    type: EventType,
    severity: number,
    duration: number | null,
    metadata: any
  ): StatusEffect {
    const now = new Date();
    const expiresAt = duration ? new Date(now.getTime() + duration * 24 * 60 * 60 * 1000) : null;

    return {
      type,
      severity: this.clamp(severity, 0, 1),
      duration,
      appliedAt: now,
      expiresAt,
      metadata: metadata || {},
    };
  }

  /**
   * Actualiza el estado del agente en DB
   */
  async updateAgentState(agentId: string, state: AgentState): Promise<void> {
    await prisma.worldAgent.update({
      where: {
        worldId_agentId: {
          worldId: this.worldId,
          agentId,
        },
      },
      data: {
        health: state.health,
        energy: state.energy,
        skills: state.skills as any,
        inventory: state.inventory as any,
        statusEffects: state.statusEffects as any,
        lastStateUpdate: new Date(),
      },
    });
  }

  /**
   * Obtiene efectos activos de un agente
   */
  async getActiveEffects(agentId: string): Promise<StatusEffect[]> {
    const worldAgent = await prisma.worldAgent.findUnique({
      where: {
        worldId_agentId: {
          worldId: this.worldId,
          agentId,
        },
      },
    });

    if (!worldAgent) {
      return [];
    }

    const state = this.parseAgentState(worldAgent);
    const now = new Date();

    // Filtrar efectos activos (no expirados)
    return state.statusEffects.filter(effect => {
      if (!effect.expiresAt) return true; // Permanente
      return new Date(effect.expiresAt) > now;
    });
  }

  /**
   * Remueve efectos expirados
   */
  async removeExpiredEffects(agentId: string): Promise<string[]> {
    const worldAgent = await prisma.worldAgent.findUnique({
      where: {
        worldId_agentId: {
          worldId: this.worldId,
          agentId,
        },
      },
    });

    if (!worldAgent) {
      return [];
    }

    const state = this.parseAgentState(worldAgent);
    const now = new Date();
    const removed: string[] = [];

    // Filtrar efectos no expirados
    state.statusEffects = state.statusEffects.filter(effect => {
      if (!effect.expiresAt) return true; // Permanente
      const isExpired = new Date(effect.expiresAt) <= now;
      if (isExpired) {
        removed.push(effect.type);
        log.debug({ agentId, effectType: effect.type }, 'Effect expired and removed');
      }
      return !isExpired;
    });

    // Actualizar en DB si se removieron efectos
    if (removed.length > 0) {
      await this.updateAgentState(agentId, state);
    }

    return removed;
  }

  /**
   * Aplica decay a efectos temporales
   */
  async applyDecayToEffects(agentId: string): Promise<void> {
    const worldAgent = await prisma.worldAgent.findUnique({
      where: {
        worldId_agentId: {
          worldId: this.worldId,
          agentId,
        },
      },
    });

    if (!worldAgent) {
      return;
    }

    const state = this.parseAgentState(worldAgent);
    let hasChanges = false;

    for (const effect of state.statusEffects) {
      if (effect.decay?.enabled && effect.decay.currentSeverity > 0) {
        // Aplicar decay
        effect.decay.currentSeverity = Math.max(0, effect.decay.currentSeverity - effect.decay.rate);
        hasChanges = true;

        log.debug(
          { agentId, effectType: effect.type, newSeverity: effect.decay.currentSeverity },
          'Effect decayed'
        );
      }
    }

    if (hasChanges) {
      await this.updateAgentState(agentId, state);
    }
  }

  /**
   * Obtiene estado completo del agente con descripción narrativa
   */
  async getAgentStateDescription(agentId: string): Promise<string> {
    const worldAgent = await prisma.worldAgent.findUnique({
      where: {
        worldId_agentId: {
          worldId: this.worldId,
          agentId,
        },
      },
      include: {
        agent: {
          select: { name: true },
        },
      },
    });

    if (!worldAgent) {
      return '';
    }

    const state = this.parseAgentState(worldAgent);
    const activeEffects = await this.getActiveEffects(agentId);

    const parts: string[] = [];

    // Health
    if (state.health < 0.5) {
      parts.push(`salud débil (${(state.health * 100).toFixed(0)}%)`);
    } else if (state.health < 0.8) {
      parts.push(`salud regular (${(state.health * 100).toFixed(0)}%)`);
    }

    // Energy
    if (state.energy < 0.3) {
      parts.push(`muy cansado (${(state.energy * 100).toFixed(0)}% energía)`);
    } else if (state.energy < 0.6) {
      parts.push(`algo cansado (${(state.energy * 100).toFixed(0)}% energía)`);
    }

    // Active effects
    if (activeEffects.length > 0) {
      const effectDescriptions = activeEffects
        .map(e => EVENT_TEMPLATES[e.type]?.description || e.type)
        .slice(0, 3);
      parts.push(effectDescriptions.join(', '));
    }

    // Skills
    if (state.skills.length > 0) {
      const topSkills = state.skills
        .sort((a, b) => b.level - a.level)
        .slice(0, 3)
        .map(s => `${s.name} (nivel ${s.level})`)
        .join(', ');
      parts.push(`habilidades: ${topSkills}`);
    }

    // Inventory highlights
    if (state.inventory.length > 0) {
      const itemCount = state.inventory.length;
      parts.push(`${itemCount} item${itemCount > 1 ? 's' : ''} en inventario`);
    }

    if (parts.length === 0) {
      return `${worldAgent.agent.name} está en buen estado.`;
    }

    return `${worldAgent.agent.name} - ${parts.join(', ')}.`;
  }

  // ========================================
  // HELPERS
  // ========================================

  private parseAgentState(worldAgent: any): AgentState {
    return {
      health: worldAgent.health || 1.0,
      energy: worldAgent.energy || 1.0,
      skills: Array.isArray(worldAgent.skills) ? worldAgent.skills : [],
      inventory: Array.isArray(worldAgent.inventory) ? worldAgent.inventory : [],
      statusEffects: Array.isArray(worldAgent.statusEffects) ? worldAgent.statusEffects : [],
      lastStateUpdate: worldAgent.lastStateUpdate || undefined,
    };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private isHealthEvent(type: EventType): boolean {
    return [
      EventType.ILLNESS,
      EventType.INJURY,
      EventType.RECOVERY,
      EventType.EXHAUSTION,
      EventType.ENERGIZED,
    ].includes(type);
  }

  private isEmotionEvent(type: EventType): boolean {
    return [
      EventType.TRAUMA,
      EventType.HAPPINESS,
      EventType.DEPRESSION,
      EventType.ANXIETY,
      EventType.RELIEF,
      EventType.INFATUATION,
      EventType.HEARTBREAK,
      EventType.GRIEF,
    ].includes(type);
  }

  private isRelationshipEvent(type: EventType): boolean {
    return [
      EventType.CONFLICT,
      EventType.ALLIANCE,
      EventType.BETRAYAL,
      EventType.RECONCILIATION,
    ].includes(type);
  }

  private isSkillEvent(type: EventType): boolean {
    return [
      EventType.SKILL_LEARNED,
      EventType.SKILL_IMPROVED,
      EventType.SKILL_FORGOTTEN,
    ].includes(type);
  }

  private isInventoryEvent(type: EventType): boolean {
    return [
      EventType.ITEM_ACQUIRED,
      EventType.ITEM_LOST,
      EventType.ITEM_USED,
    ].includes(type);
  }

  private isStatusEvent(type: EventType): boolean {
    return [
      EventType.PREGNANCY,
      EventType.IMPRISONMENT,
      EventType.TRAVEL,
      EventType.PROMOTION,
      EventType.DEMOTION,
      EventType.CURSE,
      EventType.BLESSING,
    ].includes(type);
  }

  private buildResultMessage(eventType: EventType, result: any): string {
    const template = EVENT_TEMPLATES[eventType];
    const parts: string[] = [template.description];

    if (result.skillsAdded?.length) {
      parts.push(`Aprendió: ${result.skillsAdded.join(', ')}`);
    }
    if (result.itemsAdded?.length) {
      parts.push(`Obtuvo: ${result.itemsAdded.join(', ')}`);
    }
    if (result.effectsAdded?.length) {
      parts.push(`Efectos aplicados: ${result.effectsAdded.length}`);
    }

    return parts.join('. ');
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

export function getEventApplicationService(worldId: string): EventApplicationService {
  return new EventApplicationService(worldId);
}
