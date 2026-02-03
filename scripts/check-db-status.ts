#!/usr/bin/env tsx
import { prisma } from '@/lib/prisma';

async function main() {
  const agents = await prisma.agent.count();
  const cores = await prisma.personalityCore.count();

  console.log('Agents:', agents);
  console.log('PersonalityCores:', cores);

  if (agents > 0) {
    console.log('\nPrimeros 5 agentes:');
    const firstAgents = await prisma.agent.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        PersonalityCore: true,
      },
    });

    firstAgents.forEach(agent => {
      console.log(`  - ${agent.name} (${agent.id}) - PersonalityCore: ${agent.PersonalityCore ? 'SÍ' : 'NO'}`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
