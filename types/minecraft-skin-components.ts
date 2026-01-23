/**
 * Sistema Modular de Componentes para Skins de Minecraft
 *
 * Arquitectura tipo Sims/Avatar Creator:
 * - Componentes separados por categoría (ojos, pelo, ropa, etc.)
 * - Forma separada de color (recoloreo programático)
 * - Sistema de genes/traits (altura, complexión, etc.)
 * - Ensamblaje procedural con reglas de compatibilidad
 */

import { z } from 'zod';

// ============================================================================
// CATEGORÍAS DE COMPONENTES
// ============================================================================

/**
 * Categorías principales de componentes
 */
export enum ComponentCategory {
  // CABEZA
  EYES = 'eyes',               // Ojos (forma y posición)
  EYEBROWS = 'eyebrows',       // Cejas
  NOSE = 'nose',               // Nariz
  MOUTH = 'mouth',             // Boca/expresión
  EARS = 'ears',               // Orejas (visibles de lado)

  // PELO
  HAIR_FRONT = 'hair_front',   // Pelo frontal (flequillo)
  HAIR_BACK = 'hair_back',     // Pelo trasero
  HAIR_TOP = 'hair_top',       // Pelo superior
  HAIR_SIDES = 'hair_sides',   // Pelo lateral
  FACIAL_HAIR = 'facial_hair', // Barba/bigote

  // CUERPO
  TORSO_BASE = 'torso_base',   // Torso base (piel)
  ARMS_BASE = 'arms_base',     // Brazos base (piel)
  LEGS_BASE = 'legs_base',     // Piernas base (piel)

  // ROPA - SUPERIOR
  T_SHIRT = 't_shirt',         // Remera/camiseta (manga corta)
  SHIRT = 'shirt',             // Camisa/blusa (manga larga)
  JACKET = 'jacket',           // Chaqueta/campera
  VEST = 'vest',               // Chaleco
  DRESS_TOP = 'dress_top',     // Parte superior de vestido

  // ROPA - INFERIOR
  PANTS = 'pants',             // Pantalones
  SKIRT = 'skirt',             // Falda
  DRESS_BOTTOM = 'dress_bottom', // Parte inferior de vestido

  // ACCESORIOS
  GLASSES = 'glasses',         // Lentes
  HAT = 'hat',                 // Sombrero/gorra
  NECKLACE = 'necklace',       // Collar (overlay en cuello)
  EARRINGS = 'earrings',       // Aretes
  GLOVES = 'gloves',           // Guantes (overlay en manos)
  SHOES = 'shoes',             // Zapatos (overlay en pies)
  BOOTS = 'boots',             // Botas (cubren más de la pierna)

  // EXTRAS
  TATTOO = 'tattoo',           // Tatuajes
  SCARS = 'scars',             // Cicatrices
  MAKEUP = 'makeup',           // Maquillaje
}

/**
 * Estilo de componente (influye en selección)
 */
export enum ComponentStyle {
  REALISTIC = 'realistic',     // Realista
  CARTOON = 'cartoon',         // Caricatura
  ANIME = 'anime',             // Estilo anime
  PIXEL = 'pixel',             // Pixel art clásico
  MINIMAL = 'minimal',         // Minimalista
}

// ============================================================================
// SISTEMA DE GENES/TRAITS
// ============================================================================

/**
 * Genes que afectan la morfología del cuerpo
 */
export interface BodyGenes {
  // ALTURA (afecta proporción de piernas)
  height: 'very_short' | 'short' | 'average' | 'tall' | 'very_tall';

  // COMPLEXIÓN (afecta ancho de torso/brazos)
  build: 'slim' | 'athletic' | 'average' | 'muscular' | 'heavy';

  // MODELO DE BRAZOS (Minecraft específico)
  armModel: 'classic' | 'slim'; // 4px vs 3px de ancho

  // CARACTERÍSTICAS SEXUALES
  chest: 'flat' | 'small' | 'medium' | 'large';
  hips: 'narrow' | 'average' | 'wide';
  shoulders: 'narrow' | 'average' | 'broad';

  // PROPORCIONES
  headSize: 'small' | 'normal' | 'large';
  legLength: 'short' | 'normal' | 'long';
}

