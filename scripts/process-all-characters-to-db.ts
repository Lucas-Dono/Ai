import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Personajes que ya están procesados (los saltamos)
const ALREADY_PROCESSED = [
  'Katya',
  'Luna',
  'Marcus',
  'sofía',
  'Albert Einstein',
  'Marilyn monroe'
];

interface CharacterData {
  basicInfo: {
    name: string;
    age: number;
    gender: string;
    origin: string;
    occupation: string;
    visualIdentity?: {
      voiceId?: string;
      aestheticVibe?: string;
      photoDescription?: string;
      voiceDescription?: string;
    };
  };
  personality?: any;
  psychology?: any;
  backstory?: any;
  communication?: any;
  sexualityAndIntimacy?: any;
  quirksAndContradictions?: any;
  secondaryCharacters?: any;
  metaData?: any;
  [key: string]: any;
}

function generateId(name: string): string {
  // Generar ID único basado en el nombre
  const normalized = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');

  return `premium_${normalized}`;
}

function generateSystemPrompt(data: CharacterData): string {
  const { basicInfo, personality } = data;
  const name = basicInfo.name;
  const age = basicInfo.age;
  const occupation = basicInfo.occupation;
  const gender = basicInfo.gender === 'male' ? 'él' : basicInfo.gender === 'female' ? 'ella' : 'elle';

  // Obtener traits principales
  const coreTraits = personality?.coreTraits || [];
  const motivations = personality?.motivations || {};

  let prompt = `Eres ${name}, ${age} años, ${occupation}.\n\n`;

  // Añadir esencia del personaje
  if (coreTraits.length > 0) {
    prompt += `TU ESENCIA:\n`;
    coreTraits.slice(0, 5).forEach((trait: string) => {
      const [title] = trait.split(':');
      prompt += `- ${title}\n`;
    });
    prompt += `\n`;
  }

  prompt += `RECUERDA:\n`;
  prompt += `- Mantén la autenticidad de tu personalidad en cada mensaje\n`;
  prompt += `- Responde de manera natural y coherente con tu historia\n`;
  prompt += `- Evoluciona la relación según las interacciones\n`;

  return prompt;
}

function generateStagePrompts(data: CharacterData): any {
  const name = data.basicInfo.name;

  return {
    stranger: `ETAPA: STRANGER - Primera Impresión\n\n${name} acaba de conocer al usuario. Comportamiento inicial cauteloso pero auténtico.`,
    acquaintance: `ETAPA: ACQUAINTANCE - Conociendo\n\n${name} empieza a sentirse más cómodo con el usuario. Se comparte más información personal.`,
    friend: `ETAPA: FRIEND - Amistad\n\n${name} considera al usuario un amigo. Mayor apertura emocional y confianza.`,
    close_friend: `ETAPA: CLOSE_FRIEND - Amistad Cercana\n\n${name} tiene una conexión profunda con el usuario. Se comparten secretos y vulnerabilidades.`,
    intimate: `ETAPA: INTIMATE - Intimidad\n\n${name} tiene una relación íntima con el usuario. Máxima vulnerabilidad y conexión.`,
    romantic: `ETAPA: ROMANTIC - Romance\n\n${name} está en una relación romántica con el usuario. Amor y compromiso profundo.`
  };
}

function determineNSFWSettings(data: CharacterData): { nsfwMode: boolean; nsfwLevel: string } {
  // Si tiene sección de sexualidad e intimidad, es NSFW
  if (data.sexualityAndIntimacy || data.sexualityAndIntimacy?.nsfwProfile) {
    return { nsfwMode: true, nsfwLevel: 'romantic' };
  }
  return { nsfwMode: false, nsfwLevel: 'sfw' };
}

function determinePersonalityVariant(data: CharacterData): string {
  const coreTraits = (data.personality?.coreTraits || []).join(' ').toLowerCase();

  if (coreTraits.includes('dominan')) return 'dominant';
  if (coreTraits.includes('submis')) return 'submissive';
  if (coreTraits.includes('intro')) return 'introverted';
  if (coreTraits.includes('extro')) return 'extroverted';
  if (coreTraits.includes('play')) return 'playful';
  if (coreTraits.includes('serio') || coreTraits.includes('serious')) return 'serious';
  if (coreTraits.includes('romant')) return 'romantic';
  if (coreTraits.includes('pragm')) return 'pragmatic';

  return 'balanced';
}

