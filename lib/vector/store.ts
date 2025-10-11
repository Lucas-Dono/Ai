/**
 * Mock de un almacenamiento vectorial para memoria de conversaciones
 * En producción, esto se conectaría a Qdrant, Pinecone o similar
 */

export interface MemoryEntry {
  id: string;
  agentId: string;
  content: string;
  timestamp: Date;
  embedding?: number[]; // Mock, no se usa realmente
}

class VectorStore {
  private memories: Map<string, MemoryEntry[]> = new Map();

  async addMemory(agentId: string, content: string): Promise<void> {
    if (!this.memories.has(agentId)) {
      this.memories.set(agentId, []);
    }

    const memories = this.memories.get(agentId)!;
    memories.push({
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      content,
      timestamp: new Date(),
    });

    // Mantener solo las últimas 20 memorias
    if (memories.length > 20) {
      memories.shift();
    }
  }

  async getRecentMemories(agentId: string, limit: number = 10): Promise<MemoryEntry[]> {
    const memories = this.memories.get(agentId) || [];
    return memories.slice(-limit);
  }

  async searchSimilar(agentId: string, query: string, limit: number = 5): Promise<MemoryEntry[]> {
    // Mock: búsqueda simple por palabras clave
    const memories = this.memories.get(agentId) || [];
    const keywords = query.toLowerCase().split(" ");

    const scored = memories.map((mem) => {
      const content = mem.content.toLowerCase();
      const score = keywords.reduce((acc, word) => acc + (content.includes(word) ? 1 : 0), 0);
      return { mem, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.mem);
  }

  clearMemories(agentId: string): void {
    this.memories.delete(agentId);
  }
}

// Singleton
let vectorStore: VectorStore | null = null;

export function getVectorStore(): VectorStore {
  if (!vectorStore) {
    vectorStore = new VectorStore();
  }
  return vectorStore;
}
