import { prisma } from '@/lib/prisma';

const agentId = 'cmi3l240x0001ijyeo5p9ixex'; // Sophie

async function checkBond() {
  const user = await prisma.user.findFirst({
    where: { email: 'lucasdono391@gmail.com' },
  });

  if (!user) {
    console.log('❌ Usuario no encontrado');
    await prisma.$disconnect();
    return;
  }

  const bond = await prisma.symbolicBond.findFirst({
    where: { agentId, userId: user.id },
  });

  console.log('Usuario:', user.id, '-', user.email);
  console.log('Agent:', agentId, '(Sophie)');
  console.log();

  if (bond) {
    console.log('✅ Bond existe:');
    console.log('  ID:', bond.id);
    console.log('  Tier:', bond.tier);
    console.log('  Status:', bond.status);
    console.log('  Affinity Level:', bond.affinityLevel);
    console.log('  Total Interactions:', bond.totalInteractions);
    console.log('  Duration Days:', bond.durationDays);
    console.log('  Last Interaction:', bond.lastInteraction);
    console.log('  Created At:', bond.createdAt);
  } else {
    console.log('❌ NO existe bond entre este usuario y Sophie');
    console.log();
    console.log('Soluciones:');
    console.log('  1. Crear bond manualmente');
    console.log('  2. Integrar auto-creación en message.service.ts');
  }

  await prisma.$disconnect();
}

checkBond().catch(console.error);