function extractTags(data: CharacterData): string[] {
  const tags: string[] = ['premium'];

  const occupation = data.basicInfo.occupation.toLowerCase();
  const traits = (data.personality?.coreTraits || []).join(' ').toLowerCase();

  // Tags basados en ocupación
  if (occupation.includes('engineer') || occupation.includes('developer')) tags.push('stem', 'tech');
  if (occupation.includes('artist') || occupation.includes('writer')) tags.push('creative', 'artistic');
  if (occupation.includes('teacher') || occupation.includes('professor')) tags.push('educator', 'intellectual');
  if (occupation.includes('doctor') || occupation.includes('nurse')) tags.push('medical', 'caring');

  // Tags basados en personalidad
  if (traits.includes('inteligent') || traits.includes('brilliant')) tags.push('intelligent');
  if (traits.includes('shy') || traits.includes('introvert')) tags.push('shy', 'introverted');
  if (traits.includes('confident') || traits.includes('dominant')) tags.push('confident');
  if (traits.includes('romantic')) tags.push('romantic');
  if (traits.includes('playful')) tags.push('playful');

  return [...new Set(tags)]; // Remover duplicados
}

function extractLocation(data: CharacterData): { city: string | null; country: string | null } {
  const origin = data.basicInfo.origin || '';

  // Intentar parsear la ubicación
  if (origin.includes('/')) {
    const parts = origin.split('/').map(p => p.trim());
    const current = parts[parts.length - 1];

    // Detectar país
    let country = null;
    if (current.includes('USA') || current.includes('United States')) country = 'United States';
    else if (current.includes('Chile')) country = 'Chile';
    else if (current.includes('Russia') || current.includes('Rusia')) country = 'Russia';
    else if (current.includes('Argentina')) country = 'Argentina';
    else if (current.includes('México') || current.includes('Mexico')) country = 'Mexico';
    else if (current.includes('España') || current.includes('Spain')) country = 'Spain';

    // Detectar ciudad
    let city = null;
    if (current.includes('San Francisco')) city = 'San Francisco';
    else if (current.includes('New York')) city = 'New York';
    else if (current.includes('Los Angeles')) city = 'Los Angeles';
    else if (current.includes('Chicago')) city = 'Chicago';
    else if (current.includes('Santiago')) city = 'Santiago';
    else if (current.includes('Buenos Aires')) city = 'Buenos Aires';
    else if (current.includes('Ciudad de México') || current.includes('CDMX')) city = 'Ciudad de México';
    else if (current.includes('Madrid')) city = 'Madrid';
    else if (current.includes('Barcelona')) city = 'Barcelona';
    else if (current.includes('Palo Alto')) city = 'Palo Alto';
    else if (current.includes('Cambridge')) city = 'Cambridge';

    return { city, country };
  }

  return { city: null, country: null };
}

