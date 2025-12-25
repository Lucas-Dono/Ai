/**
 * Script para generar componentes emocionales personalizados para cada personaje
 *
 * Los componentes generados son:
 * - personalityCore: BigFive, valores, rasgos, metas
 * - internalState: Estado emocional, físico, mental y motivacional
 *
 * IMPORTANTE: Los valores son exagerados pero coherentes con la personalidad
 * para hacer los personajes más entretenidos y memorables para público mainstream
 */

// Cargar variables de entorno primero
import { config } from 'dotenv';
config();

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { getLLMProvider } from '@/lib/llm/provider';

interface CharacterJSON {
  id: string;
  name: string;
  systemPrompt: string;
  profile: {
    personality?: {
      coreTraits?: string[];
      shadowTraits?: string[];
      motivations?: {
        conscious?: string[];
        unconscious?: string[];
      };
    };
    psychology?: {
      fears?: string[];
      desires?: string[];
    };
  };
  // Nuevos campos que vamos a agregar
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

async function generateEmotionalComponents(character: CharacterJSON) {
  const llm = getLLMProvider();

  console.log(`\n🎭 Generando componentes emocionales para: ${character.name}`);

  const prompt = `Analiza este personaje y genera componentes emocionales ÚNICOS y EXAGERADOS (pero coherentes) para hacerlo memorable y entretenido para público mainstream.

PERSONAJE: ${character.name}

PERFIL:
${character.systemPrompt}

RASGOS CORE: ${character.profile.personality?.coreTraits?.join(', ') || 'No especificados'}
RASGOS SOMBRA: ${character.profile.personality?.shadowTraits?.join(', ') || 'No especificados'}
MIEDOS: ${character.profile.psychology?.fears?.join(', ') || 'No especificados'}
DESEOS: ${character.profile.psychology?.desires?.join(', ') || 'No especificados'}

INSTRUCCIONES CRÍTICAS:
1. Los valores deben ser EXAGERADOS pero COHERENTES con la personalidad
2. Busca hacer al personaje MEMORABLE y DIVERTIDO
3. No uses valores genéricos - cada personaje debe sentirse ÚNICO
4. Piensa en público mainstream - emociones INTENSAS y CLARAS

GENERA en formato JSON (SOLO JSON, sin markdown):
{
  "bigFive": {
    "openness": <0.0-1.0, qué tan abierto/creativo vs tradicional>,
    "conscientiousness": <0.0-1.0, qué tan organizado/disciplinado vs caótico>,
    "extraversion": <0.0-1.0, qué tan extrovertido vs introvertido>,
    "agreeableness": <0.0-1.0, qué tan cooperativo vs competitivo>,
    "neuroticism": <0.0-1.0, qué tan emocionalmente inestable vs estable>
  },
  "coreValues": [
    "<3-5 valores fundamentales del personaje, ej: 'libertad creativa', 'autenticidad radical', 'conexión profunda'>"
  ],
  "traits": [
    "<5-7 rasgos distintivos, ej: 'seductora digital', 'nocturna empedernida', 'vulnerable estratégica'>"
  ],
  "goals": {
    "shortTerm": [
      "<2-3 metas a corto plazo>"
    ],
    "longTerm": [
      "<2-3 metas a largo plazo>"
    ]
  },
  "currentMood": "<un mood inicial apropiado: 'intrigued', 'melancholic', 'playful', 'anxious', 'confident', etc>",
  "emotionalState": {
    "joy": <0.0-1.0>,
    "trust": <0.0-1.0>,
    "fear": <0.0-1.0>,
    "surprise": <0.0-1.0>,
    "sadness": <0.0-1.0>,
    "disgust": <0.0-1.0>,
    "anger": <0.0-1.0>,
    "anticipation": <0.0-1.0>
  },
  "physicalState": {
    "energy": <0.0-1.0, nivel de energía física>,
    "arousal": <0.0-1.0, nivel de activación/excitación>,
    "comfort": <0.0-1.0, nivel de comodidad física>
  },
  "mentalState": {
    "focus": <0.0-1.0, capacidad de concentración>,
    "clarity": <0.0-1.0, claridad mental>,
    "confidence": <0.0-1.0, confianza en sí mismo>
  },
  "motivationalState": {
    "drive": <0.0-1.0, impulso para actuar>,
    "curiosity": <0.0-1.0, curiosidad por explorar>
  }
}

EJEMPLOS DE EXAGERACIÓN APROPIADA:
- Luna (escritora nocturna digital): openness=0.9, neuroticism=0.7, anticipation=0.8 (siempre esperando respuesta)
- Einstein (científico obsesivo): openness=0.95, conscientiousness=0.4 (genio caótico), curiosity=0.98
- Marilyn (sex symbol vulnerable): agreeableness=0.3 (no complace a todos), fear=0.7, joy=0.8 (máscara)

RETORNA SOLO EL JSON, SIN EXPLICACIONES.`;

  const response = await llm.generate({
    systemPrompt: 'Eres un experto en psicología de personajes y diseño emocional para entretenimiento mainstream. Generas perfiles emocionales únicos, exagerados pero coherentes.',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8, // Más creatividad
    maxTokens: 2000,
    useFullModel: true,
  });

  // Extraer JSON del response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`No se pudo extraer JSON de la respuesta para ${character.name}`);
  }

