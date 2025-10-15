/**
 * VISUAL GENERATION SERVICE
 *
 * Servicio unificado para generación y gestión de expresiones visuales
 * - Cache inteligente (genera una vez, reutiliza muchas veces)
 * - Selección automática de provider (Gemini vs Hugging Face)
 * - Integración con sistema emocional
 */

import { prisma } from "@/lib/prisma";
import { getGeminiImagenClient } from "./gemini-imagen-client";
import { getHuggingFaceSpacesClient } from "./huggingface-spaces-client";
import { getFastSDLocalClient } from "./fastsd-local-client";
import { getAIHordeClient } from "./ai-horde-client";

export type ContentType = "sfw" | "suggestive" | "nsfw";
export type UserTier = "free" | "basic" | "premium";
export type VisualProvider = "aihorde" | "fastsd" | "gemini" | "huggingface";

export interface VisualGenerationRequest {
  agentId: string;
  emotionType: string;
  intensity: "low" | "medium" | "high";
  context?: string;
  contentType?: ContentType;
  userTier?: UserTier;
}

export interface VisualGenerationResult {
  imageUrl: string;
  type: "photo";
  cached: boolean;
  provider: string;
}

export class VisualGenerationService {
  /**
   * Obtiene o genera expresión visual para un agente
   * PRIMERO busca en cache, LUEGO genera si no existe
   */
  async getOrGenerateExpression(
    request: VisualGenerationRequest
  ): Promise<VisualGenerationResult> {
    const {
      agentId,
      emotionType,
      intensity,
      context,
      contentType = "sfw",
      userTier = "free",
    } = request;

    console.log(
      `[VisualGen] Request for ${agentId}: ${emotionType}/${intensity}`
    );

    // 1. BUSCAR EN CACHE
    const cached = await prisma.visualExpression.findFirst({
      where: {
        agentId,
        emotionType,
        intensity,
        ...(context && { context }),
      },
      orderBy: {
        timesUsed: "desc", // Preferir la más usada (probablemente la mejor)
      },
    });

    if (cached) {
      // Actualizar estadísticas de uso
      await prisma.visualExpression.update({
        where: { id: cached.id },
        data: {
          timesUsed: { increment: 1 },
          lastUsed: new Date(),
        },
      });

      console.log(`[VisualGen] ✅ Using cached expression: ${cached.id}`);

      return {
        imageUrl: cached.url,
        type: "photo",
        cached: true,
        provider: cached.provider,
      };
    }

    // 2. NO EXISTE EN CACHE - GENERAR NUEVA
    console.log(
      `[VisualGen] Cache miss - generating new expression for ${emotionType}/${intensity}`
    );

    const result = await this.generateNewExpression({
      agentId,
      emotionType,
      intensity,
      context,
      contentType,
      userTier,
    });

    return {
      imageUrl: result.imageUrl,
      type: "photo",
      cached: false,
      provider: result.provider,
    };
  }

  /**
   * Genera nueva expresión y la almacena en cache
   */
  private async generateNewExpression(params: {
    agentId: string;
    emotionType: string;
    intensity: "low" | "medium" | "high";
    context?: string;
    contentType: ContentType;
    userTier: UserTier;
  }): Promise<{ imageUrl: string; seed: number; provider: string }> {
    const { agentId, emotionType, intensity, context, contentType, userTier } =
      params;

    // 1. Obtener apariencia del personaje
    const appearance = await prisma.characterAppearance.findUnique({
      where: { agentId },
    });

    if (!appearance) {
      throw new Error(`Character appearance not found for agent: ${agentId}`);
    }

    // 2. Seleccionar proveedor con fallback chain
    const providerChain = await this.selectProviderChain({
      contentType,
      userTier,
      preferredProvider: appearance.preferredProvider as VisualProvider,
    });

    console.log(`[VisualGen] Provider chain: ${providerChain.join(" -> ")}`);

    // 3. Intentar generar con cada proveedor en orden
    let lastError: any = null;

    for (const provider of providerChain) {
      try {
        console.log(`[VisualGen] Trying provider: ${provider}`);

        const result = await this.generateWithProvider({
          provider,
          appearance,
          emotionType,
          intensity,
        });

        // Éxito - almacenar en cache y retornar
        await this.saveToCache({
          agentId,
          emotionType,
          intensity,
          context,
          imageUrl: result.imageUrl,
          seed: result.seed,
          provider,
        });

        return {
          imageUrl: result.imageUrl,
          seed: result.seed,
          provider,
        };
      } catch (error) {
        console.error(`[VisualGen] Provider ${provider} failed:`, error);
        lastError = error;
        // Continuar con siguiente proveedor
      }
    }

    // Todos los proveedores fallaron
    throw new Error(
      `All providers failed. Last error: ${lastError?.message || lastError}`
    );
  }

