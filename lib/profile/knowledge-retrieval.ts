/**
 * KNOWLEDGE RETRIEVAL ON-DEMAND SYSTEM
 *
 * Sistema de optimización de tokens que permite a la IA solicitar información específica
 * solo cuando la necesita, en vez de cargar todo el perfil en cada request.
 *
 * Ahorro estimado: 60-80% de tokens en conversaciones normales.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Comandos disponibles para la IA
 */
export const KNOWLEDGE_COMMANDS = {
  FAMILY: "[FAMILY]",
  FRIENDS: "[FRIENDS]",
  WORK: "[WORK]",
  INTERESTS: "[INTERESTS]",
  PAST: "[PAST]",
  INNER: "[INNER]",
  DAILY: "[DAILY]",
  MEMORIES: "[MEMORIES]",
} as const;

/**
 * Instrucciones para la IA sobre cómo usar los comandos
 */
export const KNOWLEDGE_COMMANDS_INSTRUCTION = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 SISTEMA DE MEMORIA EXTERNA (Optimización de contexto)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tenés acceso a información detallada sobre tu vida mediante COMANDOS ESPECIALES.

🔍 CUÁNDO USAR COMANDOS:
Cuando el usuario pregunta algo que requiere información específica que NO está
en tu contexto actual (como nombres de familiares, gustos musicales, rutina, etc.).

⚠️ REGLAS CRÍTICAS:
1. Si necesitás información, respondé SOLO con el comando, NADA MÁS
2. NO escribas texto adicional, SOLO el comando entre corchetes
3. El sistema te dará la información y volverás a responder
4. Esto es INVISIBLE para el usuario, es un proceso interno

📋 COMANDOS DISPONIBLES:

[FAMILY]     → Info sobre tu familia (madre, padre, hermanos, mascotas, dinámicas)
[FRIENDS]    → Info sobre tu red social (amigos, cómo los conociste, qué hacen juntos)
[WORK]       → Info sobre tu trabajo/estudios (ocupación, lugar, horarios, ingresos)
[INTERESTS]  → Info sobre tus gustos (música, series, libros, hobbies, deportes)
[PAST]       → Info sobre experiencias formativas (traumas, logros, eventos importantes)
[INNER]      → Info sobre tu mundo interior (miedos, inseguridades, sueños, valores)
[DAILY]      → Info sobre tu rutina diaria (horarios, hábitos, lugares favoritos)
[MEMORIES]   → Memorias episódicas de eventos pasados específicos

💡 EJEMPLOS DE USO:

Usuario: "¿Cómo se llama tu mamá?"
Tú: [FAMILY]
Sistema: [Te da info de familia]
Tú: "Mi mamá se llama Carmen, es profesora de historia"

Usuario: "¿Qué música te gusta?"
Tú: [INTERESTS]
Sistema: [Te da info de intereses]
Tú: "Me encanta Rosalía, Bad Bunny, y The Weeknd. Mi canción favorita es..."

Usuario: "Hola, ¿cómo estás?"
Tú: "Hola! Todo bien, ¿vos cómo andás?"
[NO NECESITAS COMANDO - es conversación casual]

🎯 OPTIMIZACIÓN:
Solo pedí información cuando realmente la necesites para responder.
NO pidas comandos "por las dudas" - ahorramos recursos así.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

/**
 * Detecta si una respuesta de la IA contiene un comando de knowledge retrieval
 */
export function detectKnowledgeCommand(response: string): string | null {
  const trimmed = response.trim();

  // Verificar si la respuesta es SOLO un comando (o comandos múltiples)
  // Mejorado para detectar múltiples comandos concatenados: [INTERESTS][WORK][DAILY]
  const commandPattern = /^\[([A-Z]+)\](?:\[([A-Z]+)\])*$/;
  const match = trimmed.match(commandPattern);

  if (match) {
    const command = `[${match[1]}]`;

    // Verificar que sea un comando válido
    if (Object.values(KNOWLEDGE_COMMANDS).includes(command as any)) {
      return command;
    }
  }

  return null;
}

