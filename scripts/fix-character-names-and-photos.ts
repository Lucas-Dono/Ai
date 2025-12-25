/**
 * Script para limpiar nombres de personajes y verificar fotos
 *
 * 1. Limpia headers en archivos .txt (quita "PERFIL DE PERSONAJE", etc.)
 * 2. Verifica que avatars en JSONs apunten a fotos existentes
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

interface CharacterJSON {
  id: string;
  name: string;
  avatar?: string;
}

function cleanCharacterName(name: string): string {
  // Quitar sufijos comunes
  return name
    .replace(/\s*-\s*PERFIL DE PERSONAJE PARA IA CONVERSACIONAL$/i, '')
    .replace(/\s*-\s*PERFIL COMPLETO DE PERSONAJE IA$/i, '')
    .replace(/\s*-\s*PERFIL COMPLETO$/i, '')
    .replace(/\s*:\s*Perfil Emocional y Psicológico.*$/i, '')
    .replace(/\s*:\s*Perfil Completo.*$/i, '')
    .replace(/\s*-\s*THE MOUNTAIN PHILOSOPHER$/i, '')
    .replace(/\s*-\s*AUGUSTA ADA KING.*$/i, '')
    .trim();
}

function findBestAvatar(characterId: string): string | null {
  const basePath = join(process.cwd(), 'public', 'personajes');

  // Posibles nombres de carpeta (el ID puede variar en capitalización)
  const possibleDirs = [
    characterId,
    characterId.toLowerCase(),
    characterId.replace(/_/g, '-'),
    characterId.replace(/premium_|historical_/, ''),
    characterId.replace(/premium_|historical_/, '').replace(/_/g, '-'),
  ];

  for (const dir of possibleDirs) {
    const dirPath = join(basePath, dir);
    if (!existsSync(dirPath)) continue;

    // Buscar cualquier archivo de foto en el directorio
    const files = readdirSync(dirPath);

    // Prioridad: cara > Foto-de-la-cara > Cara > avatar > otros
    const priority = [
      /^cara\.(webp|png|jpg)$/i,
      /^Foto-de-la-cara\.(webp|png|jpg)$/i,
      /^foto de la cara\.(webp|png|jpg)$/i,
      /-Cara\.(webp|png|jpg)$/i,  // Einstein-Cara.png
      /Cara\.(webp|png|jpg)$/i,
      /^avatar\.(webp|png|jpg)$/i,
    ];

    for (const pattern of priority) {
      const match = files.find(f => pattern.test(f));
      if (match) {
        return `/personajes/${dir}/${match}`;
      }
    }

    // Si no encontró ninguno con los patterns, buscar cualquier imagen
    const anyImage = files.find(f => /\.(webp|png|jpg|jpeg)$/i.test(f) && !/-completa?/i.test(f));
    if (anyImage) {
      return `/personajes/${dir}/${anyImage}`;
    }
  }

  return null;
}

async function cleanTxtHeaders() {
  console.log('🧹 LIMPIANDO HEADERS DE ARCHIVOS .TXT\n');

  const personajesDir = join(process.cwd(), 'Personajes');
  const dirs = readdirSync(personajesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name !== 'processed')
    .map(dirent => dirent.name);

  let cleaned = 0;
  let skipped = 0;

  for (const dir of dirs) {
    const txtFile = join(personajesDir, dir, `${dir}.txt`);
    if (!existsSync(txtFile)) {
      console.log(`⏭️  ${dir}: No .txt file found`);
      skipped++;
      continue;
    }

    const content = readFileSync(txtFile, 'utf-8');
    const lines = content.split('\n');

    if (lines[0].startsWith('#')) {
      const originalHeader = lines[0];
      const cleanedHeader = cleanCharacterName(originalHeader.replace(/^#\s*/, ''));

      if (originalHeader !== `# ${cleanedHeader}`) {
        lines[0] = `# ${cleanedHeader}`;
        writeFileSync(txtFile, lines.join('\n'), 'utf-8');
        console.log(`✅ ${dir}`);
        console.log(`   Antes: ${originalHeader}`);
        console.log(`   Ahora: # ${cleanedHeader}\n`);
        cleaned++;
      } else {
        skipped++;
      }
    } else {
      skipped++;
    }
  }

  console.log(`\n✅ Limpiados: ${cleaned}`);
  console.log(`⏭️  Sin cambios: ${skipped}`);
}

async function verifyAndFixAvatars() {
  console.log('\n\n📸 VERIFICANDO Y CORRIGIENDO AVATARS EN JSONs\n');

  const processedDir = join(process.cwd(), 'Personajes', 'processed');
  const files = readdirSync(processedDir).filter(f => f.endsWith('.json'));

  let fixed = 0;
  let verified = 0;
  let missing = 0;

  for (const file of files) {
    const filePath = join(processedDir, file);
    const character = JSON.parse(readFileSync(filePath, 'utf-8')) as CharacterJSON;

    const currentAvatar = character.avatar;
    const bestAvatar = findBestAvatar(character.id);

    if (!bestAvatar) {
      console.log(`❌ ${character.name}: No se encontró foto en public/personajes/`);
      missing++;
      continue;
    }

    // Verificar si el avatar actual existe
    const currentAvatarPath = currentAvatar ? join(process.cwd(), 'public', currentAvatar) : null;
    const avatarExists = currentAvatarPath && existsSync(currentAvatarPath);

    if (!avatarExists || currentAvatar !== bestAvatar) {
      character.avatar = bestAvatar;
      writeFileSync(filePath, JSON.stringify(character, null, 2), 'utf-8');
      console.log(`✅ ${character.name}`);
      console.log(`   Antes: ${currentAvatar || 'N/A'}`);
      console.log(`   Ahora: ${bestAvatar}\n`);
      fixed++;
    } else {
      verified++;
    }
  }

  console.log(`\n✅ Corregidos: ${fixed}`);
  console.log(`✓  Verificados: ${verified}`);
  console.log(`❌ Sin foto: ${missing}`);
}

async function main() {
  console.log('🔧 FIX CHARACTER NAMES AND PHOTOS\n');
  console.log('Este script limpia nombres y verifica fotos de personajes\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await cleanTxtHeaders();
  await verifyAndFixAvatars();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ ¡Completado!');
}

main().catch(console.error);
