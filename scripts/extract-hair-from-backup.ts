/**
 * Script para extraer el pelo de una skin de Minecraft y convertirlo en componente modular
 * Extrae las regiones HAT (overlay de cabeza) y las guarda como componente independiente
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const SKIN_WIDTH = 64;
const SKIN_HEIGHT = 64;

// Coordenadas UV del HEAD y HAT layers (pelo) en Minecraft
const HAIR_REGIONS = {
  // HEAD layer (capa base)
  HEAD_FRONT: { x: 8, y: 8, width: 8, height: 8 },
  HEAD_RIGHT: { x: 0, y: 8, width: 8, height: 8 },
  HEAD_LEFT: { x: 16, y: 8, width: 8, height: 8 },
  HEAD_TOP: { x: 8, y: 0, width: 8, height: 8 },
  HEAD_BOTTOM: { x: 16, y: 0, width: 8, height: 8 },
  HEAD_BACK: { x: 24, y: 8, width: 8, height: 8 },

  // HAT layer (overlay)
  HAT_TOP: { x: 40, y: 0, width: 8, height: 8 },
  HAT_FRONT: { x: 40, y: 8, width: 8, height: 8 },
  HAT_RIGHT: { x: 32, y: 8, width: 8, height: 8 },
  HAT_LEFT: { x: 48, y: 8, width: 8, height: 8 },
  HAT_BACK: { x: 56, y: 8, width: 8, height: 8 },
  HAT_BOTTOM: { x: 48, y: 0, width: 8, height: 8 },
};

// Máscara de cara en HEAD_FRONT (coordenadas relativas dentro del cuadro 8x8)
// Incluye ojos (y=4-6) y piel inferior (y=7) para evitar extraer cara como pelo
const FACE_MASK_IN_HEAD_FRONT = [
  // Fila y=4: contorno superior ojos + zona central
  { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 },
  { x: 5, y: 4 }, { x: 6, y: 4 },
  // Fila y=5: ojos completos
  { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 },
  { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 },
  // Fila y=6: ojos + boca
  { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 },
  { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 },
  // Fila y=7: barbilla/piel inferior
  { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 },
  { x: 5, y: 7 }, { x: 6, y: 7 },
];

// Máscara de boca en HEAD_FRONT (mouth_01 dibuja en y=6, x=2-5)
const MOUTH_MASK_IN_HEAD_FRONT = [
  { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
];

/**
 * Verifica si un píxel está en la región facial dentro de HEAD_FRONT
 */
function isInFacialRegion(regionName: string, x: number, y: number): boolean {
  if (regionName !== 'HEAD_FRONT') return false;

  const inFace = FACE_MASK_IN_HEAD_FRONT.some(p => p.x === x && p.y === y);
  const inMouth = MOUTH_MASK_IN_HEAD_FRONT.some(p => p.x === x && p.y === y);

  return inFace || inMouth;
}

