/**
 * MEMORY INITIALIZATION FROM PROFILE
 *
 * Inicializa todas las memorias del agente basándose en el profile generado por LLM.
 * Esto incluye:
 * - SemanticMemory con worldKnowledge del personaje
 * - EpisodicMemories semilla con experiencias del pasado
 * - PersonalityCore enriquecido con backstory
 */

import { PrismaClient } from "@prisma/client";
import { getLLMProvider } from "@/lib/llm/provider";

const prisma = new PrismaClient();

interface ProfileData {
  basicIdentity?: {
    fullName?: string;
    age?: number;
    city?: string;
    nationality?: string;
    neighborhood?: string;
    livingSituation?: string;
  };
  family?: any;
  occupation?: any;
  socialCircle?: any;
  interests?: any;
  dailyRoutine?: any;
  lifeExperiences?: any;
  mundaneDetails?: any;
  innerWorld?: any;
  personality?: {
    bigFive?: {
      openness?: number;
      conscientiousness?: number;
      extraversion?: number;
      agreeableness?: number;
      neuroticism?: number;
    };
    traits?: string[];
    contradictions?: string[];
    strengths?: string[];
    weaknesses?: string[];
  };
  communication?: any;
  presentTense?: any;
  [key: string]: any;
}

/**
 * Inicializa SemanticMemory con worldKnowledge del personaje
 */
export async function initializeSemanticMemory(
  agentId: string,
  profile: ProfileData
): Promise<void> {
  try {
    console.log(`[MemoryInit] Initializing SemanticMemory for agent: ${agentId}`);

    // Construir worldKnowledge desde el profile
    const worldKnowledge = {
      // Identidad básica
      identity: {
        fullName: profile.basicIdentity?.fullName,
        age: profile.basicIdentity?.age,
        location: {
          city: profile.basicIdentity?.city,
          neighborhood: profile.basicIdentity?.neighborhood,
          country: profile.basicIdentity?.nationality
        },
        livingSituation: profile.basicIdentity?.livingSituation
      },

      // Familia
      family: profile.family,

      // Ocupación y educación
      occupation: profile.occupation,

      // Red social
      socialCircle: {
        friends: profile.socialCircle?.friends || [],
        exPartners: profile.socialCircle?.exPartners || [],
        relationshipStatus: profile.socialCircle?.currentRelationshipStatus
      },

      // Intereses y hobbies
      interests: profile.interests,

      // Rutina diaria
      dailyRoutine: profile.dailyRoutine,

      // Detalles mundanos (críticos para realismo)
      mundaneDetails: profile.mundaneDetails,

      // Comunicación
      communication: profile.communication,

      // Estado presente
      presentTense: profile.presentTense
    };

    // Crear SemanticMemory
    await prisma.semanticMemory.create({
      data: {
        agentId,
        userFacts: {}, // Se llenará con interacciones
        userPreferences: {}, // Se llenará con interacciones
        worldKnowledge, // Conocimiento del personaje
        relationshipStage: "first_meeting"
      }
    });

    console.log(`[MemoryInit] ✅ SemanticMemory created successfully`);
  } catch (error) {
    console.error("[MemoryInit] Error initializing SemanticMemory:", error);
    throw error;
  }
}

/**
 * Genera memorias episódicas semilla desde experiencias de vida del profile
 */
