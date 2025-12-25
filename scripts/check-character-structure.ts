import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCharacterStructure() {
  console.log('🔍 Verificando estructura de personajes...\n');

  // Buscar Sophie Müller como referencia
  const sophie = await prisma.agent.findFirst({
    where: {
      name: {
        contains: 'Sophie'
      }
    }
  });

  console.log('📋 SOPHIE MÜLLER (Referencia):');
  if (sophie) {
    console.log(JSON.stringify({
      id: sophie.id,
      name: sophie.name,
      kind: sophie.kind,
      visibility: sophie.visibility,
      userId: sophie.userId,
      teamId: sophie.teamId,
      featured: sophie.featured,
      description: sophie.description,
      tags: sophie.tags,
      avatar: sophie.avatar,
      nsfwMode: sophie.nsfwMode,
      nsfwLevel: sophie.nsfwLevel,
      personalityVariant: sophie.personalityVariant,
      generationTier: sophie.generationTier,
    }, null, 2));
  } else {
    console.log('❌ No encontrada');
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Buscar Luna como comparación
  const luna = await prisma.agent.findUnique({
    where: {
      id: 'premium_luna_digital_intimacy'
    }
  });

  console.log('📋 LUNA CHEN (Premium):');
  if (luna) {
    console.log(JSON.stringify({
      id: luna.id,
      name: luna.name,
      kind: luna.kind,
      visibility: luna.visibility,
      userId: luna.userId,
      teamId: luna.teamId,
      featured: luna.featured,
      description: luna.description,
      tags: luna.tags,
      avatar: luna.avatar,
      nsfwMode: luna.nsfwMode,
      nsfwLevel: luna.nsfwLevel,
      personalityVariant: luna.personalityVariant,
      generationTier: luna.generationTier,
    }, null, 2));
  } else {
    console.log('❌ No encontrada');
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Verificar todos los personajes públicos
  const allPublic = await prisma.agent.findMany({
    where: {
      OR: [
        { visibility: 'public' },
        { visibility: 'world' }
      ]
    },
    select: {
      id: true,
      name: true,
      visibility: true,
      userId: true,
      featured: true,
    }
  });

  console.log(`📊 Total personajes públicos: ${allPublic.length}\n`);
  allPublic.forEach(agent => {
    console.log(`   ${agent.name} (${agent.visibility}) - Featured: ${agent.featured} - UserId: ${agent.userId || 'null'}`);
  });

  await prisma.$disconnect();
}

checkCharacterStructure();
