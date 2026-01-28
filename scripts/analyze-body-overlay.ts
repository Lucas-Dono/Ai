/**
 * Analiza las regiones de overlay del body para ver el pelo largo
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// Overlay regions (segunda capa)
const BODY_OVERLAY_FRONT = { x: 20, y: 36, width: 8, height: 12 };
const BODY_OVERLAY_BACK = { x: 32, y: 36, width: 8, height: 12 };
const ARM_R_OVERLAY_FRONT = { x: 44, y: 36, width: 4, height: 12 };
const ARM_L_OVERLAY_FRONT = { x: 52, y: 52, width: 4, height: 12 };

async function analyzeBodyOverlay() {
  const backupPath = path.join(process.cwd(), 'public/minecraft/backup/texture.png');

  console.log('═══════════════════════════════════════════════════════');
  console.log('  ANÁLISIS DE OVERLAY DEL BODY (PELO LARGO)');
  console.log('═══════════════════════════════════════════════════════\n');

  const skinBuffer = await fs.readFile(backupPath);
  const { data, info } = await sharp(skinBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const getColor = (x: number, y: number) => {
    const idx = (y * info.width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    if (a === 0) return 'TRANSP ';
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const showRegion = (name: string, region: { x: number; y: number; width: number; height: number }) => {
    console.log(`\n${name} (${region.width}x${region.height}) en (${region.x}, ${region.y}):\n`);

    let nonTransparent = 0;
    for (let y = 0; y < region.height; y++) {
      let row = `y${y.toString().padStart(2, '0')} │`;
      for (let x = 0; x < region.width; x++) {
        const color = getColor(region.x + x, region.y + y);
        row += ` ${color} │`;
        if (color !== 'TRANSP ') nonTransparent++;
      }
      console.log(row);
    }
    console.log(`   → ${nonTransparent} píxeles no transparentes`);
  };

  showRegion('BODY_OVERLAY_FRONT (Pelo en torso frente)', BODY_OVERLAY_FRONT);
  showRegion('BODY_OVERLAY_BACK (Pelo en torso espalda)', BODY_OVERLAY_BACK);
  showRegion('ARM_R_OVERLAY_FRONT (Pelo en brazo der)', ARM_R_OVERLAY_FRONT);
  showRegion('ARM_L_OVERLAY_FRONT (Pelo en brazo izq)', ARM_L_OVERLAY_FRONT);

  console.log('\n═══════════════════════════════════════════════════════\n');
}

analyzeBodyOverlay().catch(console.error);
