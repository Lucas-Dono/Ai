/**
 * Showcase de Peinados en Skins Completas
 * Genera ejemplos realistas con diferentes combinaciones de cuerpo, ropa y colores
 */

import path from 'path';
import fs from 'fs/promises';
import { assembleSkin } from '@/lib/minecraft/skin-assembler';
import { SkinConfiguration, ComponentStyle } from '@/types/minecraft-skin-components';

const COMPONENTS_DIR = path.join(process.cwd(), 'public/minecraft/components');
const OUTPUT_DIR = path.join(process.cwd(), 'public/minecraft/hairstyle-showcase');

// Paleta de colores de pelo realistas
const HAIR_COLORS = {
  'Negro Azabache': '#1C1C1C',
  'Castaño Oscuro': '#3B2820',
  'Castaño': '#8B4513',
  'Castaño Claro': '#A0522D',
  'Rubio Oscuro': '#B8860B',
  'Rubio': '#DAA520',
  'Rubio Platino': '#E5E4E2',
  'Pelirrojo': '#CD5C5C',
  'Rojo Cobre': '#B87333',
  'Gris': '#808080',
  'Blanco': '#E8E8E8',
};

// Tonos de piel variados
const SKIN_TONES = {
  'Pálido': { base: '#FFE0BD', shadow: '#E5C7A1', highlight: '#FFF0D5' },
  'Claro': { base: '#F5D7B1', shadow: '#E5C7A1', highlight: '#FFE7C1' },
  'Medio': { base: '#E0AC69', shadow: '#C68642', highlight: '#F0C18A' },
  'Bronceado': { base: '#D4A574', shadow: '#B8895E', highlight: '#F0C18A' },
  'Oscuro': { base: '#8D5524', shadow: '#6F4518', highlight: '#A0682A' },
  'Muy Oscuro': { base: '#4A2C1A', shadow: '#3B2314', highlight: '#5D3A22' },
};

interface ShowcaseExample {
  name: string;
  description: string;
  config: SkinConfiguration;
}

