/**
 * MEMORY QUERY DETECTOR
 *
 * Detecta cuando el usuario pregunta sobre memorias pasadas usando:
 * - Patrones lingüísticos específicos (regex)
 * - Keywords indicativos de consulta de memoria
 * - Análisis de contexto temporal
 *
 * EJEMPLOS DE QUERIES DETECTADAS:
 * - "¿recuerdas cuando...?"
 * - "¿te acuerdas de...?"
 * - "¿qué te dije sobre...?"
 * - "¿te conté que...?"
 * - "¿te mencioné...?"
 * - "dijiste que..."
 * - "hablamos de..."
 * - "la última vez que..."
 *
 * PERFORMANCE:
 * - Detection: <5ms (regex-based)
 * - Keyword extraction: <10ms (NLP básico)
 * - Total: <15ms overhead
 */

import { createLogger } from '@/lib/logger';

const log = createLogger('MemoryQueryDetector');

export interface MemoryQueryDetection {
  isMemoryQuery: boolean;
  confidence: number; // 0-1
  queryType: 'recall' | 'verification' | 'retrieval' | 'none';
  keywords: string[];
  temporalContext?: 'recent' | 'past' | 'specific';
  rawMatch?: string;
}

/**
 * Patrones de preguntas sobre memoria
 * Organizados por tipo de query
 */
const MEMORY_PATTERNS = {
  // RECALL: "¿Recuerdas...?"
  recall: [
    /¿?\s*recuerdas?\s+(cuando|que|cómo|cuál|cuándo|dónde|quién)\s+(.+)/i,
    /¿?\s*te\s+acuerdas?\s+(de|que|cómo|cuál|cuándo|dónde)?\s*(.+)/i,
    /¿?\s*sabes?\s+(lo\s+)?que\s+(.+)/i,
    /recordar[ás]?\s+(.+)/i,
  ],

  // VERIFICATION: "¿Te dije...?"
  verification: [
    /¿?\s*te\s+(dije|conté|comenté|mencioné)\s+(que|sobre|de)?\s*(.+)/i,
    /¿?\s*ya\s+te\s+(había\s+)?hablé\s+(de|sobre)\s+(.+)/i,
  ],

  // RETRIEVAL: "¿Qué te dije sobre...?"
  retrieval: [
    /¿?\s*(qué|cuál|cómo|cuándo|dónde|quién)\s+te\s+(dije|conté|comenté|mencioné)\s+(sobre|acerca\s+de|de|que)?\s*(.+)/i,
    /¿?\s*de\s+qué\s+(hablamos|hablé|conversamos)\s+(.+)/i,
  ],

  // PAST REFERENCE: Referencias directas al pasado
  pastReference: [
    /la\s+(última|primera)\s+vez\s+que\s+(.+)/i,
    /(dijiste|mencionaste|comentaste)\s+que\s+(.+)/i,
    /(hablamos|conversamos|charlamos)\s+(de|sobre)\s+(.+)/i,
    /cuando\s+te\s+(dije|conté|hablé|mencioné)\s+(.+)/i,
  ],
};

/**
 * Keywords que indican query de memoria
 */
const MEMORY_KEYWORDS = [
  // Verbos de memoria
  'recordar', 'recuerdas', 'recuerdo', 'acordar', 'acuerdas',

  // Verbos de comunicación pasada
  'dije', 'dijiste', 'conté', 'contaste', 'mencioné', 'mencionaste',
  'comenté', 'comentaste', 'hablé', 'hablaste', 'hablamos',

  // Marcadores temporales
  'antes', 'ayer', 'anoche', 'pasado', 'última', 'primera',
  'hace', 'cuando', 'aquel', 'aquella',
];

/**
 * Stop words para filtrar del keyword extraction
 */
const STOP_WORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'de', 'del', 'al', 'a', 'en', 'con', 'por', 'para',
  'que', 'qué', 'te', 'me', 'se', 'si',
  'y', 'o', 'pero', 'porque', 'como',
  'es', 'era', 'fue', 'ser', 'estar',
  'muy', 'más', 'menos', 'tan', 'tanto',
]);

