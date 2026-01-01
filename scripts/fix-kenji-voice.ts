#!/usr/bin/env tsx

/**
 * SCRIPT OBSOLETO
 * Este script usa el modelo 'World' que fue migrado a 'Group'
 * Mantenerlo solo para referencia histórica
 */

/*
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Corrigiendo voz de Kenji Yamamoto...\n');

  try {
    // 1. Actualizar voice ID de Kenji en la base de datos
    const result = await prisma.agent.updateMany({
      where: {
        name: 'Kenji Yamamoto',
      },
      data: {
        voiceId: 'tomkxGQGz4b1kE0EM722',
      },
    });

    console.log(`✅ Voice ID actualizado para ${result.count} agente(s)\n`);

    // 2. Buscar el mundo Academia Sakura
    const world = await prisma.world.findFirst({
      where: {
        name: { contains: 'Academia Sakura' },
      },
      include: {
        interactions: {
          include: {
            speaker: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!world) {
      console.log('❌ Academia Sakura no encontrada.');
      return;
    }

    // 3. Eliminar audios de Kenji (para regenerarlos con la nueva voz)
    const audioDir = path.join(process.cwd(), 'public', 'worlds', 'academia-sakura', 'audio');

    try {
      const files = await fs.readdir(audioDir);
      let deletedCount = 0;

      // Encontrar el ID de Kenji
      const kenjiAgent = await prisma.agent.findFirst({
        where: { name: 'Kenji Yamamoto' },
        select: { id: true },
      });

      if (!kenjiAgent) {
        console.log('❌ Kenji no encontrado en la base de datos.');
        return;
      }

      console.log(`🔍 ID de Kenji: ${kenjiAgent.id}\n`);
      console.log('🗑️  Eliminando audios antiguos de Kenji...\n');

      for (const file of files) {
        // Los archivos tienen formato: turn-X-{agentId}.mp3
        if (file.endsWith(`.mp3`) && file.includes(kenjiAgent.id)) {
          await fs.unlink(path.join(audioDir, file));
          console.log(`   🗑️  ${file}`);
          deletedCount++;
        }
      }

      console.log(`\n✅ ${deletedCount} archivos de audio eliminados`);
    } catch (error) {
      console.log('📝 Directorio de audios no existe o está vacío');
    }

    // 4. Limpiar metadata de interacciones de Kenji
    const kenjiInteractions = world.interactions.filter(
      (i: any) => i.speaker?.name === 'Kenji Yamamoto'
    );

    for (const interaction of kenjiInteractions) {
      await prisma.worldInteraction.update({
        where: { id: interaction.id },
        data: {
          metadata: {},
        },
      });
    }

    console.log(`✅ ${kenjiInteractions.length} interacciones de Kenji limpiadas\n`);

    console.log('🎉 ¡Corrección completada!');
    console.log('\n📝 Siguiente paso:');
    console.log('   npx tsx scripts/pregenerate-academia-voices.ts');
    console.log('\n💡 La nueva voz de Kenji será menos gruesa y más apropiada para un otaku 😄');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
*/

console.log('❌ Este script está obsoleto. El sistema World fue migrado a Group.');
console.log('💡 Usa los nuevos scripts de gestión de grupos en su lugar.');
