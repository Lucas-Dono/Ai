/**
 * Diagnóstico del estado de memorias y bonds de Sophie
 */

import { prisma } from '@/lib/prisma';

async function diagnoseSophie() {
  console.log('🔍 Diagnosticando estado de Sophie Müller...\n');

  const agentId = 'cmi3l240x0001ijyeo5p9ixex';
  const userId = 'cmhxj7rk30004ijzv38eeloz2';

  try {
    // 1. Verificar agente
    console.log('1️⃣ Verificando agente...');
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        name: true,
        profile: true,
        EpisodicMemory: true,
        ImportantPerson: true,
        ImportantEvent: true,
      }
    });

    if (!agent) {
      throw new Error('Agente no encontrado');
    }

    console.log(`✅ Agente: ${agent.name}`);
    console.log(`   Profile generado: ${agent.profile ? '✅ Sí' : '❌ No'}\n`);

    if (agent.profile) {
      console.log('   Profile data keys:', Object.keys(agent.profile as any));
      const profileData = agent.profile as any;

      if (profileData.family) {
        console.log('   ✅ Tiene información de familia');
      } else {
        console.log('   ❌ NO tiene información de familia');
      }

      if (profileData.socialCircle) {
        console.log('   ✅ Tiene información de círculo social');
      } else {
        console.log('   ❌ NO tiene información de círculo social');
      }

      if (profileData.lifeExperiences) {
        console.log('   ✅ Tiene experiencias de vida');
      } else {
        console.log('   ❌ NO tiene experiencias de vida');
      }
      console.log();
    }

    // 2. Verificar memorias episódicas (eventos)
    console.log('2️⃣ Verificando memorias episódicas (eventos)...');
    const events = await prisma.episodicMemory.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`   Total eventos: ${events.length}`);
    if (events.length > 0) {
      console.log('   Últimos 3 eventos:');
      events.slice(0, 3).forEach((event, i) => {
        console.log(`   ${i + 1}. ${event.event}`);
      });
    } else {
      console.log('   ❌ NO tiene eventos guardados');
    }
    console.log();

    // 3. Verificar personas conocidas
    console.log('3️⃣ Verificando personas conocidas...');
    const people = await prisma.importantPerson.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`   Total personas: ${people.length}`);
    if (people.length > 0) {
      console.log('   Personas:');
      people.forEach((person, i) => {
        console.log(`   ${i + 1}. ${person.name} - ${person.relationship || 'sin relación definida'}`);
      });
    } else {
      console.log('   ❌ NO tiene personas guardadas');
    }
    console.log();

    // 4. Verificar Bond con usuario
    console.log('4️⃣ Verificando Bond con usuario Lucas...');
    const bond = await prisma.symbolicBond.findFirst({
      where: {
        userId,
        agentId,
      }
    });

    if (bond) {
      console.log(`   ✅ Bond existe`);
      console.log(`   Tier: ${bond.tier}`);
      console.log(`   Affinity Level: ${bond.affinityLevel}`);
      console.log(`   Status: ${bond.status}`);
      console.log(`   Total Interactions: ${bond.totalInteractions}`);
      console.log(`   Created: ${bond.createdAt}`);
      console.log(`   Updated: ${bond.updatedAt}`);
    } else {
      console.log('   ❌ NO existe bond con este usuario');
    }
    console.log();

    // 5. Verificar mensajes intercambiados
    console.log('5️⃣ Verificando mensajes...');
    const messageCount = await prisma.message.count({
      where: {
        agentId,
        userId,
      }
    });

    console.log(`   Total mensajes: ${messageCount}`);
    console.log();

    // 6. Verificar memorias sobre el usuario
    console.log('6️⃣ Verificando memorias sobre el usuario...');
    const userMemories = await prisma.episodicMemory.findMany({
      where: {
        agentId,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log(`   Memorias del agente: ${userMemories.length}`);
    if (userMemories.length > 0) {
      console.log('   Últimas memorias:');
      userMemories.forEach((mem, i) => {
        console.log(`   ${i + 1}. ${mem.event}`);
      });
    } else {
      console.log('   ❌ NO tiene memorias guardadas');
    }
    console.log();

    // Resumen de problemas
    console.log('📋 RESUMEN DE PROBLEMAS:');
    const problems: string[] = [];

    if (!agent.profile) {
      problems.push('❌ No tiene profile generado');
    }

    if (events.length === 0) {
      problems.push('❌ No tiene eventos/experiencias de vida');
    }

    if (people.length === 0) {
      problems.push('❌ No tiene personas conocidas (familia, amigos)');
    }

    if (!bond) {
      problems.push('❌ No existe bond con el usuario');
    } else if (bond.status === 'dormant' && messageCount > 5) {
      problems.push(`⚠️ Bond está en "${bond.status}" después de ${messageCount} mensajes`);
    }

    if (userMemories.length === 0 && messageCount > 5) {
      problems.push('⚠️ No tiene memorias sobre el usuario después de conversar');
    }

    if (problems.length === 0) {
      console.log('✅ ¡Todo está bien!');
    } else {
      problems.forEach(p => console.log(p));
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseSophie().catch(console.error);
