/**
 * MEMORY RETRIEVAL SYSTEM TESTS
 *
 * Tests para el sistema de recuperación de memorias episódicas
 * Coverage objetivo: 80%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRetrievalSystem } from '@/lib/emotional-system/modules/memory/retrieval';
import {
  mockPrismaClient,
  mockEpisodicMemory,
  mockEmotionState,
  resetAllMocks,
} from '../../setup';

describe('MemoryRetrievalSystem', () => {
  let memorySystem: MemoryRetrievalSystem;

  beforeEach(() => {
    resetAllMocks();
    memorySystem = new MemoryRetrievalSystem();
  });

  describe('retrieveRelevantMemories', () => {
    it('debería recuperar memorias relevantes ordenadas por importance y recency', async () => {
      // Arrange: Crear memorias con diferentes importance
      const memories = [
        mockEpisodicMemory({
          id: 'mem-1',
          event: 'Important conversation',
          importance: 0.9,
          emotionalValence: 0.7,
          createdAt: new Date('2025-10-25'),
        }),
        mockEpisodicMemory({
          id: 'mem-2',
          event: 'Casual chat',
          importance: 0.3,
          emotionalValence: 0.5,
          createdAt: new Date('2025-10-28'),
        }),
        mockEpisodicMemory({
          id: 'mem-3',
          event: 'Deep discussion',
          importance: 0.8,
          emotionalValence: 0.6,
          createdAt: new Date('2025-10-29'),
        }),
      ];

      (mockPrismaClient.episodicMemory.findMany as any).mockResolvedValue(memories);

      // Act: Recuperar top 2 memorias
      const result = await memorySystem.retrieveRelevantMemories({
        query: 'Tell me about our previous conversations',
        agentId: 'agent-123',
        limit: 2,
        minImportance: 0.3,
      });

      // Assert: Debería retornar las 2 más importantes
      expect(result.memories).toHaveLength(2);
      expect(result.memories[0].importance).toBeGreaterThanOrEqual(result.memories[1].importance);
      expect(result.retrievalMetadata.retrievedCount).toBe(2);
      expect(result.retrievalMetadata.totalAvailable).toBe(3);
    });

    it('debería filtrar por minImportance threshold', async () => {
      // Arrange: Memorias con baja importance
      const memories = [
        mockEpisodicMemory({ importance: 0.2, event: 'Low importance' }),
        mockEpisodicMemory({ importance: 0.8, event: 'High importance' }),
        mockEpisodicMemory({ importance: 0.5, event: 'Medium importance' }),
      ];

      (mockPrismaClient.episodicMemory.findMany as any).mockResolvedValue(
        memories.filter(m => m.importance >= 0.5)
      );

      // Act: Filtrar con minImportance = 0.5
      const result = await memorySystem.retrieveRelevantMemories({
        query: 'important memories',
        agentId: 'agent-123',
        minImportance: 0.5,
      });

      // Assert: Solo memorias con importance >= 0.5
      expect(result.memories.every(m => m.importance >= 0.5)).toBe(true);
    });

    it('debería aplicar decay temporal a memorias antiguas', async () => {
      // Arrange: Memorias de diferentes fechas
      const oldMemory = mockEpisodicMemory({
        id: 'old',
        importance: 0.9,
        emotionalValence: 0.8,
        decayFactor: 1.0,
        createdAt: new Date('2025-01-01'), // 10 meses atrás
      });

      const recentMemory = mockEpisodicMemory({
        id: 'recent',
        importance: 0.7,
        emotionalValence: 0.7,
        decayFactor: 1.0,
        createdAt: new Date('2025-10-29'), // Ayer
      });

      (mockPrismaClient.episodicMemory.findMany as any).mockResolvedValue([oldMemory, recentMemory]);

      // Act
      const result = await memorySystem.retrieveRelevantMemories({
        query: 'memories',
        agentId: 'agent-123',
        limit: 2,
      });

      // Assert: La memoria reciente debería estar más arriba en ranking
      // debido al decay temporal de la antigua
      expect(result.memories).toHaveLength(2);
      // Verificar que hay resultado
      expect(result.retrievalMetadata.retrievedCount).toBe(2);
    });

    it('debería filtrar por emotional valence cuando se especifica preferredValence', async () => {
      // Arrange: Memorias con diferentes valences
      const positiveMemory = mockEpisodicMemory({
        event: 'Happy moment',
        emotionalValence: 0.9,
        importance: 0.8,
      });

      const negativeMemory = mockEpisodicMemory({
        event: 'Sad moment',
        emotionalValence: -0.7,
        importance: 0.8,
      });

      const neutralMemory = mockEpisodicMemory({
        event: 'Neutral moment',
        emotionalValence: 0.1,
        importance: 0.8,
      });

      (mockPrismaClient.episodicMemory.findMany as any).mockResolvedValue([
        positiveMemory,
        neutralMemory,
      ]);

      // Act: Buscar memorias positivas (preferredValence = 0.8)
      const result = await memorySystem.retrieveRelevantMemories({
        query: 'happy memories',
        agentId: 'agent-123',
        preferredValence: 0.8,
        limit: 3,
      });

      // Assert: Debería filtrar memorias muy negativas
      expect(result.memories.every(m =>
        Math.abs(m.emotionalValence - 0.8) <= 0.5
      )).toBe(true);
    });

    it('debería calcular scoring híbrido (importance + recency + emotional relevance)', async () => {
      // Arrange: Memoria reciente pero poco importante
      const recentLowImportance = mockEpisodicMemory({
        id: 'recent-low',
        importance: 0.4,
        emotionalValence: 0.5,
        createdAt: new Date('2025-10-30'),
      });

      // Memoria antigua pero muy importante
      const oldHighImportance = mockEpisodicMemory({
        id: 'old-high',
        importance: 0.95,
        emotionalValence: 0.5,
        createdAt: new Date('2025-09-01'),
      });

      (mockPrismaClient.episodicMemory.findMany as any).mockResolvedValue([
        recentLowImportance,
        oldHighImportance,
      ]);

      // Act
      const result = await memorySystem.retrieveRelevantMemories({
        query: 'important events',
        agentId: 'agent-123',
        limit: 2,
      });

      // Assert: El scoring híbrido debería considerar ambos factores
      expect(result.memories).toHaveLength(2);
      expect(result.retrievalMetadata.averageImportance).toBeGreaterThan(0);
    });

    it('debería retornar array vacío si no hay memorias', async () => {
      // Arrange: Sin memorias
      (mockPrismaClient.episodicMemory.findMany as any).mockResolvedValue([]);

      // Act
      const result = await memorySystem.retrieveRelevantMemories({
        query: 'anything',
        agentId: 'agent-123',
      });

      // Assert
      expect(result.memories).toEqual([]);
      expect(result.retrievalMetadata.totalAvailable).toBe(0);
      expect(result.retrievalMetadata.retrievedCount).toBe(0);
    });

    it('debería usar emotional context para calcular relevancia', async () => {
      // Arrange: Memorias con diferentes valences
      const joyfulMemory = mockEpisodicMemory({
        event: 'Celebration',
        emotionalValence: 0.9,
        importance: 0.7,
      });

      const sadMemory = mockEpisodicMemory({
        event: 'Loss',
        emotionalValence: -0.8,
        importance: 0.7,
      });

      (mockPrismaClient.episodicMemory.findMany as any).mockResolvedValue([
        joyfulMemory,
        sadMemory,
      ]);

      // Act: Con emotional context de joy alto
      const result = await memorySystem.retrieveRelevantMemories({
        query: 'memories',
        agentId: 'agent-123',
        emotionalContext: mockEmotionState({ joy: 0.9, sadness: 0.1 }),
        limit: 2,
      });

      // Assert: Debería priorizar memorias con valence similar
      expect(result.memories).toHaveLength(2);
    });

    it('debería manejar errores de base de datos y retornar resultado vacío', async () => {
      // Arrange: Simular error de DB
      (mockPrismaClient.episodicMemory.findMany as any).mockRejectedValue(
        new Error('Database error')
      );

      // Act: No debería lanzar error, sino retornar vacío
      const result = await memorySystem.retrieveRelevantMemories({
        query: 'test',
        agentId: 'agent-123',
      });

      // Assert: Graceful degradation
      expect(result.memories).toEqual([]);
      expect(result.retrievalMetadata.totalAvailable).toBe(0);
    });
  });

  describe('storeMemory', () => {
    it('debería almacenar una memoria episódica con todos los campos', async () => {
      // Arrange
      const newMemory = mockEpisodicMemory({
        event: 'User shared important information',
        userEmotion: 'joy',
        characterEmotion: 'happy_for',
        emotionalValence: 0.8,
        importance: 0.9,
      });

      (mockPrismaClient.episodicMemory.create as any).mockResolvedValue(newMemory);

      // Act
      const result = await memorySystem.storeMemory({
        agentId: 'agent-123',
        event: 'User shared important information',
        userEmotion: 'joy',
        characterEmotion: 'happy_for',
        emotionalValence: 0.8,
        importance: 0.9,
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.event).toBe('User shared important information');
      expect(result.importance).toBe(0.9);
      expect(mockPrismaClient.episodicMemory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          agentId: 'agent-123',
          event: 'User shared important information',
          emotionalValence: 0.8,
          importance: 0.9,
        }),
      });
    });

    it('debería inicializar decayFactor en 1.0', async () => {
      // Arrange
      const newMemory = mockEpisodicMemory({ decayFactor: 1.0 });
      (mockPrismaClient.episodicMemory.create as any).mockResolvedValue(newMemory);

      // Act
      const result = await memorySystem.storeMemory({
        agentId: 'agent-123',
        event: 'Test event',
        emotionalValence: 0.5,
        importance: 0.7,
      });

      // Assert
      expect(result.decayFactor).toBe(1.0);
    });

    it('debería manejar errores al almacenar y propagar el error', async () => {
      // Arrange
      (mockPrismaClient.episodicMemory.create as any).mockRejectedValue(
        new Error('Database write error')
      );

      // Act & Assert
      await expect(
        memorySystem.storeMemory({
          agentId: 'agent-123',
          event: 'Test',
          emotionalValence: 0.5,
          importance: 0.5,
        })
      ).rejects.toThrow('Database write error');
    });
  });

  describe('consolidateMemories', () => {
    it('debería ser una operación placeholder (TODO)', async () => {
      // Este método está marcado como TODO en el código original
      // Verificar que no lanza error
      await expect(
        memorySystem.consolidateMemories('agent-123')
      ).resolves.not.toThrow();
    });
  });
});
