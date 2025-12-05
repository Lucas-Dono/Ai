import { prisma } from '@/lib/prisma';

const agentId = 'cmi3l240x0001ijyeo5p9ixex'; // Sophie

async function fixImportantPersonUserId() {
  const user = await prisma.user.findFirst({
    where: { email: 'lucasdono391@gmail.com' },
  });

  if (!user) {
    console.log('❌ Usuario no encontrado');
    return;
  }

  console.log('🔧 Arreglando userId de ImportantPerson...');
  console.log('Usuario correcto:', user.id);
  console.log();

  // Actualizar todas las personas importantes
  const result = await prisma.importantPerson.updateMany({
    where: {
      agentId,
      userId: agentId, // Las que tienen userId = agentId (incorrecto)
    },
    data: {
      userId: user.id, // Cambiar a userId del usuario real
    },
  });

  console.log('✅ Actualizado:', result.count, 'personas');
  console.log();

  // Verificar
  const people = await prisma.importantPerson.findMany({
    where: { agentId, userId: user.id },
    select: { name: true, relationship: true, userId: true },
  });

  console.log('📊 Personas ahora visibles para el usuario:');
  people.forEach((p) => {
    console.log(`  - ${p.name} (${p.relationship}) ✅`);
  });

  await prisma.$disconnect();
}

fixImportantPersonUserId().catch(console.error);
