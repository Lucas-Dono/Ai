/**
 * Sistema de Búsqueda Inteligente de Memoria con Scoring de Confianza Humana
 *
 * Arquitectura de 2 niveles:
 * 1. PostgreSQL Full-Text Search (70% de casos, <20ms, GRATIS)
 * 2. Qwen3-0.6B Q8 Semantic Search (30% de casos, ~120ms, LOCAL)
 *
 * Scoring de confianza humana:
 * - High (>75%): Recuerdo claro
 * - Medium (60-75%): Recuerdo vago
 * - Low (45-60%): Recuerdo difuso, necesita ayuda
 * - None (<45%): No recuerda
 */

import { createLogger } from '@/lib/logger';
import {
  searchMessagesByKeywords,
  areKeywordResultsSufficient,
  type KeywordSearchResult,
} from './keyword-search';
import { generateQwenEmbedding, cosineSimilarity } from './qwen-embeddings';
import { prisma } from '@/lib/prisma';

const log = createLogger('SmartSearch');

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'none';

export interface MemorySearchResult {
  found: boolean;
  confidence: ConfidenceLevel;
  memories: Array<{
    messageId: string;
    content: string;
    role: 'user' | 'assistant';
    createdAt: Date;
    similarity: number;
  }>;
  needsUserHelp: boolean;
  searchMethod: 'keywords' | 'semantic' | 'none';
  searchTimeMs: number;
}

/**
 * Buscar en memoria con sistema híbrido y scoring de confianza humana
 */
export async function searchMemoryHuman(
  agentId: string,
  userId: string,
  query: string
): Promise<MemorySearchResult> {
  const startTime = Date.now();

  try {
    // NIVEL 1: PostgreSQL Full-Text Search (rápido, gratis)
    log.debug({ agentId, userId, query }, 'Iniciando búsqueda por keywords');

    const keywordResults = await searchMessagesByKeywords(
      agentId,
      userId,
      query,
      5
    );

    // Verificar si los resultados de keywords son suficientes
    if (areKeywordResultsSufficient(keywordResults, 2, 0.75)) {
      const searchTime = Date.now() - startTime;
      log.info(
        { count: keywordResults.length, timeMs: searchTime, method: 'keywords' },
        'Búsqueda completada con keywords (suficiente)'
      );

      return buildResult(
        keywordResults.map(r => ({
          messageId: r.messageId,
          content: r.content,
          role: r.role,
          createdAt: r.createdAt,
          similarity: r.score,
        })),
        'keywords',
        searchTime
      );
    }

    // NIVEL 2: Qwen3-0.6B Q8 Semantic Search (mejor calidad)
    log.debug({ agentId, userId, query }, 'Keywords insuficientes, usando búsqueda semántica');

    const semanticResults = await searchBySemantic(agentId, userId, query, 5);

    const searchTime = Date.now() - startTime;
    log.info(
      { count: semanticResults.length, timeMs: searchTime, method: 'semantic' },
      'Búsqueda completada con embeddings'
    );

    return buildResult(semanticResults, 'semantic', searchTime);
  } catch (error) {
    log.error({ error, agentId, userId, query }, 'Error en búsqueda de memoria');

    // Fallback: búsqueda simple por texto parcial
    const fallbackResults = await searchByPartialText(agentId, userId, query, 3);
    const searchTime = Date.now() - startTime;

    return buildResult(fallbackResults, 'keywords', searchTime);
  }
}

/**
 * Búsqueda semántica usando Qwen3-0.6B Q8 embeddings
 */
async function searchBySemantic(
  agentId: string,
  userId: string,
  query: string,
  limit: number
): Promise<
  Array<{
    messageId: string;
    content: string;
    role: 'user' | 'assistant';
    createdAt: Date;
    similarity: number;
  }>
