/**
 * WORLD AGENT MEMORY SERVICE
 *
 * Sistema de memoria episódica para agentes en mundos virtuales.
 * Permite coherencia narrativa de largo plazo (1000+ turnos).
 *
 * CARACTERÍSTICAS:
 * - Memoria episódica por agente (eventos específicos)
 * - Búsqueda semántica con embeddings
 * - Decay temporal (eventos viejos menos accesibles)
 * - Consolidación para mundos largos
 * - Scoring híbrido (importance + recency + relevance)
 *
 * EJEMPLO DE USO:
 * const memoryService = new WorldAgentMemoryService(worldId);
 * await memoryService.saveEpisode({
 *   agentId: 'agent-1',
 *   event: 'María me confesó su secreto sobre el incidente',
 *   involvedAgentIds: ['agent-2'],
 *   turnNumber: 42,
 *   importance: 0.9,
 *   emotionalArousal: 0.8
 * });
 *
 * const memories = await memoryService.retrieveRelevantEpisodes({
 *   agentId: 'agent-1',
 *   query: 'María secreto',
 *   limit: 5
 * });
 */

import { prisma } from '@/lib/prisma';
import { generateQwenEmbedding, cosineSimilarity } from '@/lib/memory/qwen-embeddings';
import { createLogger } from '@/lib/logger';
import type { WorldEpisodicMemory } from '@prisma/client';

const log = createLogger('WorldAgentMemoryService');

// ========================================
// TIPOS
// ========================================

export interface SaveEpisodeParams {
  agentId: string;
  event: string;
  involvedAgentIds: string[]; // IDs de otros agentes en el episodio
  turnNumber: number;

  // Importancia y emociones
  importance: number; // 0-1
  emotionalArousal: number; // 0-1
  emotionalValence?: number; // -1 a 1
  dominantEmotion?: string;

  // Contexto adicional
  location?: string;
  agentEmotions?: Record<string, any>; // { agentId: { emotion: intensity } }
  metadata?: Record<string, any>;
}

export interface RetrievalQuery {
  agentId: string;
  query: string; // Texto libre para búsqueda
  limit?: number; // Máximo de memorias a retornar (default: 5)
  minImportance?: number; // Filtrar por importancia mínima
  emotionalContext?: {
    currentEmotion?: string;
    currentValence?: number;
  };
}

export interface RetrievedEpisode {
  memory: WorldEpisodicMemory;
  score: number; // Score combinado de relevancia
  relevanceReason: string; // Por qué es relevante
}

export interface ConsolidationResult {
  memoriesConsolidated: number;
  newMemoriesCreated: number;
  oldMemoriesDeleted: number;
}

// ========================================
// SERVICE
// ========================================

export class WorldAgentMemoryService {
  private worldId: string;

  constructor(worldId: string) {
    this.worldId = worldId;
  }

  /**
   * Guarda un episodio memorable para un agente
   */
  async saveEpisode(params: SaveEpisodeParams): Promise<WorldEpisodicMemory> {
    log.info(
      {
        worldId: this.worldId,
        agentId: params.agentId,
        turnNumber: params.turnNumber,
        importance: params.importance,
      },
      '💾 Saving episodic memory'
    );

    // Generar embedding para búsqueda semántica (no bloqueante)
    let embedding: number[] | null = null;
    try {
      embedding = await generateQwenEmbedding(params.event);
      log.debug({ embeddingDim: embedding.length }, 'Embedding generated');
    } catch (error) {
      log.warn({ error }, 'Failed to generate embedding, continuing without it');
    }

    // Extraer keywords del evento (simple por ahora)
    const keywords = this.extractKeywords(params.event);

    // Crear la memoria
    const memory = await prisma.worldEpisodicMemory.create({
      data: {
        worldId: this.worldId,
        agentId: params.agentId,
        event: params.event,
        turnNumber: params.turnNumber,
        involvedAgentIds: params.involvedAgentIds as any,
        location: params.location,
        importance: params.importance,
        emotionalArousal: params.emotionalArousal,
        emotionalValence: params.emotionalValence || 0,
        dominantEmotion: params.dominantEmotion,
        agentEmotions: (params.agentEmotions || {}) as any,
        embedding: embedding ? (embedding as any) : null,
        keywords: keywords as any,
        metadata: (params.metadata || {}) as any,
      },
    });

    log.info(
      { memoryId: memory.id, hasEmbedding: !!embedding },
      '✅ Episodic memory saved'
    );

    return memory;
  }

