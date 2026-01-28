/**
 * Analiza la cara del backup (HEAD_FRONT)
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const HEAD_FRONT = { x: 8, y: 8, width: 8, height: 8 };

async function analyzeFace() {
  const backupPath = path.join(process.cwd(), 'public/minecraft/backup/texture.png');

  console.log('═══════════════════════════════════════════════════════');
  console.log('  ANÁLISIS DE CARA (HEAD_FRONT)');
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

  console.log(`HEAD_FRONT (${HEAD_FRONT.width}x${HEAD_FRONT.height}) en (${HEAD_FRONT.x}, ${HEAD_FRONT.y}):\n`);

  for (let y = 0; y < HEAD_FRONT.height; y++) {
    let row = `y${y} │`;
    for (let x = 0; x < HEAD_FRONT.width; x++) {
      const color = getColor(HEAD_FRONT.x + x, HEAD_FRONT.y + y);
      row += ` ${color} │`;
    }
    console.log(row);
  }

  console.log('\n═══════════════════════════════════════════════════════\n');
}

analyzeFace().catch(console.error);
