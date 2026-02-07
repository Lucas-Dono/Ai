/**
 * TOPIC SUGGESTER
 *
 * Sugiere temas de conversación relevantes cuando la conversación
 * se estanca o el usuario parece no saber qué decir.
 *
 * Usa contexto de:
 * - Intereses del usuario (del perfil)
 * - Topics recientes
 * - Estado emocional
 * - Episodic memories
 *
 * Ejemplo:
 * Usuario: "no se de que hablar"
 * IA: "¿Qué tal si me contás cómo va ese proyecto de programación que mencionaste?"
 */

import { prisma } from "@/lib/prisma";
import type { PlutchikEmotionState } from "@/lib/emotions/plutchik";
import type { UnresolvedTopic } from "./follow-up-tracker";

export interface TopicSuggestion {
  topic: string;
  reason: string;
  source: "interests" | "unresolved" | "recent" | "emotional" | "random";
  priority: number; // 0-1
}

/**
 * Patrones que indican que el usuario necesita ayuda con el tema
 */
const TOPIC_HELP_PATTERNS = [
  /no s[eé] (de )?qu[eé] (hablar|decir|contar)/i,
  /aburrido/i,
  /no hay nada (que|de) (hablar|decir)/i,
  /qu[eé] hacemos/i,
  /de qu[eé] hablamos/i,
  /estoy aburrido/i,
];

/**
 * Topics genéricos según estado emocional
 */
const EMOTION_BASED_TOPICS = {
  joy: [
    "¿Qué cosas te hacen feliz últimamente?",
    "Contame algo bueno que te pasó esta semana",
    "¿Qué es lo mejor que te pasó hoy?",
  ],
  sadness: [
    "¿Querés hablar de lo que te está pasando?",
    "¿Hay algo que te preocupe?",
    "¿Cómo te sentís realmente?",
  ],
  anger: [
    "¿Algo te molestó hoy?",
    "¿Hay algo que necesites sacar?",
    "Parece que algo te frustró, ¿querés hablar de eso?",
  ],
  fear: [
    "¿Hay algo que te preocupe?",
    "¿Qué es lo que te tiene nervioso/a?",
    "¿Te puedo ayudar con algo?",
  ],
  anticipation: [
    "¿Qué planes tenés para hoy/esta semana?",
    "¿Hay algo que estés esperando con ganas?",
    "¿Qué te gustaría hacer próximamente?",
  ],
  trust: [
    "¿Cómo van las cosas con tu familia/amigos?",
    "Contame algo sobre las personas importantes en tu vida",
    "¿Hay alguien que te haya ayudado mucho últimamente?",
  ],
  surprise: [
    "¿Te pasó algo inesperado últimamente?",
    "¿Descubriste algo nuevo que te sorprendió?",
    "¿Alguna novedad interesante?",
  ],
  disgust: [
    "¿Hay algo que no te guste últimamente?",
    "¿Algo te molesta o te cae mal?",
    "¿Querés hablar de lo que te disgusta?",
  ],
};

/**
 * Topics genéricos de fallback
 */
const GENERIC_TOPICS = [
  "¿Qué estuviste haciendo últimamente?",
  "¿Cómo estuvo tu día?",
  "¿Hay algo nuevo en tu vida?",
  "¿Qué planes tenés para hoy?",
  "¿Viste algo interesante últimamente?",
  "¿Cómo va todo en general?",
];

export class TopicSuggester {
  /**
   * Detecta si el usuario necesita ayuda con el tema
   */
  needsTopicSuggestion(message: string): boolean {
    return TOPIC_HELP_PATTERNS.some((pattern) => pattern.test(message));
  }

  /**
   * Sugiere un tema de conversación
   */
  async suggestTopic(
    agentId: string,
    userId: string,
    userMessage?: string
  ): Promise<TopicSuggestion> {
    const suggestions: TopicSuggestion[] = [];

    // 1. Sugerir basado en topics sin resolver
    const unresolvedSuggestions = await this.suggestFromUnresolved(
      agentId,
      userId
    );
    suggestions.push(...unresolvedSuggestions);

    // 2. Sugerir basado en intereses del usuario
    const interestSuggestions = await this.suggestFromInterests(userId);
    suggestions.push(...interestSuggestions);

    // 3. Sugerir basado en conversaciones recientes
    const recentSuggestions = await this.suggestFromRecentTopics(
      agentId,
      userId
    );
    suggestions.push(...recentSuggestions);

    // 4. Sugerir basado en estado emocional
    const emotionalSuggestions = await this.suggestFromEmotionalState(agentId);
    suggestions.push(...emotionalSuggestions);

    // 5. Fallback: topic genérico
    if (suggestions.length === 0) {
      suggestions.push({
        topic: GENERIC_TOPICS[Math.floor(Math.random() * GENERIC_TOPICS.length)],
        reason: "Topic genérico de conversación",
        source: "random",
        priority: 0.3,
      });
    }

    // Ordenar por prioridad y retornar el mejor
    suggestions.sort((a, b) => b.priority - a.priority);

    return suggestions[0];
  }

