/**
 * Generation Service
 *
 * Servicios para generar automáticamente entidades relacionadas:
 * - ImportantEvents (cumpleaños, eventos futuros, pasados)
 * - ImportantPeople (familia, amigos del profile)
 * - EpisodicMemory (memorias formativas)
 * - Example Dialogues (cómo habla el personaje)
 */

import { PrismaClient } from '@prisma/client';
import type { AgentProfileV2 } from '@/types/agent-profile';

const prisma = new PrismaClient();

// ============================================
// IMPORTANT EVENTS GENERATION
// ============================================

export interface GeneratedEvent {
  eventDate: Date;
  type: 'birthday' | 'medical' | 'exam' | 'special' | 'anniversary' | 'other';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  relationship?: string;
  emotionalTone?: string;
  eventHappened: boolean;
  isRecurring: boolean;
  metadata?: Record<string, any>;
}

/**
 * Genera 15-20 ImportantEvents automáticamente desde el profile
 */
export async function generateImportantEventsFromProfile(
  agentId: string,
  profile: AgentProfileV2
): Promise<void> {
  const events: GeneratedEvent[] = [];
  const currentYear = new Date().getFullYear();

  // 1. Cumpleaños de familia
  if (profile.family) {
    // Cumpleaños madre
    if (profile.family.mother) {
      const motherBirthday = estimateBirthday(profile.family.mother.age);
      events.push({
        eventDate: getNextOccurrence(motherBirthday),
        type: 'birthday',
        description: `Cumpleaños de ${profile.family.mother.name} (madre) - ${profile.family.mother.age + 1} años`,
        priority: 'high',
        relationship: 'family',
        emotionalTone: 'Feliz, familia es importante',
        eventHappened: false,
        isRecurring: true,
        metadata: {
          personName: profile.family.mother.name,
          age: profile.family.mother.age + 1,
        },
      });
    }

    // Cumpleaños padre
    if (profile.family.father) {
      const fatherBirthday = estimateBirthday(profile.family.father.age);
      events.push({
        eventDate: getNextOccurrence(fatherBirthday),
        type: 'birthday',
        description: `Cumpleaños de ${profile.family.father.name} (padre) - ${profile.family.father.age + 1} años`,
        priority: 'high',
        relationship: 'family',
        emotionalTone: 'Contento, día especial en familia',
        eventHappened: false,
        isRecurring: true,
        metadata: {
          personName: profile.family.father.name,
          age: profile.family.father.age + 1,
        },
      });
    }

    // Cumpleaños hermanos
    if (profile.family.siblings) {
      for (const sibling of profile.family.siblings) {
        const siblingBirthday = estimateBirthday(sibling.age);
        events.push({
          eventDate: getNextOccurrence(siblingBirthday),
          type: 'birthday',
          description: `Cumpleaños de ${sibling.name} (hermano/a) - ${sibling.age + 1} años`,
          priority: 'high',
          relationship: 'family',
          emotionalTone: 'Alegre, día de celebración familiar',
          eventHappened: false,
          isRecurring: true,
          metadata: {
            personName: sibling.name,
            age: sibling.age + 1,
          },
        });
      }
    }
  }

  // 2. Cumpleaños de amigos cercanos
  if (profile.socialCircle?.friends) {
    const closeFriends = profile.socialCircle.friends.slice(0, 3); // Top 3 friends
    for (const friend of closeFriends) {
      const friendBirthday = estimateBirthday(friend.age);
      events.push({
        eventDate: getNextOccurrence(friendBirthday),
        type: 'birthday',
        description: `Cumpleaños de ${friend.name} - ${friend.age + 1} años`,
        priority: 'high',
        relationship: 'friend',
        emotionalTone: 'Emocionado, ya tengo su regalo planeado',
        eventHappened: false,
        isRecurring: true,
        metadata: {
          personName: friend.name,
          age: friend.age + 1,
        },
      });
    }
  }

  // 3. Eventos futuros relacionados con ocupación/educación
  if (profile.occupation) {
    const occupationEvents = generateOccupationEvents(profile);
    events.push(...occupationEvents);
  }

  // 4. Eventos pasados importantes (formative events)
  if (profile.lifeExperiences?.formativeEvents) {
    for (const formative of profile.lifeExperiences.formativeEvents) {
      // Crear aniversarios de eventos importantes
      if (formative.emotionalWeight && formative.emotionalWeight > 0.7) {
        const eventDate = estimateEventDate(formative.age, profile.basicIdentity.age);
        events.push({
          eventDate,
          type: 'anniversary',
          description: `Aniversario: ${formative.event}`,
          priority: 'medium',
          relationship: 'user',
          emotionalTone: formative.impact,
          eventHappened: true,
          isRecurring: true,
          metadata: {
            originalEvent: formative.event,
            yearsAgo: profile.basicIdentity.age - formative.age,
          },
        });
      }
    }
  }

  // 5. Eventos especiales próximos (generados con algo de aleatoriedad)
  const specialEvents = generateSpecialEvents(profile);
  events.push(...specialEvents);

  // Guardar en BD
  for (const event of events) {
    try {
      await prisma.importantEvent.create({
        data: {
          agentId,
          userId: agentId, // Self-referential para eventos del agente
          ...event,
        },
      });
    } catch (error) {
      console.error('Error creating ImportantEvent:', error);
    }
  }

  console.log(`✅ Generated ${events.length} ImportantEvents for agent ${agentId}`);
}

