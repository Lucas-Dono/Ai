/**
 * MEMORY RETRIEVAL SYSTEM
 *
 * Sistema de recuperación de memorias episódicas usando:
 * - Búsqueda semántica por similitud (embeddings)
 * - Filtrado por emotional valence
 * - Scoring por importance y recency
 * - Consolidación de memorias relacionadas
 */

import { EpisodicMemory, EmotionState } from "../../types";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { generateQwenEmbedding, cosineSimilarity } from "@/lib/memory/qwen-embeddings";
import { createLogger } from "@/lib/logger";

const log = createLogger("MemoryRetrieval");

export interface MemoryQuery {
  query: string;
  agentId: string;
  emotionalContext?: EmotionState;
  limit?: number;
  minImportance?: number;
  preferredValence?: number; // -1 a 1: preferir memorias positivas/negativas
}

export interface MemoryRetrievalResult {
  memories: EpisodicMemory[];
  retrievalMetadata: {
    totalAvailable: number;
    retrievedCount: number;
    averageImportance: number;
    averageValence: number;
  };
}

export class MemoryRetrievalSystem {
  /**
   * Recupera memorias relevantes usando embeddings
   * NOTA: Por ahora usamos búsqueda por recency e importance
   * TODO: Implementar búsqueda vectorial cuando pgvector esté disponible
   */
  async retrieveRelevantMemories(query: MemoryQuery): Promise<MemoryRetrievalResult> {
    console.log(`[MemoryRetrieval] Retrieving memories for agent ${query.agentId}...`);

    try {
      // Obtener todas las memorias del agente
      const allMemories = await prisma.episodicMemory.findMany({
        where: {
          agentId: query.agentId,
          importance: {
            gte: query.minImportance || 0.3, // Filtrar memorias poco importantes
          },
        },
        orderBy: [
          { importance: "desc" },
          { createdAt: "desc" },
        ],
        take: 50, // Obtener top 50 para luego filtrar
      });

      if (allMemories.length === 0) {
        return {
          memories: [],
          retrievalMetadata: {
            totalAvailable: 0,
            retrievedCount: 0,
            averageImportance: 0,
            averageValence: 0,
          },
        };
      }

      // Aplicar decay temporal a las memorias
      const memoriesWithDecay = this.applyTemporalDecay(allMemories);

      // Filtrar por emotional valence si se especifica
      let filteredMemories = memoriesWithDecay;
      if (query.preferredValence !== undefined) {
        filteredMemories = this.filterByEmotionalValence(
          memoriesWithDecay,
          query.preferredValence
        );
      }

      // Scoring híbrido: importance + recency + emotional relevance
      const scoredMemories = this.calculateMemoryScores(
        filteredMemories,
        query.emotionalContext
      );

      // Ordenar por score y tomar top N
      const topMemories = scoredMemories
        .sort((a, b) => b.score - a.score)
        .slice(0, query.limit || 3)
        .map((m) => m.memory);

      // Calcular metadata
      const metadata = this.calculateRetrievalMetadata(allMemories, topMemories);

      console.log(`[MemoryRetrieval] Retrieved ${topMemories.length} memories`);

      return {
        memories: topMemories,
        retrievalMetadata: metadata,
      };
    } catch (error) {
      console.error("[MemoryRetrieval] Error retrieving memories:", error);
      return {
        memories: [],
        retrievalMetadata: {
          totalAvailable: 0,
          retrievedCount: 0,
          averageImportance: 0,
          averageValence: 0,
        },
      };
    }
  }

  /**
   * Aplica decay temporal a memorias (las viejas pesan menos)
   */
  private applyTemporalDecay(memories: any[]): any[] {
    const now = new Date();

    return memories.map((memory) => {
      const ageInDays = (now.getTime() - new Date(memory.createdAt).getTime()) / (1000 * 60 * 60 * 24);

      // Decay exponencial: memorias viejas pierden relevancia
      // Pero memorias muy importantes decaen más lento
      const decayRate = 0.1 * (1 - memory.importance * 0.5);
      const decayFactor = Math.exp(-decayRate * ageInDays);

      return {
        ...memory,
        effectiveImportance: memory.importance * decayFactor * memory.decayFactor,
      };
    });
  }

  /**
   * Filtra memorias por emotional valence
   */
  private filterByEmotionalValence(memories: any[], preferredValence: number): any[] {
    // Si preferimos memorias positivas, filtrar las muy negativas y viceversa
    const valenceTolerance = 0.5;

    return memories.filter((memory) => {
      const valenceDiff = Math.abs(memory.emotionalValence - preferredValence);
      return valenceDiff <= valenceTolerance;
    });
  }

