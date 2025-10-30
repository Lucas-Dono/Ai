/**
 * Check Marilyn Monroe's worldKnowledge profile
 */

import { prisma } from '@/lib/prisma';

async function checkProfile() {
  const agent = await prisma.agent.findUnique({
    where: { id: 'cmh1dwsr00001ij0saclqe9hq' },
    include: {
      semanticMemory: true,
    },
  });

  if (!agent) {
    console.error('❌ Agent not found');
    process.exit(1);
  }

  console.log(`\n📋 Agent: ${agent.name}\n`);
  console.log('worldKnowledge:', JSON.stringify(agent.semanticMemory?.worldKnowledge, null, 2));

  process.exit(0);
}

checkProfile();
