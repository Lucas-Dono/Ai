/**
 * Script para listar TODOS los agentes de un usuario
 * Simula exactamente lo que hace el endpoint GET /api/agents
 */

import { prisma } from '../lib/prisma';

async function checkUserAgents(userIdOrEmail: string) {
  console.log('\n🔍 === AGENTES DEL USUARIO ===\n');

  try {
    // Buscar usuario por ID o email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userIdOrEmail },
          { email: userIdOrEmail },
        ],
      },
    });

    if (!user) {
      console.log(`❌ Usuario no encontrado: ${userIdOrEmail}\n`);
      return;
    }

    console.log(`✅ Usuario encontrado:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nombre: ${user.name}\n`);

    // Simular EXACTAMENTE la query del endpoint GET /api/agents
    const where = {
      OR: [
        // Agentes del usuario
        { userId: user.id },
        // Agentes públicos del sistema
        {
          userId: null,
          visibility: "public",
        }
      ]
    };

    const agents = await prisma.agent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        kind: true,
        visibility: true,
        userId: true,
        createdAt: true,
        avatar: true,
      },
    });

    console.log(`📊 Total de agentes: ${agents.length}`);
    console.log(`   - Del usuario: ${agents.filter(a => a.userId === user.id).length}`);
    console.log(`   - Públicos (sistema): ${agents.filter(a => a.userId === null).length}\n`);

    if (agents.length === 0) {
      console.log('⚠️  No hay agentes para mostrar\n');
      return;
    }

    console.log('📝 Lista de agentes:\n');

    agents.forEach((agent, idx) => {
      const isOwn = agent.userId === user.id;
      const badge = isOwn ? '👤 PROPIO' : '🌍 PÚBLICO';

      console.log(`${idx + 1}. ${badge} - ${agent.name}`);
      console.log(`   ID: ${agent.id}`);
      console.log(`   Tipo: ${agent.kind}`);
      console.log(`   Visibilidad: ${agent.visibility}`);
      console.log(`   Creado: ${agent.createdAt.toISOString()}`);
      console.log(`   Avatar: ${agent.avatar ? 'Sí' : 'No'}`);
      console.log('');
    });

    // Verificar específicamente el agente problemático
    const problematicAgent = agents.find(a => a.id === '7BqBzpKVdaaHl7TELGTtv');
    if (problematicAgent) {
      console.log('✅ El agente "María Elena Volkov Smirnof" SÍ está en la lista\n');
    } else {
      console.log('❌ El agente "María Elena Volkov Smirnof" NO está en la lista');
      console.log('   Esto es extraño porque existe en la BD con userId correcto\n');

      // Verificar si existe pero con otro userId
      const agentWithDifferentUser = await prisma.agent.findUnique({
        where: { id: '7BqBzpKVdaaHl7TELGTtv' },
        select: { id: true, name: true, userId: true },
      });

      if (agentWithDifferentUser) {
        console.log('🔍 El agente existe pero con diferente userId:');
        console.log(`   userId del agente: ${agentWithDifferentUser.userId}`);
        console.log(`   userId esperado: ${user.id}`);
        console.log(`   ¿Coinciden? ${agentWithDifferentUser.userId === user.id ? 'Sí' : 'NO'}\n`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('✅ === VERIFICACIÓN COMPLETADA ===\n');
}

const userIdOrEmail = process.argv[2] || 'lucasdono391@gmail.com';

console.log(`Buscando agentes para: ${userIdOrEmail}`);
checkUserAgents(userIdOrEmail);
