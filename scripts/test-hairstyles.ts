/**
 * Script de prueba de peinados
 * Genera ejemplos de cada categoría de peinado para visualización
 */

import path from 'path';
import fs from 'fs/promises';
import { assembleSkin } from '@/lib/minecraft/skin-assembler';
import { SkinConfiguration, ComponentStyle } from '@/types/minecraft-skin-components';

const COMPONENTS_DIR = path.join(process.cwd(), 'public/minecraft/components');
const OUTPUT_DIR = path.join(process.cwd(), 'public/minecraft/hairstyle-examples');

// Configuración base para todos los ejemplos
const baseConfig: Omit<SkinConfiguration, 'components'> = {
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
    skinTone: '#F5D7B1',
    skinShadow: '#E5C7A1',
    skinHighlight: '#FFE7C1',
    hairPrimary: '#8B4513', // Castaño
    eyeColor: '#4169E1',
    eyeWhite: '#FFFFFF',
    eyePupil: '#000000',
    clothingPrimary: '#FF69B4',
    clothingSecondary: '#FF1493',
  },
  style: ComponentStyle.PIXEL,
  version: 1,
  generatedAt: new Date().toISOString(),
};

// Definir peinados a probar
const hairstyles = {
  short: [
    { id: 'hair_short_01_pixie', name: 'Pixie Cut', components: { hairFront: 'hair_short_01_pixie' } },
    { id: 'hair_short_02_bob', name: 'Bob Cut', components: { hairFront: 'hair_short_02_bob' } },
    { id: 'hair_short_03_buzz', name: 'Buzz Cut', components: { hairFront: 'hair_short_03_buzz' } },
    { id: 'hair_short_04_crew', name: 'Crew Cut', components: { hairFront: 'hair_short_04_crew' } },
    { id: 'hair_short_05_caesar', name: 'Caesar Cut', components: { hairFront: 'hair_short_05_caesar' } },
    { id: 'hair_short_06_undercut', name: 'Undercut', components: { hairFront: 'hair_short_06_undercut' } },
    { id: 'hair_short_07_bowl', name: 'Bowl Cut', components: { hairFront: 'hair_short_07_bowl' } },
    { id: 'hair_short_08_slicked', name: 'Slicked Back', components: { hairFront: 'hair_short_08_slicked' } },
  ],
  medium: [
    { id: 'hair_medium_01_lob', name: 'Lob (Long Bob)', components: { hairFront: 'hair_medium_01_lob' } },
    { id: 'hair_medium_03_shag', name: 'Shag', components: { hairFront: 'hair_medium_03_shag' } },
  ],
  long: [
    {
      id: 'hair_long_01_straight',
      name: 'Straight Long Hair',
      components: { hairFront: 'hair_long_01_straight' },
      bodyComponent: 'hair_long_body_01_straight',
    },
    {
      id: 'hair_long_02_wavy',
      name: 'Wavy Long Hair',
      components: { hairFront: 'hair_long_02_wavy' },
      bodyComponent: 'hair_long_body_02_wavy',
    },
  ],
  updo: [
    { id: 'hair_updo_01_high_ponytail', name: 'High Ponytail', components: { hairBack: 'hair_updo_01_high_ponytail' } },
    { id: 'hair_updo_05_messy_bun', name: 'Messy Bun', components: { hairBack: 'hair_updo_05_messy_bun' } },
  ],
};

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  DEMOSTRACIÓN DE NUEVOS PEINADOS');
  console.log('═══════════════════════════════════════════════════════\n');

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Generar ejemplos para cada categoría
  for (const [category, styles] of Object.entries(hairstyles)) {
    console.log(`\n📁 Categoría: ${category.toUpperCase()}`);
    console.log('─'.repeat(50));

    for (const style of styles) {
      try {
        console.log(`  → Generando "${style.name}" (${style.id})...`);

        // Configuración completa
        const config: SkinConfiguration = {
          ...baseConfig,
          components: {
            eyes: 'eyes_03',
            mouth: 'mouth_01',
            torso: 'torso_slim_01',
            arms: 'arms_slim_01',
            legs: 'legs_average_01',
            shirt: 'shirt_01',
            pants: 'pants_01',
            ...style.components,
          },
        };

        // Agregar componente de cuerpo si es pelo largo
        if ('bodyComponent' in style && style.bodyComponent) {
          // @ts-ignore - agregando propiedad dinámica
          config.components.hairBody = style.bodyComponent;
        }

        // Ensamblar skin
        const skinBuffer = await assembleSkin(config, COMPONENTS_DIR);

        // Guardar
        const filename = `${style.id}.png`;
        await fs.writeFile(path.join(OUTPUT_DIR, filename), skinBuffer);

        console.log(`    ✓ ${filename}`);
      } catch (error) {
        console.error(`    ✗ Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  // Resumen
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  ✨ GENERACIÓN COMPLETADA');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log(`📁 Ejemplos guardados en: ${OUTPUT_DIR}\n`);

  console.log('📊 Estadísticas:');
  console.log(`  - Peinados cortos: ${hairstyles.short.length}`);
  console.log(`  - Peinados medios: ${hairstyles.medium.length}`);
  console.log(`  - Peinados largos: ${hairstyles.long.length}`);
  console.log(`  - Peinados recogidos: ${hairstyles.updo.length}`);
  console.log(`  - TOTAL: ${
    hairstyles.short.length + hairstyles.medium.length + hairstyles.long.length + hairstyles.updo.length
  } peinados nuevos\n`);

  console.log('🎨 Variaciones de color:');
  console.log('  - Todos los peinados usan la clase "colorizable-hair"');
  console.log('  - Se pueden recolorear programáticamente sin regenerar');
  console.log('  - Colores disponibles: infinitos (cualquier hex)\n');
}

main().catch(console.error);
