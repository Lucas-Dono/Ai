/**
 * Analiza las regiones de pelo (HEAD y HAT) del backup
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const HAIR_REGIONS = {
  HEAD_TOP: { x: 8, y: 0, width: 8, height: 8 },
  HEAD_BACK: { x: 24, y: 8, width: 8, height: 8 },
  HEAD_RIGHT: { x: 0, y: 8, width: 8, height: 8 },
  HEAD_LEFT: { x: 16, y: 8, width: 8, height: 8 },
  HAT_TOP: { x: 40, y: 0, width: 8, height: 8 },
  HAT_FRONT: { x: 40, y: 8, width: 8, height: 8 },
  HAT_BACK: { x: 56, y: 8, width: 8, height: 8 },
  HAT_RIGHT: { x: 32, y: 8, width: 8, height: 8 },
  HAT_LEFT: { x: 48, y: 8, width: 8, height: 8 },
};

async function analyzeHairRegions() {
  const backupPath = path.join(process.cwd(), 'public/minecraft/backup/texture.png');

  console.log('═══════════════════════════════════════════════════════');
  console.log('  ANÁLISIS DE REGIONES DE PELO (HEAD + HAT)');
  console.log('═══════════════════════════════════════════════════════\n');

  const skinBuffer = await fs.readFile(backupPath);
  const { data, info } = await sharp(skinBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`Skin: ${info.width}x${info.height}\n`);

  const getColor = (x: number, y: number) => {
    if (x < 0 || x >= info.width || y < 0 || y >= info.height) return 'OUT    ';
    const idx = (y * info.width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    if (a === 0) return 'TRANSP ';
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  for (const [name, region] of Object.entries(HAIR_REGIONS)) {
    console.log(`\n${name} (${region.width}x${region.height}) en (${region.x}, ${region.y}):\n`);

    let nonTransparent = 0;
    for (let y = 0; y < region.height; y++) {
      let row = `y${y} │`;
      for (let x = 0; x < region.width; x++) {
        const color = getColor(region.x + x, region.y + y);
        row += ` ${color} │`;
        if (color !== 'TRANSP ' && color !== 'OUT    ') nonTransparent++;
      }
      console.log(row);
    }
    console.log(`   → ${nonTransparent} píxeles no transparentes`);
  }

  console.log('\n═══════════════════════════════════════════════════════\n');
}

analyzeHairRegions().catch(console.error);
