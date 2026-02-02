/**
 * Genera el código TypeScript para generateHead_Base_01() y generateHairShort_02_BobCut()
 * usando los píxeles del backup/texture.png
 */

import sharp from 'sharp';

const REGIONS = {
  // CABEZA (Head)
  HEAD_FRONT: { x: 8, y: 8, width: 8, height: 8 },
  HEAD_RIGHT: { x: 0, y: 8, width: 8, height: 8 },
  HEAD_LEFT: { x: 16, y: 8, width: 8, height: 8 },
  HEAD_TOP: { x: 8, y: 0, width: 8, height: 8 },
  HEAD_BOTTOM: { x: 16, y: 0, width: 8, height: 8 },
  HEAD_BACK: { x: 24, y: 8, width: 8, height: 8 },

  // OVERLAY CABEZA (Hat/Hair)
  HAT_TOP: { x: 40, y: 0, width: 8, height: 8 },
  HAT_FRONT: { x: 40, y: 8, width: 8, height: 8 },
  HAT_RIGHT: { x: 32, y: 8, width: 8, height: 8 },
  HAT_LEFT: { x: 48, y: 8, width: 8, height: 8 },
  HAT_BACK: { x: 56, y: 8, width: 8, height: 8 },
  HAT_BOTTOM: { x: 48, y: 0, width: 8, height: 8 },
};

function generateRectCode(
  imageData: { data: Buffer; info: sharp.OutputInfo },
  region: { x: number; y: number; width: number; height: number },
  colorClass: string
): string {
  const rects: string[] = [];

  for (let y = region.y; y < region.y + region.height; y++) {
    for (let x = region.x; x < region.x + region.width; x++) {
      const idx = (y * 64 + x) * 4;
      const r = imageData.data[idx];
      const g = imageData.data[idx + 1];
      const b = imageData.data[idx + 2];
      const a = imageData.data[idx + 3];

      if (a > 0) {
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        rects.push(`      <rect x="${x}" y="${y}" width="1" height="1" fill="${hex}" class="${colorClass}"/>`);
      }
    }
  }

  return rects.join('\n');
}

async function generateCode() {
  const backup = await sharp('public/minecraft/backup/texture.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`/**
 * Genera sprite de cabeza base - Todas las caras
 * Se recolorea con skinTone
 */
export function generateHead_Base_01(): string {
  return \`
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- HEAD_TOP (8x8) at (8,0) - Cabeza superior -->
${generateRectCode(backup, REGIONS.HEAD_TOP, 'colorizable-skin')}

      <!-- HEAD_BOTTOM (8x8) at (16,0) - Cabeza inferior -->
${generateRectCode(backup, REGIONS.HEAD_BOTTOM, 'colorizable-skin')}

      <!-- HEAD_RIGHT (8x8) at (0,8) - Cabeza derecha -->
${generateRectCode(backup, REGIONS.HEAD_RIGHT, 'colorizable-skin')}

      <!-- HEAD_FRONT (8x8) at (8,8) - Cabeza frontal -->
${generateRectCode(backup, REGIONS.HEAD_FRONT, 'colorizable-skin')}

      <!-- HEAD_LEFT (8x8) at (16,8) - Cabeza izquierda -->
${generateRectCode(backup, REGIONS.HEAD_LEFT, 'colorizable-skin')}

      <!-- HEAD_BACK (8x8) at (24,8) - Cabeza trasera -->
${generateRectCode(backup, REGIONS.HEAD_BACK, 'colorizable-skin')}
    </svg>
  \`;
}
`);

  console.log('\n\n');
  console.log('='.repeat(80));
  console.log('\n\n');

  console.log(`/**
 * Genera sprite de pelo corto - Tipo 2: Bob Cut
 * Estilo: Corte bob clásico a la altura de la mandíbula con línea recta
 * Género: Femenino/Unisex
 * Inspiración: Bob profesional, Anna Wintour, looks corporativos
 */
export function generateHairShort_02_BobCut(): string {
  return \`
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- HAT_TOP (8x8) at (40,0) - Vista superior -->
${generateRectCode(backup, REGIONS.HAT_TOP, 'colorizable-skin')}

      <!-- HAT_BOTTOM (8x8) at (48,0) - Vista inferior -->
${generateRectCode(backup, REGIONS.HAT_BOTTOM, 'colorizable-skin')}

      <!-- HAT_RIGHT (8x8) at (32,8) - Lado derecho -->
${generateRectCode(backup, REGIONS.HAT_RIGHT, 'colorizable-skin')}

      <!-- HAT_FRONT (8x8) at (40,8) - Frente -->
${generateRectCode(backup, REGIONS.HAT_FRONT, 'colorizable-skin')}

      <!-- HAT_LEFT (8x8) at (48,8) - Lado izquierdo -->
${generateRectCode(backup, REGIONS.HAT_LEFT, 'colorizable-skin')}

      <!-- HAT_BACK (8x8) at (56,8) - Parte trasera -->
${generateRectCode(backup, REGIONS.HAT_BACK, 'colorizable-skin')}
    </svg>
  \`;
}
`);
}

generateCode().catch(console.error);
