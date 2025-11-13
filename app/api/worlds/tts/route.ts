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
import { canSendVoiceMessage, trackVoiceMessageUsage } from '@/lib/usage/daily-limits';
import { checkCooldown, trackCooldown } from '@/lib/usage/cooldown-tracker';

const log = createLogger('API/Worlds/TTS');

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userPlan = (session.user as any).plan || 'free';

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // COOLDOWN CHECK for Voice (Anti-Bot Protection)
    // Free: N/A (sin acceso), Plus: 3s, Ultra: 5s
    // Voice es COSTOSO ($0.17/msg), cooldown crítico para prevenir bots
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const voiceCooldownCheck = await checkCooldown(userId, "voice", userPlan);

    if (!voiceCooldownCheck.allowed) {
      log.warn({
        userId,
        userPlan,
        waitMs: voiceCooldownCheck.waitMs,
      }, 'Voice message blocked by cooldown');

      return NextResponse.json({
        error: voiceCooldownCheck.message || "Por favor espera antes de generar otro mensaje de voz",
        code: "COOLDOWN_ACTIVE",
        waitMs: voiceCooldownCheck.waitMs,
        retryAfter: new Date(Date.now() + voiceCooldownCheck.waitMs).toISOString(),
      }, {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(voiceCooldownCheck.waitMs / 1000).toString(),
          "X-Cooldown-Type": "voice",
          "X-Cooldown-Wait-Ms": voiceCooldownCheck.waitMs.toString(),
        },
      });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ANTI-ABUSE: Verificar límites de mensajes de voz ANTES de generar
    // Voice es COSTOSO ($0.17/mensaje), protección crítica
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const voiceCheck = await canSendVoiceMessage(userId, userPlan);

    if (!voiceCheck.allowed) {
      log.warn({
        userId,
        userPlan,
        currentDaily: voiceCheck.currentDaily,
        dailyLimit: voiceCheck.dailyLimit,
        currentMonthly: voiceCheck.currentMonthly,
        monthlyLimit: voiceCheck.monthlyLimit,
        reason: voiceCheck.reason,
      }, 'Voice message limit exceeded');

      return NextResponse.json(
        {
          error: voiceCheck.reason || 'Límite de mensajes de voz alcanzado',
          currentDaily: voiceCheck.currentDaily,
          dailyLimit: voiceCheck.dailyLimit,
          currentMonthly: voiceCheck.currentMonthly,
          monthlyLimit: voiceCheck.monthlyLimit,
          upgradeUrl: '/pricing',
        },
        { status: 429 }
      );
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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ANTI-ABUSE: Registrar uso de mensaje de voz (después de éxito)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await trackVoiceMessageUsage(userId);
    log.info({ userId, userPlan }, 'Voice message usage tracked');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // COOLDOWN TRACKING (after successful generation)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await trackCooldown(userId, "voice", userPlan);
    log.info({ userId, userPlan }, 'Voice cooldown tracked successfully');

    return NextResponse.json({
      success: true,
      audioBase64,
      mimeType: 'audio/mpeg',
      speed: voiceConfig.speed,   // Para aplicar velocidad en el cliente
      volume: voiceConfig.volume,  // Para aplicar volumen en el cliente
      cleanedText, // Para debug
      // Incluir info de uso para mostrar al usuario
      usage: {
        currentDaily: voiceCheck.currentDaily + 1, // +1 porque ya se registró
        dailyLimit: voiceCheck.dailyLimit,
        currentMonthly: voiceCheck.currentMonthly + 1,
        monthlyLimit: voiceCheck.monthlyLimit,
      },
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
