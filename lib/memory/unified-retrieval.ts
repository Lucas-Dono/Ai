/**
 * UNIFIED MEMORY RETRIEVAL
 *
 * Sistema unificado de retrieval de memorias que integra:
 * 1. RAG (Retrieval-Augmented Generation) - Vector search
 * 2. Episodic Memory - Memorias estructuradas de eventos
 * 3. Temporal Weighting - Recency + Importance
 *
 * Esto permite que la IA tenga contexto completo de:
 * - Conversaciones pasadas relevantes (RAG)
 * - Eventos importantes (Episodic)
 * - Datos personales del usuario (Knowledge)
 *
 * USO:
 * import { unifiedMemoryRetrieval } from "@/lib/memory/unified-retrieval";
 *
 * const context = await unifiedMemoryRetrieval.retrieveContext(
 *   agentId,
 *   userId,
 *   userMessage
 * );
 */

import { prisma } from "@/lib/prisma";

export interface MemoryChunk {
  id: string;
  content: string;
  source: "rag" | "episodic" | "knowledge";
  score: number; // 0-1 (relevancia)
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UnifiedMemoryContext {
  chunks: MemoryChunk[];
  summary: string;
  totalScore: number;
  sources: {
    rag: number;
    episodic: number;
    knowledge: number;
  };
}

/**
 * Configuración de retrieval
 */
interface RetrievalConfig {
  maxChunks: number;
  ragWeight: number; // 0-1
  episodicWeight: number; // 0-1
  knowledgeWeight: number; // 0-1
  recencyBoost: number; // Factor de boost por recency (0-1)
  minScore: number; // Score mínimo para incluir (0-1)
}

const DEFAULT_CONFIG: RetrievalConfig = {
  maxChunks: 10,
  ragWeight: 0.4,
  episodicWeight: 0.4,
  knowledgeWeight: 0.2,
  recencyBoost: 0.3,
  minScore: 0.3,
};

export class UnifiedMemoryRetrieval {
  /**
   * Retrieve contexto unificado de todas las fuentes de memoria
   */
  async retrieveContext(
    agentId: string,
    userId: string,
    query: string,
    config: Partial<RetrievalConfig> = {}
  ): Promise<UnifiedMemoryContext> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    // Ejecutar retrievals en paralelo
    const [ragChunks, episodicChunks, knowledgeChunks] = await Promise.all([
      this.retrieveFromRAG(agentId, userId, query, finalConfig),
      this.retrieveFromEpisodicMemory(agentId, userId, query, finalConfig),
      this.retrieveFromKnowledge(agentId, query, finalConfig),
    ]);

    // Combinar y rankear
    const allChunks = [...ragChunks, ...episodicChunks, ...knowledgeChunks];

    // Aplicar recency boost
    const boostedChunks = this.applyRecencyBoost(allChunks, finalConfig);

    // Ordenar por score
    boostedChunks.sort((a, b) => b.score - a.score);

    // Filtrar por score mínimo y limitar cantidad
    const filteredChunks = boostedChunks
      .filter((chunk) => chunk.score >= finalConfig.minScore)
      .slice(0, finalConfig.maxChunks);

    // Generar summary
    const summary = this.generateSummary(filteredChunks);

    // Calcular stats
    const sources = {
      rag: filteredChunks.filter((c) => c.source === "rag").length,
      episodic: filteredChunks.filter((c) => c.source === "episodic").length,
      knowledge: filteredChunks.filter((c) => c.source === "knowledge").length,
    };

    const totalScore = filteredChunks.reduce((sum, c) => sum + c.score, 0);

    console.log(
      `[UnifiedMemoryRetrieval] Retrieved ${filteredChunks.length} chunks (RAG: ${sources.rag}, Episodic: ${sources.episodic}, Knowledge: ${sources.knowledge})`
    );

    return {
      chunks: filteredChunks,
      summary,
      totalScore,
      sources,
    };
  }

  /**
   * Retrieve desde RAG (vector similarity search)
   */
  private async retrieveFromRAG(
    agentId: string,
    userId: string,
    query: string,
    config: RetrievalConfig
  ): Promise<MemoryChunk[]> {
    try {
      // Buscar mensajes similares usando búsqueda full-text
      // (En un sistema real, usarías embeddings + pgvector)
      const messages = await prisma.message.findMany({
        where: {
          conversationId: {
            in: (
              await prisma.conversation.findMany({
                where: { agentId, userId },
                select: { id: true },
              })
            ).map((c) => c.id),
          },
          role: "user",
        },
        orderBy: { createdAt: "desc" },
        take: 50, // Últimos 50 mensajes
      });

      // Simple keyword matching (reemplazar con vector search real)
      const queryWords = query.toLowerCase().split(/\s+/);
      const chunks: MemoryChunk[] = [];

      for (const message of messages) {
        const messageWords = message.content.toLowerCase().split(/\s+/);
        let matches = 0;

        for (const word of queryWords) {
          if (word.length > 3 && messageWords.includes(word)) {
            matches++;
          }
        }

        if (matches > 0) {
          const score = (matches / queryWords.length) * config.ragWeight;

          chunks.push({
            id: message.id,
            content: message.content,
            source: "rag",
            score,
            timestamp: message.createdAt,
            metadata: {
              conversationId: message.conversationId,
              matches,
            },
          });
        }
      }

      return chunks.slice(0, 5); // Top 5 RAG results
    } catch (error) {
      console.error("[UnifiedMemoryRetrieval] Error en RAG:", error);
      return [];
    }
  }

