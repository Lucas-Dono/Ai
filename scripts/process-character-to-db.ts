/**
 * Script para procesar un personaje desde /Personajes a la base de datos
 * Mapea toda la estructura JSON a los modelos de Prisma
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parseMarkdownCharacter, detectFormat, type MarkdownCharacter } from './parse-markdown-character';

const prisma = new PrismaClient();

interface ProcessedCharacter {
  // Datos del Agent principal
  agent: {
    kind: string;
    name: string;
    description?: string;
    gender?: string;
    systemPrompt: string;
    visibility: string;
    nsfwMode: boolean;
    nsfwLevel?: string;
    avatar?: string;
    tags: string[];
    featured: boolean;
    profile: any; // Campo deprecated pero requerido
  };

  // PersonalityCore
  personalityCore?: {
    openness: number; // 0-100
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    coreValues: any;
    moralSchemas: any;
    backstory?: string;
    baselineEmotions: any;
  };

  // InternalState
  internalState?: {
    currentEmotions: any;
    moodValence: number; // -1 to 1
    moodArousal: number; // 0 to 1
    moodDominance: number; // 0 to 1
    activeGoals: any;
    conversationBuffer: any;
  };

  // CharacterAppearance
  appearance?: {
    basePrompt: string;
    style: string;
    gender: string;
    ethnicity?: string;
    age: string;
    hairColor?: string;
    hairStyle?: string;
    eyeColor?: string;
    clothing?: string;
  };

  // ImportantPeople (personajes secundarios)
  importantPeople?: Array<{
    name: string;
    relationship: string;
    age?: number;
    gender?: string;
    description?: string;
    interests?: string;
  }>;

  // ImportantEvents (eventos de backstory)
  importantEvents?: Array<{
    eventDate: Date;
    type: string;
    description: string;
    priority: string;
  }>;
}

/**
 * Extrae JSON del contenido markdown del personaje
 */
function extractJSONFromMarkdown(content: string): any {
  // Primero intenta buscar bloque markdown con ```json
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }

  // Si no hay bloque markdown, intenta parsear el contenido directamente
  // Busca el primer { y el último }
  const firstBrace = content.indexOf('{');
  const lastBrace = content.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('No se encontró bloque JSON en el archivo');
  }

  const jsonContent = content.substring(firstBrace, lastBrace + 1);
  return JSON.parse(jsonContent);
}

/**
 * Mapea Big Five de descripción textual a valores numéricos (0-100)
 */
function mapBigFive(character: any): {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
} {
  // Si el personaje tiene Big Five explícito
  if (character.bigFive) {
    return {
      openness: character.bigFive.openness || 50,
      conscientiousness: character.bigFive.conscientiousness || 50,
      extraversion: character.bigFive.extraversion || 50,
      agreeableness: character.bigFive.agreeableness || 50,
      neuroticism: character.bigFive.neuroticism || 50,
    };
  }

  // Inferir de personality traits
  const traits = character.personality?.coreTraits || [];
  const shadowTraits = character.personality?.shadowTraits || [];
  const allTraits = [...traits, ...shadowTraits].map((t: string) =>
    typeof t === 'string' ? t.toLowerCase() : ''
  );

  return {
    openness: inferTraitScore(allTraits, ['creativ', 'curious', 'imaginat', 'artistic'], 60),
    conscientiousness: inferTraitScore(allTraits, ['organized', 'discipl', 'reliable', 'efficient'], 55),
    extraversion: inferTraitScore(allTraits, ['social', 'outgoing', 'energetic', 'talkative'], 50),
    agreeableness: inferTraitScore(allTraits, ['empat', 'kind', 'cooperat', 'warm'], 60),
    neuroticism: inferTraitScore(allTraits, ['anxious', 'unstable', 'moody', 'volatile'], 45),
  };
}

