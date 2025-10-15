// test_api_plan.js - Probar endpoint de plan
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPlan() {
  try {
    console.log('🔍 Verificando plan del usuario...\n');

    const user = await prisma.user.findUnique({
      where: { email: 'lucasdono391@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true
      }
    });

    if (user) {
      console.log('✅ Usuario encontrado:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nombre: ${user.name}`);
      console.log(`   Plan: ${user.plan}`);
      console.log(`   Plan type: ${typeof user.plan}`);
    } else {
      console.log('❌ Usuario no encontrado');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPlan();
