/**
 * Script para analizar la estructura de personajes en /Personajes
 * y determinar qué campos necesitan ser mapeados a la DB
 */

import * as fs from 'fs';
import * as path from 'path';

interface CharacterFile {
  directory: string;
  name: string;
  hasProfile: boolean;
  hasNamedFile: boolean;
  hasDallePrompts: boolean;
  files: string[];
}

const PERSONAJES_DIR = path.join(__dirname, '../Personajes');

function analyzeCharacters() {
  console.log('📊 Analizando estructura de personajes...\n');

  const entries = fs.readdirSync(PERSONAJES_DIR, { withFileTypes: true });
  const characters: CharacterFile[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === 'processed' || entry.name === 'public') continue;

    const dirPath = path.join(PERSONAJES_DIR, entry.name);
    const files = fs.readdirSync(dirPath);

    const hasProfile = files.includes('profile.txt');
    const namedFile = files.find(f => f.endsWith('.txt') && f !== 'profile.txt' && f !== 'dalle_prompts.txt');
    const hasDallePrompts = files.includes('dalle_prompts.txt');

    characters.push({
      directory: entry.name,
      name: entry.name,
      hasProfile,
      hasNamedFile: !!namedFile,
      hasDallePrompts,
      files,
    });
  }

  console.log(`Total de personajes encontrados: ${characters.length}\n`);

  // Agrupar por tipo de archivo
  const withProfile = characters.filter(c => c.hasProfile);
  const withNamedFile = characters.filter(c => c.hasNamedFile);
  const withDallePrompts = characters.filter(c => c.hasDallePrompts);
  const withNoFiles = characters.filter(c => c.files.length === 0);

  console.log('📁 Distribución de archivos:');
  console.log(`- Con profile.txt: ${withProfile.length}`);
  console.log(`- Con archivo nombrado: ${withNamedFile.length}`);
  console.log(`- Con dalle_prompts.txt: ${withDallePrompts.length}`);
  console.log(`- Sin archivos (vacíos): ${withNoFiles.length}\n`);

  // Mostrar personajes vacíos
  if (withNoFiles.length > 0) {
    console.log('⚠️  Personajes sin archivos:');
    withNoFiles.forEach(c => console.log(`   - ${c.name}`));
    console.log();
  }

  // Analizar estructura de un personaje ejemplo
  console.log('📖 Analizando estructura de personaje ejemplo...\n');

  const lunaPath = path.join(PERSONAJES_DIR, 'Luna/Luna.txt');
  if (fs.existsSync(lunaPath)) {
    const content = fs.readFileSync(lunaPath, 'utf-8');

    // Extraer JSON del markdown
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const character = JSON.parse(jsonMatch[1]);
        console.log('✅ Estructura de Luna:');
        console.log('   Campos principales:', Object.keys(character).join(', '));

        if (character.basicInfo) {
          console.log('\n   📌 basicInfo:', Object.keys(character.basicInfo).join(', '));
        }
        if (character.personality) {
          console.log('   📌 personality:', Object.keys(character.personality).join(', '));
        }
        if (character.communication) {
          console.log('   📌 communication:', Object.keys(character.communication).join(', '));
        }
        if (character.behaviors) {
          console.log('   📌 behaviors:', Object.keys(character.behaviors).join(', '));
        }
        console.log();
      } catch (e) {
        console.log('❌ Error parseando JSON de Luna');
      }
    }
  }

  // Lista de personajes para procesar
  console.log('📋 Personajes listos para procesar (con archivos completos):');
  const readyToProcess = characters.filter(c =>
    (c.hasProfile || c.hasNamedFile) && c.files.length > 0
  );

  readyToProcess.forEach((c, idx) => {
    const fileType = c.hasProfile ? 'profile.txt' : 'archivo nombrado';
    console.log(`   ${idx + 1}. ${c.name} (${fileType})`);
  });

  console.log(`\n✨ Total listos para procesar: ${readyToProcess.length}`);

  // Guardar lista para siguiente paso
  const outputPath = path.join(__dirname, 'characters-to-process.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify({
      total: characters.length,
      ready: readyToProcess.length,
      empty: withNoFiles.length,
      characters: readyToProcess.map(c => ({
        name: c.name,
        directory: c.directory,
        mainFile: c.hasProfile ? 'profile.txt' : c.files.find(f => f.endsWith('.txt') && f !== 'dalle_prompts.txt'),
      })),
    }, null, 2)
  );

  console.log(`\n💾 Lista guardada en: ${outputPath}`);
}

analyzeCharacters();