function estimateBirthday(age: number): Date {
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  // Random month and day
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1; // Safe day range
  return new Date(birthYear, month, day);
}

function getNextOccurrence(birthday: Date): Date {
  const today = new Date();
  const thisYear = new Date(
    today.getFullYear(),
    birthday.getMonth(),
    birthday.getDate()
  );

  if (thisYear < today) {
    // If birthday already passed this year, return next year
    return new Date(
      today.getFullYear() + 1,
      birthday.getMonth(),
      birthday.getDate()
    );
  }

  return thisYear;
}

function generateOccupationEvents(profile: AgentProfileV2): GeneratedEvent[] {
  const events: GeneratedEvent[] = [];
  const today = new Date();

  if (profile.occupation.current.toLowerCase().includes('student') ||
      profile.occupation.educationStatus === 'studying') {
    // Estudiante: generar exámenes y entregas
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const twoWeeks = new Date(today);
    twoWeeks.setDate(today.getDate() + 14);

    const oneMonth = new Date(today);
    oneMonth.setMonth(today.getMonth() + 1);

    events.push(
      {
        eventDate: nextWeek,
        type: 'exam',
        description: `Examen parcial de ${profile.occupation.current}`,
        priority: 'high',
        relationship: 'user',
        emotionalTone: 'Un poco nervioso pero preparado',
        eventHappened: false,
        isRecurring: false,
      },
      {
        eventDate: twoWeeks,
        type: 'other',
        description: 'Entrega de proyecto importante',
        priority: 'high',
        relationship: 'user',
        emotionalTone: 'Emocionado, es un proyecto que me apasiona',
        eventHappened: false,
        isRecurring: false,
      },
      {
        eventDate: oneMonth,
        type: 'exam',
        description: 'Examen final del semestre',
        priority: 'critical',
        relationship: 'user',
        emotionalTone: 'Es el examen más importante',
        eventHappened: false,
        isRecurring: false,
      }
    );
  } else {
    // Trabajador: generar eventos laborales
    const twoWeeks = new Date(today);
    twoWeeks.setDate(today.getDate() + 14);

    events.push({
      eventDate: twoWeeks,
      type: 'other',
      description: `Presentación importante en ${profile.occupation.workplace || 'trabajo'}`,
      priority: 'high',
      relationship: 'user',
      emotionalTone: 'Preparado y confiado',
      eventHappened: false,
      isRecurring: false,
    });
  }

  return events;
}

function generateSpecialEvents(profile: AgentProfileV2): GeneratedEvent[] {
  const events: GeneratedEvent[] = [];
  const today = new Date();

  // Viaje/vacaciones (2-3 meses)
  const vacation = new Date(today);
  vacation.setMonth(today.getMonth() + 2);

  events.push({
    eventDate: vacation,
    type: 'special',
    description: 'Viaje planeado con amigos/familia',
    priority: 'medium',
    relationship: 'user',
    emotionalTone: 'Muero de ganas, necesito unas vacaciones',
    eventHappened: false,
    isRecurring: false,
  });

  return events;
}

function estimateEventDate(ageAtEvent: number, currentAge: number): Date {
  const yearsAgo = currentAge - ageAtEvent;
  const today = new Date();
  const eventDate = new Date(today);
  eventDate.setFullYear(today.getFullYear() - yearsAgo);
  return eventDate;
}

// ============================================
// IMPORTANT PEOPLE GENERATION
// ============================================

export interface GeneratedPerson {
  name: string;
  relationship: string;
  age?: number;
  gender?: string;
  description?: string;
  interests?: string;
  importance: 'low' | 'medium' | 'high';
  mentionCount: number;
  metadata?: Record<string, any>;
}

/**
 * Genera ImportantPeople desde el profile (familia, amigos)
 */
