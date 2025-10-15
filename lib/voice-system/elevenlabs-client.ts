/**
 * ELEVENLABS CLIENT
 *
 * Síntesis de voz emocional usando ElevenLabs API
 * - Selección automática de voz desde Voice Library
 * - Modulación emocional mediante stability/similarity
 * - Soporte para múltiples idiomas
 */

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { BigFiveTraits, EmotionState, PADMood } from "../emotional-system/types";
import fs from "fs";
import path from "path";

export interface VoiceCharacteristics {
  gender: "male" | "female" | "neutral";
  age: "young" | "middle_aged" | "old";
  accent?: string; // "es-MX", "es-AR", "es-ES", "en-US", etc.
  description: string; // Descripción del personaje para matching
  personality?: BigFiveTraits;
}

export interface EmotionalVoiceModulation {
  currentEmotion: string;
  intensity: number; // 0-1
  mood: PADMood;

  // Parámetros de ElevenLabs
  stability: number; // 0-1 (0 = más variable/emocional, 1 = más estable)
  similarity_boost: number; // 0-1 (qué tan similar a la voz original)
  style?: number; // 0-1 (exageración de estilo)
  use_speaker_boost?: boolean;
}

export interface VoiceGenerationResult {
  audioBuffer: Buffer;
  audioUrl?: string;
  duration?: number;
  voiceId: string;
  voiceName: string;
}

interface ElevenLabsVoice {
  voiceId: string;  // camelCase format from @elevenlabs/elevenlabs-js
  name: string;
  category?: string;
  labels?: Record<string, string>;
  description?: string;
  previewUrl?: string;
}

export class ElevenLabsVoiceClient {
  private client: ElevenLabsClient;
  private apiKey: string;

  // Voces predefinidas (fallback)
  private readonly PRESET_VOICES = {
    female: {
      Gaby: process.env.Gaby || "5vkxOzoz40FrElmLP4P7",
      Marcela: process.env.Marcela || "86V9x9hrQds83qf7zaGn",
      Fran_woman: process.env.Fran_woman || "crQgCQuWgUucmYHEPsrB",
    },
    male: {
      Mario: process.env.Mario || "tomkxGQGz4b1kE0EM722",
      Nikolas: process.env.Nikolas || "PadrefepT3XCgwEQJiux",
      Agustin: process.env.Agustin || "ByVRQtaK1WDOvTmP1PKO",
    },
  };

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || "";

    if (!this.apiKey) {
      throw new Error("ElevenLabs API key not found");
    }

    this.client = new ElevenLabsClient({
      apiKey: this.apiKey,
    });

