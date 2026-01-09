/**
 * Script: Clasificar Agentes por Vibe
 * Clasifica todos los agentes públicos en vibes usando LLM + fallback
 */

import { prisma } from '../lib/prisma';
import { VibeClassifierService } from '../lib/services/vibe-classifier.service';

async function classifyAllAgents() {
  console.log('🚀 Iniciando clasificación de agentes por vibe...\n');

  // Obtener todos los agentes públicos
  const allAgents = await prisma.agent.findMany({
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

  // Filtrar solo los que no tienen vibe asignado
  const agents = allAgents.filter(agent => {
    const fields = agent.aiGeneratedFields as any;
    return !fields || !fields.vibes || !fields.vibes.primary;
  });

  console.log(`📊 Encontrados ${agents.length} agentes para clasificar\n`);

  if (agents.length === 0) {
    console.log('✅ No hay agentes para clasificar');
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
          console.log(`  🔄 Clasificando: ${agent.name}...`);

          // Clasificar vibe
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
            staticDescription: agent.description || `Chat con ${agent.name}`
          };

          await prisma.agent.update({
            where: { id: agent.id },
            data: { aiGeneratedFields: updatedFields }
          });

          processed++;
          console.log(`  ✅ ${agent.name} → ${vibeResult.primary} (${(vibeResult.confidence * 100).toFixed(0)}%)`);
        } catch (error) {
          errors++;
          console.error(`  ❌ Error procesando ${agent.name}:`, error);
        }
      })
    );

    // Delay entre batches para no saturar LLM
    if (i + batchSize < agents.length) {
      console.log('  ⏳ Esperando 2 segundos...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n
═══════════════════════════════════════
   CLASIFICACIÓN COMPLETADA
═══════════════════════════════════════
✅ Procesados: ${processed}/${agents.length}
${errors > 0 ? `❌ Errores: ${errors}` : ''}
═══════════════════════════════════════\n`);
}

// Ejecutar script
classifyAllAgents()
  .then(() => {
    console.log('🎉 Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
