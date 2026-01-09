/**
 * Script de prueba para verificar la API de SFW Protection
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSFWAPI() {
  console.log('🧪 Testing SFW Protection API\n');

  try {
    // Verificar que el campo existe
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        plan: true,
        sfwProtection: true,
      },
      take: 5,
    });

    console.log('✅ Campo sfwProtection encontrado en base de datos');
    console.log('\n📋 Usuarios en base de datos:');
    console.log('================================');

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email}`);
      console.log(`   Plan: ${user.plan}`);
      console.log(`   SFW Protection: ${user.sfwProtection ? '🔒 ACTIVA' : '🔓 DESACTIVADA'}`);
    });

    console.log('\n================================');
    console.log('\n✅ Test completado!');
    console.log('\n📝 Notas:');
    console.log('- FREE users deben tener protección ACTIVA (true)');
    console.log('- PREMIUM users pueden tener protección DESACTIVADA (false)');
    console.log('');
    console.log('🌐 Para probar la API en el navegador:');
    console.log('   1. Inicia sesión en la aplicación');
    console.log('   2. Abre la consola del navegador (F12)');
    console.log('   3. Ejecuta: fetch(\'/api/user/sfw-protection\').then(r => r.json()).then(console.log)');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testSFWAPI()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
