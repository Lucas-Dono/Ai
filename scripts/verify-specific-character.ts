#!/usr/bin/env tsx
import { prisma } from '@/lib/prisma';
import { extractEnrichedDimensions } from '@/lib/psychological-analysis';

async function main() {
  // Verificar personajes específicos
  const names = ['Liam O\'Connor', 'Amara Okafor', 'Marcus Vega', 'Katya'];

  for (const searchName of names) {
    const agent = await prisma.agent.findFirst({
      where: { name: { contains: searchName } },
      include: { PersonalityCore: true },
    });

    if (!agent) continue;

    console.log(`\n═══════════════════════════════════════════════`);
    console.log(`${agent.name}`);
    console.log(`═══════════════════════════════════════════════\n`);

    if (!agent.PersonalityCore) {
      console.log('❌ No tiene PersonalityCore');
      continue;
    }

    const core = agent.PersonalityCore;

    console.log('Big Five:');
    console.log(`  O=${core.openness} C=${core.conscientiousness} E=${core.extraversion} A=${core.agreeableness} N=${core.neuroticism}\n`);

    const enriched = extractEnrichedDimensions(core.coreValues);

    if (enriched?.darkTriad) {
      console.log('Dark Triad:');
      console.log(`  Machiavellianism: ${enriched.darkTriad.machiavellianism}`);
      console.log(`  Narcissism: ${enriched.darkTriad.narcissism}`);
      console.log(`  Psychopathy: ${enriched.darkTriad.psychopathy}\n`);
    }

    if (enriched?.attachment) {
      console.log('Attachment:');
      console.log(`  Style: ${enriched.attachment.primaryStyle}`);
      console.log(`  Intensity: ${enriched.attachment.intensity}%\n`);
    }

    if (enriched?.facets) {
      console.log('Sample Facets (Openness):');
      console.log(`  Imagination: ${enriched.facets.openness.imagination.toFixed(1)}`);
      console.log(`  Artistic Interests: ${enriched.facets.openness.artisticInterests.toFixed(1)}`);
      console.log(`  Intellect: ${enriched.facets.openness.intellect.toFixed(1)}\n`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