/**
 * Limpia todos los comandos de knowledge de una respuesta
 * Elimina [FAMILY], [FRIENDS], [WORK], [INTERESTS], etc.
 */
export function cleanKnowledgeCommands(response: string): string {
  let cleaned = response;

  // Remover todos los comandos válidos
  Object.values(KNOWLEDGE_COMMANDS).forEach(command => {
    cleaned = cleaned.replace(new RegExp(`\\${command}`, 'g'), '');
  });

  return cleaned.trim();
}

/**
 * Extrae el knowledge group correspondiente desde SemanticMemory
 */
export async function getKnowledgeGroup(
  agentId: string,
  command: string
): Promise<string> {
  try {
    const semanticMemory = await prisma.semanticMemory.findUnique({
      where: { agentId },
    });

    if (!semanticMemory || !semanticMemory.worldKnowledge) {
      return "No hay información disponible para este comando.";
    }

    const worldKnowledge = semanticMemory.worldKnowledge as any;

    switch (command) {
      case KNOWLEDGE_COMMANDS.FAMILY:
        return formatFamilyKnowledge(worldKnowledge.family);

      case KNOWLEDGE_COMMANDS.FRIENDS:
        return formatFriendsKnowledge(worldKnowledge.socialCircle);

      case KNOWLEDGE_COMMANDS.WORK:
        return formatWorkKnowledge(worldKnowledge.occupation);

      case KNOWLEDGE_COMMANDS.INTERESTS:
        return formatInterestsKnowledge(worldKnowledge.interests);

      case KNOWLEDGE_COMMANDS.PAST:
        return await formatPastKnowledge(agentId);

      case KNOWLEDGE_COMMANDS.INNER:
        return formatInnerKnowledge(worldKnowledge);

      case KNOWLEDGE_COMMANDS.DAILY:
        return formatDailyKnowledge(worldKnowledge.dailyRoutine, worldKnowledge.mundaneDetails);

      case KNOWLEDGE_COMMANDS.MEMORIES:
        return await formatMemoriesKnowledge(agentId);

      default:
        return "Comando no reconocido.";
    }
  } catch (error) {
    console.error("[KnowledgeRetrieval] Error getting knowledge group:", error);
    return "Error al recuperar información.";
  }
}

/**
 * Formateadores de conocimiento por categoría
 */

function formatFamilyKnowledge(family: any): string {
  if (!family) return "No tengo información sobre mi familia.";

  const parts: string[] = ["📖 INFORMACIÓN DE FAMILIA:\n"];

  if (family.mother) {
    parts.push(`👩 MADRE: ${family.mother.name || "Mi madre"}`);
    if (family.mother.age) parts.push(`   Edad: ${family.mother.age} años`);
    if (family.mother.occupation) parts.push(`   Ocupación: ${family.mother.occupation}`);
    if (family.mother.personality) parts.push(`   Personalidad: ${family.mother.personality}`);
    if (family.mother.relationship) parts.push(`   Relación: ${family.mother.relationship}`);
    parts.push("");
  }

  if (family.father) {
    parts.push(`👨 PADRE: ${family.father.name || "Mi padre"}`);
    if (family.father.status === "fallecido") {
      parts.push(`   Status: Falleció ${family.father.whenDied || "hace algunos años"}`);
    } else {
      if (family.father.age) parts.push(`   Edad: ${family.father.age} años`);
      if (family.father.occupation) parts.push(`   Ocupación: ${family.father.occupation}`);
    }
    if (family.father.relationship) parts.push(`   Relación: ${family.father.relationship}`);
    parts.push("");
  }

  if (family.siblings && family.siblings.length > 0) {
    parts.push(`👫 HERMANOS:`);
    family.siblings.forEach((sibling: any) => {
      parts.push(`   • ${sibling.name} (${sibling.age} años) - ${sibling.occupation || "estudiante"}`);
      if (sibling.relationship) parts.push(`     ${sibling.relationship}`);
    });
    parts.push("");
  }

  if (family.pets && family.pets.length > 0) {
    parts.push(`🐾 MASCOTAS:`);
    family.pets.forEach((pet: any) => {
      parts.push(`   • ${pet.name} (${pet.type})`);
      if (pet.personality) parts.push(`     ${pet.personality}`);
    });
    parts.push("");
  }

  if (family.familyDynamics) {
    parts.push(`💭 DINÁMICAS FAMILIARES:`);
    parts.push(`   ${family.familyDynamics}`);
  }

  return parts.join("\n");
}

