/**
 * COMPLEXITY ANALYZER
 *
 * Determina si un mensaje requiere procesamiento profundo (Orchestrator)
 * o puede manejarse con procesamiento rápido (Plutchik rule-based).
 *
 * Criterios basados en investigación de procesamiento cognitivo dual:
 * - Sistema 1: Rápido, automático, emocional (Fast Path)
 * - Sistema 2: Lento, deliberado, racional (Deep Path)
 */

export type MessageComplexity = "simple" | "complex";

export interface ComplexityAnalysisResult {
  complexity: MessageComplexity;
  score: number; // 0-1, donde 0 = simple y 1 = complejo
  reasons: string[];
  recommendedPath: "fast" | "deep";
}

/**
 * Keywords que indican complejidad emocional
 */
const EMOTIONAL_KEYWORDS = [
  // Emociones negativas intensas
  "triste", "deprimido", "devastado", "destrozado", "roto",
  "ansioso", "angustiado", "aterrado", "pánico", "terror",
  "enojado", "furioso", "indignado", "frustrado", "harto",
  "culpable", "avergonzado", "arrepentido", "remordimiento",

  // Problemas y crisis
  "problema", "crisis", "ayuda", "necesito", "socorro",
  "mal", "terrible", "horrible", "desastre", "catástrofe",

  // Decisiones y dilemas
  "decidir", "dilema", "conflicto", "duda", "confundido",
  "no sé qué hacer", "qué debería", "consejo", "opinión",

  // Relaciones y conflictos sociales
  "pelea", "discusión", "conflicto", "rompí", "terminé",
  "traición", "engaño", "mentira", "desilusión",

  // Pérdidas y duelos
  "perdí", "murió", "falleció", "terminó", "acabó",
  "dejó", "abandonó", "rechazó",

  // Trabajo y finanzas
  "despedido", "renuncié", "desempleado", "quebré", "deuda",

  // Salud mental
  "depresión", "ansiedad", "trastorno", "terapia", "psicólogo",
  "suicida", "autolesión", "adicción",
];

/**
 * Patrones sintácticos que indican complejidad
 */
const COMPLEXITY_PATTERNS = [
  // Preguntas sobre decisiones
  /¿(debería|debo|tengo que|puedo|es correcto)/i,
  /¿qué (hacer|hago|haría|harías)/i,

  // Condicionales complejos
  /si (hubiera|hubiese|tuviera|pudiera).*entonces/i,
  /por un lado.*por otro lado/i,

  // Expresiones de conflicto interno
  /no sé si/i,
  /me siento (confundido|perdido|dividido)/i,
  /parte de mí.*pero/i,

  // Referencias a valores y moralidad
  /es (correcto|incorrecto|justo|injusto|moral|inmoral)/i,
  /va contra (mis valores|mi ética|mis principios)/i,

  // Referencias temporales al pasado (memorias)
  /recuerdo (cuando|que)/i,
  /hace (días|semanas|meses|años)/i,
  /la otra vez/i,
  /antes (me dijiste|hablamos|mencionaste)/i,
];

/**
 * Salutaciones y reacciones simples
 */
const SIMPLE_PATTERNS = [
  /^(hola|hey|hi|buenas|buenos|qué tal|cómo estás?|cómo vas)[\s\?!]*$/i,
  /^(ja+|je+|ji+|lol|xd|jaja+|jeje+|jiji+|ajaj+)[\s!]*$/i,
  /^(ok|okay|vale|bien|sí|no|aja|ajá|uhm|mmm|ah|oh)[\s!.]*$/i,
  /^(wow|guau|genial|cool|nice|wtf)[\s!]*$/i,
  /^(gracias|thanks|thx|grax)[\s!]*$/i,
  /^(adiós|chau|bye|nos vemos|hasta luego)[\s!]*$/i,
  /^(👍|👌|😊|😄|😁|🙂|😢|😭|😡|❤️|💔)+$/,
];

