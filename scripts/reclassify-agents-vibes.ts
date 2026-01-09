/**
 * Script: Reclasificar TODOS los Agentes por Vibe
 * Fuerza la reclasificación de todos los agentes públicos
 */

import { prisma } from '../lib/prisma';
import { VibeClassifierService } from '../lib/services/vibe-classifier.service';

async function reclassifyAllAgents() {
  console.log('🚀 Iniciando reclasificación FORZADA de todos los agentes...\n');

  // Obtener todos los agentes públicos
  const agents = await prisma.agent.findMany({
    where: {
      visibility: 'public'
    },
    select: {
      id: true,
      name: true,
      description: true,
      personality: true,
      personalityVariant: true,
      categories: true,
      aiGeneratedFields: true
    }
  });

  console.log(`📊 Encontrados ${agents.length} agentes para reclasificar\n`);

  if (agents.length === 0) {
    console.log('✅ No hay agentes para procesar');
    return;
  }

  let processed = 0;
  let errors = 0;
  const batchSize = 5;

  for (let i = 0; i < agents.length; i += batchSize) {
    const batch = agents.slice(i, i + batchSize);

    console.log(`\n📦 Procesando batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(agents.length / batchSize)}`);

    await Promise.all(
      batch.map(async (agent) => {
        try {
          console.log(`  🔄 Reclasificando: ${agent.name}...`);

          // Clasificar vibe considerando categorías
          const vibeResult = await VibeClassifierService.classifyAgent({
            name: agent.name,
            description: agent.description,
            personality: agent.personality,
            personalityVariant: agent.personalityVariant,
            categories: agent.categories || []
          });

          // Actualizar aiGeneratedFields
          const currentFields = (agent.aiGeneratedFields as any) || {};
          const updatedFields = {
            ...currentFields,
            vibes: {
              primary: vibeResult.primary,
              secondary: vibeResult.secondary,
              confidence: vibeResult.confidence
            },
            staticDescription: currentFields.staticDescription || agent.description || `Chat con ${agent.name}`
          };

          await prisma.agent.update({
            where: { id: agent.id },
            data: { aiGeneratedFields: updatedFields }
          });

          processed++;
          const categoriesStr = agent.categories?.length ? ` [${agent.categories.join(', ')}]` : '';
          console.log(`  ✅ ${agent.name}${categoriesStr} → ${vibeResult.primary} (${(vibeResult.confidence * 100).toFixed(0)}%)`);
        } catch (error) {
          errors++;
          console.error(`  ❌ Error procesando ${agent.name}:`, error);
        }
      })
    );

    // Delay entre batches
    if (i + batchSize < agents.length) {
      console.log('  ⏳ Esperando 2 segundos...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n
═══════════════════════════════════════
   RECLASIFICACIÓN COMPLETADA
═══════════════════════════════════════
✅ Procesados: ${processed}/${agents.length}
${errors > 0 ? `❌ Errores: ${errors}` : ''}
═══════════════════════════════════════\n`);
}

// Ejecutar script
reclassifyAllAgents()
  .then(() => {
    console.log('🎉 Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
