/**
 * Script para copiar fotos de personajes desde Personajes/ a public/personajes/
 */

import { readFileSync, readdirSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';

interface CharacterJSON {
  id: string;
  name: string;
}

function getKebabCase(id: string): string {
  // Convertir ID a kebab-case para nombre de carpeta
  return id
    .replace(/^(premium_|historical_)/, '')
    .replace(/_/g, '-');
}

async function copyPhotos() {
  console.log('📸 COPIANDO FOTOS DE PERSONAJES\n');
  console.log('Desde: Personajes/{nombre}/');
  console.log('Hacia: public/personajes/{id-kebab}/\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const processedDir = join(process.cwd(), 'Personajes', 'processed');
  const files = readdirSync(processedDir).filter(f => f.endsWith('.json'));

  let copied = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const filePath = join(processedDir, file);
    const character = JSON.parse(readFileSync(filePath, 'utf-8')) as CharacterJSON;

    // Obtener nombre de carpeta fuente
    const sourceFolder = file.replace('.json', '');
    const sourcePath = join(process.cwd(), 'Personajes', sourceFolder);

    // Si no existe la carpeta fuente, buscar por nombre del personaje
    let actualSourcePath = sourcePath;
    if (!existsSync(sourcePath)) {
      // Buscar carpeta que coincida con el nombre
      const personajesDir = join(process.cwd(), 'Personajes');
      const dirs = readdirSync(personajesDir, { withFileTypes: true })
        .filter(d => d.isDirectory() && d.name !== 'processed')
        .map(d => d.name);

      const match = dirs.find(d =>
        d.toLowerCase() === character.name.toLowerCase() ||
        d.toLowerCase().includes(character.name.split(' ')[0].toLowerCase())
      );

      if (match) {
        actualSourcePath = join(personajesDir, match);
      } else {
        console.log(`⚠️  ${character.name}: No se encontró carpeta fuente`);
        errors++;
        continue;
      }
    }

    // Crear carpeta destino
    const destFolderName = getKebabCase(character.id);
    const destPath = join(process.cwd(), 'public', 'personajes', destFolderName);

    // Si ya existe, saltar
    if (existsSync(destPath)) {
      console.log(`⏭️  ${character.name}: Carpeta ya existe en public/`);
      skipped++;
      continue;
    }

    // Crear carpeta
    mkdirSync(destPath, { recursive: true });

    // Copiar todas las fotos
    const photosToCopy = readdirSync(actualSourcePath).filter(f =>
      f.endsWith('.png') ||
      f.endsWith('.jpg') ||
      f.endsWith('.jpeg') ||
      f.endsWith('.webp')
    );

    if (photosToCopy.length === 0) {
      console.log(`⚠️  ${character.name}: No se encontraron fotos en carpeta fuente`);
      errors++;
      continue;
    }

    for (const photo of photosToCopy) {
      const sourceFile = join(actualSourcePath, photo);
      const destFile = join(destPath, photo);
      copyFileSync(sourceFile, destFile);
    }

    console.log(`✅ ${character.name}`);
    console.log(`   Desde: ${actualSourcePath}`);
    console.log(`   Hacia: ${destPath}`);
    console.log(`   Fotos: ${photosToCopy.join(', ')}\n`);
    copied++;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Copiados: ${copied}`);
  console.log(`⏭️  Ya existían: ${skipped}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`📊 Total: ${files.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

copyPhotos().catch(console.error);
