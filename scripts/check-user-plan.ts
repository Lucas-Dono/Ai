import { prisma } from '../lib/prisma';

async function checkUserPlan() {
  const user = await prisma.user.findUnique({
    where: { email: 'lucasdono391@gmail.com' },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
    },
  });

  console.log('Usuario encontrado:');
  console.log(JSON.stringify(user, null, 2));

  await prisma.$disconnect();
}

checkUserPlan().catch(console.error);
