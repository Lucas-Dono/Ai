import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkExistingCharacters() {
  const agents = await prisma.agent.findMany({
    where: {
      userId: null,
      featured: true
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      referenceImageUrl: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  console.log('\n=== PERSONAJES EN BASE DE DATOS ===\n');
  console.log(`Total: ${agents.length}\n`);

  agents.forEach((agent, index) => {
    console.log(`${index + 1}. ${agent.name}`);
    console.log(`   ID: ${agent.id}`);
    console.log(`   Avatar: ${agent.avatar ? 'Sí' : 'No'}`);
    console.log(`   Imagen referencia: ${agent.referenceImageUrl ? 'Sí' : 'No'}`);
    console.log('');
  });

  await prisma.$disconnect();
}

checkExistingCharacters();