/**
 * Genes que afectan características faciales
 */
export interface FacialGenes {
  // FORMA DE CARA
  faceShape: 'round' | 'oval' | 'square' | 'heart' | 'diamond';

  // CARACTERÍSTICAS
  eyeSize: 'small' | 'medium' | 'large';
  eyeSpacing: 'close' | 'normal' | 'wide';
  noseSize: 'small' | 'medium' | 'large';
  mouthWidth: 'narrow' | 'normal' | 'wide';
  jawline: 'soft' | 'normal' | 'defined';

  // EXPRESIÓN BASE
  eyeExpression: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised';
  mouthExpression: 'neutral' | 'smile' | 'frown' | 'smirk';
}

/**
 * Paleta de colores completa del personaje
 */
export interface ColorPalette {
  // PIEL
  skinTone: string;            // Hex color (base)
  skinShadow: string;          // Hex color (sombras, -20% luminosidad)
  skinHighlight: string;       // Hex color (luces, +20% luminosidad)

  // PELO
  hairPrimary: string;         // Hex color (base)
  hairSecondary?: string;      // Hex color (opcional, mechones/highlights)

  // OJOS
  eyeColor: string;            // Hex color (iris)
  eyeWhite: string;            // Hex color (blanco del ojo, default: #FFFFFF)
  eyePupil: string;            // Hex color (pupila, default: #000000)

  // ROPA
  clothingPrimary: string;     // Hex color (color principal)
  clothingSecondary?: string;  // Hex color (opcional, detalles/bordes)
  clothingAccent?: string;     // Hex color (opcional, botones/decoración)

  // EXTRAS
  lipstick?: string;           // Hex color (opcional, maquillaje)
  blush?: string;              // Hex color (opcional, rubor)
}

// ============================================================================
// DEFINICIÓN DE COMPONENTES
// ============================================================================

/**
 * Metadatos de un componente individual
 */
export interface ComponentMetadata {
  id: string;                  // Identificador único: "eyes_01", "hair_ponytail_02"
  category: ComponentCategory;
  style: ComponentStyle;
  name: string;                // Nombre descriptivo: "Ojos Grandes", "Coleta Alta"

  // ARCHIVO DE SPRITE
  spritePath: string;          // Ruta al PNG: "/minecraft/components/eyes/eyes_01.png"

  // REGIONES UV QUE OCUPA (coordenadas en 64x64)
  uvRegions: UVRegion[];

  // COMPATIBILIDAD
  compatibleWith?: {
    genes?: Partial<BodyGenes | FacialGenes>;    // Genes compatibles
    categories?: ComponentCategory[];             // Categorías que no debe tener conflicto
  };

  // RECOLOREABLE
  isColorizable: boolean;      // ¿Se puede recolorear?
  colorMask?: string;          // Ruta a máscara de color (PNG con canal alpha)

  // CAPAS
  layer: number;               // Orden de renderizado (0 = más abajo, 10 = más arriba)
  isOverlay: boolean;          // ¿Es capa overlay de Minecraft? (segunda capa +0.5px)

  // ETIQUETAS
  tags: string[];              // ["feminine", "formal", "medieval", etc.]
}

/**
 * Región UV (coordenadas en la textura 64x64)
 */
export interface UVRegion {
  x: number;       // Coordenada X (0-63)
  y: number;       // Coordenada Y (0-63)
  width: number;   // Ancho en píxeles
  height: number;  // Alto en píxeles
  name?: string;   // Nombre descriptivo: "face_front", "head_top"
}

// ============================================================================
// BIBLIOTECA DE COMPONENTES
// ============================================================================

/**
 * Biblioteca completa de componentes disponibles
 */
