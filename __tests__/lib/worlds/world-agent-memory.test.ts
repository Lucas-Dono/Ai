/**
 * Tests para WorldAgentMemoryService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorldAgentMemoryService, shouldSaveEpisode } from '@/lib/worlds/world-agent-memory.service';
import { prisma } from '@/lib/prisma';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    worldEpisodicMemory: {
      create: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

// Mock embeddings
vi.mock('@/lib/memory/qwen-embeddings', () => ({
  generateQwenEmbedding: vi.fn().mockResolvedValue(new Array(384).fill(0.1)),
  cosineSimilarity: vi.fn((a, b) => 0.8), // Mock similarity score
}));

describe('WorldAgentMemoryService', () => {
  const worldId = 'test-world-id';
  const agentId = 'test-agent-id';
  let memoryService: WorldAgentMemoryService;

  beforeEach(() => {
    memoryService = new WorldAgentMemoryService(worldId);
    vi.clearAllMocks();
  });

  describe('saveEpisode', () => {
    it('should save an episode with all parameters', async () => {
      const mockMemory = {
        id: 'memory-1',
        worldId,
        agentId,
        event: 'María me confesó su secreto',
        turnNumber: 42,
        importance: 0.9,
        emotionalArousal: 0.8,
        createdAt: new Date(),
      };

      (prisma.worldEpisodicMemory.create as any).mockResolvedValue(mockMemory);

      const result = await memoryService.saveEpisode({
        agentId,
        event: 'María me confesó su secreto',
        involvedAgentIds: ['agent-2'],
        turnNumber: 42,
        importance: 0.9,
        emotionalArousal: 0.8,
        emotionalValence: 0.5,
        dominantEmotion: 'surprise',
      });

      expect(result).toEqual(mockMemory);
      expect(prisma.worldEpisodicMemory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            worldId,
            agentId,
            event: 'María me confesó su secreto',
            turnNumber: 42,
            importance: 0.9,
            emotionalArousal: 0.8,
          }),
        })
      );
    });

    it('should handle embedding generation failure gracefully', async () => {
      const { generateQwenEmbedding } = await import('@/lib/memory/qwen-embeddings');
      (generateQwenEmbedding as any).mockRejectedValueOnce(new Error('Embedding failed'));

      const mockMemory = {
        id: 'memory-1',
        worldId,
        agentId,
        event: 'Test event',
        turnNumber: 1,
      };

      (prisma.worldEpisodicMemory.create as any).mockResolvedValue(mockMemory);

      const result = await memoryService.saveEpisode({
        agentId,
        event: 'Test event',
        involvedAgentIds: [],
        turnNumber: 1,
        importance: 0.5,
        emotionalArousal: 0.5,
      });

      expect(result).toEqual(mockMemory);
    });
  });

  describe('retrieveRelevantEpisodes', () => {
    it('should retrieve relevant episodes with semantic search', async () => {
      const mockMemories = [
        {
          id: 'memory-1',
          worldId,
          agentId,
          event: 'María me confesó su secreto',
          turnNumber: 42,
          importance: 0.9,
          emotionalArousal: 0.8,
          emotionalValence: 0.5,
          createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          embedding: new Array(384).fill(0.1),
          keywords: ['maría', 'secreto', 'confesó'],
          involvedAgentIds: ['agent-2'],
          decayFactor: 1.0,
          isConsolidated: false,
          accessCount: 0,
        },
        {
          id: 'memory-2',
          worldId,
          agentId,
          event: 'Tuvimos una conversación agradable',
          turnNumber: 40,
          importance: 0.6,
          emotionalArousal: 0.5,
          emotionalValence: 0.3,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          embedding: new Array(384).fill(0.2),
          keywords: ['conversación', 'agradable'],
          involvedAgentIds: ['agent-3'],
          decayFactor: 1.0,
          isConsolidated: false,
          accessCount: 0,
        },
      ];

      (prisma.worldEpisodicMemory.findMany as any).mockResolvedValue(mockMemories);
      (prisma.worldEpisodicMemory.updateMany as any).mockResolvedValue({ count: 2 });

      const result = await memoryService.retrieveRelevantEpisodes({
        agentId,
        query: 'María secreto',
        limit: 5,
        minImportance: 0.5,
      });

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('memory');
      expect(result[0]).toHaveProperty('score');
      expect(result[0]).toHaveProperty('relevanceReason');
      expect(prisma.worldEpisodicMemory.updateMany).toHaveBeenCalled();
    });

    it('should return empty array when no memories found', async () => {
      (prisma.worldEpisodicMemory.findMany as any).mockResolvedValue([]);

      const result = await memoryService.retrieveRelevantEpisodes({
        agentId,
        query: 'nonexistent',
        limit: 5,
      });

      expect(result).toEqual([]);
    });

    it('should apply emotional context filtering', async () => {
      const mockMemories = [
        {
          id: 'memory-1',
          worldId,
          agentId,
          event: 'Evento positivo',
          turnNumber: 1,
          importance: 0.8,
          emotionalArousal: 0.7,
          emotionalValence: 0.8, // Muy positivo
          createdAt: new Date(),
          embedding: new Array(384).fill(0.1),
          keywords: ['positivo'],
          involvedAgentIds: [],
          decayFactor: 1.0,
          isConsolidated: false,
          accessCount: 0,
        },
      ];

      (prisma.worldEpisodicMemory.findMany as any).mockResolvedValue(mockMemories);
      (prisma.worldEpisodicMemory.updateMany as any).mockResolvedValue({ count: 1 });

      const result = await memoryService.retrieveRelevantEpisodes({
        agentId,
        query: 'positivo',
        emotionalContext: {
          currentValence: 0.9, // Estado actual muy positivo
        },
      });

      expect(result.length).toBeGreaterThan(0);
      // Memoria positiva debería tener alto score con valence similar
      expect(result[0].score).toBeGreaterThan(0.5);
    });
  });

  describe('consolidateMemories', () => {
    it('should consolidate low-importance memories', async () => {
      const mockMemories = Array.from({ length: 25 }, (_, i) => ({
        id: `memory-${i}`,
        worldId,
        agentId,
        event: `Evento ${i}`,
        turnNumber: i,
        importance: 0.4, // Baja importancia
        emotionalArousal: 0.5,
        emotionalValence: 0,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * i),
        embedding: null,
        keywords: [],
        involvedAgentIds: [],
        decayFactor: 1.0,
        isConsolidated: false,
        accessCount: 0,
      }));

      (prisma.worldEpisodicMemory.findMany as any).mockResolvedValue(mockMemories);
      (prisma.worldEpisodicMemory.create as any).mockResolvedValue({
        id: 'consolidated-1',
      });
      (prisma.worldEpisodicMemory.update as any).mockResolvedValue({});

      const result = await memoryService.consolidateMemories(agentId);

      expect(result.memoriesConsolidated).toBeGreaterThan(0);
      expect(result.newMemoriesCreated).toBeGreaterThan(0);
    });

    it('should not consolidate if too few memories', async () => {
      const mockMemories = [
        {
          id: 'memory-1',
          worldId,
          agentId,
          event: 'Test',
          turnNumber: 1,
          importance: 0.5,
          emotionalArousal: 0.5,
          emotionalValence: 0,
          createdAt: new Date(),
          embedding: null,
          keywords: [],
          involvedAgentIds: [],
          decayFactor: 1.0,
          isConsolidated: false,
          accessCount: 0,
        },
      ];

      (prisma.worldEpisodicMemory.findMany as any).mockResolvedValue(mockMemories);

      const result = await memoryService.consolidateMemories(agentId);

      expect(result.memoriesConsolidated).toBe(0);
      expect(result.newMemoriesCreated).toBe(0);
    });
  });

  describe('getMemoryStats', () => {
    it('should return correct stats', async () => {
      (prisma.worldEpisodicMemory.count as any)
        .mockResolvedValueOnce(50) // total
        .mockResolvedValueOnce(5) // consolidated
        .mockResolvedValueOnce(10); // recent

      (prisma.worldEpisodicMemory.aggregate as any).mockResolvedValue({
        _avg: { importance: 0.7 },
      });

      const stats = await memoryService.getMemoryStats(agentId);

      expect(stats.totalMemories).toBe(50);
      expect(stats.consolidatedMemories).toBe(5);
      expect(stats.averageImportance).toBe(0.7);
      expect(stats.recentMemories).toBe(10);
    });
  });
});

describe('shouldSaveEpisode', () => {
  it('should save emergent events', () => {
    const result = shouldSaveEpisode({
      importance: 0.3,
      emotionalArousal: 0.3,
      involvedAgentsCount: 1,
      isEmergentEvent: true,
    });

    expect(result).toBe(true);
  });

  it('should save high importance events', () => {
    const result = shouldSaveEpisode({
      importance: 0.8,
      emotionalArousal: 0.5,
      involvedAgentsCount: 1,
      isEmergentEvent: false,
    });

    expect(result).toBe(true);
  });

  it('should save high arousal events', () => {
    const result = shouldSaveEpisode({
      importance: 0.5,
      emotionalArousal: 0.9,
      involvedAgentsCount: 1,
      isEmergentEvent: false,
    });

    expect(result).toBe(true);
  });

  it('should save multi-agent interactions with moderate importance', () => {
    const result = shouldSaveEpisode({
      importance: 0.6,
      emotionalArousal: 0.5,
      involvedAgentsCount: 3,
      isEmergentEvent: false,
    });

    expect(result).toBe(true);
  });

  it('should not save low importance single interactions', () => {
    const result = shouldSaveEpisode({
      importance: 0.4,
      emotionalArousal: 0.4,
      involvedAgentsCount: 1,
      isEmergentEvent: false,
    });

    expect(result).toBe(false);
  });
});
