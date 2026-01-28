/**
 * Analiza HAT_FRONT del backup
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async function analyzeHatFront() {
  const backupPath = path.join(process.cwd(), 'public/minecraft/backup/texture.png');

  const skinBuffer = await fs.readFile(backupPath);
  const { data, info } = await sharp(skinBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('HAT_FRONT (40, 8) - 8x8:\n');

  const getColor = (x: number, y: number) => {
    const idx = (y * info.width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    if (a === 0) return 'TRANSP ';
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  for (let y = 0; y < 8; y++) {
    let row = `y${y} │`;
    for (let x = 0; x < 8; x++) {
      const color = getColor(40 + x, 8 + y);
      row += ` ${color} │`;
    }
    console.log(row);
  }
}

analyzeHatFront().catch(console.error);
