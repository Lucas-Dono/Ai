/**
 * KNOWLEDGE AUTO-DETECTOR
 *
 * Detecta automáticamente cuándo cargar knowledge groups basándose
 * en el contenido del mensaje del usuario, sin esperar a que la IA
 * solicite comandos explícitamente.
 *
 * Funciona mediante:
 * - Análisis de keywords en el mensaje
 * - Matching de patrones contextuales
 * - Frecuencia de menciones de temas
 *
 * Ejemplo:
 * Usuario: "Cuéntame sobre tu infancia"
 * Sistema: [AUTO-DETECTA knowledge group "Backstory/Childhood"]
 * → Carga automáticamente sin necesidad de /remember
 *
 * USO:
 * import { knowledgeAutoDetector } from "@/lib/profile/knowledge-auto-detector";
 *
 * const detectedGroups = await knowledgeAutoDetector.detectRelevantKnowledge(
 *   agentId,
 *   userMessage
 * );
 */

import { prisma } from "@/lib/prisma";

export interface KnowledgeDetectionResult {
  groupId: string;
  groupName: string;
  confidence: number; // 0-1
  reason: string;
  matchedKeywords: string[];
}

/**
 * Patrones de detección para diferentes tipos de knowledge
 */
interface DetectionPattern {
  keywords: string[];
  patterns: RegExp[];
  minConfidence: number;
  description: string;
}

/**
 * Categorías comunes de knowledge con sus patrones
 */
const COMMON_KNOWLEDGE_PATTERNS: Record<string, DetectionPattern> = {
  // Backstory / Historia personal
  backstory: {
    keywords: [
      "infancia",
      "niñez",
      "familia",
      "padres",
      "hermanos",
      "crecer",
      "crianza",
      "pasado",
      "historia",
      "origen",
      "naciste",
      "nacido",
      "creciste",
      "vivías",
    ],
    patterns: [
      /cu[aá]ntame (sobre|de) (tu|vos)/i,
      /(c[oó]mo|d[oó]nde) (creciste|te criaste)/i,
      /tu (infancia|ni[ñn]ez|familia)/i,
      /(qu[ée]|qui[ée]n) (son|eran) tus (padres|hermanos)/i,
    ],
    minConfidence: 0.6,
    description: "Historia personal y familia",
  },

  // Personality / Personalidad
  personality: {
    keywords: [
      "personalidad",
      "carácter",
      "eres",
      "tipo de persona",
      "comportamiento",
      "actitud",
      "manera de ser",
      "forma de ser",
    ],
    patterns: [
      /c[oó]mo eres/i,
      /qu[eé] tipo de persona/i,
      /cu[aá]l es tu (personalidad|car[aá]cter)/i,
      /te (describes|consideras)/i,
    ],
    minConfidence: 0.7,
    description: "Rasgos de personalidad",
  },

  // Hobbies / Intereses
  hobbies: {
    keywords: [
      "hobbies",
      "pasatiempos",
      "gusta",
      "intereses",
      "aficiones",
      "tiempo libre",
      "hacer",
      "diversión",
      "entretenimiento",
    ],
    patterns: [
      /qu[eé] te gusta (hacer|jugar|ver)/i,
      /(cu[aá]les son|tienes) (hobbies|pasatiempos)/i,
      /qu[eé] hac[eé]s en tu tiempo libre/i,
      /te (interesa|divierte|entretiene)/i,
    ],
    minConfidence: 0.6,
    description: "Hobbies e intereses",
  },

  // Goals / Objetivos
  goals: {
    keywords: [
      "objetivos",
      "metas",
      "sueños",
      "aspiraciones",
      "quieres lograr",
      "futuro",
      "planes",
      "ambiciones",
    ],
    patterns: [
      /(cu[aá]les son|tienes) (metas|objetivos|sue[ñn]os)/i,
      /qu[eé] (quieres|deseas) (lograr|alcanzar)/i,
      /tus (planes|aspiraciones) (para|de)/i,
    ],
    minConfidence: 0.7,
    description: "Metas y objetivos",
  },

  // Values / Valores
  values: {
    keywords: [
      "valores",
      "principios",
      "importante",
      "crees",
      "moral",
      "ética",
      "convicción",
    ],
    patterns: [
      /(qu[eé]|cu[aá]les) (valores|principios)/i,
      /qu[eé] es importante para (ti|vos)/i,
      /en qu[eé] crees/i,
    ],
    minConfidence: 0.7,
    description: "Valores y principios",
  },

  // Relationships / Relaciones
  relationships: {
    keywords: [
      "relaciones",
      "amigos",
      "pareja",
      "amor",
      "amistad",
      "novio",
      "novia",
      "ex",
      "citas",
    ],
    patterns: [
      /(tienes|tuviste) (novio|novia|pareja)/i,
      /tus (amigos|relaciones)/i,
      /qu[eé] buscas en (una pareja|el amor)/i,
    ],
    minConfidence: 0.6,
    description: "Relaciones personales",
  },

  // Career / Educación
  career: {
    keywords: [
      "trabajo",
      "carrera",
      "estudio",
      "universidad",
      "profesión",
      "educación",
      "empleo",
      "estudiar",
      "trabajar",
    ],
    patterns: [
      /(qu[eé]|d[oó]nde) (estudias|trabajas)/i,
      /tu (carrera|profesi[oó]n|trabajo)/i,
      /(a qu[eé]|qu[eé]) te dedicas/i,
    ],
    minConfidence: 0.7,
    description: "Carrera y educación",
  },

  // Fears / Miedos
  fears: {
    keywords: [
      "miedo",
      "temor",
      "fobia",
      "asusta",
      "pánico",
      "terror",
      "temes",
    ],
    patterns: [
      /qu[eé] te (da miedo|asusta|aterroriza)/i,
      /(tienes|tenes) (miedos|fobias)/i,
      /a qu[eé] le (temes|tem[eé]s)/i,
    ],
    minConfidence: 0.7,
    description: "Miedos y fobias",
  },

  // Preferences / Preferencias
  preferences: {
    keywords: [
      "preferido",
      "favorito",
      "gusta más",
      "prefieres",
      "mejor",
      "película",
      "libro",
      "comida",
      "color",
      "música",
    ],
    patterns: [
      /(cu[aá]l|qu[eé]) es tu (favorito|preferido)/i,
      /qu[eé] (pel[ií]cula|libro|comida|m[uú]sica) te gusta/i,
      /prefieres (el|la|los|las)/i,
    ],
    minConfidence: 0.5,
    description: "Preferencias personales",
  },
};

