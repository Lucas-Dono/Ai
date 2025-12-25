import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPremiumCharacters() {
  console.log('🔧 Limpiando y corrigiendo personajes premium...\n');

  // IDs de los personajes premium que deben existir
  const premiumIds = [
    'premium_luna_digital_intimacy',
    'premium_katya_ice_queen',
    'historical_marilyn_monroe',
    'historical_albert_einstein',
    'premium_marcus_quantum_mind',
    'premium_sofia_emotional_archaeologist',
  ];

  // 1. Primero, eliminar TODOS los duplicados con userId = 'system'
  console.log('🗑️  Eliminando duplicados con userId = "system"...');

  const deleteResult = await prisma.agent.deleteMany({
    where: {
      userId: 'system',
      id: {
        in: premiumIds
      }
    }
  });

  console.log(`   ✅ Eliminados ${deleteResult.count} duplicados\n`);

  // 2. Verificar que todos los personajes premium existen con userId: null
  console.log('🔍 Verificando personajes premium...\n');

  for (const id of premiumIds) {
    const agent = await prisma.agent.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        userId: true,
        visibility: true,
        featured: true,
      }
    });

    if (!agent) {
      console.log(`   ❌ ${id} no existe`);
    } else if (agent.userId !== null) {
      console.log(`   ⚠️  ${agent.name} tiene userId: ${agent.userId} - corrigiendo...`);

      await prisma.agent.update({
        where: { id },
        data: {
          userId: null,
          visibility: 'public',
          featured: true,
        }
      });

      console.log(`      ✅ Corregido`);
    } else {
      console.log(`   ✅ ${agent.name} - OK (userId: null, visibility: ${agent.visibility})`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICACIÓN FINAL');
  console.log('='.repeat(60) + '\n');

  // Verificación final
  const finalAgents = await prisma.agent.findMany({
    where: {
      userId: null,
      visibility: 'public',
    },
    select: {
      id: true,
      name: true,
      userId: true,
      visibility: true,
      featured: true,
      nsfwMode: true,
      nsfwLevel: true,
    },
    orderBy: {
      name: 'asc'
    }
  });

  console.log(`Total de personajes públicos: ${finalAgents.length}\n`);

  finalAgents.forEach(agent => {
    const isPremium = premiumIds.includes(agent.id);
    console.log(`${isPremium ? '⭐' : '  '} ${agent.name}`);
    console.log(`      ID: ${agent.id}`);
    console.log(`      NSFW: ${agent.nsfwMode} (${agent.nsfwLevel || 'N/A'})`);
    console.log(`      Featured: ${agent.featured}`);
    console.log('');
  });

  console.log('✨ Corrección completada!\n');

  await prisma.$disconnect();
}

fixPremiumCharacters();
