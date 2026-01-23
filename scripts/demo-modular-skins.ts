/**
 * Script de Demostración del Sistema Modular de Skins
 *
 * Genera componentes base y ensambla skins de ejemplo
 */

import path from 'path';
import fs from 'fs/promises';
import { generateAllComponents } from '@/lib/minecraft/component-generator';
import { assembleSkin, generateExampleSkin } from '@/lib/minecraft/skin-assembler';
import { SkinConfiguration, ComponentStyle } from '@/types/minecraft-skin-components';

const COMPONENTS_OUTPUT_DIR = path.join(process.cwd(), 'public/minecraft/components');
const SKINS_OUTPUT_DIR = path.join(process.cwd(), 'public/minecraft/generated-skins');

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  SISTEMA MODULAR DE SKINS DE MINECRAFT - DEMOSTRACIÓN');
  console.log('═══════════════════════════════════════════════════════\n');

  // ====================================================================
  // PASO 1: Generar todos los componentes base
  // ====================================================================
  console.log('📦 PASO 1: Generando componentes base...\n');

  await fs.mkdir(COMPONENTS_OUTPUT_DIR, { recursive: true });
  await generateAllComponents(COMPONENTS_OUTPUT_DIR);

  console.log('\n✓ Componentes generados en:', COMPONENTS_OUTPUT_DIR);
  console.log('  - Categorías: eyes, mouth, hair_*, shirt, pants, jacket, etc.');
  console.log('  - Formatos: SVG (original) + PNG (para uso)\n');

  // ====================================================================
  // PASO 2: Ensamblar skins de ejemplo
  // ====================================================================
  console.log('🎨 PASO 2: Ensamblando skins de ejemplo...\n');

  await fs.mkdir(SKINS_OUTPUT_DIR, { recursive: true });

  // Ejemplo 1: Personaje femenino con pelo largo
  const config1: SkinConfiguration = {
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
      hairPrimary: '#8B4513',
      eyeColor: '#4169E1',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#FF69B4',
      clothingSecondary: '#FF1493',
    },
    components: {
      eyes: 'eyes_03',
      mouth: 'mouth_01',
      torso: 'torso_slim_01',
      arms: 'arms_slim_01',
      legs: 'legs_average_01',
      hairFront: 'hair_front_02',
      hairTop: 'hair_top_01',
      hairBack: 'hair_back_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  };

  console.log('  → Generando "female_example.png"...');
  const skin1 = await assembleSkin(config1, COMPONENTS_OUTPUT_DIR);
  await fs.writeFile(path.join(SKINS_OUTPUT_DIR, 'female_example.png'), skin1);
  console.log('    ✓ Skin femenina generada\n');

  // Ejemplo 2: Personaje masculino con lentes
  const config2: SkinConfiguration = {
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
      skinTone: '#D4A574',
      skinShadow: '#B8895E',
      skinHighlight: '#F0C18A',
      hairPrimary: '#2C1810',
      eyeColor: '#654321',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#0066CC',
      clothingSecondary: '#003366',
    },
    components: {
      eyes: 'eyes_01',
      mouth: 'mouth_02',
      torso: 'torso_athletic_01',
      arms: 'arms_classic_01',
      legs: 'legs_long_01',
      hairFront: 'hair_front_01',
      hairBack: 'hair_back_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      jacket: 'jacket_01',
      glasses: 'glasses_01',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  };

  console.log('  → Generando "male_example.png"...');
  const skin2 = await assembleSkin(config2, COMPONENTS_OUTPUT_DIR);
  await fs.writeFile(path.join(SKINS_OUTPUT_DIR, 'male_example.png'), skin2);
  console.log('    ✓ Skin masculina generada\n');

  // Ejemplo 3: Variación de colores (mismo diseño, colores diferentes)
  const config3 = {
    ...config1,
    colors: {
      ...config1.colors,
      hairPrimary: '#FFD700', // Pelo rubio
      eyeColor: '#228B22', // Ojos verdes
      clothingPrimary: '#9370DB', // Ropa púrpura
    },
  };

  console.log('  → Generando "variation_example.png" (mismos componentes, colores diferentes)...');
  const skin3 = await assembleSkin(config3, COMPONENTS_OUTPUT_DIR);
  await fs.writeFile(path.join(SKINS_OUTPUT_DIR, 'variation_example.png'), skin3);
  console.log('    ✓ Variación de color generada\n');

  // Ejemplo 4: Remera sola (manga corta, antebrazo y manos visibles)
  const config4: SkinConfiguration = {
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
      skinTone: '#F5D7B1',
      skinShadow: '#E5C7A1',
      skinHighlight: '#FFE7C1',
      hairPrimary: '#FF6B9D',
      eyeColor: '#4169E1',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#FFFFFF',
      clothingSecondary: '#FF1493',
    },
    components: {
      eyes: 'eyes_03',
      mouth: 'mouth_01',
      torso: 'torso_slim_01',
      arms: 'arms_slim_01',
      legs: 'legs_average_01',
      hairFront: 'hair_front_02',
      hairTop: 'hair_top_01',
      hairBack: 'hair_back_01',
      tShirt: 't_shirt_01', // Remera manga corta
      pants: 'pants_01',
      shoes: 'shoes_01', // Zapatillas
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  };

  console.log('  → Generando "tshirt_example.png" (remera con antebrazo visible)...');
  const skin4 = await assembleSkin(config4, COMPONENTS_OUTPUT_DIR);
  await fs.writeFile(path.join(SKINS_OUTPUT_DIR, 'tshirt_example.png'), skin4);
  console.log('    ✓ Skin con remera generada\n');

  // Ejemplo 5: Remera + Chaqueta (combinación de capas)
  const config5: SkinConfiguration = {
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
      skinTone: '#D4A574',
      skinShadow: '#B8895E',
      skinHighlight: '#F0C18A',
      hairPrimary: '#2C1810',
      eyeColor: '#654321',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#FF6B35', // Remera naranja
      clothingSecondary: '#1A1A2E', // Chaqueta negra
    },
    components: {
      eyes: 'eyes_01',
      mouth: 'mouth_02',
      torso: 'torso_athletic_01',
      arms: 'arms_classic_01',
      legs: 'legs_long_01',
      hairFront: 'hair_front_01',
      hairBack: 'hair_back_01',
      tShirt: 't_shirt_02', // Remera deportiva
      jacket: 'jacket_01', // Chaqueta encima
      pants: 'pants_01',
      shoes: 'shoes_02', // Zapatos formales
      glasses: 'glasses_01',
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  };

  console.log('  → Generando "layered_example.png" (remera + chaqueta + zapatos)...');
  const skin5 = await assembleSkin(config5, COMPONENTS_OUTPUT_DIR);
  await fs.writeFile(path.join(SKINS_OUTPUT_DIR, 'layered_example.png'), skin5);
  console.log('    ✓ Skin con capas generada\n');

  // Ejemplo 6: Outfit completo con guantes y botas
  const config6: SkinConfiguration = {
    bodyGenes: {
      height: 'average',
      build: 'athletic',
      armModel: 'classic',
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
      eyeExpression: 'happy',
      mouthExpression: 'smile',
    },
    colors: {
      skinTone: '#C68642',
      skinShadow: '#A67C52',
      skinHighlight: '#D69C6E',
      hairPrimary: '#8B4513',
      eyeColor: '#228B22',
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#2F4F4F', // Verde oscuro
      clothingSecondary: '#8B4513', // Marrón para accesorios
    },
    components: {
      eyes: 'eyes_02',
      mouth: 'mouth_03',
      torso: 'torso_average_01',
      arms: 'arms_classic_01',
      legs: 'legs_average_01',
      hairFront: 'hair_front_01',
      hairTop: 'hair_top_01',
      hairBack: 'hair_back_01',
      shirt: 'shirt_01',
      pants: 'pants_01',
      gloves: 'gloves_02', // Guantes de cuero
      boots: 'boots_01', // Botas altas
    },
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  };

  console.log('  → Generando "accessories_example.png" (con guantes y botas)...');
  const skin6 = await assembleSkin(config6, COMPONENTS_OUTPUT_DIR);
  await fs.writeFile(path.join(SKINS_OUTPUT_DIR, 'accessories_example.png'), skin6);
  console.log('    ✓ Skin con accesorios completos generada\n');

  // ====================================================================
  // PASO 3: Estadísticas
  // ====================================================================
  console.log('📊 ESTADÍSTICAS DEL SISTEMA:\n');

  // Contar componentes generados
  const categories = await fs.readdir(COMPONENTS_OUTPUT_DIR);
  let totalComponents = 0;
  let componentBreakdown: Record<string, number> = {};

  for (const category of categories) {
    const categoryPath = path.join(COMPONENTS_OUTPUT_DIR, category);
    const stat = await fs.stat(categoryPath);
    if (stat.isDirectory()) {
      const files = await fs.readdir(categoryPath);
      const pngFiles = files.filter(f => f.endsWith('.png'));
      componentBreakdown[category] = pngFiles.length;
      totalComponents += pngFiles.length;
    }
  }

  console.log(`  Total de componentes: ${totalComponents}`);
  console.log('  Desglose por categoría:');
  Object.entries(componentBreakdown).forEach(([cat, count]) => {
    console.log(`    - ${cat}: ${count} variaciones`);
  });

  console.log('\n  Combinaciones posibles (solo con componentes actuales):');
  const combinations = Object.values(componentBreakdown).reduce((acc, val) => acc * (val + 1), 1);
  console.log(`    → ${combinations.toLocaleString()} combinaciones únicas`);
  console.log(`    → Sin contar variaciones de color (×∞)`);

  console.log('\n  Costo de generación:');
  console.log(`    → Componentes base: $0.00 (generados con código)`);
  console.log(`    → Ensamblaje por skin: $0.00 (proceso local)`);
  console.log(`    → Selección con LLM: ~$0.001 por skin (Gemini Flash)`);
  console.log(`    → Total estimado: $0.001 por skin personalizada\n`);

  // ====================================================================
  // RESUMEN
  // ====================================================================
  console.log('═══════════════════════════════════════════════════════');
  console.log('  ✨ DEMOSTRACIÓN COMPLETADA');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('📁 Archivos generados:');
  console.log(`  Componentes: ${COMPONENTS_OUTPUT_DIR}`);
  console.log(`  Skins:       ${SKINS_OUTPUT_DIR}\n`);

  console.log('🎯 Próximos pasos recomendados:\n');
  console.log('  1. Expandir biblioteca de componentes:');
  console.log('     - Agregar más variaciones de ojos (10-20 tipos)');
  console.log('     - Más peinados (15-30 estilos)');
  console.log('     - Más ropa (50+ prendas diferentes)');
  console.log('     - Accesorios adicionales\n');

  console.log('  2. Integrar con sistema de agentes:');
  console.log('     - Modificar skin-trait-analyzer.ts para generar SkinConfiguration');
  console.log('     - Reemplazar renderSkinFromTraits() con assembleSkin()');
  console.log('     - Usar Gemini Flash para selección inteligente de componentes\n');

  console.log('  3. Generar biblioteca masiva con IA:');
  console.log('     - Usar Claude (yo) para generar 100+ componentes adicionales');
  console.log('     - Cada categoría con múltiples variaciones');
  console.log('     - SVG programático garantiza consistencia\n');

  console.log('🚀 Ventajas del sistema modular:');
  console.log('  ✓ Control total sobre calidad');
  console.log('  ✓ Consistencia perfecta (no errores de IA)');
  console.log('  ✓ Escalable a millones de variaciones');
  console.log('  ✓ Costo casi nulo ($0.001/skin)');
  console.log('  ✓ Editable sin regenerar todo');
  console.log('  ✓ Sistema de genes como Comes Alive\n');

  console.log('═══════════════════════════════════════════════════════\n');
}

main().catch(console.error);