  /**
   * Retrieve desde Episodic Memory
   */
  private async retrieveFromEpisodicMemory(
    agentId: string,
    userId: string,
    query: string,
    config: RetrievalConfig
  ): Promise<MemoryChunk[]> {
    try {
      // Buscar episodic memories
      const episodicMemories = await prisma.episodicMemory.findMany({
        where: {
          agentId,
          userId,
        },
        orderBy: { timestamp: "desc" },
        take: 20,
      });

      const queryWords = query.toLowerCase().split(/\s+/);
      const chunks: MemoryChunk[] = [];

      for (const memory of episodicMemories) {
        const memoryContent = `${memory.summary} ${memory.content || ""}`.toLowerCase();
        let matches = 0;

        for (const word of queryWords) {
          if (word.length > 3 && memoryContent.includes(word)) {
            matches++;
          }
        }

        if (matches > 0) {
          // Score basado en matches + importance
          const matchScore = matches / queryWords.length;
          const importanceScore = memory.importance;
          const combinedScore =
            (matchScore * 0.6 + importanceScore * 0.4) * config.episodicWeight;

          chunks.push({
            id: memory.id,
            content: memory.summary,
            source: "episodic",
            score: combinedScore,
            timestamp: memory.timestamp,
            metadata: {
              type: memory.type,
              importance: memory.importance,
              emotionalImpact: memory.emotionalImpact,
            },
          });
        }
      }

      return chunks.slice(0, 5); // Top 5 episodic results
    } catch (error) {
      console.error("[UnifiedMemoryRetrieval] Error en Episodic:", error);
      return [];
    }
  }

  /**
   * Retrieve desde Knowledge
   */
  private async retrieveFromKnowledge(
    agentId: string,
    query: string,
    config: RetrievalConfig
  ): Promise<MemoryChunk[]> {
    try {
      const knowledgeGroups = await prisma.knowledge.findMany({
        where: { agentId },
      });

      const queryWords = query.toLowerCase().split(/\s+/);
      const chunks: MemoryChunk[] = [];

      for (const knowledge of knowledgeGroups) {
        const knowledgeContent =
          `${knowledge.name} ${knowledge.description || ""} ${knowledge.content || ""}`.toLowerCase();
        let matches = 0;

        for (const word of queryWords) {
          if (word.length > 3 && knowledgeContent.includes(word)) {
            matches++;
          }
        }

        if (matches > 0) {
          const score = (matches / queryWords.length) * config.knowledgeWeight;

          chunks.push({
            id: knowledge.id,
            content: `[${knowledge.name}] ${knowledge.content || knowledge.description || ""}`,
            source: "knowledge",
            score,
            timestamp: knowledge.createdAt,
            metadata: {
              name: knowledge.name,
              category: knowledge.category,
            },
          });
        }
      }

      return chunks.slice(0, 3); // Top 3 knowledge results
    } catch (error) {
      console.error("[UnifiedMemoryRetrieval] Error en Knowledge:", error);
      return [];
    }
  }

  /**
   * Aplica boost por recency (más reciente = más score)
   */
  private applyRecencyBoost(
    chunks: MemoryChunk[],
    config: RetrievalConfig
  ): MemoryChunk[] {
    const now = Date.now();
    const maxAgeMs = 365 * 24 * 60 * 60 * 1000; // 1 año

    return chunks.map((chunk) => {
      const ageMs = now - chunk.timestamp.getTime();
      const recencyFactor = Math.max(0, 1 - ageMs / maxAgeMs);
      const boost = recencyFactor * config.recencyBoost;

      return {
        ...chunk,
        score: Math.min(1.0, chunk.score + boost),
      };
    });
  }

  /**
   * Genera un summary textual del contexto recuperado
   */
  private generateSummary(chunks: MemoryChunk[]): string {
    if (chunks.length === 0) {
      return "No hay contexto relevante disponible.";
    }

    const parts: string[] = [];

    // Agrupar por source
    const bySource = {
      rag: chunks.filter((c) => c.source === "rag"),
      episodic: chunks.filter((c) => c.source === "episodic"),
      knowledge: chunks.filter((c) => c.source === "knowledge"),
    };

    if (bySource.episodic.length > 0) {
      parts.push(
        `Memorias importantes: ${bySource.episodic.map((c) => c.content).join("; ")}`
      );
    }

    if (bySource.knowledge.length > 0) {
      parts.push(`Knowledge relevante: ${bySource.knowledge.length} grupos`);
    }

    if (bySource.rag.length > 0) {
      parts.push(
        `Conversaciones pasadas relacionadas: ${bySource.rag.length} mensajes`
      );
    }

    return parts.join("\n");
  }

  /**
   * API conveniente: Retorna contexto formateado para prompt
   */
  async getPromptContext(
    agentId: string,
    userId: string,
    query: string,
    maxTokens: number = 2000
  ): Promise<string> {
    const context = await this.retrieveContext(agentId, userId, query);

    if (context.chunks.length === 0) {
      return "";
    }

    const promptParts: string[] = [];
    let currentTokens = 0;

    // Estimar ~4 caracteres por token
    const estimateTokens = (text: string) => Math.ceil(text.length / 4);

    for (const chunk of context.chunks) {
      const chunkText = `[${chunk.source.toUpperCase()}] ${chunk.content}`;
      const chunkTokens = estimateTokens(chunkText);

      if (currentTokens + chunkTokens > maxTokens) {
        break;
      }

      promptParts.push(chunkText);
      currentTokens += chunkTokens;
    }

    return `## Contexto Relevante:\n${promptParts.join("\n\n")}`;
  }
}

/**
 * Singleton instance
 */
export const unifiedMemoryRetrieval = new UnifiedMemoryRetrieval();
