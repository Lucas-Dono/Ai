// fix_duplicate_user.js - Consolidar usuarios duplicados
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDuplicateUser() {
  try {
    const oldUserId = 'cmgob8zvy0000vgpwniod29zv';  // Usuario viejo con agentes
    const newUserId = 'cmgoalry70000vg3ko4n0itsf';  // Usuario nuevo con plan enterprise

    console.log('🔄 Consolidando usuarios duplicados...\n');

    // 1. Transferir los agentes del usuario viejo al nuevo
    console.log('📦 Transfiriendo agentes...');
    const updateResult = await prisma.agent.updateMany({
      where: { userId: oldUserId },
      data: { userId: newUserId }
    });
    console.log(`✅ Agentes transferidos: ${updateResult.count}\n`);

    // 2. Verificar que el usuario viejo no tenga más datos
    const oldUser = await prisma.user.findUnique({
      where: { id: oldUserId },
      include: {
        _count: {
          select: {
            agents: true,
            worlds: true,
            usage: true,
            sessions: true,
            accounts: true,
          }
        }
      }
    });

    console.log('📊 Usuario viejo después de la transferencia:');
    console.log(`  Agentes: ${oldUser?._count.agents}`);
    console.log(`  Mundos: ${oldUser?._count.worlds}`);
    console.log(`  Uso: ${oldUser?._count.usage}`);
    console.log(`  Sesiones: ${oldUser?._count.sessions}`);
    console.log(`  Cuentas: ${oldUser?._count.accounts}\n`);

    // 3. Eliminar el usuario viejo si no tiene más datos
    if (oldUser &&
        oldUser._count.agents === 0 &&
        oldUser._count.worlds === 0 &&
        oldUser._count.sessions === 0 &&
        oldUser._count.accounts === 0) {

      console.log('🗑️  Eliminando usuario viejo...');
      await prisma.user.delete({
        where: { id: oldUserId }
      });
      console.log('✅ Usuario viejo eliminado\n');
    }

    // 4. Verificar el estado final
    console.log('🔍 Estado final:');
    const finalUser = await prisma.user.findUnique({
      where: { id: newUserId },
      include: {
        _count: {
          select: {
            agents: true,
            worlds: true,
          }
        }
      }
    });

    console.log(`✅ Usuario: ${finalUser?.name} (${finalUser?.email})`);
    console.log(`   Plan: ${finalUser?.plan}`);
    console.log(`   Agentes: ${finalUser?._count.agents}`);
    console.log(`   Mundos: ${finalUser?._count.worlds}`);

    console.log('\n✅ ¡Consolidación completada!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicateUser();
