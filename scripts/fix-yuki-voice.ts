#!/usr/bin/env tsx

/**
 * Script para corregir la voz de Yuki Tanaka
 * (Resultó que era mujer, no hombre 😅)
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

const CORRECT_VOICE_ID = 'iFhPOZcajR7W3sDL39qJ'; // Voz femenina correcta

async function main() {
  console.log('🔧 Corrigiendo voz de Yuki Tanaka...\n');

  try {
    // 1. Actualizar voice ID en la base de datos
    const agent = await prisma.agent.findFirst({
      where: { name: 'Yuki Tanaka' },
    });

    if (!agent) {
      console.log('❌ Yuki Tanaka no encontrada.');
      return;
    }

    await prisma.agent.update({
      where: { id: agent.id },
      data: { voiceId: CORRECT_VOICE_ID },
    });

    console.log(`✅ Voice ID actualizado: ${CORRECT_VOICE_ID}`);
    console.log(`   Agente ID: ${agent.id}\n`);

    // 2. Eliminar audios pre-generados de Yuki (para re-generar con voz correcta)
    const audioDir = path.join(process.cwd(), 'public', 'worlds', 'academia-sakura', 'audio');

    try {
      const files = await fs.readdir(audioDir);
      let deletedCount = 0;

      for (const file of files) {
        // Buscar archivos que contengan el ID del agente de Yuki
        if (file.includes(agent.id)) {
          await fs.unlink(path.join(audioDir, file));
          console.log(`🗑️  Eliminado: ${file}`);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        console.log(`\n✅ ${deletedCount} audios eliminados`);
      } else {
        console.log('\n📝 No había audios pre-generados de Yuki');
      }
    } catch (error) {
      console.log('📝 Directorio de audios no existe (no hay nada que eliminar)');
    }

    // 3. Limpiar metadata de interacciones
    const interactions = await prisma.worldInteraction.findMany({
      where: {
        speakerId: agent.id,
      },
    });

    for (const interaction of interactions) {
      const metadata = interaction.metadata as any;
      if (metadata?.audioUrl) {
        await prisma.worldInteraction.update({
          where: { id: interaction.id },
          data: {
            metadata: {
              ...metadata,
              audioUrl: null,
              voiceGenerated: false,
            },
          },
        });
      }
    }

    console.log(`✅ ${interactions.length} interacciones limpiadas\n`);

    console.log('🎉 ¡Corrección completada!');
    console.log('💡 Ahora ejecuta el script de pre-generación para crear los audios con la voz correcta:');
    console.log('   npx tsx scripts/pregenerate-academia-voices.ts');

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
