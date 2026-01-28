/**
 * Analiza una skin de backup completa: ojos, piel, vestimenta
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const HEAD_FRONT = { x: 8, y: 8, width: 8, height: 8 };
const BODY_FRONT = { x: 20, y: 20, width: 8, height: 12 };
const ARM_R_FRONT = { x: 44, y: 20, width: 4, height: 12 };
const ARM_L_FRONT = { x: 36, y: 52, width: 4, height: 12 };
const LEG_R_FRONT = { x: 4, y: 20, width: 4, height: 12 };
const LEG_L_FRONT = { x: 20, y: 52, width: 4, height: 12 };

async function analyzeFullSkin() {
  const backupPath = path.join(process.cwd(), 'public/minecraft/backup/texture.png');

  console.log('═══════════════════════════════════════════════════════');
  console.log('  ANÁLISIS COMPLETO DE SKIN DE BACKUP');
  console.log('═══════════════════════════════════════════════════════\n');

  const skinBuffer = await fs.readFile(backupPath);
  const { data, info } = await sharp(skinBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`Skin: ${info.width}x${info.height}\n`);

  // Helper para obtener color
  const getColor = (x: number, y: number) => {
    const idx = (y * info.width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    if (a === 0) return 'TRANSP';
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Mostrar región como grilla
  const showRegion = (name: string, region: { x: number; y: number; width: number; height: number }) => {
    console.log(`\n${name} (${region.width}x${region.height}) en (${region.x}, ${region.y}):\n`);

    // Header
    let header = '     ';
    for (let x = 0; x < region.width; x++) {
      header += `x${x}       `;
    }
    console.log(header);

    for (let y = 0; y < region.height; y++) {
      let row = `y${y.toString().padStart(2, '0')} │`;
      for (let x = 0; x < region.width; x++) {
        const color = getColor(region.x + x, region.y + y);
        row += ` ${color.padEnd(7)} │`;
      }
      console.log(row);
    }
  };

  // Analizar cada región
  showRegion('HEAD_FRONT (Cara)', HEAD_FRONT);
  showRegion('BODY_FRONT (Torso)', BODY_FRONT);
  showRegion('ARM_R_FRONT (Brazo Der)', ARM_R_FRONT);
  showRegion('LEG_R_FRONT (Pierna Der)', LEG_R_FRONT);

  // Resumen de colores principales
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('  RESUMEN DE COLORES');
  console.log('═══════════════════════════════════════════════════════\n');

  // Piel (filas 5-7 de HEAD_FRONT, excluyendo bordes)
  console.log('PIEL (estimada de cara):');
  const skinColors = new Map<string, number>();
  for (let y = 5; y <= 7; y++) {
    for (let x = 1; x <= 6; x++) {
      const color = getColor(HEAD_FRONT.x + x, HEAD_FRONT.y + y);
      if (color !== 'TRANSP') {
        skinColors.set(color, (skinColors.get(color) || 0) + 1);
      }
    }
  }
  Array.from(skinColors.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([c, n]) => console.log(`   ${c}: ${n} px`));

  // Ojos (y=2-4, x=1-2 y x=5-6)
  console.log('\nOJOS (y=2-4):');
  for (let y = 2; y <= 4; y++) {
    const leftEye = [1, 2].map(x => getColor(HEAD_FRONT.x + x, HEAD_FRONT.y + y)).join(', ');
    const rightEye = [5, 6].map(x => getColor(HEAD_FRONT.x + x, HEAD_FRONT.y + y)).join(', ');
    console.log(`   y=${y}: Izq[${leftEye}] Der[${rightEye}]`);
  }

  // Vestimenta (torso)
  console.log('\nVESTIMENTA (torso):');
  const clothingColors = new Map<string, number>();
  for (let y = 0; y < BODY_FRONT.height; y++) {
    for (let x = 0; x < BODY_FRONT.width; x++) {
      const color = getColor(BODY_FRONT.x + x, BODY_FRONT.y + y);
      if (color !== 'TRANSP') {
        clothingColors.set(color, (clothingColors.get(color) || 0) + 1);
      }
    }
  }
  Array.from(clothingColors.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([c, n]) => console.log(`   ${c}: ${n} px`));

  console.log('\n═══════════════════════════════════════════════════════\n');
}

analyzeFullSkin().catch(console.error);
