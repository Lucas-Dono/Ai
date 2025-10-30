#!/usr/bin/env tsx

/**
 * Script para copiar referenceImageUrl a avatar en agentes que no tienen avatar
 *
 * Esto arregla el problema donde los agentes creados por usuarios tienen
 * la imagen en referenceImageUrl pero no en avatar, causando que se muestren
 * las iniciales en lugar de la imagen.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando agentes con referenceImageUrl pero sin avatar...\n');

  try {
    // Encontrar agentes con referenceImageUrl pero sin avatar
    const agentsToFix = await prisma.agent.findMany({
      where: {
        referenceImageUrl: { not: null },
        avatar: null,
      },
      select: {
        id: true,
        name: true,
        referenceImageUrl: true,
        userId: true,
      }
    });

    if (agentsToFix.length === 0) {
      console.log('✅ No hay agentes que necesiten actualización');
      return;
    }

    console.log(`📋 Encontrados ${agentsToFix.length} agentes para actualizar:\n`);

    agentsToFix.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name} (${agent.userId ? 'Usuario' : 'Sistema'})`);
      const imagePreview = agent.referenceImageUrl?.substring(0, 50) + '...';
      console.log(`   referenceImageUrl: ${imagePreview}`);
    });

    console.log('\n🔄 Actualizando agentes...\n');

    let updated = 0;
    for (const agent of agentsToFix) {
      await prisma.agent.update({
        where: { id: agent.id },
        data: { avatar: agent.referenceImageUrl }
      });
      console.log(`✅ ${agent.name} - Avatar actualizado`);
      updated++;
    }

    console.log(`\n🎉 Actualización completada!`);
    console.log(`   Total actualizado: ${updated} agentes`);
    console.log('');
    console.log('Los agentes ahora mostrarán su imagen correctamente en las previews.');

  } catch (error) {
    console.error('\n❌ Error actualizando agentes:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
