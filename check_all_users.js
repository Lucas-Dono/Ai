// check_all_users.js - Ver todos los usuarios
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllUsers() {
  try {
    console.log('🔍 Listando todos los usuarios...\n');

    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            agents: true,
            worlds: true,
            sessions: true,
          }
        }
      }
    });

    console.log(`📊 Usuarios totales: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`👤 Usuario ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Nombre: ${user.name}`);
      console.log(`  Plan: ${user.plan}`);
      console.log(`  Agentes: ${user._count.agents}`);
      console.log(`  Mundos: ${user._count.worlds}`);
      console.log(`  Sesiones activas: ${user._count.sessions}`);
      console.log(`  Creado: ${user.createdAt}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllUsers();
