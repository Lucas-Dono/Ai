/**
 * Script para generar componentes emocionales de los 23 personajes faltantes
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const MISSING_CHARACTERS = [
  'helen-keller.json',
  'hypatia-de-alejandria.json',
  'isabella-ferreira.json',
  'james-obrien.json',
  'jane-austen.json',
  'juana-de-arco.json',
  'katya.json',
  'leonardo-da-vinci.json',
  'nikola-tesla.json',
  'noah-kepler.json',
  'oliver-chen.json',
  'oscar-wilde.json',
  'priya-sharma.json',
  'rafael-costa.json',
  'rei-takahashi.json',
  'sebastian-muller.json',
  'sofia-volkov.json',
  'sun-tzu.json',
  'vincent-van-gogh.json',
  'virginia-woolf.json',
  'wolfgang-amadeus-mozart.json',
  'yuki-tanaka.json',
  'zara-malik.json',
];

async function main() {
  console.log('📋 PERSONAJES FALTANTES:\n');

  const processedDir = join(process.cwd(), 'Personajes', 'processed');

  MISSING_CHARACTERS.forEach((file, i) => {
    const filePath = join(processedDir, file);
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    console.log(`${i + 1}. ${data.name} (${file})`);
  });

  console.log(`\n📊 Total: ${MISSING_CHARACTERS.length} personajes\n`);
  console.log('💡 Necesitas lanzar agentes en paralelo para procesarlos.');
  console.log('   Divide en 4-5 lotes de 5-6 personajes cada uno.\n');
}

main();
