/**
 * Extrae el outfit (torso, brazos, piernas) del backup
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const SKIN_WIDTH = 64;
const SKIN_HEIGHT = 64;

// Regiones del cuerpo base (ropa)
const BODY_REGIONS = {
  // Torso
  BODY_FRONT: { x: 20, y: 20, width: 8, height: 12 },
  BODY_BACK: { x: 32, y: 20, width: 8, height: 12 },
  BODY_RIGHT: { x: 16, y: 20, width: 4, height: 12 },
  BODY_LEFT: { x: 28, y: 20, width: 4, height: 12 },
  BODY_TOP: { x: 20, y: 16, width: 8, height: 4 },
  BODY_BOTTOM: { x: 28, y: 16, width: 8, height: 4 },

  // Brazo derecho
  ARM_R_FRONT: { x: 44, y: 20, width: 4, height: 12 },
  ARM_R_BACK: { x: 52, y: 20, width: 4, height: 12 },
  ARM_R_RIGHT: { x: 40, y: 20, width: 4, height: 12 },
  ARM_R_LEFT: { x: 48, y: 20, width: 4, height: 12 },
  ARM_R_TOP: { x: 44, y: 16, width: 4, height: 4 },
  ARM_R_BOTTOM: { x: 48, y: 16, width: 4, height: 4 },

  // Brazo izquierdo
  ARM_L_FRONT: { x: 36, y: 52, width: 4, height: 12 },
  ARM_L_BACK: { x: 44, y: 52, width: 4, height: 12 },
  ARM_L_RIGHT: { x: 32, y: 52, width: 4, height: 12 },
  ARM_L_LEFT: { x: 40, y: 52, width: 4, height: 12 },
  ARM_L_TOP: { x: 36, y: 48, width: 4, height: 4 },
  ARM_L_BOTTOM: { x: 40, y: 48, width: 4, height: 4 },

  // Pierna derecha
  LEG_R_FRONT: { x: 4, y: 20, width: 4, height: 12 },
  LEG_R_BACK: { x: 12, y: 20, width: 4, height: 12 },
  LEG_R_RIGHT: { x: 0, y: 20, width: 4, height: 12 },
  LEG_R_LEFT: { x: 8, y: 20, width: 4, height: 12 },
  LEG_R_TOP: { x: 4, y: 16, width: 4, height: 4 },
  LEG_R_BOTTOM: { x: 8, y: 16, width: 4, height: 4 },

  // Pierna izquierda
  LEG_L_FRONT: { x: 20, y: 52, width: 4, height: 12 },
  LEG_L_BACK: { x: 28, y: 52, width: 4, height: 12 },
  LEG_L_RIGHT: { x: 16, y: 52, width: 4, height: 12 },
  LEG_L_LEFT: { x: 24, y: 52, width: 4, height: 12 },
  LEG_L_TOP: { x: 20, y: 48, width: 4, height: 4 },
  LEG_L_BOTTOM: { x: 24, y: 48, width: 4, height: 4 },
};

async function extractOutfit() {
  const backupPath = path.join(process.cwd(), 'public/minecraft/backup/texture.png');
  const outputPath = path.join(process.cwd(), 'public/minecraft/components/outfits/outfit_goth_14.png');

  console.log('═══════════════════════════════════════════════════════');
  console.log('  EXTRACTOR DE OUTFIT COMPLETO');
  console.log('═══════════════════════════════════════════════════════\n');

  const skinBuffer = await fs.readFile(backupPath);
  const { data, info } = await sharp(skinBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const isLegacyFormat = info.height === 32 && info.width === 64;
  console.log(`✓ Skin leída: ${info.width}x${info.height} (${isLegacyFormat ? 'legacy' : 'standard'})\n`);

  // Canvas 64x64 transparente
  const outputData = Buffer.alloc(SKIN_WIDTH * SKIN_HEIGHT * 4, 0);

  let totalPixels = 0;

  for (const [regionName, region] of Object.entries(BODY_REGIONS)) {
    // Saltar regiones fuera de límites (formato legacy 64x32)
    if (region.y + region.height > info.height || region.x + region.width > info.width) {
      console.log(`   ${regionName.padEnd(15)} (${region.x}, ${region.y}): SALTADO (fuera de límites)`);
      continue;
    }

    let pixelCount = 0;

    for (let y = 0; y < region.height; y++) {
      for (let x = 0; x < region.width; x++) {
        const srcX = region.x + x;
        const srcY = region.y + y;
        const srcIdx = (srcY * info.width + srcX) * 4;

        const r = data[srcIdx];
        const g = data[srcIdx + 1];
        const b = data[srcIdx + 2];
        const a = data[srcIdx + 3];

        if (a > 0) {
          const dstIdx = (srcY * SKIN_WIDTH + srcX) * 4;
          outputData[dstIdx] = r;
          outputData[dstIdx + 1] = g;
          outputData[dstIdx + 2] = b;
          outputData[dstIdx + 3] = a;
          pixelCount++;
        }
      }
    }

    console.log(`   ${regionName.padEnd(15)} (${region.x}, ${region.y}): ${pixelCount} píxeles`);
    totalPixels += pixelCount;
  }

  // Para formato legacy 64x32: copiar brazo/pierna derecha a posiciones izquierdas
  if (isLegacyFormat) {
    console.log('\n   Duplicando extremidades derechas a izquierdas (formato legacy)...');

    // Mapeo: región derecha -> región izquierda destino
    const legacyMirror = [
      // Brazo: derecho -> izquierdo
      { src: { x: 44, y: 20, w: 4, h: 12 }, dst: { x: 36, y: 52 } }, // ARM_R_FRONT -> ARM_L_FRONT
      { src: { x: 52, y: 20, w: 4, h: 12 }, dst: { x: 44, y: 52 } }, // ARM_R_BACK -> ARM_L_BACK
      { src: { x: 40, y: 20, w: 4, h: 12 }, dst: { x: 32, y: 52 } }, // ARM_R_RIGHT -> ARM_L_RIGHT
      { src: { x: 48, y: 20, w: 4, h: 12 }, dst: { x: 40, y: 52 } }, // ARM_R_LEFT -> ARM_L_LEFT
      { src: { x: 44, y: 16, w: 4, h: 4 }, dst: { x: 36, y: 48 } },  // ARM_R_TOP -> ARM_L_TOP
      { src: { x: 48, y: 16, w: 4, h: 4 }, dst: { x: 40, y: 48 } },  // ARM_R_BOTTOM -> ARM_L_BOTTOM
      // Pierna: derecha -> izquierda
      { src: { x: 4, y: 20, w: 4, h: 12 }, dst: { x: 20, y: 52 } },  // LEG_R_FRONT -> LEG_L_FRONT
      { src: { x: 12, y: 20, w: 4, h: 12 }, dst: { x: 28, y: 52 } }, // LEG_R_BACK -> LEG_L_BACK
      { src: { x: 0, y: 20, w: 4, h: 12 }, dst: { x: 16, y: 52 } },  // LEG_R_RIGHT -> LEG_L_RIGHT
      { src: { x: 8, y: 20, w: 4, h: 12 }, dst: { x: 24, y: 52 } },  // LEG_R_LEFT -> LEG_L_LEFT
      { src: { x: 4, y: 16, w: 4, h: 4 }, dst: { x: 20, y: 48 } },   // LEG_R_TOP -> LEG_L_TOP
      { src: { x: 8, y: 16, w: 4, h: 4 }, dst: { x: 24, y: 48 } },   // LEG_R_BOTTOM -> LEG_L_BOTTOM
    ];

    let mirroredPixels = 0;
    for (const mapping of legacyMirror) {
      for (let y = 0; y < mapping.src.h; y++) {
        for (let x = 0; x < mapping.src.w; x++) {
          // Leer del output (ya tiene los píxeles del lado derecho)
          const srcIdx = ((mapping.src.y + y) * SKIN_WIDTH + (mapping.src.x + x)) * 4;
          // Espejo horizontal: invertir X en el destino
          const mirroredX = mapping.src.w - 1 - x;
          const dstIdx = ((mapping.dst.y + y) * SKIN_WIDTH + (mapping.dst.x + mirroredX)) * 4;

          if (outputData[srcIdx + 3] > 0) {
            outputData[dstIdx] = outputData[srcIdx];
            outputData[dstIdx + 1] = outputData[srcIdx + 1];
            outputData[dstIdx + 2] = outputData[srcIdx + 2];
            outputData[dstIdx + 3] = outputData[srcIdx + 3];
            mirroredPixels++;
          }
        }
      }
    }
    console.log(`   ✓ ${mirroredPixels} píxeles duplicados`);
    totalPixels += mirroredPixels;
  }

  console.log(`\n   Total: ${totalPixels} píxeles de outfit\n`);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(outputData, {
    raw: { width: SKIN_WIDTH, height: SKIN_HEIGHT, channels: 4 }
  })
    .png()
    .toFile(outputPath);

  console.log(`💾 Guardado en: ${outputPath}`);
  console.log('\n═══════════════════════════════════════════════════════\n');
}

extractOutfit().catch(console.error);
