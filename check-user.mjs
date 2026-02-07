import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'lucasdono391@gmail.com' },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      password: true,
      createdAt: true,
    },
  });

  if (!user) {
    console.log('❌ Usuario NO encontrado');
  } else {
    console.log('✅ Usuario encontrado:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Plan:', user.plan);
    console.log('  Password:', user.password ? 'EXISTS (hash: ' + user.password.substring(0, 20) + '...)' : 'NULL (OAuth user)');
    console.log('  Created:', user.createdAt);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
