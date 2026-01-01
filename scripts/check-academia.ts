/**
 * SCRIPT OBSOLETO
 * Este script usa el modelo 'World' que fue migrado a 'Group'
 * Mantenerlo solo para referencia histórica
 */

/*
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const world = await prisma.world.findFirst({
    where: {
      OR: [
        { name: { contains: 'Academia' } },
        { name: { contains: 'Sakura' } }
      ]
    },
    include: {
      worldAgents: {
        include: {
          agent: true
        }
      }
    }
  });

  if (world) {
    console.log('✅ Academia Sakura encontrado:');
    console.log(`   ID: ${world.id}`);
    console.log(`   Nombre: ${world.name}`);
    console.log(`   Story Mode: ${world.storyMode ? '✅' : '❌'}`);
    console.log(`   Personajes: ${world.worldAgents.length}`);
    world.worldAgents.forEach((wa: any) => {
      console.log(`     - ${wa.agent.name}`);
    });
  } else {
    console.log('❌ Academia Sakura no encontrado');
  }

  await prisma.$disconnect();
}

main();
*/

console.log('❌ Este script está obsoleto. El sistema World fue migrado a Group.');
console.log('💡 Usa los nuevos scripts de gestión de grupos en su lugar.');
