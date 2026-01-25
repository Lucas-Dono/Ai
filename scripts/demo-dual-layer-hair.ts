import { assembleSkin } from '../lib/minecraft/skin-assembler';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

/**
 * Genera 3 skins de demostración con diferentes colores de pelo
 * para visualizar el efecto del sistema de doble capa
 */
async function demoDualLayer() {
  const componentsDir = path.join(process.cwd(), 'public/minecraft/components');
  const outputDir = path.join(process.cwd(), 'public/minecraft/dual-layer-demo');

  await fs.mkdir(outputDir, { recursive: true });

  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║  DEMOSTRACIÓN: Sistema de Doble Capa para Pelo      ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  const baseConfig = {
    bodyGenes: {
      height: 'average' as any,
      build: 'athletic' as any,
      armModel: 'slim' as any,
      chest: 'medium' as any,
      hips: 'curvy' as any,
      shoulders: 'narrow' as any,
      headSize: 'normal' as any,
      legLength: 'normal' as any,
    },
    facialGenes: {
      faceShape: 'oval' as any,
      eyeSize: 'large' as any,
      eyeSpacing: 'normal' as any,
      noseSize: 'small' as any,
      mouthWidth: 'normal' as any,
      jawline: 'soft' as any,
      eyeExpression: 'happy' as any,
      mouthExpression: 'smile' as any,
    },
    components: {
      eyes: 'eyes_03',
      mouth: 'mouth_01',
      torso: 'torso_average_01',
      arms: 'arms_slim_01',
      legs: 'legs_average_01',
      hairFront: 'hair_short_02_bob',
      shirt: 'shirt_01',
    },
    colors: {
      skinTone: '#D4A574',
      clothingPrimary: '#4169E1',
      eyeColor: '#4169E1',
    },
    style: 'pixel' as any,
    version: 1,
    generatedAt: new Date().toISOString(),
  };

  const testCases = [
    {
      name: 'platinum_blonde',
      color: '#E5E4E2',
      description: 'Rubio Platino (color muy claro)',
    },
    {
      name: 'hot_pink',
      color: '#FF69B4',
      description: 'Rosa Intenso (color vibrante)',
    },
    {
      name: 'jet_black',
      color: '#0A0A0A',
      description: 'Negro Azabache (color oscuro)',
    },
  ];

  for (const test of testCases) {
    console.log(`\n🎨 Generando: ${test.description}`);
    console.log(`   Color: ${test.color}`);

    const buffer = await assembleSkin({
      ...baseConfig,
      colors: {
        ...baseConfig.colors,
        hairPrimary: test.color,
      },
    }, componentsDir);

    const filename = `dual_layer_${test.name}.png`;
    await fs.writeFile(path.join(outputDir, filename), buffer);

    // Analizar píxeles de HEAD y HAT
    const { data, info } = await sharp(buffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // HEAD_RIGHT
    const headRightIdx = (8 * info.width + 0) * 4;
    const headRightColor = '#' + [data[headRightIdx], data[headRightIdx + 1], data[headRightIdx + 2]]
      .map(x => x.toString(16).padStart(2, '0')).join('');

    // HAT_RIGHT
    const hatRightIdx = (8 * info.width + 32) * 4;
    const hatRightHasContent = data[hatRightIdx + 3] > 0;
    const hatRightColor = hatRightHasContent
      ? '#' + [data[hatRightIdx], data[hatRightIdx + 1], data[hatRightIdx + 2]]
          .map(x => x.toString(16).padStart(2, '0')).join('')
      : 'transparent';

    console.log(`   HEAD_RIGHT: ${headRightColor} (base pegada)`);
    console.log(`   HAT_RIGHT:  ${hatRightColor} (${hatRightHasContent ? 'profundidad' : 'sin overlay'})`);
    console.log(`   ✓ Guardado: ${filename}`);
  }

  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║  ✨ DEMOSTRACIÓN COMPLETADA                          ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  console.log(`📁 Skins de demostración guardadas en:\n   ${outputDir}\n`);

  console.log('🎮 Cómo probar en Minecraft:\n');
  console.log('  1. Importa cualquiera de las 3 skins a Minecraft');
  console.log('  2. Usa F5 para cambiar a vista tercera persona');
  console.log('  3. Gira el personaje 360° y observa:');
  console.log('     ✅ Pelo visible desde TODOS los ángulos');
  console.log('     ✅ Profundidad 3D en colores claros');
  console.log('     ✅ No hay "gaps" ni pelo flotante');
  console.log('     ✅ Volumen natural con mechones sobresalientes\n');
}

demoDualLayer().catch(console.error);