  /**
   * Genera imagen con un proveedor específico
   */
  private async generateWithProvider(params: {
    provider: VisualProvider;
    appearance: any;
    emotionType: string;
    intensity: "low" | "medium" | "high";
  }): Promise<{ imageUrl: string; seed: number }> {
    const { provider, appearance, emotionType, intensity } = params;

    if (provider === "aihorde") {
      // AI Horde - Proveedor principal (gratis, rápido, alta calidad)
      const aihorde = getAIHordeClient({
        apiKey: process.env.AI_HORDE_API_KEY,
      });
      const result = await aihorde.generateCharacterExpression({
        characterDescription: appearance.basePrompt,
        emotionType,
        intensity,
        seed: appearance.seed,
      });

      return {
        imageUrl: result.imageUrl, // Ya es una URL de R2 storage
        seed: result.seed,
      };
    } else if (provider === "fastsd") {
      // FastSD CPU Local (fallback)
      const fastsd = getFastSDLocalClient({ autoStart: true });
      const result = await fastsd.generateCharacterExpression({
        characterDescription: appearance.basePrompt,
        emotionType,
        intensity,
        seed: appearance.seed || undefined,
      });

      // Convertir base64 a data URL
      return {
        imageUrl: `data:image/png;base64,${result.imageBase64}`,
        seed: result.seed,
      };
    } else if (provider === "gemini") {
      // Gemini Imagen
      const gemini = getGeminiImagenClient();
      const result = await gemini.generateCharacterExpression({
        characterDescription: appearance.basePrompt,
        emotionType,
        intensity,
        referenceImage: appearance.basePhotoUrl || undefined,
        seed: appearance.seed || undefined,
      });

      return {
        imageUrl: `data:image/png;base64,${result.imageBase64}`,
        seed: result.seed,
      };
    } else {
      // Hugging Face Spaces
      const hf = getHuggingFaceSpacesClient();
      const result = await hf.generateCharacterExpression({
        characterDescription: appearance.basePrompt,
        emotionType,
        intensity,
        seed: appearance.seed || undefined,
      });

      return {
        imageUrl: result.imageUrl,
        seed: result.seed,
      };
    }
  }

  /**
   * Guarda expresión generada en cache
   */
  private async saveToCache(params: {
    agentId: string;
    emotionType: string;
    intensity: "low" | "medium" | "high";
    context?: string;
    imageUrl: string;
    seed: number;
    provider: string;
  }): Promise<void> {
    const { agentId, emotionType, intensity, context, imageUrl, seed, provider } = params;

    await prisma.visualExpression.create({
      data: {
        agentId,
        emotionType,
        intensity,
        context,
        type: "photo",
        url: imageUrl,
        provider,
        generationParams: {
          seed,
          emotionType,
          intensity,
          provider,
          timestamp: new Date().toISOString(),
        },
        width: 512,
        height: 512,
        timesUsed: 1,
        lastUsed: new Date(),
      },
    });

    await prisma.characterAppearance.update({
      where: { agentId },
      data: {
        totalGenerations: { increment: 1 },
      },
    });

    console.log(`[VisualGen] ✅ Expression cached with provider: ${provider}`);
  }

