/**
 * Script para actualizar personajes con nuevos campos psicológicos
 * Usa Gemini para generar bigFive, contradicciones, variaciones y evolución
 * basándose en el perfil existente de cada personaje
 */

import * as fs from 'fs';
import * as path from 'path';
import { getLLMProvider } from '../lib/llm/provider';
import { nanoid } from 'nanoid';

interface ExportedData {
  exportDate: string;
  totalCharacters: number;
  premium: any[];
  free: any[];
}

async function generatePsychologyFields(character: any) {
  console.log(`   📝 Generando campos psicológicos para ${character.name}...`);

  const profile = character.profile || {};
  const backstory = profile.backstory || {};
  const psychology = profile.psychology || {};
  const personality = profile.personality || {};

  const prompt = `Basándote en el siguiente perfil de personaje, genera campos psicológicos adicionales en formato JSON.

PERFIL DEL PERSONAJE:
Nombre: ${character.name}
Edad: ${profile.basicInfo?.age || 'desconocida'}
Ocupación: ${profile.basicInfo?.occupation || character.description}

BACKSTORY:
${JSON.stringify(backstory, null, 2)}

PSICOLOGÍA EXISTENTE:
${JSON.stringify(psychology, null, 2)}

PERSONALIDAD EXISTENTE:
${JSON.stringify(personality, null, 2)}

Genera el siguiente JSON con campos psicológicos nuevos:

{
  "bigFive": {
    "openness": número 0-100 (basado en creatividad, curiosidad del personaje),
    "conscientiousness": número 0-100 (basado en organización, disciplina),
    "extraversion": número 0-100 (basado en sociabilidad, energía social),
    "agreeableness": número 0-100 (basado en empatía, cooperación),
    "neuroticism": número 0-100 (basado en ansiedad, estabilidad emocional)
  },
  "internalContradictions": [
    {
      "trait": "Rasgo o comportamiento principal del personaje",
      "butAlso": "Rasgo contradictorio que coexiste",
      "trigger": "Qué causa o mantiene esta contradicción",
      "manifestation": "Cómo se manifiesta en su vida diaria"
    }
  ],
  "situationalVariations": [
    {
      "context": "Situación o contexto específico",
      "personalityShift": {
        "extraversion": número (solo si cambia significativamente)
      },
      "description": "Cómo se comporta diferente en este contexto"
    }
  ],
  "personalityEvolution": {
    "snapshots": [
      {
        "age": número (edad en momento clave),
        "bigFive": { "openness": número, "conscientiousness": número, "extraversion": número, "agreeableness": número, "neuroticism": número },
        "moment": "Descripción del momento (ej: 'Adolescencia', 'Después de X evento')",
        "descriptor": "Estado mental/emocional en ese momento",
        "trigger": "Evento que causó cambio (opcional para el primero)"
      }
    ],
    "currentTrajectory": "Descripción de tendencia actual de personalidad"
  }
}

INSTRUCCIONES:
- Genera 2-3 contradicciones internas realistas basadas en su historia
- Genera 2-3 variaciones situacionales donde su personalidad cambia significativamente
- Genera 2-3 snapshots de evolución basados en eventos clave de su backstory
- Los valores Big Five deben ser coherentes con su personalidad descrita
- Las contradicciones deben hacer al personaje más humano y complejo
- La evolución debe reflejar cómo eventos importantes lo transformaron

Responde SOLO con el JSON válido, sin texto adicional.`;

  try {
    const llm = getLLMProvider();
    const response = await llm.generate({
      systemPrompt: 'Eres un psicólogo experto que analiza perfiles de personajes y genera datos psicológicos realistas. Respondes siempre con JSON válido.',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 2000,
      temperature: 0.7,
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta');
    }

    const psychologyData = JSON.parse(jsonMatch[0]);

    // Añadir IDs a contradicciones
    if (psychologyData.internalContradictions) {
      psychologyData.internalContradictions = psychologyData.internalContradictions.map((c: any) => ({
        id: nanoid(),
        ...c
      }));
    }

    // Añadir IDs a snapshots
    if (psychologyData.personalityEvolution?.snapshots) {
      psychologyData.personalityEvolution.snapshots = psychologyData.personalityEvolution.snapshots.map((s: any) => ({
        id: nanoid(),
        ...s
      }));
    }

    console.log(`      ✅ Campos generados exitosamente`);
    return psychologyData;

  } catch (error: any) {
    console.error(`      ❌ Error generando para ${character.name}:`, error.message);
    return null;
  }
}

async function updateAllCharacters() {
  console.log('🔄 Actualizando personajes con nuevos campos psicológicos...\n');

  try {
    // Leer JSON exportado
    const jsonPath = path.join(process.cwd(), 'scripts', 'exported-characters.json');
    const data: ExportedData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    console.log(`📦 Procesando ${data.totalCharacters} personajes...\n`);

    const updatedPremium = [];
    const updatedFree = [];

    // Procesar personajes premium
    console.log('💎 Actualizando personajes Premium:\n');
    for (const char of data.premium) {
      const newFields = await generatePsychologyFields(char);

      if (newFields) {
        // Merge con psychology existente
        const updatedChar = {
          ...char,
          profile: {
            ...char.profile,
            psychology: {
              ...char.profile.psychology,
              bigFive: newFields.bigFive,
              internalContradictions: newFields.internalContradictions,
              situationalVariations: newFields.situationalVariations,
              personalityEvolution: newFields.personalityEvolution,
            }
          }
        };
        updatedPremium.push(updatedChar);
      } else {
        updatedPremium.push(char); // Keep original if generation failed
      }

      // Esperar 2 segundos entre llamadas para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Procesar personajes free
    console.log('\n🆓 Actualizando personajes Free:\n');
    for (const char of data.free) {
      const newFields = await generatePsychologyFields(char);

      if (newFields) {
        const updatedChar = {
          ...char,
          profile: {
            ...char.profile,
            psychology: {
              ...char.profile.psychology,
              bigFive: newFields.bigFive,
              internalContradictions: newFields.internalContradictions,
              situationalVariations: newFields.situationalVariations,
              personalityEvolution: newFields.personalityEvolution,
            }
          }
        };
        updatedFree.push(updatedChar);
      } else {
        updatedFree.push(char);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Guardar resultado
    const outputData = {
      exportDate: new Date().toISOString(),
      totalCharacters: updatedPremium.length + updatedFree.length,
      premium: updatedPremium,
      free: updatedFree
    };

    const outputPath = path.join(process.cwd(), 'scripts', 'updated-characters.json');
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

    console.log(`\n✅ Personajes actualizados guardados en: ${outputPath}`);
    console.log(`\n📊 Resumen:`);
    console.log(`   Total procesados: ${data.totalCharacters}`);
    console.log(`   Premium actualizados: ${updatedPremium.length}`);
    console.log(`   Free actualizados: ${updatedFree.length}`);
    console.log(`\n✨ ¡Listo! Ahora puedes generar el nuevo archivo de seed.`);

  } catch (error) {
    console.error('❌ Error actualizando personajes:', error);
    throw error;
  }
}

updateAllCharacters();
