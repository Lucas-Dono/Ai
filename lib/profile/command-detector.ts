/**
 * Detección Inteligente de Comandos Relevantes
 *
 * Usa embeddings semánticos para detectar qué comandos de knowledge
 * son relevantes para la pregunta del usuario.
 *
 * Funciona en cualquier idioma sin necesidad de diccionarios.
 */

import { generateOpenAIEmbedding, cosineSimilarity } from '@/lib/memory/openai-embeddings';
import { getProfileEmbeddings, hasProfileEmbeddings, generateProfileEmbeddings } from './profile-embeddings';
import { createLogger } from '@/lib/logger';

const log = createLogger('CommandDetector');

interface CommandMatch {
  command: string;
  score: number;
  confidence: 'high' | 'medium' | 'low' | 'none';
}

interface DetectionResult {
  matches: CommandMatch[];
  topMatch: CommandMatch | null;
  queryEmbedding: number[];
  detectionTimeMs: number;
}

// Thresholds para clasificación de confianza
const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.75,    // Muy relevante
  MEDIUM: 0.65,  // Posiblemente relevante
  LOW: 0.50,     // Tal vez relevante (optimizado para queries naturales)
};

/**
 * Detectar comandos relevantes para una query del usuario
 */
export async function detectRelevantCommands(
  userQuery: string,
  agentId: string,
  options: {
    topN?: number;           // Cuántos comandos retornar (default: 1)
    minScore?: number;       // Score mínimo para considerar (default: 0.65)
    ensureGenerated?: boolean; // Generar embeddings si no existen (default: true)
  } = {}
): Promise<DetectionResult> {
  const {
    topN = 1,
    minScore = CONFIDENCE_THRESHOLDS.MEDIUM,
    ensureGenerated = true,
  } = options;

  const startTime = Date.now();

  try {
    // Verificar si existen embeddings del profile
    const hasEmbeddings = await hasProfileEmbeddings(agentId);

    if (!hasEmbeddings) {
      if (ensureGenerated) {
        log.info({ agentId }, 'Profile embeddings no existen, generando...');
        await generateProfileEmbeddings(agentId);
      } else {
        log.warn({ agentId }, 'Profile embeddings no existen');
        return {
          matches: [],
          topMatch: null,
          queryEmbedding: [],
          detectionTimeMs: Date.now() - startTime,
        };
      }
    }

    // Generar embedding de la query del usuario
    const queryEmbedding = await generateOpenAIEmbedding(userQuery);

    // Obtener embeddings del profile
    const profileEmbeddings = await getProfileEmbeddings(agentId);

    if (profileEmbeddings.length === 0) {
      log.warn({ agentId }, 'No hay embeddings de profile disponibles');
      return {
        matches: [],
        topMatch: null,
        queryEmbedding,
        detectionTimeMs: Date.now() - startTime,
      };
    }

    // Calcular similitud con cada comando
    const matches: CommandMatch[] = profileEmbeddings
      .map(section => {
        const score = cosineSimilarity(queryEmbedding, section.embedding);
        const confidence = getConfidenceLevel(score);

        return {
          command: section.command,
          score,
          confidence,
        };
      })
      .filter(match => match.score >= minScore) // Filtrar por score mínimo
      .sort((a, b) => b.score - a.score) // Ordenar por score descendente
      .slice(0, topN); // Tomar top N

    const topMatch = matches.length > 0 ? matches[0] : null;

    const detectionTime = Date.now() - startTime;

    log.debug(
      {
        agentId,
        query: userQuery.substring(0, 50),
        matchCount: matches.length,
        topCommand: topMatch?.command,
        topScore: topMatch?.score,
        timeMs: detectionTime,
      },
      'Comandos relevantes detectados'
    );

    return {
      matches,
      topMatch,
      queryEmbedding,
      detectionTimeMs: detectionTime,
    };
  } catch (error) {
    log.error({ error, agentId, query: userQuery.substring(0, 50) }, 'Error detectando comandos');

    // Retornar resultado vacío en caso de error
    return {
      matches: [],
      topMatch: null,
      queryEmbedding: [],
      detectionTimeMs: Date.now() - startTime,
    };
  }
}

/**
 * Determinar nivel de confianza basado en score de similitud
 */
function getConfidenceLevel(score: number): 'high' | 'medium' | 'low' | 'none' {
  if (score >= CONFIDENCE_THRESHOLDS.HIGH) return 'high';
  if (score >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium';
  if (score >= CONFIDENCE_THRESHOLDS.LOW) return 'low';
  return 'none';
}

/**
 * Función simplificada para obtener el comando más relevante
 */
export async function getTopRelevantCommand(
  userQuery: string,
  agentId: string
): Promise<string | null> {
  const result = await detectRelevantCommands(userQuery, agentId, {
    topN: 1,
    minScore: CONFIDENCE_THRESHOLDS.MEDIUM,
  });

  return result.topMatch?.command || null;
}

/**
 * Función para obtener múltiples comandos relevantes (útil para queries complejas)
 */
export async function getMultipleRelevantCommands(
  userQuery: string,
  agentId: string,
  maxCommands: number = 3
): Promise<string[]> {
  const result = await detectRelevantCommands(userQuery, agentId, {
    topN: maxCommands,
    minScore: CONFIDENCE_THRESHOLDS.MEDIUM,
  });

  return result.matches.map(m => m.command);
}

/**
 * Formatear resultado para logging/debugging
 */
export function formatDetectionResult(result: DetectionResult): string {
  if (result.matches.length === 0) {
    return 'No se encontraron comandos relevantes';
  }

  const lines = ['Comandos relevantes detectados:'];
  result.matches.forEach((match, idx) => {
    const emoji = match.confidence === 'high' ? '✅' : match.confidence === 'medium' ? '🤔' : '⚠️';
    lines.push(`  ${idx + 1}. ${emoji} ${match.command} (score: ${match.score.toFixed(3)}, ${match.confidence})`);
  });
  lines.push(`Tiempo de detección: ${result.detectionTimeMs}ms`);

  return lines.join('\n');
}
