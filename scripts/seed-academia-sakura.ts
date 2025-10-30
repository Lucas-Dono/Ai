#!/usr/bin/env tsx

/**
 * Script para crear el mundo Academia Sakura
 * Ejecutar con: npx tsx scripts/seed-academia-sakura.ts
 */

import { seedAcademiaSakura } from '../prisma/seeds/academia-sakura-world';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌸 Iniciando seed de Academia Sakura...\n');

    // Verificar si ya existe
    const existing = await prisma.world.findFirst({
      where: { name: { contains: "Academia Sakura" } },
    });

    if (existing) {
      console.log('⚠️  Academia Sakura ya existe.');
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      await new Promise<void>((resolve) => {
        readline.question('¿Eliminar y recrear? (y/N): ', async (answer: string) => {
          if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            console.log('🗑️  Eliminando mundo existente...');
            await prisma.world.delete({ where: { id: existing.id } });
            console.log('✅ Mundo eliminado\n');
          } else {
            console.log('❌ Operación cancelada');
            process.exit(0);
          }
          readline.close();
          resolve();
        });
      });
    }

    // Crear el mundo
    const world = await seedAcademiaSakura();

    console.log('\n✨ ¡Academia Sakura creada exitosamente!');
    console.log(`📍 ID del mundo: ${world.id}`);
    console.log(`🎭 Personajes principales: 4`);
    console.log(`🎬 Personajes secundarios: 6`);
    console.log(`👥 Personajes de relleno: 5`);
    console.log(`📖 Eventos de historia: ${world.storyScript ? 'Sí' : 'No'}`);
    console.log(`\n🔗 URL: http://localhost:3000/dashboard/mundos/${world.id}`);
    console.log('\n🎉 ¡Listo para comenzar la simulación!');

  } catch (error) {
    console.error('❌ Error al crear Academia Sakura:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
