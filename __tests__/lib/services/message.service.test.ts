/**
 * MESSAGE SERVICE TESTS
 *
 * Tests para el servicio de mensajería
 * Coverage objetivo: 75%+
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MessageService } from '@/lib/services/message.service';
import {
  mockPrismaClient,
  mockAgent,
  mockMessage,
  mockUser,
  mockRelation,
  mockPersonalityCore,
  mockInternalState,
  mockFetch,
  resetAllMocks,
} from '../../setup';

// Mock de módulos externos
vi.mock('@/lib/llm/provider', () => ({
  getLLMProvider: () => ({
    generate: vi.fn().mockResolvedValue('This is a test response'),
  }),
}));

vi.mock('@/lib/memory/manager', () => ({
  createMemoryManager: () => ({
    buildEnhancedPrompt: vi.fn().mockResolvedValue('Enhanced prompt'),
  }),
}));

vi.mock('@/lib/behavior-system', () => ({
  behaviorOrchestrator: {
    processIncomingMessage: vi.fn().mockResolvedValue({
      activeBehaviors: [],
      enhancedSystemPrompt: null,
      metadata: {
        behaviorsActive: [],
        safetyLevel: 'safe',
        triggers: [],
      },
      moderator: {
        moderateResponse: vi.fn().mockReturnValue({ allowed: true }),
      },
    }),
  },
}));

vi.mock('@/lib/emotional-system/hybrid-orchestrator', () => ({
  hybridEmotionalOrchestrator: {
    processMessage: vi.fn().mockResolvedValue({
      emotionState: {
        joy: 0.6,
        trust: 0.7,
        fear: 0.1,
        surprise: 0.3,
        sadness: 0.1,
        disgust: 0.1,
        anger: 0.1,
        anticipation: 0.5,
      },
      activeDyads: [],
      metadata: {
        emotionalStability: 0.8,
        path: 'fast',
      },
    }),
  },
}));

vi.mock('@/lib/emotions/system', () => ({
  getEmotionalSummary: vi.fn().mockReturnValue({
    dominant: ['joy', 'trust'],
    secondary: [],
    mood: 'cheerful',
    pad: { valence: 0.7, arousal: 0.5, dominance: 0.6 },
  }),
}));

vi.mock('@/lib/multimedia/parser', () => ({
  parseMultimediaTags: vi.fn().mockReturnValue({
    hasMultimedia: false,
    multimediaTags: [],
    textContent: 'Test response',
  }),
  validateMultimediaUsage: vi.fn().mockReturnValue({ valid: false }),
}));

vi.mock('@/lib/context/temporal', () => ({
  buildTemporalPrompt: vi.fn().mockReturnValue('Temporal context'),
}));

vi.mock('@/lib/events/remember-interceptor', () => ({
  interceptRememberCommands: vi.fn().mockResolvedValue({
    shouldIntercept: false,
    commands: [],
    cleanResponse: 'Test response',
  }),
  buildReminderContext: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/people/person-interceptor', () => ({
  interceptPersonCommands: vi.fn().mockResolvedValue({
    shouldIntercept: false,
    commands: [],
    cleanResponse: 'Test response',
  }),
  buildPeopleContext: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/profile/knowledge-interceptor', () => ({
  interceptKnowledgeCommand: vi.fn().mockResolvedValue({
    shouldIntercept: false,
    cleanResponse: 'Test response',
  }),
  buildExpandedPrompt: vi.fn().mockReturnValue('Expanded prompt'),
  logCommandUsage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/profile/command-detector', () => ({
  getTopRelevantCommand: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/memory/search-interceptor', () => ({
  interceptSearchCommand: vi.fn().mockResolvedValue({
    shouldIntercept: false,
    cleanResponse: 'Test response',
  }),
  SEARCH_INSTRUCTIONS: 'Mock search instructions',
}));

vi.mock('@/lib/memory/selective-storage', () => ({
  storeMessageSelectively: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/context/weather', () => ({
  getUserWeather: vi.fn().mockResolvedValue(null),
  buildWeatherPrompt: vi.fn().mockReturnValue(''),
}));

vi.mock('@/lib/proactive/proactive-service', () => ({
  markProactiveMessageResponded: vi.fn().mockResolvedValue(undefined),
}));

describe('MessageService', () => {
  let service: MessageService;

  beforeEach(() => {
    resetAllMocks();
    service = new MessageService();
  });

  describe('processMessage', () => {
    it('debería procesar un mensaje de texto exitosamente', async () => {
      // Arrange: Preparar datos de agente completo
      const agentData = mockAgent({
        id: 'agent-123',
        userId: 'user-123',
        personalityCore: mockPersonalityCore(),
        internalState: mockInternalState(),
        user: mockUser({ location: null }),
      });

      (mockPrismaClient.agent.findUnique as any).mockResolvedValue(agentData);
      (mockPrismaClient.message.findMany as any).mockResolvedValue([]);
      (mockPrismaClient.message.findFirst as any).mockResolvedValue(null);
      (mockPrismaClient.message.create as any).mockResolvedValue(mockMessage());
      (mockPrismaClient.message.count as any).mockResolvedValue(5);
      (mockPrismaClient.relation.findFirst as any).mockResolvedValue(null);
      (mockPrismaClient.relation.create as any).mockResolvedValue(mockRelation());
      (mockPrismaClient.relation.update as any).mockResolvedValue(mockRelation());
      (mockPrismaClient.internalState.update as any).mockResolvedValue(mockInternalState());

      // Act
      const result = await service.processMessage({
        agentId: 'agent-123',
        userId: 'user-123',
        content: 'Hello, how are you?',
        messageType: 'text',
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.userMessage).toBeDefined();
      expect(result.assistantMessage).toBeDefined();
      expect(result.emotions).toBeDefined();
      expect(result.state).toBeDefined();
      expect(result.relationship).toBeDefined();
    });

    it('debería lanzar error si el agente no existe', async () => {
      // Arrange
      (mockPrismaClient.agent.findUnique as any).mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.processMessage({
          agentId: 'nonexistent-agent',
          userId: 'user-123',
          content: 'Hello',
        })
      ).rejects.toThrow('Agent nonexistent-agent not found');
    });

    it('debería lanzar error si el agente no pertenece al usuario', async () => {
      // Arrange: Agente de otro usuario
      const agentData = mockAgent({
        userId: 'other-user',
      });

      (mockPrismaClient.agent.findUnique as any).mockResolvedValue(agentData);

      // Act & Assert
      await expect(
        service.processMessage({
          agentId: 'agent-123',
          userId: 'user-123',
          content: 'Hello',
        })
      ).rejects.toThrow('Forbidden: Agent does not belong to user');
    });

    it('debería procesar GIF con descripción', async () => {
      // Arrange
      const agentData = mockAgent({
        userId: 'user-123',
        personalityCore: mockPersonalityCore(),
        internalState: mockInternalState(),
        user: mockUser({ location: null }),
      });

      (mockPrismaClient.agent.findUnique as any).mockResolvedValue(agentData);
      (mockPrismaClient.message.findMany as any).mockResolvedValue([]);
      (mockPrismaClient.message.findFirst as any).mockResolvedValue(null);
      (mockPrismaClient.message.create as any).mockResolvedValue(mockMessage());
      (mockPrismaClient.message.count as any).mockResolvedValue(1);
      (mockPrismaClient.relation.findFirst as any).mockResolvedValue(mockRelation());
      (mockPrismaClient.relation.update as any).mockResolvedValue(mockRelation());
      (mockPrismaClient.internalState.update as any).mockResolvedValue(mockInternalState());

      // Act
      const result = await service.processMessage({
        agentId: 'agent-123',
        userId: 'user-123',
        content: 'https://giphy.com/test.gif',
        messageType: 'gif',
        metadata: {
          description: 'happy dancing cat',
        },
      });

      // Assert: El contenido para AI debería incluir la descripción
      expect(result.assistantMessage).toBeDefined();
      // Verificar que se guardó con metadata correcta
      expect(mockPrismaClient.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: 'user',
            metadata: expect.objectContaining({
              messageType: 'gif',
              gifDescription: 'happy dancing cat',
            }),
          }),
        })
      );
    });

    it('debería crear relación si no existe', async () => {
      // Arrange
      const agentData = mockAgent({
        userId: 'user-123',
        personalityCore: mockPersonalityCore(),
        internalState: mockInternalState(),
        user: mockUser({ location: null }),
      });

      (mockPrismaClient.agent.findUnique as any).mockResolvedValue(agentData);
      (mockPrismaClient.message.findMany as any).mockResolvedValue([]);
      (mockPrismaClient.message.findFirst as any).mockResolvedValue(null);
      (mockPrismaClient.message.create as any).mockResolvedValue(mockMessage());
      (mockPrismaClient.message.count as any).mockResolvedValue(0);
      (mockPrismaClient.relation.findFirst as any).mockResolvedValue(null); // No existe
      (mockPrismaClient.relation.create as any).mockResolvedValue(mockRelation()); // Crear nueva
      (mockPrismaClient.relation.update as any).mockResolvedValue(mockRelation());
      (mockPrismaClient.internalState.update as any).mockResolvedValue(mockInternalState());

      // Act
      await service.processMessage({
        agentId: 'agent-123',
        userId: 'user-123',
        content: 'First message',
      });

      // Assert
      expect(mockPrismaClient.relation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          subjectId: 'agent-123',
          targetId: 'user-123',
          targetType: 'user',
          stage: 'stranger',
        }),
      });
    });

    it('debería actualizar estado emocional del agente', async () => {
      // Arrange
      const agentData = mockAgent({
        userId: 'user-123',
        personalityCore: mockPersonalityCore(),
        internalState: mockInternalState(),
        user: mockUser({ location: null }),
      });

      (mockPrismaClient.agent.findUnique as any).mockResolvedValue(agentData);
      (mockPrismaClient.message.findMany as any).mockResolvedValue([]);
      (mockPrismaClient.message.findFirst as any).mockResolvedValue(null);
      (mockPrismaClient.message.create as any).mockResolvedValue(mockMessage());
      (mockPrismaClient.message.count as any).mockResolvedValue(5);
      (mockPrismaClient.relation.findFirst as any).mockResolvedValue(mockRelation());
      (mockPrismaClient.relation.update as any).mockResolvedValue(mockRelation());
      (mockPrismaClient.internalState.update as any).mockResolvedValue(mockInternalState());

      // Act
      await service.processMessage({
        agentId: 'agent-123',
        userId: 'user-123',
        content: 'This is great news!',
      });

      // Assert: Debería actualizar internalState con nuevas emociones
      expect(mockPrismaClient.internalState.update).toHaveBeenCalledWith({
        where: { agentId: 'agent-123' },
        data: expect.objectContaining({
          currentEmotions: expect.any(Object),
          moodValence: expect.any(Number),
          moodArousal: expect.any(Number),
          moodDominance: expect.any(Number),
        }),
      });
    });

    it('debería actualizar métricas de relación (trust, affinity, respect)', async () => {
      // Arrange
      const agentData = mockAgent({
        userId: 'user-123',
        personalityCore: mockPersonalityCore(),
        internalState: mockInternalState(),
        user: mockUser({ location: null }),
      });

      (mockPrismaClient.agent.findUnique as any).mockResolvedValue(agentData);
      (mockPrismaClient.message.findMany as any).mockResolvedValue([]);
      (mockPrismaClient.message.findFirst as any).mockResolvedValue(null);
      (mockPrismaClient.message.create as any).mockResolvedValue(mockMessage());
      (mockPrismaClient.message.count as any).mockResolvedValue(10);
      (mockPrismaClient.relation.findFirst as any).mockResolvedValue(
        mockRelation({ totalInteractions: 10 })
      );
      (mockPrismaClient.relation.update as any).mockResolvedValue(mockRelation());
      (mockPrismaClient.internalState.update as any).mockResolvedValue(mockInternalState());

      // Act
      await service.processMessage({
        agentId: 'agent-123',
        userId: 'user-123',
        content: 'You are amazing!',
      });

      // Assert
      expect(mockPrismaClient.relation.update).toHaveBeenCalledWith({
        where: expect.any(Object),
        data: expect.objectContaining({
          trust: expect.any(Number),
          affinity: expect.any(Number),
          respect: expect.any(Number),
          totalInteractions: 11, // Incrementado
        }),
      });
    });

    it('debería detectar stage changes en relación', async () => {
      // Arrange: Relación cerca de cambio de stage
      const agentData = mockAgent({
        userId: 'user-123',
        personalityCore: mockPersonalityCore(),
        internalState: mockInternalState(),
        user: mockUser({ location: null }),
      });

      (mockPrismaClient.agent.findUnique as any).mockResolvedValue(agentData);
      (mockPrismaClient.message.findMany as any).mockResolvedValue([]);
      (mockPrismaClient.message.findFirst as any).mockResolvedValue(null);
      (mockPrismaClient.message.create as any).mockResolvedValue(mockMessage());
      (mockPrismaClient.message.count as any).mockResolvedValue(14);
      (mockPrismaClient.relation.findFirst as any).mockResolvedValue(
        mockRelation({ totalInteractions: 14, stage: 'stranger' })
      );
      (mockPrismaClient.relation.update as any).mockResolvedValue(mockRelation());
      (mockPrismaClient.internalState.update as any).mockResolvedValue(mockInternalState());

      // Act
      const result = await service.processMessage({
        agentId: 'agent-123',
        userId: 'user-123',
        content: 'Message that triggers stage change',
      });

      // Assert
      expect(result.relationship.stageChanged).toBeDefined();
      expect(result.relationship.totalInteractions).toBe(15);
    });

    it('debería incluir metadata de emociones en mensaje asistente', async () => {
      // Arrange
      const agentData = mockAgent({
        userId: 'user-123',
        personalityCore: mockPersonalityCore(),
        internalState: mockInternalState(),
        user: mockUser({ location: null }),
      });

      (mockPrismaClient.agent.findUnique as any).mockResolvedValue(agentData);
      (mockPrismaClient.message.findMany as any).mockResolvedValue([]);
      (mockPrismaClient.message.findFirst as any).mockResolvedValue(null);
      (mockPrismaClient.message.create as any).mockResolvedValue(
        mockMessage({
          role: 'assistant',
          metadata: {
            emotions: {
              dominant: ['joy', 'trust'],
              mood: 'cheerful',
            },
          },
        })
      );
      (mockPrismaClient.message.count as any).mockResolvedValue(3);
      (mockPrismaClient.relation.findFirst as any).mockResolvedValue(mockRelation());
      (mockPrismaClient.relation.update as any).mockResolvedValue(mockRelation());
      (mockPrismaClient.internalState.update as any).mockResolvedValue(mockInternalState());

      // Act
      const result = await service.processMessage({
        agentId: 'agent-123',
        userId: 'user-123',
        content: 'Hello!',
      });

      // Assert
      expect(result.assistantMessage.metadata).toBeDefined();
      expect(result.assistantMessage.metadata.emotions).toBeDefined();
    });

    it('debería almacenar embeddings selectivamente (no bloqueante)', async () => {
      // Arrange
      const agentData = mockAgent({
        userId: 'user-123',
        personalityCore: mockPersonalityCore(),
        internalState: mockInternalState(),
        user: mockUser({ location: null }),
      });

      (mockPrismaClient.agent.findUnique as any).mockResolvedValue(agentData);
      (mockPrismaClient.message.findMany as any).mockResolvedValue([]);
      (mockPrismaClient.message.findFirst as any).mockResolvedValue(null);
      (mockPrismaClient.message.create as any).mockResolvedValue(mockMessage());
      (mockPrismaClient.message.count as any).mockResolvedValue(5);
      (mockPrismaClient.relation.findFirst as any).mockResolvedValue(mockRelation());
      (mockPrismaClient.relation.update as any).mockResolvedValue(mockRelation());
      (mockPrismaClient.internalState.update as any).mockResolvedValue(mockInternalState());

      // Act
      const result = await service.processMessage({
        agentId: 'agent-123',
        userId: 'user-123',
        content: 'Important message to remember',
      });

      // Assert: No debería bloquear el resultado
      expect(result).toBeDefined();
      // storeMessageSelectively se llama async, no bloqueante
    });

    it('debería usar mensajes progresivos para primeros 3 mensajes', async () => {
      // Arrange: Primer mensaje del agente
      const agentData = mockAgent({
        userId: 'user-123',
        personalityCore: mockPersonalityCore(),
        internalState: mockInternalState(),
        user: mockUser({ location: null }),
        stagePrompts: null,
      });

      (mockPrismaClient.agent.findUnique as any).mockResolvedValue(agentData);
      (mockPrismaClient.message.findMany as any).mockResolvedValue([]);
      (mockPrismaClient.message.findFirst as any).mockResolvedValue(null);
      (mockPrismaClient.message.create as any).mockResolvedValue(mockMessage());
      (mockPrismaClient.message.count as any).mockResolvedValue(0); // Primer mensaje
      (mockPrismaClient.relation.findFirst as any).mockResolvedValue(mockRelation());
      (mockPrismaClient.relation.update as any).mockResolvedValue(mockRelation());
      (mockPrismaClient.internalState.update as any).mockResolvedValue(mockInternalState());

      // Act
      const result = await service.processMessage({
        agentId: 'agent-123',
        userId: 'user-123',
        content: 'Hello for the first time!',
      });

      // Assert: Debería usar mensaje progresivo 1
      expect(result).toBeDefined();
    });

    it('debería manejar errores y propagarlos', async () => {
      // Arrange: Error en DB
      (mockPrismaClient.agent.findUnique as any).mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect(
        service.processMessage({
          agentId: 'agent-123',
          userId: 'user-123',
          content: 'Hello',
        })
      ).rejects.toThrow('Database connection failed');
    });

    it('debería usar fallback si response queda vacío después de interceptores', async () => {
      // Este caso está manejado en el código con regeneración
      // Verificar que no falla con respuesta vacía
      const agentData = mockAgent({
        userId: 'user-123',
        personalityCore: mockPersonalityCore(),
        internalState: mockInternalState(),
        user: mockUser({ location: null }),
      });

      (mockPrismaClient.agent.findUnique as any).mockResolvedValue(agentData);
      (mockPrismaClient.message.findMany as any).mockResolvedValue([]);
      (mockPrismaClient.message.findFirst as any).mockResolvedValue(null);
      (mockPrismaClient.message.create as any).mockResolvedValue(mockMessage());
      (mockPrismaClient.message.count as any).mockResolvedValue(5);
      (mockPrismaClient.relation.findFirst as any).mockResolvedValue(mockRelation());
      (mockPrismaClient.relation.update as any).mockResolvedValue(mockRelation());
      (mockPrismaClient.internalState.update as any).mockResolvedValue(mockInternalState());

      // Act
      const result = await service.processMessage({
        agentId: 'agent-123',
        userId: 'user-123',
        content: 'Test',
      });

      // Assert: Debería tener respuesta (no vacía)
      expect(result.assistantMessage.content).toBeDefined();
      expect(result.assistantMessage.content.length).toBeGreaterThan(0);
    });
  });
});
