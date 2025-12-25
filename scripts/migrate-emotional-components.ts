/**
 * Script de migración: Actualiza base de datos con componentes emocionales
 *
 * Lee los JSONs procesados (que ahora tienen personalityCore y internalState)
 * y actualiza/crea los registros en la base de datos
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { prisma } from '@/lib/prisma';

interface CharacterJSON {
  id: string;
  name: string;
  personalityCore?: {
    bigFive: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    coreValues: string[];
    traits: string[];
    goals: {
      shortTerm: string[];
      longTerm: string[];
    };
    fears: string[];
    desires: string[];
  };
  internalState?: {
    currentMood: string;
    emotionalState: {
      joy: number;
      trust: number;
      fear: number;
      surprise: number;
      sadness: number;
      disgust: number;
      anger: number;
      anticipation: number;
    };
    physicalState: {
      energy: number;
      arousal: number;
      comfort: number;
    };
    mentalState: {
      focus: number;
      clarity: number;
      confidence: number;
    };
    motivationalState: {
      drive: number;
      curiosity: number;
    };
  };
}

async function migrateCharacter(character: CharacterJSON) {
  console.log(`\n📝 Migrando: ${character.name} (${character.id})`);

  // Verificar que el personaje existe en la BD
  const agent = await prisma.agent.findUnique({
    where: { id: character.id },
    include: {
      personalityCore: true,
      internalState: true,
    },
  });

  if (!agent) {
    console.log(`   ⚠️  Agente no existe en BD, saltando...`);
    return { status: 'not_found', name: character.name };
  }

  // Verificar que tiene componentes emocionales en JSON
  if (!character.personalityCore || !character.internalState) {
    console.log(`   ⚠️  JSON no tiene componentes emocionales, saltando...`);
    return { status: 'missing_components', name: character.name };
  }

  let personalityCoreCreated = false;
  let internalStateCreated = false;

  // Convertir BigFive de 0-1 a 0-100 si es necesario
  const bigFive = character.personalityCore.bigFive;
  const bigFiveInt = {
    openness: bigFive.openness > 1 ? Math.round(bigFive.openness) : Math.round(bigFive.openness * 100),
    conscientiousness: bigFive.conscientiousness > 1 ? Math.round(bigFive.conscientiousness) : Math.round(bigFive.conscientiousness * 100),
    extraversion: bigFive.extraversion > 1 ? Math.round(bigFive.extraversion) : Math.round(bigFive.extraversion * 100),
    agreeableness: bigFive.agreeableness > 1 ? Math.round(bigFive.agreeableness) : Math.round(bigFive.agreeableness * 100),
    neuroticism: bigFive.neuroticism > 1 ? Math.round(bigFive.neuroticism) : Math.round(bigFive.neuroticism * 100),
  };

  // Crear o actualizar PersonalityCore
  if (agent.personalityCore) {
    console.log(`   🔄 Actualizando PersonalityCore existente...`);
    await prisma.personalityCore.update({
      where: { id: agent.personalityCore.id },
      data: {
        openness: bigFiveInt.openness,
        conscientiousness: bigFiveInt.conscientiousness,
        extraversion: bigFiveInt.extraversion,
        agreeableness: bigFiveInt.agreeableness,
        neuroticism: bigFiveInt.neuroticism,
        coreValues: character.personalityCore.coreValues,
        moralSchemas: [], // Default empty array
        baselineEmotions: {}, // Default empty object
      },
    });
  } else {
    console.log(`   ✨ Creando nuevo PersonalityCore...`);
    await prisma.personalityCore.create({
      data: {
        agentId: agent.id,
        openness: bigFiveInt.openness,
        conscientiousness: bigFiveInt.conscientiousness,
        extraversion: bigFiveInt.extraversion,
        agreeableness: bigFiveInt.agreeableness,
        neuroticism: bigFiveInt.neuroticism,
        coreValues: character.personalityCore.coreValues,
        moralSchemas: [], // Default empty array
        baselineEmotions: {}, // Default empty object
      },
    });
    personalityCoreCreated = true;
  }

  // NOTE: Saltamos InternalState por ahora porque los campos generados por los agentes
  // no coinciden con el schema de Prisma. Necesitamos mapear o modificar el schema.
  console.log(`   ⏭️  InternalState omitido (schema no compatible)`);

  console.log(`   ✅ Migración completada`);
  if (personalityCoreCreated || internalStateCreated) {
    console.log(`      ${personalityCoreCreated ? '✨ PersonalityCore creado' : ''}`);
    console.log(`      ${internalStateCreated ? '✨ InternalState creado' : ''}`);
  }

  return { status: 'success', name: character.name };
}

async function migrateAllCharacters() {
  console.log('🚀 MIGRACIÓN DE COMPONENTES EMOCIONALES A BASE DE DATOS\n');
  console.log('Este script actualiza la BD con los componentes emocionales generados\n');

  const processedDir = join(process.cwd(), 'Personajes', 'processed');
  const files = readdirSync(processedDir).filter(f => f.endsWith('.json'));

  console.log(`📁 Encontrados ${files.length} personajes en /Personajes/processed\n`);

  const results = {
    success: [] as string[],
    notFound: [] as string[],
    missingComponents: [] as string[],
    failed: [] as string[],
  };

  for (const file of files) {
    try {
      const filePath = join(processedDir, file);
      const characterData = JSON.parse(readFileSync(filePath, 'utf-8')) as CharacterJSON;

      const result = await migrateCharacter(characterData);

      switch (result.status) {
        case 'success':
          results.success.push(result.name);
          break;
        case 'not_found':
          results.notFound.push(result.name);
          break;
        case 'missing_components':
          results.missingComponents.push(result.name);
          break;
      }

    } catch (error) {
      console.error(`❌ Error migrando ${file}:`, error);
      results.failed.push(file);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RESUMEN DE MIGRACIÓN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Exitosos: ${results.success.length}`);
  console.log(`⚠️  No encontrados en BD: ${results.notFound.length}`);
  console.log(`⚠️  Sin componentes emocionales: ${results.missingComponents.length}`);
  console.log(`❌ Fallidos: ${results.failed.length}`);
  console.log(`📊 Total procesados: ${files.length}\n`);

  if (results.notFound.length > 0) {
    console.log('📋 Personajes no encontrados en BD:');
    results.notFound.forEach(name => console.log(`   - ${name}`));
    console.log();
  }

  if (results.missingComponents.length > 0) {
    console.log('📋 Personajes sin componentes emocionales:');
    console.log('   (Ejecuta generate-emotional-components.ts primero)');
    results.missingComponents.forEach(name => console.log(`   - ${name}`));
    console.log();
  }

  if (results.failed.length > 0) {
    console.log('📋 Personajes fallidos:');
    results.failed.forEach(name => console.log(`   - ${name}`));
    console.log();
  }

  console.log('✨ ¡Migración completada!');
  console.log('   Los personajes ahora tienen perfiles emocionales únicos y exagerados.\n');

  await prisma.$disconnect();
}

// Ejecutar
migrateAllCharacters().catch(console.error);
