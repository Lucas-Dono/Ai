/**
 * Script: Asignar Nichos de Historias
 * Asigna manualmente nichos históricos a personajes específicos
 */

import { prisma } from '../lib/prisma';
import { HISTORICAL_CHARACTER_MAPPING, detectStoryNicheByName } from '../lib/stories/config';

async function assignStoryNiches() {
  console.log('🚀 Iniciando asignación de nichos históricos...\n');

  // Obtener todos los agentes públicos del sistema (históricos)
  const agents = await prisma.agent.findMany({
    where: {
      visibility: 'public',
      userId: null, // Solo personajes predefinidos del sistema
    },
    select: {
      id: true,
      name: true,
      aiGeneratedFields: true
    }
  });

  console.log(`📊 Encontrados ${agents.length} personajes del sistema\n`);

  let assigned = 0;
  let skipped = 0;
  let errors = 0;

  for (const agent of agents) {
    try {
      // Detectar nicho por nombre
      const nicheType = detectStoryNicheByName(agent.name);

      if (!nicheType) {
        console.log(`  ⚠️  ${agent.name} - No matches nicho histórico (skip)`);
        skipped++;
        continue;
      }

      // Actualizar aiGeneratedFields
      const currentFields = (agent.aiGeneratedFields as any) || {};
      const updatedFields = {
        ...currentFields,
        storyNiche: {
          type: nicheType,
          tags: [nicheType, 'historical', 'iconic']
        }
      };

      await prisma.agent.update({
        where: { id: agent.id },
        data: { aiGeneratedFields: updatedFields }
      });

      assigned++;
      console.log(`  ✅ ${agent.name} → ${nicheType}`);
    } catch (error) {
      errors++;
      console.error(`  ❌ Error procesando ${agent.name}:`, error);
    }
  }

  console.log(`\n
═══════════════════════════════════════
   ASIGNACIÓN COMPLETADA
═══════════════════════════════════════
✅ Asignados: ${assigned}
⚠️  Omitidos: ${skipped}
${errors > 0 ? `❌ Errores: ${errors}` : ''}
═══════════════════════════════════════

📋 Distribución por nicho:`);

  // Mostrar distribución
  for (const [niche, names] of Object.entries(HISTORICAL_CHARACTER_MAPPING)) {
    const count = await prisma.agent.count({
      where: {
        aiGeneratedFields: {
          path: ['storyNiche', 'type'],
          equals: niche
        }
      }
    });
    console.log(`   ${niche}: ${count} personajes`);
  }

  console.log('\n');
}

// Ejecutar script
assignStoryNiches()
  .then(() => {
    console.log('🎉 Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
