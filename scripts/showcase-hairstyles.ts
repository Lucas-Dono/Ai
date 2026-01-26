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
        eyes: 'eyes_03',
        mouth: 'mouth_01',
        torso: 'torso_slim_01',
        arms: 'arms_slim_01',
        legs: 'legs_average_01',
        hairFront: 'hair_medium_01_lob',
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
        eyes: 'eyes_02',
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
    description: 'Pelo Largo Liso - Look elegante con camisa',
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
        skinTone: SKIN_TONES['Oscuro'].base,
        skinShadow: SKIN_TONES['Oscuro'].shadow,
        skinHighlight: SKIN_TONES['Oscuro'].highlight,
        hairPrimary: HAIR_COLORS['Negro Azabache'],
        eyeColor: '#654321',
        eyeWhite: '#FFFFFF',
        eyePupil: '#000000',
        clothingPrimary: '#E6E6FA', // Camisa lavanda
        clothingSecondary: '#2C3E50', // Pantalones gris oscuro
      },
      components: {
        eyes: 'eyes_02',
        mouth: 'mouth_01',
        torso: 'torso_slim_01',
        arms: 'arms_slim_01',
        legs: 'legs_average_01',
        hairFront: 'hair_long_01_straight',
        hairBody: 'hair_long_body_01_straight',
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
    description: 'Pelo Largo Ondulado - Look profesional con chaqueta',
    config: {
      bodyGenes: {
        height: 'average',
        build: 'athletic',
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
        skinTone: SKIN_TONES['Bronceado'].base,
        skinShadow: SKIN_TONES['Bronceado'].shadow,
        skinHighlight: SKIN_TONES['Bronceado'].highlight,
        hairPrimary: HAIR_COLORS['Castaño'],
        eyeColor: '#654321',
        eyeWhite: '#FFFFFF',
        eyePupil: '#000000',
        clothingPrimary: '#2C3E50', // Chaqueta gris oscuro
        clothingSecondary: '#34495E', // Pantalones gris
      },
      components: {
        eyes: 'eyes_02',
        mouth: 'mouth_02',
        torso: 'torso_athletic_01',
        arms: 'arms_slim_01',
        legs: 'legs_average_01',
        hairFront: 'hair_long_02_wavy',
        hairBody: 'hair_long_body_02_wavy',
        tShirt: 't_shirt_01',
        jacket: 'jacket_01',
        pants: 'pants_01',
        shoes: 'shoes_02',
        glasses: 'glasses_01',
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
    name: '11_messy_bun_casual',
    description: 'Moño Desprolijo - Look casual bohemio',
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
        skinTone: SKIN_TONES['Pálido'].base,
        skinShadow: SKIN_TONES['Pálido'].shadow,
        skinHighlight: SKIN_TONES['Pálido'].highlight,
        hairPrimary: HAIR_COLORS['Rubio Platino'],
        eyeColor: '#87CEEB',
        eyeWhite: '#FFFFFF',
        eyePupil: '#000000',
        clothingPrimary: '#F0E68C', // Remera amarillo pastel
        clothingSecondary: '#DEB887', // Pantalones beige
      },
      components: {
        eyes: 'eyes_03',
        mouth: 'mouth_01',
        torso: 'torso_slim_01',
        arms: 'arms_slim_01',
        legs: 'legs_average_01',
        hairBack: 'hair_updo_05_messy_bun',
        tShirt: 't_shirt_01',
        pants: 'pants_01',
        shoes: 'shoes_01',
      },
      style: ComponentStyle.PIXEL,
      version: 1,
      generatedAt: new Date().toISOString(),
    },
  },

  // ===== VARIACIONES ADICIONALES CON DISTINTOS TONOS DE PIEL =====
  {
    name: '12_bob_darkskin',
    description: 'Bob Cut - Piel oscura con look profesional',
    config: {
      bodyGenes: {
        height: 'average',
        build: 'athletic',
        armModel: 'slim',
        chest: 'medium',
        hips: 'average',
        shoulders: 'average',
        headSize: 'normal',
        legLength: 'normal',
      },
      facialGenes: {
        faceShape: 'oval',
        eyeSize: 'large',
        eyeSpacing: 'normal',
        noseSize: 'medium',
        mouthWidth: 'normal',
        jawline: 'normal',
        eyeExpression: 'happy',
        mouthExpression: 'smile',
      },
      colors: {
        skinTone: SKIN_TONES['Muy Oscuro'].base,
        skinShadow: SKIN_TONES['Muy Oscuro'].shadow,
        skinHighlight: SKIN_TONES['Muy Oscuro'].highlight,
        hairPrimary: HAIR_COLORS['Negro Azabache'],
        eyeColor: '#654321',
        eyeWhite: '#FFFFFF',
        eyePupil: '#000000',
        clothingPrimary: '#FFFFFF', // Camisa blanca
        clothingSecondary: '#1C1C1C', // Pantalones negros
      },
      components: {
        eyes: 'eyes_02',
        mouth: 'mouth_01',
        torso: 'torso_athletic_01',
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
    name: '13_caesar_classic',
    description: 'Caesar Cut - Look clásico masculino',
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
        eyes: 'eyes_01',
        mouth: 'mouth_02',
        torso: 'torso_athletic_01',
        arms: 'arms_classic_01',
        legs: 'legs_long_01',
        hairFront: 'hair_short_05_caesar',
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
    name: '14_slicked_formal',
    description: 'Slicked Back - Look formal con chaqueta',
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
        hairPrimary: HAIR_COLORS['Negro Azabache'],
        eyeColor: '#4169E1',
        eyeWhite: '#FFFFFF',
        eyePupil: '#000000',
        clothingPrimary: '#1C1C1C', // Chaqueta negra
        clothingSecondary: '#2C3E50', // Pantalones formales
      },
      components: {
        eyes: 'eyes_01',
        mouth: 'mouth_02',
        torso: 'torso_athletic_01',
        arms: 'arms_classic_01',
        legs: 'legs_long_01',
        hairFront: 'hair_short_08_slicked',
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