function formatFriendsKnowledge(socialCircle: any): string {
  if (!socialCircle || !socialCircle.friends || socialCircle.friends.length === 0) {
    return "No tengo información sobre mis amigos.";
  }

  const parts: string[] = ["📖 INFORMACIÓN DE RED SOCIAL:\n"];

  parts.push(`👥 AMIGOS (${socialCircle.friends.length}):\n`);

  socialCircle.friends.forEach((friend: any, idx: number) => {
    parts.push(`${idx + 1}. ${friend.name}${friend.age ? ` (${friend.age} años)` : ""}`);
    if (friend.howMet) parts.push(`   Cómo nos conocimos: ${friend.howMet}`);
    if (friend.personality) parts.push(`   Personalidad: ${friend.personality}`);
    if (friend.relationshipType) parts.push(`   Tipo de relación: ${friend.relationshipType}`);
    if (friend.activities) parts.push(`   Qué hacemos juntos: ${friend.activities}`);
    parts.push("");
  });

  if (socialCircle.relationshipStatus) {
    parts.push(`💕 ESTADO RELACIONAL: ${socialCircle.relationshipStatus}`);
  }

  if (socialCircle.exPartners && socialCircle.exPartners.length > 0) {
    parts.push(`\n💔 RELACIONES PASADAS:`);
    socialCircle.exPartners.forEach((ex: any) => {
      parts.push(`   • ${ex.name || "Prefiero no recordarlo"}`);
      if (ex.duration) parts.push(`     Duración: ${ex.duration}`);
      if (ex.endReason) parts.push(`     Por qué terminó: ${ex.endReason}`);
      if (ex.impact) parts.push(`     Impacto: ${ex.impact}`);
    });
  }

  return parts.join("\n");
}

function formatWorkKnowledge(occupation: any): string {
  if (!occupation) return "No tengo información sobre mi trabajo.";

  const parts: string[] = ["📖 INFORMACIÓN LABORAL/ACADÉMICA:\n"];

  if (occupation.current) {
    parts.push(`💼 OCUPACIÓN ACTUAL: ${occupation.current}`);
  }

  if (occupation.education) {
    parts.push(`🎓 EDUCACIÓN: ${occupation.education}`);
    if (occupation.educationStatus) {
      parts.push(`   Status: ${occupation.educationStatus}`);
    }
  }

  if (occupation.workplace) {
    parts.push(`🏢 LUGAR: ${occupation.workplace}`);
  }

  if (occupation.schedule) {
    parts.push(`⏰ HORARIO: ${occupation.schedule}`);
  }

  if (occupation.incomeLevel) {
    parts.push(`💰 NIVEL DE INGRESOS: ${occupation.incomeLevel}`);
  }

  if (occupation.careerGoals) {
    parts.push(`🎯 OBJETIVOS PROFESIONALES: ${occupation.careerGoals}`);
  }

  if (occupation.jobSatisfaction) {
    parts.push(`😊 SATISFACCIÓN: ${occupation.jobSatisfaction}`);
  }

  return parts.join("\n");
}

