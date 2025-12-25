import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addPremiumTagToHistorical() {
  console.log('🔧 Agregando tag "premium" a personajes históricos...\n');

  const historicalIds = [
    'historical_marilyn_monroe',
    'historical_albert_einstein',
  ];

  for (const id of historicalIds) {
    const agent = await prisma.agent.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        tags: true,
      }
    });

    if (agent) {
      const currentTags = Array.isArray(agent.tags) ? agent.tags : [];

      if (!currentTags.includes('premium')) {
        const newTags = ['premium', ...currentTags];

        await prisma.agent.update({
          where: { id },
          data: {
            tags: newTags
          }
        });

        console.log(`✅ ${agent.name}`);
        console.log(`   Tags anteriores: ${JSON.stringify(currentTags)}`);
        console.log(`   Tags nuevos: ${JSON.stringify(newTags)}`);
        console.log('');
      } else {
        console.log(`⏭️  ${agent.name} ya tiene el tag 'premium'\n`);
      }
    }
  }

  console.log('✨ Actualización completada!\n');

  // Verificación final
  console.log('📊 VERIFICACIÓN FINAL:\n');

  const allPremium = await prisma.agent.findMany({
    where: {
      userId: null,
      visibility: 'public',
      featured: true,
    },
    select: {
      id: true,
      name: true,
      tags: true,
    },
    orderBy: {
      name: 'asc'
    }
  });

  allPremium.forEach(agent => {
    const hasPremiumTag = Array.isArray(agent.tags) && agent.tags.includes('premium');
    console.log(`${hasPremiumTag ? '✅' : '❌'} ${agent.name} - Premium tag: ${hasPremiumTag}`);
  });

  await prisma.$disconnect();
}

addPremiumTagToHistorical();
