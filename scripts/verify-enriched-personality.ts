#!/usr/bin/env tsx
import { prisma } from '@/lib/prisma';
import { hasEnrichedDimensions, extractEnrichedDimensions } from '@/lib/psychological-analysis';

async function main() {
  // Obtener un PersonalityCore de ejemplo
  const core = await prisma.personalityCore.findFirst({
    include: {
      Agent: {
        select: { name: true },
      },
    },
  });

  if (!core) {
    console.log('No hay PersonalityCores en la BD');
    return;
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log(`Ejemplo: ${core.Agent?.name || 'Unknown'}`);
  console.log('═══════════════════════════════════════════════\n');

  console.log('Big Five:');
  console.log(`  Openness: ${core.openness}`);
  console.log(`  Conscientiousness: ${core.conscientiousness}`);
  console.log(`  Extraversion: ${core.extraversion}`);
  console.log(`  Agreeableness: ${core.agreeableness}`);
  console.log(`  Neuroticism: ${core.neuroticism}\n`);

  const hasEnriched = hasEnrichedDimensions(core.coreValues);
  console.log(`¿Tiene dimensiones enriquecidas? ${hasEnriched ? 'SÍ ✅' : 'NO ❌'}\n`);

  if (hasEnriched) {
    const enriched = extractEnrichedDimensions(core.coreValues);

    if (enriched?.facets) {
      console.log('Facetas de Openness:');
      console.log(`  Imagination: ${enriched.facets.openness.imagination}`);
      console.log(`  Artistic Interests: ${enriched.facets.openness.artisticInterests}`);
      console.log(`  Intellect: ${enriched.facets.openness.intellect}\n`);
    }

    if (enriched?.darkTriad) {
      console.log('Dark Triad:');
      console.log(`  Machiavellianism: ${enriched.darkTriad.machiavellianism}`);
      console.log(`  Narcissism: ${enriched.darkTriad.narcissism}`);
      console.log(`  Psychopathy: ${enriched.darkTriad.psychopathy}\n`);
    }

    if (enriched?.attachment) {
      console.log('Attachment Profile:');
      console.log(`  Style: ${enriched.attachment.primaryStyle}`);
      console.log(`  Intensity: ${enriched.attachment.intensity}%\n`);
    }

    if (enriched?.psychologicalNeeds) {
      console.log('Psychological Needs (SDT):');
      console.log(`  Connection: ${(enriched.psychologicalNeeds.connection * 100).toFixed(0)}%`);
      console.log(`  Autonomy: ${(enriched.psychologicalNeeds.autonomy * 100).toFixed(0)}%`);
      console.log(`  Competence: ${(enriched.psychologicalNeeds.competence * 100).toFixed(0)}%`);
      console.log(`  Novelty: ${(enriched.psychologicalNeeds.novelty * 100).toFixed(0)}%\n`);
    }
  }

  // Contar total
  const total = await prisma.personalityCore.count();
  console.log(`\nTotal PersonalityCores en BD: ${total}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
