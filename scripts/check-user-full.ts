import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'lucasdono391@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        createdAt: true,
        _count: {
          select: {
            Agent: true,
          }
        }
      }
    });

    console.log('\n========== USER INFO ==========');
    console.log(JSON.stringify(user, null, 2));

    if (user) {
      // Ver agentes del usuario
      const agents = await prisma.agent.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          name: true,
          avatar: true,
          kind: true,
          visibility: true,
          featured: true,
        }
      });

      console.log('\n========== USER AGENTS ==========');
      console.log(JSON.stringify(agents, null, 2));

      // Ver agentes featured
      const featuredAgents = await prisma.agent.findMany({
        where: {
          featured: true,
          visibility: 'public'
        },
        select: {
          id: true,
          name: true,
          avatar: true,
          kind: true,
        },
        take: 10
      });

      console.log('\n========== FEATURED AGENTS (first 10) ==========');
      console.log(JSON.stringify(featuredAgents, null, 2));

      // Contar agentes duplicados
      const allAgents = await prisma.agent.findMany({
        select: {
          id: true,
          name: true,
          avatar: true,
          userId: true,
          kind: true,
        },
        orderBy: { name: 'asc' }
      });

      const nameCount = new Map<string, any[]>();
      allAgents.forEach(agent => {
        if (!nameCount.has(agent.name)) {
          nameCount.set(agent.name, []);
        }
        nameCount.get(agent.name)!.push(agent);
      });

      const duplicates = Array.from(nameCount.entries())
        .filter(([_, agents]) => agents.length > 1);

      if (duplicates.length > 0) {
        console.log('\n========== DUPLICATE AGENTS ==========');
        console.log(`Found ${duplicates.length} duplicate agent names`);
        duplicates.slice(0, 5).forEach(([name, agents]) => {
          console.log(`\n"${name}" (${agents.length} copies):`);
          agents.forEach(a => {
            console.log(`  - ID: ${a.id.substring(0, 10)}..., Avatar: ${a.avatar ? 'YES' : 'NO'}, User: ${a.userId ? 'USER' : 'FEATURED'}, Kind: ${a.kind}`);
          });
        });
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