  /**
   * Selecciona cadena de proveedores con fallback
   * Retorna array ordenado por prioridad
   */
  private async selectProviderChain(params: {
    contentType: ContentType;
    userTier: UserTier;
    preferredProvider: VisualProvider;
  }): Promise<VisualProvider[]> {
    const { contentType, userTier, preferredProvider } = params;

    // AI Horde es el proveedor principal para todos los tiers
    // - Gratis (sistema de kudos)
    // - Rápido (9-12 segundos)
    // - Alta calidad
    // - Sin requisitos de hardware

    // 1. NSFW solo para premium users
    if (contentType === "nsfw") {
      if (userTier !== "premium") {
        throw new Error("NSFW content requires premium tier");
      }
      // Premium NSFW: AI Horde -> FastSD local -> HF (fallback)
      const fastsdAvailable = await this.isFastSDAvailable();
      return fastsdAvailable
        ? ["aihorde", "fastsd", "huggingface"]
        : ["aihorde", "huggingface"];
    }

    // 2. Contenido SFW/Suggestive - AI Horde para todos
    // Chain de fallback: AI Horde -> Gemini -> FastSD Local -> HF

    const chain: VisualProvider[] = ["aihorde"];

    // Agregar Gemini si hay API key configurada
    if (process.env.GEMINI_API_KEY) {
      chain.push("gemini");
    }

    // Agregar FastSD si está disponible localmente
    const fastsdAvailable = await this.isFastSDAvailable();
    if (fastsdAvailable) {
      chain.push("fastsd");
    }

    // Siempre incluir HF como último fallback
    chain.push("huggingface");

    return chain;
  }