export class MemoryQueryDetector {
  /**
   * Detecta si un mensaje es una query sobre memoria
   */
  detectMemoryQuery(message: string): MemoryQueryDetection {
    const startTime = Date.now();

    // Normalizar mensaje
    const normalizedMessage = this.normalizeMessage(message);

    // 1. CHECK: Patrones de RECALL
    const recallMatch = this.matchPatterns(normalizedMessage, MEMORY_PATTERNS.recall);
    if (recallMatch) {
      const keywords = this.extractKeywords(recallMatch.match);
      const temporal = this.detectTemporalContext(normalizedMessage);

      log.debug(
        { message: message.substring(0, 100), type: 'recall', confidence: 0.9, timeMs: Date.now() - startTime },
        'Memory query detected (recall)'
      );

      return {
        isMemoryQuery: true,
        confidence: 0.9,
        queryType: 'recall',
        keywords,
        temporalContext: temporal,
        rawMatch: recallMatch.match,
      };
    }

    // 2. CHECK: Patrones de VERIFICATION
    const verificationMatch = this.matchPatterns(normalizedMessage, MEMORY_PATTERNS.verification);
    if (verificationMatch) {
      const keywords = this.extractKeywords(verificationMatch.match);
      const temporal = this.detectTemporalContext(normalizedMessage);

      log.debug(
        { message: message.substring(0, 100), type: 'verification', confidence: 0.85, timeMs: Date.now() - startTime },
        'Memory query detected (verification)'
      );

      return {
        isMemoryQuery: true,
        confidence: 0.85,
        queryType: 'verification',
        keywords,
        temporalContext: temporal,
        rawMatch: verificationMatch.match,
      };
    }

    // 3. CHECK: Patrones de RETRIEVAL
    const retrievalMatch = this.matchPatterns(normalizedMessage, MEMORY_PATTERNS.retrieval);
    if (retrievalMatch) {
      const keywords = this.extractKeywords(retrievalMatch.match);
      const temporal = this.detectTemporalContext(normalizedMessage);

      log.debug(
        { message: message.substring(0, 100), type: 'retrieval', confidence: 0.95, timeMs: Date.now() - startTime },
        'Memory query detected (retrieval)'
      );

      return {
        isMemoryQuery: true,
        confidence: 0.95,
        queryType: 'retrieval',
        keywords,
        temporalContext: temporal,
        rawMatch: retrievalMatch.match,
      };
    }

    // 4. CHECK: Referencias al pasado
    const pastRefMatch = this.matchPatterns(normalizedMessage, MEMORY_PATTERNS.pastReference);
    if (pastRefMatch) {
      const keywords = this.extractKeywords(pastRefMatch.match);

      // Past references tienen menor confidence
      const keywordScore = this.calculateKeywordScore(normalizedMessage);
      const confidence = 0.6 + (keywordScore * 0.2); // 0.6-0.8 confidence

      if (confidence >= 0.65) {
        log.debug(
          { message: message.substring(0, 100), type: 'pastReference', confidence, timeMs: Date.now() - startTime },
          'Memory query detected (past reference)'
        );

        return {
          isMemoryQuery: true,
          confidence,
          queryType: 'recall',
          keywords,
          temporalContext: 'past',
          rawMatch: pastRefMatch.match,
        };
      }
    }

    // 5. FALLBACK: Keyword-based detection (baja confidence)
    const keywordScore = this.calculateKeywordScore(normalizedMessage);
    if (keywordScore >= 0.5) {
      const keywords = this.extractKeywords(normalizedMessage);

      log.debug(
        { message: message.substring(0, 100), keywordScore, timeMs: Date.now() - startTime },
        'Possible memory query detected (keyword-based)'
      );

      return {
        isMemoryQuery: true,
        confidence: 0.4 + (keywordScore * 0.2), // 0.4-0.6 confidence
        queryType: 'recall',
        keywords,
      };
    }

    // NO ES MEMORY QUERY
    const duration = Date.now() - startTime;
    if (duration > 5) {
      log.warn({ duration }, 'Memory query detection took longer than expected');
    }

    return {
      isMemoryQuery: false,
      confidence: 0,
      queryType: 'none',
      keywords: [],
    };
  }

