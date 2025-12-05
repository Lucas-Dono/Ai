import { prisma } from '@/lib/prisma';

const agentId = 'cmi3l240x0001ijyeo5p9ixex'; // Sophie

async function debugUIData() {
  const user = await prisma.user.findFirst({
    where: { email: 'lucasdono391@gmail.com' },
  });

  console.log('👤 Usuario:', user?.id);
  console.log('🤖 AgentId:', agentId);
  console.log();

  // Verificar ImportantPerson
  const allPeople = await prisma.importantPerson.findMany({
    where: { agentId },
    select: {
      id: true,
      name: true,
      relationship: true,
      userId: true,
      agentId: true,
    },
  });

  console.log('📊 ImportantPerson en DB:', allPeople.length);
  allPeople.forEach((p) => {
    console.log(`  - ${p.name} (${p.relationship})`);
    console.log(`    userId: ${p.userId}`);
    console.log(`    agentId: ${p.agentId}`);
    console.log(`    ¿Match usuario? ${p.userId === user?.id ? '✅' : '❌'}`);
    console.log();
  });

  // Verificar EpisodicMemory
  const allMemories = await prisma.episodicMemory.findMany({
    where: { agentId },
    select: {
      id: true,
      event: true,
      agentId: true,
      createdAt: true,
    },
  });

  console.log('📝 EpisodicMemory en DB:', allMemories.length);
  allMemories.forEach((m, i) => {
    console.log(`  ${i + 1}. ${m.event.substring(0, 60)}...`);
    console.log(`     agentId: ${m.agentId}`);
    console.log();
  });

  console.log('🔍 Análisis del problema:');
  console.log();

  // ¿Cómo consulta la UI?
  console.log('La UI probablemente consulta así:');
  console.log('  ImportantPerson: WHERE agentId = Sophie AND userId = UsuarioActual');
  console.log('  EpisodicMemory: WHERE agentId = Sophie');
  console.log();

  console.log('Verificando si userId coincide:');
  const peopleForUser = await prisma.importantPerson.findMany({
    where: {
      agentId,
      userId: user?.id,
    },
  });

  console.log(`  ImportantPerson con userId correcto: ${peopleForUser.length}`);
  console.log();

  if (peopleForUser.length === 0 && allPeople.length > 0) {
    console.log('❌ PROBLEMA IDENTIFICADO:');
    console.log('  Los registros tienen userId = agentId (self-referential)');
    console.log('  Pero la UI busca userId = usuario actual');
    console.log();
    console.log('SOLUCIÓN: Cambiar userId de las personas a userId real del usuario');
  }

  await prisma.$disconnect();
}

debugUIData().catch(console.error);
