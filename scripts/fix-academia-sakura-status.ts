#!/usr/bin/env tsx

/**
 * SCRIPT OBSOLETO
 * Este script usa el modelo 'World' que fue migrado a 'Group'
 * Mantenerlo solo para referencia histórica
 */

/*
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔧 Arreglando status de Academia Sakura...\n');

    // Buscar el mundo
    const world = await prisma.world.findFirst({
      where: {
        name: { contains: 'Academia Sakura' }
      }
    });

    if (!world) {
      console.log('❌ Academia Sakura no encontrada.');
      console.log('💡 Ejecuta: npx tsx scripts/seed-academia-sakura.ts');
      process.exit(0);
    }

    console.log(`📍 Mundo encontrado: ${world.name}`);
    console.log(`   ID: ${world.id}`);
    console.log(`   Status actual: ${world.status}`);
    console.log(`   AutoMode actual: ${world.autoMode}`);
    console.log('');

    // Actualizar
    await prisma.world.update({
      where: { id: world.id },
      data: {
        status: 'STOPPED',
        autoMode: false,
        maxInteractions: 1000,
      }
    });

    console.log('✅ Mundo actualizado:');
    console.log('   Status: STOPPED');
    console.log('   AutoMode: false');
    console.log('   MaxInteractions: 1000');
    console.log('');
    console.log('🎉 ¡Ahora el botón Start funcionará correctamente!');
    console.log(`🔗 URL: http://localhost:3000/dashboard/mundos/${world.id}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
*/

console.log('❌ Este script está obsoleto. El sistema World fue migrado a Group.');
console.log('💡 Usa los nuevos scripts de gestión de grupos en su lugar.');
