/**
 * Analiza las regiones de brazos en el outfit extraído
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const ARM_REGIONS = {
  // Brazo derecho (en skin 64x64)
  ARM_R_FRONT: { x: 44, y: 20, width: 4, height: 12 },
  ARM_R_BACK: { x: 52, y: 20, width: 4, height: 12 },
  ARM_R_RIGHT: { x: 40, y: 20, width: 4, height: 12 },
  ARM_R_LEFT: { x: 48, y: 20, width: 4, height: 12 },
  ARM_R_TOP: { x: 44, y: 16, width: 4, height: 4 },
  ARM_R_BOTTOM: { x: 48, y: 16, width: 4, height: 4 },

  // Brazo izquierdo (en skin 64x64)
  ARM_L_FRONT: { x: 36, y: 52, width: 4, height: 12 },
  ARM_L_BACK: { x: 44, y: 52, width: 4, height: 12 },
  ARM_L_RIGHT: { x: 32, y: 52, width: 4, height: 12 },
  ARM_L_LEFT: { x: 40, y: 52, width: 4, height: 12 },
  ARM_L_TOP: { x: 36, y: 48, width: 4, height: 4 },
  ARM_L_BOTTOM: { x: 40, y: 48, width: 4, height: 4 },
};

async function analyzeOutfitArms() {
  const outfitPath = path.join(process.cwd(), 'public/minecraft/components/shirt/outfit_pink_12.png');

  console.log('═══════════════════════════════════════════════════════');
  console.log('  ANÁLISIS DE BRAZOS EN OUTFIT');
  console.log('═══════════════════════════════════════════════════════\n');

  const outfitBuffer = await fs.readFile(outfitPath);
  const { data, info } = await sharp(outfitBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`Outfit: ${info.width}x${info.height}\n`);

  for (const [name, region] of Object.entries(ARM_REGIONS)) {
    let opaquePixels = 0;
    let transparentPixels = 0;

    for (let y = 0; y < region.height; y++) {
      for (let x = 0; x < region.width; x++) {
        const idx = ((region.y + y) * info.width + (region.x + x)) * 4;
        const a = data[idx + 3];
        if (a > 0) opaquePixels++;
        else transparentPixels++;
      }
    }

    const total = region.width * region.height;
    console.log(`${name.padEnd(15)} (${region.x}, ${region.y}): ${opaquePixels}/${total} opacos`);
  }

  console.log('\n═══════════════════════════════════════════════════════\n');
}

analyzeOutfitArms().catch(console.error);
