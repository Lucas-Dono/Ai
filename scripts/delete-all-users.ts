import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Deleting all users from database...');

  // Delete all users
  const deleted = await prisma.user.deleteMany({});
  console.log(`✅ Deleted ${deleted.count} users from database`);

  // Verify
  const remaining = await prisma.user.count();
  console.log(`Remaining users: ${remaining}`);

  if (remaining === 0) {
    console.log('✅ Database is now empty - ready for new registrations');
  } else {
    console.log('⚠️ Warning: Some users still remain in database');
  }
}

main()
  .catch((error) => {
    console.error('❌ Error deleting users:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
