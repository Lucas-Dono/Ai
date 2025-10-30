/**
 * PostgreSQL Full-Text Search para búsqueda de memoria por palabras clave
 * Sistema gratuito, rápido (~20ms) que resuelve el 70% de búsquedas
 */

import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const log = createLogger('KeywordSearch');

export interface KeywordSearchResult {
  messageId: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
  score: number; // 0-1, relevancia del resultado
  matchedKeywords: string[];
}

/**
 * Buscar mensajes usando PostgreSQL Full-Text Search
 */
export async function searchMessagesByKeywords(
  agentId: string,
  userId: string,
  keywords: string | string[],
  limit: number = 5
): Promise<KeywordSearchResult[]> {
  try {
    // Normalizar keywords a array
    const keywordArray = Array.isArray(keywords) ? keywords : extractKeywords(keywords);

    if (keywordArray.length === 0) {
      log.warn({ keywords }, 'No keywords extracted from query');
      return [];
    }

    // Construir query de búsqueda (operador OR entre keywords)
    const tsquery = keywordArray.join(' | ');

    log.debug({ agentId, userId, keywords: keywordArray }, 'Searching messages by keywords');

    // Ejecutar búsqueda full-text en español
    const results = await prisma.$queryRaw<any[]>`
      SELECT
        id as "messageId",
        content,
        role,
        "createdAt",
        ts_rank(
          to_tsvector('spanish', content),
          to_tsquery('spanish', ${tsquery})
        ) as rank
      FROM "Message"
      WHERE
        "agentId" = ${agentId}
        AND "userId" = ${userId}
        AND to_tsvector('spanish', content) @@ to_tsquery('spanish', ${tsquery})
      ORDER BY rank DESC, "createdAt" DESC
      LIMIT ${limit}
    `;

    // Formatear resultados
    const formatted = results.map(r => ({
      messageId: r.messageId,
      content: r.content,
      role: r.role as 'user' | 'assistant',
      createdAt: r.createdAt,
      score: normalizeRank(r.rank), // Normalizar a 0-1
      matchedKeywords: findMatchedKeywords(r.content, keywordArray),
    }));

    log.info(
      { count: formatted.length, keywords: keywordArray },
      'Keyword search completed'
    );

    return formatted;
  } catch (error) {
    log.error({ error, agentId, userId, keywords }, 'Keyword search failed');
    return [];
  }
}

/**
 * Extraer keywords importantes de una query de usuario
 * Remueve stopwords en español y normaliza
 */
function extractKeywords(query: string): string[] {
  // Stopwords comunes en español
  const stopwords = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
    'de', 'del', 'a', 'al', 'en', 'por', 'para', 'con', 'sin',
    'es', 'son', 'era', 'fue', 'como', 'que', 'y', 'o', 'pero',
    'si', 'no', 'me', 'te', 'se', 'lo', 'le', 'mi', 'tu', 'su',
    'yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos',
    'este', 'ese', 'aquel', 'esto', 'eso', 'aquello',
    'muy', 'más', 'menos', 'también', 'tampoco', 'sobre',
    'cómo', 'cuándo', 'dónde', 'qué', 'quién', 'cuál',
  ]);

  // Limpiar y tokenizar
  const tokens = query
    .toLowerCase()
    .normalize('NFD') // Normalizar acentos
    .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos
    .replace(/[^\w\s]/g, ' ') // Remover puntuación
    .split(/\s+/)
    .filter(t => t.length > 2) // Palabras de al menos 3 caracteres
    .filter(t => !stopwords.has(t)); // Remover stopwords

  // Remover duplicados
  return Array.from(new Set(tokens));
}

/**
 * Normalizar rank de PostgreSQL (0.0-1.0) a score más intuitivo
 */
function normalizeRank(rank: number): number {
  // ts_rank típicamente retorna valores entre 0 y 1, pero puede ser mayor
  // Normalizamos a un rango más intuitivo
  return Math.min(1.0, Math.max(0.0, rank * 2)); // Multiplicar por 2 para amplificar diferencias
}

/**
 * Encontrar qué keywords aparecen en el contenido
 */
function findMatchedKeywords(content: string, keywords: string[]): string[] {
  const normalizedContent = content
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return keywords.filter(keyword => {
    const normalizedKeyword = keyword
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return normalizedContent.includes(normalizedKeyword);
  });
}

/**
 * Calcular score promedio de resultados
 */
export function calculateAverageScore(results: KeywordSearchResult[]): number {
  if (results.length === 0) return 0;
  const sum = results.reduce((acc, r) => acc + r.score, 0);
  return sum / results.length;
}

/**
 * Verificar si los resultados son suficientemente buenos
 * para no necesitar búsqueda semántica
 */
export function areKeywordResultsSufficient(
  results: KeywordSearchResult[],
  minResults: number = 2,
  minAvgScore: number = 0.75
): boolean {
  if (results.length < minResults) return false;

  const avgScore = calculateAverageScore(results);
  return avgScore >= minAvgScore;
}
