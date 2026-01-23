import { prisma } from "@/lib/prisma";

async function main() {
  console.log('='.repeat(80));
  console.log('ALL AGENTS');
  console.log('='.repeat(80));
  console.log();

  const agents = await prisma.agent.findMany({
    include: {
      User: {
        select: {
          email: true,
          plan: true,
        }
      },
      PersonalityCore: true,
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10,
  });

  console.log(`Found ${agents.length} agents (showing first 10)\n`);

  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    const profile = agent.profile as any;

    console.log(`${i + 1}. ${agent.name}`);
    console.log(`   ID: ${agent.id}`);
    console.log(`   Kind: ${agent.kind}`);
    console.log(`   User: ${agent.User?.email || 'NO USER'} (${agent.User?.plan || 'NO PLAN'})`);
    console.log(`   Created: ${agent.createdAt.toISOString().split('T')[0]}`);
    console.log();
  }

  // Count by plan
  const allAgents = await prisma.agent.findMany({
    include: {
      User: {
        select: {
          plan: true,
        }
      }
    }
  });

  const byPlan = allAgents.reduce((acc, agent) => {
    const plan = agent.User?.plan || 'no_user';
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('BY PLAN:');
  Object.entries(byPlan).forEach(([plan, count]) => {
    console.log(`  ${plan}: ${count}`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
