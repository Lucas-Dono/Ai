/**
 * Crea un head_base con un tono de piel específico (no gris para recolorear)
 * Usa el color de piel del backup directamente
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

// Colores de piel del backup messy bun
const SKIN_COLORS = {
  base: { r: 0xfa, g: 0xcc, b: 0xae },      // #faccae - tono principal
  shadow: { r: 0xf8, g: 0xb7, b: 0x96 },    // #f8b796 - sombra
  highlight: { r: 0xf8, g: 0xc6, b: 0x9b }, // #f8c69b - medio
};

async function createHeadBaseSkinTone() {
  const outputPath = path.join(process.cwd(), 'public/minecraft/components/head_base/head_base_peach.png');

  console.log('Creando head_base_peach (tono melocotón del backup)...\n');

  const data = Buffer.alloc(SKIN_WIDTH * SKIN_HEIGHT * 4, 0);

  const setPixel = (x: number, y: number, r: number, g: number, b: number) => {
    const idx = (y * SKIN_WIDTH + x) * 4;
    data[idx] = r;
    data[idx + 1] = g;
    data[idx + 2] = b;
    data[idx + 3] = 255;
  };

  // Rellenar cada región de cabeza
  for (const [name, region] of Object.entries(HEAD_REGIONS)) {
    for (let y = 0; y < region.height; y++) {
      for (let x = 0; x < region.width; x++) {
        // Usar diferentes tonos según la posición para dar volumen
        let color = SKIN_COLORS.base;

        // Bordes = sombra
        if (x === 0 || x === region.width - 1 || y === 0 || y === region.height - 1) {
          color = SKIN_COLORS.shadow;
        }
        // Centro = highlight
        else if (x >= 2 && x <= 5 && y >= 2 && y <= 5) {
          color = SKIN_COLORS.highlight;
        }

        setPixel(region.x + x, region.y + y, color.r, color.g, color.b);
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

createHeadBaseSkinTone().catch(console.error);