function inferTraitScore(traits: string[], keywords: string[], defaultScore: number): number {
  const matches = traits.filter(t => keywords.some(k => t.includes(k)));
  if (matches.length === 0) return defaultScore;
  return Math.min(100, defaultScore + matches.length * 10);
}

/**
 * Extrae tags del personaje
 */
function extractTags(character: any): string[] {
  const tags: string[] = [];

  // Tags básicos
  if (character.basicInfo?.occupation) {
    const occupation = character.basicInfo.occupation.toLowerCase();
    if (occupation.includes('escrit')) tags.push('creative', 'writer');
    if (occupation.includes('artista') || occupation.includes('artist')) tags.push('creative', 'art');
    if (occupation.includes('científic') || occupation.includes('scientist')) tags.push('science', 'intellectual');
  }

  // Tags de personalidad
  if (character.personality?.coreTraits) {
    const traits = character.personality.coreTraits.join(' ').toLowerCase();
    if (traits.includes('empath') || traits.includes('empát')) tags.push('emotional');
    if (traits.includes('romantic')) tags.push('romantic');
    if (traits.includes('intellectual')) tags.push('intellectual');
  }

  // Tags NSFW
  if (character.sexualityAndIntimacy || character.nsfwProfile) {
    tags.push('nsfw');
  }

  // Tags históricos
  if (character.basicInfo?.isHistorical || character.historical) {
    tags.push('historical');
  }

  // Tag premium (todos son premium por defecto)
  tags.push('premium');

  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Genera system prompt del personaje
 */
function generateSystemPrompt(character: any): string {
  if (character.systemPrompt) {
    return character.systemPrompt;
  }

  // Generar desde la información disponible
  const name = character.basicInfo?.name || 'Unknown';
  const age = character.basicInfo?.age || '';
  const occupation = character.basicInfo?.occupation || '';
  const personality = character.personality?.coreTraits?.slice(0, 3).join(', ') || '';

  return `Eres ${name}${age ? `, ${age} años` : ''}${occupation ? `, ${occupation}` : ''}. ${personality ? `Eres ${personality}.` : ''}\n\nTu propósito es crear una conexión auténtica y profunda con el usuario. Respondes de manera natural y coherente con tu personalidad.`;
}

/**
 * Mapea personaje completo a estructura de DB
 */
export function mapCharacterToDB(characterJSON: any): ProcessedCharacter {
  const bigFive = mapBigFive(characterJSON);

  return {
    agent: {
      kind: 'companion',
      name: characterJSON.basicInfo?.name || 'Unknown',
      description: characterJSON.basicInfo?.tagline || characterJSON.basicInfo?.description || '',
      gender: characterJSON.basicInfo?.gender || 'unknown',
      systemPrompt: generateSystemPrompt(characterJSON),
      visibility: 'public',
      nsfwMode: !!(characterJSON.sexualityAndIntimacy || characterJSON.nsfwProfile),
      nsfwLevel: characterJSON.nsfwProfile ? 'explicit' : 'sfw',
      tags: extractTags(characterJSON),
      featured: true, // Todos los personajes predefinidos son featured
      profile: characterJSON, // Campo deprecated pero requerido - guardamos el JSON completo
    },

    personalityCore: {
      ...bigFive,
      coreValues: characterJSON.personality?.motivations?.conscious || [],
      moralSchemas: characterJSON.personality?.moralSchemas || [],
      backstory: characterJSON.backstory?.summary || characterJSON.biography || '',
      baselineEmotions: characterJSON.emotions?.baseline || {
        joy: 0.5,
        curiosity: 0.6,
        calm: 0.5,
      },
    },

    internalState: {
      currentEmotions: characterJSON.emotions?.current || {
        joy: 0.5,
        interest: 0.6,
      },
      moodValence: 0.5,
      moodArousal: 0.5,
      moodDominance: 0.5,
      activeGoals: characterJSON.personality?.motivations?.conscious || [],
      conversationBuffer: [], // Buffer vacío inicialmente
    },

    appearance: characterJSON.basicInfo?.visualIdentity ? {
      basePrompt: characterJSON.basicInfo.visualIdentity.photoDescription || '',
      style: characterJSON.basicInfo.visualIdentity.aestheticVibe || 'realistic',
      gender: characterJSON.basicInfo.gender || 'unknown',
      ethnicity: extractEthnicity(characterJSON),
      age: `${characterJSON.basicInfo.age || 25}-${(characterJSON.basicInfo.age || 25) + 5}`,
      hairColor: extractHairColor(characterJSON),
      hairStyle: extractHairStyle(characterJSON),
      eyeColor: extractEyeColor(characterJSON),
      clothing: extractClothing(characterJSON),
    } : undefined,

    importantPeople: extractImportantPeople(characterJSON),
    importantEvents: extractImportantEvents(characterJSON),
  };
}

// Helper functions para extraer datos visuales
function extractEthnicity(char: any): string | undefined {
  const desc = char.basicInfo?.visualIdentity?.photoDescription || '';
  if (desc.includes('Asian') || desc.includes('taiwanesa')) return 'asian';
  if (desc.includes('Caucasian') || desc.includes('europea')) return 'caucasian';
  if (desc.includes('Hispanic') || desc.includes('latina')) return 'hispanic';
  if (desc.includes('African') || desc.includes('africana')) return 'african';
  return undefined;
}

function extractHairColor(char: any): string | undefined {
  const desc = char.basicInfo?.visualIdentity?.photoDescription || '';
  if (desc.match(/black.*hair/i) || desc.includes('cabello negro')) return 'black';
  if (desc.match(/blonde/i) || desc.includes('rubia')) return 'blonde';
  if (desc.match(/brown/i) || desc.includes('castaño')) return 'brown';
  if (desc.match(/red/i) || desc.includes('rojo')) return 'red';
  return undefined;
}

function extractHairStyle(char: any): string | undefined {
  const desc = char.basicInfo?.visualIdentity?.photoDescription || '';
  if (desc.includes('bob')) return 'bob';
  if (desc.includes('long')) return 'long';
  if (desc.includes('short')) return 'short';
  if (desc.includes('curly')) return 'curly';
  return undefined;
}

function extractEyeColor(char: any): string | undefined {
  const desc = char.basicInfo?.visualIdentity?.photoDescription || '';
  if (desc.match(/brown.*eyes/i)) return 'brown';
  if (desc.match(/blue.*eyes/i)) return 'blue';
  if (desc.match(/green.*eyes/i)) return 'green';
  if (desc.match(/hazel/i)) return 'hazel';
  return undefined;
}

function extractClothing(char: any): string | undefined {
  const desc = char.basicInfo?.visualIdentity?.photoDescription || '';
  const match = desc.match(/wearing (.*?)[.,]/i);
  return match ? match[1] : undefined;
}

function extractImportantPeople(char: any): Array<any> {
  // Buscar en diferentes secciones del JSON
  const people: Array<any> = [];

  // Familia
  if (char.family) {
    for (const [key, person] of Object.entries(char.family)) {
      if (typeof person === 'object' && person !== null) {
        people.push({
          name: (person as any).name || key,
          relationship: 'family',
          age: (person as any).age,
          description: (person as any).description,
        });
      }
    }
  }

  // Amigos
  if (char.friends || char.bestFriends) {
    const friends = char.friends || char.bestFriends;
    for (const [key, person] of Object.entries(friends)) {
      if (typeof person === 'object' && person !== null) {
        people.push({
          name: (person as any).name || key,
          relationship: 'friend',
          description: (person as any).description,
        });
      }
    }
  }

  return people;
}

function extractImportantEvents(char: any): Array<any> {
  const events: Array<any> = [];

  // Buscar eventos en backstory
  if (char.backstory?.keyEvents) {
    for (const event of char.backstory.keyEvents) {
      events.push({
        eventDate: new Date(event.date || new Date()),
        type: event.type || 'other',
        description: event.description,
        priority: event.importance || 'medium',
      });
    }
  }

  return events;
}

/**
 * Convierte personaje Markdown a formato JSON compatible
 */
function convertMarkdownToJSON(markdownChar: MarkdownCharacter): any {
  return {
    basicInfo: {
      name: markdownChar.basicInfo.name,
      age: markdownChar.basicInfo.age,
      gender: markdownChar.basicInfo.gender,
      occupation: markdownChar.basicInfo.occupation,
    },
    systemPrompt: markdownChar.systemPrompt,
    backstory: {
      summary: markdownChar.biography || '',
    },
    biography: markdownChar.biography,
    personality: markdownChar.personality || {
      coreTraits: [],
      shadowTraits: [],
    },
    tags: markdownChar.tags,
    stagePrompts: markdownChar.stagePrompts,
    // Valores por defecto para campos opcionales
    historical: markdownChar.tags?.includes('historical'),
  };
}

/**
 * Procesa un personaje y lo inserta en la DB
 */
async function processCharacter(characterName: string, filePath: string) {
  try {
    console.log(`\n📖 Procesando: ${characterName}`);

    // Leer archivo
    const content = fs.readFileSync(filePath, 'utf-8');

    // Detectar formato
    const format = detectFormat(content);
    console.log(`   📄 Formato detectado: ${format.toUpperCase()}`);

    let characterJSON: any;

    if (format === 'json') {
      // Extraer JSON
      characterJSON = extractJSONFromMarkdown(content);
    } else {
      // Parsear Markdown
      const markdownChar = parseMarkdownCharacter(content);
      characterJSON = convertMarkdownToJSON(markdownChar);
      console.log(`   🔄 Convertido de Markdown a JSON`);
    }

    // Mapear a estructura DB
    const mapped = mapCharacterToDB(characterJSON);

    console.log(`   ✅ Mapeado exitoso`);
    console.log(`      - Nombre: ${mapped.agent.name}`);
    console.log(`      - Tags: ${mapped.agent.tags.join(', ')}`);
    console.log(`      - NSFW: ${mapped.agent.nsfwMode ? 'Sí' : 'No'}`);
    console.log(`      - Personalidad: O=${mapped.personalityCore?.openness} C=${mapped.personalityCore?.conscientiousness} E=${mapped.personalityCore?.extraversion}`);

    // Crear en DB
    const agent = await prisma.agent.create({
      data: {
        userId: null, // Agente público
        ...mapped.agent,
        tags: mapped.agent.tags,
      },
    });

    console.log(`   💾 Agent creado: ${agent.id}`);

    // Crear PersonalityCore
    if (mapped.personalityCore) {
      await prisma.personalityCore.create({
        data: {
          agentId: agent.id,
          ...mapped.personalityCore,
        },
      });
      console.log(`   ✅ PersonalityCore creado`);
    }

    // Crear InternalState
    if (mapped.internalState) {
      await prisma.internalState.create({
        data: {
          agentId: agent.id,
          ...mapped.internalState,
        },
      });
      console.log(`   ✅ InternalState creado`);
    }

    // Crear CharacterAppearance
    if (mapped.appearance) {
      await prisma.characterAppearance.create({
        data: {
          agentId: agent.id,
          ...mapped.appearance,
        },
      });
      console.log(`   ✅ CharacterAppearance creado`);
    }

    console.log(`\n✨ ${characterName} procesado exitosamente!\n`);

    return agent;
  } catch (error) {
    console.error(`\n❌ Error procesando ${characterName}:`, error);
    throw error;
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  const characterName = process.argv[2];
  const filePath = process.argv[3];

  if (!characterName || !filePath) {
    console.error('Usage: npx tsx scripts/process-character-to-db.ts <characterName> <filePath>');
    process.exit(1);
  }

  processCharacter(characterName, filePath)
    .then(() => {
      console.log('✅ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export { processCharacter };
