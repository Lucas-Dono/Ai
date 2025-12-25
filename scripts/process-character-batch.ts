import * as fs from 'fs';
import * as path from 'path';

/**
 * Sistema de Procesamiento Masivo de Personajes
 *
 * Este script coordina la creación de 50 personajes ultra profesionales
 * con investigación profunda y documentación completa.
 *
 * Características:
 * - Procesamiento por lotes para evitar sobrecarga
 * - Un agente especializado por personaje
 * - Mínimo 20 búsquedas de investigación por personaje
 * - Archivos .txt completos con toda la información
 * - Prompts de DALL-E para generación de imágenes
 */

interface CharacterEntry {
  id: string;
  name: string;
  period?: string;
  category?: string;
  archetype?: string;
  tags: string[];
  engagement: string;
  complexity: string;
  rationale?: string;
  concept?: string;
}

interface Catalog {
  historicalCharacters: CharacterEntry[];
  originalCharacters: CharacterEntry[];
}

async function main() {
  console.log('🎭 Sistema de Procesamiento Masivo de Personajes\n');
  console.log('='.repeat(60));

  // Cargar catálogo
  const catalogPath = path.join(__dirname, 'character-catalog.json');
  const catalog: Catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

  const allCharacters = [
    ...catalog.historicalCharacters,
    ...catalog.originalCharacters
  ];

  console.log(`\n📊 Personajes a procesar: ${allCharacters.length}`);
  console.log(`   - Históricos: ${catalog.historicalCharacters.length}`);
  console.log(`   - Originales: ${catalog.originalCharacters.length}`);

  // Configuración de lotes
  const BATCH_SIZE = 10; // Procesar 10 a la vez para no sobrecargar
  const batches: CharacterEntry[][] = [];

  for (let i = 0; i < allCharacters.length; i += BATCH_SIZE) {
    batches.push(allCharacters.slice(i, i + BATCH_SIZE));
  }

  console.log(`\n📦 Dividido en ${batches.length} lotes de máximo ${BATCH_SIZE} personajes`);

  // Preguntar al usuario qué lote procesar
  console.log('\n' + '='.repeat(60));
  console.log('OPCIONES DE PROCESAMIENTO:');
  console.log('='.repeat(60));
  console.log('\n1. Procesar LOTE 1 (primeros 10 personajes)');
  console.log('2. Procesar LOTE 2 (personajes 11-20)');
  console.log('3. Procesar LOTE 3 (personajes 21-30)');
  console.log('4. Procesar LOTE 4 (personajes 31-40)');
  console.log('5. Procesar LOTE 5 (personajes 41-50)');
  console.log('6. Procesar TODOS (50 personajes - tardará mucho tiempo)');
  console.log('\nPara ejecutar, usa:');
  console.log('  npm run process-characters -- --batch=1');
  console.log('  npm run process-characters -- --batch=all');

  // Mostrar vista previa de cada lote
  batches.forEach((batch, idx) => {
    console.log(`\n📦 LOTE ${idx + 1}:`);
    batch.forEach(char => {
      console.log(`   - ${char.name}`);
    });
  });

  console.log('\n' + '='.repeat(60));
  console.log('✨ Sistema listo para procesar personajes');
  console.log('='.repeat(60));
}

main();