export interface ComponentLibrary {
  [ComponentCategory.EYES]: ComponentMetadata[];
  [ComponentCategory.EYEBROWS]: ComponentMetadata[];
  [ComponentCategory.NOSE]: ComponentMetadata[];
  [ComponentCategory.MOUTH]: ComponentMetadata[];
  [ComponentCategory.EARS]: ComponentMetadata[];
  [ComponentCategory.HAIR_FRONT]: ComponentMetadata[];
  [ComponentCategory.HAIR_BACK]: ComponentMetadata[];
  [ComponentCategory.HAIR_TOP]: ComponentMetadata[];
  [ComponentCategory.HAIR_SIDES]: ComponentMetadata[];
  [ComponentCategory.FACIAL_HAIR]: ComponentMetadata[];
  [ComponentCategory.TORSO_BASE]: ComponentMetadata[];
  [ComponentCategory.ARMS_BASE]: ComponentMetadata[];
  [ComponentCategory.LEGS_BASE]: ComponentMetadata[];
  [ComponentCategory.SHIRT]: ComponentMetadata[];
  [ComponentCategory.JACKET]: ComponentMetadata[];
  [ComponentCategory.VEST]: ComponentMetadata[];
  [ComponentCategory.DRESS_TOP]: ComponentMetadata[];
  [ComponentCategory.PANTS]: ComponentMetadata[];
  [ComponentCategory.SKIRT]: ComponentMetadata[];
  [ComponentCategory.DRESS_BOTTOM]: ComponentMetadata[];
  [ComponentCategory.GLASSES]: ComponentMetadata[];
  [ComponentCategory.HAT]: ComponentMetadata[];
  [ComponentCategory.NECKLACE]: ComponentMetadata[];
  [ComponentCategory.EARRINGS]: ComponentMetadata[];
  [ComponentCategory.GLOVES]: ComponentMetadata[];
  [ComponentCategory.SHOES]: ComponentMetadata[];
  [ComponentCategory.TATTOO]: ComponentMetadata[];
  [ComponentCategory.SCARS]: ComponentMetadata[];
  [ComponentCategory.MAKEUP]: ComponentMetadata[];
}

// ============================================================================
// CONFIGURACIÓN DE SKIN
// ============================================================================

/**
 * Configuración completa para ensamblar una skin
 */
export interface SkinConfiguration {
  // GENES
  bodyGenes: BodyGenes;
  facialGenes: FacialGenes;

  // PALETA DE COLORES
  colors: ColorPalette;

  // COMPONENTES SELECCIONADOS (ID de cada componente)
  components: {
    // CARA
    eyes: string;              // ID: "eyes_01"
    eyebrows?: string;         // Opcional
    nose?: string;             // Opcional
    mouth: string;             // ID: "mouth_smile_01"
    ears?: string;             // Opcional

    // PELO
    hairFront?: string;        // Opcional (puede ser calvo)
    hairBack?: string;         // Opcional
    hairTop?: string;          // Opcional
    hairSides?: string;        // Opcional
    facialHair?: string;       // Opcional (barba/bigote)

    // CUERPO BASE
    torso: string;             // ID: "torso_average_01"
    arms: string;              // ID: "arms_slim_01"
    legs: string;              // ID: "legs_average_01"

    // ROPA
    tShirt?: string;           // Opcional (remera/camiseta manga corta)
    shirt?: string;            // Opcional (camisa manga larga)
    jacket?: string;           // Opcional (chaqueta/campera)
    vest?: string;             // Opcional (chaleco)
    dressTop?: string;         // Opcional (excluye shirt/jacket)
    pants?: string;            // Opcional (pantalones)
    skirt?: string;            // Opcional (excluye pants)
    dressBottom?: string;      // Opcional (excluye pants/skirt)

    // ACCESORIOS
    glasses?: string;          // Opcional (lentes)
    hat?: string;              // Opcional (sombrero/gorra)
    necklace?: string;         // Opcional (collar)
    earrings?: string;         // Opcional (aretes)
    gloves?: string;           // Opcional (guantes)
    shoes?: string;            // Opcional (zapatos/zapatillas)
    boots?: string;            // Opcional (botas, excluye shoes)

    // EXTRAS
    tattoo?: string;           // Opcional
    scars?: string;            // Opcional
    makeup?: string;           // Opcional
  };

  // METADATA
  style: ComponentStyle;       // Estilo consistente para todos los componentes
  version: number;             // Versión del sistema (para migraciones)
  generatedAt: string;         // Timestamp ISO
}

// ============================================================================
// VALIDACIÓN ZOD
// ============================================================================

