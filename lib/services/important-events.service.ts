/**
 * Important Events Service - Sistema de eventos importantes para companions emocionales
 * Gestiona eventos que la IA debe recordar (cumpleaños, citas médicas, exámenes, etc.)
 */

import { prisma } from '@/lib/prisma';

export interface CreateEventData {
  eventDate: Date;
  type: 'birthday' | 'medical' | 'exam' | 'special' | 'anniversary' | 'other';
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  relationship?: 'user' | 'family' | 'pet' | 'friend';
  emotionalTone?: 'joyful' | 'anxious' | 'neutral' | 'sad';
  isRecurring?: boolean;
  metadata?: any;
}

export interface UpdateEventData {
  eventDate?: Date;
  type?: 'birthday' | 'medical' | 'exam' | 'special' | 'anniversary' | 'other';
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  relationship?: 'user' | 'family' | 'pet' | 'friend';
  emotionalTone?: 'joyful' | 'anxious' | 'neutral' | 'sad';
  eventHappened?: boolean;
  userFeedback?: string;
  isRecurring?: boolean;
  metadata?: any;
}

export const ImportantEventsService = {
  /**
   * Crear evento importante
   */
  async createEvent(agentId: string, userId: string, data: CreateEventData) {
    // Verificar que el agente pertenece al usuario
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, userId },
    });

    if (!agent) {
      throw new Error('Agent not found or unauthorized');
    }

    // Calcular campos recurrentes si aplica
    let recurringDay = null;
    let recurringMonth = null;
    if (data.isRecurring) {
      const eventDate = new Date(data.eventDate);
      recurringDay = eventDate.getDate();
      recurringMonth = eventDate.getMonth() + 1; // 1-12
    }

    const event = await prisma.importantEvent.create({
      data: {
        agentId,
        userId,
        eventDate: data.eventDate,
        type: data.type,
        description: data.description,
        priority: data.priority || 'medium',
        relationship: data.relationship,
        emotionalTone: data.emotionalTone,
        isRecurring: data.isRecurring || false,
        recurringDay,
        recurringMonth,
        metadata: data.metadata || {},
      },
    });

    return event;
  },

  /**
   * Obtener eventos próximos (próximos N días)
   */
  async getUpcomingEvents(
    agentId: string,
    userId: string,
    daysAhead = 30
  ) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const events = await prisma.importantEvent.findMany({
      where: {
        agentId,
        userId,
        eventDate: {
          gte: now,
          lte: futureDate,
        },
        eventHappened: false,
      },
      orderBy: {
        eventDate: 'asc',
      },
    });

    return events;
  },

  /**
   * Obtener todos los eventos del agente
   */
  async getEvents(
    agentId: string,
    userId: string,
    filters: {
      type?: string;
      priority?: string;
      eventHappened?: boolean;
      isRecurring?: boolean;
      includeAgentEvents?: boolean; // Incluir eventos del pasado del agente
    } = {}
  ) {
    const where: any = {
      agentId,
      userId: filters.includeAgentEvents
        ? { in: [userId, agentId] } // Ambos grupos
        : userId, // Solo usuario
    };

    if (filters.type) where.type = filters.type;
    if (filters.priority) where.priority = filters.priority;
    if (filters.eventHappened !== undefined) where.eventHappened = filters.eventHappened;
    if (filters.isRecurring !== undefined) where.isRecurring = filters.isRecurring;

    const events = await prisma.importantEvent.findMany({
      where,
      orderBy: {
        eventDate: 'asc',
      },
    });

    // Agregar metadata para identificar el source
    return events.map((event) => ({
      ...event,
      source: event.userId === agentId ? 'agent' : 'user',
    }));
  },

  /**
   * Obtener evento por ID
   */
  async getEvent(eventId: string, userId: string) {
    const event = await prisma.importantEvent.findFirst({
      where: {
        id: eventId,
        userId,
      },
    });

    return event;
  },

  /**
   * Actualizar evento
   */
  async updateEvent(
    eventId: string,
    userId: string,
    data: UpdateEventData
  ) {
    // Verificar ownership
    const existing = await prisma.importantEvent.findFirst({
      where: { id: eventId, userId },
    });

    if (!existing) {
      throw new Error('Event not found or unauthorized');
    }

    // Si se actualiza la fecha y es recurrente, recalcular día/mes
    const updateData: any = { ...data };
    if (data.eventDate && (data.isRecurring || existing.isRecurring)) {
      const eventDate = new Date(data.eventDate);
      updateData.recurringDay = eventDate.getDate();
      updateData.recurringMonth = eventDate.getMonth() + 1;
    }

    const updated = await prisma.importantEvent.update({
      where: { id: eventId },
      data: updateData,
    });

    return updated;
  },

  /**
   * Marcar evento como mencionado por la IA
   */
  async markAsMentioned(eventId: string, userId: string) {
    const event = await prisma.importantEvent.findFirst({
      where: { id: eventId, userId },
    });

    if (!event) {
      throw new Error('Event not found or unauthorized');
    }

    const updated = await prisma.importantEvent.update({
      where: { id: eventId },
      data: {
        mentioned: true,
        reminderSentAt: new Date(),
      },
    });

    return updated;
  },

  /**
   * Marcar evento como completado (ya ocurrió)
   */
  async markAsCompleted(
    eventId: string,
    userId: string,
    feedback?: string
  ) {
    const event = await prisma.importantEvent.findFirst({
      where: { id: eventId, userId },
    });

    if (!event) {
      throw new Error('Event not found or unauthorized');
    }

    const updated = await prisma.importantEvent.update({
      where: { id: eventId },
      data: {
        eventHappened: true,
        userFeedback: feedback,
      },
    });

    // Si es recurrente, crear el evento del próximo año
    if (event.isRecurring) {
      const nextYear = new Date(event.eventDate);
      nextYear.setFullYear(nextYear.getFullYear() + 1);

      await this.createEvent(event.agentId, userId, {
        eventDate: nextYear,
        type: event.type as "birthday" | "medical" | "exam" | "special" | "anniversary" | "other",
        description: event.description,
        priority: event.priority as "low" | "medium" | "high" | "critical",
        relationship: event.relationship as "user" | "family" | "pet" | "friend" | undefined,
        emotionalTone: event.emotionalTone as "joyful" | "anxious" | "neutral" | "sad" | undefined,
        isRecurring: true,
        metadata: event.metadata as any,
      });
    }

    return updated;
  },

  /**
   * Eliminar evento
   */
  async deleteEvent(eventId: string, userId: string) {
    const event = await prisma.importantEvent.findFirst({
      where: { id: eventId, userId },
    });

    if (!event) {
      throw new Error('Event not found or unauthorized');
    }

    await prisma.importantEvent.delete({
      where: { id: eventId },
    });

    return { success: true };
  },

  /**
   * Verificar eventos recurrentes que necesitan renovación
   * (para ejecutar en cron job o manualmente)
   */
  async checkRecurringEvents() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    // Buscar eventos recurrentes que ya pasaron este año
    const pastRecurringEvents = await prisma.importantEvent.findMany({
      where: {
        isRecurring: true,
        eventHappened: true,
        eventDate: {
          lt: now,
        },
      },
    });

    const renewals = [];

    for (const event of pastRecurringEvents) {
      // Verificar si ya existe un evento para el próximo año
      const nextYear = new Date(event.eventDate);
      nextYear.setFullYear(nextYear.getFullYear() + 1);

      const existing = await prisma.importantEvent.findFirst({
        where: {
          agentId: event.agentId,
          userId: event.userId,
          type: event.type,
          description: event.description,
          eventDate: nextYear,
        },
      });

      if (!existing) {
        // Crear evento para el próximo año
        const renewed = await this.createEvent(event.agentId, event.userId, {
          eventDate: nextYear,
          type: event.type as "birthday" | "medical" | "exam" | "special" | "anniversary" | "other",
          description: event.description,
          priority: event.priority as "low" | "medium" | "high" | "critical",
          relationship: event.relationship as "user" | "family" | "pet" | "friend" | undefined,
          emotionalTone: event.emotionalTone as "joyful" | "anxious" | "neutral" | "sad" | undefined,
          isRecurring: true,
          metadata: event.metadata as any,
        });
        renewals.push(renewed);
      }
    }

    return renewals;
  },

  /**
   * Obtener estadísticas de eventos
   */
  async getEventStats(agentId: string, userId: string) {
    const [total, upcoming, past, byType, byPriority] = await Promise.all([
      // Total de eventos
      prisma.importantEvent.count({
        where: { agentId, userId },
      }),
      // Eventos próximos (próximos 30 días)
      prisma.importantEvent.count({
        where: {
          agentId,
          userId,
          eventDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          eventHappened: false,
        },
      }),
      // Eventos pasados
      prisma.importantEvent.count({
        where: {
          agentId,
          userId,
          eventHappened: true,
        },
      }),
      // Por tipo
      prisma.importantEvent.groupBy({
        by: ['type'],
        where: { agentId, userId },
        _count: true,
      }),
      // Por prioridad
      prisma.importantEvent.groupBy({
        by: ['priority'],
        where: { agentId, userId },
        _count: true,
      }),
    ]);

    return {
      total,
      upcoming,
      past,
      byType,
      byPriority,
    };
  },
};