export async function generateImportantPeopleFromProfile(
  agentId: string,
  profile: AgentProfileV2
): Promise<void> {
  const people: GeneratedPerson[] = [];

  // 1. Familia
  if (profile.family) {
    // Madre
    if (profile.family.mother) {
      people.push({
        name: profile.family.mother.name,
        relationship: 'madre',
        age: profile.family.mother.age,
        description: `${profile.family.mother.occupation}. ${profile.family.mother.personality}. Relación: ${profile.family.mother.relationship}`,
        importance: 'high',
        mentionCount: 0,
        metadata: {
          occupation: profile.family.mother.occupation,
          relationshipQuality: profile.family.mother.relationship,
        },
      });
    }

    // Padre
    if (profile.family.father) {
      people.push({
        name: profile.family.father.name,
        relationship: 'padre',
        age: profile.family.father.age,
        description: `${profile.family.father.occupation}. ${profile.family.father.personality}. Relación: ${profile.family.father.relationship}`,
        importance: 'high',
        mentionCount: 0,
        metadata: {
          occupation: profile.family.father.occupation,
          relationshipQuality: profile.family.father.relationship,
        },
      });
    }

    // Hermanos
    if (profile.family.siblings) {
      for (const sibling of profile.family.siblings) {
        people.push({
          name: sibling.name,
          relationship: 'hermano/a',
          age: sibling.age,
          description: `${sibling.occupation}. ${sibling.personality}. Relación: ${sibling.relationship}`,
          importance: 'high',
          mentionCount: 0,
          metadata: {
            occupation: sibling.occupation,
            relationshipQuality: sibling.relationship,
          },
        });
      }
    }

    // Mascotas
    if (profile.family.pets) {
      for (const pet of profile.family.pets) {
        people.push({
          name: pet.name,
          relationship: `${pet.type} (mascota)`,
          age: pet.age,
          description: `${pet.personality}`,
          importance: 'medium',
          mentionCount: 0,
          metadata: {
            type: pet.type,
            breed: pet.breed,
          },
        });
      }
    }
  }

  // 2. Amigos
  if (profile.socialCircle?.friends) {
    for (const friend of profile.socialCircle.friends) {
      people.push({
        name: friend.name,
        relationship: friend.relationshipType || 'amigo/a',
        age: friend.age,
        description: `${friend.howMet}. ${friend.personality}. Actividades juntos: ${friend.activities.join(', ')}`,
        interests: friend.activities.join(', '),
        importance: 'high',
        mentionCount: 0,
        metadata: {
          howMet: friend.howMet,
          activities: friend.activities,
        },
      });
    }
  }

  // Guardar en BD
  for (const person of people) {
    try {
      await prisma.importantPerson.create({
        data: {
          agentId,
          userId: agentId, // Self-referential para personas del agente
          ...person,
        },
      });
    } catch (error) {
      console.error('Error creating ImportantPerson:', error);
    }
  }

  console.log(`✅ Generated ${people.length} ImportantPeople for agent ${agentId}`);
}

// ============================================
// EPISODIC MEMORY GENERATION
// ============================================

export interface GeneratedMemory {
  timestamp: Date;
  category: 'conversation' | 'event' | 'insight' | 'emotional';
  content: string;
  emotionalValence: number; // -1 to 1
  importance: number; // 0 to 1
  participants?: string[];
  location?: string;
  tags?: string[];
}

/**
 * Genera 5-10 EpisodicMemories iniciales desde formative events
 */
export async function generateEpisodicMemoriesFromProfile(
  agentId: string,
  profile: AgentProfileV2
): Promise<void> {
  const memories: GeneratedMemory[] = [];

  // Convertir formative events en memorias episódicas
  if (profile.lifeExperiences?.formativeEvents) {
    for (const event of profile.lifeExperiences.formativeEvents) {
      const memoryDate = estimateEventDate(
        event.age,
        profile.basicIdentity.age
      );

      memories.push({
        timestamp: memoryDate,
        category: 'event',
        content: `${event.event}. ${event.impact}. ${event.howShapedThem}`,
        emotionalValence: event.emotionalWeight > 0.5 ? 0.7 : -0.7,
        importance: event.emotionalWeight,
        location: profile.currentLocation.city,
        tags: ['formative', 'life-changing'],
      });
    }
  }

  // Agregar memoria más feliz
  if (profile.lifeExperiences?.proudestMoment) {
    memories.push({
      timestamp: new Date(new Date().getFullYear() - 2, 6, 15), // Hace 2 años
      category: 'emotional',
      content: profile.lifeExperiences.proudestMoment,
      emotionalValence: 1.0,
      importance: 0.9,
      tags: ['proud', 'achievement'],
    });
  }

  // Agregar primera memoria (childhood)
  memories.push({
    timestamp: new Date(
      new Date().getFullYear() - profile.basicIdentity.age + 5,
      3,
      10
    ), // A los 5 años
    category: 'event',
    content: `Primera memoria de la infancia. ${profile.family?.childhoodHome || 'Recuerdo la casa donde crecí'}`,
    emotionalValence: 0.6,
    importance: 0.7,
    tags: ['childhood', 'first-memory'],
  });

  // Guardar en BD
  for (const memory of memories) {
    try {
      await prisma.episodicMemory.create({
        data: {
          agentId,
          event: memory.content, // Required field
          ...memory,
        },
      });
    } catch (error) {
      console.error('Error creating EpisodicMemory:', error);
    }
  }

  console.log(`✅ Generated ${memories.length} EpisodicMemories for agent ${agentId}`);
}

// ============================================
// EXAMPLE DIALOGUES GENERATION
// ============================================

/**
 * NOTA: Los example dialogues se generan DENTRO del profile JSON
 * No son una entidad separada en la BD
 *
 * Esta función es solo para documentar la estructura esperada
 */
export interface ExampleDialogue {
  context: string;
  userMessage: string;
  characterResponse: string;
  emotionalTone: string;
  showsTraits: string[];
}

/**
 * Los example dialogues se incluyen en el profile JSON
 * Ver: lib/services/profile-generation.service.ts
 */
