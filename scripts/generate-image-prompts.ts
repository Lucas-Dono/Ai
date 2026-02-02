/**
 * Generate Image Prompts for All Characters
 * Creates prompts for avatar (face) and full-body images
 */

import * as fs from 'fs';
import * as path from 'path';

// Solo los 36 nuevos personajes que NO tienen imágenes
const NEW_CHARACTER_SLUGS = [
  'dr-kira-nakamura',
  'axel-winters',
  'dr-amara-osei',
  'viktor-kozlov',
  'maya-patel',
  'theo-santos',
  'lucia-martinez',
  'jasper-blake',
  'nadia-khoury',
  'diego-vargas',
  'iris-chen',
  'roman-volkov',
  'dr-samira-hassan',
  'luca-moretti',
  'dr-aisha-mohammed',
  'kai-tanaka',
  'dr-marcus-kline',
  'yara-al-farsi',
  'sienna-brooks',
  'rajesh-kumar',
  'tania-volkov',
  'andre-dubois',
  'amina-diallo',
  'henrik-larsen',
  'dr-elena-petrova',
  'omar-rashid',
  'dr-grace-nkosi',
  'prof-akira-sato',
  'dr-fatima-zahra',
  'dr-santiago-rojas',
  'zoe-park',
  'finn-oreilly',
  'leila-novak',
  'miles-washington',
  'saskia-van-der-meer',
  'tomas-silva',
];

interface CharacterData {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'non-binary';
  profile: {
    basicInfo: {
      age: number;
      occupation: string;
      origin?: string;
      visualIdentity?: {
        photoDescription?: string;
      };
    };
    personality?: {
      coreTraits?: string[];
    };
  };
}

function buildAvatarPrompt(character: CharacterData): string {
  const { name, gender, profile } = character;
  const age = profile.basicInfo.age;
  const occupation = profile.basicInfo.occupation;
  const visualDescription = profile.basicInfo.visualIdentity?.photoDescription || '';

  // Extraer rasgos clave de personalidad
  const traits = profile.personality?.coreTraits?.slice(0, 3).map(t => {
    const trait = t.split(':')[0].toLowerCase();
    return trait;
  }).join(', ') || '';

  // Determinar género en inglés para el prompt
  let genderTerm = 'person';
  if (gender === 'male') genderTerm = 'man';
  else if (gender === 'female') genderTerm = 'woman';

  const prompt = `Professional headshot portrait of a ${age}-year-old ${genderTerm}, ${occupation}. ${visualDescription}. ${traits ? `Personality: ${traits}.` : ''} High-quality professional photography, studio lighting, sharp focus on face, neutral expression, looking at camera, photorealistic, 8k quality, detailed facial features`;

  return prompt;
}

function buildFullBodyPrompt(character: CharacterData): string {
  const { name, gender, profile } = character;
  const age = profile.basicInfo.age;
  const occupation = profile.basicInfo.occupation;
  const visualDescription = profile.basicInfo.visualIdentity?.photoDescription || '';

  // Extraer rasgos clave de personalidad
  const traits = profile.personality?.coreTraits?.slice(0, 3).map(t => {
    const trait = t.split(':')[0].toLowerCase();
    return trait;
  }).join(', ') || '';

  // Determinar género en inglés para el prompt
  let genderTerm = 'person';
  if (gender === 'male') genderTerm = 'man';
  else if (gender === 'female') genderTerm = 'woman';

  const prompt = `USE THE EXACT SAME FACE from the attached reference image. Full body portrait of a ${age}-year-old ${genderTerm}, ${occupation}. ${visualDescription}. ${traits ? `Personality: ${traits}.` : ''} IMPORTANT: Match the facial features, skin tone, hair style, and overall appearance EXACTLY as shown in the reference photo. Standing pose, professional attire appropriate for occupation, confident posture, photorealistic, 8k quality, detailed, TRANSPARENT BACKGROUND, isolated subject, no background, studio shot`;

  return prompt;
}

async function generateAllPrompts() {
  const processedDir = path.join(__dirname, '..', 'Personajes', 'processed');
  const outputFile = path.join(__dirname, '..', 'character-image-prompts.txt');

  // Filtrar solo los nuevos personajes
  const files = NEW_CHARACTER_SLUGS.map(slug => `${slug}.json`);

  let output = '='.repeat(80) + '\n';
  output += 'PROMPTS DE GENERACIÓN DE IMÁGENES PARA NUEVOS PERSONAJES\n';
  output += 'Total: ' + files.length + ' personajes (sin contar los 24 originales que ya tienen imágenes)\n';
  output += '='.repeat(80) + '\n\n';

  console.log(`\n📝 Generando prompts para ${files.length} NUEVOS personajes...\n`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(processedDir, file);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  [${i + 1}/${files.length}] ${file} - No existe, saltando`);
      continue;
    }

    const character: CharacterData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const slug = file.replace('.json', '');

    output += '━'.repeat(80) + '\n';
    output += `PERSONAJE ${i + 1}/${files.length}: ${character.name}\n`;
    output += `Archivo: ${slug}\n`;
    output += `Género: ${character.gender} | Edad: ${character.profile.basicInfo.age} | Ocupación: ${character.profile.basicInfo.occupation}\n`;
    output += '━'.repeat(80) + '\n\n';

    // Avatar prompt
    output += '🖼️  PROMPT PARA AVATAR (CARA):\n';
    output += '-'.repeat(80) + '\n';
    output += buildAvatarPrompt(character) + '\n';
    output += '-'.repeat(80) + '\n\n';

    // Full-body prompt
    output += '👤 PROMPT PARA CUERPO COMPLETO (FONDO TRANSPARENTE):\n';
    output += '-'.repeat(80) + '\n';
    output += buildFullBodyPrompt(character) + '\n';
    output += '-'.repeat(80) + '\n\n';

    console.log(`✅ [${i + 1}/${files.length}] ${character.name}`);
  }

  output += '='.repeat(80) + '\n';
  output += 'FIN DEL ARCHIVO\n';
  output += '='.repeat(80) + '\n';

  fs.writeFileSync(outputFile, output, 'utf-8');

  console.log(`\n🎉 Prompts generados exitosamente!`);
  console.log(`📄 Archivo guardado en: ${outputFile}\n`);
  console.log(`📊 Total de personajes: ${files.length}`);
  console.log(`📊 Total de prompts: ${files.length * 2} (${files.length} avatares + ${files.length} cuerpos completos)\n`);
}

generateAllPrompts().catch(console.error);
