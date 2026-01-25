import { assembleSkin } from '../lib/minecraft/skin-assembler';
import {
  PRESET_PALETTES,
  SKIN_TONES,
  EYE_COLORS,
  HAIR_COLORS,
  CLOTHING_COLORS,
  CompletePalette
} from '../lib/minecraft/color-palettes';
import { SkinConfiguration } from '../types/minecraft-skin-components';
import fs from 'fs/promises';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'minecraft', 'color-showcase');

// Configuración base común para todas las skins
const BASE_CONFIG: Omit<SkinConfiguration, 'colors'> = {
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
  style: 'pixel' as any,
  version: 1,
  generatedAt: new Date().toISOString(),
};

async function generateSkinFromPalette(
  paletteName: string,
  palette: CompletePalette,
  componentsDir: string
): Promise<Buffer> {
  const config: SkinConfiguration = {
    ...BASE_CONFIG,
    colors: {
      skinTone: palette.skinTone,
      hairPrimary: palette.hairColor,
      eyeColor: palette.eyeColor,
      clothingPrimary: palette.clothingPrimary,
      clothingSecondary: palette.clothingSecondary,
    },
  };

  return assembleSkin(config, componentsDir);
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  SHOWCASE DE PALETAS DE COLORES');
  console.log('═══════════════════════════════════════════════════════\n');

  // Crear directorio de salida
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const componentsDir = path.join(process.cwd(), 'public', 'minecraft', 'components');

  let successCount = 0;
  let failCount = 0;

  // Generar skins con todas las paletas predefinidas
  console.log('📝 Generando skins con paletas predefinidas...\n');

  for (const [key, palette] of Object.entries(PRESET_PALETTES)) {
    try {
      console.log(`📝 Generando: ${palette.name}`);
      console.log(`   ${palette.description}`);
      console.log(`   Piel: ${palette.skinTone} | Pelo: ${palette.hairColor} | Ojos: ${palette.eyeColor}`);

      const buffer = await assembleSkin({
        ...BASE_CONFIG,
        colors: {
          skinTone: palette.skinTone,
          hairPrimary: palette.hairColor,
          eyeColor: palette.eyeColor,
          clothingPrimary: palette.clothingPrimary,
          clothingSecondary: palette.clothingSecondary,
        },
      }, componentsDir);

      const filename = `${key.toLowerCase()}.png`;
      await fs.writeFile(path.join(OUTPUT_DIR, filename), buffer);

      console.log(`   ✓ Generado exitosamente\n`);
      successCount++;
    } catch (error: any) {
      console.error(`   ✗ Error: ${error.message}\n`);
      failCount++;
    }
  }

  // Generar ejemplos de tonos de piel
  console.log('\n📝 Generando showcase de tonos de piel...\n');

  const skinToneExamples = [
    { name: 'piel_pale', tone: SKIN_TONES.PALE },
    { name: 'piel_beige', tone: SKIN_TONES.BEIGE },
    { name: 'piel_tan', tone: SKIN_TONES.TAN },
    { name: 'piel_brown', tone: SKIN_TONES.BROWN },
    { name: 'piel_dark_brown', tone: SKIN_TONES.DARK_BROWN },
  ];

  for (const example of skinToneExamples) {
    try {
      console.log(`📝 Generando: ${example.name}`);

      const buffer = await assembleSkin({
        ...BASE_CONFIG,
        colors: {
          skinTone: example.tone,
          hairPrimary: HAIR_COLORS.DARK_BROWN,
          eyeColor: EYE_COLORS.BROWN,
          clothingPrimary: CLOTHING_COLORS.BLUE,
        },
      }, componentsDir);

      await fs.writeFile(path.join(OUTPUT_DIR, `${example.name}.png`), buffer);
      console.log(`   ✓ Generado exitosamente\n`);
      successCount++;
    } catch (error: any) {
      console.error(`   ✗ Error: ${error.message}\n`);
      failCount++;
    }
  }

  // Generar ejemplos de colores de ojos
  console.log('\n📝 Generando showcase de colores de ojos...\n');

  const eyeColorExamples = [
    { name: 'ojos_brown', color: EYE_COLORS.BROWN },
    { name: 'ojos_blue', color: EYE_COLORS.BLUE },
    { name: 'ojos_green', color: EYE_COLORS.GREEN },
    { name: 'ojos_amber', color: EYE_COLORS.AMBER },
    { name: 'ojos_violet', color: EYE_COLORS.VIOLET },
  ];

  for (const example of eyeColorExamples) {
    try {
      console.log(`📝 Generando: ${example.name}`);

      const buffer = await assembleSkin({
        ...BASE_CONFIG,
        colors: {
          skinTone: SKIN_TONES.BEIGE,
          hairPrimary: HAIR_COLORS.BROWN,
          eyeColor: example.color,
          clothingPrimary: CLOTHING_COLORS.BLUE,
        },
      }, componentsDir);

      await fs.writeFile(path.join(OUTPUT_DIR, `${example.name}.png`), buffer);
      console.log(`   ✓ Generado exitosamente\n`);
      successCount++;
    } catch (error: any) {
      console.error(`   ✗ Error: ${error.message}\n`);
      failCount++;
    }
  }

  // Generar ejemplos de colores de pelo
  console.log('\n📝 Generando showcase de colores de pelo...\n');

  const hairColorExamples = [
    { name: 'pelo_black', color: HAIR_COLORS.BLACK },
    { name: 'pelo_brown', color: HAIR_COLORS.BROWN },
    { name: 'pelo_blonde', color: HAIR_COLORS.BLONDE },
    { name: 'pelo_red', color: HAIR_COLORS.RED },
    { name: 'pelo_pink', color: HAIR_COLORS.PINK },
    { name: 'pelo_blue', color: HAIR_COLORS.BLUE },
    { name: 'pelo_purple', color: HAIR_COLORS.PURPLE },
    { name: 'pelo_green', color: HAIR_COLORS.GREEN },
  ];

  for (const example of hairColorExamples) {
    try {
      console.log(`📝 Generando: ${example.name}`);

      const buffer = await assembleSkin({
        ...BASE_CONFIG,
        colors: {
          skinTone: SKIN_TONES.BEIGE,
          hairPrimary: example.color,
          eyeColor: EYE_COLORS.BLUE,
          clothingPrimary: CLOTHING_COLORS.BLUE,
        },
      }, componentsDir);

      await fs.writeFile(path.join(OUTPUT_DIR, `${example.name}.png`), buffer);
      console.log(`   ✓ Generado exitosamente\n`);
      successCount++;
    } catch (error: any) {
      console.error(`   ✗ Error: ${error.message}\n`);
      failCount++;
    }
  }

  // Generar ejemplos de colores de ropa
  console.log('\n📝 Generando showcase de colores de ropa...\n');

  const clothingColorExamples = [
    { name: 'ropa_red', color: CLOTHING_COLORS.RED },
    { name: 'ropa_blue', color: CLOTHING_COLORS.BLUE },
    { name: 'ropa_green', color: CLOTHING_COLORS.GREEN },
    { name: 'ropa_purple', color: CLOTHING_COLORS.PURPLE },
    { name: 'ropa_pink', color: CLOTHING_COLORS.PINK },
    { name: 'ropa_black', color: CLOTHING_COLORS.BLACK },
  ];

  for (const example of clothingColorExamples) {
    try {
      console.log(`📝 Generando: ${example.name}`);

      const buffer = await assembleSkin({
        ...BASE_CONFIG,
        colors: {
          skinTone: SKIN_TONES.BEIGE,
          hairPrimary: HAIR_COLORS.BROWN,
          eyeColor: EYE_COLORS.BLUE,
          clothingPrimary: example.color,
        },
      }, componentsDir);

      await fs.writeFile(path.join(OUTPUT_DIR, `${example.name}.png`), buffer);
      console.log(`   ✓ Generado exitosamente\n`);
      successCount++;
    } catch (error: any) {
      console.error(`   ✗ Error: ${error.message}\n`);
      failCount++;
    }
  }

  // Resumen
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  ✨ SHOWCASE COMPLETADO');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`📁 Skins guardadas en: ${OUTPUT_DIR}\n`);
  console.log('📊 Resultados:');
  console.log(`   ✓ Exitosos: ${successCount}`);
  console.log(`   ✗ Fallidos: ${failCount}`);
  console.log(`   📦 Total: ${successCount + failCount}\n`);

  console.log('🎨 Categorías generadas:');
  console.log(`   - ${Object.keys(PRESET_PALETTES).length} paletas predefinidas`);
  console.log(`   - ${skinToneExamples.length} tonos de piel`);
  console.log(`   - ${eyeColorExamples.length} colores de ojos`);
  console.log(`   - ${hairColorExamples.length} colores de pelo`);
  console.log(`   - ${clothingColorExamples.length} colores de ropa\n`);
}

main().catch(console.error);
