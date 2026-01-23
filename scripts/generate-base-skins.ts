/**
 * Script para generar plantillas base de skins de Minecraft
 * Crea skins básicas (Steve, Alex, etc.) que sirven como plantillas
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const TEMPLATES_DIR = path.join(process.cwd(), 'public/minecraft/templates');

interface SkinRegion {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

/**
 * Crea una skin básica de Steve (formato 64x64)
 */
async function createSteveSkin() {
  const regions: SkinRegion[] = [
    // Cabeza - piel clara
    { x: 8, y: 8, w: 8, h: 8, color: '#F5D7B1' },   // Cara frontal
    { x: 0, y: 8, w: 8, h: 8, color: '#E5C7A1' },   // Lado derecho
    { x: 16, y: 8, w: 8, h: 8, color: '#E5C7A1' },  // Lado izquierdo
    { x: 8, y: 0, w: 8, h: 8, color: '#F5D7B1' },   // Top
    { x: 16, y: 0, w: 8, h: 8, color: '#D5B791' },  // Bottom
    { x: 24, y: 8, w: 8, h: 8, color: '#E5C7A1' },  // Atrás

    // Pelo/cabeza overlay - marrón oscuro
    { x: 40, y: 0, w: 8, h: 8, color: '#3D2817' },  // Top overlay
    { x: 40, y: 8, w: 8, h: 8, color: '#3D2817' },  // Frontal overlay

    // Torso - camisa azul
    { x: 20, y: 20, w: 8, h: 12, color: '#0066CC' },  // Frontal
    { x: 28, y: 20, w: 8, h: 12, color: '#0055AA' },  // Atrás
    { x: 16, y: 20, w: 4, h: 12, color: '#0055BB' },  // Lado derecho
    { x: 24, y: 20, w: 4, h: 12, color: '#0055BB' },  // Lado izquierdo

    // Brazos - piel
    { x: 44, y: 20, w: 4, h: 12, color: '#F5D7B1' },  // Brazo derecho frontal
    { x: 48, y: 20, w: 4, h: 12, color: '#E5C7A1' },  // Brazo derecho atrás
    { x: 36, y: 52, w: 4, h: 12, color: '#F5D7B1' },  // Brazo izquierdo frontal
    { x: 40, y: 52, w: 4, h: 12, color: '#E5C7A1' },  // Brazo izquierdo atrás

    // Piernas - pantalón azul oscuro
    { x: 4, y: 20, w: 4, h: 12, color: '#003366' },   // Pierna derecha frontal
    { x: 8, y: 20, w: 4, h: 12, color: '#002255' },   // Pierna derecha atrás
    { x: 20, y: 52, w: 4, h: 12, color: '#003366' },  // Pierna izquierda frontal
    { x: 24, y: 52, w: 4, h: 12, color: '#002255' },  // Pierna izquierda atrás
  ];

  return createSkinFromRegions(regions);
}

/**
 * Crea una skin femenina genérica
 */
async function createFemaleSkin() {
  const regions: SkinRegion[] = [
    // Cabeza - piel clara
    { x: 8, y: 8, w: 8, h: 8, color: '#FFE0D0' },   // Cara frontal
    { x: 0, y: 8, w: 8, h: 8, color: '#F5D0C0' },   // Lado derecho
    { x: 16, y: 8, w: 8, h: 8, color: '#F5D0C0' },  // Lado izquierdo
    { x: 8, y: 0, w: 8, h: 8, color: '#FFE0D0' },   // Top
    { x: 16, y: 0, w: 8, h: 8, color: '#E5C0B0' },  // Bottom
    { x: 24, y: 8, w: 8, h: 8, color: '#F5D0C0' },  // Atrás

    // Pelo largo - castaño
    { x: 40, y: 0, w: 8, h: 8, color: '#6B4423' },  // Top overlay
    { x: 40, y: 8, w: 8, h: 8, color: '#6B4423' },  // Frontal overlay

    // Torso - blusa rosa
    { x: 20, y: 20, w: 8, h: 12, color: '#FF99CC' },  // Frontal
    { x: 28, y: 20, w: 8, h: 12, color: '#EE88BB' },  // Atrás

    // Brazos (slim model) - piel
    { x: 44, y: 20, w: 3, h: 12, color: '#FFE0D0' },  // Brazo derecho
    { x: 36, y: 52, w: 3, h: 12, color: '#FFE0D0' },  // Brazo izquierdo

    // Piernas - pantalón morado
    { x: 4, y: 20, w: 4, h: 12, color: '#6633AA' },   // Pierna derecha
    { x: 20, y: 52, w: 4, h: 12, color: '#6633AA' },  // Pierna izquierda
  ];

  return createSkinFromRegions(regions);
}

/**
 * Crea una skin genérica neutral
 */
async function createNonBinarySkin() {
  const regions: SkinRegion[] = [
    // Cabeza - tono medio
    { x: 8, y: 8, w: 8, h: 8, color: '#D4A574' },
    { x: 0, y: 8, w: 8, h: 8, color: '#C49564' },
    { x: 16, y: 8, w: 8, h: 8, color: '#C49564' },
    { x: 8, y: 0, w: 8, h: 8, color: '#D4A574' },

    // Pelo corto - negro
    { x: 40, y: 0, w: 8, h: 8, color: '#1A1A1A' },
    { x: 40, y: 8, w: 8, h: 8, color: '#1A1A1A' },

    // Torso - camisa verde
    { x: 20, y: 20, w: 8, h: 12, color: '#00AA66' },

    // Brazos - piel
    { x: 44, y: 20, w: 4, h: 12, color: '#D4A574' },
    { x: 36, y: 52, w: 4, h: 12, color: '#D4A574' },

    // Piernas - pantalón negro
    { x: 4, y: 20, w: 4, h: 12, color: '#2A2A2A' },
    { x: 20, y: 52, w: 4, h: 12, color: '#2A2A2A' },
  ];

  return createSkinFromRegions(regions);
}

/**
 * Crea una skin desde regiones de color
 */
async function createSkinFromRegions(regions: SkinRegion[]): Promise<Buffer> {
  // Crear fondo transparente
  const background = await sharp({
    create: {
      width: 64,
      height: 64,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).png().toBuffer();

  // Crear SVG con todas las regiones
  const svgRects = regions.map(r =>
    `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${r.color}" />`
  ).join('\n');

  const svg = `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      ${svgRects}
    </svg>
  `;

  return sharp(Buffer.from(svg))
    .png()
    .toBuffer();
}

/**
 * Main execution
 */
async function main() {
  console.log('Generando plantillas base de skins...');

  // Crear directorio si no existe
  await fs.mkdir(TEMPLATES_DIR, { recursive: true });

  // Generar skins base
  const skins = [
    { name: 'base_steve.png', fn: createSteveSkin },
    { name: 'male_generic.png', fn: createSteveSkin },
    { name: 'female_generic.png', fn: createFemaleSkin },
    { name: 'non_binary_generic.png', fn: createNonBinarySkin },
  ];

  for (const { name, fn } of skins) {
    const buffer = await fn();
    const filePath = path.join(TEMPLATES_DIR, name);
    await fs.writeFile(filePath, buffer);
    console.log(`✓ Generada: ${name}`);
  }

  console.log('\n¡Plantillas base generadas exitosamente!');
  console.log(`Ubicación: ${TEMPLATES_DIR}`);
}

main().catch(console.error);
