/**
 * FOLLOW-UP TRACKER
 *
 * Trackea topics sin resolver mencionados por el usuario
 * para hacer follow-up después.
 *
 * Ejemplo:
 * Usuario: "Mañana tengo una entrevista importante"
 * [3 mensajes después]
 * IA: "Por cierto, ¿cómo te fue en la entrevista?"
 */

import { prisma } from "@/lib/prisma";

export interface UnresolvedTopic {
  id: string;
  agentId: string;
  userId: string;
  topic: string;
  originalMessage: string;
  mentionedAt: Date;
  expectedResolutionDate?: Date;
  importance: number; // 0-1
  category: "event" | "problem" | "plan" | "question" | "feeling";
  resolved: boolean;
  resolvedAt?: Date;
  followUpAttempts: number;
}

export interface TopicDetectionResult {
  hasUnresolvedTopic: boolean;
  topic?: string;
  category?: UnresolvedTopic["category"];
  importance?: number;
  expectedResolutionDate?: Date;
}

/**
 * Patrones para detectar topics sin resolver
 */
const UNRESOLVED_PATTERNS = [
  // Eventos futuros
  {
    pattern: /(mañana|pasado mañana|la semana que viene|el próximo|dentro de|en \d+ días?) .*(tengo|voy a|iré|haré)/i,
    category: "event" as const,
    importance: 0.8,
    getDaysUntil: (match: string) => {
      if (/mañana/i.test(match)) return 1;
      if (/pasado mañana/i.test(match)) return 2;
      if (/la semana que viene/i.test(match)) return 7;
      if (/el próximo/i.test(match)) return 7;
      const daysMatch = match.match(/en (\d+) días?/i);
      if (daysMatch) return parseInt(daysMatch[1]);
      return 7;
    },
  },

  // Problemas pendientes
  {
    pattern: /(tengo que|debo|necesito) (resolver|arreglar|hablar con|decidir|solucionar)/i,
    category: "problem" as const,
    importance: 0.7,
    getDaysUntil: () => 3, // Seguir en 3 días
  },

  // Planes
  {
    pattern: /(estoy pensando en|voy a|planeo|quiero) (hacer|ir|comprar|empezar|comenzar)/i,
    category: "plan" as const,
    importance: 0.6,
    getDaysUntil: () => 7,
  },

  // Preguntas sin responder
  {
    pattern: /(me pregunto|no sé si|debería|qué hago con)/i,
    category: "question" as const,
    importance: 0.5,
    getDaysUntil: () => 2,
  },

  // Sentimientos que requieren seguimiento
  {
    pattern: /(me siento|estoy) (muy )?(triste|ansioso|preocupado|estresado|abrumado)/i,
    category: "feeling" as const,
    importance: 0.8,
    getDaysUntil: () => 1, // Seguir al día siguiente
  },
];

export class FollowUpTracker {
  /**
   * Analiza un mensaje para detectar topics sin resolver
   */
  detectUnresolvedTopic(message: string): TopicDetectionResult {
    for (const patternDef of UNRESOLVED_PATTERNS) {
      const match = message.match(patternDef.pattern);

      if (match) {
        // Extraer el topic específico (todo el mensaje o la parte relevante)
        const topic = match[0]; // Usar el match completo como topic

        // Calcular fecha esperada de resolución
        const daysUntil = patternDef.getDaysUntil(message);
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() + daysUntil);

        return {
          hasUnresolvedTopic: true,
          topic,
          category: patternDef.category,
          importance: patternDef.importance,
          expectedResolutionDate: expectedDate,
        };
      }
    }