> {
  try {
    // Intentar generar embedding del query
    let queryEmbedding: number[];
    try {
      queryEmbedding = await generateQwenEmbedding(query);
    } catch (embeddingError) {
      log.warn(
        { error: embeddingError },
        'No se pudo generar embedding (posiblemente Edge Runtime), fallback a búsqueda parcial'
      );
      // Fallback a búsqueda parcial si embeddings no están disponibles
      return await searchByPartialText(agentId, userId, query, limit);
    }

    // Obtener todos los mensajes con embeddings guardados
    const messagesWithEmbeddings = await prisma.message.findMany({
      where: {
        agentId,
        userId,
        metadata: {
          path: ['embedding'],
          not: null as any,
        },
      },
      select: {
        id: true,
        content: true,
        role: true,
        createdAt: true,
        metadata: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limitar para performance
    });

    if (messagesWithEmbeddings.length === 0) {
      log.warn({ agentId, userId }, 'No hay mensajes con embeddings guardados');
      return [];
    }

    // Calcular similitudes
    const resultsWithSimilarity = messagesWithEmbeddings
      .map(msg => {
        const embedding = (msg.metadata as any)?.embedding as number[] | undefined;

        if (!embedding || !Array.isArray(embedding)) {
          return null;
        }

        const similarity = cosineSimilarity(queryEmbedding, embedding);

        return {
          messageId: msg.id,
          content: msg.content,
          role: msg.role as 'user' | 'assistant',
          createdAt: msg.createdAt,
          similarity,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    // Ordenar por similitud y retornar top N
    return resultsWithSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  } catch (error) {
    log.error({ error }, 'Error en búsqueda semántica');
    return [];
  }
}

/**
 * Búsqueda fallback por texto parcial (cuando todo falla)
 */
async function searchByPartialText(
  agentId: string,
  userId: string,
  query: string,
  limit: number
): Promise<
  Array<{
    messageId: string;
    content: string;
    role: 'user' | 'assistant';
    createdAt: Date;
    similarity: number;
  }>
> {
  try {
    const messages = await prisma.message.findMany({
      where: {
        agentId,
        userId,
        content: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        content: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return messages.map(m => ({
      messageId: m.id,
      content: m.content,
      role: m.role as 'user' | 'assistant',
      createdAt: m.createdAt,
      similarity: 0.5, // Score moderado para búsqueda parcial
    }));
  } catch (error) {
    log.error({ error }, 'Error en búsqueda parcial');
    return [];
  }
}

/**
 * Construir resultado con scoring de confianza humana
 */
function buildResult(
  memories: Array<{
    messageId: string;
    content: string;
    role: 'user' | 'assistant';
    createdAt: Date;
    similarity: number;
  }>,
  searchMethod: 'keywords' | 'semantic' | 'none',
  searchTimeMs: number
): MemorySearchResult {
  if (memories.length === 0) {
    return {
      found: false,
      confidence: 'none',
      memories: [],
      needsUserHelp: true,
      searchMethod: 'none',
      searchTimeMs,
    };
  }

  const topScore = memories[0].similarity;

  // Scoring de confianza humana
  let confidence: ConfidenceLevel;
  let needsUserHelp: boolean;

  if (topScore > 0.75) {
    confidence = 'high';
    needsUserHelp = false;
  } else if (topScore > 0.60) {
    confidence = 'medium';
    needsUserHelp = false;
  } else if (topScore > 0.45) {
    confidence = 'low';
    needsUserHelp = true;
  } else {
    confidence = 'none';
    needsUserHelp = true;
  }

  return {
    found: true,
    confidence,
    memories,
    needsUserHelp,
    searchMethod,
    searchTimeMs,
  };
}

/**
 * Formatear resultados de búsqueda para incluir en el prompt de la IA
 */
export function formatMemorySearchForPrompt(result: MemorySearchResult): string {
  if (!result.found || result.memories.length === 0) {
    return `\n\n## Búsqueda de Memoria
Resultado: NO SE ENCONTRARON MEMORIAS RELEVANTES
Confianza: none
needsUserHelp: true

⚠️ No recordás esto. Admití que no te acordás de forma natural.`;
  }

  let prompt = `\n\n## Búsqueda de Memoria
Resultado: ${result.memories.length} memoria(s) encontrada(s)
Confianza: ${result.confidence}
needsUserHelp: ${result.needsUserHelp}
Método: ${result.searchMethod}

`;

  // Agregar memorias encontradas
  result.memories.slice(0, 3).forEach((memory, idx) => {
    const similarity = Math.round(memory.similarity * 100);
    const role = memory.role === 'user' ? 'Usuario' : 'Vos';
    prompt += `[${similarity}% similitud] ${role}: ${memory.content}\n`;
  });

  // Agregar guía según confianza
  if (result.confidence === 'high') {
    prompt += `\n✅ Confianza ALTA: Recordás esto claramente. Respondé con seguridad.`;
  } else if (result.confidence === 'medium') {
    prompt += `\n~ Confianza MEDIA: Recordás vagamente. Podés decir "creo que..." o "me suena que...".`;
  } else if (result.confidence === 'low') {
    prompt += `\n⚠️ Confianza BAJA: Recuerdo muy difuso. Pedí ayuda naturalmente.`;
  } else {
    prompt += `\n❌ Confianza NINGUNA: No recordás. Admití que no te acordás.`;
  }

  return prompt;
}