export async function generateEpisodicMemories(
  agentId: string,
  profile: ProfileData
): Promise<void> {
  try {
    console.log(`[MemoryInit] Generating episodic memories for agent: ${agentId}`);

    const memories: Array<{
      event: string;
      characterEmotion: string;
      emotionalValence: number;
      importance: number;
    }> = [];

    // 1. Memorias de experiencias formativas
    if (profile.lifeExperiences?.formativeEvents) {
      for (const exp of profile.lifeExperiences.formativeEvents) {
        const emotionMap: Record<string, { emotion: string; valence: number }> = {
          alto: { emotion: "distress", valence: -0.7 },
          medio: { emotion: "contemplation", valence: 0.0 },
          bajo: { emotion: "contentment", valence: 0.4 }
        };

        const emotionData = emotionMap[exp.emotionalWeight?.toLowerCase()] || emotionMap.medio;

        memories.push({
          event: `${exp.event} (Edad ${exp.age}). ${exp.impact}`,
          characterEmotion: emotionData.emotion,
          emotionalValence: emotionData.valence,
          importance: exp.emotionalWeight?.toLowerCase() === "alto" ? 1.0 : 0.7
        });
      }
    }

    // 2. Memorias de logros
    if (profile.lifeExperiences?.achievements) {
      for (const achievement of profile.lifeExperiences.achievements.slice(0, 2)) {
        memories.push({
          event: `${achievement.achievement} (${achievement.when}). Es uno de mis logros de los que más orgulloso/a estoy.`,
          characterEmotion: "pride",
          emotionalValence: 0.8,
          importance: 0.6
        });
      }
    }

    // 3. Memorias de relaciones importantes
    if (profile.socialCircle?.friends) {
      const bestFriend = profile.socialCircle.friends[0];
      if (bestFriend) {
        memories.push({
          event: `Cuando conocí a ${bestFriend.name}. ${bestFriend.howMet}. Desde entonces somos inseparables.`,
          characterEmotion: "affection",
          emotionalValence: 0.7,
          importance: 0.8
        });
      }
    }

    // 4. Memorias de traumas (si existen)
    if (profile.lifeExperiences?.traumas && profile.lifeExperiences.traumas.length > 0) {
      for (const trauma of profile.lifeExperiences.traumas) {
        memories.push({
          event: `${trauma.event} (Edad ${trauma.age}). ${trauma.healing === 'superado' ? 'Ya lo superé, pero me marcó.' : trauma.healing === 'en proceso' ? 'Todavía estoy procesándolo.' : 'Es algo con lo que aún lucho.'}`,
          characterEmotion: "grief",
          emotionalValence: -0.8,
          importance: 1.0
        });
      }
    }

    // 5. Memorias de familia
    if (profile.family?.father?.status === "fallecido") {
      memories.push({
        event: `La pérdida de mi padre. ${profile.family.father.name ? `${profile.family.father.name} fue` : 'Fue'} alguien muy importante para mí.`,
        characterEmotion: "grief",
        emotionalValence: -0.9,
        importance: 1.0
      });
    }

    // 6. Memoria del presente
    if (profile.presentTense?.recentEvent) {
      memories.push({
        event: `Recientemente: ${profile.presentTense.recentEvent}`,
        characterEmotion: "interest",
        emotionalValence: 0.3,
        importance: 0.4
      });
    }

    // Crear todas las memorias en la BD
    for (const memory of memories) {
      await prisma.episodicMemory.create({
        data: {
          agentId,
          event: memory.event,
          characterEmotion: memory.characterEmotion,
          emotionalValence: memory.emotionalValence,
          importance: memory.importance,
          decayFactor: 1.0,
          metadata: {
            source: "profile_initialization",
            generated: true
          }
        }
      });
    }

    console.log(`[MemoryInit] ✅ Created ${memories.length} episodic memories`);
  } catch (error) {
    console.error("[MemoryInit] Error generating episodic memories:", error);
    throw error;
  }
}

/**
 * Inicializa PersonalityCore con datos enriquecidos del profile
 */