  /**
   * Calcula scores híbridos para memorias
   */
  private calculateMemoryScores(
    memories: any[],
    emotionalContext?: EmotionState
  ): Array<{ memory: any; score: number }> {
    return memories.map((memory) => {
      let score = 0;

      // 1. Importance score (40%)
      score += memory.effectiveImportance * 0.4;

      // 2. Recency score (30%)
      const ageInDays = (Date.now() - new Date(memory.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.exp(-0.1 * ageInDays); // Decay exponencial
      score += recencyScore * 0.3;

      // 3. Emotional relevance score (30%)
      if (emotionalContext) {
        const emotionalRelevance = this.calculateEmotionalRelevance(
          memory,
          emotionalContext
        );
        score += emotionalRelevance * 0.3;
      } else {
        score += 0.15; // Neutral si no hay contexto emocional
      }

      return { memory, score };
    });
  }

  /**
   * Calcula relevancia emocional de una memoria
   */
  private calculateEmotionalRelevance(
    memory: any,
    currentEmotions: EmotionState
  ): number {
    // Si la memoria tiene emoción similar a la actual, es más relevante
    // Esto simula "recordar cosas similares cuando estamos en cierto mood"

    const currentValence = this.calculateEmotionalValence(currentEmotions);
    const memoryValence = memory.emotionalValence;

    // Similitud emocional (0 a 1)
    const valenceSimilarity = 1 - Math.abs(currentValence - memoryValence) / 2;

    return valenceSimilarity;
  }

  /**
   * Calcula valence promedio de emociones actuales
   */
  private calculateEmotionalValence(emotions: EmotionState): number {
    // Emociones positivas vs negativas
    const positiveEmotions = ["joy", "satisfaction", "relief", "happy_for", "pride", "admiration", "gratitude", "liking", "affection", "love", "excitement", "interest", "curiosity"];
    const negativeEmotions = ["distress", "disappointment", "fears_confirmed", "resentment", "pity", "shame", "reproach", "anger", "disliking", "anxiety", "concern", "boredom", "fear"];

    let positiveSum = 0;
    let negativeSum = 0;

    for (const [emotion, intensity] of Object.entries(emotions)) {
      if (positiveEmotions.includes(emotion)) {
        positiveSum += intensity;
      } else if (negativeEmotions.includes(emotion)) {
        negativeSum += intensity;
      }
    }

    // Normalizar a -1 (muy negativo) a 1 (muy positivo)
    const total = positiveSum + negativeSum;
    if (total === 0) return 0;

    return (positiveSum - negativeSum) / total;
  }

  /**
   * Calcula metadata de retrieval
   */
  private calculateRetrievalMetadata(
    allMemories: any[],
    retrievedMemories: any[]
  ): {
    totalAvailable: number;
    retrievedCount: number;
    averageImportance: number;
    averageValence: number;
  } {
    const avgImportance =
      retrievedMemories.length > 0
        ? retrievedMemories.reduce((sum, m) => sum + m.importance, 0) / retrievedMemories.length
        : 0;

    const avgValence =
      retrievedMemories.length > 0
        ? retrievedMemories.reduce((sum, m) => sum + m.emotionalValence, 0) / retrievedMemories.length
        : 0;

    return {
      totalAvailable: allMemories.length,
      retrievedCount: retrievedMemories.length,
      averageImportance: avgImportance,
      averageValence: avgValence,
    };
  }

  /**
   * Almacena una nueva memoria episódica con embedding opcional
   */
  async storeMemory(params: {
    agentId: string;
    event: string;
    userEmotion?: string;
    characterEmotion?: string;
    emotionalValence: number;
    importance: number;
    metadata?: Record<string, any>;
  }): Promise<EpisodicMemory> {
    log.info({ agentId: params.agentId }, "Storing new memory...");

    try {
      // Intentar generar embedding (no crítico - continuar si falla)
      let embeddingArray: number[] | null = null;
      try {
        embeddingArray = await generateQwenEmbedding(params.event);
        log.debug({ embeddingDim: embeddingArray.length }, "Embedding generated successfully");
      } catch (embeddingError) {
        log.warn(
          { error: embeddingError },
          "Failed to generate embedding, storing memory without it"
        );
        // Continuar sin embedding - no es bloqueante
      }

      const memory = await prisma.episodicMemory.create({
        data: {
          id: nanoid(),
          agentId: params.agentId,
          event: params.event,
          userEmotion: params.userEmotion,
          characterEmotion: params.characterEmotion,
          emotionalValence: params.emotionalValence,
          importance: params.importance,
          decayFactor: 1.0,
          embedding: embeddingArray ? (embeddingArray as any) : null,
          metadata: (params.metadata || {}) as any,
        },
      });

      log.info({ memoryId: memory.id, hasEmbedding: !!embeddingArray }, "Memory stored successfully");

      return memory as EpisodicMemory;
    } catch (error) {
      log.error({ error }, "Error storing memory");
      throw error;
    }
  }

  /**
   * Consolida memorias relacionadas (reduce redundancia)
   *
   * NOTA: Implementación básica - mejoras futuras:
   * - Usar embeddings para agrupar semánticamente
   * - Generar resúmenes inteligentes con LLM
   * - Mantener metadata de consolidación
   */
  async consolidateMemories(agentId: string): Promise<void> {
    log.info({ agentId }, "Starting memory consolidation...");

    try {
      // Obtener memorias del agente ordenadas por importancia
      const memories = await prisma.episodicMemory.findMany({
        where: { agentId },
        orderBy: { createdAt: "desc" },
      });

      if (memories.length < 10) {
        log.debug("Not enough memories to consolidate");
        return;
      }

      // Agrupar memorias por similitud temporal (mismo día)
      const memoryGroups = new Map<string, any[]>();

      for (const memory of memories) {
        const dateKey = memory.createdAt.toISOString().split("T")[0];
        if (!memoryGroups.has(dateKey)) {
          memoryGroups.set(dateKey, []);
        }
        memoryGroups.get(dateKey)!.push(memory);
      }

      // Consolidar grupos con múltiples memorias de baja importancia
      for (const [dateKey, groupMemories] of Array.from(memoryGroups.entries())) {
        if (groupMemories.length >= 3) {
          const lowImportanceMemories = groupMemories.filter(m => m.importance < 0.5);

          if (lowImportanceMemories.length >= 3) {
            log.debug(
              { dateKey, count: lowImportanceMemories.length },
              "Consolidating low-importance memories"
            );

            // Por ahora, solo reducimos el decayFactor de las memorias menos importantes
            // En una implementación completa, crearíamos una memoria resumen
            for (const memory of lowImportanceMemories.slice(3)) {
              await prisma.episodicMemory.update({
                where: { id: memory.id },
                data: { decayFactor: memory.decayFactor * 0.8 },
              });
            }
          }
        }
      }

      log.info({ agentId }, "Memory consolidation completed");
    } catch (error) {
      log.error({ error, agentId }, "Error during memory consolidation");
    }
  }

  /**
   * Genera embedding para texto usando Qwen3-Embedding-0.6B
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      return await generateQwenEmbedding(text);
    } catch (error) {
      log.error({ error }, "Error generating embedding");
      throw error;
    }
  }

  /**
   * Busca memorias similares usando embeddings (búsqueda vectorial)
   *
   * NOTA: Esta implementación hace búsqueda en memoria (in-memory).
   * Para producción, considerar usar pgvector para búsqueda vectorial eficiente en Postgres.
   */
  async retrieveSimilarMemories(
    agentId: string,
    query: string,
    limit: number = 5,
    minSimilarity: number = 0.5
  ): Promise<Array<{ memory: EpisodicMemory; similarity: number }>> {
    log.info({ agentId, query }, "Retrieving similar memories using embeddings...");

    try {
      // Generar embedding del query
      const queryEmbedding = await generateQwenEmbedding(query);

      // Obtener todas las memorias del agente
      // Filtraremos las que tienen embedding después de cargarlas
      const memories = await prisma.episodicMemory.findMany({
        where: {
          agentId,
        },
        orderBy: { createdAt: "desc" },
        take: 100, // Limitar para no cargar demasiadas en memoria
      });

      // Filtrar solo memorias con embeddings válidos
      const memoriesWithEmbeddings = memories.filter(
        m => m.embedding !== null && Array.isArray(m.embedding) && (m.embedding as any[]).length > 0
      );

      if (memoriesWithEmbeddings.length === 0) {
        log.warn("No memories with embeddings found");
        return [];
      }

      // Calcular similitud coseno con cada memoria
      const memoriesWithSimilarity = memoriesWithEmbeddings
        .map(memory => {
          const memoryEmbedding = memory.embedding as any;

          // Verificar que el embedding sea válido
          if (!Array.isArray(memoryEmbedding) || memoryEmbedding.length === 0) {
            return null;
          }

          const similarity = cosineSimilarity(queryEmbedding, memoryEmbedding);

          return {
            memory: memory as EpisodicMemory,
            similarity,
          };
        })
        .filter(item => item !== null && item.similarity >= minSimilarity) as Array<{
          memory: EpisodicMemory;
          similarity: number;
        }>;

      // Ordenar por similitud descendente
      memoriesWithSimilarity.sort((a, b) => b.similarity - a.similarity);

      // Tomar top N
      const topMemories = memoriesWithSimilarity.slice(0, limit);

      log.info(
        { found: topMemories.length, avgSimilarity: topMemories.reduce((sum, m) => sum + m.similarity, 0) / topMemories.length },
        "Similar memories retrieved"
      );

      return topMemories;
    } catch (error) {
      log.error({ error }, "Error retrieving similar memories");
      return [];
    }
  }
}