export class KnowledgeAutoDetector {
  /**
   * Detecta knowledge groups relevantes basándose en el mensaje del usuario
   */
  async detectRelevantKnowledge(
    agentId: string,
    userMessage: string
  ): Promise<KnowledgeDetectionResult[]> {
    // Obtener todos los knowledge groups del agente
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        knowledge: true,
      },
    });

    if (!agent || !agent.knowledge || agent.knowledge.length === 0) {
      return [];
    }

    const detections: KnowledgeDetectionResult[] = [];
    const lowerMessage = userMessage.toLowerCase();

    // Analizar cada knowledge group
    for (const knowledgeGroup of agent.knowledge) {
      const detection = this.analyzeKnowledgeGroup(
        knowledgeGroup,
        userMessage,
        lowerMessage
      );

      if (detection) {
        detections.push(detection);
      }
    }

    // Ordenar por confianza descendente
    detections.sort((a, b) => b.confidence - a.confidence);

    // Filtrar solo los que superan umbral mínimo (0.5)
    return detections.filter((d) => d.confidence >= 0.5);
  }

  /**
   * Analiza un knowledge group específico contra el mensaje
   */
  private analyzeKnowledgeGroup(
    knowledgeGroup: any,
    originalMessage: string,
    lowerMessage: string
  ): KnowledgeDetectionResult | null {
    let confidence = 0;
    const matchedKeywords: string[] = [];
    const reasons: string[] = [];

    // 1. Buscar patrones conocidos en el nombre del grupo
    const groupNameLower = knowledgeGroup.name.toLowerCase();

    for (const [category, pattern] of Object.entries(
      COMMON_KNOWLEDGE_PATTERNS
    )) {
      // Verificar si el nombre del grupo se relaciona con la categoría
      const categoryMatch =
        groupNameLower.includes(category) ||
        pattern.keywords.some((kw) => groupNameLower.includes(kw));

      if (categoryMatch) {
        // Verificar keywords
        for (const keyword of pattern.keywords) {
          if (lowerMessage.includes(keyword)) {
            confidence += 0.15;
            matchedKeywords.push(keyword);
          }
        }

        // Verificar patrones regex
        for (const regex of pattern.patterns) {
          if (regex.test(originalMessage)) {
            confidence += 0.25;
            reasons.push(`Patrón detectado: ${pattern.description}`);
          }
        }
      }
    }

    // 2. Analizar keywords en la descripción del knowledge group
    if (knowledgeGroup.description) {
      const descriptionWords = knowledgeGroup.description
        .toLowerCase()
        .split(/\s+/)
        .filter((w: string) => w.length > 4);

      for (const word of descriptionWords) {
        if (lowerMessage.includes(word)) {
          confidence += 0.1;
          if (!matchedKeywords.includes(word)) {
            matchedKeywords.push(word);
          }
        }
      }
    }

    // 3. Analizar keywords en el contenido (si existe)
    if (knowledgeGroup.content) {
      const contentPreview = knowledgeGroup.content
        .toLowerCase()
        .substring(0, 500);
      const contentWords = contentPreview
        .split(/\s+/)
        .filter((w: string) => w.length > 5);

      let contentMatches = 0;
      for (const word of contentWords) {
        if (lowerMessage.includes(word)) {
          contentMatches++;
        }
      }

      if (contentMatches > 0) {
        confidence += Math.min(0.3, contentMatches * 0.05);
        reasons.push(`${contentMatches} palabras del contenido coinciden`);
      }
    }

    // Clamp 0-1
    confidence = Math.max(0, Math.min(1, confidence));

    // Solo retornar si hay algún nivel de confianza
    if (confidence > 0) {
      return {
        groupId: knowledgeGroup.id,
        groupName: knowledgeGroup.name,
        confidence,
        reason: reasons.join(", ") || "Coincidencia de keywords",
        matchedKeywords: matchedKeywords.slice(0, 5), // Top 5
      };
    }

    return null;
  }

  /**
   * Carga automáticamente knowledge relevante y retorna el contenido
   */
  async autoLoadKnowledge(
    agentId: string,
    userMessage: string,
    maxGroups: number = 2
  ): Promise<{
    loadedGroups: KnowledgeDetectionResult[];
    combinedContent: string;
  }> {
    const detections = await this.detectRelevantKnowledge(agentId, userMessage);

    // Limitar a los N grupos más relevantes
    const topDetections = detections.slice(0, maxGroups);

    if (topDetections.length === 0) {
      return { loadedGroups: [], combinedContent: "" };
    }

    // Cargar contenido de los grupos
    const contents: string[] = [];

    for (const detection of topDetections) {
      const knowledgeGroup = await prisma.knowledge.findUnique({
        where: { id: detection.groupId },
      });

      if (knowledgeGroup && knowledgeGroup.content) {
        contents.push(
          `[Knowledge: ${detection.groupName}]\n${knowledgeGroup.content}`
        );
        console.log(
          `[KnowledgeAutoDetector] Auto-cargado: "${detection.groupName}" (confidence: ${(detection.confidence * 100).toFixed(0)}%)`
        );
      }
    }

    const combinedContent = contents.join("\n\n");

    return {
      loadedGroups: topDetections,
      combinedContent,
    };
  }

  /**
   * Verifica si el mensaje requiere knowledge (heuristic simple)
   */
  requiresKnowledge(userMessage: string): boolean {
    const lowerMessage = userMessage.toLowerCase();

    // Patrones que indican que el usuario está preguntando sobre el agente
    const questionPatterns = [
      /cu[aá]ntame (sobre|de|acerca de)/i,
      /qu[eé] (es|son|era|eran)/i,
      /c[oó]mo (eres|fuiste|fue)/i,
      /qui[eé]n (eres|es|era)/i,
      /d[oó]nde (viv[ií]as|naciste|creciste)/i,
      /cu[aá]l es tu/i,
      /tienes (alguna|algunos|alg[uú]n)/i,
      /\?/,
    ];

    return questionPatterns.some((pattern) => pattern.test(lowerMessage));
  }
}

/**
 * Singleton instance
 */
export const knowledgeAutoDetector = new KnowledgeAutoDetector();