export async function initializePersonalityCore(
  agentId: string,
  profile: ProfileData,
  systemPrompt: string
): Promise<void> {
  try {
    console.log(`[MemoryInit] Initializing PersonalityCore for agent: ${agentId}`);

    // Extraer Big Five del profile o usar defaults
    const bigFive = profile.personality?.bigFive || {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 70,
      neuroticism: 40
    };

    // Construir backstory rico desde el profile
    const backstoryParts: string[] = [];

    // Identidad y vida actual
    if (profile.basicIdentity) {
      const id = profile.basicIdentity;
      backstoryParts.push(
        `${id.fullName || 'Este personaje'} tiene ${id.age || 25} años y vive en ${id.city || 'la ciudad'}${id.neighborhood ? `, específicamente en ${id.neighborhood}` : ''}.`
      );
    }

    // Familia
    if (profile.family) {
      const familyDesc: string[] = [];
      if (profile.family.mother) {
        familyDesc.push(`su madre ${profile.family.mother.name} (${profile.family.mother.occupation})`);
      }
      if (profile.family.father?.status === "vivo") {
        familyDesc.push(`su padre ${profile.family.father.name} (${profile.family.father.occupation})`);
      } else if (profile.family.father?.status === "fallecido") {
        familyDesc.push(`perdió a su padre ${profile.family.father.name}, lo cual fue un evento formativo importante`);
      }
      if (profile.family.siblings && profile.family.siblings.length > 0) {
        const sibling = profile.family.siblings[0];
        familyDesc.push(`tiene ${profile.family.siblings.length === 1 ? 'un hermano/a' : 'hermanos'} (${sibling.name}, ${sibling.age} años)`);
      }

      if (familyDesc.length > 0) {
        backstoryParts.push(`Familia: ${familyDesc.join(', ')}.`);
      }
    }

    // Ocupación
    if (profile.occupation?.current) {
      backstoryParts.push(
        `Actualmente ${profile.occupation.current.toLowerCase()}. ${profile.occupation.education ? `Estudió ${profile.occupation.education}.` : ''}`
      );
    }

    // Experiencias formativas clave
    if (profile.lifeExperiences?.formativeEvents && profile.lifeExperiences.formativeEvents.length > 0) {
      const topEvent = profile.lifeExperiences.formativeEvents[0];
      backstoryParts.push(
        `Una experiencia que lo/la marcó profundamente: ${topEvent.event}. ${topEvent.impact}`
      );
    }

    // Personalidad y valores
    if (profile.innerWorld?.values && profile.innerWorld.values.length > 0) {
      const values = profile.innerWorld.values.slice(0, 3).map((v: any) => v.value).join(", ");
      backstoryParts.push(`Valora especialmente: ${values}.`);
    }

    const backstory = backstoryParts.join(" ");

    // Construir coreValues desde el profile
    const coreValues = (profile.innerWorld?.values || []).map((v: any) => ({
      value: v.value,
      weight: v.importance === "alta" ? 0.9 : 0.7,
      description: v.description || ""
    }));

    // Si no hay valores explícitos, inferir desde personalidad
    if (coreValues.length === 0) {
      coreValues.push(
        { value: "autenticidad", weight: 0.8, description: "Ser genuino/a y real" },
        { value: "empatía", weight: 0.7, description: "Entender a los demás" },
        { value: "crecimiento", weight: 0.6, description: "Mejorar constantemente" }
      );
    }

    // Construir moralSchemas
    const moralSchemas = [];
    if (profile.innerWorld?.moralAlignment) {
      const alignment = profile.innerWorld.moralAlignment;
      if (alignment.honesty) {
        moralSchemas.push({
          domain: "honestidad",
          stance: alignment.honesty,
          threshold: alignment.honesty.includes("muy") ? 0.9 : 0.7
        });
      }
      if (alignment.loyalty) {
        moralSchemas.push({
          domain: "lealtad",
          stance: alignment.loyalty,
          threshold: alignment.loyalty.includes("muerte") ? 0.9 : 0.7
        });
      }
    }

    // Si no hay moral schemas, agregar defaults
    if (moralSchemas.length === 0) {
      moralSchemas.push(
        { domain: "honestidad", stance: "honesto pero empático", threshold: 0.7 },
        { domain: "lealtad", stance: "leal a círculo cercano", threshold: 0.8 }
      );
    }

    // Baseline emotions basadas en personalidad (con defaults si no están definidos)
    const baselineEmotions: Record<string, number> = {
      joy: Math.max(0, (100 - (bigFive.neuroticism || 40)) / 100 * 0.6),
      interest: (bigFive.openness || 50) / 100 * 0.7,
      contentment: (bigFive.agreeableness || 70) / 100 * 0.6,
      anxiety: (bigFive.neuroticism || 40) / 100 * 0.4
    };

    // Crear PersonalityCore
    await prisma.personalityCore.create({
      data: {
        agentId,
        openness: bigFive.openness,
        conscientiousness: bigFive.conscientiousness,
        extraversion: bigFive.extraversion,
        agreeableness: bigFive.agreeableness,
        neuroticism: bigFive.neuroticism,
        coreValues,
        moralSchemas,
        backstory,
        baselineEmotions
      }
    });

    console.log(`[MemoryInit] ✅ PersonalityCore created successfully`);
  } catch (error) {
    console.error("[MemoryInit] Error initializing PersonalityCore:", error);
    throw error;
  }
}

/**
 * Inicializa TODAS las memorias del agente de una sola vez
 */
export async function initializeAllMemories(
  agentId: string,
  profile: ProfileData,
  systemPrompt: string
): Promise<void> {
  console.log(`[MemoryInit] 🚀 Starting complete memory initialization for agent: ${agentId}`);

  try {
    // Ejecutar todas las inicializaciones en paralelo para mejor performance
    await Promise.all([
      initializeSemanticMemory(agentId, profile),
      generateEpisodicMemories(agentId, profile),
      initializePersonalityCore(agentId, profile, systemPrompt)
    ]);

    console.log(`[MemoryInit] ✅✅✅ All memories initialized successfully`);
  } catch (error) {
    console.error("[MemoryInit] ❌ Error during memory initialization:", error);
    throw error;
  }
}