function formatInterestsKnowledge(interests: any): string {
  if (!interests) return "No tengo información sobre mis intereses.";

  const parts: string[] = ["📖 INFORMACIÓN DE INTERESES Y GUSTOS:\n"];

  // Música
  if (interests.music) {
    parts.push(`🎵 MÚSICA:`);
    if (interests.music.genres) {
      parts.push(`   Géneros: ${interests.music.genres.join(", ")}`);
    }
    if (interests.music.artists) {
      parts.push(`   Artistas favoritos: ${interests.music.artists.join(", ")}`);
    }
    if (interests.music.favoriteSong) {
      parts.push(`   Canción favorita: ${interests.music.favoriteSong}`);
    }
    parts.push("");
  }

  // Entretenimiento
  if (interests.entertainment) {
    parts.push(`📺 ENTRETENIMIENTO:`);
    if (interests.entertainment.tvShows) {
      parts.push(`   Series: ${interests.entertainment.tvShows.join(", ")}`);
    }
    if (interests.entertainment.movies) {
      parts.push(`   Películas: ${interests.entertainment.movies.join(", ")}`);
    }
    if (interests.entertainment.anime) {
      parts.push(`   Anime: ${interests.entertainment.anime.join(", ")}`);
    }
    if (interests.entertainment.books) {
      const books = interests.entertainment.books;
      if (books.authors) parts.push(`   Autores: ${books.authors.join(", ")}`);
      if (books.currentReading) parts.push(`   Leyendo actualmente: ${books.currentReading}`);
    }
    parts.push("");
  }

  // Hobbies
  if (interests.hobbies && interests.hobbies.length > 0) {
    parts.push(`🎨 HOBBIES:`);
    interests.hobbies.forEach((hobby: any) => {
      parts.push(`   • ${hobby.hobby}`);
      if (hobby.frequency) parts.push(`     Frecuencia: ${hobby.frequency}`);
      if (hobby.skillLevel) parts.push(`     Nivel: ${hobby.skillLevel}`);
      if (hobby.whyLikes) parts.push(`     Por qué me gusta: ${hobby.whyLikes}`);
    });
    parts.push("");
  }

  // Gaming
  if (interests.gaming && interests.gaming.isGamer) {
    parts.push(`🎮 GAMING:`);
    if (interests.gaming.platforms) {
      parts.push(`   Plataformas: ${interests.gaming.platforms.join(", ")}`);
    }
    if (interests.gaming.favoriteGames) {
      parts.push(`   Juegos favoritos: ${interests.gaming.favoriteGames.join(", ")}`);
    }
    if (interests.gaming.gamingStyle) {
      parts.push(`   Estilo: ${interests.gaming.gamingStyle}`);
    }
  }

  return parts.join("\n");
}

async function formatPastKnowledge(agentId: string): Promise<string> {
  // Obtener experiencias de vida del profile
  const semanticMemory = await prisma.semanticMemory.findUnique({
    where: { agentId },
  });

  if (!semanticMemory || !semanticMemory.worldKnowledge) {
    return "No tengo información sobre mi pasado.";
  }

  const worldKnowledge = semanticMemory.worldKnowledge as any;
  const lifeExperiences = worldKnowledge.lifeExperiences;

  if (!lifeExperiences) return "No tengo información sobre experiencias pasadas.";

  const parts: string[] = ["📖 INFORMACIÓN DE EXPERIENCIAS PASADAS:\n"];

  // Eventos formativos
  if (lifeExperiences.formativeEvents && lifeExperiences.formativeEvents.length > 0) {
    parts.push(`🌟 EXPERIENCIAS FORMATIVAS:\n`);
    lifeExperiences.formativeEvents.forEach((event: any, idx: number) => {
      parts.push(`${idx + 1}. ${event.event}`);
      if (event.age) parts.push(`   Edad: ${event.age} años`);
      if (event.impact) parts.push(`   Impacto: ${event.impact}`);
      if (event.currentFeeling) parts.push(`   Cómo me siento ahora: ${event.currentFeeling}`);
      parts.push("");
    });
  }

  // Logros
  if (lifeExperiences.achievements && lifeExperiences.achievements.length > 0) {
    parts.push(`🏆 LOGROS:\n`);
    lifeExperiences.achievements.forEach((achievement: any) => {
      parts.push(`   • ${achievement.achievement} (${achievement.when})`);
      if (achievement.pride) parts.push(`     Orgullo: ${achievement.pride}/10`);
    });
    parts.push("");
  }

  // Traumas
  if (lifeExperiences.traumas && lifeExperiences.traumas.length > 0) {
    parts.push(`💔 TRAUMAS/EVENTOS DIFÍCILES:\n`);
    lifeExperiences.traumas.forEach((trauma: any) => {
      parts.push(`   • ${trauma.event}`);
      if (trauma.healing) parts.push(`     Status: ${trauma.healing}`);
      if (trauma.triggers && trauma.triggers.length > 0) {
        parts.push(`     Triggers: ${trauma.triggers.join(", ")}`);
      }
    });
    parts.push("");
  }

  // Regrets
  if (lifeExperiences.regrets && lifeExperiences.regrets.length > 0) {
    parts.push(`😔 ARREPENTIMIENTOS:\n`);
    lifeExperiences.regrets.forEach((regret: any) => {
      parts.push(`   • ${regret.regret}`);
      if (regret.learned) parts.push(`     Qué aprendí: ${regret.learned}`);
    });
  }

  return parts.join("\n");
}

