/**
 * Extrae el pelo que cae sobre el cuerpo (body overlay) del backup
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const SKIN_WIDTH = 64;
const SKIN_HEIGHT = 64;

// Regiones de overlay del body donde puede haber pelo
const BODY_OVERLAY_REGIONS = {
  // Overlay (segunda capa)
  BODY_OVERLAY_FRONT: { x: 20, y: 36, width: 8, height: 12 },
  BODY_OVERLAY_BACK: { x: 32, y: 36, width: 8, height: 12 },
  BODY_OVERLAY_RIGHT: { x: 16, y: 36, width: 4, height: 12 },
  BODY_OVERLAY_LEFT: { x: 28, y: 36, width: 4, height: 12 },
  ARM_R_OVERLAY: { x: 44, y: 36, width: 4, height: 12 },
  ARM_L_OVERLAY: { x: 52, y: 52, width: 4, height: 12 },
  // Base de espalda (pelo largo que cubre toda la espalda)
  BODY_BACK_BASE: { x: 32, y: 20, width: 8, height: 12 },
};

/**
 * Verifica si un color es tono de pelo (rojizo/borgoña/oscuro)
 * Filtra piel (#f7baa1) y ropa (#8ba1cc, #828eb8)
 */
function isHairColor(r: number, g: number, b: number): boolean {
  // Calcular si es un tono cálido/rojizo (pelo) vs frío/azulado (ropa) vs claro (piel)
  const brightness = (r + g + b) / 3;

  // Piel muy clara (brightness > 170) - excluir
  if (brightness > 170) return false;

  // Azules/grises fríos de ropa (b > r y b > 100) - excluir
  if (b > r && b > 100) return false;

  // Todo lo demás (tonos rojizos/marrones/oscuros) es pelo
  return true;
}

async function extractHairBody() {
  const backupPath = path.join(process.cwd(), 'public/minecraft/backup/texture.png');
  const outputPath = path.join(process.cwd(), 'public/minecraft/components/hair_body/hair_body_curly_09.png');

  console.log('═══════════════════════════════════════════════════════');
  console.log('  EXTRACTOR DE PELO EN BODY (OVERLAY)');
  console.log('═══════════════════════════════════════════════════════\n');

  const skinBuffer = await fs.readFile(backupPath);
  const { data, info } = await sharp(skinBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`✓ Skin leída: ${info.width}x${info.height}\n`);

  // Canvas 64x64 transparente
  const outputData = Buffer.alloc(SKIN_WIDTH * SKIN_HEIGHT * 4, 0);

  let totalPixels = 0;

  for (const [regionName, region] of Object.entries(BODY_OVERLAY_REGIONS)) {
    let pixelCount = 0;

    for (let y = 0; y < region.height; y++) {
      for (let x = 0; x < region.width; x++) {
        const srcX = region.x + x;
        const srcY = region.y + y;
        const srcIdx = (srcY * info.width + srcX) * 4;

        const r = data[srcIdx];
        const g = data[srcIdx + 1];
        const b = data[srcIdx + 2];
        const a = data[srcIdx + 3];

        // Solo copiar si es opaco Y es color de pelo (no piel/ropa)
        if (a > 0 && isHairColor(r, g, b)) {
          const dstIdx = (srcY * SKIN_WIDTH + srcX) * 4;
          outputData[dstIdx] = r;
          outputData[dstIdx + 1] = g;
          outputData[dstIdx + 2] = b;
          outputData[dstIdx + 3] = a;
          pixelCount++;
        }
      }
    }

    console.log(`   ${regionName.padEnd(20)} (${region.x}, ${region.y}): ${pixelCount} píxeles`);
    totalPixels += pixelCount;
  }

  console.log(`\n   Total: ${totalPixels} píxeles de pelo en body\n`);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(outputData, {
    raw: { width: SKIN_WIDTH, height: SKIN_HEIGHT, channels: 4 }
  })
    .png()
    .toFile(outputPath);

  console.log(`💾 Guardado en: ${outputPath}`);
  console.log('\n═══════════════════════════════════════════════════════\n');
}

extractHairBody().catch(console.error);