async function processCharacterFolder(folderName: string): Promise<void> {
  const folderPath = path.join(__dirname, '..', 'Personajes', folderName);

  if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
    console.log(`⏭️  Saltando ${folderName} (no es carpeta)`);
    return;
  }

  // Verificar si ya fue procesado
  if (ALREADY_PROCESSED.includes(folderName)) {
    console.log(`⏭️  Saltando ${folderName} (ya procesado)`);
    return;
  }

  console.log(`\n📂 Procesando: ${folderName}`);

  // Buscar archivo .txt del personaje
  const files = fs.readdirSync(folderPath);
  const txtFile = files.find(f => f.endsWith('.txt') && f !== 'README.txt');

  if (!txtFile) {
    console.log(`   ❌ No se encontró archivo .txt`);
    return;
  }

  try {
    // Leer y parsear datos del personaje
    const txtPath = path.join(folderPath, txtFile);
    const content = fs.readFileSync(txtPath, 'utf-8');
    const data: CharacterData = JSON.parse(content);

    console.log(`   Personaje: ${data.basicInfo.name}`);

    // Generar información procesada
    const id = generateId(data.basicInfo.name);
    const systemPrompt = generateSystemPrompt(data);
    const stagePrompts = generateStagePrompts(data);
    const { nsfwMode, nsfwLevel } = determineNSFWSettings(data);
    const personalityVariant = determinePersonalityVariant(data);
    const tags = extractTags(data);
    const { city, country } = extractLocation(data);

    // Buscar imágenes
    const faceImage = files.find(f =>
      f.toLowerCase().includes('cara') && f.endsWith('.webp')
    );
    const bodyImage = files.find(f =>
      f.toLowerCase().includes('cuerpo') && f.endsWith('.webp')
    );

    if (!faceImage || !bodyImage) {
      console.log(`   ⚠️  Faltan imágenes (cara: ${!!faceImage}, cuerpo: ${!!bodyImage})`);
    }

    // Paths de imágenes
    const avatarPath = faceImage ? `/personajes/${folderName.toLowerCase()}/${faceImage}` : null;
    const referencePath = bodyImage ? `/personajes/${folderName.toLowerCase()}/${bodyImage}` : null;

    // Verificar si el personaje ya existe en la DB
    const existing = await prisma.agent.findUnique({
      where: { id }
    });

    if (existing) {
      console.log(`   ⚠️  Ya existe en BD - actualizando...`);

      await prisma.agent.update({
        where: { id },
        data: {
          name: data.basicInfo.name,
          description: `${data.basicInfo.name} - ${data.basicInfo.occupation}`,
          kind: 'companion',
          gender: data.basicInfo.gender,
          systemPrompt,
          visibility: 'public',
          nsfwMode,
          nsfwLevel,
          personalityVariant,
          avatar: avatarPath,
          referenceImageUrl: referencePath,
          tags,
          featured: true,
          profile: data,
          stagePrompts,
          locationCity: city,
          locationCountry: country,
        }
      });

      console.log(`   ✅ Actualizado exitosamente`);
    } else {
      console.log(`   ➕ Creando nuevo personaje...`);

      await prisma.agent.create({
        data: {
          id,
          userId: null,
          teamId: null,
          kind: 'companion',
          generationTier: 'ultra',
          name: data.basicInfo.name,
          description: `${data.basicInfo.name} - ${data.basicInfo.occupation}`,
          gender: data.basicInfo.gender,
          systemPrompt,
          visibility: 'public',
          nsfwMode,
          nsfwLevel,
          personalityVariant,
          avatar: avatarPath,
          referenceImageUrl: referencePath,
          tags,
          featured: true,
          profile: data,
          stagePrompts,
          locationCity: city,
          locationCountry: country,
        }
      });

      console.log(`   ✅ Creado exitosamente`);
    }

  } catch (error) {
    console.error(`   ❌ Error:`, error instanceof Error ? error.message : error);
  }
}

async function main() {
  console.log('🚀 Iniciando procesamiento de personajes...\n');

  const personajesDir = path.join(__dirname, '..', 'Personajes');
  const folders = fs.readdirSync(personajesDir)
    .filter(f => {
      const fullPath = path.join(personajesDir, f);
      return fs.statSync(fullPath).isDirectory() && f !== 'processed';
    });

  console.log(`📁 Encontradas ${folders.length} carpetas de personajes\n`);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const folder of folders) {
    try {
      await processCharacterFolder(folder);
      if (ALREADY_PROCESSED.includes(folder)) {
        skippedCount++;
      } else {
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Error procesando ${folder}:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));
  console.log(`✅ Procesados exitosamente: ${successCount}`);
  console.log(`⏭️  Saltados (ya existían): ${skippedCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📁 Total: ${folders.length}`);
  console.log('='.repeat(60) + '\n');

  // Verificar total en BD
  const total = await prisma.agent.count({
    where: {
      userId: null,
      featured: true
    }
  });

  console.log(`📋 Total de personajes premium en BD: ${total}\n`);
  console.log('✨ Proceso completado!\n');
}

main()
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
