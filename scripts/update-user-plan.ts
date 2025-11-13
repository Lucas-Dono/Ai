/**
 * Script para actualizar el plan de un usuario
 * Uso: npx tsx scripts/update-user-plan.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserPlan() {
  const email = 'lucasdono391@gmail.com';
  const newPlan = 'ultra';

  try {
    console.log(`🔍 Buscando usuario con email: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
      },
    });

    if (!user) {
      console.error(`❌ No se encontró usuario con email: ${email}`);
      process.exit(1);
    }

    console.log(`✅ Usuario encontrado:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Plan actual: ${user.plan}`);

    console.log(`\n🔄 Actualizando plan a: ${newPlan}...`);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        plan: newPlan,
      },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
      },
    });

    console.log(`\n✅ Plan actualizado exitosamente:`);
    console.log(`   Nombre: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Plan: ${updatedUser.plan}`);
    console.log(`\n🎉 ¡Disfruta tu plan Ultra!`);

  } catch (error) {
    console.error('❌ Error al actualizar plan:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserPlan();
