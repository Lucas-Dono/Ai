import { prisma } from "@/lib/prisma";

/**
 * Sistema de Topic Fatigue
 *
 * Previene que el personaje repita los mismos temas constantemente.
 * Si un tema se discute mucho, se marca como "fatigued" y se sugiere
 * al LLM que explore otros temas.
 *
 * Esto evita loops como:
 * - Personaje siempre habla del mismo hobby
 * - Siempre pregunta lo mismo
 * - Siempre cuenta las mismas anécdotas
 */

export interface TopicFatigueData {
  topic: string;
  mentions: number;
  lastMentionedAt: Date;
  fatigueLevel: number; // 0-1, qué tan fatigado está el tema
  shouldAvoid: boolean;
}

// Configuración de fatiga
const FATIGUE_CONFIG = {
  mentionsThreshold: 5, // Cuántas menciones antes de fatiga
  decayHours: 24, // Horas para que baje la fatiga
  maxFatiguedTopics: 10, // Máximo de temas fatigados a trackear
};

/**
 * Registra que se mencionó un tema en la conversación
 */
export async function recordTopicMention(
  agentId: string,
  userId: string,
  topic: string
): Promise<void> {
  const normalized = topic.toLowerCase().trim();

  await prisma.$executeRaw`
    INSERT INTO "TopicFatigue" (id, "agentId", "userId", topic, mentions, "lastMentionedAt", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), ${agentId}, ${userId}, ${normalized}, 1, NOW(), NOW(), NOW())
    ON CONFLICT ("agentId", "userId", topic)
    DO UPDATE SET
      mentions = "TopicFatigue".mentions + 1,
      "lastMentionedAt" = NOW(),
      "updatedAt" = NOW()
  `;
}

/**
 * Obtiene temas fatigados para esta conversación
 */
export async function getFatiguedTopics(
  agentId: string,
  userId: string
): Promise<TopicFatigueData[]> {
  const topics = await prisma.$queryRaw<
    Array<{
      topic: string;
      mentions: number;
      lastMentionedAt: Date;
    }>
  >`
    SELECT topic, mentions, "lastMentionedAt"
    FROM "TopicFatigue"
    WHERE "agentId" = ${agentId}
      AND "userId" = ${userId}
      AND mentions >= ${FATIGUE_CONFIG.mentionsThreshold}
    ORDER BY mentions DESC
    LIMIT ${FATIGUE_CONFIG.maxFatiguedTopics}
  `;

  // Calcular nivel de fatiga basado en menciones y tiempo
  const now = new Date();

  return topics.map((t) => {
    const hoursSinceLastMention =
      (now.getTime() - new Date(t.lastMentionedAt).getTime()) / (1000 * 60 * 60);

    // Decay exponencial: después de 24 horas, la fatiga se reduce a la mitad
    const decayFactor = Math.pow(0.5, hoursSinceLastMention / FATIGUE_CONFIG.decayHours);

    // Nivel de fatiga = (menciones - threshold) / 10, con decay
    const rawFatigue = (t.mentions - FATIGUE_CONFIG.mentionsThreshold) / 10;
    const fatigueLevel = Math.min(1, rawFatigue * decayFactor);

    return {
      topic: t.topic,
      mentions: t.mentions,
      lastMentionedAt: new Date(t.lastMentionedAt),
      fatigueLevel,
      shouldAvoid: fatigueLevel > 0.3, // Evitar si fatiga > 30%
    };
  });
}

/**
 * Genera contexto de fatiga para inyectar en el prompt
 */
export function generateFatigueContext(topics: TopicFatigueData[]): string {
  const fatigued = topics.filter((t) => t.shouldAvoid);

  if (fatigued.length === 0) {
    return "";
  }

  let context = "\n**Temas Recurrentes (Evitar):**\n";
  context += "Has notado que ya han hablado bastante sobre los siguientes temas:\n";

  for (const topic of fatigued) {
    context += `- ${topic.topic} (mencionado ${topic.mentions} veces)\n`;
  }

  context +=
    "\nTrata de explorar nuevos temas o ángulos diferentes. No evites estos temas por completo si el usuario los menciona, pero no seas tú quien los traiga a colación constantemente.\n";

  return context;
}

/**
 * Extrae temas mencionados en un mensaje usando análisis simple
 * (En el futuro, usar LLM o NLP más avanzado)
 */
export function extractTopics(message: string): string[] {
  const normalized = message.toLowerCase();

  // Palabras clave comunes que indican temas
  const topicKeywords: Record<string, RegExp> = {
    trabajo: /\b(trabajo|empleo|oficina|jefe|proyecto|reunión)\b/,
    familia: /\b(familia|mamá|papá|hermano|hermana|hijo|hija|padres)\b/,
    relaciones: /\b(pareja|novio|novia|esposo|esposa|cita|amor)\b/,
    salud: /\b(salud|ejercicio|gimnasio|dieta|médico|hospital)\b/,
    hobbies: /\b(hobby|pasatiempo|leer|jugar|videojuego|película|serie)\b/,
    viajes: /\b(viaje|viajar|vacaciones|turismo|país|ciudad)\b/,
    educación: /\b(estudio|universidad|carrera|examen|clase|profesor)\b/,
    tecnología: /\b(tecnología|computadora|celular|app|software|programar)\b/,
    deportes: /\b(deporte|fútbol|básquet|correr|entrenamiento)\b/,
    música: /\b(música|canción|banda|concierto|instrumento)\b/,
    comida: /\b(comida|cocinar|restaurante|receta|comer)\b/,
    dinero: /\b(dinero|plata|económico|financiero|banco|pagar)\b/,
  };

  const detected: string[] = [];

  for (const [topic, regex] of Object.entries(topicKeywords)) {
    if (regex.test(normalized)) {
      detected.push(topic);
    }
  }

  return detected;
}

/**
 * Procesa un mensaje para detectar y registrar temas
 */
export async function processMessageForTopics(
  agentId: string,
  userId: string,
  message: string
): Promise<void> {
  const topics = extractTopics(message);

  if (topics.length > 0) {
    await Promise.all(topics.map((topic) => recordTopicMention(agentId, userId, topic)));
  }
}

/**
 * Limpia temas muy antiguos que ya no son relevantes
 */
export async function cleanupOldTopics(agentId: string, userId: string): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 días

  await prisma.$executeRaw`
    DELETE FROM "TopicFatigue"
    WHERE "agentId" = ${agentId}
      AND "userId" = ${userId}
      AND "lastMentionedAt" < ${cutoffDate}
      AND mentions < ${FATIGUE_CONFIG.mentionsThreshold}
  `;
}

/**
 * Resetea la fatiga de un tema específico
 */
export async function resetTopicFatigue(
  agentId: string,
  userId: string,
  topic: string
): Promise<void> {
  await prisma.$executeRaw`
    DELETE FROM "TopicFatigue"
    WHERE "agentId" = ${agentId}
      AND "userId" = ${userId}
      AND topic = ${topic.toLowerCase()}
  `;
}