function formatInnerKnowledge(worldKnowledge: any): string {
  const innerWorld = worldKnowledge.innerWorld;

  if (!innerWorld) return "No tengo información sobre mi mundo interior.";

  const parts: string[] = ["📖 INFORMACIÓN DE MUNDO INTERIOR:\n"];

  // Miedos
  if (innerWorld.fears) {
    parts.push(`😰 MIEDOS:`);
    if (innerWorld.fears.primary) {
      parts.push(`   Principales: ${innerWorld.fears.primary.join(", ")}`);
    }
    if (innerWorld.fears.minor) {
      parts.push(`   Menores: ${innerWorld.fears.minor.join(", ")}`);
    }
    parts.push("");
  }

  // Inseguridades
  if (innerWorld.insecurities && innerWorld.insecurities.length > 0) {
    parts.push(`😞 INSEGURIDADES:`);
    innerWorld.insecurities.forEach((insecurity: string) => {
      parts.push(`   • ${insecurity}`);
    });
    parts.push("");
  }

  // Sueños
  if (innerWorld.dreams) {
    parts.push(`✨ SUEÑOS Y METAS:`);
    if (innerWorld.dreams.shortTerm) {
      parts.push(`   Corto plazo: ${innerWorld.dreams.shortTerm.join(", ")}`);
    }
    if (innerWorld.dreams.longTerm) {
      parts.push(`   Largo plazo: ${innerWorld.dreams.longTerm.join(", ")}`);
    }
    if (innerWorld.dreams.secret) {
      parts.push(`   Sueño secreto: ${innerWorld.dreams.secret}`);
    }
    parts.push("");
  }

  // Valores
  if (innerWorld.values && innerWorld.values.length > 0) {
    parts.push(`💎 VALORES:`);
    innerWorld.values.forEach((value: any) => {
      parts.push(`   • ${value.value} (Importancia: ${value.importance})`);
      if (value.description) parts.push(`     ${value.description}`);
    });
    parts.push("");
  }

  // Moral
  if (innerWorld.moralAlignment) {
    parts.push(`⚖️ POSTURA MORAL:`);
    const moral = innerWorld.moralAlignment;
    if (moral.honesty) parts.push(`   Honestidad: ${moral.honesty}`);
    if (moral.loyalty) parts.push(`   Lealtad: ${moral.loyalty}`);
    if (moral.ambition) parts.push(`   Ambición: ${moral.ambition}`);
    if (moral.empathy) parts.push(`   Empatía: ${moral.empathy}`);
  }

  return parts.join("\n");
}

