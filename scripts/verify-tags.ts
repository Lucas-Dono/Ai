import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyTags() {
  const premiumIds = [
    'premium_luna_digital_intimacy',
    'premium_katya_ice_queen',
    'historical_marilyn_monroe',
    'historical_albert_einstein',
    'premium_marcus_quantum_mind',
    'premium_sofia_emotional_archaeologist',
  ];

  console.log('🔍 Verificando tags de personajes premium...\n');

  for (const id of premiumIds) {
    const agent = await prisma.agent.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        tags: true,
        featured: true,
        visibility: true,
        userId: true,
      }
    });

    if (agent) {
      console.log(`📋 ${agent.name}`);
      console.log(`   ID: ${agent.id}`);
      console.log(`   Tags: ${JSON.stringify(agent.tags)}`);
      console.log(`   Has 'premium' tag: ${Array.isArray(agent.tags) && agent.tags.includes('premium')}`);
      console.log(`   Featured: ${agent.featured}`);
      console.log(`   Visibility: ${agent.visibility}`);
      console.log(`   UserId: ${agent.userId}`);
      console.log('');
    }
  }

  await prisma.$disconnect();
}

verifyTags();