    return { hasUnresolvedTopic: false };
  }

  /**
   * Guarda un topic sin resolver
   */
  async trackUnresolvedTopic(
    agentId: string,
    userId: string,
    message: string,
    detection: TopicDetectionResult
  ): Promise<UnresolvedTopic | null> {
    if (!detection.hasUnresolvedTopic || !detection.topic) {
      return null;
    }

    // Guardar en metadata de un mensaje o en una tabla custom
    // Por ahora lo guardamos como metadata en el InternalState
    const internalState = await prisma.internalState.findUnique({
      where: { agentId },
    });

    if (!internalState) return null;

    const unresolvedTopics = (internalState.conversationBuffer as any[]) || [];

    const newTopic: UnresolvedTopic = {
      id: `topic-${Date.now()}`,
      agentId,
      userId,
      topic: detection.topic,
      originalMessage: message,
      mentionedAt: new Date(),
      expectedResolutionDate: detection.expectedResolutionDate,
      importance: detection.importance || 0.5,
      category: detection.category || "event",
      resolved: false,
      followUpAttempts: 0,
    };

    // Agregar al buffer (limitado a últimos 10)
    const updatedTopics = [...unresolvedTopics, newTopic].slice(-10);

    await prisma.internalState.update({
      where: { agentId },
      data: {
        conversationBuffer: updatedTopics as any,
      },
    });

    console.log(`[FollowUpTracker] Tracked unresolved topic: "${detection.topic}" (${detection.category})`);

    return newTopic;
  }

  /**
   * Obtiene topics pendientes de follow-up
   */
  async getTopicsForFollowUp(
    agentId: string,
    currentDate: Date = new Date()
  ): Promise<UnresolvedTopic[]> {
    const internalState = await prisma.internalState.findUnique({
      where: { agentId },
    });

    if (!internalState) return [];

    const unresolvedTopics = (internalState.conversationBuffer as any[]) || [];

    // Filtrar topics que:
    // 1. No están resueltos
    // 2. Ya pasó la fecha esperada de resolución
    // 3. No se han intentado más de 2 veces
    return unresolvedTopics.filter((topic: UnresolvedTopic) => {
      if (topic.resolved) return false;
      if (topic.followUpAttempts >= 2) return false; // Max 2 intentos

      if (topic.expectedResolutionDate) {
        const expectedDate = new Date(topic.expectedResolutionDate);
        return currentDate >= expectedDate;
      }

      // Si no hay fecha esperada, hacer follow-up después de 3 días
      const daysSinceMention =
        (currentDate.getTime() - new Date(topic.mentionedAt).getTime()) /
        (1000 * 60 * 60 * 24);

      return daysSinceMention >= 3;
    });
  }

  /**
   * Genera pregunta de follow-up para un topic
   */
  generateFollowUpQuestion(topic: UnresolvedTopic): string {
    const templates = {
      event: [
        `Por cierto, ¿cómo te fue con ${topic.topic}?`,
        `Acordate que me contaste sobre ${topic.topic}, ¿cómo salió?`,
        `¿Ya pasó lo de ${topic.topic}? ¿Cómo te fue?`,
      ],
      problem: [
        `¿Pudiste resolver lo de ${topic.topic}?`,
        `¿Cómo va el tema de ${topic.topic}?`,
        `¿Avanzaste con ${topic.topic}?`,
      ],
      plan: [
        `¿Seguís con la idea de ${topic.topic}?`,
        `¿Cómo va eso de ${topic.topic}?`,
        `¿Arrancaste con ${topic.topic}?`,
      ],
      question: [
        `¿Ya decidiste sobre ${topic.topic}?`,
        `¿Pensaste más en ${topic.topic}?`,
        `¿Llegaste a alguna conclusión sobre ${topic.topic}?`,
      ],
      feeling: [
        `¿Cómo te sentís ahora? La otra vez me dijiste que ${topic.topic}`,
        `¿Seguís ${topic.topic.toLowerCase()}?`,
        `¿Estás mejor? Me preocupó cuando me dijiste que ${topic.topic}`,
      ],
    };

    const categoryTemplates = templates[topic.category];
    const randomTemplate =
      categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];

    return randomTemplate;
  }

  /**
   * Marca un topic como intentado (incrementa contador)
   */
  async markFollowUpAttempt(agentId: string, topicId: string): Promise<void> {
    const internalState = await prisma.internalState.findUnique({
      where: { agentId },
    });

    if (!internalState) return;

    const unresolvedTopics = (internalState.conversationBuffer as any[]) || [];

    const updatedTopics = unresolvedTopics.map((topic: UnresolvedTopic) => {
      if (topic.id === topicId) {
        return {
          ...topic,
          followUpAttempts: topic.followUpAttempts + 1,
        };
      }
      return topic;
    });

    await prisma.internalState.update({
      where: { agentId },
      data: {
        conversationBuffer: updatedTopics as any,
      },
    });
  }

  /**
   * Marca un topic como resuelto
   */
  async resolveTopic(agentId: string, topicId: string): Promise<void> {
    const internalState = await prisma.internalState.findUnique({
      where: { agentId },
    });

    if (!internalState) return;

    const unresolvedTopics = (internalState.conversationBuffer as any[]) || [];

    const updatedTopics = unresolvedTopics.map((topic: UnresolvedTopic) => {
      if (topic.id === topicId) {
        return {
          ...topic,
          resolved: true,
          resolvedAt: new Date(),
        };
      }
      return topic;
    });

    await prisma.internalState.update({
      where: { agentId },
      data: {
        conversationBuffer: updatedTopics as any,
      },
    });

    console.log(`[FollowUpTracker] Topic resolved: ${topicId}`);
  }

  /**
   * Detecta si el mensaje actual responde a un topic pendiente
   */
  async detectTopicResolution(
    agentId: string,
    message: string
  ): Promise<UnresolvedTopic | null> {
    const topics = await this.getTopicsForFollowUp(agentId);

    // Buscar si el mensaje menciona algún topic pendiente
    for (const topic of topics) {
      const topicKeywords = topic.topic.toLowerCase().split(" ").filter(w => w.length > 3);

      let matchCount = 0;
      for (const keyword of topicKeywords) {
        if (message.toLowerCase().includes(keyword)) {
          matchCount++;
        }
      }

      // Si menciona al menos 2 keywords del topic, considerar resuelto
      if (matchCount >= 2) {
        await this.resolveTopic(agentId, topic.id);
        return topic;
      }
    }

    return null;
  }
}

/**
 * Singleton instance
 */
export const followUpTracker = new FollowUpTracker();
