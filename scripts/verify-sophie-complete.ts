import { prisma } from '@/lib/prisma';

const agentId = 'cmi3l240x0001ijyeo5p9ixex';

async function verifySophie() {
  console.log('📊 VERIFICANDO ESTADO COMPLETO DE SOPHIE MÜLLER:\n');

  const [profile, memoriesCount, peopleCount, memories, people] = await Promise.all([
    prisma.agent.findUnique({ where: { id: agentId }, select: { profile: true } }),
    prisma.episodicMemory.count({ where: { agentId } }),
    prisma.importantPerson.count({ where: { agentId } }),
    prisma.episodicMemory.findMany({
      where: { agentId },
      select: { event: true, emotionalValence: true, importance: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.importantPerson.findMany({
      where: { agentId },
      select: { name: true, relationship: true, importance: true },
    }),
  ]);

  const profileData = profile?.profile as any;

  console.log('✅ Profile:');
  console.log('  age:', profileData?.age);
  console.log('  location:', profileData?.location);
  console.log('  occupation:', profileData?.occupation);
  console.log('  family:', profileData?.family ? Object.keys(profileData.family).join(', ') : 'NO');
  console.log('  socialCircle:', profileData?.socialCircle ? 'Sí' : 'NO');
  console.log(
    '  lifeExperiences:',
    profileData?.lifeExperiences ? Object.keys(profileData.lifeExperiences).join(', ') : 'NO'
  );
  console.log('  interests:', profileData?.interests ? Object.keys(profileData.interests).join(', ') : 'NO');
  console.log('  dailyRoutine:', profileData?.dailyRoutine ? 'Sí' : 'NO');
  console.log('  innerWorld:', profileData?.innerWorld ? 'Sí' : 'NO');
  console.log('  communication:', profileData?.communication ? 'Sí' : 'NO');
  console.log();

  console.log(`✅ ImportantPerson: ${peopleCount} personas`);
  people.forEach((p) => console.log(`  - ${p.name} (${p.relationship})`));
  console.log();

  console.log(`✅ EpisodicMemory: ${memoriesCount} memorias`);
  memories.forEach((m, i) => {
    const preview = m.event.substring(0, 60).replace(/\n/g, ' ');
    console.log(`  ${i + 1}. ${preview}... (importance: ${m.importance})`);
  });
  console.log();

  console.log('🎉 RESUMEN:');
  console.log(`  Profile: ${Object.keys(profileData || {}).length} secciones`);
  console.log(`  Personas importantes: ${peopleCount}`);
  console.log(`  Memorias episódicas: ${memoriesCount}`);
  console.log();

  if (peopleCount >= 4 && memoriesCount >= 7) {
    console.log('✅ TODO COMPLETO - Sophie está lista para usar!');
  } else {
    console.log('⚠️ Faltan datos:');
    if (peopleCount < 4) console.log(`  - Personas: ${peopleCount}/4`);
    if (memoriesCount < 7) console.log(`  - Memorias: ${memoriesCount}/7`);
  }

  await prisma.$disconnect();
}

verifySophie().catch(console.error);
