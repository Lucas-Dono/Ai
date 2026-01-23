import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const agents = await prisma.agent.findMany({
    select: {
      id: true,
      name: true,
      gender: true,
    },
    take: 15,
  });

  console.log('=== Agents and their gender values ===\n');
  agents.forEach(agent => {
    console.log(`${agent.name.padEnd(30)} → ${agent.gender || 'NULL'}`);
  });

  const withGender = agents.filter(a => a.gender).length;
  const withoutGender = agents.filter(a => !a.gender).length;

  console.log(`\n=== Summary ===`);
  console.log(`With gender:    ${withGender}`);
  console.log(`Without gender: ${withoutGender}`);
  console.log(`Total:          ${agents.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
