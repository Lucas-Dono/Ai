/**
 * OPENAI WHISPER CLIENT
 *
 * Transcripción de audio a texto usando Whisper API de OpenAI
 * - Soporte para gpt-4o-transcribe y gpt-4o-mini-tts
 * - Análisis básico de tono emocional desde el audio
 */

import OpenAI from "openai";
import fs from "fs";

export interface WhisperTranscriptionResult {
  text: string;
  language?: string;
  duration?: number;

  // Análisis básico de características del audio
  audioAnalysis?: {
    speakingRate: number; // Estimado: palabras por minuto
    pauseCount: number; // Número de pausas detectadas
    confidence: number; // Confianza de la transcripción
  };
}

export interface EmotionalToneAnalysis {
  // Inferido del TEXTO + características del audio
  detectedEmotions: string[];
  valence: number; // -1 (negativo) a 1 (positivo)
  arousal: number; // 0 (calmado) a 1 (excitado)
  confidence: number;
}

export class WhisperClient {
  private openai: OpenAI;
  private model: string;

  constructor(apiKey?: string, model: "standard" | "mini" = "standard") {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });

    // Usar variable de entorno para el modelo
    this.model =
      model === "mini"
        ? process.env.openai_whisper_mini || "whisper-1"
        : process.env.openai_whisper || "whisper-1";

    console.log(`[WhisperClient] Initialized with model: ${this.model}`);
  }

  /**
   * Transcribe audio file to text
   */
  async transcribe(
    audioFilePath: string,
    options?: {
      language?: string;
      prompt?: string; // Contexto previo para mejorar precisión
      temperature?: number; // 0-1, menor = más conservador
    }
  ): Promise<WhisperTranscriptionResult> {
    try {
      console.log(`[Whisper] Transcribing audio: ${audioFilePath}`);

      const audioFile = fs.createReadStream(audioFilePath);

      const transcription = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: this.model,
        language: options?.language,
        prompt: options?.prompt,
        temperature: options?.temperature ?? 0.2,
        response_format: "verbose_json", // Incluye timestamps y metadata
      });

      // Analizar características básicas del audio
      const audioAnalysis = this.analyzeAudioCharacteristics(
        transcription.text,
        (transcription as any).duration
      );

      const result: WhisperTranscriptionResult = {
        text: transcription.text,
        language: transcription.language,
        duration: (transcription as any).duration,
        audioAnalysis,
      };

      console.log(`[Whisper] ✅ Transcription complete: "${result.text.substring(0, 50)}..."`);

      return result;
    } catch (error) {
      console.error("[Whisper] Error transcribing:", error);
      throw error;
    }
  }

  /**
   * Transcribe desde Buffer (útil para uploads)
   */
  async transcribeFromBuffer(
    audioBuffer: Buffer,
    filename: string,
    options?: {
      language?: string;
      prompt?: string;
      temperature?: number;
    }
  ): Promise<WhisperTranscriptionResult> {
    try {
      console.log(`[Whisper] Transcribing from buffer: ${filename}`);

      // Crear File desde Buffer (convert to Uint8Array to ensure proper type)
      const audioFile = new File([new Uint8Array(audioBuffer)], filename);

      const transcription = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: this.model,
        language: options?.language,
        prompt: options?.prompt,
        temperature: options?.temperature ?? 0.2,
        response_format: "verbose_json",
      });

      const audioAnalysis = this.analyzeAudioCharacteristics(
        transcription.text,
        (transcription as any).duration
      );

      return {
        text: transcription.text,
        language: transcription.language,
        duration: (transcription as any).duration,
        audioAnalysis,
      };
    } catch (error) {
      console.error("[Whisper] Error transcribing from buffer:", error);
      throw error;
    }
  }

  /**
   * Analiza características básicas del audio para inferir tono emocional
   */
  private analyzeAudioCharacteristics(
    text: string,
    duration?: number
  ): WhisperTranscriptionResult["audioAnalysis"] {
    if (!duration) {
      return undefined;
    }

    const wordCount = text.split(/\s+/).length;
    const speakingRate = (wordCount / duration) * 60; // palabras por minuto

    // Detectar pausas (aproximado por signos de puntuación)
    const pauseCount = (text.match(/[.!?;,]/g) || []).length;

    // Confianza básica (placeholder - Whisper no devuelve confidence score directo)
    const confidence = 0.85;

    return {
      speakingRate,
      pauseCount,
      confidence,
    };
  }

  /**
   * Análisis de tono emocional basado en texto + características del audio
   */
  async analyzeEmotionalTone(
    transcription: WhisperTranscriptionResult
  ): Promise<EmotionalToneAnalysis> {
    const text = transcription.text.toLowerCase();
    const audioAnalysis = transcription.audioAnalysis;

    // Análisis básico basado en reglas
    // TODO: Mejorar con modelo especializado (Hume AI, etc.)

    const detectedEmotions: string[] = [];
    let valence = 0; // neutral
    let arousal = 0.5; // medio

    // 1. Análisis de palabras clave emocionales
    const positiveKeywords = [
      "feliz",
      "alegre",
      "genial",
      "excelente",
      "increíble",
      "amor",
      "gracias",
      "maravilloso",
    ];
    const negativeKeywords = [
      "triste",
      "enojado",
      "frustrado",
      "terrible",
      "horrible",
      "odio",
      "mal",
      "difícil",
    ];
    const anxietyKeywords = [
      "preocupado",
      "nervioso",
      "ansioso",
      "miedo",
      "estresado",
    ];
    const excitementKeywords = [
      "emocionado",
      "wow",
      "increíble",
      "asombroso",
      "genial",
    ];

    // Contar keywords
    const positiveCount = positiveKeywords.filter((kw) =>
      text.includes(kw)
    ).length;
    const negativeCount = negativeKeywords.filter((kw) =>
      text.includes(kw)
    ).length;
    const anxietyCount = anxietyKeywords.filter((kw) =>
      text.includes(kw)
    ).length;
    const excitementCount = excitementKeywords.filter((kw) =>
      text.includes(kw)
    ).length;

    // 2. Calcular valence
    valence = Math.max(
      -1,
      Math.min(1, (positiveCount - negativeCount) * 0.3)
    );

    // 3. Calcular arousal desde características del audio
    if (audioAnalysis) {
      // Speaking rate rápido → arousal alto
      if (audioAnalysis.speakingRate > 150) {
        arousal += 0.2;
      } else if (audioAnalysis.speakingRate < 100) {
        arousal -= 0.2;
      }

      // Pocas pausas → arousal alto (hablando rápido sin parar)
      if (audioAnalysis.pauseCount < 2) {
        arousal += 0.1;
      }
    }

    // 4. Detectar emociones específicas
    if (positiveCount > 0) {
      detectedEmotions.push("joy");
    }
    if (negativeCount > 0) {
      detectedEmotions.push("distress");
    }
    if (anxietyCount > 0) {
      detectedEmotions.push("anxiety");
    }
    if (excitementCount > 0) {
      detectedEmotions.push("excitement");
    }

    // 5. Análisis de signos de exclamación/interrogación
    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;

    if (exclamationCount > 0) {
      arousal += 0.1;
      if (!detectedEmotions.includes("excitement")) {
        detectedEmotions.push("excitement");
      }
    }

    if (questionCount > 1) {
      if (!detectedEmotions.includes("curiosity")) {
        detectedEmotions.push("curiosity");
      }
    }

    // Normalizar arousal
    arousal = Math.max(0, Math.min(1, arousal));

    // Si no se detectó nada, asumir neutral
    if (detectedEmotions.length === 0) {
      detectedEmotions.push("neutral");
    }

    const confidence = audioAnalysis?.confidence || 0.7;

    console.log(`[Whisper] Emotional tone analysis:`, {
      detectedEmotions,
      valence: valence.toFixed(2),
      arousal: arousal.toFixed(2),
      confidence: confidence.toFixed(2),
    });

    return {
      detectedEmotions,
      valence,
      arousal,
      confidence,
    };
  }
}

// Singleton instance
let whisperClient: WhisperClient | null = null;

export function getWhisperClient(model: "standard" | "mini" = "standard"): WhisperClient {
  if (!whisperClient) {
    whisperClient = new WhisperClient(undefined, model);
  }
  return whisperClient;
}
