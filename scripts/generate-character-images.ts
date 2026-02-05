/**
 * Generate Images for New Fictional Characters
 * Uses AI Horde to generate avatar images for all characters
 */

import * as fs from 'fs';
import * as path from 'path';
import { getInitialImageGenerationService } from '../lib/smart-start/services/initial-image-generation.service';
import type { GenderType } from '../types/character-creation';

interface CharacterData {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'non-binary';
  profile: {
    basicInfo: {
      age: number;
      occupation: string;
      visualIdentity?: {
        photoDescription?: string;
      };
    };
    personality?: {
      coreTraits?: string[];
    };
  };
}

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

async function generateImages() {
  const processedDir = path.join(__dirname, '..', 'Personajes', 'processed');
  const publicDir = path.join(__dirname, '..', 'public', 'personajes');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const imageGenerator = getInitialImageGenerationService();

  let successCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  console.log('\n🎨 Iniciando generación de imágenes para 36 personajes...');
  console.log('⏱️  Tiempo estimado: ~6-10 minutos (usando AI Horde gratuito)\n');

  for (let i = 0; i < NEW_CHARACTER_SLUGS.length; i++) {
    const slug = NEW_CHARACTER_SLUGS[i];
    const jsonPath = path.join(processedDir, `${slug}.json`);

    if (!fs.existsSync(jsonPath)) {
      console.log(`⏭️  [${i + 1}/${NEW_CHARACTER_SLUGS.length}] ${slug} - No existe archivo JSON, saltando`);
      continue;
    }

    try {
      // Read character data
      const characterData: CharacterData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      // Create character directory
      const charDir = path.join(publicDir, slug);
      if (!fs.existsSync(charDir)) {
        fs.mkdirSync(charDir, { recursive: true });
      }

      // Check if avatar already exists
      const avatarPath = path.join(charDir, 'avatar.webp');
      if (fs.existsSync(avatarPath)) {
        console.log(`✅ [${i + 1}/${NEW_CHARACTER_SLUGS.length}] ${characterData.name} - Avatar ya existe, saltando`);
        successCount++;
        continue;
      }

      console.log(`🎨 [${i + 1}/${NEW_CHARACTER_SLUGS.length}] Generando avatar para ${characterData.name}...`);

      // Extract physical description
      const physicalDescription = characterData.profile.basicInfo.visualIdentity?.photoDescription ||
        `Professional ${characterData.profile.basicInfo.occupation.toLowerCase()} appearance`;

      // Map gender
      let gender: GenderType;
      switch (characterData.gender) {
        case 'male':
          gender = 'male';
          break;
        case 'female':
          gender = 'female';
          break;
        case 'non-binary':
          gender = 'non-binary';
          break;
        default:
          gender = 'other';
      }

      // Generate avatar only
      const avatarUrl = await imageGenerator.generateAvatarOnly({
        name: characterData.name,
        gender,
        age: characterData.profile.basicInfo.age,
        physicalAppearance: physicalDescription,
        style: 'realistic',
        userTier: 'ULTRA', // Use best quality
      });

      // AI Horde returns URL or base64
      let imageBuffer: Buffer;
      if (avatarUrl.startsWith('data:image')) {
        // Base64 data URL
        const base64Data = avatarUrl.split(',')[1];
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else if (avatarUrl.startsWith('http')) {
        // Fetch from URL
        const response = await fetch(avatarUrl);
        const arrayBuffer = await response.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
      } else {
        throw new Error('Invalid image URL format');
      }

      // Save image
      fs.writeFileSync(avatarPath, imageBuffer);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`   ✅ Avatar guardado (${elapsed}s transcurridos)`);
      successCount++;

      // Small delay to avoid overwhelming AI Horde
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`   ❌ Error generando imagen para ${slug}:`, error instanceof Error ? error.message : error);
      errorCount++;

      // Continue with next character even if one fails
      continue;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Generación de imágenes completada!');
  console.log('='.repeat(60));
  console.log(`✅ Exitosas: ${successCount}/${NEW_CHARACTER_SLUGS.length}`);
  console.log(`❌ Errores: ${errorCount}/${NEW_CHARACTER_SLUGS.length}`);
  console.log(`⏱️  Tiempo total: ${totalTime}s (${(parseFloat(totalTime) / 60).toFixed(1)} minutos)`);
  console.log('='.repeat(60) + '\n');

  if (errorCount > 0) {
    console.log('⚠️  Algunos personajes tuvieron errores. Puedes volver a ejecutar el script');
    console.log('   para intentar generar las imágenes faltantes.\n');
  }
}

generateImages().catch((error) => {
  console.error('\n❌ Error fatal:', error);
  process.exit(1);
});