  /**
   * Sugiere topics basados en temas sin resolver
   */
  private async suggestFromUnresolved(
    agentId: string,
    userId: string
  ): Promise<TopicSuggestion[]> {
    const internalState = await prisma.internalState.findUnique({
      where: { agentId },
    });

    if (!internalState) return [];

    const unresolvedTopics = (internalState.conversationBuffer as any[]) || [];

    const suggestions: TopicSuggestion[] = [];

    for (const topic of unresolvedTopics) {
      const unresolvedTopic = topic as UnresolvedTopic;

      if (unresolvedTopic.resolved) continue;
      if (unresolvedTopic.followUpAttempts >= 2) continue;

      // Calcular prioridad según importancia y tiempo
      const daysSinceMention =
        (Date.now() - new Date(unresolvedTopic.mentionedAt).getTime()) /
        (1000 * 60 * 60 * 24);

      let priority = unresolvedTopic.importance;

      // Aumentar prioridad si ya pasó la fecha esperada
      if (unresolvedTopic.expectedResolutionDate) {
        const expectedDate = new Date(unresolvedTopic.expectedResolutionDate);
        if (Date.now() >= expectedDate.getTime()) {
          priority += 0.2;
        }
      }

      // Aumentar prioridad si pasó mucho tiempo
      if (daysSinceMention >= 7) priority += 0.1;

      suggestions.push({
        topic: `Por cierto, ¿cómo va lo de ${unresolvedTopic.topic}?`,
        reason: `Topic sin resolver (${unresolvedTopic.category})`,
        source: "unresolved",
        priority: Math.min(1.0, priority),
      });
    }

    return suggestions;
  }

  /**
   * Sugiere topics basados en intereses del usuario
   */
  private async suggestFromInterests(userId: string): Promise<TopicSuggestion[]> {
    // Obtener perfil del usuario con sus intereses
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!userProfile || !userProfile.favoriteTags) return [];

    const interests = userProfile.favoriteTags as string[];

    if (interests.length === 0) return [];

    // Seleccionar un interés aleatorio
    const randomInterest = interests[Math.floor(Math.random() * interests.length)];

    return [
      {
        topic: `¿Cómo va todo con ${randomInterest}?`,
        reason: "Basado en intereses del usuario",
        source: "interests",
        priority: 0.7,
      },
    ];
  }

  /**
   * Sugiere topics basados en conversaciones recientes
   */
  private async suggestFromRecentTopics(
    agentId: string,
    userId: string
  ): Promise<TopicSuggestion[]> {
    // Obtener últimos 10 mensajes del usuario
    const recentMessages = await prisma.message.findMany({
      where: {
        agentId,
        userId,
        role: "user",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    if (recentMessages.length === 0) return [];

    // Extraer keywords más mencionadas (simple heuristic)
    const wordFrequency: Record<string, number> = {};

    for (const message of recentMessages) {
      const words = message.content
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 4); // Solo palabras de 5+ caracteres

      for (const word of words) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    }

    // Ordenar por frecuencia
    const sortedWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (sortedWords.length === 0) return [];

    const topWord = sortedWords[0][0];

    return [
      {
        topic: `¿Cómo va todo con ${topWord}?`,
        reason: "Topic mencionado recientemente",
        source: "recent",
        priority: 0.6,
      },
    ];
  }

  /**
   * Sugiere topics basados en estado emocional del agente
   */
  private async suggestFromEmotionalState(
    agentId: string
  ): Promise<TopicSuggestion[]> {
    const internalState = await prisma.internalState.findUnique({
      where: { agentId },
    });

    if (!internalState) return [];

    const emotionalState = internalState.currentEmotions as unknown as PlutchikEmotionState;

    // Encontrar emoción dominante
    const emotions: Array<{
      emotion: keyof PlutchikEmotionState;
      intensity: number;
    }> = [
      { emotion: "joy", intensity: emotionalState.joy },
      { emotion: "trust", intensity: emotionalState.trust },
      { emotion: "fear", intensity: emotionalState.fear },
      { emotion: "surprise", intensity: emotionalState.surprise },
      { emotion: "sadness", intensity: emotionalState.sadness },
      { emotion: "disgust", intensity: emotionalState.disgust },
      { emotion: "anger", intensity: emotionalState.anger },
      { emotion: "anticipation", intensity: emotionalState.anticipation },
    ];

    emotions.sort((a, b) => b.intensity - a.intensity);

    const dominantEmotion = emotions[0].emotion as keyof typeof EMOTION_BASED_TOPICS;
    const dominantIntensity = emotions[0].intensity;

    // Solo sugerir si la emoción dominante es significativa (> 0.6)
    if (dominantIntensity < 0.6) return [];

    const templates = EMOTION_BASED_TOPICS[dominantEmotion];
    const randomTemplate =
      templates[Math.floor(Math.random() * templates.length)];

    return [
      {
        topic: randomTemplate,
        reason: `Basado en emoción dominante (${dominantEmotion})`,
        source: "emotional",
        priority: dominantIntensity,
      },
    ];
  }

  /**
   * API conveniente: Genera respuesta completa con topic sugerido
   */
  async generateTopicSuggestionResponse(
    agentId: string,
    userId: string,
    userMessage: string
  ): Promise<string> {
    const suggestion = await this.suggestTopic(agentId, userId, userMessage);

    console.log(
      `[TopicSuggester] Sugerencia: "${suggestion.topic}" (source: ${suggestion.source}, priority: ${suggestion.priority.toFixed(2)})`
    );

    // Generar respuesta natural
    const responses = [
      `Hmm, ${suggestion.topic}`,
      `¿Y si hablamos de algo? ${suggestion.topic}`,
      `${suggestion.topic}`,
      `Dale, ${suggestion.topic.toLowerCase()}`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}

/**
 * Singleton instance
 */
export const topicSuggester = new TopicSuggester();
