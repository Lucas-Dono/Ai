/**
 * Text-to-Speech API for Worlds
 * POST /api/worlds/tts - Generate voice for character dialogue
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getElevenLabsClient } from '@/lib/voice-system/elevenlabs-client';
import { cleanTextForTTS, hasSpokenContent } from '@/lib/voice-system/text-cleaner';
import { getVoiceConfig, getVoiceSettings } from '@/lib/voice-system/voice-config';
import { createLogger } from '@/lib/logger';

const log = createLogger('API/Worlds/TTS');

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, voiceId, emotion } = await req.json();

    if (!text || !voiceId) {
      return NextResponse.json(
        { error: 'text and voiceId are required' },
        { status: 400 }
      );
    }

    // Limpiar texto de acciones, risas, etc.
    const cleanedText = cleanTextForTTS(text);

    // Verificar que hay contenido hablable
    if (!hasSpokenContent(cleanedText)) {
      log.warn({ text, cleanedText }, 'No spoken content after cleaning');
      return NextResponse.json(
        { error: 'No spoken content in text' },
        { status: 400 }
      );
    }

    log.info({
      voiceId,
      originalLength: text.length,
      cleanedLength: cleanedText.length,
      emotion,
    }, 'Generating TTS');

    const elevenlabs = getElevenLabsClient();

    // Usar configuración específica del personaje
    const voiceConfig = getVoiceConfig(voiceId);
    const voiceSettings = getVoiceSettings(voiceId);

    log.info({ voiceConfig: voiceConfig.name, settings: voiceSettings }, 'Using voice config');

    // Generar el audio con configuración mejorada
    const result = await elevenlabs.generateSpeech(cleanedText, voiceId, {
      currentEmotion: emotion || 'neutral',
      intensity: 0.6,
      mood: {
        valence: 0.5,
        arousal: 0.5,
        dominance: 0.5,
      },
      ...voiceSettings,
    });

    // Convertir a base64 para enviarlo al cliente
    const audioBase64 = result.audioBuffer.toString('base64');

    log.info({
      audioSize: result.audioBuffer.length,
      speed: voiceConfig.speed,
    }, 'TTS generated successfully');

    return NextResponse.json({
      success: true,
      audioBase64,
      mimeType: 'audio/mpeg',
      speed: voiceConfig.speed,   // Para aplicar velocidad en el cliente
      volume: voiceConfig.volume,  // Para aplicar volumen en el cliente
      cleanedText, // Para debug
    });
  } catch (error) {
    log.error({ error }, 'Error generating TTS');
    return NextResponse.json(
      {
        error: 'Failed to generate speech',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
