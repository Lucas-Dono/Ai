/**
 * Extrae pelo de una skin excluyendo completamente HEAD_FRONT
 * Para skins donde la cara frontal es toda piel (sin pelo en la frente)
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const SKIN_WIDTH = 64;
const SKIN_HEIGHT = 64;

// Regiones de pelo SIN HEAD_FRONT (para caras sin pelo frontal)
const HAIR_REGIONS_NO_FACE = {
  // HEAD layer (capa base) - SIN FRONT
  HEAD_RIGHT: { x: 0, y: 8, width: 8, height: 8 },
  HEAD_LEFT: { x: 16, y: 8, width: 8, height: 8 },
  HEAD_TOP: { x: 8, y: 0, width: 8, height: 8 },
  HEAD_BOTTOM: { x: 16, y: 0, width: 8, height: 8 },
  HEAD_BACK: { x: 24, y: 8, width: 8, height: 8 },

  // HAT layer (overlay)
  HAT_TOP: { x: 40, y: 0, width: 8, height: 8 },
  HAT_FRONT: { x: 40, y: 8, width: 8, height: 8 },
  HAT_RIGHT: { x: 32, y: 8, width: 8, height: 8 },
  HAT_LEFT: { x: 48, y: 8, width: 8, height: 8 },
  HAT_BACK: { x: 56, y: 8, width: 8, height: 8 },
  HAT_BOTTOM: { x: 48, y: 0, width: 8, height: 8 },
};

async function extractHairNoFace() {
  const backupPath = path.join(process.cwd(), 'public/minecraft/backup/texture.png');
  const outputPath = path.join(process.cwd(), 'public/minecraft/components/hair_front/hair_messy_bun_12.png');

  console.log('═══════════════════════════════════════════════════════');
  console.log('  EXTRACTOR DE PELO (SIN CARA FRONTAL)');
  console.log('═══════════════════════════════════════════════════════\n');

  const skinBuffer = await fs.readFile(backupPath);
  const { data: skinData, info } = await sharp(skinBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`✓ Skin leída: ${info.width}x${info.height}`);

  const workingData = skinData;
  const workingWidth = info.width;
  const workingHeight = info.height;

  const outputData = Buffer.alloc(SKIN_WIDTH * SKIN_HEIGHT * 4, 0);

  console.log('\n🎨 Extrayendo regiones de pelo (SIN HEAD_FRONT):\n');

  let totalPixels = 0;

  for (const [regionName, region] of Object.entries(HAIR_REGIONS_NO_FACE)) {
    if (region.y + region.height > workingHeight || region.x + region.width > workingWidth) {
      console.log(`   ${regionName.padEnd(12)} (${region.x}, ${region.y}): SALTADO (fuera de límites)`);
      continue;
    }

    let pixelCount = 0;

    for (let y = 0; y < region.height; y++) {
      for (let x = 0; x < region.width; x++) {
        const srcX = region.x + x;
        const srcY = region.y + y;
        const srcIdx = (srcY * workingWidth + srcX) * 4;

        const r = skinData[srcIdx];
        const g = skinData[srcIdx + 1];
        const b = skinData[srcIdx + 2];
        const a = skinData[srcIdx + 3];

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

    console.log(`   ${regionName.padEnd(12)} (${region.x}, ${region.y}): ${pixelCount} píxeles`);
    totalPixels += pixelCount;
  }

  console.log(`\n   Total: ${totalPixels} píxeles de pelo\n`);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(outputData, {
    raw: { width: SKIN_WIDTH, height: SKIN_HEIGHT, channels: 4 }
  })
    .png()
    .toFile(outputPath);

  console.log(`💾 Guardado en: ${outputPath}`);
  console.log('\n═══════════════════════════════════════════════════════\n');
}

extractHairNoFace().catch(console.error);
