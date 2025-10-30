/**
 * Emergent Events Generator
 *
 * Crea eventos narrativos emergentes basados en el estado del mundo:
 * - "Bump-into" scenes (encuentros casuales)
 * - Coincidencias narrativas
 * - Interrupciones naturales
 * - Momentos de oportunidad
 *
 * Trabaja en conjunto con el Director AI para mantener
 * la narrativa fresca e interesante.
 */

import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';
import type { NarrativeMetrics, NarrativeWarning } from './narrative-analyzer';

const log = createLogger('EmergentEvents');

// ========================================
// TIPOS
// ========================================

export interface EmergentEventTemplate {
  type: 'bump_into' | 'interruption' | 'coincidence' | 'opportunity' | 'surprise';
  name: string;
  description: string;
  requiredConditions: {
    minRelationshipLevel?: number; // 0-1
    maxRelationshipLevel?: number;
    requiredImportanceLevel?: 'main' | 'secondary' | 'filler';
    requiredEmotionalState?: string;
    narrativeMetrics?: {
      minTension?: number;
      maxTension?: number;
      maxRepetition?: number;
    };
  };
  involvedCharactersCount: number; // Cuántos personajes involucrar
  prompt: string; // Prompt especial para el evento
  priority: number; // 0-1, mayor = más urgente
}

export interface GeneratedEvent {
  template: EmergentEventTemplate;
  involvedCharacters: string[]; // IDs de agentes
  triggerReason: string;
  narrativeImpact: string;
}

// ========================================
// EMERGENT EVENTS GENERATOR
// ========================================

export class EmergentEventsGenerator {
  private worldId: string;

  constructor(worldId: string) {
    this.worldId = worldId;
  }

  /**
   * Evalúa si se debe generar un evento emergente
   */
  async evaluateAndGenerate(
    narrativeMetrics: NarrativeMetrics,
    warnings: NarrativeWarning[]
  ): Promise<GeneratedEvent | null> {
    log.debug({ worldId: this.worldId, warningsCount: warnings.length }, 'Evaluating emergent events');

    // Obtener estado del mundo
    const world = await prisma.world.findUnique({
      where: { id: this.worldId },
      include: {
        worldAgents: {
          where: { isActive: true },
          include: { agent: true },
        },
        agentRelations: true,
      },
    });

    if (!world || !world.storyMode) {
      return null; // Solo en story mode
    }

    // Evaluar templates disponibles
    const templates = this.getEventTemplates();

    for (const template of templates) {
      // Verificar si las condiciones narrativas se cumplen
      const metricsMatch = this.checkNarrativeMetrics(template, narrativeMetrics);
      if (!metricsMatch) continue;

      // Encontrar personajes que cumplan las condiciones
      const suitableCharacters = await this.findSuitableCharacters(template, world);
      if (suitableCharacters.length < template.involvedCharactersCount) continue;

      // Seleccionar personajes aleatoriamente
      const selectedCharacters = this.selectCharacters(
        suitableCharacters,
        template.involvedCharactersCount
      );

      // Generar el evento
      const event: GeneratedEvent = {
        template,
        involvedCharacters: selectedCharacters.map(c => c.id),
        triggerReason: this.generateTriggerReason(template, narrativeMetrics, warnings),
        narrativeImpact: template.description,
      };

      log.info(
        {
          worldId: this.worldId,
          eventType: template.type,
          eventName: template.name,
          characters: selectedCharacters.map(c => c.name),
          reason: event.triggerReason,
        },
        '✨ Emergent event generated'
      );

      return event;
    }

    return null;
  }

