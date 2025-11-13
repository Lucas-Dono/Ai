/**
 * Life Events Timeline Service - Sistema de arcos narrativos
 * Detecta, vincula y gestiona arcos narrativos en la vida del usuario
 */

import { prisma } from '@/lib/prisma';
import {
  NarrativeArcDetector,
  DetectedArcEvent,
  NarrativeCategory,
  NarrativeState,
} from './narrative-arc-detector';

export interface NarrativeArc {
  id: string;
  category: string;
  theme: string;
  title?: string;
  description?: string;
  status: string;
  currentState?: string;
  startedAt: Date;
  lastEventAt: Date;
  completedAt?: Date;
  totalEvents: number;
  outcome?: string;
  confidence: number;
  events: NarrativeArcEvent[];
}

export interface NarrativeArcEvent {
  id: string;
  eventDate: Date;
  description: string;
  narrativeState?: string;
  detectionConfidence?: number;
  detectedKeywords?: any;
}

export interface CreateNarrativeEventInput {
  message: string;
  timestamp: Date;
  agentId: string;
  userId: string;
}

export const LifeEventsTimelineService = {
  /**
   * Procesa un mensaje del usuario y detecta posibles eventos narrativos
   */
  async processMessage(input: CreateNarrativeEventInput): Promise<void> {
    const { message, timestamp, agentId, userId } = input;

    // Analizar mensaje con detector
    const detectedEvent = NarrativeArcDetector.analyzeMessage(message, timestamp);

    if (!detectedEvent) {
      // No se detectó ningún evento narrativo relevante
      return;
    }

    // Buscar si existe un arco activo relacionado
    const relatedArc = await this.findRelatedActiveArc(
      agentId,
      userId,
      detectedEvent
    );

    if (relatedArc) {
      // Agregar evento al arco existente
      await this.addEventToArc(relatedArc.id, detectedEvent, agentId, userId);
    } else {
      // Crear nuevo arco narrativo
      await this.createNewArc(detectedEvent, agentId, userId);
    }
  },

  /**
   * Busca un arco activo relacionado con el evento detectado
   */
  async findRelatedActiveArc(
    agentId: string,
    userId: string,
    event: DetectedArcEvent
  ) {
    // Buscar arcos activos de la misma categoría en los últimos 90 días
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const activeArcs = await prisma.narrativeArc.findMany({
      where: {
        agentId,
        userId,
        category: event.category,
        status: 'active',
        lastEventAt: {
          gte: ninetyDaysAgo,
        },
      },
      include: {
        events: {
          orderBy: { eventDate: 'desc' },
          take: 5,
        },
      },
    });

    // Buscar el arco más relacionado
    for (const arc of activeArcs) {
      const theme1 = arc.theme;
      const theme2 = NarrativeArcDetector.extractTheme(event.message);
      const similarity = NarrativeArcDetector.calculateThemeSimilarity(
        theme1,
        theme2
      );

      if (similarity > 0.3) {
        return arc;
      }
    }

    return null;
  },

  /**
   * Crea un nuevo arco narrativo
   */
  async createNewArc(
    event: DetectedArcEvent,
    agentId: string,
    userId: string
  ) {
    const theme = NarrativeArcDetector.extractTheme(event.message);
    const title = this.generateArcTitle(event);

    // Crear arco
    const arc = await prisma.narrativeArc.create({
      data: {
        agentId,
        userId,
        category: event.category,
        theme,
        title,
        currentState: event.state,
        startedAt: event.timestamp,
        lastEventAt: event.timestamp,
        totalEvents: 1,
        confidence: event.confidence,
        status: event.state === 'conclusion' ? 'completed' : 'active',
        completedAt: event.state === 'conclusion' ? event.timestamp : null,
        outcome:
          event.state === 'conclusion'
            ? event.emotionalTone === 'positive'
              ? 'positive'
              : event.emotionalTone === 'negative'
              ? 'negative'
              : 'neutral'
            : null,
      },
    });

    // Crear evento asociado
    await prisma.importantEvent.create({
      data: {
        agentId,
        userId,
        eventDate: event.timestamp,
        type: this.mapCategoryToEventType(event.category),
        description: event.message,
        priority: 'medium',
        narrativeArcId: arc.id,
        narrativeState: event.state,
        narrativeTheme: theme,
        detectionConfidence: event.confidence,
        detectedKeywords: event.keywords,
        emotionalTone: event.emotionalTone || 'neutral',
      },
    });

    return arc;
  },

  /**
   * Agrega un evento a un arco existente
   */
  async addEventToArc(
    arcId: string,
    event: DetectedArcEvent,
    agentId: string,
    userId: string
  ) {
    const theme = NarrativeArcDetector.extractTheme(event.message);

    // Actualizar arco
    const arc = await prisma.narrativeArc.findUnique({
      where: { id: arcId },
      include: { events: true },
    });

    if (!arc) return;

    // Calcular nueva confianza promedio
    const newConfidence =
      (arc.confidence * arc.totalEvents + event.confidence) /
      (arc.totalEvents + 1);

    // Determinar si se completa el arco
    const shouldComplete = event.state === 'conclusion';
    const outcome = shouldComplete
      ? event.emotionalTone === 'positive'
        ? 'positive'
        : event.emotionalTone === 'negative'
        ? 'negative'
        : 'neutral'
      : arc.outcome;

    await prisma.narrativeArc.update({
      where: { id: arcId },
      data: {
        currentState: event.state,
        lastEventAt: event.timestamp,
        totalEvents: arc.totalEvents + 1,
        confidence: newConfidence,
        status: shouldComplete ? 'completed' : arc.status,
        completedAt: shouldComplete ? event.timestamp : arc.completedAt,
        outcome,
      },
    });

    // Crear evento asociado
    await prisma.importantEvent.create({
      data: {
        agentId,
        userId,
        eventDate: event.timestamp,
        type: this.mapCategoryToEventType(event.category),
        description: event.message,
        priority: 'medium',
        narrativeArcId: arcId,
        narrativeState: event.state,
        narrativeTheme: theme,
        detectionConfidence: event.confidence,
        detectedKeywords: event.keywords,
        emotionalTone: event.emotionalTone || 'neutral',
      },
    });
  },

  /**
   * Obtiene todos los arcos narrativos de un agente
   */
  async getArcs(
    agentId: string,
    userId: string,
    filters: {
      category?: NarrativeCategory;
      status?: 'active' | 'completed' | 'abandoned';
      limit?: number;
    } = {}
  ): Promise<NarrativeArc[]> {
    const where: any = {
      agentId,
      userId,
    };

    if (filters.category) where.category = filters.category;
    if (filters.status) where.status = filters.status;

    const arcs = await prisma.narrativeArc.findMany({
      where,
      include: {
        events: {
          orderBy: { eventDate: 'asc' },
        },
      },
      orderBy: {
        lastEventAt: 'desc',
      },
      take: filters.limit || 50,
    });

    return arcs.map((arc) => ({
      ...arc,
      title: arc.title || undefined,
      description: arc.description || undefined,
      currentState: arc.currentState || undefined,
      completedAt: arc.completedAt || undefined,
      outcome: arc.outcome || undefined,
      events: arc.events.map((e) => ({
        id: e.id,
        eventDate: e.eventDate,
        description: e.description,
        narrativeState: e.narrativeState || undefined,
        detectionConfidence: e.detectionConfidence || undefined,
        detectedKeywords: e.detectedKeywords || undefined,
      })),
    }));
  },

  /**
   * Obtiene un arco específico con todos sus eventos
   */
  async getArc(arcId: string, userId: string): Promise<NarrativeArc | null> {
    const arc = await prisma.narrativeArc.findFirst({
      where: {
        id: arcId,
        userId,
      },
      include: {
        events: {
          orderBy: { eventDate: 'asc' },
        },
      },
    });

    if (!arc) return null;

    return {
      ...arc,
      title: arc.title || undefined,
      description: arc.description || undefined,
      currentState: arc.currentState || undefined,
      completedAt: arc.completedAt || undefined,
      outcome: arc.outcome || undefined,
      events: arc.events.map((e) => ({
        id: e.id,
        eventDate: e.eventDate,
        description: e.description,
        narrativeState: e.narrativeState || undefined,
        detectionConfidence: e.detectionConfidence || undefined,
        detectedKeywords: e.detectedKeywords || undefined,
      })),
    };
  },

  /**
   * Obtiene timeline completo (todos los arcos ordenados cronológicamente)
   */
  async getTimeline(
    agentId: string,
    userId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      categories?: NarrativeCategory[];
    } = {}
  ) {
    const where: any = {
      agentId,
      userId,
    };

    if (filters.startDate) {
      where.startedAt = { gte: filters.startDate };
    }

    if (filters.endDate) {
      where.lastEventAt = { lte: filters.endDate };
    }

    if (filters.categories && filters.categories.length > 0) {
      where.category = { in: filters.categories };
    }

    const arcs = await prisma.narrativeArc.findMany({
      where,
      include: {
        events: {
          orderBy: { eventDate: 'asc' },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    return arcs.map((arc) => ({
      ...arc,
      title: arc.title || undefined,
      description: arc.description || undefined,
      currentState: arc.currentState || undefined,
      completedAt: arc.completedAt || undefined,
      outcome: arc.outcome || undefined,
      events: arc.events.map((e) => ({
        id: e.id,
        eventDate: e.eventDate,
        description: e.description,
        narrativeState: e.narrativeState || undefined,
        detectionConfidence: e.detectionConfidence || undefined,
        detectedKeywords: e.detectedKeywords || undefined,
      })),
    }));
  },

  /**
   * Marcar arco como abandonado
   */
  async markAsAbandoned(arcId: string, userId: string) {
    const arc = await prisma.narrativeArc.findFirst({
      where: { id: arcId, userId },
    });

    if (!arc) {
      throw new Error('Arc not found or unauthorized');
    }

    return await prisma.narrativeArc.update({
      where: { id: arcId },
      data: {
        status: 'abandoned',
      },
    });
  },

  /**
   * Actualizar título y descripción de un arco
   */
  async updateArc(
    arcId: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
    }
  ) {
    const arc = await prisma.narrativeArc.findFirst({
      where: { id: arcId, userId },
    });

    if (!arc) {
      throw new Error('Arc not found or unauthorized');
    }

    return await prisma.narrativeArc.update({
      where: { id: arcId },
      data,
    });
  },

  /**
   * Obtener estadísticas de arcos
   */
  async getArcStats(agentId: string, userId: string) {
    const [total, active, completed, abandoned, byCategory] = await Promise.all(
      [
        // Total de arcos
        prisma.narrativeArc.count({
          where: { agentId, userId },
        }),
        // Arcos activos
        prisma.narrativeArc.count({
          where: { agentId, userId, status: 'active' },
        }),
        // Arcos completados
        prisma.narrativeArc.count({
          where: { agentId, userId, status: 'completed' },
        }),
        // Arcos abandonados
        prisma.narrativeArc.count({
          where: { agentId, userId, status: 'abandoned' },
        }),
        // Por categoría
        prisma.narrativeArc.groupBy({
          by: ['category'],
          where: { agentId, userId },
          _count: true,
        }),
      ]
    );

    return {
      total,
      active,
      completed,
      abandoned,
      byCategory,
    };
  },

  /**
   * Mapea categoría narrativa a tipo de evento
   */
  mapCategoryToEventType(category: NarrativeCategory): string {
    const mapping: Record<NarrativeCategory, string> = {
      work_career: 'special',
      relationships_love: 'special',
      education_learning: 'exam',
      health_fitness: 'medical',
      personal_projects: 'special',
      family: 'special',
      other: 'other',
    };
    return mapping[category];
  },

  /**
   * Genera título automático para un arco
   */
  generateArcTitle(event: DetectedArcEvent): string {
    const categoryLabels: Record<NarrativeCategory, string> = {
      work_career: 'Búsqueda laboral',
      relationships_love: 'Historia de amor',
      education_learning: 'Camino educativo',
      health_fitness: 'Viaje de salud',
      personal_projects: 'Proyecto personal',
      family: 'Historia familiar',
      other: 'Historia personal',
    };

    const stateLabels: Record<NarrativeState, string> = {
      seeking: 'en búsqueda',
      progress: 'en progreso',
      conclusion: 'completada',
      ongoing: 'en curso',
    };

    const category = categoryLabels[event.category] || 'Historia';
    const state = stateLabels[event.state] || '';

    return `${category} ${state}`.trim();
  },
};
