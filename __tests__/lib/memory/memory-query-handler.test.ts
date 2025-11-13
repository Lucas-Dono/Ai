/**
 * Tests for Memory Query Handler
 *
 * Verifica la integración completa del sistema:
 * - Detection + Search + Context building
 * - Performance de búsqueda semántica
 * - Formateo de contexto
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { memoryQueryHandler } from '@/lib/memory/memory-query-handler';

// Mock dependencies
vi.mock('@/lib/memory/unified-retrieval', () => ({
  unifiedMemoryRetrieval: {
    retrieveContext: vi.fn().mockResolvedValue({
      chunks: [
        {
          id: '1',
          content: 'El usuario dijo que su cumpleaños es el 15 de marzo',
          source: 'episodic',
          score: 0.85,
          timestamp: new Date('2024-01-15'),
          metadata: { importance: 0.9 },
        },
        {
          id: '2',
          content: 'Usuario: Mi color favorito es el azul',
          source: 'rag',
          score: 0.72,
          timestamp: new Date('2024-02-01'),
          metadata: {},
        },
      ],
      summary: 'Test summary',
      totalScore: 1.57,
      sources: { rag: 1, episodic: 1, knowledge: 0 },
    }),
  },
}));

vi.mock('@/lib/emotional-system/modules/memory/retrieval', () => ({
  MemoryRetrievalSystem: vi.fn().mockImplementation(() => ({
    retrieveSimilarMemories: vi.fn().mockResolvedValue([]),
  })),
}));

describe('MemoryQueryHandler', () => {
  describe('handleQuery - Detection', () => {
    it('should detect memory query and return memories', async () => {
      const result = await memoryQueryHandler.handleQuery(
        '¿Recuerdas mi cumpleaños?',
        'agent-123',
        'user-456'
      );

      expect(result.detected).toBe(true);
      expect(result.detection.isMemoryQuery).toBe(true);
      expect(result.detection.queryType).toBe('recall');
      expect(result.memories.length).toBeGreaterThan(0);
    });

    it('should not detect non-memory queries', async () => {
      const result = await memoryQueryHandler.handleQuery(
        '¿Cómo estás hoy?',
        'agent-123',
        'user-456'
      );

      expect(result.detected).toBe(false);
      expect(result.memories.length).toBe(0);
      expect(result.contextPrompt).toBe('');
    });

    it('should respect confidence threshold', async () => {
      const result = await memoryQueryHandler.handleQuery(
        'Hablamos antes',
        'agent-123',
        'user-456'
      );

      // Low confidence query might not trigger
      if (!result.detected) {
        expect(result.detection.confidence).toBeLessThan(0.5);
      }
    });
  });

  describe('handleQuery - Context Building', () => {
    it('should build formatted context prompt', async () => {
      const result = await memoryQueryHandler.handleQuery(
        '¿Recuerdas mi cumpleaños?',
        'agent-123',
        'user-456'
      );

      if (result.detected) {
        expect(result.contextPrompt).toContain('Memorias Relevantes');
        expect(result.contextPrompt).toContain('cumpleaños');
      }
    });

    it('should include memory sources in context', async () => {
      const result = await memoryQueryHandler.handleQuery(
        '¿Qué te dije sobre mi familia?',
        'agent-123',
        'user-456'
      );

      if (result.detected && result.memories.length > 0) {
        expect(result.contextPrompt).toMatch(/\[EVENTO IMPORTANTE\]|\[CONVERSACIÓN PASADA\]|\[DATO CONOCIDO\]/);
      }
    });

    it('should handle no memories found gracefully', async () => {
      // Mock empty results
      const { unifiedMemoryRetrieval } = await import('@/lib/memory/unified-retrieval');
      vi.mocked(unifiedMemoryRetrieval.retrieveContext).mockResolvedValueOnce({
        chunks: [],
        summary: '',
        totalScore: 0,
        sources: { rag: 0, episodic: 0, knowledge: 0 },
      });

      const result = await memoryQueryHandler.handleQuery(
        '¿Recuerdas algo?',
        'agent-123',
        'user-456'
      );

      if (result.detected) {
        expect(result.contextPrompt).toContain('no se encontraron memorias');
        expect(result.metadata.memoriesFound).toBe(0);
      }
    });
  });

  describe('handleQuery - Metadata', () => {
    it('should include search metadata', async () => {
      const result = await memoryQueryHandler.handleQuery(
        '¿Recuerdas mi nombre?',
        'agent-123',
        'user-456'
      );

      expect(result.metadata).toHaveProperty('searchTimeMs');
      expect(result.metadata).toHaveProperty('memoriesFound');
      expect(result.metadata).toHaveProperty('avgSimilarity');
      expect(result.metadata).toHaveProperty('sources');
    });

    it('should track source distribution', async () => {
      const result = await memoryQueryHandler.handleQuery(
        '¿Qué te conté sobre mi trabajo?',
        'agent-123',
        'user-456'
      );

      if (result.detected) {
        const { episodic, rag, knowledge } = result.metadata.sources;
        expect(episodic + rag + knowledge).toBe(result.metadata.memoriesFound);
      }
    });

    it('should calculate average similarity', async () => {
      const result = await memoryQueryHandler.handleQuery(
        '¿Recuerdas mi cumpleaños?',
        'agent-123',
        'user-456'
      );

      if (result.detected && result.memories.length > 0) {
        expect(result.metadata.avgSimilarity).toBeGreaterThan(0);
        expect(result.metadata.avgSimilarity).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('handleQuery - Configuration', () => {
    it('should respect maxMemories limit', async () => {
      const result = await memoryQueryHandler.handleQuery(
        '¿Recuerdas algo sobre mí?',
        'agent-123',
        'user-456',
        { maxMemories: 2 }
      );

      if (result.detected) {
        expect(result.memories.length).toBeLessThanOrEqual(2);
      }
    });

    it('should respect minSimilarity threshold', async () => {
      const result = await memoryQueryHandler.handleQuery(
        '¿Qué te dije?',
        'agent-123',
        'user-456',
        { minSimilarity: 0.8 }
      );

      if (result.detected && result.memories.length > 0) {
        expect(result.memories.every(m => m.score >= 0.8)).toBe(true);
      }
    });

    it('should respect maxTokens limit in context', async () => {
      const result = await memoryQueryHandler.handleQuery(
        '¿Recuerdas todo lo que te dije?',
        'agent-123',
        'user-456',
        { maxTokens: 100 }
      );

      if (result.detected) {
        // Aproximadamente 4 chars por token
        const estimatedTokens = result.contextPrompt.length / 4;
        // Permitir algo de overhead por formateo
        expect(estimatedTokens).toBeLessThan(150);
      }
    });
  });

  describe('isMemoryQuery - Quick Check', () => {
    it('should quickly determine if message is memory query', () => {
      const isQuery1 = memoryQueryHandler.isMemoryQuery('¿Recuerdas mi nombre?');
      const isQuery2 = memoryQueryHandler.isMemoryQuery('¿Cómo estás?');

      expect(isQuery1).toBe(true);
      expect(isQuery2).toBe(false);
    });

    it('should respect custom confidence threshold', () => {
      const isQuery = memoryQueryHandler.isMemoryQuery('Hablamos antes', 0.7);

      // Low confidence message should not pass high threshold
      expect(isQuery).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should complete detection + search in under 1 second', async () => {
      const start = Date.now();

      await memoryQueryHandler.handleQuery(
        '¿Recuerdas mi cumpleaños?',
        'agent-123',
        'user-456'
      );

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });

    it('should report search time in metadata', async () => {
      const result = await memoryQueryHandler.handleQuery(
        '¿Qué te dije sobre mi familia?',
        'agent-123',
        'user-456'
      );

      expect(result.metadata.searchTimeMs).toBeGreaterThan(0);
      expect(result.metadata.searchTimeMs).toBeLessThan(5000);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle birthday query', async () => {
      const result = await memoryQueryHandler.handleQuery(
        '¿Cuándo es mi cumpleaños?',
        'agent-123',
        'user-456'
      );

      expect(result.detected).toBe(true);
      expect(result.detection.keywords).toContain('cumpleaños');
    });

    it('should handle name query', async () => {
      const result = await memoryQueryHandler.handleQuery(
        '¿Cómo se llama mi hermano?',
        'agent-123',
        'user-456'
      );

      expect(result.detected).toBe(true);
      expect(result.detection.keywords).toContain('hermano');
    });

    it('should handle preference query', async () => {
      const result = await memoryQueryHandler.handleQuery(
        '¿Cuál es mi comida favorita?',
        'agent-123',
        'user-456'
      );

      expect(result.detected).toBe(true);
      expect(result.detection.keywords).toContain('comida');
      expect(result.detection.keywords).toContain('favorita');
    });

    it('should handle location query', async () => {
      const result = await memoryQueryHandler.handleQuery(
        '¿Te dije dónde vivo?',
        'agent-123',
        'user-456'
      );

      expect(result.detected).toBe(true);
      expect(result.detection.queryType).toBe('verification');
    });

    it('should handle past conversation query', async () => {
      const result = await memoryQueryHandler.handleQuery(
        '¿De qué hablamos la última vez?',
        'agent-123',
        'user-456'
      );

      expect(result.detected).toBe(true);
      expect(result.detection.queryType).toBe('retrieval');
    });
  });
});
