/**
 * Crea componentes vacíos (transparentes) para usar con outfits completos
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const SKIN_WIDTH = 64;
const SKIN_HEIGHT = 64;

async function createEmptyComponents() {
  const componentsDir = path.join(process.cwd(), 'public/minecraft/components');

  // Componentes vacíos a crear
  const emptyComponents = [
    { dir: 'torso_base', name: 'torso_empty' },
    { dir: 'arms_base', name: 'arms_empty' },
    { dir: 'legs_base', name: 'legs_empty' },
  ];

  // Canvas 64x64 completamente transparente
  const transparentData = Buffer.alloc(SKIN_WIDTH * SKIN_HEIGHT * 4, 0);

  for (const comp of emptyComponents) {
    const outputPath = path.join(componentsDir, comp.dir, `${comp.name}.png`);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    await sharp(transparentData, {
      raw: { width: SKIN_WIDTH, height: SKIN_HEIGHT, channels: 4 }
    })
      .png()
      .toFile(outputPath);

    console.log(`✓ Creado: ${outputPath}`);
  }

  console.log('\nComponentes vacíos creados exitosamente.');
}

createEmptyComponents().catch(console.error);