  /**
   * Recupera episodios relevantes para un agente
   */
  async retrieveRelevantEpisodes(query: RetrievalQuery): Promise<RetrievedEpisode[]> {
    const limit = query.limit || 5;
    const minImportance = query.minImportance || 0.3;

    log.debug(
      {
        worldId: this.worldId,
        agentId: query.agentId,
        query: query.query,
        limit,
      },
      '🔍 Retrieving relevant episodes'
    );

    // PASO 1: Obtener todas las memorias del agente con filtros básicos
    const allMemories = await prisma.worldEpisodicMemory.findMany({
      where: {
        worldId: this.worldId,
        agentId: query.agentId,
        importance: {
          gte: minImportance,
        },
      },
      orderBy: [
        { importance: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 50, // Pre-filter top 50
    });

    if (allMemories.length === 0) {
      log.debug('No memories found');
      return [];
    }

    // PASO 2: Intentar búsqueda semántica con embeddings
    let scoredMemories: Array<{ memory: WorldEpisodicMemory; score: number; method: string }>;

    try {
      const queryEmbedding = await generateQwenEmbedding(query.query);

      // Filtrar memorias con embeddings
      const memoriesWithEmbeddings = allMemories.filter(
        m => m.embedding !== null && Array.isArray(m.embedding)
      );

      if (memoriesWithEmbeddings.length > 0) {
        // Búsqueda semántica
        scoredMemories = memoriesWithEmbeddings.map(memory => {
          const memoryEmbedding = memory.embedding as any;
          const similarity = cosineSimilarity(queryEmbedding, memoryEmbedding);

          return {
            memory,
            score: similarity,
            method: 'semantic',
          };
        });

        log.debug(
          { count: scoredMemories.length },
          '✅ Semantic search completed'
        );
      } else {
        // Fallback a keyword matching
        scoredMemories = this.keywordBasedScoring(allMemories, query.query);
      }
    } catch (error) {
      log.warn({ error }, 'Embedding search failed, using keyword fallback');
      scoredMemories = this.keywordBasedScoring(allMemories, query.query);
    }

    // PASO 3: Aplicar scoring híbrido (importance + recency + emotional relevance)
    const hybridScored = this.applyHybridScoring(
      scoredMemories,
      query.emotionalContext
    );

    // PASO 4: Ordenar y tomar top N
    hybridScored.sort((a, b) => b.score - a.score);
    const topMemories = hybridScored.slice(0, limit);

    // PASO 5: Actualizar metadata de acceso
    await this.updateAccessMetadata(topMemories.map(m => m.memory.id));

    // PASO 6: Generar razones de relevancia
    const result = topMemories.map(item => ({
      memory: item.memory,
      score: item.score,
      relevanceReason: this.generateRelevanceReason(item),
    }));

    log.info(
      { retrieved: result.length, avgScore: result.reduce((sum, r) => sum + r.score, 0) / result.length },
      '✅ Episodes retrieved'
    );

    return result;
  }

  /**
   * Consolida memorias para mundos largos (1000+ interacciones)
   * Agrupa memorias similares y reduce redundancia
   */
  async consolidateMemories(agentId: string): Promise<ConsolidationResult> {
    log.info({ worldId: this.worldId, agentId }, '🔄 Starting memory consolidation');

    const memories = await prisma.worldEpisodicMemory.findMany({
      where: {
        worldId: this.worldId,
        agentId,
        isConsolidated: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (memories.length < 20) {
      log.debug('Not enough memories to consolidate');
      return {
        memoriesConsolidated: 0,
        newMemoriesCreated: 0,
        oldMemoriesDeleted: 0,
      };
    }

    // Agrupar memorias por similitud temporal (turnos cercanos)
    const turnGroups = this.groupByTurnProximity(memories, 10); // Agrupar turnos dentro de 10

    let consolidated = 0;
    let created = 0;
    let deleted = 0;

    for (const group of turnGroups) {
      if (group.length >= 3) {
        // Consolidar grupos de 3+ memorias de baja importancia
        const lowImportance = group.filter(m => m.importance < 0.5);

        if (lowImportance.length >= 3) {
          // Crear memoria consolidada
          const summary = this.generateConsolidatedSummary(lowImportance);
          const avgImportance = lowImportance.reduce((sum, m) => sum + m.importance, 0) / lowImportance.length;
          const avgArousal = lowImportance.reduce((sum, m) => sum + m.emotionalArousal, 0) / lowImportance.length;
          const avgValence = lowImportance.reduce((sum, m) => sum + m.emotionalValence, 0) / lowImportance.length;

          const consolidatedMemory = await prisma.worldEpisodicMemory.create({
            data: {
              worldId: this.worldId,
              agentId,
              event: summary,
              summary,
              turnNumber: lowImportance[0].turnNumber,
              involvedAgentIds: this.mergeInvolvedAgents(lowImportance),
              importance: avgImportance,
              emotionalArousal: avgArousal,
              emotionalValence: avgValence,
              isConsolidated: true,
              consolidatedFrom: lowImportance.map(m => m.id) as any,
              decayFactor: 0.9, // Memorias consolidadas decaen más lento
            },
          });

          created++;

          // Marcar memorias originales como consolidadas (no eliminar por si acaso)
          for (const memory of lowImportance) {
            await prisma.worldEpisodicMemory.update({
              where: { id: memory.id },
              data: {
                isConsolidated: true,
                decayFactor: memory.decayFactor * 0.5, // Reducir peso
              },
            });
            consolidated++;
          }
        }
      }
    }

    log.info(
      { consolidated, created, deleted },
      '✅ Memory consolidation completed'
    );

    return {
      memoriesConsolidated: consolidated,
      newMemoriesCreated: created,
      oldMemoriesDeleted: deleted,
    };
  }

  /**
   * Obtiene estadísticas de memoria para un agente
   */
  async getMemoryStats(agentId: string) {
    const [total, consolidated, avgImportance, recentCount] = await Promise.all([
      prisma.worldEpisodicMemory.count({
        where: { worldId: this.worldId, agentId },
      }),
      prisma.worldEpisodicMemory.count({
        where: { worldId: this.worldId, agentId, isConsolidated: true },
      }),
      prisma.worldEpisodicMemory.aggregate({
        where: { worldId: this.worldId, agentId },
        _avg: { importance: true },
      }),
      prisma.worldEpisodicMemory.count({
        where: {
          worldId: this.worldId,
          agentId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
          },
        },
      }),
    ]);

    return {
      totalMemories: total,
      consolidatedMemories: consolidated,
      averageImportance: avgImportance._avg.importance || 0,
      recentMemories: recentCount,
    };
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  /**
   * Extrae keywords del texto del evento
   */
  private extractKeywords(text: string): string[] {
    // Implementación simple: palabras de 4+ caracteres
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length >= 4);

    // Remover duplicados
    return [...new Set(words)].slice(0, 10); // Top 10 keywords
  }

  /**
   * Scoring basado en keywords (fallback)
   */
  private keywordBasedScoring(
    memories: WorldEpisodicMemory[],
    query: string
  ): Array<{ memory: WorldEpisodicMemory; score: number; method: string }> {
    const queryWords = this.extractKeywords(query);

    return memories.map(memory => {
      const memoryKeywords = (memory.keywords as string[]) || [];
      const eventWords = this.extractKeywords(memory.event);
      const allMemoryWords = [...new Set([...memoryKeywords, ...eventWords])];

      // Contar matches
      let matches = 0;
      for (const qWord of queryWords) {
        if (allMemoryWords.includes(qWord)) {
          matches++;
        }
      }

      const score = queryWords.length > 0 ? matches / queryWords.length : 0;

      return {
        memory,
        score,
        method: 'keyword',
      };
    });
  }

  /**
   * Aplica scoring híbrido: semantic/keyword + importance + recency + emotional
   */
  private applyHybridScoring(
    scored: Array<{ memory: WorldEpisodicMemory; score: number; method: string }>,
    emotionalContext?: { currentEmotion?: string; currentValence?: number }
  ): Array<{ memory: WorldEpisodicMemory; score: number; method: string }> {
    const now = Date.now();

    return scored.map(item => {
      const { memory, score: baseScore } = item;

      let hybridScore = baseScore * 0.4; // 40% relevancia semántica/keyword

      // Factor 1: Importancia (30%)
      hybridScore += memory.importance * 0.3;

      // Factor 2: Recency con decay temporal (20%)
      const ageInDays = (now - memory.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      const decayRate = 0.1 * (1 - memory.importance * 0.5); // Memorias importantes decaen más lento
      const recencyScore = Math.exp(-decayRate * ageInDays) * memory.decayFactor;
      hybridScore += recencyScore * 0.2;

      // Factor 3: Emotional relevance (10%)
      if (emotionalContext?.currentValence !== undefined) {
        const valenceSimilarity = 1 - Math.abs(emotionalContext.currentValence - memory.emotionalValence) / 2;
        hybridScore += valenceSimilarity * 0.1;
      } else {
        hybridScore += 0.05; // Neutral
      }

      // Boost por alto arousal emocional
      if (memory.emotionalArousal > 0.7) {
        hybridScore *= 1.1; // 10% boost
      }

      // Penalización por consolidadas (menos específicas)
      if (memory.isConsolidated) {
        hybridScore *= 0.8;
      }

      // Boost por acceso frecuente (memorias importantes se recuerdan más)
      if (memory.accessCount > 3) {
        hybridScore *= 1.05;
      }

      return {
        ...item,
        score: Math.min(1.0, hybridScore),
      };
    });
  }

  /**
   * Actualiza metadata de acceso (tracking)
   */
  private async updateAccessMetadata(memoryIds: string[]): Promise<void> {
    if (memoryIds.length === 0) return;

    // Batch update
    await prisma.worldEpisodicMemory.updateMany({
      where: {
        id: { in: memoryIds },
      },
      data: {
        lastAccessed: new Date(),
        accessCount: { increment: 1 },
      },
    });
  }

  /**
   * Genera razón de relevancia para el usuario
   */
  private generateRelevanceReason(item: {
    memory: WorldEpisodicMemory;
    score: number;
    method: string;
  }): string {
    const reasons: string[] = [];

    if (item.score > 0.8) {
      reasons.push('alta relevancia');
    }

    if (item.memory.importance > 0.7) {
      reasons.push('evento muy importante');
    }

    if (item.memory.emotionalArousal > 0.7) {
      reasons.push('emocionalmente intenso');
    }

    const ageInDays = (Date.now() - item.memory.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays < 1) {
      reasons.push('muy reciente');
    } else if (ageInDays < 7) {
      reasons.push('reciente');
    }

    if (item.method === 'semantic') {
      reasons.push('semánticamente similar');
    }

    if (item.memory.accessCount > 5) {
      reasons.push('memoria frecuentemente recordada');
    }

    return reasons.length > 0 ? reasons.join(', ') : 'relevante';
  }

  /**
   * Agrupa memorias por proximidad de turnos
   */
  private groupByTurnProximity(
    memories: WorldEpisodicMemory[],
    maxDistance: number
  ): WorldEpisodicMemory[][] {
    if (memories.length === 0) return [];

    const sorted = [...memories].sort((a, b) => a.turnNumber - b.turnNumber);
    const groups: WorldEpisodicMemory[][] = [];
    let currentGroup: WorldEpisodicMemory[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const curr = sorted[i];
      const prev = currentGroup[currentGroup.length - 1];

      if (curr.turnNumber - prev.turnNumber <= maxDistance) {
        currentGroup.push(curr);
      } else {
        groups.push(currentGroup);
        currentGroup = [curr];
      }
    }

    groups.push(currentGroup);
    return groups;
  }

  /**
   * Genera resumen consolidado de múltiples memorias
   */
  private generateConsolidatedSummary(memories: WorldEpisodicMemory[]): string {
    // Simple por ahora: concatenar eventos
    const events = memories.map(m => m.event).join('; ');
    return `Serie de eventos (turnos ${memories[0].turnNumber}-${memories[memories.length - 1].turnNumber}): ${events}`;
  }

  /**
   * Combina IDs de agentes involucrados de múltiples memorias
   */
  private mergeInvolvedAgents(memories: WorldEpisodicMemory[]): any {
    const allAgents = new Set<string>();

    for (const memory of memories) {
      const agents = memory.involvedAgentIds as string[];
      if (Array.isArray(agents)) {
        agents.forEach(id => allAgents.add(id));
      }
    }

    return [...allAgents];
  }
}

/**
 * Helper: Determina si un evento es lo suficientemente importante para guardar
 */
export function shouldSaveEpisode(params: {
  importance?: number;
  emotionalArousal?: number;
  involvedAgentsCount: number;
  isEmergentEvent: boolean;
}): boolean {
  const { importance = 0.5, emotionalArousal = 0.5, involvedAgentsCount, isEmergentEvent } = params;

  // Siempre guardar eventos emergentes
  if (isEmergentEvent) return true;

  // Eventos muy importantes
  if (importance > 0.7) return true;

  // Eventos emocionalmente intensos
  if (emotionalArousal > 0.8) return true;

  // Interacciones entre múltiples agentes
  if (involvedAgentsCount >= 2 && importance > 0.5) return true;

  return false;
}
