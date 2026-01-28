import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { MinecraftSkinTraits } from '@/types/minecraft-skin';
import { logError } from '@/lib/logger';
import { assembleSkin } from './skin-assembler';
import { SkinConfiguration, ComponentStyle } from '@/types/minecraft-skin-components';
import { getCharacterSkinConfig, CharacterSkinConfig } from './character-skin-configs';

const COMPONENTS_DIR = path.join(process.cwd(), 'public/minecraft/components');

/**
 * Genera PNG de skin (64x64) desde traits
 * Esta función se ejecuta on-the-fly cuando el cliente solicita la skin
 *
 * Flujo mejorado:
 * 1. Si existe configuración específica para el personaje → usar componentes modulares
 * 2. Si no → usar sistema legacy de templates con coloreo
 */
export async function renderSkinFromTraits(
  traits: MinecraftSkinTraits,
  characterName?: string
): Promise<Buffer> {
  try {
    console.log('[Minecraft Skin] Renderizando skin:', traits.templateId);

    // Intentar usar configuración de componentes modulares si existe
    const characterConfig = characterName ? getCharacterSkinConfig(characterName) : null;

    if (characterConfig) {
      console.log('[Minecraft Skin] Usando configuración modular para:', characterName);
      return renderFromComponentConfig(characterConfig, traits);
    }

    // Fallback: sistema legacy de templates
    return renderFromTemplate(traits);

  } catch (error) {
    logError(error, { context: 'renderSkinFromTraits', traits, characterName });

    // Fallback: retornar skin de Steve por defecto
    return getDefaultSteveSkin();
  }
}

/**
 * Renderiza skin usando el sistema modular de componentes
 */
async function renderFromComponentConfig(
  config: CharacterSkinConfig,
  traits: MinecraftSkinTraits
): Promise<Buffer> {
  // Construir SkinConfiguration completa desde el config del personaje
  const skinConfig: SkinConfiguration = {
    bodyGenes: {
      height: 'average',
      build: config.gender === 'female' ? 'slim' : 'athletic',
      armModel: config.gender === 'female' ? 'slim' : 'classic',
      chest: config.gender === 'female' ? 'medium' : 'flat',
      hips: 'average',
      shoulders: config.gender === 'female' ? 'narrow' : 'average',
      headSize: 'normal',
      legLength: 'normal',
    },
    facialGenes: {
      faceShape: 'oval',
      eyeSize: config.gender === 'female' ? 'large' : 'medium',
      eyeSpacing: 'normal',
      noseSize: 'medium',
      mouthWidth: 'normal',
      jawline: config.gender === 'female' ? 'soft' : 'normal',
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: config.skinTone,
      skinShadow: adjustColorBrightness(config.skinTone, -20),
      skinHighlight: adjustColorBrightness(config.skinTone, 20),
      hairPrimary: config.hairColor,
      eyeColor: config.eyeColor,
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#4169E1', // Azul por defecto
      clothingSecondary: '#2C3E50',
    },
    components: config.components as SkinConfiguration['components'],
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  };

  return assembleSkin(skinConfig, COMPONENTS_DIR);
}

/**
 * Sistema legacy de renderizado con templates y coloreo
 */
async function renderFromTemplate(traits: MinecraftSkinTraits): Promise<Buffer> {
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
}

/**
 * Ajusta el brillo de un color hex
 */
function adjustColorBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const adjust = (value: number) => Math.min(255, Math.max(0, value + Math.round(value * percent / 100)));
  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
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
