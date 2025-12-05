/**
 * Verificar ID de Sophie
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando agente Sophie...\n');

  // Buscar por nombre
  const sophie = await prisma.agent.findFirst({
    where: {
      name: {
        contains: 'Sophie',
        mode: 'insensitive',
      },
    },
  });

  if (sophie) {
    console.log('✅ Sophie encontrada:');
    console.log(`   ID: ${sophie.id}`);
    console.log(`   Nombre: ${sophie.name}`);
    console.log(`   UserId: ${sophie.userId}`);
    console.log(`   Creada: ${sophie.createdAt}\n`);

    // Ver eventos existentes
    const events = await prisma.importantEvent.findMany({
      where: { agentId: sophie.id },
    });

    console.log(`📅 Eventos actuales: ${events.length}`);
    events.forEach((e) => {
      console.log(`   - ${e.description} (${e.eventHappened ? 'pasado' : 'futuro'})`);
    });
  } else {
    console.log('❌ Sophie no encontrada');
    console.log('\n📋 Agentes disponibles:');
    const agents = await prisma.agent.findMany({
      select: { id: true, name: true },
      take: 10,
    });
    agents.forEach((a) => {
      console.log(`   - ${a.name} (${a.id})`);
    });
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