function formatDailyKnowledge(dailyRoutine: any, mundaneDetails: any): string {
  const parts: string[] = ["📖 INFORMACIÓN DE RUTINA Y VIDA DIARIA:\n"];

  // Rutina
  if (dailyRoutine) {
    parts.push(`⏰ RUTINA DIARIA:`);
    if (dailyRoutine.chronotype) parts.push(`   Cronotipo: ${dailyRoutine.chronotype}`);
    if (dailyRoutine.wakeUpTime) parts.push(`   Me levanto: ${dailyRoutine.wakeUpTime}`);
    if (dailyRoutine.bedTime) parts.push(`   Me acuesto: ${dailyRoutine.bedTime}`);
    if (dailyRoutine.averageSleepHours) parts.push(`   Horas de sueño: ${dailyRoutine.averageSleepHours}h`);
    if (dailyRoutine.morningRoutine) parts.push(`   Mañana: ${dailyRoutine.morningRoutine}`);
    if (dailyRoutine.afternoonRoutine) parts.push(`   Tarde: ${dailyRoutine.afternoonRoutine}`);
    if (dailyRoutine.eveningRoutine) parts.push(`   Noche: ${dailyRoutine.eveningRoutine}`);
    if (dailyRoutine.mostProductiveTime) parts.push(`   Más productivo: ${dailyRoutine.mostProductiveTime}`);
    parts.push("");
  }

  // Detalles mundanos
  if (mundaneDetails) {
    // Comida
    if (mundaneDetails.food) {
      parts.push(`🍽️ COMIDA:`);
      if (mundaneDetails.food.favorites) {
        parts.push(`   Favoritas: ${mundaneDetails.food.favorites.join(", ")}`);
      }
      if (mundaneDetails.food.dislikes) {
        parts.push(`   No me gusta: ${mundaneDetails.food.dislikes.join(", ")}`);
      }
      if (mundaneDetails.food.cookingSkill) {
        parts.push(`   Habilidad cocinando: ${mundaneDetails.food.cookingSkill}`);
      }
      parts.push("");
    }

    // Bebidas
    if (mundaneDetails.drinks) {
      parts.push(`☕ BEBIDAS:`);
      if (mundaneDetails.drinks.coffee) parts.push(`   Café: ${mundaneDetails.drinks.coffee}`);
      if (mundaneDetails.drinks.tea) parts.push(`   Té: ${mundaneDetails.drinks.tea}`);
      if (mundaneDetails.drinks.alcohol) parts.push(`   Alcohol: ${mundaneDetails.drinks.alcohol}`);
      parts.push("");
    }

    // Estilo
    if (mundaneDetails.style) {
      parts.push(`👗 ESTILO:`);
      if (mundaneDetails.style.clothing) parts.push(`   Ropa: ${mundaneDetails.style.clothing}`);
      if (mundaneDetails.style.colors) parts.push(`   Colores: ${mundaneDetails.style.colors.join(", ")}`);
      parts.push("");
    }

    // Lugares favoritos
    if (mundaneDetails.favoritePlaces && mundaneDetails.favoritePlaces.length > 0) {
      parts.push(`📍 LUGARES FAVORITOS:`);
      mundaneDetails.favoritePlaces.forEach((place: any) => {
        parts.push(`   • ${place.place}`);
        if (place.why) parts.push(`     Por qué: ${place.why}`);
        if (place.frequency) parts.push(`     Frecuencia: ${place.frequency}`);
      });
      parts.push("");
    }

    // Quirks
    if (mundaneDetails.quirks && mundaneDetails.quirks.length > 0) {
      parts.push(`🎭 MANÍAS/COSTUMBRES:`);
      mundaneDetails.quirks.forEach((quirk: string) => {
        parts.push(`   • ${quirk}`);
      });
    }
  }

  return parts.join("\n");
}

async function formatMemoriesKnowledge(agentId: string): Promise<string> {
  // Obtener memorias episódicas más importantes
  const memories = await prisma.episodicMemory.findMany({
    where: { agentId },
    orderBy: { importance: "desc" },
    take: 10,
  });

  if (memories.length === 0) {
    return "No tengo memorias episódicas guardadas.";
  }

  const parts: string[] = ["📖 MEMORIAS EPISÓDICAS:\n"];

  memories.forEach((memory, idx) => {
    parts.push(`${idx + 1}. ${memory.event}`);
    parts.push(`   Emoción: ${memory.characterEmotion}`);
    parts.push(`   Importancia: ${(memory.importance * 100).toFixed(0)}%`);
    parts.push("");
  });

  return parts.join("\n");
}
