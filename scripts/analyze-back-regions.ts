/**
 * Analiza las regiones de espalda del backup
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// Regiones de espalda - base y overlay
const BODY_BACK = { x: 32, y: 20, width: 8, height: 12 };
const BODY_OVERLAY_BACK = { x: 32, y: 36, width: 8, height: 12 };

async function analyzeBack() {
  const backupPath = path.join(process.cwd(), 'public/minecraft/backup/texture.png');

  console.log('═══════════════════════════════════════════════════════');
  console.log('  ANÁLISIS DE ESPALDA (BASE + OVERLAY)');
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

  showRegion('BODY_BACK (Espalda base)', BODY_BACK);
  showRegion('BODY_OVERLAY_BACK (Espalda overlay/pelo)', BODY_OVERLAY_BACK);

  console.log('\n═══════════════════════════════════════════════════════\n');
}

analyzeBack().catch(console.error);
