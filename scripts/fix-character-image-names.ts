/**
 * Estandarizar nombres de imágenes de personajes
 * Convertir "Foto-de-la-cara.png" → "avatar.webp"
 * Convertir "Foto-del-cuerpo.png" / "Foto-completa.png" → "reference.webp"
 */

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const PERSONAJES_ORIGINALES = [
  'amara-okafor',
  'aria-rosenberg',
  'atlas-stone',
  'dante-rossi',
  'elena-moreno',
  'ethan-cross',
  'isabella-ferreira',
  'james-obrien',
  'katya',
  'liam-oconnor',
  'luna',
  'marcus',
  'marcus-washington',
  'mia-chen',
  'noah-kepler',
  'oliver-chen',
  'priya-sharma',
  'rafael-costa',
  'rei-takahashi',
  'sebastian-muller',
  'sofia',
  'sofia-volkov',
  'yuki-tanaka',
  'zara-malik',
];

async function convertToWebP(inputPath: string, outputPath: string): Promise<void> {
  await sharp(inputPath)
    .webp({ quality: 90 })
    .toFile(outputPath);
}

async function fixImageNames() {
  const publicDir = path.join(__dirname, '..', 'public', 'personajes');

  console.log('\n🔧 Estandarizando nombres de imágenes...\n');

  let fixed = 0;
  let errors = 0;

  for (const slug of PERSONAJES_ORIGINALES) {
    const charDir = path.join(publicDir, slug);

    if (!fs.existsSync(charDir)) {
      console.log(`⏭️  ${slug} - Carpeta no existe`);
      continue;
    }

    try {
      // Buscar imagen de cara
      const possibleFaceNames = [
        'Foto-de-la-cara.png',
        'Foto-de-la-cara.webp',
        'cara.png',
        'cara.webp',
        'face.png',
        'face.webp',
      ];

      let faceSource: string | null = null;
      for (const name of possibleFaceNames) {
        const testPath = path.join(charDir, name);
        if (fs.existsSync(testPath)) {
          faceSource = testPath;
          break;
        }
      }

      // Buscar imagen de cuerpo
      const possibleBodyNames = [
        'Foto-del-cuerpo.png',
        'Foto-completa.png',
        'Foto-del-cuerpo.webp',
        'Foto-completa.webp',
        'cuerpo.png',
        'cuerpo.webp',
        'body.png',
        'body.webp',
        'reference.png',
      ];

      let bodySource: string | null = null;
      for (const name of possibleBodyNames) {
        const testPath = path.join(charDir, name);
        if (fs.existsSync(testPath)) {
          bodySource = testPath;
          break;
        }
      }

      const avatarPath = path.join(charDir, 'avatar.webp');
      const referencePath = path.join(charDir, 'reference.webp');

      let fixedAvatar = false;
      let fixedReference = false;

      // Convertir/copiar avatar
      if (faceSource && !fs.existsSync(avatarPath)) {
        if (faceSource.endsWith('.webp')) {
          fs.copyFileSync(faceSource, avatarPath);
        } else {
          await convertToWebP(faceSource, avatarPath);
        }
        fixedAvatar = true;
      }

      // Convertir/copiar reference
      if (bodySource && !fs.existsSync(referencePath)) {
        if (bodySource.endsWith('.webp')) {
          fs.copyFileSync(bodySource, referencePath);
        } else {
          await convertToWebP(bodySource, referencePath);
        }
        fixedReference = true;
      }

      if (fixedAvatar || fixedReference) {
        const parts = [];
        if (fixedAvatar) parts.push('avatar');
        if (fixedReference) parts.push('reference');
        console.log(`✅ ${slug} - Estandarizado: ${parts.join(', ')}`);
        fixed++;
      } else if (fs.existsSync(avatarPath)) {
        console.log(`⏭️  ${slug} - Ya está estandarizado`);
      } else {
        console.log(`⚠️  ${slug} - No se encontraron imágenes`);
      }
    } catch (error) {
      console.error(`❌ ${slug} - Error:`, error instanceof Error ? error.message : error);
      errors++;
    }
  }

  console.log('\n📊 RESUMEN:');
  console.log(`  ✅ Personajes arreglados:  ${fixed}`);
  console.log(`  ❌ Errores:                ${errors}`);
  console.log('\n💡 Ejecuta el script check-character-images.ts para verificar el estado final\n');
}

fixImageNames().catch(console.error);
