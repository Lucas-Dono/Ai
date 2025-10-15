// check_duplicate_users.js - Investigate duplicate email issue
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicates() {
  try {
    console.log('🔍 Buscando usuarios con email: Lucasdono391@gmail.com\n');

    const users = await prisma.user.findMany({
      where: {
        email: 'Lucasdono391@gmail.com'
      },
      include: {
        agents: {
          select: {
            id: true,
            name: true,
          }
        },
        worlds: {
          select: {
            id: true,
            name: true,
          }
        },
        accounts: {
          select: {
            provider: true,
          }
        }
      }
    });

    console.log(`📊 Usuarios encontrados: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`👤 Usuario ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Nombre: ${user.name}`);
      console.log(`  Plan: ${user.plan}`);
      console.log(`  Creado: ${user.createdAt}`);
      console.log(`  Agentes: ${user.agents.length}`);
      user.agents.forEach(agent => {
        console.log(`    - ${agent.name} (${agent.id})`);
      });
      console.log(`  Mundos: ${user.worlds.length}`);
      console.log(`  Cuentas OAuth: ${user.accounts.length}`);
      user.accounts.forEach(account => {
        console.log(`    - Provider: ${account.provider}`);
      });
      console.log('');
    });

    // Check if there are sessions for each user
    console.log('🔐 Verificando sesiones...\n');
    for (const user of users) {
      const sessions = await prisma.session.findMany({
        where: { userId: user.id }
      });
      console.log(`Sesiones activas para ${user.id}: ${sessions.length}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicates();
