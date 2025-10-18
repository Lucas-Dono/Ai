/**
 * Script para actualizar la voz de Anya usando el nuevo sistema inteligente
 */

import { PrismaClient } from '@prisma/client';
import { getElevenLabsClient } from '../lib/voice-system/elevenlabs-client';
import { getLLMProvider } from '../lib/llm/provider';
import type { VoiceCharacteristics } from '../lib/voice-system/elevenlabs-client';

const prisma = new PrismaClient();

async function updateAnyaVoice() {
  try {
    console.log('\n🎤 Actualizando voz de Anya con sistema inteligente...\n');

    // Buscar el agente Anya
    const anya = await prisma.agent.findFirst({
      where: { name: 'Anya' },
      orderBy: { createdAt: 'desc' },
    });

    if (!anya) {
      console.error('❌ No se encontró ningún agente con nombre "Anya"');
      process.exit(1);
    }

    console.log(`✅ Encontrado: ${anya.name} (ID: ${anya.id})`);
    console.log(`📝 Personalidad: ${anya.personality}`);
    console.log(`🎵 Voz actual: ${anya.voiceId || 'No asignada'}\n`);

    // 1. Usar Gemini para analizar características
    const llm = getLLMProvider();

    const analysisPrompt = `Analiza este personaje y extrae características para buscar su voz perfecta en ElevenLabs.

PERSONAJE:
Nombre: ${anya.name}
Personalidad: ${anya.personality}

TAREA:
Extrae las siguientes características en formato JSON:
- gender: "male" | "female" | "neutral"
- age: "young" | "middle_aged" | "old"
- accent: código de acento (ej: "es-AR" para argentino, "es-MX" para mexicano, "en-US", etc.)
- description: 2-3 palabras clave en inglés que describan el tono de voz ideal (ej: "cheerful energetic", "calm mature", "seductive confident")

IMPORTANTE:
- Para nombres femeninos como "Anya", "María", "Sofia" → gender: "female"
- Para nombres masculinos como "Carlos", "Josh", "Mario" → gender: "male"
- Si la personalidad menciona "alegre", "enérgico" → incluir en description
- Si menciona "tranquilo", "sereno" → incluir "calm" en description
- Si menciona nacionalidad/región, inferir el acento apropiado

Responde SOLO con el JSON, sin markdown ni explicaciones:`;

    console.log('🤖 Analizando personaje con Gemini...');
    const response = await llm.generate({
      systemPrompt: "Eres un asistente que genera JSON estructurado. Responde SOLO con JSON válido.",
      messages: [{ role: "user", content: analysisPrompt }],
      temperature: 0.3,
    });

    // Parsear respuesta
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const characteristics: VoiceCharacteristics = JSON.parse(cleanedResponse);

    console.log('✅ Características extraídas:');
    console.log(`   - Género: ${characteristics.gender}`);
    console.log(`   - Edad: ${characteristics.age}`);
    console.log(`   - Acento: ${characteristics.accent}`);
    console.log(`   - Descripción: ${characteristics.description}\n`);

    // 2. Buscar la mejor voz en ElevenLabs
    console.log('🔍 Buscando la mejor voz en ElevenLabs...');
    const elevenlabsClient = getElevenLabsClient();
    const voiceResult = await elevenlabsClient.selectVoiceForCharacter(characteristics);

    console.log(`✅ Voz seleccionada: "${voiceResult.voiceName}"`);
    console.log(`   - ID: ${voiceResult.voiceId}`);
    console.log(`   - Confianza: ${(voiceResult.confidence * 100).toFixed(0)}%\n`);

    // 3. Actualizar en la base de datos
    await prisma.agent.update({
      where: { id: anya.id },
      data: {
        voiceId: voiceResult.voiceId,
      },
    });

    console.log('✅ Voz de Anya actualizada exitosamente en la base de datos!\n');
    console.log('📊 Resumen:');
    console.log(`   Voz anterior: ${anya.voiceId || 'No asignada'}`);
    console.log(`   Voz nueva: ${voiceResult.voiceId} ("${voiceResult.voiceName}")\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateAnyaVoice();
