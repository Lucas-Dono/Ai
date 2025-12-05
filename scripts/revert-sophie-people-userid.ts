import { prisma } from '@/lib/prisma';

const agentId = 'cmi3l240x0001ijyeo5p9ixex'; // Sophie

async function revertSophiePeopleUserId() {
  const user = await prisma.user.findFirst({
    where: { email: 'lucasdono391@gmail.com' },
  });

  if (!user) {
    console.log('❌ Usuario no encontrado');
    return;
  }

  console.log('🔄 Revirtiendo userId de personas de Sophie...');
  console.log('De: userId =', user.id, '(usuario)');
  console.log('A: userId =', agentId, '(self-referential)');
  console.log();

  // Revertir: personas de Sophie vuelven a tener userId = agentId
  const result = await prisma.importantPerson.updateMany({
    where: {
      agentId,
      userId: user.id,
      name: { in: ['Martín Müller', 'Helga Müller', 'Abuela paterna', 'Mia'] },
    },
    data: {
      userId: agentId, // Self-referential para personas del mundo de Sophie
    },
  });

  console.log('✅ Actualizado:', result.count, 'personas');
  console.log();

  // Verificar
  const sophiePeople = await prisma.importantPerson.findMany({
    where: { agentId, userId: agentId },
    select: { name: true, relationship: true },
  });

  const userPeople = await prisma.importantPerson.findMany({
    where: { agentId, userId: user.id },
    select: { name: true, relationship: true },
  });

  console.log('📊 Estructura final:');
  console.log();
  console.log('👤 Personas del mundo de Sophie (userId = agentId):');
  sophiePeople.forEach((p) => console.log(`  - ${p.name} (${p.relationship})`));
  console.log();
  console.log('👥 Personas del mundo del usuario (userId = usuario):');
  if (userPeople.length === 0) {
    console.log('  (vacío - se llenarán automáticamente en conversaciones)');
  } else {
    userPeople.forEach((p) => console.log(`  - ${p.name} (${p.relationship})`));
  }

  await prisma.$disconnect();
}

revertSophiePeopleUserId().catch(console.error);
