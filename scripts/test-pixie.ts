import { assembleSkin } from '../lib/minecraft/skin-assembler';
import { ComponentStyle } from '../types/minecraft-skin-components';
import fs from 'fs/promises';

async function test() {
  const config = {
    bodyGenes: {
      height: 'average' as const,
      build: 'slim' as const,
      armModel: 'slim' as const,
      chest: 'small' as const,
      hips: 'average' as const,
      shoulders: 'narrow' as const,
      headSize: 'normal' as const,
      legLength: 'normal' as const,
    },
    facialGenes: {
      faceShape: 'oval' as const,
      eyeSize: 'large' as const,
      eyeSpacing: 'normal' as const,
      noseSize: 'small' as const,
      mouthWidth: 'normal' as const,
      jawline: 'soft' as const,
      eyeExpression: 'happy' as const,
      mouthExpression: 'smile' as const,
    },
    colors: {
      skinTone: '#F5D7B1',
      skinShadow: '#E5C7A1',
      skinHighlight: '#FFE7C1',
      hairPrimary: '#B8860B',
      eyeColor: '#87CEEB',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#FF6B9D',
      clothingSecondary: '#4169E1',
    },
    components: {
      eyes: 'eyes_03',
      mouth: 'mouth_01',
      torso: 'torso_slim_01',
      arms: 'arms_slim_01',
      legs: 'legs_average_01',
      hairFront: 'hair_short_01_pixie',
      tShirt: 't_shirt_01',
      pants: 'pants_01',
      shoes: 'shoes_01',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  };

  console.log('📝 Componentes usados:');
  console.log('  - tShirt:', config.components.tShirt);
  console.log('  - clothingPrimary:', config.colors.clothingPrimary);

  console.log('\n🎨 Generando skin...');
  const skin = await assembleSkin(config, 'public/minecraft/components');
  await fs.writeFile('public/minecraft/test-pixie.png', skin);
  console.log('✓ Test skin generada en public/minecraft/test-pixie.png');
}

test();
