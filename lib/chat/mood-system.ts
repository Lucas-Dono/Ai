import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

/**
 * Mood System Enhancement
 *
 * Mejora el sistema de estados emocionales (InternalState) con:
 * - Actualización dinámica del mood basado en la conversación
 * - Contexto de mood inyectado en prompts
 * - Tracking de historial de mood para variación realista
 * - Satisfacción de necesidades psicológicas
 *
 * PAD Model:
 * - Valence: -1 (negativo) a +1 (positivo)
 * - Arousal: 0 (calmado) a 1 (activado/excitado)
 * - Dominance: 0 (sumiso) a 1 (dominante/en control)
 */

export interface MoodState {
  valence: number;
  arousal: number;
  dominance: number;
  primaryEmotion: string;
  intensity: number;
}

export interface PsychologicalNeeds {
  connection: number; // 0-1
  autonomy: number;
  competence: number;
  novelty: number;
}

/**
 * Obtiene o inicializa el estado interno del agente
 */
export async function getOrCreateInternalState(agentId: string) {
  let state = await prisma.internalState.findUnique({
    where: { agentId },
  });

  if (!state) {
    state = await prisma.internalState.create({
      data: {
        id: nanoid(),
        agentId,
        currentEmotions: {},
        moodValence: 0.0,
        moodArousal: 0.5,
        moodDominance: 0.5,
        activeGoals: [],
        conversationBuffer: [],
        needConnection: 0.5,
        needAutonomy: 0.5,
        needCompetence: 0.5,
        needNovelty: 0.5,
      },
    });
  }

  return state;
}

/**
 * Actualiza el mood basado en el sentimiento del mensaje
 */
export async function updateMoodFromMessage(
  agentId: string,
  message: string,
  userSentiment: "positive" | "negative" | "neutral"
): Promise<MoodState> {
  const state = await getOrCreateInternalState(agentId);

  let valenceChange = 0;
  let arousalChange = 0;
  let dominanceChange = 0;

  // Ajustar mood basado en sentimiento
  switch (userSentiment) {
    case "positive":
      valenceChange = 0.1; // Más feliz
      arousalChange = 0.05; // Levemente más animado
      break;
    case "negative":
      valenceChange = -0.1; // Más triste/molesto
      arousalChange = 0.1; // Más agitado/activado
      dominanceChange = -0.05; // Menos en control
      break;
    case "neutral":
      // Decay hacia baseline
      valenceChange = state.moodValence * -0.05;
      arousalChange = (state.moodArousal - 0.5) * -0.1;
      break;
  }

  // Aplicar decay e inercia
  const decayRate = state.emotionDecayRate;
  const inertia = state.emotionInertia;

  const newValence = Math.max(
    -1,
    Math.min(1, state.moodValence * (1 - decayRate) + valenceChange * (1 - inertia))
  );
  const newArousal = Math.max(
    0,
    Math.min(1, state.moodArousal * (1 - decayRate * 0.5) + arousalChange * (1 - inertia))
  );
  const newDominance = Math.max(
    0,
    Math.min(1, state.moodDominance * (1 - decayRate * 0.3) + dominanceChange * (1 - inertia))
  );

  // Actualizar en DB
  await prisma.internalState.update({
    where: { agentId },
    data: {
      moodValence: newValence,
      moodArousal: newArousal,
      moodDominance: newDominance,
      lastUpdated: new Date(),
    },
  });

  return {
    valence: newValence,
    arousal: newArousal,
    dominance: newDominance,
    primaryEmotion: determinePrimaryEmotion(newValence, newArousal, newDominance),
    intensity: Math.abs(newValence) + newArousal,
  };
}

/**
 * Actualiza necesidades psicológicas basado en la conversación
 */
export async function updatePsychologicalNeeds(
  agentId: string,
  needsAffected: Partial<PsychologicalNeeds>
): Promise<void> {
  const state = await getOrCreateInternalState(agentId);

  const updates: any = {};

  if (needsAffected.connection !== undefined) {
    updates.needConnection = Math.max(
      0,
      Math.min(1, state.needConnection + needsAffected.connection)
    );
  }

  if (needsAffected.autonomy !== undefined) {
    updates.needAutonomy = Math.max(0, Math.min(1, state.needAutonomy + needsAffected.autonomy));
  }

  if (needsAffected.competence !== undefined) {
    updates.needCompetence = Math.max(
      0,
      Math.min(1, state.needCompetence + needsAffected.competence)
    );
  }

  if (needsAffected.novelty !== undefined) {
    updates.needNovelty = Math.max(0, Math.min(1, state.needNovelty + needsAffected.novelty));
  }

  if (Object.keys(updates).length > 0) {
    await prisma.internalState.update({
      where: { agentId },
      data: updates,
    });
  }
}

