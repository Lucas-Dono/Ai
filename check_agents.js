// check_agents.js - Verificar agentes en la base de datos
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAgents() {
  try {
    console.log('🔍 Buscando todos los agentes...\n');

    const agents = await prisma.agent.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    console.log(`📊 Agentes encontrados: ${agents.length}\n`);

    agents.forEach((agent, index) => {
      console.log(`🤖 Agente ${index + 1}:`);
      console.log(`  ID: ${agent.id}`);
      console.log(`  Nombre: ${agent.name}`);
      console.log(`  Tipo: ${agent.kind}`);
      console.log(`  Usuario: ${agent.user.name || agent.user.email} (${agent.userId})`);
      console.log(`  Creado: ${agent.createdAt}`);
      console.log('');
    });

    // También buscar agentes huérfanos (sin usuario válido)
    console.log('🔍 Buscando agentes huérfanos...\n');

    const allUsers = await prisma.user.findMany({ select: { id: true } });
    const userIds = new Set(allUsers.map(u => u.id));

    const orphanAgents = agents.filter(a => !userIds.has(a.userId));

    if (orphanAgents.length > 0) {
      console.log(`⚠️  Agentes huérfanos encontrados: ${orphanAgents.length}`);
      orphanAgents.forEach(agent => {
        console.log(`  - ${agent.name} (userId: ${agent.userId})`);
      });
    } else {
      console.log('✅ No hay agentes huérfanos');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAgents();
