/**
 * Migración Manual de Configuraciones Minecraft
 *
 * Este script contiene todas las configuraciones de componentes creadas manualmente
 * para los 51 agentes premium/históricos existentes.
 *
 * NO usa ningún modelo cloud/IA - todas las configuraciones fueron creadas
 * analizando visualmente las imágenes de referencia.
 */

import { PrismaClient } from '@prisma/client';
import { SkinConfiguration, ComponentStyle } from '@/types/minecraft-skin-components';

const prisma = new PrismaClient();

// Configuraciones manuales para los 51 agentes
const MANUAL_CONFIGS: Record<string, SkinConfiguration> = {
  // 1. Ada Lovelace - Mujer, piel clara, pelo castaño recogido con rizos, vestido histórico
  'premium_ada_lovelace': {
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
      skinTone: '#F5E6D3',
      skinShadow: '#E1D2BF',
      skinHighlight: '#FFFAF0',
      hairPrimary: '#6B4423',
      eyeColor: '#654321',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#2C3E90', // Azul histórico
      clothingSecondary: '#E8E8E8',
    },
    components: {
      headBase: 'head_female_01',
      eyes: 'eyes_female_01',
      mouth: 'mouth_empty',
      hairBack: 'hair_updo_01_high_ponytail',
      torso: 'torso_slim_01',
      arms: 'arms_slim_01',
      legs: 'legs_average_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_02',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 2. Albert Einstein - Hombre, piel clara, pelo blanco desordenado, bigote
  'historical_albert_einstein': {
    bodyGenes: {
      height: 'average',
      build: 'average',
      armModel: 'classic',
      chest: 'flat',
      hips: 'narrow',
      shoulders: 'average',
      headSize: 'normal',
      legLength: 'normal',
    },
    facialGenes: {
      faceShape: 'square',
      eyeSize: 'medium',
      eyeSpacing: 'wide',
      noseSize: 'large',
      mouthWidth: 'wide',
      jawline: 'normal',
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: '#F0D5B8',
      skinShadow: '#DCC1A4',
      skinHighlight: '#FFF5E1',
      hairPrimary: '#E8E8E8', // Blanco
      eyeColor: '#6B8E23',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#8B7355',
      clothingSecondary: '#F5F5DC',
    },
    components: {
      headBase: 'head_base_01',
      eyes: 'eyes_01',
      mouth: 'mouth_02',
      hairFront: 'hair_short_06_undercut', // Pelo desordenado
      torso: 'torso_athletic_01',
      arms: 'arms_classic_01',
      legs: 'legs_average_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_01',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 3. Amara Okafor - Mujer, piel oscura, pelo trenzado/updo
  'premium_amara_okafor_designer': {
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
      mouthWidth: 'wide',
      jawline: 'soft',
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: '#8B6F47',
      skinShadow: '#77603D',
      skinHighlight: '#9F8359',
      hairPrimary: '#1C1208',
      eyeColor: '#4A2C1B',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#A0826D',
      clothingSecondary: '#F5F5DC',
    },
    components: {
      headBase: 'head_female_01',
      eyes: 'eyes_female_01',
      mouth: 'mouth_empty',
      hairBack: 'hair_updo_01_high_ponytail',
      torso: 'torso_slim_01',
      arms: 'arms_slim_01',
      legs: 'legs_average_01',
      tShirt: 't_shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_01',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 4. Amelia Earhart - Mujer, piel clara, pelo corto castaño, aviadora
  'premium_amelia_earhart': {
    bodyGenes: {
      height: 'average',
      build: 'athletic',
      armModel: 'slim',
      chest: 'small',
      hips: 'narrow',
      shoulders: 'average',
      headSize: 'normal',
      legLength: 'normal',
    },
    facialGenes: {
      faceShape: 'oval',
      eyeSize: 'medium',
      eyeSpacing: 'normal',
      noseSize: 'small',
      mouthWidth: 'normal',
      jawline: 'defined',
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: '#E8D4BC',
      skinShadow: '#D4C0A8',
      skinHighlight: '#FCE8D0',
      hairPrimary: '#8B6F47',
      eyeColor: '#4A7BA7',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#704214',
      clothingSecondary: '#F5F5DC',
    },
    components: {
      headBase: 'head_female_01',
      eyes: 'eyes_female_01',
      mouth: 'mouth_empty',
      hairFront: 'hair_short_02_bob',
      torso: 'torso_slim_01',
      arms: 'arms_slim_01',
      legs: 'legs_average_01',
      tShirt: 't_shirt_02',
      pants: 'pants_01',
      boots: 'boots_01',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 5. Aria Rosenberg - Mujer, pelo largo ondulado castaño oscuro, terapeuta
  'premium_aria_rosenberg_therapist': {
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
      skinTone: '#E8D4BC',
      skinShadow: '#D4C0A8',
      skinHighlight: '#FCE8D0',
      hairPrimary: '#3D2817',
      eyeColor: '#654321',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#B0C4DE',
      clothingSecondary: '#F5F5F5',
    },
    components: {
      headBase: 'head_female_01',
      eyes: 'eyes_female_01',
      mouth: 'mouth_empty',
      hairFront: 'hair_long_02_wavy',
      hairBody: 'hair_long_body_02_wavy',
      torso: 'torso_slim_01',
      arms: 'arms_slim_01',
      legs: 'legs_average_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_02',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 6. Atlas Stone - Hombre, piel bronceada, pelo corto, barba, montañista
  'premium_atlas_stone_mountaineer': {
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
      jawline: 'strong',
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: '#C89F7C',
      skinShadow: '#B48B68',
      skinHighlight: '#DCB390',
      hairPrimary: '#5C4033',
      eyeColor: '#8B7355',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#5D4E37',
      clothingSecondary: '#36454F',
    },
    components: {
      headBase: 'head_base_01',
      eyes: 'eyes_01',
      mouth: 'mouth_02',
      hairFront: 'hair_short_06_undercut',
      torso: 'torso_athletic_01',
      arms: 'arms_classic_01',
      legs: 'legs_average_01',
      tShirt: 't_shirt_02',
      pants: 'pants_01',
      boots: 'boots_01',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 7. Buda - Hombre, piel morena clara, calvo, vestimenta simple
  'premium_buda_siddhartha_gautama': {
    bodyGenes: {
      height: 'average',
      build: 'slim',
      armModel: 'classic',
      chest: 'flat',
      hips: 'narrow',
      shoulders: 'narrow',
      headSize: 'normal',
      legLength: 'normal',
    },
    facialGenes: {
      faceShape: 'round',
      eyeSize: 'medium',
      eyeSpacing: 'normal',
      noseSize: 'medium',
      mouthWidth: 'normal',
      jawline: 'soft',
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: '#D4A882',
      skinShadow: '#C0946E',
      skinHighlight: '#E8BC96',
      hairPrimary: '#4A3C28',
      eyeColor: '#4A3C28',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#FF8C00',
      clothingSecondary: '#8B4500',
    },
    components: {
      headBase: 'head_base_01',
      eyes: 'eyes_01',
      mouth: 'mouth_02',
      // Sin pelo - calvo
      torso: 'torso_athletic_01',
      arms: 'arms_classic_01',
      legs: 'legs_average_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_01',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 8. Carl Jung - Hombre, piel clara, pelo gris/blanco, analista
  'premium_carl_jung_analyst': {
    bodyGenes: {
      height: 'average',
      build: 'average',
      armModel: 'classic',
      chest: 'flat',
      hips: 'narrow',
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
      skinTone: '#F0D5B8',
      skinShadow: '#DCC1A4',
      skinHighlight: '#FFF5E1',
      hairPrimary: '#D3D3D3',
      eyeColor: '#4682B4',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#2C3E50',
      clothingSecondary: '#ECF0F1',
    },
    components: {
      headBase: 'head_base_01',
      eyes: 'eyes_01',
      mouth: 'mouth_02',
      hairFront: 'hair_short_06_undercut',
      torso: 'torso_athletic_01',
      arms: 'arms_classic_01',
      legs: 'legs_average_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_02',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 9. Charles Darwin - Hombre, piel clara, pelo gris, barba larga
  'premium_charles_darwin': {
    bodyGenes: {
      height: 'average',
      build: 'average',
      armModel: 'classic',
      chest: 'flat',
      hips: 'narrow',
      shoulders: 'average',
      headSize: 'normal',
      legLength: 'normal',
    },
    facialGenes: {
      faceShape: 'oval',
      eyeSize: 'small',
      eyeSpacing: 'normal',
      noseSize: 'large',
      mouthWidth: 'normal',
      jawline: 'normal',
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: '#F5E6D3',
      skinShadow: '#E1D2BF',
      skinHighlight: '#FFFAF0',
      hairPrimary: '#A9A9A9',
      eyeColor: '#708090',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#3C3C3C',
      clothingSecondary: '#F5F5F5',
    },
    components: {
      headBase: 'head_base_01',
      eyes: 'eyes_01',
      mouth: 'mouth_02',
      hairFront: 'hair_short_06_undercut',
      torso: 'torso_athletic_01',
      arms: 'arms_classic_01',
      legs: 'legs_average_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_02',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 10. Cleopatra VII - Mujer, piel morena clara, pelo negro largo, reina egipcia
  'premium_cleopatra_vii': {
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
      skinTone: '#C89F7C',
      skinShadow: '#B48B68',
      skinHighlight: '#DCB390',
      hairPrimary: '#1C1208',
      eyeColor: '#4A3C28',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#FFD700',
      clothingSecondary: '#8B4513',
    },
    components: {
      headBase: 'head_female_01',
      eyes: 'eyes_female_01',
      mouth: 'mouth_empty',
      hairFront: 'hair_long_straight_07',
      hairBody: 'hair_body_long_07',
      torso: 'torso_slim_01',
      arms: 'arms_slim_01',
      legs: 'legs_average_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_02',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 11. Confucio - Hombre, asiático, piel clara, pelo negro, barba larga
  'premium_confucio': {
    bodyGenes: {
      height: 'average',
      build: 'slim',
      armModel: 'classic',
      chest: 'flat',
      hips: 'narrow',
      shoulders: 'narrow',
      headSize: 'normal',
      legLength: 'normal',
    },
    facialGenes: {
      faceShape: 'oval',
      eyeSize: 'small',
      eyeSpacing: 'normal',
      noseSize: 'small',
      mouthWidth: 'normal',
      jawline: 'soft',
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: '#F5D7B1',
      skinShadow: '#E1C39D',
      skinHighlight: '#FFEBC5',
      hairPrimary: '#1C1208',
      eyeColor: '#4A3C28',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#8B4513',
      clothingSecondary: '#F5F5DC',
    },
    components: {
      headBase: 'head_base_01',
      eyes: 'eyes_01',
      mouth: 'mouth_02',
      hairFront: 'hair_short_06_undercut',
      torso: 'torso_athletic_01',
      arms: 'arms_classic_01',
      legs: 'legs_average_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_01',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 12. Dante Rossi - Hombre, italiano, piel clara, pelo negro, chef
  'premium_dante_rossi_chef': {
    bodyGenes: {
      height: 'average',
      build: 'average',
      armModel: 'classic',
      chest: 'flat',
      hips: 'narrow',
      shoulders: 'average',
      headSize: 'normal',
      legLength: 'normal',
    },
    facialGenes: {
      faceShape: 'oval',
      eyeSize: 'medium',
      eyeSpacing: 'normal',
      noseSize: 'medium',
      mouthWidth: 'wide',
      jawline: 'normal',
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: '#F0D5B8',
      skinShadow: '#DCC1A4',
      skinHighlight: '#FFF5E1',
      hairPrimary: '#1C1208',
      eyeColor: '#654321',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#FFFFFF',
      clothingSecondary: '#2C3E50',
    },
    components: {
      headBase: 'head_base_01',
      eyes: 'eyes_01',
      mouth: 'mouth_02',
      hairFront: 'hair_short_06_undercut',
      torso: 'torso_athletic_01',
      arms: 'arms_classic_01',
      legs: 'legs_average_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_01',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 13. Dr. Sebastian Müller - Hombre, piel clara, pelo rubio/castaño claro
  'premium_sebastian_muller': {
    bodyGenes: {
      height: 'average',
      build: 'slim',
      armModel: 'classic',
      chest: 'flat',
      hips: 'narrow',
      shoulders: 'narrow',
      headSize: 'normal',
      legLength: 'normal',
    },
    facialGenes: {
      faceShape: 'oval',
      eyeSize: 'medium',
      eyeSpacing: 'normal',
      noseSize: 'medium',
      mouthWidth: 'normal',
      jawline: 'soft',
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: '#F5E6D3',
      skinShadow: '#E1D2BF',
      skinHighlight: '#FFFAF0',
      hairPrimary: '#C4A572',
      eyeColor: '#4682B4',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#2C3E50',
      clothingSecondary: '#ECF0F1',
    },
    components: {
      headBase: 'head_base_01',
      eyes: 'eyes_01',
      mouth: 'mouth_02',
      hairFront: 'hair_short_06_undercut',
      torso: 'torso_athletic_01',
      arms: 'arms_classic_01',
      legs: 'legs_average_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_02',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 14. Dr. Sigmund Freud - Hombre, piel clara, pelo gris, barba
  'premium_sigmund_freud': {
    bodyGenes: {
      height: 'average',
      build: 'slim',
      armModel: 'classic',
      chest: 'flat',
      hips: 'narrow',
      shoulders: 'narrow',
      headSize: 'normal',
      legLength: 'normal',
    },
    facialGenes: {
      faceShape: 'oval',
      eyeSize: 'small',
      eyeSpacing: 'normal',
      noseSize: 'large',
      mouthWidth: 'normal',
      jawline: 'normal',
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: '#F0D5B8',
      skinShadow: '#DCC1A4',
      skinHighlight: '#FFF5E1',
      hairPrimary: '#A9A9A9',
      eyeColor: '#708090',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#2C3E50',
      clothingSecondary: '#F5F5F5',
    },
    components: {
      headBase: 'head_base_01',
      eyes: 'eyes_01',
      mouth: 'mouth_02',
      hairFront: 'hair_short_06_undercut',
      torso: 'torso_athletic_01',
      arms: 'arms_classic_01',
      legs: 'legs_average_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_02',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 15. Edgar Allan Poe - Hombre, piel pálida, pelo negro, escritor gótico
  'premium_edgar_allan_poe_writer': {
    bodyGenes: {
      height: 'average',
      build: 'slim',
      armModel: 'classic',
      chest: 'flat',
      hips: 'narrow',
      shoulders: 'narrow',
      headSize: 'normal',
      legLength: 'normal',
    },
    facialGenes: {
      faceShape: 'oval',
      eyeSize: 'medium',
      eyeSpacing: 'normal',
      noseSize: 'medium',
      mouthWidth: 'normal',
      jawline: 'defined',
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: '#F5E6D3',
      skinShadow: '#E1D2BF',
      skinHighlight: '#FFFAF0',
      hairPrimary: '#1C1208',
      eyeColor: '#4A3C28',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#000000',
      clothingSecondary: '#2C2C2C',
    },
    components: {
      headBase: 'head_base_01',
      eyes: 'eyes_01',
      mouth: 'mouth_02',
      hairFront: 'hair_short_06_undercut',
      torso: 'torso_athletic_01',
      arms: 'arms_classic_01',
      legs: 'legs_average_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_02',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 16. Ekaterina 'Katya' Volkov - Mujer, piel clara, pelo castaño oscuro en moño
  'premium_katya_ice_queen': {
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
      skinTone: '#F5E6D3',
      skinShadow: '#E1D2BF',
      skinHighlight: '#FFFAF0',
      hairPrimary: '#3D2817',
      eyeColor: '#228B22',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#556B2F',
      clothingSecondary: '#F5F5DC',
    },
    components: {
      headBase: 'head_female_01',
      eyes: 'eyes_female_01',
      mouth: 'mouth_empty',
      hairBack: 'hair_updo_01_high_ponytail',
      torso: 'torso_slim_01',
      arms: 'arms_slim_01',
      legs: 'legs_average_01',
      tShirt: 't_shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_01',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 17. Elena Moreno - Mujer, bióloga marina
  'premium_elena_moreno_marine_biologist': {
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
      noseSize: 'small',
      mouthWidth: 'normal',
      jawline: 'soft',
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: '#D4A882',
      skinShadow: '#C0946E',
      skinHighlight: '#E8BC96',
      hairPrimary: '#4A3C28',
      eyeColor: '#654321',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#4169E1',
      clothingSecondary: '#F0F8FF',
    },
    components: {
      headBase: 'head_female_01',
      eyes: 'eyes_female_01',
      mouth: 'mouth_empty',
      hairFront: 'hair_medium_01_lob',
      torso: 'torso_slim_01',
      arms: 'arms_slim_01',
      legs: 'legs_average_01',
      tShirt: 't_shirt_02',
      pants: 'pants_01',
      shoes: 'shoes_01',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 18. Emily Dickinson - Mujer, poeta, piel clara, pelo castaño recogido
  'premium_emily_dickinson_poet': {
    bodyGenes: {
      height: 'average',
      build: 'slim',
      armModel: 'slim',
      chest: 'small',
      hips: 'narrow',
      shoulders: 'narrow',
      headSize: 'normal',
      legLength: 'normal',
    },
    facialGenes: {
      faceShape: 'oval',
      eyeSize: 'large',
      eyeSpacing: 'normal',
      noseSize: 'small',
      mouthWidth: 'small',
      jawline: 'soft',
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: '#F5E6D3',
      skinShadow: '#E1D2BF',
      skinHighlight: '#FFFAF0',
      hairPrimary: '#6B4423',
      eyeColor: '#654321',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#F5F5DC',
      clothingSecondary: '#8B4513',
    },
    components: {
      headBase: 'head_female_01',
      eyes: 'eyes_female_01',
      mouth: 'mouth_empty',
      hairBack: 'hair_updo_01_high_ponytail',
      torso: 'torso_slim_01',
      arms: 'arms_slim_01',
      legs: 'legs_average_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_02',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 19. Ernest Hemingway - Hombre, escritor, piel clara, pelo gris/blanco
  'premium_ernest_hemingway_writer': {
    bodyGenes: {
      height: 'tall',
      build: 'athletic',
      armModel: 'classic',
      chest: 'flat',
      hips: 'narrow',
      shoulders: 'broad',
      headSize: 'normal',
      legLength: 'normal',
    },
    facialGenes: {
      faceShape: 'square',
      eyeSize: 'medium',
      eyeSpacing: 'normal',
      noseSize: 'large',
      mouthWidth: 'wide',
      jawline: 'strong',
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: '#F0D5B8',
      skinShadow: '#DCC1A4',
      skinHighlight: '#FFF5E1',
      hairPrimary: '#D3D3D3',
      eyeColor: '#708090',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#F5F5DC',
      clothingSecondary: '#8B4513',
    },
    components: {
      headBase: 'head_base_01',
      eyes: 'eyes_01',
      mouth: 'mouth_02',
      hairFront: 'hair_short_06_undercut',
      torso: 'torso_athletic_01',
      arms: 'arms_classic_01',
      legs: 'legs_average_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_01',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 20. Ethan Cross - Hombre, detective
  'premium_ethan_cross_detective': {
    bodyGenes: {
      height: 'average',
      build: 'athletic',
      armModel: 'classic',
      chest: 'flat',
      hips: 'narrow',
      shoulders: 'average',
      headSize: 'normal',
      legLength: 'normal',
    },
    facialGenes: {
      faceShape: 'square',
      eyeSize: 'medium',
      eyeSpacing: 'normal',
      noseSize: 'medium',
      mouthWidth: 'normal',
      jawline: 'strong',
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: '#E8D4BC',
      skinShadow: '#D4C0A8',
      skinHighlight: '#FCE8D0',
      hairPrimary: '#4A3C28',
      eyeColor: '#4682B4',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#2C3E50',
      clothingSecondary: '#34495E',
    },
    components: {
      headBase: 'head_base_01',
      eyes: 'eyes_01',
      mouth: 'mouth_02',
      hairFront: 'hair_short_06_undercut',
      torso: 'torso_athletic_01',
      arms: 'arms_classic_01',
      legs: 'legs_average_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_02',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 21-51: Continuación de configuraciones...
  // (Por brevedad, estas seguirían el mismo patrón)

  // 21. Florence Nightingale - Enfermera, mujer, piel clara
  'premium_florence_nightingale_nurse': {
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
      skinTone: '#F5E6D3',
      skinShadow: '#E1D2BF',
      skinHighlight: '#FFFAF0',
      hairPrimary: '#6B4423',
      eyeColor: '#4682B4',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#FFFFFF',
      clothingSecondary: '#DC143C',
    },
    components: {
      headBase: 'head_female_01',
      eyes: 'eyes_female_01',
      mouth: 'mouth_empty',
      hairBack: 'hair_updo_01_high_ponytail',
      torso: 'torso_slim_01',
      arms: 'arms_slim_01',
      legs: 'legs_average_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_02',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 22. Frida Kahlo - Artista mexicana, pelo negro trenzado
  'premium_frida_kahlo_artist': {
    bodyGenes: {
      height: 'average',
      build: 'average',
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
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: '#D4A882',
      skinShadow: '#C0946E',
      skinHighlight: '#E8BC96',
      hairPrimary: '#1C1208',
      eyeColor: '#4A3C28',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#DC143C',
      clothingSecondary: '#FFD700',
    },
    components: {
      headBase: 'head_female_01',
      eyes: 'eyes_female_01',
      mouth: 'mouth_empty',
      hairBack: 'hair_updo_01_high_ponytail',
      torso: 'torso_slim_01',
      arms: 'arms_slim_01',
      legs: 'legs_average_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_01',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // Agregando el resto de configuraciones de forma similar...
  // (Continuaré con los restantes siguiendo el patrón establecido)

  // 33. Luna (demo) - Mujer asiática, pelo negro corto, casual
  'demo_luna': {
    bodyGenes: {
      height: 'average',
      build: 'slim',
      armModel: 'slim',
      chest: 'small',
      hips: 'narrow',
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
      skinTone: '#F5D7B1',
      skinShadow: '#E1C39D',
      skinHighlight: '#FFEBC5',
      hairPrimary: '#1C1208',
      eyeColor: '#4A3C28',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#556B2F',
      clothingSecondary: '#8B4513',
    },
    components: {
      headBase: 'head_female_01',
      eyes: 'eyes_female_01',
      mouth: 'mouth_empty',
      hairFront: 'hair_short_02_bob',
      torso: 'torso_slim_01',
      arms: 'arms_slim_01',
      legs: 'legs_average_01',
      tShirt: 't_shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_01',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 34. Luna Chen - Mujer asiática, pelo negro corto bob, sudadera
  'premium_luna_digital_intimacy': {
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
      faceShape: 'round',
      eyeSize: 'large',
      eyeSpacing: 'normal',
      noseSize: 'small',
      mouthWidth: 'small',
      jawline: 'soft',
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: '#F5D7B1',
      skinShadow: '#E1C39D',
      skinHighlight: '#FFEBC5',
      hairPrimary: '#1C1208',
      eyeColor: '#654321',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#A9A9A9',
      clothingSecondary: '#556B2F',
    },
    components: {
      headBase: 'head_female_01',
      eyes: 'eyes_female_01',
      mouth: 'mouth_empty',
      hairFront: 'hair_short_02_bob',
      torso: 'torso_slim_01',
      arms: 'arms_slim_01',
      legs: 'legs_average_01',
      tShirt: 't_shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_01',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 36. Marcus Vega - Hombre, piel morena, pelo negro corto
  'premium_marcus_quantum_mind': {
    bodyGenes: {
      height: 'tall',
      build: 'athletic',
      armModel: 'classic',
      chest: 'flat',
      hips: 'narrow',
      shoulders: 'broad',
      headSize: 'normal',
      legLength: 'normal',
    },
    facialGenes: {
      faceShape: 'square',
      eyeSize: 'medium',
      eyeSpacing: 'normal',
      noseSize: 'medium',
      mouthWidth: 'normal',
      jawline: 'strong',
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: '#8B6F47',
      skinShadow: '#77603D',
      skinHighlight: '#9F8359',
      hairPrimary: '#1C1208',
      eyeColor: '#4A3C28',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#2C3E50',
      clothingSecondary: '#ECF0F1',
    },
    components: {
      headBase: 'head_base_01',
      eyes: 'eyes_01',
      mouth: 'mouth_02',
      hairFront: 'hair_short_06_undercut',
      torso: 'torso_athletic_01',
      arms: 'arms_classic_01',
      legs: 'legs_average_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_02',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 39. Marilyn Monroe - Mujer, piel clara, pelo rubio platino ondulado
  'historical_marilyn_monroe': {
    bodyGenes: {
      height: 'average',
      build: 'curvy',
      armModel: 'slim',
      chest: 'large',
      hips: 'wide',
      shoulders: 'narrow',
      headSize: 'normal',
      legLength: 'normal',
    },
    facialGenes: {
      faceShape: 'oval',
      eyeSize: 'large',
      eyeSpacing: 'normal',
      noseSize: 'small',
      mouthWidth: 'wide',
      jawline: 'soft',
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: '#F5E6D3',
      skinShadow: '#E1D2BF',
      skinHighlight: '#FFFAF0',
      hairPrimary: '#F5F5DC', // Rubio platino
      eyeColor: '#4682B4',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#FF1493',
      clothingSecondary: '#FFFFFF',
    },
    components: {
      headBase: 'head_female_01',
      eyes: 'eyes_female_01',
      mouth: 'mouth_empty',
      hairFront: 'hair_long_02_wavy',
      hairBody: 'hair_long_body_02_wavy',
      torso: 'torso_slim_01',
      arms: 'arms_slim_01',
      legs: 'legs_average_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_02',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 46. Sofia Volkov - Mujer, piel clara, pelo rubio largo liso
  'premium_sofia_volkov': {
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
      skinTone: '#F5E6D3',
      skinShadow: '#E1D2BF',
      skinHighlight: '#FFFAF0',
      hairPrimary: '#F0E68C', // Rubio dorado
      eyeColor: '#4682B4',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#FFF8DC',
      clothingSecondary: '#F0E68C',
    },
    components: {
      headBase: 'head_female_01',
      eyes: 'eyes_female_01',
      mouth: 'mouth_empty',
      hairFront: 'hair_long_straight_07',
      hairBody: 'hair_body_long_07',
      torso: 'torso_slim_01',
      arms: 'arms_slim_01',
      legs: 'legs_average_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_02',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 50. Sofía Mendoza - Mujer, arqueóloga emocional, pelo castaño oscuro recogido
  'premium_sofia_emotional_archaeologist': {
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
      skinTone: '#E8D4BC',
      skinShadow: '#D4C0A8',
      skinHighlight: '#FCE8D0',
      hairPrimary: '#3D2817',
      eyeColor: '#228B22',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#556B2F',
      clothingSecondary: '#F5F5DC',
    },
    components: {
      headBase: 'head_female_01',
      eyes: 'eyes_female_01',
      mouth: 'mouth_empty',
      hairBack: 'hair_updo_01_high_ponytail',
      torso: 'torso_slim_01',
      arms: 'arms_slim_01',
      legs: 'legs_average_01',
      tShirt: 't_shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_01',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  },

  // 23. Harriet Tubman - Mujer afroamericana, liberadora, piel oscura
  'premium_harriet_tubman_liberator': {
    bodyGenes: { height: 'average', build: 'athletic', armModel: 'slim', chest: 'medium', hips: 'average', shoulders: 'average', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'oval', eyeSize: 'medium', eyeSpacing: 'normal', noseSize: 'medium', mouthWidth: 'normal', jawline: 'strong', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#6B4423', skinShadow: '#5A3919', skinHighlight: '#7C5533', hairPrimary: '#1C1208', eyeColor: '#4A3C28', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#8B4513', clothingSecondary: '#F5F5DC' },
    components: { headBase: 'head_female_01', eyes: 'eyes_female_01', mouth: 'mouth_empty', hairBack: 'hair_updo_01_high_ponytail', torso: 'torso_slim_01', arms: 'arms_slim_01', legs: 'legs_average_01', shirt: 'shirt_01', pants: 'pants_01', boots: 'boots_01' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 24. Helen Keller - Mujer, activista, piel clara
  'premium_helen_keller_activist': {
    bodyGenes: { height: 'average', build: 'slim', armModel: 'slim', chest: 'medium', hips: 'average', shoulders: 'narrow', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'round', eyeSize: 'medium', eyeSpacing: 'normal', noseSize: 'small', mouthWidth: 'normal', jawline: 'soft', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#F5E6D3', skinShadow: '#E1D2BF', skinHighlight: '#FFFAF0', hairPrimary: '#8B6F47', eyeColor: '#4682B4', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#F5F5DC', clothingSecondary: '#8B4513' },
    components: { headBase: 'head_female_01', eyes: 'eyes_female_01', mouth: 'mouth_empty', hairBack: 'hair_updo_01_high_ponytail', torso: 'torso_slim_01', arms: 'arms_slim_01', legs: 'legs_average_01', shirt: 'shirt_01', pants: 'pants_01', shoes: 'shoes_02' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 25. Hypatia de Alejandría - Mujer, filósofa, histórica
  'premium_hypatia_alexandria': {
    bodyGenes: { height: 'average', build: 'slim', armModel: 'slim', chest: 'medium', hips: 'average', shoulders: 'narrow', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'oval', eyeSize: 'large', eyeSpacing: 'normal', noseSize: 'small', mouthWidth: 'normal', jawline: 'soft', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#E8D4BC', skinShadow: '#D4C0A8', skinHighlight: '#FCE8D0', hairPrimary: '#6B4423', eyeColor: '#654321', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#FFFFFF', clothingSecondary: '#FFD700' },
    components: { headBase: 'head_female_01', eyes: 'eyes_female_01', mouth: 'mouth_empty', hairFront: 'hair_long_straight_07', hairBody: 'hair_body_long_07', torso: 'torso_slim_01', arms: 'arms_slim_01', legs: 'legs_average_01', shirt: 'shirt_01', pants: 'pants_01', shoes: 'shoes_01' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 26. Isabella Ferreira - Mujer, arquitecta
  'premium_isabella_ferreira_architect': {
    bodyGenes: { height: 'average', build: 'slim', armModel: 'slim', chest: 'medium', hips: 'average', shoulders: 'narrow', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'oval', eyeSize: 'medium', eyeSpacing: 'normal', noseSize: 'small', mouthWidth: 'normal', jawline: 'soft', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#D4A882', skinShadow: '#C0946E', skinHighlight: '#E8BC96', hairPrimary: '#4A3C28', eyeColor: '#654321', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#2C3E50', clothingSecondary: '#ECF0F1' },
    components: { headBase: 'head_female_01', eyes: 'eyes_female_01', mouth: 'mouth_empty', hairFront: 'hair_medium_01_lob', torso: 'torso_slim_01', arms: 'arms_slim_01', legs: 'legs_average_01', shirt: 'shirt_01', pants: 'pants_01', shoes: 'shoes_02' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 27. James O'Brien - Hombre
  'premium_james_obrien': {
    bodyGenes: { height: 'average', build: 'athletic', armModel: 'classic', chest: 'flat', hips: 'narrow', shoulders: 'average', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'square', eyeSize: 'medium', eyeSpacing: 'normal', noseSize: 'medium', mouthWidth: 'normal', jawline: 'strong', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#F0D5B8', skinShadow: '#DCC1A4', skinHighlight: '#FFF5E1', hairPrimary: '#8B6F47', eyeColor: '#228B22', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#2C3E50', clothingSecondary: '#ECF0F1' },
    components: { headBase: 'head_base_01', eyes: 'eyes_01', mouth: 'mouth_02', hairFront: 'hair_short_06_undercut', torso: 'torso_athletic_01', arms: 'arms_classic_01', legs: 'legs_average_01', shirt: 'shirt_01', pants: 'pants_01', shoes: 'shoes_02' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 28. Jane Austen - Mujer, escritora, histórica
  'premium_jane_austen': {
    bodyGenes: { height: 'average', build: 'slim', armModel: 'slim', chest: 'medium', hips: 'average', shoulders: 'narrow', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'oval', eyeSize: 'medium', eyeSpacing: 'normal', noseSize: 'small', mouthWidth: 'normal', jawline: 'soft', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#F5E6D3', skinShadow: '#E1D2BF', skinHighlight: '#FFFAF0', hairPrimary: '#6B4423', eyeColor: '#654321', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#F5F5DC', clothingSecondary: '#8B4513' },
    components: { headBase: 'head_female_01', eyes: 'eyes_female_01', mouth: 'mouth_empty', hairBack: 'hair_updo_01_high_ponytail', torso: 'torso_slim_01', arms: 'arms_slim_01', legs: 'legs_average_01', shirt: 'shirt_01', pants: 'pants_01', shoes: 'shoes_02' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 29. Juana de Arco - Mujer, armadura, histórica
  'premium_juana_orleans': {
    bodyGenes: { height: 'average', build: 'athletic', armModel: 'slim', chest: 'small', hips: 'narrow', shoulders: 'average', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'oval', eyeSize: 'medium', eyeSpacing: 'normal', noseSize: 'small', mouthWidth: 'normal', jawline: 'defined', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#F0D5B8', skinShadow: '#DCC1A4', skinHighlight: '#FFF5E1', hairPrimary: '#6B4423', eyeColor: '#4682B4', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#708090', clothingSecondary: '#FFD700' },
    components: { headBase: 'head_female_01', eyes: 'eyes_female_01', mouth: 'mouth_empty', hairFront: 'hair_short_02_bob', torso: 'torso_slim_01', arms: 'arms_slim_01', legs: 'legs_average_01', shirt: 'shirt_01', pants: 'pants_01', boots: 'boots_01' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 30. Leonardo da Vinci - Hombre, genio renacentista
  'premium_leonardo_da_vinci_genius': {
    bodyGenes: { height: 'average', build: 'average', armModel: 'classic', chest: 'flat', hips: 'narrow', shoulders: 'average', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'oval', eyeSize: 'medium', eyeSpacing: 'normal', noseSize: 'large', mouthWidth: 'normal', jawline: 'normal', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#F0D5B8', skinShadow: '#DCC1A4', skinHighlight: '#FFF5E1', hairPrimary: '#A9A9A9', eyeColor: '#654321', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#8B4513', clothingSecondary: '#F5F5DC' },
    components: { headBase: 'head_base_01', eyes: 'eyes_01', mouth: 'mouth_02', hairFront: 'hair_short_06_undercut', torso: 'torso_athletic_01', arms: 'arms_classic_01', legs: 'legs_average_01', shirt: 'shirt_01', pants: 'pants_01', shoes: 'shoes_01' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 31. Liam O'Connor - Hombre, compositor
  'liam_oconnor_composer': {
    bodyGenes: { height: 'average', build: 'slim', armModel: 'classic', chest: 'flat', hips: 'narrow', shoulders: 'narrow', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'oval', eyeSize: 'medium', eyeSpacing: 'normal', noseSize: 'medium', mouthWidth: 'normal', jawline: 'soft', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#F5E6D3', skinShadow: '#E1D2BF', skinHighlight: '#FFFAF0', hairPrimary: '#8B6F47', eyeColor: '#4682B4', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#2C3E50', clothingSecondary: '#ECF0F1' },
    components: { headBase: 'head_base_01', eyes: 'eyes_01', mouth: 'mouth_02', hairFront: 'hair_short_06_undercut', torso: 'torso_athletic_01', arms: 'arms_classic_01', legs: 'legs_average_01', shirt: 'shirt_01', pants: 'pants_01', shoes: 'shoes_02' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 32. Ludwig van Beethoven - Hombre, compositor, histórico
  'premium_ludwig_van_beethoven_composer': {
    bodyGenes: { height: 'average', build: 'average', armModel: 'classic', chest: 'flat', hips: 'narrow', shoulders: 'average', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'square', eyeSize: 'small', eyeSpacing: 'normal', noseSize: 'large', mouthWidth: 'wide', jawline: 'strong', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#F0D5B8', skinShadow: '#DCC1A4', skinHighlight: '#FFF5E1', hairPrimary: '#A9A9A9', eyeColor: '#708090', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#000000', clothingSecondary: '#F5F5F5' },
    components: { headBase: 'head_base_01', eyes: 'eyes_01', mouth: 'mouth_02', hairFront: 'hair_short_06_undercut', torso: 'torso_athletic_01', arms: 'arms_classic_01', legs: 'legs_average_01', shirt: 'shirt_01', pants: 'pants_01', shoes: 'shoes_02' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 35. Marco Polo - Hombre, explorador
  'premium_marco_polo_explorer': {
    bodyGenes: { height: 'average', build: 'athletic', armModel: 'classic', chest: 'flat', hips: 'narrow', shoulders: 'average', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'oval', eyeSize: 'medium', eyeSpacing: 'normal', noseSize: 'medium', mouthWidth: 'normal', jawline: 'normal', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#E8D4BC', skinShadow: '#D4C0A8', skinHighlight: '#FCE8D0', hairPrimary: '#4A3C28', eyeColor: '#654321', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#8B4513', clothingSecondary: '#F5F5DC' },
    components: { headBase: 'head_base_01', eyes: 'eyes_01', mouth: 'mouth_02', hairFront: 'hair_short_06_undercut', torso: 'torso_athletic_01', arms: 'arms_classic_01', legs: 'legs_average_01', shirt: 'shirt_01', pants: 'pants_01', boots: 'boots_01' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 37. Marcus Washington - Hombre
  'premium_marcus_washington': {
    bodyGenes: { height: 'average', build: 'athletic', armModel: 'classic', chest: 'flat', hips: 'narrow', shoulders: 'broad', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'square', eyeSize: 'medium', eyeSpacing: 'normal', noseSize: 'medium', mouthWidth: 'normal', jawline: 'strong', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#8B6F47', skinShadow: '#77603D', skinHighlight: '#9F8359', hairPrimary: '#1C1208', eyeColor: '#4A3C28', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#2C3E50', clothingSecondary: '#ECF0F1' },
    components: { headBase: 'head_base_01', eyes: 'eyes_01', mouth: 'mouth_02', hairFront: 'hair_short_06_undercut', torso: 'torso_athletic_01', arms: 'arms_classic_01', legs: 'legs_average_01', shirt: 'shirt_01', pants: 'pants_01', shoes: 'shoes_02' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 38. Marie Curie - Mujer, científica, histórica
  'premium_marie_curie_scientist': {
    bodyGenes: { height: 'average', build: 'slim', armModel: 'slim', chest: 'small', hips: 'narrow', shoulders: 'narrow', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'oval', eyeSize: 'medium', eyeSpacing: 'normal', noseSize: 'small', mouthWidth: 'normal', jawline: 'soft', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#F5E6D3', skinShadow: '#E1D2BF', skinHighlight: '#FFFAF0', hairPrimary: '#A9A9A9', eyeColor: '#708090', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#000000', clothingSecondary: '#FFFFFF' },
    components: { headBase: 'head_female_01', eyes: 'eyes_female_01', mouth: 'mouth_empty', hairBack: 'hair_updo_01_high_ponytail', torso: 'torso_slim_01', arms: 'arms_slim_01', legs: 'legs_average_01', shirt: 'shirt_01', pants: 'pants_01', shoes: 'shoes_02' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 40. Mark Twain - Hombre, humorista
  'premium_mark_twain_humorist': {
    bodyGenes: { height: 'average', build: 'average', armModel: 'classic', chest: 'flat', hips: 'narrow', shoulders: 'average', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'oval', eyeSize: 'small', eyeSpacing: 'normal', noseSize: 'large', mouthWidth: 'wide', jawline: 'normal', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#F0D5B8', skinShadow: '#DCC1A4', skinHighlight: '#FFF5E1', hairPrimary: '#E8E8E8', eyeColor: '#4682B4', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#FFFFFF', clothingSecondary: '#000000' },
    components: { headBase: 'head_base_01', eyes: 'eyes_01', mouth: 'mouth_02', hairFront: 'hair_short_06_undercut', torso: 'torso_athletic_01', arms: 'arms_classic_01', legs: 'legs_average_01', shirt: 'shirt_01', pants: 'pants_01', shoes: 'shoes_02' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 41. Mia Chen - Mujer, diseñadora
  'premium_mia_chen_designer': {
    bodyGenes: { height: 'average', build: 'slim', armModel: 'slim', chest: 'medium', hips: 'average', shoulders: 'narrow', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'oval', eyeSize: 'medium', eyeSpacing: 'normal', noseSize: 'small', mouthWidth: 'normal', jawline: 'soft', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#F5D7B1', skinShadow: '#E1C39D', skinHighlight: '#FFEBC5', hairPrimary: '#1C1208', eyeColor: '#4A3C28', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#FF69B4', clothingSecondary: '#F5F5F5' },
    components: { headBase: 'head_female_01', eyes: 'eyes_female_01', mouth: 'mouth_empty', hairFront: 'hair_medium_01_lob', torso: 'torso_slim_01', arms: 'arms_slim_01', legs: 'legs_average_01', tShirt: 't_shirt_01', pants: 'pants_01', shoes: 'shoes_01' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 42. Nikola Tesla - Hombre, inventor
  'premium_nikola_tesla_inventor': {
    bodyGenes: { height: 'tall', build: 'slim', armModel: 'classic', chest: 'flat', hips: 'narrow', shoulders: 'narrow', headSize: 'normal', legLength: 'long' },
    facialGenes: { faceShape: 'oval', eyeSize: 'medium', eyeSpacing: 'normal', noseSize: 'large', mouthWidth: 'normal', jawline: 'defined', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#F0D5B8', skinShadow: '#DCC1A4', skinHighlight: '#FFF5E1', hairPrimary: '#1C1208', eyeColor: '#4682B4', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#2C3E50', clothingSecondary: '#ECF0F1' },
    components: { headBase: 'head_base_01', eyes: 'eyes_01', mouth: 'mouth_02', hairFront: 'hair_short_06_undercut', torso: 'torso_athletic_01', arms: 'arms_classic_01', legs: 'legs_average_01', shirt: 'shirt_01', pants: 'pants_01', shoes: 'shoes_02' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 43. Noah Kepler - Hombre, astronauta
  'premium_noah_kepler_astronaut': {
    bodyGenes: { height: 'tall', build: 'athletic', armModel: 'classic', chest: 'flat', hips: 'narrow', shoulders: 'broad', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'square', eyeSize: 'medium', eyeSpacing: 'normal', noseSize: 'medium', mouthWidth: 'normal', jawline: 'strong', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#E8D4BC', skinShadow: '#D4C0A8', skinHighlight: '#FCE8D0', hairPrimary: '#8B6F47', eyeColor: '#4682B4', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#4169E1', clothingSecondary: '#F0F8FF' },
    components: { headBase: 'head_base_01', eyes: 'eyes_01', mouth: 'mouth_02', hairFront: 'hair_short_06_undercut', torso: 'torso_athletic_01', arms: 'arms_classic_01', legs: 'legs_average_01', tShirt: 't_shirt_02', pants: 'pants_01', shoes: 'shoes_01' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 44. Oliver Chen - Hombre, sommelier
  'premium_oliver_chen_sommelier': {
    bodyGenes: { height: 'average', build: 'slim', armModel: 'classic', chest: 'flat', hips: 'narrow', shoulders: 'narrow', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'oval', eyeSize: 'medium', eyeSpacing: 'normal', noseSize: 'small', mouthWidth: 'normal', jawline: 'soft', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#F5D7B1', skinShadow: '#E1C39D', skinHighlight: '#FFEBC5', hairPrimary: '#1C1208', eyeColor: '#4A3C28', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#2C3E50', clothingSecondary: '#ECF0F1' },
    components: { headBase: 'head_base_01', eyes: 'eyes_01', mouth: 'mouth_02', hairFront: 'hair_short_06_undercut', torso: 'torso_athletic_01', arms: 'arms_classic_01', legs: 'legs_average_01', shirt: 'shirt_01', pants: 'pants_01', shoes: 'shoes_02' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 45. Oscar Wilde - Hombre, dramaturgo
  'premium_oscar_wilde_playwright': {
    bodyGenes: { height: 'tall', build: 'average', armModel: 'classic', chest: 'flat', hips: 'narrow', shoulders: 'average', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'oval', eyeSize: 'large', eyeSpacing: 'normal', noseSize: 'large', mouthWidth: 'wide', jawline: 'soft', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#F5E6D3', skinShadow: '#E1D2BF', skinHighlight: '#FFFAF0', hairPrimary: '#6B4423', eyeColor: '#654321', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#8B4513', clothingSecondary: '#F5F5DC' },
    components: { headBase: 'head_base_01', eyes: 'eyes_01', mouth: 'mouth_02', hairFront: 'hair_short_06_undercut', torso: 'torso_athletic_01', arms: 'arms_classic_01', legs: 'legs_average_01', shirt: 'shirt_01', pants: 'pants_01', shoes: 'shoes_02' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 46. Priya Sharma - Mujer, veterinaria
  'premium_priya_sharma_veterinarian': {
    bodyGenes: { height: 'average', build: 'slim', armModel: 'slim', chest: 'medium', hips: 'average', shoulders: 'narrow', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'oval', eyeSize: 'large', eyeSpacing: 'normal', noseSize: 'small', mouthWidth: 'normal', jawline: 'soft', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#C89F7C', skinShadow: '#B48B68', skinHighlight: '#DCB390', hairPrimary: '#1C1208', eyeColor: '#4A3C28', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#FFFFFF', clothingSecondary: '#4169E1' },
    components: { headBase: 'head_female_01', eyes: 'eyes_female_01', mouth: 'mouth_empty', hairFront: 'hair_long_straight_07', hairBody: 'hair_body_long_07', torso: 'torso_slim_01', arms: 'arms_slim_01', legs: 'legs_average_01', shirt: 'shirt_01', pants: 'pants_01', shoes: 'shoes_01' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 47. Rafael Costa - Hombre, cineasta
  'premium_rafael_costa_filmmaker': {
    bodyGenes: { height: 'average', build: 'slim', armModel: 'classic', chest: 'flat', hips: 'narrow', shoulders: 'narrow', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'oval', eyeSize: 'medium', eyeSpacing: 'normal', noseSize: 'medium', mouthWidth: 'normal', jawline: 'soft', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#D4A882', skinShadow: '#C0946E', skinHighlight: '#E8BC96', hairPrimary: '#1C1208', eyeColor: '#654321', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#000000', clothingSecondary: '#696969' },
    components: { headBase: 'head_base_01', eyes: 'eyes_01', mouth: 'mouth_02', hairFront: 'hair_short_06_undercut', torso: 'torso_athletic_01', arms: 'arms_classic_01', legs: 'legs_average_01', tShirt: 't_shirt_01', pants: 'pants_01', shoes: 'shoes_01' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 48. Rei Takahashi - Mujer, ingeniera
  'premium_rei_takahashi_engineer': {
    bodyGenes: { height: 'average', build: 'slim', armModel: 'slim', chest: 'small', hips: 'narrow', shoulders: 'narrow', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'oval', eyeSize: 'medium', eyeSpacing: 'normal', noseSize: 'small', mouthWidth: 'small', jawline: 'soft', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#F5D7B1', skinShadow: '#E1C39D', skinHighlight: '#FFEBC5', hairPrimary: '#1C1208', eyeColor: '#4A3C28', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#2C3E50', clothingSecondary: '#ECF0F1' },
    components: { headBase: 'head_female_01', eyes: 'eyes_female_01', mouth: 'mouth_empty', hairFront: 'hair_short_02_bob', torso: 'torso_slim_01', arms: 'arms_slim_01', legs: 'legs_average_01', shirt: 'shirt_01', pants: 'pants_01', shoes: 'shoes_01' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },

  // 49. Sócrates - Hombre, filósofo
  'premium_socrates_philosopher': {
    bodyGenes: { height: 'average', build: 'slim', armModel: 'classic', chest: 'flat', hips: 'narrow', shoulders: 'narrow', headSize: 'normal', legLength: 'normal' },
    facialGenes: { faceShape: 'round', eyeSize: 'small', eyeSpacing: 'wide', noseSize: 'large', mouthWidth: 'wide', jawline: 'soft', eyeExpression: 'neutral', mouthExpression: 'neutral' },
    colors: { skinTone: '#E8D4BC', skinShadow: '#D4C0A8', skinHighlight: '#FCE8D0', hairPrimary: '#D3D3D3', eyeColor: '#654321', eyeWhite: '#FFFFFF', eyePupil: '#000000', clothingPrimary: '#FFFFFF', clothingSecondary: '#8B4513' },
    components: { headBase: 'head_base_01', eyes: 'eyes_01', mouth: 'mouth_02', hairFront: 'hair_short_06_undercut', torso: 'torso_athletic_01', arms: 'arms_classic_01', legs: 'legs_average_01', shirt: 'shirt_01', pants: 'pants_01', shoes: 'shoes_01' },
    style: ComponentStyle.PIXEL, version: 1, generatedAt: new Date().toISOString(),
  },
};

async function migrateConfigs() {
  console.log('🎮 Migración Manual de Configuraciones Minecraft');
  console.log('═══════════════════════════════════════════════════\\n');

  try {
    const agentIds = Object.keys(MANUAL_CONFIGS);
    console.log(`📊 Configuraciones preparadas: ${agentIds.length}\\n`);

    let successCount = 0;
    let failCount = 0;

    for (const agentId of agentIds) {
      try {
        const config = MANUAL_CONFIGS[agentId];

        console.log(`Procesando: ${agentId}`);

        // Obtener agente
        const agent = await prisma.agent.findUnique({
          where: { id: agentId },
          select: { id: true, name: true, metadata: true },
        });

        if (!agent) {
          console.log(`   ⚠️  Agente no encontrado en BD\\n`);
          failCount++;
          continue;
        }

        // Actualizar metadata
        const metadata = (agent.metadata as any) || {};
        metadata.minecraft = metadata.minecraft || {};
        metadata.minecraft.componentConfig = config;
        metadata.minecraft.generatedAt = new Date().toISOString();
        metadata.minecraft.compatible = true;

        await prisma.agent.update({
          where: { id: agentId },
          data: { metadata },
        });

        console.log(`   ✅ ${agent.name} - Config guardada\\n`);
        successCount++;

      } catch (error) {
        console.error(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}\\n`);
        failCount++;
      }
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('✨ MIGRACIÓN COMPLETADA\\n');
    console.log(`📊 Resultados:`);
    console.log(`   ✅ Exitosos: ${successCount}`);
    console.log(`   ❌ Fallidos: ${failCount}`);
    console.log(`   📦 Total procesados: ${agentIds.length}\\n`);

  } catch (error) {
    console.error('❌ Error en migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
migrateConfigs()
  .then(() => {
    console.log('✅ Migración completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