  /**
   * Normaliza mensaje para matching
   */
  private normalizeMessage(message: string): string {
    return message
      .toLowerCase()
      .trim()
      // Normalizar signos de puntuación
      .replace(/[¿¡]/g, '')
      .replace(/\s+/g, ' ');
  }

  /**
   * Intenta hacer match con lista de patrones
   */
  private matchPatterns(
    message: string,
    patterns: RegExp[]
  ): { match: string; groups: string[] } | null {
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return {
          match: match[0],
          groups: match.slice(1).filter(Boolean),
        };
      }
    }
    return null;
  }

  /**
   * Extrae keywords relevantes del mensaje
   */
  private extractKeywords(text: string): string[] {
    // Tokenizar
    const tokens = text
      .toLowerCase()
      .replace(/[^\w\sáéíóúñü]/g, ' ') // Remover puntuación
      .split(/\s+/)
      .filter(Boolean);

    // Filtrar stop words y palabras cortas
    const keywords = tokens
      .filter(token =>
        token.length >= 3 &&
        !STOP_WORDS.has(token) &&
        !token.match(/^\d+$/) // No números puros
      )
      // Deduplicar
      .filter((token, index, arr) => arr.indexOf(token) === index)
      // Top 10 keywords
      .slice(0, 10);

    return keywords;
  }

  /**
   * Calcula score basado en keywords de memoria presentes
   */
  private calculateKeywordScore(message: string): number {
    const tokens = message
      .toLowerCase()
      .split(/\s+/);

    let matchCount = 0;
    for (const token of tokens) {
      for (const keyword of MEMORY_KEYWORDS) {
        if (token.includes(keyword) || keyword.includes(token)) {
          matchCount++;
          break;
        }
      }
    }

    return Math.min(matchCount / 3, 1.0); // Normalizar a 0-1
  }

  /**
   * Detecta contexto temporal en el mensaje
   */
  private detectTemporalContext(message: string): 'recent' | 'past' | 'specific' | undefined {
    // Temporal reciente
    if (message.match(/\b(hoy|ahora|hace\s+poco|hace\s+un\s+rato|recién|recientemente|esta\s+(mañana|tarde|noche))\b/i)) {
      return 'recent';
    }

    // Temporal específico
    if (message.match(/\b(ayer|anoche|anteanoche|hace\s+\d+|el\s+(lunes|martes|mi[ée]rcoles|jueves|viernes|s[áa]bado|domingo)|la\s+semana\s+pasada|el\s+mes\s+pasado)\b/i)) {
      return 'specific';
    }

    // Temporal pasado general
    if (message.match(/\b(antes|pasado|antigua?|anterior|previamente|tiempo\s+atr[áa]s|hace\s+tiempo)\b/i)) {
      return 'past';
    }

    return undefined;
  }

  /**
   * Extrae el tema/tópico principal de la query
   * Útil para refinar la búsqueda semántica
   */
  extractTopic(message: string, detection: MemoryQueryDetection): string {
    // Si hay match explícito, usar grupos capturados
    if (detection.rawMatch) {
      // Limpiar el match de marcadores temporales y verbos de memoria
      const cleaned = detection.rawMatch
        .replace(/¿|¡|\?/g, '')
        .replace(/\b(recuerdas?|te\s+acuerdas?|dije|dijiste|conté|contaste|mencioné|hablamos)\b/gi, '')
        .replace(/\b(que|de|sobre|cuando|si)\b/gi, '')
        .trim();

      if (cleaned.length > 0) {
        return cleaned;
      }
    }

    // Fallback: usar keywords principales
    if (detection.keywords.length > 0) {
      return detection.keywords.slice(0, 3).join(' ');
    }

    // Last resort: mensaje completo limpio
    return message
      .replace(/¿|¡|\?/g, '')
      .trim()
      .substring(0, 100);
  }
}

/**
 * Singleton instance
 */
export const memoryQueryDetector = new MemoryQueryDetector();

/**
 * Helper function para uso rápido
 */
export function detectMemoryQuery(message: string): MemoryQueryDetection {
  return memoryQueryDetector.detectMemoryQuery(message);
}