  /**
   * Obtiene templates de eventos emergentes
   */
  private getEventTemplates(): EmergentEventTemplate[] {
    return [
      // BUMP-INTO: Encuentros casuales
      {
        type: 'bump_into',
        name: 'Encuentro Casual en el Pasillo',
        description: 'Dos personajes se encuentran inesperadamente',
        requiredConditions: {
          minRelationshipLevel: 0.3,
          maxRelationshipLevel: 0.7,
          narrativeMetrics: {
            maxRepetition: 0.7, // Activar si hay mucha repetición
          },
        },
        involvedCharactersCount: 2,
        prompt: `Un encuentro casual e inesperado acaba de ocurrir. Los personajes se encuentran en el pasillo/corredor. Este es un momento perfecto para:
- Revelar algo sobre sus personalidades
- Avanzar sutilmente su relación
- Crear un momento cómico o tenso
- Mostrar contraste entre personalidades

Responde como tu personaje reaccionaría naturalmente a este encuentro.`,
        priority: 0.6,
      },
      {
        type: 'bump_into',
        name: 'Encuentro en la Azotea',
        description: 'Un personaje encuentra a otro en un lugar inesperado (azotea)',
        requiredConditions: {
          minRelationshipLevel: 0.4,
          narrativeMetrics: {
            minTension: 0.4, // Requiere cierta tensión emocional
          },
        },
        involvedCharactersCount: 2,
        prompt: `Tu personaje acaba de encontrar a otro en la azotea de la escuela, un lugar tranquilo y algo privado. Este es un momento íntimo perfecto para:
- Conversaciones sinceras
- Revelaciones emocionales
- Momentos vulnerables
- Desarrollo de relación profunda

La atmósfera es tranquila y privada. Responde apropiadamente.`,
        priority: 0.7,
      },

      // INTERRUPTION: Interrupciones naturales
      {
        type: 'interruption',
        name: 'Interrupción por Compañero de Clase',
        description: 'Un tercer personaje interrumpe una conversación',
        requiredConditions: {
          requiredImportanceLevel: 'secondary',
          narrativeMetrics: {
            maxTension: 0.8, // No interrumpir momentos muy tensos
          },
        },
        involvedCharactersCount: 1,
        prompt: `Tu personaje acaba de llegar e interrumpe la conversación actual (sin saberlo o intencionalmente). Este momento puede:
- Crear comedia por timing
- Frustrar un momento romántico
- Cambiar la dinámica de la escena
- Dar alivio cómico

Actúa naturalmente como tu personaje llegaría a esta situación.`,
        priority: 0.5,
      },

      // COINCIDENCE: Coincidencias narrativas
      {
        type: 'coincidence',
        name: 'Misma Asignación de Proyecto',
        description: 'Dos personajes descubren que deben trabajar juntos',
        requiredConditions: {
          minRelationshipLevel: 0.2,
          maxRelationshipLevel: 0.6,
        },
        involvedCharactersCount: 2,
        prompt: `Acaban de descubrir que tienen que trabajar juntos en un proyecto escolar. Este es un catalizador perfecto para:
- Forzar interacción entre personajes
- Crear conflicto o conexión
- Desarrollar relación a través de colaboración
- Mostrar diferentes estilos de trabajo

Reacciona como tu personaje lo haría naturalmente.`,
        priority: 0.65,
      },

      // OPPORTUNITY: Momentos de oportunidad
      {
        type: 'opportunity',
        name: 'Momento a Solas Inesperado',
        description: 'Dos personajes quedan solos inesperadamente',
        requiredConditions: {
          minRelationshipLevel: 0.5,
          narrativeMetrics: {
            minTension: 0.3,
          },
        },
        involvedCharactersCount: 2,
        prompt: `Por alguna razón, los otros se han ido y ustedes dos quedan solos. Este es un momento de oportunidad para:
- Conversaciones más profundas
- Momentos románticos o tensos
- Revelaciones personales
- Avanzar la relación significativamente

La privacidad crea una atmósfera diferente. Usa esta oportunidad.`,
        priority: 0.75,
      },

      // SURPRISE: Sorpresas
      {
        type: 'surprise',
        name: 'Revelación Sorprendente',
        description: 'Algo sorprendente se revela sobre un personaje',
        requiredConditions: {
          requiredImportanceLevel: 'main',
          narrativeMetrics: {
            maxRepetition: 0.6,
            maxTension: 0.5,
          },
        },
        involvedCharactersCount: 1,
        prompt: `Algo sorprendente acaba de revelarse sobre tu personaje (un talento oculto, un secreto inofensivo, una conexión inesperada). Este momento puede:
- Añadir profundidad al personaje
- Crear interés renovado
- Cambiar cómo otros te ven
- Generar nuevas dinámicas

Revela este aspecto sorprendente naturalmente.`,
        priority: 0.7,
      },

      // Anti-repetición: Cambio de escenario
      {
        type: 'surprise',
        name: 'Cambio de Escenario Forzado',
        description: 'La conversación debe moverse a otro lugar',
        requiredConditions: {
          narrativeMetrics: {
            maxRepetition: 0.75, // Alta repetición
          },
        },
        involvedCharactersCount: 0, // Afecta a todos
        prompt: `El escenario actual se ha vuelto inapropiado (lluvia, campana, profesor llegando, etc.) y deben moverse a otro lugar. Este cambio:
- Rompe la monotonía
- Crea transición natural
- Permite reset de energía
- Ofrece nueva atmósfera

Reacciona al cambio de ubicación.`,
        priority: 0.8,
      },
    ];
  }

