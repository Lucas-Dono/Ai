import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeo de nombres a géneros basado en nombres comunes
const genderInference: Record<string, string> = {
  // Agentes existentes sin género
  'Luna': 'female',
  'Nexus': 'neutral',
  'Aria': 'female',
  'Atlas': 'male',

  // Otros nombres comunes femeninos
  'Emma': 'female',
  'Sophia': 'female',
  'Olivia': 'female',
  'Isabella': 'female',
  'Mia': 'female',
  'Charlotte': 'female',
  'Ava': 'female',
  'Emily': 'female',
  'Madison': 'female',
  'Harper': 'female',

  // Otros nombres comunes masculinos
  'Liam': 'male',
  'Noah': 'male',
  'Oliver': 'male',
  'James': 'male',
  'Lucas': 'male',
  'Benjamin': 'male',
  'Mason': 'male',
  'Ethan': 'male',
  'Logan': 'male',
  'Alexander': 'male',

  // Neutros
  'Alex': 'neutral',
  'Jordan': 'neutral',
  'Taylor': 'neutral',
  'Morgan': 'neutral',
  'Riley': 'neutral',
  'Quinn': 'neutral',
  'Sage': 'neutral',
  'Phoenix': 'neutral',
  'Rowan': 'neutral',
};

async function main() {
  console.log('🔍 Buscando agentes sin género...\n');

  const agentsWithoutGender = await prisma.agent.findMany({
    where: {
      OR: [
        { gender: null },
        { gender: '' },
      ],
    },
    select: {
      id: true,
      name: true,
      gender: true,
    },
  });

  console.log(`📊 Encontrados ${agentsWithoutGender.length} agentes sin género\n`);

  if (agentsWithoutGender.length === 0) {
    console.log('✅ Todos los agentes ya tienen género asignado');
    return;
  }

  let updated = 0;
  let skipped = 0;

  for (const agent of agentsWithoutGender) {
    const inferredGender = genderInference[agent.name];

    if (inferredGender) {
      await prisma.agent.update({
        where: { id: agent.id },
        data: { gender: inferredGender },
      });

      console.log(`✅ ${agent.name.padEnd(30)} → ${inferredGender}`);
      updated++;
    } else {
      console.log(`⚠️  ${agent.name.padEnd(30)} → No se pudo inferir (dejado como NULL)`);
      skipped++;
    }
  }

  console.log('\n=== Resumen ===');
  console.log(`✅ Actualizados: ${updated}`);
  console.log(`⚠️  Sin cambios:  ${skipped}`);
  console.log(`📊 Total:        ${agentsWithoutGender.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
