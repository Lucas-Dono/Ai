/**
 * Analiza los píxeles específicos de los ojos en la skin de backup
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// HEAD_FRONT está en (8, 8) con tamaño 8x8
// Los ojos típicamente están en:
// - Fila y=4-6 (relativo al cuadro)
// - Ojo izquierdo: x=1-2
// - Ojo derecho: x=5-6

const EYE_PIXELS = [
  // Fila superior (y=4) - contorno
  { x: 1, y: 4, desc: 'Contorno sup izq' },
  { x: 2, y: 4, desc: 'Contorno sup izq' },
  { x: 5, y: 4, desc: 'Contorno sup der' },
  { x: 6, y: 4, desc: 'Contorno sup der' },

  // Fila media (y=5) - blanco + iris
  { x: 0, y: 5, desc: 'Eyeliner izq' },
  { x: 1, y: 5, desc: 'Blanco izq' },
  { x: 2, y: 5, desc: 'Iris izq' },
  { x: 5, y: 5, desc: 'Iris der' },
  { x: 6, y: 5, desc: 'Blanco der' },
  { x: 7, y: 5, desc: 'Eyeliner der' },

  // Fila inferior (y=6) - blanco + iris
  { x: 0, y: 6, desc: 'Eyeliner izq' },
  { x: 1, y: 6, desc: 'Blanco izq' },
  { x: 2, y: 6, desc: 'Iris izq' },
  { x: 5, y: 6, desc: 'Iris der' },
  { x: 6, y: 6, desc: 'Blanco der' },
  { x: 7, y: 6, desc: 'Eyeliner der' },
];

async function analyzeEyes() {
  const backupPath = path.join(process.cwd(), 'public/minecraft/backup/texture.png');

  console.log('═══════════════════════════════════════════════════════');
  console.log('  ANÁLISIS DE OJOS EN SKIN DE BACKUP');
  console.log('═══════════════════════════════════════════════════════\n');

  const skinBuffer = await fs.readFile(backupPath);
  const { data, info } = await sharp(skinBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`Skin: ${info.width}x${info.height}\n`);
  console.log('Píxeles en región de ojos (HEAD_FRONT offset 8,8):\n');

  // HEAD_FRONT empieza en (8, 8)
  const HEAD_FRONT_X = 8;
  const HEAD_FRONT_Y = 8;

  for (const pixel of EYE_PIXELS) {
    const absX = HEAD_FRONT_X + pixel.x;
    const absY = HEAD_FRONT_Y + pixel.y;
    const idx = (absY * info.width + absX) * 4;

    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];

    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    console.log(`   (${pixel.x}, ${pixel.y}) ${pixel.desc.padEnd(18)} → ${hex} (alpha: ${a})`);
  }

  console.log('\n═══════════════════════════════════════════════════════\n');
}

analyzeEyes().catch(console.error);
