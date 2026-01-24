/**
 * Script para hacer ingeniería inversa de una skin PNG a código SVG
 * Extrae píxeles y los agrupa por regiones UV de Minecraft
 */

import sharp from 'sharp';
import path from 'path';

interface Pixel {
  x: number;
  y: number;
  color: string;
  alpha: number;
}

interface Region {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  description: string;
}

// Definición de regiones UV de Minecraft
const REGIONS: Region[] = [
  // HEAD (HAT layer)
  { name: 'HAT_TOP', x: 40, y: 0, width: 8, height: 8, description: 'Vista superior' },
  { name: 'HAT_BOTTOM', x: 48, y: 0, width: 8, height: 8, description: 'Vista inferior' },
  { name: 'HAT_RIGHT', x: 32, y: 8, width: 8, height: 8, description: 'Lado derecho' },
  { name: 'HAT_FRONT', x: 40, y: 8, width: 8, height: 8, description: 'Cara frontal' },
  { name: 'HAT_LEFT', x: 48, y: 8, width: 8, height: 8, description: 'Lado izquierdo' },
  { name: 'HAT_BACK', x: 56, y: 8, width: 8, height: 8, description: 'Parte trasera' },

  // BODY
  { name: 'BODY_FRONT', x: 20, y: 20, width: 8, height: 12, description: 'Torso frontal' },
  { name: 'BODY_BACK', x: 32, y: 20, width: 4, height: 12, description: 'Torso trasero' },
  { name: 'BODY_RIGHT', x: 16, y: 20, width: 4, height: 12, description: 'Torso derecho' },
  { name: 'BODY_LEFT', x: 28, y: 20, width: 4, height: 12, description: 'Torso izquierdo' },

  // HEAD BASE
  { name: 'HEAD_TOP', x: 8, y: 0, width: 8, height: 8, description: 'Cabeza superior' },
  { name: 'HEAD_BOTTOM', x: 16, y: 0, width: 8, height: 8, description: 'Cabeza inferior' },
  { name: 'HEAD_RIGHT', x: 0, y: 8, width: 8, height: 8, description: 'Cabeza derecha' },
  { name: 'HEAD_FRONT', x: 8, y: 8, width: 8, height: 8, description: 'Cabeza frontal' },
  { name: 'HEAD_LEFT', x: 16, y: 8, width: 8, height: 8, description: 'Cabeza izquierda' },
  { name: 'HEAD_BACK', x: 24, y: 8, width: 8, height: 8, description: 'Cabeza trasera' },

  // BRAZO DERECHO (Right Arm)
  { name: 'ARM_R_FRONT', x: 44, y: 20, width: 4, height: 12, description: 'Brazo derecho frontal' },
  { name: 'ARM_R_BACK', x: 52, y: 20, width: 4, height: 12, description: 'Brazo derecho trasero' },
  { name: 'ARM_R_RIGHT', x: 40, y: 20, width: 4, height: 12, description: 'Brazo derecho lado derecho' },
  { name: 'ARM_R_LEFT', x: 48, y: 20, width: 4, height: 12, description: 'Brazo derecho lado izquierdo' },

  // BRAZO IZQUIERDO (Left Arm)
  { name: 'ARM_L_FRONT', x: 36, y: 52, width: 4, height: 12, description: 'Brazo izquierdo frontal' },
  { name: 'ARM_L_BACK', x: 44, y: 52, width: 4, height: 12, description: 'Brazo izquierdo trasero' },
  { name: 'ARM_L_RIGHT', x: 32, y: 52, width: 4, height: 12, description: 'Brazo izquierdo lado derecho' },
  { name: 'ARM_L_LEFT', x: 40, y: 52, width: 4, height: 12, description: 'Brazo izquierdo lado izquierdo' },

  // PIERNA DERECHA (Right Leg)
  { name: 'LEG_R_FRONT', x: 4, y: 20, width: 4, height: 12, description: 'Pierna derecha frontal' },
  { name: 'LEG_R_BACK', x: 12, y: 20, width: 4, height: 12, description: 'Pierna derecha trasera' },
  { name: 'LEG_R_RIGHT', x: 0, y: 20, width: 4, height: 12, description: 'Pierna derecha lado derecho' },
  { name: 'LEG_R_LEFT', x: 8, y: 20, width: 4, height: 12, description: 'Pierna derecha lado izquierdo' },

  // PIERNA IZQUIERDA (Left Leg)
  { name: 'LEG_L_FRONT', x: 20, y: 52, width: 4, height: 12, description: 'Pierna izquierda frontal' },
  { name: 'LEG_L_BACK', x: 28, y: 52, width: 4, height: 12, description: 'Pierna izquierda trasera' },
  { name: 'LEG_L_RIGHT', x: 16, y: 52, width: 4, height: 12, description: 'Pierna izquierda lado derecho' },
  { name: 'LEG_L_LEFT', x: 24, y: 52, width: 4, height: 12, description: 'Pierna izquierda lado izquierdo' },
];

