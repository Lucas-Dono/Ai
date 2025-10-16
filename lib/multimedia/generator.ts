/**
 * Generador de Contenido Multimedia
 *
 * Genera imágenes y audios basados en tags detectados en mensajes de IA.
 * Usa el sistema visual existente (AI Horde/FastSD) y ElevenLabs para voces.
 */

import type { MultimediaTag } from "./parser";
import { getAIHordeClient } from "@/lib/visual-system/ai-horde-client";
import { getElevenLabsClient } from "@/lib/voice-system/elevenlabs-client";

export interface GeneratedMultimedia {
  type: "image" | "audio";
  url: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface MultimediaGenerationOptions {
  agentId: string;
  agentName: string;
  agentPersonality: string;
  referenceImageUrl?: string;
  voiceId?: string;
  userId?: string;
}

/**
 * Genera contenido multimedia basado en tags detectados
 */
export class MultimediaGenerator {
  constructor() {
    // No necesitamos inicializar servicios, usamos los getters
  }

  /**
   * Genera imágenes usando AI Horde
   * TODO: Implementar img2img para usar referenceImageUrl y mantener consistencia
   */
  async generateImage(
    description: string,
    options: MultimediaGenerationOptions
  ): Promise<GeneratedMultimedia | null> {
    try {
      // Construir prompt mejorado con contexto del personaje
      const enhancedPrompt = this.buildImagePrompt(
        description,
        options.agentName,
        options.agentPersonality
      );

      const aiHordeClient = getAIHordeClient();
      const result = await aiHordeClient.generateImage({
        prompt: enhancedPrompt,
        negativePrompt:
          "low quality, blurry, distorted, anime, cartoon, 3d render, deformed",
        width: 512,
        height: 512,
        steps: 25,
        cfgScale: 7.5,
        sampler: "k_euler_a",
        seed: -1,
        nsfw: false,
      });

      if (result && result.imageUrl) {
        return {
          type: "image",
          url: result.imageUrl,
          description,
          metadata: {
            prompt: enhancedPrompt,
            model: result.model,
            usedReference: false, // TODO: Implementar img2img
          },
        };
      }

      return null;
    } catch (error) {
      console.error("[MultimediaGenerator] Error generating image:", error);
      return null;
    }
  }

  /**
   * Genera audio usando ElevenLabs con la voz asignada al personaje
   */
  async generateAudio(
    text: string,
    options: MultimediaGenerationOptions
  ): Promise<GeneratedMultimedia | null> {
    try {
      // Si no hay voiceId asignado, usar una voz por defecto
      const voiceId = options.voiceId || this.getDefaultVoiceId(options.agentPersonality);

      const elevenlabsClient = getElevenLabsClient();
      const result = await elevenlabsClient.generateSpeech(text, voiceId);

      if (!result || !result.audioBuffer) {
        return null;
      }

      // Convertir buffer a base64 data URL
      const base64Audio = result.audioBuffer.toString("base64");
      const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

      return {
        type: "audio",
        url: audioDataUrl,
        description: text,
        metadata: {
          voiceId,
          textLength: text.length,
        },
      };
    } catch (error) {
      console.error("[MultimediaGenerator] Error generating audio:", error);
      return null;
    }
  }

  /**
   * Procesa múltiples tags multimedia y genera el contenido
   */
  async generateMultimediaContent(
    tags: MultimediaTag[],
    options: MultimediaGenerationOptions
  ): Promise<GeneratedMultimedia[]> {
    const results: GeneratedMultimedia[] = [];

    for (const tag of tags) {
      if (tag.type === "image") {
        const image = await this.generateImage(tag.description, options);
        if (image) results.push(image);
      } else if (tag.type === "audio") {
        const audio = await this.generateAudio(tag.description, options);
        if (audio) results.push(audio);
      }
    }

    return results;
  }

  /**
   * Construye un prompt mejorado para generación de imagen
   */
  private buildImagePrompt(
    description: string,
    agentName: string,
    agentPersonality: string
  ): string {
    // Extraer keywords de personalidad para mejorar el prompt
    const personalityKeywords = this.extractPersonalityKeywords(agentPersonality);

    return `${description}.
Character: ${agentName}, personality traits: ${personalityKeywords}.
High quality photograph, natural lighting, detailed features, realistic skin texture,
photorealistic, professional photography, sharp focus.
CRITICAL: Maintain exact same facial features, hair style, body type, and overall appearance
as reference image. Only pose, expression, clothing, and background may vary.`;
  }

  /**
   * Extrae keywords relevantes de la personalidad del agente
   */
  private extractPersonalityKeywords(personality: string): string {
    // Simplificar la personalidad a keywords clave
    const keywords = personality
      .toLowerCase()
      .split(/[,;.]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, 3); // Solo los primeros 3 traits

    return keywords.join(", ");
  }

  /**
   * Obtiene una voz por defecto basada en la personalidad
   */
  private getDefaultVoiceId(personality: string): string {
    // Voces de ElevenLabs - mapear según personalidad
    const personalityLower = personality.toLowerCase();

    // Voces femeninas
    if (
      personalityLower.includes("femenin") ||
      personalityLower.includes("mujer") ||
      personalityLower.includes("chica")
    ) {
      return "EXAVITQu4vr4xnSDxMaL"; // Rachel (calm female)
    }

    // Voces masculinas
    if (
      personalityLower.includes("masculin") ||
      personalityLower.includes("hombre") ||
      personalityLower.includes("chico")
    ) {
      return "TxGEqnHWrfWFTfGW9XjX"; // Josh (calm male)
    }

    // Default: voz neutral
    return "pNInz6obpgDQGcFmaJgB"; // Adam (neutral)
  }
}
