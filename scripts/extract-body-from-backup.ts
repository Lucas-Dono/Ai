/**
 * Extrae el body completo (piel) del backup incluyendo ambas capas (base + overlay)
 * Cabeza, torso, brazos y piernas
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const SKIN_WIDTH = 64;
const SKIN_HEIGHT = 64;

// Todas las regiones del cuerpo - CAPA BASE
const BODY_BASE_REGIONS = {
  // Cabeza base
  HEAD_TOP: { x: 8, y: 0, width: 8, height: 8 },
  HEAD_BOTTOM: { x: 16, y: 0, width: 8, height: 8 },
  HEAD_FRONT: { x: 8, y: 8, width: 8, height: 8 },
  HEAD_RIGHT: { x: 0, y: 8, width: 8, height: 8 },
  HEAD_LEFT: { x: 16, y: 8, width: 8, height: 8 },
  HEAD_BACK: { x: 24, y: 8, width: 8, height: 8 },

  // Torso base
  BODY_FRONT: { x: 20, y: 20, width: 8, height: 12 },
  BODY_BACK: { x: 32, y: 20, width: 8, height: 12 },
  BODY_RIGHT: { x: 16, y: 20, width: 4, height: 12 },
  BODY_LEFT: { x: 28, y: 20, width: 4, height: 12 },
  BODY_TOP: { x: 20, y: 16, width: 8, height: 4 },
  BODY_BOTTOM: { x: 28, y: 16, width: 8, height: 4 },

  // Brazo derecho base
  ARM_R_FRONT: { x: 44, y: 20, width: 4, height: 12 },
  ARM_R_BACK: { x: 52, y: 20, width: 4, height: 12 },
  ARM_R_RIGHT: { x: 40, y: 20, width: 4, height: 12 },
  ARM_R_LEFT: { x: 48, y: 20, width: 4, height: 12 },
  ARM_R_TOP: { x: 44, y: 16, width: 4, height: 4 },
  ARM_R_BOTTOM: { x: 48, y: 16, width: 4, height: 4 },

  // Brazo izquierdo base
  ARM_L_FRONT: { x: 36, y: 52, width: 4, height: 12 },
  ARM_L_BACK: { x: 44, y: 52, width: 4, height: 12 },
  ARM_L_RIGHT: { x: 32, y: 52, width: 4, height: 12 },
  ARM_L_LEFT: { x: 40, y: 52, width: 4, height: 12 },
  ARM_L_TOP: { x: 36, y: 48, width: 4, height: 4 },
  ARM_L_BOTTOM: { x: 40, y: 48, width: 4, height: 4 },

  // Pierna derecha base
  LEG_R_FRONT: { x: 4, y: 20, width: 4, height: 12 },
  LEG_R_BACK: { x: 12, y: 20, width: 4, height: 12 },
  LEG_R_RIGHT: { x: 0, y: 20, width: 4, height: 12 },
  LEG_R_LEFT: { x: 8, y: 20, width: 4, height: 12 },
  LEG_R_TOP: { x: 4, y: 16, width: 4, height: 4 },
  LEG_R_BOTTOM: { x: 8, y: 16, width: 4, height: 4 },

  // Pierna izquierda base
  LEG_L_FRONT: { x: 20, y: 52, width: 4, height: 12 },
  LEG_L_BACK: { x: 28, y: 52, width: 4, height: 12 },
  LEG_L_RIGHT: { x: 16, y: 52, width: 4, height: 12 },
  LEG_L_LEFT: { x: 24, y: 52, width: 4, height: 12 },
  LEG_L_TOP: { x: 20, y: 48, width: 4, height: 4 },
  LEG_L_BOTTOM: { x: 24, y: 48, width: 4, height: 4 },
};

// Regiones OVERLAY (segunda capa)
const BODY_OVERLAY_REGIONS = {
  // Cabeza overlay (hat layer)
  HAT_TOP: { x: 40, y: 0, width: 8, height: 8 },
  HAT_BOTTOM: { x: 48, y: 0, width: 8, height: 8 },
  HAT_FRONT: { x: 40, y: 8, width: 8, height: 8 },
  HAT_RIGHT: { x: 32, y: 8, width: 8, height: 8 },
  HAT_LEFT: { x: 48, y: 8, width: 8, height: 8 },
  HAT_BACK: { x: 56, y: 8, width: 8, height: 8 },

  // Torso overlay (jacket layer)
  JACKET_FRONT: { x: 20, y: 36, width: 8, height: 12 },
  JACKET_BACK: { x: 32, y: 36, width: 8, height: 12 },
  JACKET_RIGHT: { x: 16, y: 36, width: 4, height: 12 },
  JACKET_LEFT: { x: 28, y: 36, width: 4, height: 12 },
  JACKET_TOP: { x: 20, y: 32, width: 8, height: 4 },
  JACKET_BOTTOM: { x: 28, y: 32, width: 8, height: 4 },

  // Brazo derecho overlay (sleeve)
  SLEEVE_R_FRONT: { x: 44, y: 36, width: 4, height: 12 },
  SLEEVE_R_BACK: { x: 52, y: 36, width: 4, height: 12 },
  SLEEVE_R_RIGHT: { x: 40, y: 36, width: 4, height: 12 },
  SLEEVE_R_LEFT: { x: 48, y: 36, width: 4, height: 12 },
  SLEEVE_R_TOP: { x: 44, y: 32, width: 4, height: 4 },
  SLEEVE_R_BOTTOM: { x: 48, y: 32, width: 4, height: 4 },

  // Brazo izquierdo overlay (sleeve)
  SLEEVE_L_FRONT: { x: 52, y: 52, width: 4, height: 12 },
  SLEEVE_L_BACK: { x: 60, y: 52, width: 4, height: 12 },
  SLEEVE_L_RIGHT: { x: 48, y: 52, width: 4, height: 12 },
  SLEEVE_L_LEFT: { x: 56, y: 52, width: 4, height: 12 },
  SLEEVE_L_TOP: { x: 52, y: 48, width: 4, height: 4 },
  SLEEVE_L_BOTTOM: { x: 56, y: 48, width: 4, height: 4 },

  // Pierna derecha overlay (pants overlay)
  PANTS_R_FRONT: { x: 4, y: 36, width: 4, height: 12 },
  PANTS_R_BACK: { x: 12, y: 36, width: 4, height: 12 },
  PANTS_R_RIGHT: { x: 0, y: 36, width: 4, height: 12 },
  PANTS_R_LEFT: { x: 8, y: 36, width: 4, height: 12 },
  PANTS_R_TOP: { x: 4, y: 32, width: 4, height: 4 },
  PANTS_R_BOTTOM: { x: 8, y: 32, width: 4, height: 4 },

  // Pierna izquierda overlay (pants overlay)
  PANTS_L_FRONT: { x: 4, y: 52, width: 4, height: 12 },
  PANTS_L_BACK: { x: 12, y: 52, width: 4, height: 12 },
  PANTS_L_RIGHT: { x: 0, y: 52, width: 4, height: 12 },
  PANTS_L_LEFT: { x: 8, y: 52, width: 4, height: 12 },
  PANTS_L_TOP: { x: 4, y: 48, width: 4, height: 4 },
  PANTS_L_BOTTOM: { x: 8, y: 48, width: 4, height: 4 },
};

async function extractBody() {
  const backupPath = path.join(process.cwd(), 'public/minecraft/backup/texture.png');
  const outputPath = path.join(process.cwd(), 'public/minecraft/components/body/body_goth_14.png');

  console.log('═══════════════════════════════════════════════════════');
  console.log('  EXTRACTOR DE BODY COMPLETO (BASE + OVERLAY)');
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

  const copyRegion = (regions: Record<string, { x: number; y: number; width: number; height: number }>, layerName: string) => {
    let totalPixels = 0;
    console.log(`\n📦 Capa ${layerName}:`);

    for (const [regionName, region] of Object.entries(regions)) {
      // Saltar regiones fuera de límites (formato legacy 64x32)
      if (region.y + region.height > info.height || region.x + region.width > info.width) {
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

      if (pixelCount > 0) {
        console.log(`   ${regionName.padEnd(18)}: ${pixelCount} px`);
      }
      totalPixels += pixelCount;
    }

    return totalPixels;
  };

  // Extraer capa base
  const basePixels = copyRegion(BODY_BASE_REGIONS, 'BASE');
  console.log(`   Subtotal BASE: ${basePixels} píxeles`);

  // Extraer capa overlay (solo en formato moderno 64x64)
  let overlayPixels = 0;
  if (!isLegacyFormat) {
    overlayPixels = copyRegion(BODY_OVERLAY_REGIONS, 'OVERLAY');
    console.log(`   Subtotal OVERLAY: ${overlayPixels} píxeles`);
  }

  // Para formato legacy: duplicar extremidades derechas a izquierdas
  if (isLegacyFormat) {
    console.log('\n   Duplicando extremidades (formato legacy)...');

    const legacyMirror = [
      // Brazo: derecho -> izquierdo
      { src: { x: 44, y: 20, w: 4, h: 12 }, dst: { x: 36, y: 52 } },
      { src: { x: 52, y: 20, w: 4, h: 12 }, dst: { x: 44, y: 52 } },
      { src: { x: 40, y: 20, w: 4, h: 12 }, dst: { x: 32, y: 52 } },
      { src: { x: 48, y: 20, w: 4, h: 12 }, dst: { x: 40, y: 52 } },
      { src: { x: 44, y: 16, w: 4, h: 4 }, dst: { x: 36, y: 48 } },
      { src: { x: 48, y: 16, w: 4, h: 4 }, dst: { x: 40, y: 48 } },
      // Pierna: derecha -> izquierda
      { src: { x: 4, y: 20, w: 4, h: 12 }, dst: { x: 20, y: 52 } },
      { src: { x: 12, y: 20, w: 4, h: 12 }, dst: { x: 28, y: 52 } },
      { src: { x: 0, y: 20, w: 4, h: 12 }, dst: { x: 16, y: 52 } },
      { src: { x: 8, y: 20, w: 4, h: 12 }, dst: { x: 24, y: 52 } },
      { src: { x: 4, y: 16, w: 4, h: 4 }, dst: { x: 20, y: 48 } },
      { src: { x: 8, y: 16, w: 4, h: 4 }, dst: { x: 24, y: 48 } },
    ];

    let mirroredPixels = 0;
    for (const mapping of legacyMirror) {
      for (let y = 0; y < mapping.src.h; y++) {
        for (let x = 0; x < mapping.src.w; x++) {
          const srcIdx = ((mapping.src.y + y) * SKIN_WIDTH + (mapping.src.x + x)) * 4;
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
  }

  console.log(`\n   TOTAL: ${basePixels + overlayPixels} píxeles\n`);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(outputData, {
    raw: { width: SKIN_WIDTH, height: SKIN_HEIGHT, channels: 4 }
  })
    .png()
    .toFile(outputPath);

  console.log(`💾 Guardado en: ${outputPath}`);
  console.log('\n═══════════════════════════════════════════════════════\n');

  // Análisis de colores de piel
  console.log('🎨 Análisis de colores de piel encontrados:\n');
  const colorMap = new Map<string, number>();

  // Analizar solo regiones de piel (cabeza principalmente)
  for (const region of [BODY_BASE_REGIONS.HEAD_FRONT, BODY_BASE_REGIONS.HEAD_RIGHT, BODY_BASE_REGIONS.ARM_R_FRONT]) {
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
          const colorHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          colorMap.set(colorHex, (colorMap.get(colorHex) || 0) + 1);
        }
      }
    }
  }

  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log('   Top 10 colores de piel:');
  sortedColors.forEach(([color, count], index) => {
    const bar = '█'.repeat(Math.min(20, Math.floor(count / 2)));
    console.log(`   ${(index + 1).toString().padStart(2)}. ${color} ${bar} (${count} px)`);
  });
}

extractBody().catch(console.error);
