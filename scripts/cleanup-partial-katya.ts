import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🔍 Buscando Agent parcial de Katya...');

  const agent = await prisma.agent.findFirst({
    where: {
      name: {
        contains: 'Katya',
      },
    },
    include: {
      PersonalityCore: true,
      InternalState: true,
    },
  });

  if (!agent) {
    console.log('✅ No se encontró Agent de Katya');
    return;
  }

  console.log(`📋 Agent encontrado: ${agent.id}`);
  console.log(`   - PersonalityCore: ${agent.PersonalityCore ? '✅' : '❌'}`);
  console.log(`   - InternalState: ${agent.InternalState ? '✅' : '❌'}`);

  if (!agent.InternalState) {
    console.log('🗑️  Eliminando Agent parcial...');
    await prisma.agent.delete({
      where: { id: agent.id },
    });
    console.log('✅ Agent eliminado. Ahora puedes procesar Katya de nuevo.');
  } else {
    console.log('ℹ️  El Agent ya está completo. No se requiere limpieza.');
  }

  await prisma.$disconnect();
}

cleanup().catch(console.error);
