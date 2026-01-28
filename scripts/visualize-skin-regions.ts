/**
 * Genera una visualización de las regiones de la skin
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async function visualizeSkin() {
  const skinPath = path.join(process.cwd(), 'public/minecraft/hairstyle-showcase/15_messy_bun_casual.png');
  const outputPath = path.join(process.cwd(), 'public/minecraft/debug_skin_15.png');

  const skinBuffer = await fs.readFile(skinPath);

  // Escalar 8x para ver mejor
  await sharp(skinBuffer)
    .resize(512, 512, { kernel: 'nearest' })
    .png()
    .toFile(outputPath);

  console.log(`Skin escalada guardada en: ${outputPath}`);
}

visualizeSkin().catch(console.error);
