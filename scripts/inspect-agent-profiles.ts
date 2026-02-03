#!/usr/bin/env tsx
import { prisma } from '@/lib/prisma';

async function main() {
  const agents = await prisma.agent.findMany({
    take: 5,
    select: {
      id: true,
      name: true,
      description: true,
      personality: true,
      profile: true,
    },
  });

  for (const agent of agents) {
    console.log('\n═══════════════════════════════════════════════');
    console.log(`${agent.name} (${agent.id})`);
    console.log('═══════════════════════════════════════════════');

    console.log('\nDescription:');
    console.log(agent.description?.substring(0, 200) || 'N/A');

    console.log('\nPersonality:');
    console.log(agent.personality?.substring(0, 200) || 'N/A');

    console.log('\nProfile:');
    if (agent.profile && typeof agent.profile === 'object') {
      const profile = agent.profile as any;
      console.log('Keys:', Object.keys(profile));

      if (profile.psychology) {
        console.log('\nPsychology section found:');
        console.log(JSON.stringify(profile.psychology, null, 2));
      }

      if (profile.basicInfo) {
        console.log('\nBasicInfo:', JSON.stringify(profile.basicInfo, null, 2));
      }
    } else {
      console.log('No profile data');
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