/**
 * Convierte RGBA a color hex
 */
function rgbaToHex(r: number, g: number, b: number, a: number): string {
  if (a < 128) return 'transparent';
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Extrae todos los píxeles de una imagen
 */
async function extractPixels(imagePath: string): Promise<Pixel[]> {
  const image = sharp(imagePath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  const pixels: Pixel[] = [];

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = info.channels === 4 ? data[idx + 3] : 255;

      if (a > 0) {
        pixels.push({
          x,
          y,
          color: rgbaToHex(r, g, b, a),
          alpha: a
        });
      }
    }
  }

  return pixels;
}

/**
 * Agrupa píxeles por región UV
 */
function groupPixelsByRegion(pixels: Pixel[]): Map<string, Pixel[]> {
  const regionMap = new Map<string, Pixel[]>();

  for (const region of REGIONS) {
    const regionPixels = pixels.filter(p =>
      p.x >= region.x &&
      p.x < region.x + region.width &&
      p.y >= region.y &&
      p.y < region.y + region.height
    );

    if (regionPixels.length > 0) {
      regionMap.set(region.name, regionPixels);
    }
  }

  return regionMap;
}

/**
 * Genera código SVG para una región
 */
function generateSVGForRegion(regionName: string, pixels: Pixel[], region: Region): string {
  let svg = `\n      <!-- ${regionName} (${region.width}x${region.height}) at (${region.x},${region.y}) - ${region.description} -->\n`;

  // Agrupar píxeles consecutivos del mismo color en la misma fila
  const rowMap = new Map<number, Pixel[]>();

  for (const pixel of pixels) {
    const localY = pixel.y - region.y;
    if (!rowMap.has(localY)) {
      rowMap.set(localY, []);
    }
    rowMap.get(localY)!.push(pixel);
  }

  // Ordenar filas
  const sortedRows = Array.from(rowMap.entries()).sort((a, b) => a[0] - b[0]);

  for (const [localY, rowPixels] of sortedRows) {
    // Ordenar píxeles por x
    rowPixels.sort((a, b) => a.x - b.x);

    // Agrupar píxeles consecutivos del mismo color
    let i = 0;
    while (i < rowPixels.length) {
      const startPixel = rowPixels[i];
      let width = 1;

      // Buscar píxeles consecutivos del mismo color
      while (
        i + width < rowPixels.length &&
        rowPixels[i + width].x === startPixel.x + width &&
        rowPixels[i + width].color === startPixel.color
      ) {
        width++;
      }

      svg += `      <rect x="${startPixel.x}" y="${startPixel.y}" width="${width}" height="1" fill="${startPixel.color}" class="colorizable-hair"/>\n`;

      i += width;
    }
  }

  return svg;
}

/**
 * Main
 */