export class ComplexityAnalyzer {
  /**
   * Analiza la complejidad de un mensaje
   */
  analyze(message: string): ComplexityAnalysisResult {
    const reasons: string[] = [];
    let complexityScore = 0.0;

    // 1. SIMPLE PATTERNS CHECK (early exit)
    for (const pattern of SIMPLE_PATTERNS) {
      if (pattern.test(message.trim())) {
        return {
          complexity: "simple",
          score: 0.0,
          reasons: ["Saludo o reacción simple detectada"],
          recommendedPath: "fast",
        };
      }
    }

    // 2. LONGITUD DEL MENSAJE
    const wordCount = message.trim().split(/\s+/).length;

    if (wordCount <= 3) {
      complexityScore += 0.0;
      reasons.push(`Mensaje muy corto (${wordCount} palabras)`);
    } else if (wordCount <= 10) {
      complexityScore += 0.2;
      reasons.push(`Mensaje corto (${wordCount} palabras)`);
    } else if (wordCount <= 30) {
      complexityScore += 0.4;
      reasons.push(`Mensaje moderado (${wordCount} palabras)`);
    } else {
      complexityScore += 0.6;
      reasons.push(`Mensaje largo (${wordCount} palabras) - requiere análisis profundo`);
    }

    // 3. KEYWORDS EMOCIONALES
    const lowerMessage = message.toLowerCase();
    let emotionalKeywordCount = 0;

    for (const keyword of EMOTIONAL_KEYWORDS) {
      if (lowerMessage.includes(keyword)) {
        emotionalKeywordCount++;
      }
    }

    if (emotionalKeywordCount > 0) {
      const emotionalScore = Math.min(0.8, emotionalKeywordCount * 0.3);
      complexityScore += emotionalScore;
      reasons.push(`${emotionalKeywordCount} keyword(s) emocional(es) detectado(s)`);
    }

    // 4. PATRONES SINTÁCTICOS COMPLEJOS
    let patternMatches = 0;

    for (const pattern of COMPLEXITY_PATTERNS) {
      if (pattern.test(message)) {
        patternMatches++;
      }
    }

    if (patternMatches > 0) {
      const patternScore = Math.min(0.7, patternMatches * 0.35);
      complexityScore += patternScore;
      reasons.push(`${patternMatches} patrón(es) de complejidad detectado(s)`);
    }

    // 5. PREGUNTAS (pueden requerir contexto)
    const questionMarks = (message.match(/[\?¿]/g) || []).length;
    if (questionMarks > 0) {
      complexityScore += 0.2;
      reasons.push(`Contiene ${questionMarks} pregunta(s)`);
    }

    // 6. MULTIPLE SENTENCES (narrativa compleja)
    const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length >= 3) {
      complexityScore += 0.3;
      reasons.push(`Narrativa compleja (${sentences.length} oraciones)`);
    }

    // 7. MENCIONES A TERCEROS (situaciones sociales)
    const thirdPersonMentions = [
      /mi (mamá|papá|madre|padre|hermano|hermana|amigo|amiga|novio|novia|jefe|compañero)/i,
      /(él|ella|ellos|ellas) (dijo|hizo|me)/i,
    ];

    for (const pattern of thirdPersonMentions) {
      if (pattern.test(message)) {
        complexityScore += 0.2;
        reasons.push("Menciona terceros (situación social compleja)");
        break;
      }
    }

    // NORMALIZAR SCORE (0-1)
    complexityScore = Math.min(1.0, complexityScore);

    // DETERMINAR COMPLEJIDAD
    // Threshold: 0.5 - si supera esto, es complejo
    const complexity: MessageComplexity = complexityScore >= 0.5 ? "complex" : "simple";
    const recommendedPath = complexity === "complex" ? "deep" : "fast";

    return {
      complexity,
      score: complexityScore,
      reasons,
      recommendedPath,
    };
  }

  /**
   * Versión rápida que solo retorna el path recomendado
   */
  getRecommendedPath(message: string): "fast" | "deep" {
    return this.analyze(message).recommendedPath;
  }

  /**
   * Stats sobre distribución de complejidad (para analytics)
   */
  static getStats(messages: string[]): {
    total: number;
    simple: number;
    complex: number;
    simplePercentage: number;
    complexPercentage: number;
    averageScore: number;
  } {
    const analyzer = new ComplexityAnalyzer();
    let simpleCount = 0;
    let complexCount = 0;
    let totalScore = 0;

    for (const message of messages) {
      const result = analyzer.analyze(message);
      if (result.complexity === "simple") {
        simpleCount++;
      } else {
        complexCount++;
      }
      totalScore += result.score;
    }

    const total = messages.length;

    return {
      total,
      simple: simpleCount,
      complex: complexCount,
      simplePercentage: (simpleCount / total) * 100,
      complexPercentage: (complexCount / total) * 100,
      averageScore: totalScore / total,
    };
  }
}

/**
 * Singleton instance
 */
export const complexityAnalyzer = new ComplexityAnalyzer();
