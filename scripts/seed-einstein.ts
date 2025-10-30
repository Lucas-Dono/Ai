#!/usr/bin/env tsx

/**
 * Script para crear a Albert Einstein en la base de datos
 *
 * Uso:
 *   npm run db:seed:einstein
 *   o
 *   npx tsx scripts/seed-einstein.ts
 */

import { seedAlbertEinstein } from '../prisma/seeds/albert-einstein';

async function main() {
  console.log('🧠 Creando Albert Einstein...\n');

  try {
    const agent = await seedAlbertEinstein();

    console.log('\n✅ Albert Einstein creado exitosamente!');
    console.log(`   ID: ${agent.id}`);
    console.log(`   Nombre: ${agent.name}`);
    console.log('');
    console.log('🎭 Puedes interactuar con él en:');
    console.log(`   http://localhost:3000/agentes/${agent.id}`);
    console.log('');
    console.log('📚 Ver documentación completa en:');
    console.log('   /Personajes/Albert Einstein.txt');
    console.log('');
    console.log('⚠️  RECUERDA: Einstein es un genio brillante PERO profundamente defectuoso.');
    console.log('    Esta simulación NO lo glorifica - muestra al HOMBRE COMPLETO.');

  } catch (error) {
    console.error('\n❌ Error creando Einstein:', error);
    process.exit(1);
  }
}

main();
