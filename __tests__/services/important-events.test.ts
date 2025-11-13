/**
 * Important Events Service Tests
 * Test suite para el sistema de eventos importantes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImportantEventsService } from '@/lib/services/important-events.service';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    agent: {
      findFirst: vi.fn(),
    },
    importantEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

// Import prisma after mocking
import { prisma } from '@/lib/prisma';

describe('ImportantEventsService', () => {
  const mockAgentId = 'agent-123';
  const mockUserId = 'user-123';
  const mockEventId = 'event-123';

  const mockAgent = {
    id: mockAgentId,
    userId: mockUserId,
    name: 'Test Agent',
  };

  const mockEvent = {
    id: mockEventId,
    agentId: mockAgentId,
    userId: mockUserId,
    eventDate: new Date('2025-12-25'),
    type: 'birthday' as const,
    description: 'Cumpleaños de Ana',
    priority: 'high' as const,
    relationship: 'family',
    emotionalTone: 'joyful',
    mentioned: false,
    eventHappened: false,
    isRecurring: true,
    recurringDay: 25,
    recurringMonth: 12,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    reminderSentAt: null,
    userFeedback: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createEvent', () => {
    it('debería crear un evento exitosamente', async () => {
      (prisma.agent.findFirst as any).mockResolvedValue(mockAgent);
      (prisma.importantEvent.create as any).mockResolvedValue(mockEvent);

      const result = await ImportantEventsService.createEvent(
        mockAgentId,
        mockUserId,
        {
          eventDate: new Date('2025-12-25'),
          type: 'birthday',
          description: 'Cumpleaños de Ana',
          priority: 'high',
          relationship: 'family',
          emotionalTone: 'joyful',
          isRecurring: true,
        }
      );

      expect(result).toEqual(mockEvent);
      expect(prisma.agent.findFirst).toHaveBeenCalledWith({
        where: { id: mockAgentId, userId: mockUserId },
      });
      expect(prisma.importantEvent.create).toHaveBeenCalled();
    });

    it('debería fallar si el agente no existe', async () => {
      (prisma.agent.findFirst as any).mockResolvedValue(null);

      await expect(
        ImportantEventsService.createEvent(mockAgentId, mockUserId, {
          eventDate: new Date('2025-12-25'),
          type: 'birthday',
          description: 'Test',
        })
      ).rejects.toThrow('Agent not found or unauthorized');
    });

    it('debería calcular recurringDay y recurringMonth para eventos recurrentes', async () => {
      (prisma.agent.findFirst as any).mockResolvedValue(mockAgent);
      (prisma.importantEvent.create as any).mockResolvedValue(mockEvent);

      const eventDate = new Date('2025-12-25T12:00:00Z'); // Use noon UTC to avoid timezone issues
      await ImportantEventsService.createEvent(mockAgentId, mockUserId, {
        eventDate,
        type: 'birthday',
        description: 'Cumpleaños',
        isRecurring: true,
      });

      const createCall = (prisma.importantEvent.create as any).mock
        .calls[0][0];
      expect(createCall.data.recurringDay).toBe(eventDate.getDate());
      expect(createCall.data.recurringMonth).toBe(eventDate.getMonth() + 1);
    });
  });

  describe('getUpcomingEvents', () => {
    it('debería retornar eventos próximos', async () => {
      const upcomingEvents = [mockEvent];
      (prisma.importantEvent.findMany as any).mockResolvedValue(
        upcomingEvents
      );

      const result = await ImportantEventsService.getUpcomingEvents(
        mockAgentId,
        mockUserId,
        30
      );

      expect(result).toEqual(upcomingEvents);
      expect(prisma.importantEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            agentId: mockAgentId,
            userId: mockUserId,
            eventHappened: false,
          }),
        })
      );
    });

    it('debería filtrar por rango de fechas correcto', async () => {
      (prisma.importantEvent.findMany as any).mockResolvedValue([]);

      await ImportantEventsService.getUpcomingEvents(
        mockAgentId,
        mockUserId,
        7
      );

      const findManyCall = (prisma.importantEvent.findMany as any).mock
        .calls[0][0];
      expect(findManyCall.where.eventDate.gte).toBeInstanceOf(Date);
      expect(findManyCall.where.eventDate.lte).toBeInstanceOf(Date);
    });
  });

  describe('updateEvent', () => {
    it('debería actualizar un evento exitosamente', async () => {
      (prisma.importantEvent.findFirst as any).mockResolvedValue(
        mockEvent
      );
      const updatedEvent = { ...mockEvent, description: 'Updated' };
      (prisma.importantEvent.update as any).mockResolvedValue(
        updatedEvent
      );

      const result = await ImportantEventsService.updateEvent(
        mockEventId,
        mockUserId,
        {
          description: 'Updated',
        }
      );

      expect(result.description).toBe('Updated');
      expect(prisma.importantEvent.update).toHaveBeenCalledWith({
        where: { id: mockEventId },
        data: expect.objectContaining({ description: 'Updated' }),
      });
    });

    it('debería fallar si el evento no existe', async () => {
      (prisma.importantEvent.findFirst as any).mockResolvedValue(null);

      await expect(
        ImportantEventsService.updateEvent(mockEventId, mockUserId, {
          description: 'Test',
        })
      ).rejects.toThrow('Event not found or unauthorized');
    });
  });

  describe('markAsMentioned', () => {
    it('debería marcar evento como mencionado', async () => {
      (prisma.importantEvent.findFirst as any).mockResolvedValue(
        mockEvent
      );
      const mentionedEvent = {
        ...mockEvent,
        mentioned: true,
        reminderSentAt: new Date(),
      };
      (prisma.importantEvent.update as any).mockResolvedValue(
        mentionedEvent
      );

      const result = await ImportantEventsService.markAsMentioned(
        mockEventId,
        mockUserId
      );

      expect(result.mentioned).toBe(true);
      expect(result.reminderSentAt).toBeInstanceOf(Date);
    });
  });

  describe('markAsCompleted', () => {
    it('debería marcar evento como completado sin crear recurrencia si no es recurrente', async () => {
      const nonRecurringEvent = { ...mockEvent, isRecurring: false };
      (prisma.importantEvent.findFirst as any).mockResolvedValue(
        nonRecurringEvent
      );
      (prisma.importantEvent.update as any).mockResolvedValue({
        ...nonRecurringEvent,
        eventHappened: true,
        userFeedback: 'Fue genial',
      });

      const result = await ImportantEventsService.markAsCompleted(
        mockEventId,
        mockUserId,
        'Fue genial'
      );

      expect(result.eventHappened).toBe(true);
      expect(result.userFeedback).toBe('Fue genial');
      // No debería crear evento recurrente
      expect(prisma.importantEvent.create).not.toHaveBeenCalled();
    });

    it('debería crear evento del próximo año si es recurrente', async () => {
      const recurringEvent = { ...mockEvent, isRecurring: true };
      (prisma.importantEvent.findFirst as any).mockResolvedValue(
        recurringEvent
      );
      (prisma.importantEvent.update as any).mockResolvedValue({
        ...recurringEvent,
        eventHappened: true,
      });
      (prisma.agent.findFirst as any).mockResolvedValue(mockAgent);
      (prisma.importantEvent.create as any).mockResolvedValue({
        ...recurringEvent,
        id: 'new-event-id',
      });

      await ImportantEventsService.markAsCompleted(
        mockEventId,
        mockUserId,
        'Fue bien'
      );

      // Debería crear evento para el próximo año
      expect(prisma.importantEvent.create).toHaveBeenCalled();
      const createCall = (prisma.importantEvent.create as any).mock
        .calls[0][0];
      const newEventDate = createCall.data.eventDate;
      expect(newEventDate.getFullYear()).toBe(
        mockEvent.eventDate.getFullYear() + 1
      );
    });
  });

  describe('deleteEvent', () => {
    it('debería eliminar un evento exitosamente', async () => {
      (prisma.importantEvent.findFirst as any).mockResolvedValue(
        mockEvent
      );
      (prisma.importantEvent.delete as any).mockResolvedValue(mockEvent);

      const result = await ImportantEventsService.deleteEvent(
        mockEventId,
        mockUserId
      );

      expect(result.success).toBe(true);
      expect(prisma.importantEvent.delete).toHaveBeenCalledWith({
        where: { id: mockEventId },
      });
    });

    it('debería fallar si el evento no existe', async () => {
      (prisma.importantEvent.findFirst as any).mockResolvedValue(null);

      await expect(
        ImportantEventsService.deleteEvent(mockEventId, mockUserId)
      ).rejects.toThrow('Event not found or unauthorized');
    });
  });

  describe('getEventStats', () => {
    it('debería retornar estadísticas correctas', async () => {
      (prisma.importantEvent.count as any)
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3) // upcoming
        .mockResolvedValueOnce(5); // past

      (prisma.importantEvent.groupBy as any)
        .mockResolvedValueOnce([
          { type: 'birthday', _count: 5 },
          { type: 'medical', _count: 3 },
        ]) // byType
        .mockResolvedValueOnce([
          { priority: 'high', _count: 4 },
          { priority: 'medium', _count: 6 },
        ]); // byPriority

      const result = await ImportantEventsService.getEventStats(
        mockAgentId,
        mockUserId
      );

      expect(result.total).toBe(10);
      expect(result.upcoming).toBe(3);
      expect(result.past).toBe(5);
      expect(result.byType).toHaveLength(2);
      expect(result.byPriority).toHaveLength(2);
    });
  });
});