  /**
   * Verifica si las métricas narrativas cumplen las condiciones
   */
  private checkNarrativeMetrics(
    template: EmergentEventTemplate,
    metrics: NarrativeMetrics
  ): boolean {
    const conditions = template.requiredConditions.narrativeMetrics;
    if (!conditions) return true;

    if (conditions.minTension !== undefined && metrics.dramaticTension < conditions.minTension) {
      return false;
    }

    if (conditions.maxTension !== undefined && metrics.dramaticTension > conditions.maxTension) {
      return false;
    }

    if (conditions.maxRepetition !== undefined && metrics.repetitionScore < conditions.maxRepetition) {
      return false;
    }

    return true;
  }

  /**
   * Encuentra personajes adecuados para el evento
   */
  private async findSuitableCharacters(template: EmergentEventTemplate, world: any): Promise<any[]> {
    let candidates = world.worldAgents.map((wa: any) => ({
      id: wa.agentId,
      name: wa.agent.name,
      importanceLevel: wa.importanceLevel,
      worldAgent: wa,
    }));

    // Filtrar por nivel de importancia si es requerido
    if (template.requiredConditions.requiredImportanceLevel) {
      candidates = candidates.filter(
        (c: any) => c.importanceLevel === template.requiredConditions.requiredImportanceLevel
      );
    }

    // TODO: Filtrar por nivel de relación si se especifica
    // Necesitaríamos cargar las relaciones y evaluarlas

    return candidates;
  }

  /**
   * Selecciona personajes aleatoriamente de los candidatos
   */
  private selectCharacters(candidates: any[], count: number): any[] {
    if (count === 0) return [];

    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Genera razón del trigger
   */
  private generateTriggerReason(
    template: EmergentEventTemplate,
    metrics: NarrativeMetrics,
    warnings: NarrativeWarning[]
  ): string {
    const reasons: string[] = [];

    if (metrics.repetitionScore > 0.7) {
      reasons.push('alta repetición detectada');
    }

    if (metrics.dramaticTension < 0.3) {
      reasons.push('tensión dramática baja');
    }

    if (metrics.engagementScore < 0.4) {
      reasons.push('engagement bajo');
    }

    if (warnings.some(w => w.severity === 'critical')) {
      reasons.push('warning crítico activado');
    }

    if (reasons.length === 0) {
      reasons.push('oportunidad narrativa detectada');
    }

    return reasons.join(', ');
  }

  /**
   * Aplica un evento emergente al mundo
   */
  async applyEvent(event: GeneratedEvent, currentTurn?: number): Promise<void> {
    // Obtener turno actual si no se proporciona
    if (currentTurn === undefined) {
      const simState = await prisma.worldSimulationState.findUnique({
        where: { worldId: this.worldId },
      });
      currentTurn = simState?.totalInteractions || 0;
    }

    // Actualizar el estado del mundo con el evento activo
    await prisma.world.update({
      where: { id: this.worldId },
      data: {
        currentEmergentEvent: {
          type: event.template.type,
          name: event.template.name,
          description: event.template.description,
          involvedCharacters: event.involvedCharacters,
          prompt: event.template.prompt,
          triggeredAt: new Date(),
          turnTriggered: currentTurn,
          reason: event.triggerReason,
        } as any,
      },
    });

    log.info(
      {
        worldId: this.worldId,
        eventName: event.template.name,
        charactersCount: event.involvedCharacters.length,
        turn: currentTurn,
      },
      '🎪 Emergent event applied to world'
    );
  }

  /**
   * Limpia evento emergente activo
   */
  async clearEvent(): Promise<void> {
    await prisma.world.update({
      where: { id: this.worldId },
      data: {
        currentEmergentEvent: prisma.JsonNull,
      },
    });
  }

  /**
   * Obtiene evento emergente activo
   */
  async getActiveEvent(): Promise<any | null> {
    const world = await prisma.world.findUnique({
      where: { id: this.worldId },
      select: { currentEmergentEvent: true },
    });

    return world?.currentEmergentEvent || null;
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

export function getEmergentEventsGenerator(worldId: string): EmergentEventsGenerator {
  return new EmergentEventsGenerator(worldId);
}
