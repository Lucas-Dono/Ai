/**
 * Script: Agregar Descripciones Estáticas
 * Agrega descripción estática a todos los agentes en aiGeneratedFields
 */

import { prisma } from '../lib/prisma';

async function addStaticDescriptions() {
  console.log('🚀 Iniciando agregación de descripciones estáticas...\n');

  // Obtener todos los agentes
  const allAgents = await prisma.agent.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      aiGeneratedFields: true
    }
  });

  // Filtrar solo los que no tienen descripción estática
  const agents = allAgents.filter(agent => {
    const fields = agent.aiGeneratedFields as any;
    return !fields || !fields.staticDescription;
  });

  console.log(`📊 Encontrados ${agents.length} agentes sin descripción estática\n`);

  if (agents.length === 0) {
    console.log('✅ Todos los agentes ya tienen descripción estática');
    return;
  }

  let processed = 0;
  let errors = 0;

  for (const agent of agents) {
    try {
      // Generar descripción estática
      const staticDescription = agent.description || `Conversa con ${agent.name}`;

      // Actualizar aiGeneratedFields
      const currentFields = (agent.aiGeneratedFields as any) || {};
      const updatedFields = {
        ...currentFields,
        staticDescription
      };

      await prisma.agent.update({
        where: { id: agent.id },
        data: { aiGeneratedFields: updatedFields }
      });

      processed++;
      console.log(`  ✅ ${agent.name}`);
    } catch (error) {
      errors++;
      console.error(`  ❌ Error procesando ${agent.name}:`, error);
    }
  }

  console.log(`\n
═══════════════════════════════════════
   AGREGACIÓN COMPLETADA
═══════════════════════════════════════
✅ Procesados: ${processed}/${agents.length}
${errors > 0 ? `❌ Errores: ${errors}` : ''}
═══════════════════════════════════════\n`);
}

// Ejecutar script
addStaticDescriptions()
  .then(() => {
    console.log('🎉 Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
