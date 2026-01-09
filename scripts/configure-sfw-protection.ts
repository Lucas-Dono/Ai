/**
 * Script para configurar valores iniciales de SFW Protection
 * y mostrar estadísticas de migración
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function configureSFWProtection() {
  console.log('===========================================');
  console.log('🔒 SFW Protection Migration');
  console.log('===========================================\n');

  try {
    // Configurar sfwProtection basado en plan
    // FREE users: siempre true (forzado)
    // PREMIUM users: false por defecto (pueden activarlo si quieren)

    const updatedPremiumUsers = await prisma.user.updateMany({
      where: {
        plan: {
          in: ['plus', 'ultra']
        }
      },
      data: {
        sfwProtection: false
      }
    });

    console.log(`✅ Configurados ${updatedPremiumUsers.count} usuarios premium con protección desactivada (pueden activarla si quieren)\n`);

    // Obtener estadísticas
    const totalUsers = await prisma.user.count();
    const freeUsers = await prisma.user.count({ where: { plan: 'free' } });
    const plusUsers = await prisma.user.count({ where: { plan: 'plus' } });
    const ultraUsers = await prisma.user.count({ where: { plan: 'ultra' } });
    const protectedUsers = await prisma.user.count({ where: { sfwProtection: true } });
    const unprotectedUsers = await prisma.user.count({ where: { sfwProtection: false } });

    console.log('📊 Estadísticas de Migración:');
    console.log('===========================================');
    console.log(`Total de usuarios: ${totalUsers}`);
    console.log(`  - Free: ${freeUsers} (protección forzada)`);
    console.log(`  - Plus: ${plusUsers} (pueden configurar)`);
    console.log(`  - Ultra: ${ultraUsers} (pueden configurar)`);
    console.log('');
    console.log(`Usuarios con protección activa: ${protectedUsers}`);
    console.log(`Usuarios sin protección: ${unprotectedUsers}`);
    console.log('===========================================\n');

    console.log('✅ Migración completada exitosamente!');
    console.log('');
    console.log('📝 Próximos pasos:');
    console.log('1. Reinicia tu servidor de desarrollo');
    console.log('2. Ve a /configuracion → Preferencias');
    console.log('3. Prueba el toggle de SFW Protection');
    console.log('');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

configureSFWProtection()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
