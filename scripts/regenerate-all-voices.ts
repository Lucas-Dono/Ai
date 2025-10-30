#!/usr/bin/env tsx

/**
 * Script para limpiar y re-generar TODOS los audios con la configuración mejorada
 *
 * Ejecutar con: npx tsx scripts/regenerate-all-voices.ts
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpiando audios existentes de Academia Sakura...\n');

  try {
    // 1. Buscar el mundo
    const world = await prisma.world.findFirst({
      where: {
        name: { contains: 'Academia Sakura' },
      },
    });

    if (!world) {
      console.log('❌ Academia Sakura no encontrada.');
      return;
    }

    // 2. Eliminar todos los archivos de audio
    const audioDir = path.join(process.cwd(), 'public', 'worlds', 'academia-sakura', 'audio');

    try {
      const files = await fs.readdir(audioDir);
      console.log(`📁 Archivos encontrados: ${files.length}\n`);

      for (const file of files) {
        if (file.endsWith('.mp3')) {
          await fs.unlink(path.join(audioDir, file));
          console.log(`🗑️  ${file}`);
        }
      }

      console.log(`\n✅ ${files.length} archivos eliminados`);
    } catch (error) {
      console.log('📝 Directorio de audios no existe o está vacío');
    }

    // 3. Limpiar metadata de todas las interacciones
    const result = await prisma.worldInteraction.updateMany({
      where: {
        world: {
          name: { contains: 'Academia Sakura' },
        },
      },
      data: {
        metadata: {},
      },
    });

    console.log(`✅ ${result.count} interacciones limpiadas\n`);

    console.log('🎉 ¡Limpieza completada!');
    console.log('\n📝 Ahora ejecuta el script de pre-generación:');
    console.log('   npx tsx scripts/pregenerate-academia-voices.ts\n');
    console.log('💡 Los nuevos audios tendrán:');
    console.log('   ✅ Texto limpio (sin *suspiro*, jejeje, etc.)');
    console.log('   ✅ Velocidad mejorada (15-25% más rápido)');
    console.log('   ✅ Configuración optimizada por personaje');
    console.log('   ✅ Sonido más natural y expresivo');

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