async function extractHairFromSkin() {
  const backupPath = path.join(process.cwd(), 'public/minecraft/backup/texture.png');
  const outputPath = path.join(process.cwd(), 'public/minecraft/components/hair_front/hair_long_black_14.png');

  console.log('═══════════════════════════════════════════════════════');
  console.log('  EXTRACTOR DE PELO DE SKIN DE MINECRAFT');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log(`📂 Leyendo skin de backup: ${backupPath}`);

  // Leer la skin original
  const skinBuffer = await fs.readFile(backupPath);
  const { data: skinData, info } = await sharp(skinBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`✓ Skin leída: ${info.width}x${info.height}`);

  // Detectar formato de skin
  const isLegacyFormat = info.height === 32 && info.width === 64;
  const isHDSkin = info.width > 64 || info.height > 64;

  console.log(`📏 Formato: ${isLegacyFormat ? '64x32 (legacy)' : isHDSkin ? 'HD' : '64x64 (standard)'}`);

  // Trabajar con la skin original (sin redimensionar para legacy)
  let workingData = skinData;
  let workingWidth = info.width;
  let workingHeight = info.height;

  // Solo redimensionar si es HD (mayor a 64x64), NO si es legacy 64x32
  if (isHDSkin) {
    console.log('🔄 Redimensionando skin HD a 64x64...');
    const resized = await sharp(skinBuffer)
      .resize(SKIN_WIDTH, SKIN_HEIGHT, {
        kernel: 'nearest',
        fit: 'fill'
      })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    workingData = resized.data;
    workingWidth = resized.info.width;
    workingHeight = resized.info.height;
    console.log(`✓ Redimensionada a: ${workingWidth}x${workingHeight}`);
  }

  // Crear canvas transparente de 64x64
  const outputData = Buffer.alloc(SKIN_WIDTH * SKIN_HEIGHT * 4, 0);

  console.log('\n🎨 Extrayendo regiones de pelo (HEAD + HAT layers):\n');

  // Extraer cada región de pelo (HEAD + HAT) y copiarla al canvas de salida
  for (const [regionName, region] of Object.entries(HAIR_REGIONS)) {
    // Saltar regiones que están fuera de los límites (formato legacy 64x32)
    if (region.y + region.height > workingHeight || region.x + region.width > workingWidth) {
      console.log(`   ${regionName.padEnd(12)} (${region.x}, ${region.y}): SALTADO (fuera de límites)`);
      continue;
    }

    let pixelCount = 0;
    let skippedEyePixels = 0;

    for (let y = 0; y < region.height; y++) {
      for (let x = 0; x < region.width; x++) {
        // Saltar píxeles de la región de ojos en HEAD_FRONT
        if (isInFacialRegion(regionName, x, y)) {
          skippedEyePixels++;
          continue;
        }

        // Posición en skin original
        const srcX = region.x + x;
        const srcY = region.y + y;
        const srcIdx = (srcY * workingWidth + srcX) * 4;

        // Leer pixel
        const r = workingData[srcIdx];
        const g = workingData[srcIdx + 1];
        const b = workingData[srcIdx + 2];
        const a = workingData[srcIdx + 3];

        // Solo copiar si el pixel no es transparente
        if (a > 0) {
          // Posición en canvas de salida (misma posición)
          const dstIdx = (srcY * SKIN_WIDTH + srcX) * 4;

          outputData[dstIdx] = r;
          outputData[dstIdx + 1] = g;
          outputData[dstIdx + 2] = b;
          outputData[dstIdx + 3] = a;

          pixelCount++;
        }
      }
    }

    const skipInfo = skippedEyePixels > 0 ? ` (${skippedEyePixels} ojos omitidos)` : '';
    console.log(`   ${regionName.padEnd(12)} (${region.x}, ${region.y}): ${pixelCount} píxeles copiados${skipInfo}`);
  }

  // Guardar el componente de pelo
  console.log(`\n💾 Guardando componente en: ${outputPath}`);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(outputData, {
    raw: {
      width: SKIN_WIDTH,
      height: SKIN_HEIGHT,
      channels: 4,
    },
  })
    .png()
    .toFile(outputPath);

  console.log('✓ Componente guardado exitosamente\n');

  // Análisis de colores
  console.log('🎨 Análisis de colores del pelo:\n');
  const colorMap = new Map<string, number>();

  for (const region of Object.values(HAIR_REGIONS)) {
    for (let y = 0; y < region.height; y++) {
      for (let x = 0; x < region.width; x++) {
        const srcX = region.x + x;
        const srcY = region.y + y;
        const srcIdx = (srcY * info.width + srcX) * 4;

        const r = skinData[srcIdx];
        const g = skinData[srcIdx + 1];
        const b = skinData[srcIdx + 2];
        const a = skinData[srcIdx + 3];

        if (a > 0) {
          const colorHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          colorMap.set(colorHex, (colorMap.get(colorHex) || 0) + 1);
        }
      }
    }
  }

  // Mostrar top 10 colores más comunes
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log('   Top 10 colores más comunes:');
  sortedColors.forEach(([color, count], index) => {
    const bar = '█'.repeat(Math.floor(count / 5));
    console.log(`   ${(index + 1).toString().padStart(2)}. ${color} ${bar} (${count} px)`);
  });

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  ✨ EXTRACCIÓN COMPLETADA');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('📝 Siguiente paso:');
  console.log('   Ejecutar: npm run showcase-hairstyles');
  console.log('   Para regenerar la skin 06_shag_bohemian con el nuevo pelo\n');
}

extractHairFromSkin().catch(console.error);
