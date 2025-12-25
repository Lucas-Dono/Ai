/**
 * Script para adaptar componentes emocionales generados al schema de Prisma
 *
 * Transforma la estructura generada por agentes a la que espera la BD
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface GeneratedPersonalityCore {
  bigFive: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  coreValues: string[];
  traits?: any;
  goals?: any;
  fears?: any;
  desires?: any;
}

interface GeneratedInternalState {
  currentMood: string;
  emotionalState: any;
  physicalState?: any;
  mentalState?: any;
  motivationalState?: any;
}

interface CharacterJSON {
  id: string;
  name: string;
  personalityCore?: GeneratedPersonalityCore;
  internalState?: GeneratedInternalState;
}

/**
 * Adapta PersonalityCore al schema de Prisma
 * Schema espera: bigFive como campos separados Int, coreValues como Json
 */
function adaptPersonalityCore(generated: GeneratedPersonalityCore) {
  // Convertir BigFive de 0-1 a 0-100 si es necesario
  const bigFive = generated.bigFive;
  const bigFiveInt = {
    openness: bigFive.openness > 1 ? Math.round(bigFive.openness) : Math.round(bigFive.openness * 100),
    conscientiousness: bigFive.conscientiousness > 1 ? Math.round(bigFive.conscientiousness) : Math.round(bigFive.conscientiousness * 100),
    extraversion: bigFive.extraversion > 1 ? Math.round(bigFive.extraversion) : Math.round(bigFive.extraversion * 100),
    agreeableness: bigFive.agreeableness > 1 ? Math.round(bigFive.agreeableness) : Math.round(bigFive.agreeableness * 100),
    neuroticism: bigFive.neuroticism > 1 ? Math.round(bigFive.neuroticism) : Math.round(bigFive.neuroticism * 100),
  };

  return {
    bigFive: bigFiveInt,
    coreValues: generated.coreValues,
    moralSchemas: [], // Será llenado manualmente después si es necesario
    baselineEmotions: {}, // Será calculado de internalState si existe
    // Nota: traits, goals, fears, desires se eliminan porque no están en schema
  };
}

/**
 * Adapta InternalState al schema de Prisma
 * Schema espera: currentEmotions (Json), PAD mood (Floats), needs (Floats), activeGoals (Json)
 */
function adaptInternalState(generated: GeneratedInternalState) {
  // Extraer emociones del emotionalState generado
  let currentEmotions = {};

  if (typeof generated.emotionalState === 'object') {
    // Si es formato Plutchik (joy, trust, fear, etc.)
    if ('joy' in generated.emotionalState || 'trust' in generated.emotionalState) {
      currentEmotions = generated.emotionalState;
    }
    // Si tiene formato diferente, intentar extraer
    else if ('primary' in generated.emotionalState || 'secondary' in generated.emotionalState) {
      // Para personajes como Marilyn que tienen estructura narrativa
      currentEmotions = {
        joy: 0.5,
        trust: 0.5,
        fear: 0.3,
        surprise: 0.4,
        sadness: 0.3,
        disgust: 0.1,
        anger: 0.2,
        anticipation: 0.5,
      };
    }
  }

  // Calcular PAD mood desde currentMood o valores por defecto
  let moodValence = 0.0;  // -1 a +1
  let moodArousal = 0.5;  // 0 a 1
  let moodDominance = 0.5; // 0 a 1

  // Intentar inferir desde el texto del mood
  const moodText = typeof generated.currentMood === 'string'
    ? generated.currentMood.toLowerCase()
    : JSON.stringify(generated.currentMood || {}).toLowerCase();

  // Valence (positivo/negativo)
  if (moodText.includes('happy') || moodText.includes('joy') || moodText.includes('excited') || moodText.includes('electrificada')) {
    moodValence = 0.6;
  } else if (moodText.includes('sad') || moodText.includes('depressed') || moodText.includes('melancholic') || moodText.includes('agotada')) {
    moodValence = -0.4;
  } else if (moodText.includes('anxious') || moodText.includes('worried') || moodText.includes('ansiedad')) {
    moodValence = -0.3;
  } else if (moodText.includes('angry') || moodText.includes('furious')) {
    moodValence = -0.5;
  }

  // Arousal (activación)
  if (moodText.includes('excited') || moodText.includes('energetic') || moodText.includes('electrificada') || moodText.includes('intenso')) {
    moodArousal = 0.8;
  } else if (moodText.includes('calm') || moodText.includes('relaxed') || moodText.includes('peaceful')) {
    moodArousal = 0.3;
  } else if (moodText.includes('anxious') || moodText.includes('worried')) {
    moodArousal = 0.7;
  }

  // Dominance (control)
  if (moodText.includes('confident') || moodText.includes('dominant') || moodText.includes('control')) {
    moodDominance = 0.7;
  } else if (moodText.includes('submissive') || moodText.includes('vulnerable') || moodText.includes('helpless')) {
    moodDominance = 0.3;
  }

  return {
    currentEmotions,
    moodValence,
    moodArousal,
    moodDominance,
    emotionDecayRate: 0.1,
    emotionInertia: 0.3,
    needConnection: 0.5,
    needAutonomy: 0.5,
    needCompetence: 0.5,
    needNovelty: 0.5,
    activeGoals: [],
  };
}

async function processAllCharacters() {
  console.log('🔧 ADAPTANDO COMPONENTES EMOCIONALES AL SCHEMA\n');
  console.log('Transforma estructura generada → estructura de BD\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const processedDir = join(process.cwd(), 'Personajes', 'processed');
  const files = readdirSync(processedDir).filter(f => f.endsWith('.json'));

  let adapted = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    try {
      const filePath = join(processedDir, file);
      const character = JSON.parse(readFileSync(filePath, 'utf-8')) as CharacterJSON;

      let modified = false;

      // Adaptar PersonalityCore
      if (character.personalityCore) {
        const adapted = adaptPersonalityCore(character.personalityCore);
        character.personalityCore = adapted as any;
        modified = true;
      }

      // Adaptar InternalState
      if (character.internalState) {
        const adapted = adaptInternalState(character.internalState);
        character.internalState = adapted as any;
        modified = true;
      }

      if (modified) {
        writeFileSync(filePath, JSON.stringify(character, null, 2), 'utf-8');
        console.log(`✅ ${character.name}`);
        adapted++;
      } else {
        console.log(`⏭️  ${character.name}: Sin componentes emocionales`);
        skipped++;
      }

    } catch (error) {
      console.error(`❌ Error procesando ${file}:`, error);
      errors++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Adaptados: ${adapted}`);
  console.log(`⏭️  Sin componentes: ${skipped}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`📊 Total: ${files.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('✨ Próximo paso: Ejecutar migrate-emotional-components.ts');
}

processAllCharacters().catch(console.error);
