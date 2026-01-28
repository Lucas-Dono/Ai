/**
 * Crea un head_base que es solo piel sólida sin rasgos faciales
 * Para usar con componentes de ojos/boca personalizados
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const SKIN_WIDTH = 64;
const SKIN_HEIGHT = 64;

// Regiones de la cabeza en UV de Minecraft
const HEAD_REGIONS = {
  HEAD_TOP: { x: 8, y: 0, width: 8, height: 8 },
  HEAD_BOTTOM: { x: 16, y: 0, width: 8, height: 8 },
  HEAD_FRONT: { x: 8, y: 8, width: 8, height: 8 },
  HEAD_RIGHT: { x: 0, y: 8, width: 8, height: 8 },
  HEAD_LEFT: { x: 16, y: 8, width: 8, height: 8 },
  HEAD_BACK: { x: 24, y: 8, width: 8, height: 8 },
};

async function createHeadBasePlain() {
  const outputPath = path.join(process.cwd(), 'public/minecraft/components/head_base/head_base_plain.png');

  console.log('Creando head_base_plain (solo piel, sin rasgos faciales)...\n');

  // Canvas 64x64 transparente
  const data = Buffer.alloc(SKIN_WIDTH * SKIN_HEIGHT * 4, 0);

  // Color gris neutro (será recoloreado por el assembler)
  const gray = 180; // Gris claro

  const setPixel = (x: number, y: number, value: number) => {
    const idx = (y * SKIN_WIDTH + x) * 4;
    data[idx] = value;     // R
    data[idx + 1] = value; // G
    data[idx + 2] = value; // B
    data[idx + 3] = 255;   // A
  };

  // Rellenar todas las regiones de cabeza con gris sólido
  for (const region of Object.values(HEAD_REGIONS)) {
    for (let y = 0; y < region.height; y++) {
      for (let x = 0; x < region.width; x++) {
        setPixel(region.x + x, region.y + y, gray);
      }
    }
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(data, {
    raw: { width: SKIN_WIDTH, height: SKIN_HEIGHT, channels: 4 }
  })
    .png()
    .toFile(outputPath);

  console.log(`✓ Guardado en: ${outputPath}`);
}

createHeadBasePlain().catch(console.error);
