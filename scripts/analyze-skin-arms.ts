/**
 * Analiza las regiones de brazos en la skin generada
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const ARM_REGIONS = {
  // Brazo derecho
  ARM_R_FRONT: { x: 44, y: 20, width: 4, height: 12 },
  ARM_R_RIGHT: { x: 40, y: 20, width: 4, height: 12 },
  // Brazo izquierdo
  ARM_L_FRONT: { x: 36, y: 52, width: 4, height: 12 },
  ARM_L_RIGHT: { x: 32, y: 52, width: 4, height: 12 },
};

async function analyzeSkinArms() {
  const skinPath = path.join(process.cwd(), 'public/minecraft/hairstyle-showcase/15_messy_bun_casual.png');

  console.log('═══════════════════════════════════════════════════════');
  console.log('  ANÁLISIS DE BRAZOS EN SKIN GENERADA');
  console.log('═══════════════════════════════════════════════════════\n');

  const skinBuffer = await fs.readFile(skinPath);
  const { data, info } = await sharp(skinBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`Skin: ${info.width}x${info.height}\n`);

  const getColor = (x: number, y: number) => {
    const idx = (y * info.width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    if (a === 0) return 'TRANSP ';
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  for (const [name, region] of Object.entries(ARM_REGIONS)) {
    console.log(`\n${name} (${region.x}, ${region.y}):\n`);

    let opaquePixels = 0;
    for (let y = 0; y < Math.min(region.height, 4); y++) {
      let row = `y${y} │`;
      for (let x = 0; x < region.width; x++) {
        const color = getColor(region.x + x, region.y + y);
        row += ` ${color} │`;
        if (color !== 'TRANSP ') opaquePixels++;
      }
      console.log(row);
    }
    console.log(`   ... (${opaquePixels} opacos en primeras 4 filas)`);
  }

  console.log('\n═══════════════════════════════════════════════════════\n');
}

analyzeSkinArms().catch(console.error);
