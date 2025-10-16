/**
 * Generador de Imagen de Referencia y Voz para Nuevos Agentes
 *
 * Genera la imagen de referencia del personaje y asigna una voz
 * cuando se crea un agente nuevo, para mantener consistencia visual y vocal.
 */

import { getAIHordeClient } from "@/lib/visual-system/ai-horde-client";

export interface ReferenceGenerationResult {
  referenceImageUrl?: string;
  voiceId?: string;
  errors: string[];
}

/**
 * Genera imagen de referencia y asigna voz para un nuevo agente
 */
export async function generateAgentReferences(
  agentName: string,
  personality: string,
  gender?: string,
  userId?: string,
  agentId?: string
): Promise<ReferenceGenerationResult> {
  const result: ReferenceGenerationResult = {
    errors: [],
  };

  // 1. Generar imagen de referencia
  // TODO: Implementar generación de imagen de referencia con AI Horde
  // Por ahora, dejamos esto como funcionalidad futura
  try {
    const prompt = buildReferenceImagePrompt(agentName, personality, gender);

    const aiHordeClient = getAIHordeClient();
    const imageResult = await aiHordeClient.generateImage({
      prompt,
      negativePrompt:
        "low quality, blurry, distorted, deformed, anime, cartoon, multiple people, text, watermark, signature, low resolution, bad anatomy",
      width: 512,
      height: 768, // Vertical para capturar cuerpo completo
      steps: 40, // Más steps para mejor calidad en referencia
      cfgScale: 7.5,
      sampler: "k_euler_a",
      seed: -1,
      nsfw: false,
    });

    if (imageResult && imageResult.imageUrl) {
      result.referenceImageUrl = imageResult.imageUrl;
      console.log(`[ReferenceGenerator] Reference image generated for ${agentName}`);
    } else {
      result.errors.push("Failed to generate reference image");
      console.error(`[ReferenceGenerator] Image generation failed`);
    }
  } catch (error) {
    result.errors.push(`Image generation error: ${error}`);
    console.error("[ReferenceGenerator] Error generating reference image:", error);
  }

  // 2. Asignar voz de ElevenLabs
  try {
    const voiceId = selectVoiceForAgent(personality, gender);
    result.voiceId = voiceId;
    console.log(`[ReferenceGenerator] Voice ${voiceId} assigned to ${agentName}`);
  } catch (error) {
    result.errors.push(`Voice assignment error: ${error}`);
    console.error("[ReferenceGenerator] Error assigning voice:", error);
  }

  return result;
}

/**
 * Construye un prompt detallado para la imagen de referencia
 */
function buildReferenceImagePrompt(
  name: string,
  personality: string,
  gender?: string
): string {
  // Extraer características físicas de la personalidad si existen
  const personalityLower = personality.toLowerCase();

  // Determinar género si no está especificado
  let genderPrompt = "";
  if (gender) {
    genderPrompt = gender.toLowerCase().includes("fem") || gender.toLowerCase().includes("mujer")
      ? "female"
      : "male";
  } else {
    // Inferir de la personalidad
    if (personalityLower.includes("mujer") || personalityLower.includes("femenin") || personalityLower.includes("chica")) {
      genderPrompt = "female";
    } else if (personalityLower.includes("hombre") || personalityLower.includes("masculin") || personalityLower.includes("chico")) {
      genderPrompt = "male";
    } else {
      genderPrompt = "androgynous"; // Neutro por defecto
    }
  }

  // Extraer keywords de apariencia
  let appearanceKeywords: string[] = [];

  if (personalityLower.includes("atlético") || personalityLower.includes("deportista")) {
    appearanceKeywords.push("athletic build, fit");
  }
  if (personalityLower.includes("elegante")) {
    appearanceKeywords.push("elegant, sophisticated");
  }
  if (personalityLower.includes("casual") || personalityLower.includes("relajad")) {
    appearanceKeywords.push("casual clothing, relaxed style");
  }
  if (personalityLower.includes("tímid") || personalityLower.includes("reservad")) {
    appearanceKeywords.push("shy expression, soft features");
  }
  if (personalityLower.includes("segur") || personalityLower.includes("confiad")) {
    appearanceKeywords.push("confident posture, strong presence");
  }

  // Si no hay keywords específicas, agregar defaults
  if (appearanceKeywords.length === 0) {
    appearanceKeywords.push("natural appearance, friendly expression");
  }

  const prompt = `Professional reference portrait photograph of ${name}, ${genderPrompt} character.
${appearanceKeywords.join(", ")}.
Full body portrait, standing position, neutral white background.
Natural lighting, high quality, photorealistic, detailed facial features,
consistent appearance for character reference, professional photography.
Clear, sharp focus, 4K quality.
Character personality traits: ${personality.substring(0, 100)}.`;

  return prompt;
}

/**
 * Selecciona una voz apropiada de ElevenLabs basada en personalidad y género
 */
export function selectVoiceForAgent(personality: string, gender?: string): string {
  const personalityLower = personality.toLowerCase();

  // Determinar género
  let isFemale = false;
  if (gender) {
    isFemale = gender.toLowerCase().includes("fem") || gender.toLowerCase().includes("mujer");
  } else {
    isFemale = personalityLower.includes("mujer") || personalityLower.includes("femenin") || personalityLower.includes("chica");
  }

  // Voces de ElevenLabs (IDs reales de voces pre-hechas)
  const voices = {
    female: {
      calm: "EXAVITQu4vr4xnSDxMaL", // Rachel - calm, soft
      energetic: "21m00Tcm4TlvDq8ikWAM", // Rachel - young, energetic
      mature: "AZnzlk1XvdvUeBnXmlld", // Domi - confident, mature
      friendly: "pNInz6obpgDQGcFmaJgB", // Adam - friendly (unisex)
    },
    male: {
      calm: "TxGEqnHWrfWFTfGW9XjX", // Josh - calm, deep
      energetic: "ErXwobaYiN019PkySvjV", // Antoni - young, energetic
      mature: "VR6AewLTigWG4xSOukaG", // Arnold - deep, authoritative
      friendly: "pNInz6obpgDQGcFmaJgB", // Adam - friendly (unisex)
    },
  };

  // Seleccionar basado en personalidad
  let voiceCategory: "calm" | "energetic" | "mature" | "friendly" = "friendly";

  if (personalityLower.includes("enérgic") || personalityLower.includes("activ") || personalityLower.includes("juguet")) {
    voiceCategory = "energetic";
  } else if (personalityLower.includes("calmad") || personalityLower.includes("serene") || personalityLower.includes("tranquil")) {
    voiceCategory = "calm";
  } else if (personalityLower.includes("matur") || personalityLower.includes("seri") || personalityLower.includes("profesional")) {
    voiceCategory = "mature";
  }

  return isFemale ? voices.female[voiceCategory] : voices.male[voiceCategory];
}
