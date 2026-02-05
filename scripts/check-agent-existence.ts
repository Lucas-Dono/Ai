/**
 * Script para verificar si un agente existe en la base de datos
 * y obtener información detallada sobre él
 */

import { prisma } from '../lib/prisma';

async function checkAgentExistence(agentId: string) {
  console.log('\n🔍 === VERIFICANDO EXISTENCIA DE AGENTE ===\n');
  console.log(`Agent ID: ${agentId}\n`);

  try {
    // 1. Buscar el agente
    console.log('📋 1. Buscando agente en la base de datos...');
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!agent) {
      console.log('❌ AGENTE NO ENCONTRADO en la base de datos');
      console.log('\n💡 Esto confirma que:');
      console.log('   - El agente fue eliminado del servidor');
      console.log('   - Pero sigue en caché de la app móvil');
      console.log('\n✅ Solución: Limpiar caché de la app móvil\n');
      return;
    }

    console.log('✅ AGENTE ENCONTRADO:');
    console.log(JSON.stringify({
      id: agent.id,
      name: agent.name,
      description: agent.description?.substring(0, 100) + '...',
      kind: agent.kind,
      visibility: agent.visibility,
      isPublic: agent.isPublic,
      featured: agent.featured,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      userId: agent.userId,
      userName: agent.User?.name,
      userEmail: agent.User?.email,
      hasAvatar: !!agent.avatar,
      avatarPreview: agent.avatar?.substring(0, 50),
    }, null, 2));

    // 2. Contar mensajes del agente
    console.log('\n📬 2. Contando mensajes del agente...');
    const totalMessages = await prisma.message.count({
      where: { agentId },
    });
    console.log(`   Total de mensajes: ${totalMessages}`);

    // 3. Contar mensajes por usuario
    if (totalMessages > 0) {
      console.log('\n👥 3. Mensajes por usuario:');
      const messagesByUser = await prisma.message.groupBy({
        by: ['userId'],
        where: { agentId },
        _count: { id: true },
      });

      for (const group of messagesByUser) {
        const user = await prisma.user.findUnique({
          where: { id: group.userId },
          select: { name: true, email: true },
        });
        console.log(`   - Usuario ${group.userId} (${user?.name || 'Unknown'}): ${group._count.id} mensajes`);
      }

      // 4. Mostrar últimos 5 mensajes
      console.log('\n💬 4. Últimos 5 mensajes:');
      const recentMessages = await prisma.message.findMany({
        where: { agentId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          User: {
            select: { name: true },
          },
        },
      });

      recentMessages.forEach((msg, idx) => {
        console.log(`   ${idx + 1}. [${msg.role}] ${msg.User?.name}: ${msg.content?.substring(0, 80)}...`);
        console.log(`      Fecha: ${msg.createdAt.toLocaleString()}`);
      });
    } else {
      console.log('\n⚠️  No hay mensajes para este agente');
    }

    // 5. Verificar relaciones
    console.log('\n🔗 5. Relaciones del agente:');
    const relations = await prisma.relation.count({
      where: {
        OR: [
          { subjectId: agentId },
          { targetId: agentId },
        ],
      },
    });
    console.log(`   Relaciones: ${relations}`);

    // 6. Verificar bonds
    const bonds = await prisma.symbolicBond.count({
      where: { agentId },
    });
    console.log(`   Bonds: ${bonds}`);

  } catch (error) {
    console.error('❌ Error al consultar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n✅ === VERIFICACIÓN COMPLETADA ===\n');
}

// Obtener agentId de los argumentos de línea de comandos
const agentId = process.argv[2];

if (!agentId) {
  console.error('❌ Error: Debes proporcionar el ID del agente');
  console.log('\nUso: npm run check-agent <agentId>');
  console.log('Ejemplo: npm run check-agent 7BqBzpKVdaaHl7TELGTtv\n');
  process.exit(1);
}

checkAgentExistence(agentId);
