/**
 * Generación en batch de configuraciones de componentes Minecraft
 *
 * Analiza todos los agentes con referenceImageUrl y genera automáticamente
 * sus configuraciones de componentes modulares.
 */

import { PrismaClient } from '@prisma/client';
import { generateAndSaveComponentConfig } from '@/lib/minecraft/component-config-generator';

const prisma = new PrismaClient();

async function generateConfigsInBatch() {
  console.log('🎮 Generación en Batch de Configuraciones Minecraft');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // 1. Obtener todos los agentes con referenceImageUrl pero sin componentConfig
    const agents = await prisma.agent.findMany({
      where: {
        referenceImageUrl: {
          not: null,
        },
        // Solo agentes que NO tienen componentConfig todavía
        metadata: {
          path: ['minecraft', 'componentConfig'],
          equals: null,
        },
      },
      select: {
        id: true,
        name: true,
        referenceImageUrl: true,
      },
      take: 50, // Procesar máximo 50 a la vez (para no exceder cuotas de Gemini)
    });

    console.log(`📊 Encontrados ${agents.length} agentes para procesar\n`);

    if (agents.length === 0) {
      console.log('✅ No hay agentes pendientes de configurar');
      return;
    }

    // 2. Procesar cada agente
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];

      try {
        console.log(`[${i + 1}/${agents.length}] Procesando: ${agent.name}`);
        console.log(`   Image: ${agent.referenceImageUrl}`);

        await generateAndSaveComponentConfig(agent.id, agent.referenceImageUrl!);

        console.log(`   ✅ Config generada exitosamente\n`);
        successCount++;

        // Pequeño delay para no saturar la API de Gemini
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
        failCount++;
      }
    }

    // 3. Resumen final
    console.log('═══════════════════════════════════════════════════');
    console.log('✨ BATCH COMPLETADO\n');
    console.log(`📊 Resultados:`);
    console.log(`   ✅ Exitosos: ${successCount}`);
    console.log(`   ❌ Fallidos: ${failCount}`);
    console.log(`   📦 Total procesados: ${agents.length}\n`);

    if (successCount > 0) {
      console.log('🎉 Configuraciones generadas y guardadas en metadata.minecraft.componentConfig');
      console.log('   Los agentes ahora pueden usar skins personalizadas en Minecraft\n');
    }

  } catch (error) {
    console.error('❌ Error en batch:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
generateConfigsInBatch()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
