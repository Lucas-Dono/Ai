import { prisma } from '../lib/prisma';

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  console.log('Users:', JSON.stringify(users, null, 2));

  const sessions = await prisma.session.findMany({
    select: {
      id: true,
      token: true,
      userId: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  console.log('Sessions:', JSON.stringify(sessions, null, 2));

  const accounts = await prisma.account.findMany({
    select: {
      id: true,
      userId: true,
      providerId: true,
      accountId: true,
    },
  });

  console.log('Accounts:', JSON.stringify(accounts, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
