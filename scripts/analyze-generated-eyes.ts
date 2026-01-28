/**
 * Analiza los píxeles de los ojos en la skin generada
 * para verificar que se renderizaron correctamente
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// HEAD_FRONT está en (8, 8) en la skin 64x64
const HEAD_FRONT_X = 8;
const HEAD_FRONT_Y = 8;

// Región completa de HEAD_FRONT (8x8)
async function analyzeGeneratedSkin() {
  const skinPath = path.join(process.cwd(), 'public/minecraft/hairstyle-showcase/06_shag_bohemian.png');

  console.log('═══════════════════════════════════════════════════════');
  console.log('  ANÁLISIS DE OJOS EN SKIN GENERADA');
  console.log('═══════════════════════════════════════════════════════\n');

  const skinBuffer = await fs.readFile(skinPath);
  const { data, info } = await sharp(skinBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`Skin: ${info.width}x${info.height}\n`);

  // Mostrar toda la región HEAD_FRONT como una grilla visual
  console.log('HEAD_FRONT (8x8) - Coordenadas absolutas (8,8) a (15,15):\n');
  console.log('   x:  0        1        2        3        4        5        6        7');
  console.log('  ┌────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┐');

  for (let y = 0; y < 8; y++) {
    let row = `y${y} │`;
    for (let x = 0; x < 8; x++) {
      const absX = HEAD_FRONT_X + x;
      const absY = HEAD_FRONT_Y + y;
      const idx = (absY * info.width + absX) * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a === 0) {
        row += ' TRANSP │';
      } else {
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        row += ` ${hex} │`;
      }
    }
    console.log(row);
    if (y < 7) {
      console.log('  ├────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤');
    }
  }
  console.log('  └────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┘');

  // Resumen de colores únicos en la región de ojos (y=4,5,6)
  console.log('\n\nColores en región de ojos (filas y=4,5,6):\n');

  const eyeColors = new Map<string, { count: number; positions: string[] }>();

  for (let y = 4; y <= 6; y++) {
    for (let x = 0; x < 8; x++) {
      const absX = HEAD_FRONT_X + x;
      const absY = HEAD_FRONT_Y + y;
      const idx = (absY * info.width + absX) * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      const hex = a === 0 ? 'TRANSP' : `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

      if (!eyeColors.has(hex)) {
        eyeColors.set(hex, { count: 0, positions: [] });
      }
      const entry = eyeColors.get(hex)!;
      entry.count++;
      entry.positions.push(`(${x},${y})`);
    }
  }

  const sortedColors = Array.from(eyeColors.entries()).sort((a, b) => b[1].count - a[1].count);

  for (const [color, info] of sortedColors) {
    console.log(`   ${color}: ${info.count} px → ${info.positions.join(', ')}`);
  }

  // Comparar con lo esperado de eyes_female_01
  console.log('\n\nColores ESPERADOS de eyes_female_01:');
  console.log('   #3f2e27 (eyeliner marrón)  → y=4: x=1,2,5,6 | y=5,6: x=0,7');
  console.log('   #e2d6cf (blanco grisáceo)  → y=5: x=1,6');
  console.log('   #fcf7f2 (blanco puro)      → y=6: x=1,6');
  console.log('   #395cc6 (iris azul)        → y=5,6: x=2,5');

  console.log('\n═══════════════════════════════════════════════════════\n');
}

analyzeGeneratedSkin().catch(console.error);