async function main() {
  const skinPath = path.join(
    process.cwd(),
    'public/minecraft/hairstyle-showcase/08_long_wavy_romantic.png'
  );

  console.log('🔍 Analizando skin:', skinPath);
  console.log('');

  const pixels = await extractPixels(skinPath);
  console.log(`📊 Píxeles extraídos: ${pixels.length}`);
  console.log('');

  const regionMap = groupPixelsByRegion(pixels);

  console.log('📋 Regiones detectadas:');
  for (const [regionName, regionPixels] of regionMap.entries()) {
    console.log(`   ${regionName}: ${regionPixels.length} píxeles`);
  }
  console.log('');

  console.log('═══════════════════════════════════════════════════════');
  console.log('📝 CÓDIGO SVG GENERADO:');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  // ============================================================================
  // GENERAR HEAD (CARA)
  // ============================================================================
  console.log('export function generateHead_Base_01(): string {');
  console.log('  return `');
  console.log('    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">');

  const headRegions = REGIONS.filter(r => r.name.startsWith('HEAD_'));

  for (const region of headRegions) {
    const regionPixels = regionMap.get(region.name);
    if (regionPixels && regionPixels.length > 0) {
      console.log(generateSVGForRegion(region.name, regionPixels, region));
    }
  }

  console.log('    </svg>');
  console.log('  `;');
  console.log('}');
  console.log('');

  // ============================================================================
  // GENERAR HAIR (PELO)
  // ============================================================================
  console.log('');
  console.log('export function generateHairLong_02(): string {');
  console.log('  return `');
  console.log('    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">');

  const hatRegions = REGIONS.filter(r => r.name.startsWith('HAT_'));

  for (const region of hatRegions) {
    const regionPixels = regionMap.get(region.name);
    if (regionPixels && regionPixels.length > 0) {
      console.log(generateSVGForRegion(region.name, regionPixels, region));
    }
  }

  console.log('    </svg>');
  console.log('  `;');
  console.log('}');
  console.log('');

  // ============================================================================
  // GENERAR HAIR BODY (PELO EN CUERPO)
  // ============================================================================
  console.log('');
  console.log('export function generateHairLongBody_02(): string {');
  console.log('  return `');
  console.log('    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">');

  const bodyRegions = REGIONS.filter(r => r.name.startsWith('BODY_'));

  for (const region of bodyRegions) {
    const regionPixels = regionMap.get(region.name);
    if (regionPixels && regionPixels.length > 0) {
      console.log(generateSVGForRegion(region.name, regionPixels, region));
    }
  }

  console.log('    </svg>');
  console.log('  `;');
  console.log('}');
  console.log('');

  // ============================================================================
  // GENERAR ARMS (BRAZOS)
  // ============================================================================
  console.log('');
  console.log('// ============================================================================');
  console.log('// BRAZOS');
  console.log('// ============================================================================');
  console.log('');

  const armRegions = REGIONS.filter(r => r.name.startsWith('ARM_'));
  for (const region of armRegions) {
    const regionPixels = regionMap.get(region.name);
    if (regionPixels && regionPixels.length > 0) {
      console.log(`// ${region.name}:`);
      console.log(generateSVGForRegion(region.name, regionPixels, region));
      console.log('');
    }
  }

  // ============================================================================
  // GENERAR LEGS (PIERNAS)
  // ============================================================================
  console.log('');
  console.log('// ============================================================================');
  console.log('// PIERNAS');
  console.log('// ============================================================================');
  console.log('');

  const legRegions = REGIONS.filter(r => r.name.startsWith('LEG_'));
  for (const region of legRegions) {
    const regionPixels = regionMap.get(region.name);
    if (regionPixels && regionPixels.length > 0) {
      console.log(`// ${region.name}:`);
      console.log(generateSVGForRegion(region.name, regionPixels, region));
      console.log('');
    }
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ ANÁLISIS COMPLETADO');
  console.log('═══════════════════════════════════════════════════════');
}

main().catch(console.error);