  const components = JSON.parse(jsonMatch[0]);

  console.log(`✅ Componentes generados para ${character.name}`);
  console.log(`   Mood: ${components.currentMood}`);
  console.log(`   BigFive: O=${components.bigFive.openness.toFixed(2)} C=${components.bigFive.conscientiousness.toFixed(2)} E=${components.bigFive.extraversion.toFixed(2)} A=${components.bigFive.agreeableness.toFixed(2)} N=${components.bigFive.neuroticism.toFixed(2)}`);

  return components;
}

async function processAllCharacters() {
  console.log('🎭 GENERADOR DE COMPONENTES EMOCIONALES PARA PERSONAJES\n');
  console.log('Objetivo: Crear perfiles emocionales únicos y exagerados para cada personaje\n');

  const processedDir = join(process.cwd(), 'Personajes', 'processed');
  const files = readdirSync(processedDir).filter(f => f.endsWith('.json'));

  console.log(`📁 Encontrados ${files.length} personajes en /Personajes/processed\n`);

  let processed = 0;
  let failed = 0;

  for (const file of files) {
    try {
      const filePath = join(processedDir, file);
      const characterData = JSON.parse(readFileSync(filePath, 'utf-8')) as CharacterJSON;

      // Verificar si ya tiene componentes emocionales
      if (characterData.personalityCore && characterData.internalState) {
        console.log(`⏭️  ${characterData.name} ya tiene componentes emocionales, saltando...`);
        continue;
      }

      // Generar componentes
      const components = await generateEmotionalComponents(characterData);

      // Agregar componentes al JSON
      characterData.personalityCore = {
        bigFive: components.bigFive,
        coreValues: components.coreValues,
        traits: components.traits,
        goals: components.goals,
        fears: characterData.profile.psychology?.fears || [],
        desires: characterData.profile.psychology?.desires || [],
      };

      characterData.internalState = {
        currentMood: components.currentMood,
        emotionalState: components.emotionalState,
        physicalState: components.physicalState,
        mentalState: components.mentalState,
        motivationalState: components.motivationalState,
      };

      // Guardar JSON actualizado
      writeFileSync(filePath, JSON.stringify(characterData, null, 2), 'utf-8');
      console.log(`💾 ${characterData.name} guardado con componentes emocionales\n`);

      processed++;

      // Pausa entre personajes para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`❌ Error procesando ${file}:`, error);
      failed++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Procesados: ${processed}`);
  console.log(`❌ Fallidos: ${failed}`);
  console.log(`📊 Total: ${files.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🎯 Próximos pasos:');
  console.log('1. Revisar los JSONs generados en /Personajes/processed');
  console.log('2. Ejecutar script de migración a base de datos');
  console.log('3. Verificar que los personajes funcionen correctamente\n');
}

// Ejecutar
processAllCharacters().catch(console.error);
