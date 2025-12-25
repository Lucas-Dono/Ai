const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFormat() {
  const agent = await prisma.agent.findFirst({
    where: { userId: null }
  });

  if (agent) {
    console.log('✅ Found existing agent:');
    console.log('ID:', agent.id);
    console.log('Name:', agent.name);
    console.log('Has profile:', !!agent.profile);
    console.log('Has stagePrompts:', !!agent.stagePrompts);
    console.log('Profile type:', typeof agent.profile);
    console.log('StagePrompts type:', typeof agent.stagePrompts);
    console.log('\nSample keys in profile:', agent.profile ? Object.keys(agent.profile).slice(0, 5) : 'N/A');
    console.log('Sample keys in stagePrompts:', agent.stagePrompts ? Object.keys(agent.stagePrompts).slice(0, 5) : 'N/A');
  } else {
    console.log('❌ No agents found in database');
    console.log('Total agents:', await prisma.agent.count());
  }
}

checkFormat()
  .finally(() => prisma.$disconnect());