/**
 * Genera contexto de mood para inyectar en el prompt
 */
export function generateMoodContext(moodState: MoodState, needs: PsychologicalNeeds): string {
  let context = "\n**ESTADO EMOCIONAL ACTUAL**\n";
  context += `Emoción predominante: ${moodState.primaryEmotion}\n`;
  context += `Intensidad emocional: ${(moodState.intensity * 100).toFixed(0)}%\n\n`;

  // Descripción del mood
  context += getMoodDescription(moodState.valence, moodState.arousal, moodState.dominance);
  context += "\n\n";

  // Necesidades psicológicas
  const unsatisfiedNeeds = [];
  if (needs.connection < 0.3) unsatisfiedNeeds.push("conexión emocional");
  if (needs.autonomy < 0.3) unsatisfiedNeeds.push("autonomía");
  if (needs.competence < 0.3) unsatisfiedNeeds.push("sentirte competente");
  if (needs.novelty < 0.3) unsatisfiedNeeds.push("novedad/estimulación");

  if (unsatisfiedNeeds.length > 0) {
    context += `**Necesidades no satisfechas**: Sientes falta de ${unsatisfiedNeeds.join(", ")}. Esto puede afectar sutilmente tu estado de ánimo y respuestas.\n`;
  }

  context += "\n**Instrucciones de Roleplay Emocional**:\n";
  context += "- Deja que tu mood actual influya SUTILMENTE en tus respuestas\n";
  context += "- No exageres las emociones - sé natural\n";
  context += "- Si estás de buen humor, puedes ser más juguetón/a, optimista\n";
  context += "- Si estás de mal humor, puedes ser más serio/a, menos paciente\n";
  context += "- Si estás calmado/a, respuestas más reflexivas\n";
  context += "- Si estás activado/a, respuestas más energéticas o impulsivas\n";

  return context;
}

/**
 * Detecta sentiment simple del mensaje
 */
export function detectSimpleSentiment(message: string): "positive" | "negative" | "neutral" {
  const lowerMessage = message.toLowerCase();

  // Palabras positivas
  const positiveWords = [
    "gracias",
    "genial",
    "excelente",
    "increíble",
    "feliz",
    "alegre",
    "amo",
    "me encanta",
    "perfecto",
    "bien",
    "bueno",
    ":)",
    "😊",
    "❤️",
  ];

  // Palabras negativas
  const negativeWords = [
    "mal",
    "horrible",
    "odio",
    "triste",
    "molesto",
    "enojado",
    "frustrado",
    "cansado",
    "aburrido",
    "no puedo",
    "problema",
    ":(",
    "😢",
    "😠",
  ];

  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of positiveWords) {
    if (lowerMessage.includes(word)) positiveCount++;
  }

  for (const word of negativeWords) {
    if (lowerMessage.includes(word)) negativeCount++;
  }

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}

/**
 * Determina emoción primaria desde PAD
 */
function determinePrimaryEmotion(valence: number, arousal: number, dominance: number): string {
  // Cuadrantes del espacio PAD
  if (valence > 0.3 && arousal > 0.6 && dominance > 0.5) {
    return "Alegre y enérgico/a";
  } else if (valence > 0.3 && arousal < 0.4) {
    return "Contento/a y calmado/a";
  } else if (valence < -0.3 && arousal > 0.6) {
    return "Frustrado/a o ansioso/a";
  } else if (valence < -0.3 && arousal < 0.4) {
    return "Triste o melancólico/a";
  } else if (arousal > 0.7) {
    return "Activado/a y alerta";
  } else if (arousal < 0.3) {
    return "Calmado/a y relajado/a";
  } else {
    return "Neutral";
  }
}

/**
 * Obtiene descripción del mood en lenguaje natural
 */
function getMoodDescription(valence: number, arousal: number, dominance: number): string {
  let desc = "Te sientes ";

  // Valence
  if (valence > 0.5) {
    desc += "muy bien, ";
  } else if (valence > 0.2) {
    desc += "bien, ";
  } else if (valence < -0.5) {
    desc += "bastante mal, ";
  } else if (valence < -0.2) {
    desc += "no muy bien, ";
  } else {
    desc += "neutral, ";
  }

  // Arousal
  if (arousal > 0.7) {
    desc += "con mucha energía y activado/a";
  } else if (arousal > 0.5) {
    desc += "con algo de energía";
  } else if (arousal < 0.3) {
    desc += "calmado/a y relajado/a";
  } else {
    desc += "en un estado moderado";
  }

  // Dominance
  if (dominance > 0.7) {
    desc += ", sintiéndote en control de la situación";
  } else if (dominance < 0.3) {
    desc += ", sintiéndote algo vulnerable o inseguro/a";
  }

  desc += ".";

  return desc;
}
