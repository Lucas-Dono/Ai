import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteDuplicate() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'lucasdono391@gmail.com' },
      select: { id: true }
    });

    if (!user) {
      console.log('User not found');
      return;
    }

    const agents = await prisma.agent.findMany({
      where: {
        userId: user.id,
        name: 'María Elena Volkov Smirnof'
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('\nFound agents:', agents.length);
    agents.forEach((a, i) => {
      console.log(`${i + 1}. ID: ${a.id}`);
      console.log(`   Created: ${a.createdAt}`);
      console.log(`   Avatar: ${a.avatar}\n`);
    });

    if (agents.length === 2) {
      // Eliminar el más nuevo (segundo)
      const toDelete = agents[0]; // El más reciente
      console.log(`\nDeleting most recent duplicate: ${toDelete.id}`);

      await prisma.agent.delete({
        where: { id: toDelete.id }
      });

      console.log('✅ Duplicate deleted');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteDuplicate();