  /**
   * Verifica si FastSD está disponible localmente
   */
  private async isFastSDAvailable(): Promise<boolean> {
    try {
      const fastsd = getFastSDLocalClient();
      const info = await fastsd.getSystemInfo();
      return info.installed && info.running;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene información sobre FastSD e inicia instalación si el usuario aprueba
   */
  async checkAndInstallFastSD(): Promise<{
    installed: boolean;
    running: boolean;
    needsInstallation: boolean;
    installationApproved?: boolean;
  }> {
    const fastsd = getFastSDLocalClient();
    const info = await fastsd.getSystemInfo();

    if (!info.installed) {
      console.log("[VisualGen] FastSD not installed");

      // TODO: En producción, aquí se debe pedir aprobación al usuario
      // Por ahora retornamos estado
      return {
        installed: false,
        running: false,
        needsInstallation: true,
      };
    }

    if (!info.running) {
      console.log("[VisualGen] FastSD installed but not running, starting...");
      const started = await fastsd.startServer();
      return {
        installed: true,
        running: started,
        needsInstallation: false,
      };
    }

    return {
      installed: true,
      running: true,
      needsInstallation: false,
    };
  }

  /**
   * Pre-genera set de expresiones base al crear personaje
   * Esto hace que las primeras interacciones sean instantáneas
   */
  async generateBaseExpressions(
    agentId: string,
    options?: {
      count?: number;
      userTier?: UserTier;
    }
  ): Promise<void> {
    const count = options?.count || 10;
    const userTier = options?.userTier || "free";

    console.log(
      `[VisualGen] Generating ${count} base expressions for agent: ${agentId}`
    );

    // Set de expresiones más comunes
    const baseExpressions = [
      { emotionType: "neutral", intensity: "medium" as const },
      { emotionType: "joy", intensity: "low" as const },
      { emotionType: "joy", intensity: "medium" as const },
      { emotionType: "joy", intensity: "high" as const },
      { emotionType: "distress", intensity: "low" as const },
      { emotionType: "distress", intensity: "medium" as const },
      { emotionType: "affection", intensity: "medium" as const },
      { emotionType: "concern", intensity: "medium" as const },
      { emotionType: "curiosity", intensity: "medium" as const },
      { emotionType: "excitement", intensity: "medium" as const },
      // Opcionales si count > 10
      { emotionType: "anger", intensity: "low" as const },
      { emotionType: "fear", intensity: "medium" as const },
      { emotionType: "affection", intensity: "high" as const },
    ];

    const expressionsToGenerate = baseExpressions.slice(0, count);

    let successCount = 0;
    let failCount = 0;

    for (const expr of expressionsToGenerate) {
      try {
        await this.getOrGenerateExpression({
          agentId,
          emotionType: expr.emotionType,
          intensity: expr.intensity,
          contentType: "sfw",
          userTier,
        });
        successCount++;
        console.log(
          `[VisualGen] ✅ Generated ${expr.emotionType}/${expr.intensity} (${successCount}/${count})`
        );
      } catch (error) {
        failCount++;
        console.error(
          `[VisualGen] ❌ Failed to generate ${expr.emotionType}/${expr.intensity}:`,
          error
        );
        // Continuar con las demás aunque falle una
      }
    }

    console.log(
      `[VisualGen] ✅ Base expressions generation complete: ${successCount} success, ${failCount} failed`
    );
  }

  /**
   * Inicializa la apariencia de un personaje
   */
  async initializeCharacterAppearance(params: {
    agentId: string;
    name: string;
    gender: "male" | "female" | "non-binary";
    description?: string;
    style?: "realistic" | "anime" | "semi-realistic";
    ethnicity?: string;
    age?: string;
    referencePhotoUrl?: string;
  }): Promise<void> {
    const {
      agentId,
      name,
      gender,
      description,
      style = "realistic",
      ethnicity,
      age = "25-30",
      referencePhotoUrl,
    } = params;

    console.log(
      `[VisualGen] Initializing character appearance for: ${name} (${agentId})`
    );

    // Construir prompt base
    const basePrompt = this.buildBasePrompt({
      name,
      gender,
      description,
      style,
      ethnicity,
      age,
    });

    // Crear CharacterAppearance
    await prisma.characterAppearance.create({
      data: {
        agentId,
        basePrompt,
        style,
        gender,
        ethnicity,
        age,
        referencePhotoUrl,
        negativePrompt:
          "deformed, distorted, disfigured, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, mutated hands, bad hands, long neck, mutation, ugly, disgusting, blurry, low quality, watermark, text, signature, multiple people",
        seed: Math.floor(Math.random() * 1000000),
        preferredProvider: "huggingface", // Por ahora forzar HF
        totalGenerations: 0,
      },
    });

    console.log(`[VisualGen] ✅ Character appearance initialized`);
  }

  /**
   * Construye prompt base para el personaje
   */
  private buildBasePrompt(params: {
    name: string;
    gender: "male" | "female" | "non-binary";
    description?: string;
    style: "realistic" | "anime" | "semi-realistic";
    ethnicity?: string;
    age?: string;
  }): string {
    const { name, gender, description, style, ethnicity, age } = params;

    const parts: string[] = [];

    // Estilo
    if (style === "realistic") {
      parts.push("photorealistic portrait");
    } else if (style === "anime") {
      parts.push("anime style portrait");
    } else {
      parts.push("semi-realistic portrait");
    }

    // Género
    if (gender === "male") {
      parts.push("handsome man");
    } else if (gender === "female") {
      parts.push("beautiful woman");
    } else {
      parts.push("person");
    }

    // Edad
    if (age) {
      parts.push(`age ${age}`);
    }

    // Etnicidad
    if (ethnicity) {
      parts.push(ethnicity);
    }

    // Descripción adicional
    if (description) {
      parts.push(description);
    }

    // Características técnicas
    parts.push(
      "professional photography, high quality, detailed face, natural lighting, looking at camera"
    );

    return parts.join(", ");
  }

  /**
   * Obtiene estadísticas de uso de expresiones
   */
  async getExpressionStats(agentId: string): Promise<{
    totalExpressions: number;
    totalGenerations: number;
    mostUsedExpression: any;
    cacheHitRate: number;
  }> {
    const expressions = await prisma.visualExpression.findMany({
      where: { agentId },
      orderBy: { timesUsed: "desc" },
    });

    const appearance = await prisma.characterAppearance.findUnique({
      where: { agentId },
    });

    const totalExpressions = expressions.length;
    const totalGenerations = appearance?.totalGenerations || 0;
    const mostUsedExpression = expressions[0] || null;

    // Calcular cache hit rate (aproximado)
    const totalTimesUsed = expressions.reduce(
      (sum, expr) => sum + expr.timesUsed,
      0
    );
    const cacheHitRate =
      totalTimesUsed > 0
        ? ((totalTimesUsed - totalGenerations) / totalTimesUsed) * 100
        : 0;

    return {
      totalExpressions,
      totalGenerations,
      mostUsedExpression,
      cacheHitRate,
    };
  }
}

// Singleton
let visualGenService: VisualGenerationService | null = null;

export function getVisualGenerationService(): VisualGenerationService {
  if (!visualGenService) {
    visualGenService = new VisualGenerationService();
  }
  return visualGenService;
}
