#!/usr/bin/env tsx

/**
 * Script para crear a Marilyn Monroe en la base de datos
 *
 * Uso:
 *   npm run seed:marilyn
 *   o
 *   npx tsx scripts/seed-marilyn.ts
 */

import { seedMarilynMonroe } from '../prisma/seeds/marilyn-monroe';

async function main() {
  console.log('🌟 Creando Marilyn Monroe...\n');

  try {
    const agent = await seedMarilynMonroe();

    console.log('\n✅ Marilyn Monroe creada exitosamente!');
    console.log(`   ID: ${agent.id}`);
    console.log(`   Nombre: ${agent.name}`);
    console.log('');
    console.log('🎭 Puedes interactuar con ella en:');
    console.log(`   http://localhost:3000/agentes/${agent.id}`);
    console.log('');
    console.log('📚 Ver documentación completa en:');
    console.log('   /Personajes/Marilyn monroe.txt');
    console.log('   /docs/MARILYN-MONROE-GUIDE.md');

  } catch (error) {
    console.error('\n❌ Error creando Marilyn Monroe:', error);
    process.exit(1);
  }
}

main();
