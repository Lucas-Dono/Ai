/**
 * Script para extraer los ojos de la skin de backup
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const SKIN_WIDTH = 64;
const SKIN_HEIGHT = 64;

// Región HEAD_FRONT donde están los ojos (8x8 píxeles)
const HEAD_FRONT = { x: 8, y: 8, width: 8, height: 8 };

async function extractEyes() {
  const backupPath = path.join(process.cwd(), 'public/minecraft/backup/texture.png');
  const outputPath = path.join(process.cwd(), 'public/minecraft/components/eyes/eyes_goth_14.png');

  console.log('═══════════════════════════════════════════════════════');
  console.log('  EXTRACTOR DE OJOS DE SKIN DE BACKUP');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log(`📂 Leyendo skin de backup: ${backupPath}`);

  const skinBuffer = await fs.readFile(backupPath);
  const { data: skinData, info } = await sharp(skinBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`✓ Skin leída: ${info.width}x${info.height}`);

  // Crear canvas transparente de 8x8 para los ojos
  const outputData = Buffer.alloc(HEAD_FRONT.width * HEAD_FRONT.height * 4, 0);

  console.log('\n🎨 Extrayendo región HEAD_FRONT (ojos):\n');

  const colorMap = new Map<string, number>();
  let pixelCount = 0;

  for (let y = 0; y < HEAD_FRONT.height; y++) {
    for (let x = 0; x < HEAD_FRONT.width; x++) {
      const srcX = HEAD_FRONT.x + x;
      const srcY = HEAD_FRONT.y + y;
      const srcIdx = (srcY * info.width + srcX) * 4;

      const r = skinData[srcIdx];
      const g = skinData[srcIdx + 1];
      const b = skinData[srcIdx + 2];
      const a = skinData[srcIdx + 3];

      // Copiar al canvas de 8x8
      const dstIdx = (y * HEAD_FRONT.width + x) * 4;
      outputData[dstIdx] = r;
      outputData[dstIdx + 1] = g;
      outputData[dstIdx + 2] = b;
      outputData[dstIdx + 3] = a;

      if (a > 0) {
        pixelCount++;
        const colorHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        colorMap.set(colorHex, (colorMap.get(colorHex) || 0) + 1);
      }
    }
  }

  console.log(`   ✓ ${pixelCount} píxeles extraídos`);

  // Guardar componente
  console.log(`\n💾 Guardando componente en: ${outputPath}`);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(outputData, {
    raw: {
      width: HEAD_FRONT.width,
      height: HEAD_FRONT.height,
      channels: 4,
    },
  })
    .png()
    .toFile(outputPath);

  console.log('✓ Componente guardado exitosamente\n');

  // Análisis de colores
  console.log('🎨 Colores encontrados en los ojos:\n');
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  sortedColors.forEach(([color, count], index) => {
    const bar = '█'.repeat(Math.max(1, Math.floor(count / 2)));
    console.log(`   ${(index + 1).toString().padStart(2)}. ${color} ${bar} (${count} px)`);
  });

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  ✨ EXTRACCIÓN COMPLETADA');
  console.log('═══════════════════════════════════════════════════════\n');
}

extractEyes().catch(console.error);