const showcaseExamples: ShowcaseExample[] = [
  // ===== PEINADOS CORTOS =====
  {
    name: '01_pixie_casual',
    description: 'Pixie Cut - Look casual con remera y jeans',
    config: {
      bodyGenes: {
        height: 'average',
        build: 'slim',
        armModel: 'slim',
        chest: 'small',
        hips: 'average',
        shoulders: 'narrow',
        headSize: 'normal',
        legLength: 'normal',
      },
      facialGenes: {
        faceShape: 'oval',
        eyeSize: 'large',
        eyeSpacing: 'normal',
        noseSize: 'small',
        mouthWidth: 'normal',
        jawline: 'soft',
        eyeExpression: 'happy',
        mouthExpression: 'smile',
      },
      colors: {
        skinTone: SKIN_TONES['Claro'].base,
        skinShadow: SKIN_TONES['Claro'].shadow,
        skinHighlight: SKIN_TONES['Claro'].highlight,
        hairPrimary: HAIR_COLORS['Rubio Oscuro'],
        eyeColor: '#87CEEB',
        eyeWhite: '#FFFFFF',
        eyePupil: '#000000',
        clothingPrimary: '#1A1A1A', // Remera rosa
        clothingSecondary: '#4169E1', // Jeans azul
      },
      components: {
        eyes: 'eyes_03',
        mouth: 'mouth_01',
        torso: 'torso_slim_01',
        arms: 'arms_slim_01',
        legs: 'legs_average_01',
        hairFront: 'hair_short_01_pixie',
        tShirt: 't_shirt_03',
        pants: 'pants_01',
        shoes: 'shoes_01',
      },
      style: ComponentStyle.PIXEL,
      version: 1,
      generatedAt: new Date().toISOString(),
    },
  },
  {
    name: '02_bob_professional',
    description: 'Bob Cut - Look profesional con camisa y pantalones formales',
    config: {
      bodyGenes: {
        height: 'average',
        build: 'slim',
        armModel: 'slim',
        chest: 'medium',
        hips: 'average',
        shoulders: 'average',
        headSize: 'normal',
        legLength: 'normal',
      },
      facialGenes: {
        faceShape: 'oval',
        eyeSize: 'medium',
        eyeSpacing: 'normal',
        noseSize: 'medium',
        mouthWidth: 'normal',
        jawline: 'normal',
        eyeExpression: 'neutral',
        mouthExpression: 'neutral',
      },
      colors: {
        skinTone: SKIN_TONES['Medio'].base,
        skinShadow: SKIN_TONES['Medio'].shadow,
        skinHighlight: SKIN_TONES['Medio'].highlight,
        hairPrimary: HAIR_COLORS['Castaño Oscuro'],
        eyeColor: '#654321',
        eyeWhite: '#FFFFFF',
        eyePupil: '#000000',
        clothingPrimary: '#FFFFFF', // Camisa blanca
        clothingSecondary: '#2C3E50', // Pantalones gris oscuro
      },
      components: {
        eyes: 'eyes_02',
        mouth: 'mouth_02',
        torso: 'torso_slim_01',
        arms: 'arms_slim_01',
        legs: 'legs_average_01',
        hairFront: 'hair_short_02_bob',
        shirt: 'shirt_01',
        pants: 'pants_01',
        shoes: 'shoes_02',
      },
      style: ComponentStyle.PIXEL,
      version: 1,
      generatedAt: new Date().toISOString(),
    },
  },
  {
    name: '03_buzz_athletic',
    description: 'Buzz Cut - Look atlético deportivo',
    config: {
      bodyGenes: {
        height: 'tall',
        build: 'athletic',
        armModel: 'classic',
        chest: 'flat',
        hips: 'narrow',
        shoulders: 'broad',
        headSize: 'normal',
        legLength: 'long',
      },
      facialGenes: {
        faceShape: 'square',
        eyeSize: 'medium',
        eyeSpacing: 'wide',
        noseSize: 'medium',
        mouthWidth: 'normal',
        jawline: 'defined',
        eyeExpression: 'neutral',
        mouthExpression: 'neutral',
      },
      colors: {
        skinTone: SKIN_TONES['Bronceado'].base,
        skinShadow: SKIN_TONES['Bronceado'].shadow,
        skinHighlight: SKIN_TONES['Bronceado'].highlight,
        hairPrimary: HAIR_COLORS['Negro Azabache'],
        eyeColor: '#654321',
        eyeWhite: '#FFFFFF',
        eyePupil: '#000000',
        clothingPrimary: '#FF4500', // Remera deportiva naranja
        clothingSecondary: '#000000', // Pantalones negros
      },
      components: {
        headBase: 'head_buzz_cut', // HEAD con pelo rapado pintado directamente
        eyes: 'eyes_01',
        mouth: 'mouth_02',
        torso: 'torso_athletic_01',
        arms: 'arms_classic_01',
        legs: 'legs_long_01',
        hairFront: 'hair_short_03_buzz', // HAT layer casi vacío (solo líneas)
        tShirt: 't_shirt_02',
        pants: 'pants_01',
        shoes: 'shoes_01',
      },
      style: ComponentStyle.PIXEL,
      version: 1,
      generatedAt: new Date().toISOString(),
    },
  },
  {
    name: '04_undercut_modern',
    description: 'Undercut - Look moderno urbano con chaqueta',
    config: {
      bodyGenes: {
        height: 'tall',
        build: 'athletic',
        armModel: 'classic',
        chest: 'flat',
        hips: 'narrow',
        shoulders: 'broad',
        headSize: 'normal',
        legLength: 'long',
      },
      facialGenes: {
        faceShape: 'square',
        eyeSize: 'medium',
        eyeSpacing: 'normal',
        noseSize: 'medium',
        mouthWidth: 'normal',
        jawline: 'defined',
        eyeExpression: 'neutral',
        mouthExpression: 'neutral',
      },
      colors: {
        skinTone: SKIN_TONES['Claro'].base,
        skinShadow: SKIN_TONES['Claro'].shadow,
        skinHighlight: SKIN_TONES['Claro'].highlight,
        hairPrimary: HAIR_COLORS['Castaño'],
        eyeColor: '#228B22',
        eyeWhite: '#FFFFFF',
        eyePupil: '#000000',
        clothingPrimary: '#1A1A2E', // Chaqueta negra
        clothingSecondary: '#2C3E50', // Pantalones oscuros
      },
      components: {
        eyes: 'eyes_01',
        mouth: 'mouth_02',
        torso: 'torso_athletic_01',
        arms: 'arms_classic_01',
        legs: 'legs_long_01',
        hairFront: 'hair_short_06_undercut',
        tShirt: 't_shirt_01',
        jacket: 'jacket_01',
        pants: 'pants_01',
        shoes: 'shoes_02',
      },
      style: ComponentStyle.PIXEL,
      version: 1,
      generatedAt: new Date().toISOString(),
    },
  },

  // ===== PEINADOS MEDIOS =====
  {
    name: '05_lob_chic',
    description: 'Lob - Look chic casual',
    config: {
      bodyGenes: {
        height: 'average',
        build: 'slim',
        armModel: 'slim',
        chest: 'medium',
        hips: 'average',
        shoulders: 'narrow',
        headSize: 'normal',
        legLength: 'normal',
      },
      facialGenes: {
        faceShape: 'oval',
        eyeSize: 'large',
        eyeSpacing: 'normal',
        noseSize: 'small',
        mouthWidth: 'normal',
        jawline: 'soft',
        eyeExpression: 'happy',
        mouthExpression: 'smile',
      },
      colors: {
        skinTone: SKIN_TONES['Claro'].base,
        skinShadow: SKIN_TONES['Claro'].shadow,
        skinHighlight: SKIN_TONES['Claro'].highlight,
        hairPrimary: HAIR_COLORS['Rubio'],
        eyeColor: '#4169E1',
        eyeWhite: '#FFFFFF',
        eyePupil: '#000000',
        clothingPrimary: '#FFB6C1', // Remera rosa pastel
        clothingSecondary: '#4682B4', // Jeans azul acero
      },
      components: {
        headBase: 'head_female_01',  // Cara femenina limpia (sin ojos/boca)
        eyes: 'eyes_female_01',      // Ojos grandes del backup
        mouth: 'mouth_empty',  // Sin boca
        torso: 'torso_slim_01',
        arms: 'arms_slim_01',
        legs: 'legs_average_01',
        hairFront: 'hair_medium_01_lob',
        shirt: 'dress_vneck_female_01',  // Outfit completo: escote V + mangas largas + minifalda + zapatos
      },
      style: ComponentStyle.PIXEL,
      version: 1,
      generatedAt: new Date().toISOString(),
    },
  },
  {
    name: '06_shag_bohemian',
    description: 'Shag - Look bohemio con capas',
    config: {
      bodyGenes: {
        height: 'average',
        build: 'slim',
        armModel: 'slim',
        chest: 'medium',
        hips: 'average',
        shoulders: 'narrow',
        headSize: 'normal',
        legLength: 'normal',
      },
      facialGenes: {
        faceShape: 'oval',
        eyeSize: 'large',
        eyeSpacing: 'normal',
        noseSize: 'medium',
        mouthWidth: 'normal',
        jawline: 'soft',
        eyeExpression: 'happy',
        mouthExpression: 'smile',
      },
      colors: {
        skinTone: SKIN_TONES['Medio'].base,
        skinShadow: SKIN_TONES['Medio'].shadow,
        skinHighlight: SKIN_TONES['Medio'].highlight,
        hairPrimary: HAIR_COLORS['Castaño Claro'],
        eyeColor: '#8B7355',
        eyeWhite: '#FFFFFF',
        eyePupil: '#000000',
        clothingPrimary: '#DEB887', // Remera beige
        clothingSecondary: '#8B4513', // Pantalones marrones
      },
      components: {
        eyes: 'eyes_01',
        mouth: 'mouth_01',
        torso: 'torso_slim_01',
        arms: 'arms_slim_01',
        legs: 'legs_average_01',
        hairFront: 'hair_medium_03_shag',
        tShirt: 't_shirt_01',
        pants: 'pants_01',
        shoes: 'shoes_01',
      },
      style: ComponentStyle.PIXEL,
      version: 1,
      generatedAt: new Date().toISOString(),
    },
  },

  // ===== PEINADOS LARGOS =====
  {
    name: '07_long_straight_elegant',
    description: 'Pelo Largo Liso - Extraído de backup con look oscuro',
    config: {
      bodyGenes: {
        height: 'average',
        build: 'slim',
        armModel: 'slim',
        chest: 'medium',
        hips: 'average',
        shoulders: 'narrow',
        headSize: 'normal',
        legLength: 'normal',
      },
      facialGenes: {
        faceShape: 'oval',
        eyeSize: 'medium',
        eyeSpacing: 'normal',
        noseSize: 'small',
        mouthWidth: 'normal',
        jawline: 'soft',
        eyeExpression: 'neutral',
        mouthExpression: 'neutral',
      },
      colors: {
        // Piel rosada del backup
        skinTone: '#caac9b',
        skinShadow: '#b4877a',
        skinHighlight: '#c29d8c',
        // Pelo oscuro/gris del backup (no se recolorea, usa colores originales)
        hairPrimary: '#313131',
        // Ojos oscuros
        eyeColor: '#292929',
        eyeWhite: '#FFFFFF',
        eyePupil: '#000000',
        // Vestimenta gris oscura del backup
        clothingPrimary: '#716565', // Suéter gris
        clothingSecondary: '#4c4b4b', // Pantalones oscuros
      },
      components: {
        eyes: 'eyes_female_01',
        mouth: 'mouth_empty',
        torso: 'torso_slim_01',
        arms: 'arms_slim_01',
        legs: 'legs_average_01',
        hairFront: 'hair_long_straight_07',
        hairBody: 'hair_body_long_07',
        tShirt: 't_shirt_01',
        pants: 'pants_01',
        shoes: 'shoes_01',
      },
      style: ComponentStyle.PIXEL,
      version: 1,
      generatedAt: new Date().toISOString(),
    },
  },
  {
    name: '08_long_wavy_romantic',
    description: 'Pelo Largo Ondulado - Look romántico',
    config: {
      bodyGenes: {
        height: 'average',
        build: 'slim',
        armModel: 'slim',
        chest: 'medium',
        hips: 'average',
        shoulders: 'narrow',
        headSize: 'normal',
        legLength: 'normal',
      },
      facialGenes: {
        faceShape: 'oval',
        eyeSize: 'large',
        eyeSpacing: 'normal',
        noseSize: 'small',
        mouthWidth: 'normal',
        jawline: 'soft',
        eyeExpression: 'happy',
        mouthExpression: 'smile',
      },
      colors: {
        skinTone: SKIN_TONES['Pálido'].base,
        skinShadow: SKIN_TONES['Pálido'].shadow,
        skinHighlight: SKIN_TONES['Pálido'].highlight,
        hairPrimary: HAIR_COLORS['Pelirrojo'],
        eyeColor: '#228B22',
        eyeWhite: '#FFFFFF',
        eyePupil: '#000000',
        clothingPrimary: '#FFB6C1', // Remera rosa claro
        clothingSecondary: '#87CEEB', // Pantalones azul cielo
      },
      components: {
        eyes: 'eyes_03',
        mouth: 'mouth_01',
        torso: 'torso_slim_01',
        arms: 'arms_slim_01',
        legs: 'legs_average_01',
        hairFront: 'hair_long_02_wavy',
        hairBody: 'hair_long_body_02_wavy',
        shirt: 'outfit_wavy_sleeves_01',
        pants: 'pants_01',
        shoes: 'shoes_01',
      },
      style: ComponentStyle.PIXEL,
      version: 1,
      generatedAt: new Date().toISOString(),
    },
  },
  {
    name: '09_long_wavy_professional',
    description: 'Pelo Rojo Rizado - Extraído de backup estilo femenino',
    config: {
      bodyGenes: {
        height: 'average',
        build: 'slim',
        armModel: 'slim',
        chest: 'medium',
        hips: 'average',
        shoulders: 'narrow',
        headSize: 'normal',
        legLength: 'normal',
      },
      facialGenes: {
        faceShape: 'oval',
        eyeSize: 'large',
        eyeSpacing: 'normal',
        noseSize: 'small',
        mouthWidth: 'normal',
        jawline: 'soft',
        eyeExpression: 'happy',
        mouthExpression: 'neutral',
      },
      colors: {
        // Piel clara del backup
        skinTone: '#ffd6ba',
        skinShadow: '#ffceb2',
        skinHighlight: '#f7baa1',
        // Pelo rojo borgoña (no se recolorea)
        hairPrimary: '#913e39',
        // Ojos azules del backup
        eyeColor: '#486685',
        eyeWhite: '#f5f4f2',
        eyePupil: '#26131c',
        // Ropa roja/oscura
        clothingPrimary: '#b52d3b',
        clothingSecondary: '#371c25',
      },
      components: {
        eyes: 'eyes_female_01',
        mouth: 'mouth_empty',
        torso: 'torso_slim_01',
        arms: 'arms_slim_01',
        legs: 'legs_average_01',
        hairFront: 'hair_curly_red_09',
        hairBody: 'hair_body_curly_09',
        tShirt: 't_shirt_01',
        pants: 'pants_01',
        shoes: 'shoes_01',
      },
      style: ComponentStyle.PIXEL,
      version: 1,
      generatedAt: new Date().toISOString(),
    },
  },

  // ===== PEINADOS RECOGIDOS =====
  {
    name: '10_ponytail_sporty',
    description: 'Colita Alta - Look deportivo',
    config: {
      bodyGenes: {
        height: 'tall',
        build: 'athletic',
        armModel: 'slim',
        chest: 'medium',
        hips: 'average',
        shoulders: 'average',
        headSize: 'normal',
        legLength: 'long',
      },
      facialGenes: {
        faceShape: 'oval',
        eyeSize: 'large',
        eyeSpacing: 'normal',
        noseSize: 'small',
        mouthWidth: 'normal',
        jawline: 'soft',
        eyeExpression: 'happy',
        mouthExpression: 'smile',
      },
      colors: {
        skinTone: SKIN_TONES['Claro'].base,
        skinShadow: SKIN_TONES['Claro'].shadow,
        skinHighlight: SKIN_TONES['Claro'].highlight,
        hairPrimary: HAIR_COLORS['Castaño'],
        eyeColor: '#4169E1',
        eyeWhite: '#FFFFFF',
        eyePupil: '#000000',
        clothingPrimary: '#FF6347', // Remera deportiva roja
        clothingSecondary: '#000000', // Pantalones negros
      },
      components: {
        eyes: 'eyes_03',
        mouth: 'mouth_01',
        torso: 'torso_athletic_01',
        arms: 'arms_slim_01',
        legs: 'legs_long_01',
        hairBack: 'hair_updo_01_high_ponytail',
        tShirt: 't_shirt_02',
        pants: 'pants_01',
        shoes: 'shoes_01',
      },
      style: ComponentStyle.PIXEL,
      version: 1,
      generatedAt: new Date().toISOString(),
    },
  },
  {
    name: '11_black_hair_green_outfit',
    description: 'Pelo Negro Corto - Extraído de backup con outfit verde',
    config: {
      bodyGenes: {
        height: 'average',
        build: 'slim',
        armModel: 'slim',
        chest: 'small',
        hips: 'average',
        shoulders: 'narrow',
        headSize: 'normal',
        legLength: 'normal',
      },
      facialGenes: {
        faceShape: 'oval',
        eyeSize: 'large',
        eyeSpacing: 'normal',
        noseSize: 'small',
        mouthWidth: 'normal',
        jawline: 'soft',
        eyeExpression: 'happy',
        mouthExpression: 'smile',
      },
      colors: {
        skinTone: '#ffe2bd', // Piel del backup
        skinShadow: '#e6c9a8',
        skinHighlight: '#fff0e0',
        hairPrimary: '#242424', // Pelo negro del backup
        eyeColor: '#461f00', // Iris marrón
        eyeWhite: '#FFFFFF',
        eyePupil: '#321600',
        clothingPrimary: '#5aa163', // Verde del backup
        clothingSecondary: '#498250',
      },
      components: {
        eyes: 'eyes_expressive_11',
        mouth: 'mouth_empty',
        torso: 'torso_slim_01',
        arms: 'arms_slim_01',
        legs: 'legs_average_01',
        hairFront: 'hair_black_short_11',
        shirt: 'outfit_green_11', // Outfit completo extraído del backup
      },
      style: ComponentStyle.PIXEL,
      version: 1,
      generatedAt: new Date().toISOString(),
    },
  },

  // ===== VARIACIONES ADICIONALES CON DISTINTOS TONOS DE PIEL =====
  {
    name: '12_bob_darkskin',
    description: 'Bob Cut - Extraído de backup con piel oscura y ojos verdes',
    config: {
      bodyGenes: {
        height: 'average',
        build: 'slim',
        armModel: 'slim',
        chest: 'medium',
        hips: 'average',
        shoulders: 'narrow',
        headSize: 'normal',
        legLength: 'normal',
      },
      facialGenes: {
        faceShape: 'oval',
        eyeSize: 'large',
        eyeSpacing: 'normal',
        noseSize: 'small',
        mouthWidth: 'normal',
        jawline: 'soft',
        eyeExpression: 'happy',
        mouthExpression: 'smile',
      },
      colors: {
        // Piel oscura del backup
        skinTone: '#cf9b86',
        skinShadow: '#ba6d4f',
        skinHighlight: '#d6aa98',
        // Pelo marrón oscuro del backup
        hairPrimary: '#69453f',
        // Ojos verdes del backup
        eyeColor: '#7d8a58',
        eyeWhite: '#e4d5cb',
        eyePupil: '#49302b',
        // Ropa del backup (blanco/crema + marrón)
        clothingPrimary: '#e0d5d1',
        clothingSecondary: '#69453f',
      },
      components: {
        // Usar body completo como headBase (incluye toda la skin base)
        headBase: 'body_bob_13',
        eyes: 'eyes_bob_13',
        mouth: 'mouth_empty',
        torso: 'torso_empty',
        arms: 'arms_empty',
        legs: 'legs_empty',
        hairFront: 'hair_bob_13',
        shirt: 'outfit_bob_13', // Outfit completo extraído del backup
      },
      style: ComponentStyle.PIXEL,
      version: 1,
      generatedAt: new Date().toISOString(),
    },
  },
  {
    name: '13_caesar_classic',
    description: 'Caesar Cut - Pelo rapado pintado en capa base (sin overlay)',
    config: {
      bodyGenes: {
        height: 'tall',
        build: 'athletic',
        armModel: 'classic',
        chest: 'flat',
        hips: 'narrow',
        shoulders: 'broad',
        headSize: 'normal',
        legLength: 'long',
      },
      facialGenes: {
        faceShape: 'square',
        eyeSize: 'medium',
        eyeSpacing: 'wide',
        noseSize: 'medium',
        mouthWidth: 'normal',
        jawline: 'defined',
        eyeExpression: 'neutral',
        mouthExpression: 'neutral',
      },
      colors: {
        skinTone: SKIN_TONES['Medio'].base,
        skinShadow: SKIN_TONES['Medio'].shadow,
        skinHighlight: SKIN_TONES['Medio'].highlight,
        hairPrimary: HAIR_COLORS['Castaño Oscuro'],
        eyeColor: '#654321',
        eyeWhite: '#FFFFFF',
        eyePupil: '#000000',
        clothingPrimary: '#FFFFFF', // Camisa blanca
        clothingSecondary: '#2C3E50', // Pantalones formales
      },
      components: {
        headBase: 'head_caesar_13', // Cabeza con pelo rapado pintado directamente
        eyes: 'eyes_01',
        mouth: 'mouth_02',
        torso: 'torso_athletic_01',
        arms: 'arms_classic_01',
        legs: 'legs_long_01',
        // Sin hairFront - el pelo está en la capa base
        shirt: 'shirt_01',
        pants: 'pants_01',
        shoes: 'shoes_02',
      },
      style: ComponentStyle.PIXEL,
      version: 1,
      generatedAt: new Date().toISOString(),
    },
  },
  {
    name: '14_goth_long_black',
    description: 'Pelo Negro Largo - Extraído de backup estilo gótico/formal',
    config: {
      bodyGenes: {
        height: 'average',
        build: 'slim',
        armModel: 'slim',
        chest: 'medium',
        hips: 'average',
        shoulders: 'narrow',
        headSize: 'normal',
        legLength: 'normal',
      },
      facialGenes: {
        faceShape: 'oval',
        eyeSize: 'large',
        eyeSpacing: 'normal',
        noseSize: 'small',
        mouthWidth: 'normal',
        jawline: 'soft',
        eyeExpression: 'neutral',
        mouthExpression: 'neutral',
      },
      colors: {
        // Piel muy pálida del backup
        skinTone: '#f9e7e0',
        skinShadow: '#fadad4',
        skinHighlight: '#ffffff',
        // Pelo negro del backup
        hairPrimary: '#2f2f2f',
        // Ojos claros/grises del backup
        eyeColor: '#908699',
        eyeWhite: '#e1e1e1',
        eyePupil: '#1a1a1a',
        // Outfit negro del backup
        clothingPrimary: '#2f2f2f',
        clothingSecondary: '#1a1a1a',
      },
      components: {
        // Usar body completo como headBase
        headBase: 'body_goth_14',
        eyes: 'eyes_goth_14',
        mouth: 'mouth_empty',
        torso: 'torso_empty',
        arms: 'arms_empty',
        legs: 'legs_empty',
        hairFront: 'hair_long_black_14',
        shirt: 'outfit_goth_14', // Outfit completo extraído del backup
      },
      style: ComponentStyle.PIXEL,
      version: 1,
      generatedAt: new Date().toISOString(),
    },
  },
  {
    name: '15_messy_bun_casual',
    description: 'Moño Desprolijo - Extraído de backup con outfit rosado',
    config: {
      bodyGenes: {
        height: 'average',
        build: 'slim',
        armModel: 'slim',
        chest: 'small',
        hips: 'average',
        shoulders: 'narrow',
        headSize: 'normal',
        legLength: 'normal',
      },
      facialGenes: {
        faceShape: 'oval',
        eyeSize: 'large',
        eyeSpacing: 'normal',
        noseSize: 'small',
        mouthWidth: 'normal',
        jawline: 'soft',
        eyeExpression: 'happy',
        mouthExpression: 'smile',
      },
      colors: {
        skinTone: '#faccae', // Piel del backup
        skinShadow: '#f8b796',
        skinHighlight: '#ffd6c0',
        hairPrimary: '#b7701f', // Pelo castaño/naranja del backup
        eyeColor: '#b57640', // Iris marrón
        eyeWhite: '#FFFFFF',
        eyePupil: '#5f432b',
        clothingPrimary: '#f7a6c3', // Rosa del backup
        clothingSecondary: '#e895b2',
      },
      components: {
        headBase: 'head_base_peach', // Tono melocotón del backup
        eyes: 'eyes_cute_12',
        mouth: 'mouth_empty',
        torso: 'torso_empty',
        arms: 'arms_empty',
        legs: 'legs_empty',
        hairFront: 'hair_messy_bun_12',
        shirt: 'outfit_pink_12', // Outfit completo con piel incluida
      },
      style: ComponentStyle.PIXEL,
      version: 1,
      generatedAt: new Date().toISOString(),
    },
  },
];

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  SHOWCASE DE PEINADOS EN SKINS COMPLETAS');
  console.log('═══════════════════════════════════════════════════════\n');

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let successCount = 0;
  let failCount = 0;

  for (const example of showcaseExamples) {
    try {
      console.log(`📝 Generando: ${example.name}`);
      console.log(`   ${example.description}`);

      const skinBuffer = await assembleSkin(example.config, COMPONENTS_DIR);
      await fs.writeFile(path.join(OUTPUT_DIR, `${example.name}.png`), skinBuffer);

      console.log(`   ✓ Generado exitosamente\n`);
      successCount++;
    } catch (error) {
      console.error(`   ✗ Error: ${error instanceof Error ? error.message : String(error)}\n`);
      failCount++;
    }
  }

  // Resumen final
  console.log('═══════════════════════════════════════════════════════');
  console.log('  ✨ SHOWCASE COMPLETADO');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log(`📁 Skins guardadas en: ${OUTPUT_DIR}\n`);

  console.log('📊 Resultados:');
  console.log(`   ✓ Exitosos: ${successCount}`);
  console.log(`   ✗ Fallidos: ${failCount}`);
  console.log(`   📦 Total: ${showcaseExamples.length}\n`);

  console.log('🎨 Variedad demostrada:');
  console.log('   - 14 skins completas con diferentes peinados');
  console.log('   - 6 tonos de piel distintos');
  console.log('   - 11 colores de pelo diferentes');
  console.log('   - Múltiples estilos de ropa (casual, formal, deportivo)');
  console.log('   - Diferentes tipos de cuerpo (slim, athletic)');
  console.log('   - Combinaciones de accesorios (lentes, zapatos, chaquetas)\n');

  console.log('📸 Ejemplos incluidos:');
  console.log('   Cortos: Pixie, Bob, Buzz, Undercut, Caesar, Slicked Back');
  console.log('   Medios: Lob, Shag');
  console.log('   Largos: Straight, Wavy (con variaciones)');
  console.log('   Recogidos: High Ponytail, Messy Bun\n');
}

main().catch(console.error);
