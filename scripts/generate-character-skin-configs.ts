/**
 * Genera configuraciones de skin Minecraft para cada personaje
 * basándose en los traits existentes y los componentes probados
 */

import fs from 'fs/promises';
import path from 'path';
import {
  generateComponentMapping,
  SPECIAL_CHARACTER_OVERRIDES,
  CharacterComponentMapping,
} from './minecraft-component-mappings';

interface MinecraftSkinTraits {
  version: number;
  gender: string;
  skinTone: string;
  hairColor: string;
  eyeColor: string;
  hairStyle: string;
  clothingStyle: string;
  hasGlasses: boolean;
  hasHat: boolean;
  hasFacialHair: boolean;
  templateId: string;
  generatedAt: string;
}

interface CharacterEntry {
  characterName: string;
  imageAnalyzed: string;
  minecraftSkinTraits: MinecraftSkinTraits;
}

interface TraitsBatchFile {
  processedAt: string;
  total: number;
  characters: CharacterEntry[];
}

// Componentes de pelo disponibles (probados en showcase)
const AVAILABLE_COMPONENTS = {
  hairFront: [
    'hair_short_01_pixie',
    'hair_short_02_bob',
    'hair_short_03_buzz',
    'hair_short_06_undercut',
    'hair_medium_01_lob',
    'hair_medium_03_shag',
    'hair_long_straight_07',
    'hair_long_02_wavy',
    'hair_curly_red_09',
    'hair_black_short_11',
    'hair_bob_13',
    'hair_long_black_14',
    'hair_messy_bun_12',
  ],
  hairBody: [
    'hair_body_long_07',
    'hair_long_body_02_wavy',
    'hair_body_curly_09',
  ],
  hairBack: [
    'hair_updo_01_high_ponytail',
  ],
  headBase: [
    'head_base_01',
    'head_female_01',
    'head_buzz_cut',
    'head_caesar_13',
    'head_base_peach',
    'body_bob_13',
    'body_goth_14',
  ],
  eyes: [
    'eyes_01',
    'eyes_02',
    'eyes_03',
    'eyes_female_01',
    'eyes_expressive_11',
    'eyes_cute_12',
    'eyes_bob_13',
    'eyes_goth_14',
  ],
};

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  GENERADOR DE CONFIGURACIONES DE SKIN');
  console.log('═══════════════════════════════════════════════════════\n');

  // Leer el archivo de traits
  const traitsPath = path.join(process.cwd(), 'scripts/minecraft-skin-traits-batch.json');
  const traitsContent = await fs.readFile(traitsPath, 'utf-8');
  const traitsData: TraitsBatchFile = JSON.parse(traitsContent);

  console.log(`📁 Leyendo ${traitsData.total} personajes...\n`);

  // Generar configuraciones para cada personaje
  const characterConfigs: Array<{
    characterName: string;
    mapping: CharacterComponentMapping;
    traits: MinecraftSkinTraits;
  }> = [];

  for (const character of traitsData.characters) {
    const { characterName, minecraftSkinTraits: traits } = character;

    // Generar mapeo base
    const baseMapping = generateComponentMapping({
      characterName,
      gender: traits.gender,
      hairStyle: traits.hairStyle,
      clothingStyle: traits.clothingStyle,
      hasGlasses: traits.hasGlasses,
      hasHat: traits.hasHat,
    });

    // Aplicar overrides especiales si existen
    const overrides = SPECIAL_CHARACTER_OVERRIDES[characterName];
    if (overrides) {
      Object.assign(baseMapping.components, overrides);
      baseMapping.notes += ' | Override especial aplicado';
    }

    // Limpiar componentes undefined
    const cleanedComponents: Record<string, string> = {};
    for (const [key, value] of Object.entries(baseMapping.components)) {
      if (value !== undefined) {
        cleanedComponents[key] = value;
      }
    }
    baseMapping.components = cleanedComponents as any;

    characterConfigs.push({
      characterName,
      mapping: baseMapping,
      traits,
    });
  }

  // Generar estadísticas
  const hairStyleCounts: Record<string, number> = {};
  const clothingStyleCounts: Record<string, number> = {};
  const componentUsage: Record<string, number> = {};

  for (const config of characterConfigs) {
    const { traits, mapping } = config;

    // Contar estilos
    hairStyleCounts[traits.hairStyle] = (hairStyleCounts[traits.hairStyle] || 0) + 1;
    clothingStyleCounts[traits.clothingStyle] = (clothingStyleCounts[traits.clothingStyle] || 0) + 1;

    // Contar uso de componentes
    for (const [key, value] of Object.entries(mapping.components)) {
      if (value) {
        const componentKey = `${key}:${value}`;
        componentUsage[componentKey] = (componentUsage[componentKey] || 0) + 1;
      }
    }
  }

  // Mostrar estadísticas
  console.log('📊 Estadísticas de estilos de pelo:');
  for (const [style, count] of Object.entries(hairStyleCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${style.padEnd(12)}: ${count} personajes`);
  }

  console.log('\n📊 Estadísticas de estilos de ropa:');
  for (const [style, count] of Object.entries(clothingStyleCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${style.padEnd(12)}: ${count} personajes`);
  }

  console.log('\n📊 Uso de componentes de pelo:');
  const hairComponents = Object.entries(componentUsage)
    .filter(([key]) => key.startsWith('hair'))
    .sort((a, b) => b[1] - a[1]);
  for (const [component, count] of hairComponents) {
    console.log(`   ${component.padEnd(40)}: ${count} usos`);
  }

  // Crear archivo de salida con configuraciones
  const outputData = {
    generatedAt: new Date().toISOString(),
    total: characterConfigs.length,
    availableComponents: AVAILABLE_COMPONENTS,
    statistics: {
      hairStyles: hairStyleCounts,
      clothingStyles: clothingStyleCounts,
    },
    characters: characterConfigs.map(config => ({
      characterName: config.characterName,
      gender: config.traits.gender,
      skinTone: config.traits.skinTone,
      hairColor: config.traits.hairColor,
      eyeColor: config.traits.eyeColor,
      components: config.mapping.components,
      notes: config.mapping.notes,
    })),
  };

  const outputPath = path.join(process.cwd(), 'scripts/minecraft-character-configs.json');
  await fs.writeFile(outputPath, JSON.stringify(outputData, null, 2));

  console.log(`\n💾 Configuraciones guardadas en: ${outputPath}`);

  // Crear archivo TypeScript con las configuraciones para uso en el código
  const tsOutput = `/**
 * Configuraciones de skin Minecraft generadas automáticamente
 * Generado: ${new Date().toISOString()}
 * Total: ${characterConfigs.length} personajes
 */

export interface CharacterSkinConfig {
  characterName: string;
  gender: string;
  skinTone: string;
  hairColor: string;
  eyeColor: string;
  components: {
    headBase?: string;
    eyes: string;
    mouth: string;
    torso: string;
    arms: string;
    legs: string;
    hairFront?: string;
    hairBody?: string;
    hairBack?: string;
    shirt?: string;
    tShirt?: string;
    jacket?: string;
    pants?: string;
    shoes?: string;
    glasses?: string;
    hat?: string;
  };
}

export const CHARACTER_SKIN_CONFIGS: Record<string, CharacterSkinConfig> = {
${characterConfigs.map(config => `  '${config.characterName}': {
    characterName: '${config.characterName}',
    gender: '${config.traits.gender}',
    skinTone: '${config.traits.skinTone}',
    hairColor: '${config.traits.hairColor}',
    eyeColor: '${config.traits.eyeColor}',
    components: ${JSON.stringify(config.mapping.components, null, 6).replace(/\n/g, '\n    ')},
  }`).join(',\n')}
};

export function getCharacterSkinConfig(characterName: string): CharacterSkinConfig | undefined {
  return CHARACTER_SKIN_CONFIGS[characterName];
}

export const ALL_CHARACTER_NAMES = [
${characterConfigs.map(c => `  '${c.characterName}'`).join(',\n')}
] as const;

export type CharacterName = typeof ALL_CHARACTER_NAMES[number];
`;

  const tsOutputPath = path.join(process.cwd(), 'lib/minecraft/character-skin-configs.ts');
  await fs.mkdir(path.dirname(tsOutputPath), { recursive: true });
  await fs.writeFile(tsOutputPath, tsOutput);

  console.log(`💾 Archivo TypeScript guardado en: ${tsOutputPath}`);

  // Mostrar algunos ejemplos
  console.log('\n📝 Ejemplos de configuraciones generadas:\n');

  const examples = ['albert-einstein', 'marilyn-monroe', 'socrates', 'frida-kahlo', 'luna'];
  for (const name of examples) {
    const config = characterConfigs.find(c => c.characterName === name);
    if (config) {
      console.log(`${name}:`);
      console.log(`   Pelo: ${config.mapping.components.hairFront || 'ninguno'}`);
      if (config.mapping.components.hairBody) {
        console.log(`   Pelo (cuerpo): ${config.mapping.components.hairBody}`);
      }
      if (config.mapping.components.hairBack) {
        console.log(`   Pelo (atrás): ${config.mapping.components.hairBack}`);
      }
      console.log(`   Ojos: ${config.mapping.components.eyes}`);
      console.log(`   Ropa: ${config.mapping.components.shirt || config.mapping.components.tShirt}`);
      console.log('');
    }
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('  ✨ GENERACIÓN COMPLETADA');
  console.log('═══════════════════════════════════════════════════════\n');
}

main().catch(console.error);