export const BodyGenesSchema = z.object({
  height: z.enum(['very_short', 'short', 'average', 'tall', 'very_tall']),
  build: z.enum(['slim', 'athletic', 'average', 'muscular', 'heavy']),
  armModel: z.enum(['classic', 'slim']),
  chest: z.enum(['flat', 'small', 'medium', 'large']),
  hips: z.enum(['narrow', 'average', 'wide']),
  shoulders: z.enum(['narrow', 'average', 'broad']),
  headSize: z.enum(['small', 'normal', 'large']),
  legLength: z.enum(['short', 'normal', 'long']),
});

export const FacialGenesSchema = z.object({
  faceShape: z.enum(['round', 'oval', 'square', 'heart', 'diamond']),
  eyeSize: z.enum(['small', 'medium', 'large']),
  eyeSpacing: z.enum(['close', 'normal', 'wide']),
  noseSize: z.enum(['small', 'medium', 'large']),
  mouthWidth: z.enum(['narrow', 'normal', 'wide']),
  jawline: z.enum(['soft', 'normal', 'defined']),
  eyeExpression: z.enum(['neutral', 'happy', 'sad', 'angry', 'surprised']),
  mouthExpression: z.enum(['neutral', 'smile', 'frown', 'smirk']),
});

export const ColorPaletteSchema = z.object({
  skinTone: z.string().regex(/^#[0-9A-F]{6}$/i),
  skinShadow: z.string().regex(/^#[0-9A-F]{6}$/i),
  skinHighlight: z.string().regex(/^#[0-9A-F]{6}$/i),
  hairPrimary: z.string().regex(/^#[0-9A-F]{6}$/i),
  hairSecondary: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  eyeColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  eyeWhite: z.string().regex(/^#[0-9A-F]{6}$/i),
  eyePupil: z.string().regex(/^#[0-9A-F]{6}$/i),
  clothingPrimary: z.string().regex(/^#[0-9A-F]{6}$/i),
  clothingSecondary: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  clothingAccent: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  lipstick: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  blush: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

export const SkinConfigurationSchema = z.object({
  bodyGenes: BodyGenesSchema,
  facialGenes: FacialGenesSchema,
  colors: ColorPaletteSchema,
  components: z.object({
    eyes: z.string(),
    eyebrows: z.string().optional(),
    nose: z.string().optional(),
    mouth: z.string(),
    ears: z.string().optional(),
    hairFront: z.string().optional(),
    hairBack: z.string().optional(),
    hairTop: z.string().optional(),
    hairSides: z.string().optional(),
    facialHair: z.string().optional(),
    torso: z.string(),
    arms: z.string(),
    legs: z.string(),
    tShirt: z.string().optional(),
    shirt: z.string().optional(),
    jacket: z.string().optional(),
    vest: z.string().optional(),
    dressTop: z.string().optional(),
    pants: z.string().optional(),
    skirt: z.string().optional(),
    dressBottom: z.string().optional(),
    glasses: z.string().optional(),
    hat: z.string().optional(),
    necklace: z.string().optional(),
    earrings: z.string().optional(),
    gloves: z.string().optional(),
    shoes: z.string().optional(),
    boots: z.string().optional(),
    tattoo: z.string().optional(),
    scars: z.string().optional(),
    makeup: z.string().optional(),
  }),
  style: z.nativeEnum(ComponentStyle),
  version: z.number(),
  generatedAt: z.string(),
});

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Ajusta luminosidad de un color hex
 */
export function adjustLuminosity(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + ((num >> 16) & 0xff) * percent / 100));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + ((num >> 8) & 0xff) * percent / 100));
  const b = Math.min(255, Math.max(0, (num & 0xff) + (num & 0xff) * percent / 100));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
}

/**
 * Genera paleta de sombras/luces a partir de color base
 */
export function generateSkinPalette(baseSkinTone: string): Pick<ColorPalette, 'skinTone' | 'skinShadow' | 'skinHighlight'> {
  return {
    skinTone: baseSkinTone,
    skinShadow: adjustLuminosity(baseSkinTone, -20),
    skinHighlight: adjustLuminosity(baseSkinTone, 20),
  };
}
