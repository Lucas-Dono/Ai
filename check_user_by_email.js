// check_user_by_email.js - Verificar usuario por email
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('🔍 Buscando usuario con email: lucasdono391@gmail.com\n');

    const user = await prisma.user.findUnique({
      where: {
        email: 'lucasdono391@gmail.com'
      },
      include: {
        _count: {
          select: {
            agents: true,
            sessions: true,
          }
        }
      }
    });

    if (user) {
      console.log('👤 Usuario encontrado:');
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Nombre: ${user.name}`);
      console.log(`  Plan: ${user.plan}`);
      console.log(`  Agentes: ${user._count.agents}`);
      console.log(`  Sesiones: ${user._count.sessions}`);
      console.log(`  Creado: ${user.createdAt}`);
    } else {
      console.log('❌ No se encontró usuario con ese email');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