    console.log("[ElevenLabs] Client initialized");
  }

  /**
   * Selecciona automáticamente la mejor voz desde ElevenLabs Voice Library
   * basándose en las características del personaje
   */
  async selectVoiceForCharacter(
    characteristics: VoiceCharacteristics
  ): Promise<{ voiceId: string; voiceName: string; confidence: number }> {
    try {
      console.log("[ElevenLabs] Selecting voice for character:", characteristics);

      // 1. Obtener todas las voces disponibles
      const voices = await this.getAvailableVoices();

      if (voices.length === 0) {
        console.warn("[ElevenLabs] No voices found in library, using preset");
        return this.getFallbackVoice(characteristics.gender);
      }

      // 2. Filtrar por género y categoría
      let candidates = voices.filter((voice) => {
        const labels = voice.labels || {};

        // Filtrar por género
        const genderMatch =
          (characteristics.gender === "male" && labels.gender === "male") ||
          (characteristics.gender === "female" && labels.gender === "female") ||
          characteristics.gender === "neutral";

        // Filtrar por idioma/acento si está especificado
        let accentMatch = true;
        if (characteristics.accent) {
          const accentLabel = labels.accent?.toLowerCase() || "";
          const targetAccent = characteristics.accent.toLowerCase();
          accentMatch = accentLabel.includes(targetAccent);
        }

        return genderMatch && accentMatch;
      });

      console.log(
        `[ElevenLabs] Found ${candidates.length} candidate voices after filtering`
      );

      // 3. Si no hay candidatos con el acento, relajar restricción
      if (candidates.length === 0) {
        console.warn(
          "[ElevenLabs] No voices found with specific accent, trying without accent filter"
        );
        candidates = voices.filter((voice) => {
          const labels = voice.labels || {};
          return (
            (characteristics.gender === "male" && labels.gender === "male") ||
            (characteristics.gender === "female" && labels.gender === "female") ||
            characteristics.gender === "neutral"
          );
        });
      }

      // 4. Si aún no hay candidatos, usar fallback
      if (candidates.length === 0) {
        console.warn("[ElevenLabs] No matching voices found, using fallback");
        return this.getFallbackVoice(characteristics.gender);
      }

      // 5. Scoring semántico basado en descripción
      const scoredVoices = candidates.map((voice) => {
        let score = 0.5; // Base score

        // Scoring por edad
        if (characteristics.age && voice.labels?.age) {
          if (voice.labels.age === characteristics.age) {
            score += 0.2;
          }
        }

        // Scoring por descripción (matching de palabras clave)
        if (characteristics.description && voice.description) {
          const descWords = characteristics.description.toLowerCase().split(/\s+/);
          const voiceDesc = voice.description.toLowerCase();

          const matchingWords = descWords.filter((word) =>
            voiceDesc.includes(word)
          ).length;

          score += Math.min(0.3, matchingWords * 0.1);
        }

        // Bonus por voces en categoría "premade"
        if (voice.category === "premade") {
          score += 0.1;
        }

        return { voice, score };
      });

      // 6. Seleccionar la voz con mayor score
      scoredVoices.sort((a, b) => b.score - a.score);
      const bestMatch = scoredVoices[0];

      console.log(
        `[ElevenLabs] ✅ Selected voice: ${bestMatch.voice.name} (score: ${bestMatch.score.toFixed(2)})`
      );

      return {
        voiceId: bestMatch.voice.voiceId,
        voiceName: bestMatch.voice.name,
        confidence: bestMatch.score,
      };
    } catch (error) {
      console.error("[ElevenLabs] Error selecting voice:", error);
      // Fallback a voz predefinida
      return this.getFallbackVoice(characteristics.gender);
    }
  }

  /**
   * Obtiene todas las voces disponibles en la biblioteca de ElevenLabs
   */
  async getAvailableVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const response = await this.client.voices.getAll();
      return response.voices as any[];
    } catch (error) {
      console.error("[ElevenLabs] Error fetching voices:", error);
      return [];
    }
  }

  /**
   * Genera audio desde texto con modulación emocional
   */
  async generateSpeech(
    text: string,
    voiceId: string,
    modulation?: EmotionalVoiceModulation
  ): Promise<VoiceGenerationResult> {
    try {
      console.log(`[ElevenLabs] Generating speech for voice: ${voiceId}`);
      console.log(`[ElevenLabs] Text length: ${text.length} chars`);

      // Calcular parámetros de voz desde modulación emocional
      const voiceSettings = this.calculateVoiceSettings(modulation);

      console.log(`[ElevenLabs] Voice settings:`, voiceSettings);

      // Generar audio
      const audioStream = await this.client.textToSpeech.convert(voiceId, {
        text,
        modelId: "eleven_multilingual_v2", // Soporte para español
        voiceSettings: voiceSettings,
      });

      // Convertir ReadableStream a Buffer
      const chunks: Uint8Array[] = [];
      const reader = audioStream.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }
      } finally {
        reader.releaseLock();
      }

      const audioBuffer = Buffer.concat(chunks);

      console.log(`[ElevenLabs] ✅ Audio generated: ${audioBuffer.length} bytes`);

      // Obtener nombre de la voz
      const voiceName = await this.getVoiceName(voiceId);

      return {
        audioBuffer,
        voiceId,
        voiceName,
      };
    } catch (error) {
      console.error("[ElevenLabs] Error generating speech:", error);
      throw error;
    }
  }

  /**
   * Genera audio y lo guarda en archivo
   */
  async generateSpeechToFile(
    text: string,
    voiceId: string,
    outputPath: string,
    modulation?: EmotionalVoiceModulation
  ): Promise<VoiceGenerationResult> {
    const result = await this.generateSpeech(text, voiceId, modulation);

    // Guardar en archivo
    fs.writeFileSync(outputPath, result.audioBuffer);

    console.log(`[ElevenLabs] Audio saved to: ${outputPath}`);

    return {
      ...result,
      audioUrl: outputPath,
    };
  }

  /**
   * Calcula parámetros de voz basados en estado emocional
   */
  private calculateVoiceSettings(
    modulation?: EmotionalVoiceModulation
  ): {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  } {
    if (!modulation) {
      // Settings por defecto
      return {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      };
    }

    const { currentEmotion, intensity, mood } = modulation;

    // Base settings
    let stability = 0.5;
    let similarity_boost = 0.75;
    let style = 0.0;

    // Modular stability basado en emoción
    const unstableEmotions = [
      "anxiety",
      "fear",
      "excitement",
      "anger",
      "distress",
    ];
    const stableEmotions = ["satisfaction", "contentment", "calm"];

    if (unstableEmotions.includes(currentEmotion)) {
      stability = Math.max(0, 0.5 - intensity * 0.3); // Más inestable con alta intensidad
    } else if (stableEmotions.includes(currentEmotion)) {
      stability = Math.min(1, 0.5 + intensity * 0.3); // Más estable
    }

    // Modular style basado en arousal (energía)
    if (mood.arousal > 0.7) {
      style = 0.3; // Más expresivo para alta energía
    } else if (mood.arousal < 0.3) {
      style = 0.0; // Menos expresivo para baja energía
    }

    // Ajustar similarity_boost basado en intensidad emocional
    // Alta intensidad = menos similar a la voz base (más expresivo)
    similarity_boost = Math.max(0.5, 0.75 - intensity * 0.25);

    return {
      stability: Math.max(0, Math.min(1, stability)),
      similarity_boost: Math.max(0, Math.min(1, similarity_boost)),
      style: Math.max(0, Math.min(1, style)),
      use_speaker_boost: true,
    };
  }

  /**
   * Obtiene el nombre de una voz por ID
   */
  private async getVoiceName(voiceId: string): Promise<string> {
    try {
      // Primero verificar en voces preset
      for (const [gender, voices] of Object.entries(this.PRESET_VOICES)) {
        for (const [name, id] of Object.entries(voices)) {
          if (id === voiceId) {
            return name;
          }
        }
      }

      // Si no está en preset, buscar en la biblioteca
      const voices = await this.getAvailableVoices();
      const voice = voices.find((v) => v.voiceId === voiceId);

      return voice?.name || "Unknown Voice";
    } catch (error) {
      return "Unknown Voice";
    }
  }

  /**
   * Obtiene voz de fallback desde las predefinidas
   */
  private getFallbackVoice(
    gender: "male" | "female" | "neutral"
  ): { voiceId: string; voiceName: string; confidence: number } {
    const genderVoices =
      gender === "male" || gender === "neutral"
        ? this.PRESET_VOICES.male
        : this.PRESET_VOICES.female;

    // Seleccionar primera voz disponible
    const [name, voiceId] = Object.entries(genderVoices)[0];

    console.log(`[ElevenLabs] Using fallback voice: ${name} (ID: ${voiceId})`);

    return {
      voiceId,
      voiceName: name,
      confidence: 0.5,
    };
  }

  /**
   * Busca voces en la biblioteca con criterios específicos
   */
  async searchVoices(criteria: {
    gender?: "male" | "female";
    accent?: string;
    age?: string;
    keywords?: string[];
  }): Promise<ElevenLabsVoice[]> {
    const allVoices = await this.getAvailableVoices();

    return allVoices.filter((voice) => {
      const labels = voice.labels || {};

      // Filtrar por género
      if (criteria.gender && labels.gender !== criteria.gender) {
        return false;
      }

      // Filtrar por acento
      if (criteria.accent) {
        const accentLabel = labels.accent?.toLowerCase() || "";
        if (!accentLabel.includes(criteria.accent.toLowerCase())) {
          return false;
        }
      }

      // Filtrar por edad
      if (criteria.age && labels.age !== criteria.age) {
        return false;
      }

      // Filtrar por keywords en descripción
      if (criteria.keywords && voice.description) {
        const desc = voice.description.toLowerCase();
        const hasKeyword = criteria.keywords.some((kw) =>
          desc.includes(kw.toLowerCase())
        );
        if (!hasKeyword) {
          return false;
        }
      }

      return true;
    });
  }
}

// Singleton instance
let elevenlabsClient: ElevenLabsVoiceClient | null = null;

export function getElevenLabsClient(): ElevenLabsVoiceClient {
  if (!elevenlabsClient) {
    elevenlabsClient = new ElevenLabsVoiceClient();
  }
  return elevenlabsClient;
}
