import { NextRequest, NextResponse } from "next/server";
import { getAIHordeClient } from "@/lib/visual-system/ai-horde-client";

/**
 * API endpoint para generar imagen de referencia de un personaje
 *
 * POST /api/agents/generate-reference-image
 *
 * Body: {
 *   name: string;
 *   personality: string;
 *   gender?: string;
 * }
 */
export async function POST(req: NextRequest) {
  try {
    console.log("[API] Generando imagen de referencia...");

    const body = await req.json();
    const { name, personality, gender } = body;

    if (!name || !personality) {
      return NextResponse.json(
        { error: "Name and personality are required" },
        { status: 400 }
      );
    }

    // Construir prompt para imagen de referencia
    const prompt = buildReferenceImagePrompt(name, personality, gender);

    console.log("[API] Prompt generado:", prompt);

    // Generar imagen con AI Horde
    const aiHordeClient = getAIHordeClient();
    const result = await aiHordeClient.generateImage({
      prompt,
      negativePrompt:
        "low quality, blurry, distorted, deformed, anime, cartoon, multiple people, text, watermark, signature, low resolution, bad anatomy, ugly, duplicate, mutated",
      width: 512,
      height: 768, // Vertical para cuerpo completo
      steps: 35, // Más steps para mejor calidad
      cfgScale: 7.5,
      sampler: "k_euler_a",
      seed: -1,
      nsfw: false,
      karras: true,
    });

    console.log("[API] Imagen generada exitosamente");

    return NextResponse.json({
      imageUrl: result.imageUrl,
      model: result.model,
      kudosCost: result.kudosCost,
      generationTime: result.generationTime,
    });
  } catch (error) {
    console.error("[API] Error generating reference image:", error);
    return NextResponse.json(
      {
        error: "Failed to generate reference image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Construye un prompt detallado para la imagen de referencia
 */
function buildReferenceImagePrompt(
  name: string,
  personality: string,
  gender?: string
): string {
  const personalityLower = personality.toLowerCase();

  // Determinar género
  let genderPrompt = "";
  if (gender) {
    genderPrompt =
      gender.toLowerCase().includes("fem") ||
      gender.toLowerCase().includes("mujer")
        ? "female"
        : "male";
  } else {
    // Inferir de la personalidad
    if (
      personalityLower.includes("mujer") ||
      personalityLower.includes("femenin") ||
      personalityLower.includes("chica")
    ) {
      genderPrompt = "female";
    } else if (
      personalityLower.includes("hombre") ||
      personalityLower.includes("masculin") ||
      personalityLower.includes("chico")
    ) {
      genderPrompt = "male";
    } else {
      genderPrompt = "androgynous"; // Neutro por defecto
    }
  }

  // Extraer keywords de apariencia
  const appearanceKeywords: string[] = [];

  if (
    personalityLower.includes("atlético") ||
    personalityLower.includes("deportista")
  ) {
    appearanceKeywords.push("athletic build, fit");
  }
  if (personalityLower.includes("elegante")) {
    appearanceKeywords.push("elegant, sophisticated");
  }
  if (
    personalityLower.includes("casual") ||
    personalityLower.includes("relajad")
  ) {
    appearanceKeywords.push("casual clothing, relaxed style");
  }
  if (
    personalityLower.includes("tímid") ||
    personalityLower.includes("reservad")
  ) {
    appearanceKeywords.push("shy expression, soft features");
  }
  if (
    personalityLower.includes("segur") ||
    personalityLower.includes("confiad")
  ) {
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
