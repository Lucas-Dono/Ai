import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { MinecraftSkinTraits } from '@/types/minecraft-skin';
import { logError } from '@/lib/logger';

/**
 * Genera PNG de skin (64x64) desde traits
 * Esta función se ejecuta on-the-fly cuando el cliente solicita la skin
 */
export async function renderSkinFromTraits(
  traits: MinecraftSkinTraits
): Promise<Buffer> {
  try {
    console.log('[Minecraft Skin] Renderizando skin:', traits.templateId);

    // 1. Cargar plantilla base desde filesystem
    const templatePath = path.join(
      process.cwd(),
      'public/minecraft/templates',
      `${traits.templateId}.png`
    );

    // Verificar si existe plantilla específica, sino usar genérica
    let finalTemplatePath = templatePath;
    try {
      await fs.access(templatePath);
    } catch {
      console.warn('[Minecraft Skin] Plantilla no encontrada, usando genérica:', traits.templateId);
      finalTemplatePath = path.join(
        process.cwd(),
        'public/minecraft/templates',
        `${traits.gender}_generic.png`
      );

      // Si tampoco existe genérica, usar base universal
      try {
        await fs.access(finalTemplatePath);
      } catch {
        finalTemplatePath = path.join(
          process.cwd(),
          'public/minecraft/templates',
          'base_steve.png'
        );
      }
    }

    const baseImage = await sharp(finalTemplatePath);

    // 2. Definir regiones UV de Minecraft (formato estándar 64x64)
    const skinRegions = [
      // Cabeza
      { x: 8, y: 8, w: 8, h: 8 },   // Cara frontal
      { x: 0, y: 8, w: 8, h: 8 },   // Lado derecho
      { x: 16, y: 8, w: 8, h: 8 },  // Lado izquierdo
      { x: 8, y: 0, w: 8, h: 8 },   // Top
      { x: 16, y: 0, w: 8, h: 8 },  // Bottom
      { x: 24, y: 8, w: 8, h: 8 },  // Atrás

      // Torso
      { x: 20, y: 20, w: 8, h: 12 }, // Frontal

      // Brazos
      { x: 44, y: 20, w: 4, h: 12 }, // Brazo derecho
      { x: 36, y: 52, w: 4, h: 12 }, // Brazo izquierdo

      // Piernas
      { x: 4, y: 20, w: 4, h: 12 },  // Pierna derecha
      { x: 20, y: 52, w: 4, h: 12 }, // Pierna izquierda
    ];

    const hairRegions = [
      { x: 40, y: 0, w: 8, h: 8 },   // Pelo overlay superior
      { x: 40, y: 8, w: 8, h: 8 },   // Pelo overlay cara
    ];

    // 3. Generar capas de color (solo si no es bald)
    const composites: sharp.OverlayOptions[] = [];

    // Capa de piel
    const skinLayer = await createColorOverlay(64, 64, traits.skinTone, skinRegions);
    composites.push({ input: skinLayer, blend: 'multiply' });

    // Capa de pelo (solo si no es calvo)
    if (traits.hairStyle !== 'bald') {
      const hairLayer = await createColorOverlay(64, 64, traits.hairColor, hairRegions);
      composites.push({ input: hairLayer, blend: 'overlay' });
    }

    // 4. Componer capas
    const finalSkin = await baseImage
      .composite(composites)
      .png()
      .toBuffer();

    console.log('[Minecraft Skin] Skin renderizada exitosamente');

    return finalSkin;

  } catch (error) {
    logError(error, { context: 'renderSkinFromTraits', traits });

    // Fallback: retornar skin de Steve por defecto
    return getDefaultSteveSkin();
  }
}

/**
 * Crea una capa de color superpuesta en regiones específicas
 */
async function createColorOverlay(
  width: number,
  height: number,
  color: string,
  regions: Array<{ x: number; y: number; w: number; h: number }>
): Promise<Buffer> {
  try {
    // Convertir hex a RGB
    const rgb = hexToRgb(color);

    // Crear SVG con rectángulos en cada región
    const svgRects = regions.map(r =>
      `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"
             fill="rgb(${rgb.r},${rgb.g},${rgb.b})" />`
    ).join('\n');

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        ${svgRects}
      </svg>
    `;

    // Convertir SVG a PNG buffer
    const buffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    return buffer;

  } catch (error) {
    logError(error, { context: 'createColorOverlay', color });
    throw error;
  }
}

/**
 * Convierte color hex a RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 128, g: 128, b: 128 }; // Gris por defecto
}

/**
 * Retorna skin de Steve por defecto (64x64)
 */
async function getDefaultSteveSkin(): Promise<Buffer> {
  try {
    const defaultPath = path.join(
      process.cwd(),
      'public/minecraft/templates',
      'base_steve.png'
    );

    return await fs.readFile(defaultPath);
  } catch {
    // Si no existe ni base_steve.png, crear una skin mínima
    return createMinimalSkin();
  }
}

/**
 * Crea una skin mínima si no hay archivos de plantilla
 */
async function createMinimalSkin(): Promise<Buffer> {
  // Skin básica de Steve (simplificada)
  const svg = `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- Cabeza (piel clara) -->
      <rect x="8" y="8" width="8" height="8" fill="#F5D7B1" />
      <rect x="0" y="8" width="8" height="8" fill="#E5C7A1" />
      <rect x="16" y="8" width="8" height="8" fill="#E5C7A1" />
      <rect x="8" y="0" width="8" height="8" fill="#F5D7B1" />

      <!-- Torso (camisa azul) -->
      <rect x="20" y="20" width="8" height="12" fill="#0066CC" />

      <!-- Brazos (piel) -->
      <rect x="44" y="20" width="4" height="12" fill="#F5D7B1" />
      <rect x="36" y="52" width="4" height="12" fill="#F5D7B1" />

      <!-- Piernas (pantalón azul oscuro) -->
      <rect x="4" y="20" width="4" height="12" fill="#003366" />
      <rect x="20" y="52" width="4" height="12" fill="#003366" />
    </svg>
  `;

  return sharp(Buffer.from(svg))
    .png()
    .toBuffer();
}
