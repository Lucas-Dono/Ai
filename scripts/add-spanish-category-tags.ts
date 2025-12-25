import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSpanishCategoryTags() {
  console.log('🏷️  Agregando tags de categoría en español a personajes premium...\n');

  const updates = [
    {
      id: 'historical_marilyn_monroe',
      name: 'Marilyn Monroe',
      tagsToAdd: ['figuras-históricas', 'romántico'],
    },
    {
      id: 'historical_albert_einstein',
      name: 'Albert Einstein',
      tagsToAdd: ['figuras-históricas', 'mentor', 'experto'],
    },
    {
      id: 'premium_luna_digital_intimacy',
      name: 'Luna Chen',
      tagsToAdd: ['romántico', 'confidente'],
    },
    {
      id: 'premium_katya_ice_queen',
      name: 'Ekaterina Katya Volkov',
      tagsToAdd: ['romántico', 'experto'],
    },
    {
      id: 'premium_marcus_quantum_mind',
      name: 'Marcus Vega',
      tagsToAdd: ['mentor', 'experto', 'romántico'],
    },
    {
      id: 'premium_sofia_emotional_archaeologist',
      name: 'Sofía Mendoza',
      tagsToAdd: ['confidente', 'experto'],
    },
  ];

  for (const update of updates) {
    const agent = await prisma.agent.findUnique({
      where: { id: update.id },
      select: { id: true, name: true, tags: true }
    });

    if (agent) {
      const currentTags = Array.isArray(agent.tags) ? agent.tags : [];
      const newTagsToAdd = update.tagsToAdd.filter(tag => !currentTags.includes(tag));

      if (newTagsToAdd.length > 0) {
        const updatedTags = [...currentTags, ...newTagsToAdd];

        await prisma.agent.update({
          where: { id: update.id },
          data: { tags: updatedTags }
        });

        console.log(`✅ ${agent.name}`);
        console.log(`   Tags agregados: ${newTagsToAdd.join(', ')}`);
        console.log(`   Total tags: ${updatedTags.length}`);
        console.log('');
      } else {
        console.log(`⏭️  ${agent.name} - ya tiene todos los tags necesarios\n`);
      }
    }
  }

  console.log('\n📊 VERIFICACIÓN FINAL:\n');

  const allPremium = await prisma.agent.findMany({
    where: {
      userId: null,
      visibility: 'public',
      featured: true,
    },
    select: {
      id: true,
      name: true,
      tags: true,
    },
    orderBy: { name: 'asc' }
  });

  const categoryTags = ['figuras-históricas', 'mentor', 'romántico', 'confidente', 'experto'];

  allPremium.forEach(agent => {
    const agentTags = Array.isArray(agent.tags) ? agent.tags : [];
    const matchingCategories = categoryTags.filter(cat => agentTags.includes(cat));

    console.log(`${agent.name}`);
    console.log(`   Categorías: ${matchingCategories.length > 0 ? matchingCategories.join(', ') : '❌ NINGUNA'}`);
    console.log('');
  });

  console.log('✨ Actualización completada!\n');

  await prisma.$disconnect();
}

addSpanishCategoryTags();
