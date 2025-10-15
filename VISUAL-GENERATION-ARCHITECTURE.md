# 🎨 ARQUITECTURA: SISTEMA DE GENERACIÓN VISUAL HÍBRIDO
## Gemini Imagen + Hugging Face Spaces

---

## 💰 ANÁLISIS DE COSTOS ACTUALIZADO

### **Gemini Imagen** (Google AI)

**Pricing**:
- **Imagen 3 (Fast)**: **$0.06/imagen** (input)
- **Imagen 3 (Standard)**: $0.10/imagen (input)

**Ventajas**:
- ✅ **10x más barato** que esperábamos ($0.06 vs $0.25 de DALL-E)
- ✅ Ya tenemos API key (`GEMINI_API_KEY`)
- ✅ Alta calidad y consistencia
- ✅ **Soporte para reference images** (puede copiar estilo/cara)
- ✅ Censura moderada (permite contenido romántico/sensual)
- ✅ Rápido (~5-10s por imagen)

**Limitaciones**:
- ⚠️ Censura para contenido explícito
- ⚠️ Requiere input/prompt (no puede generar sin descripción)

**Cálculo de Costos**:
```
20 expresiones base por personaje × $0.06 = $1.20 por personaje

Con 1000 usuarios creando personajes:
1000 × $1.20 = $1,200 (one-time)

Con cache (90% hit rate):
- 1000 usuarios × 10 interacciones/día = 10,000 interacciones
- 10% requieren nueva imagen = 1,000 generaciones/día
- 1,000 × $0.06 = $60/día = $1,800/mes

OPTIMIZACIÓN: Pre-generar solo 10 expresiones base = $0.60 por personaje
- Generar el resto bajo demanda
- Costo inicial: $600 para 1000 usuarios
- Costo mensual: ~$900/mes (con cache inteligente)
```

---

### **Hugging Face Spaces** (NSFW/Uncensored)

**Pricing**:
- ✅ **GRATIS** (Spaces públicos)
- ⚠️ Rate limits (puede requerir retry)
- ✅ Sin censura para contenido adulto

**Modelo**: `Heartsync/NSFW-Uncensored-photo`
- Basado en Stable Diffusion
- Optimizado para contenido sensual/NSFW
- Gratis pero puede tener latencia variable

**Cuándo usar**:
- ✅ Contenido NSFW/adulto (tier premium)
- ✅ Imágenes sin rostro visible
- ✅ Escenas íntimas/románticas
- ✅ Fallback si Gemini censura

**Limitaciones**:
- ⚠️ Debe ejecutarse en backend (no frontend directo)
- ⚠️ Latencia variable (10-30s)
- ⚠️ Rate limits en Spaces gratuitos

---

## 🏗️ ARQUITECTURA HÍBRIDA

### **Flujo de Decisión**:

```typescript
function selectImageProvider(params: {
  contentType: "sfw" | "suggestive" | "nsfw";
  needsFaceConsistency: boolean;
  userTier: "free" | "premium";
  hasReferenceImage: boolean;
}): "gemini" | "huggingface" {

  // 1. Contenido NSFW → Hugging Face (solo premium)
  if (params.contentType === "nsfw" && params.userTier === "premium") {
    return "huggingface";
  }

  // 2. Contenido sugestivo sin rostro → Hugging Face
  if (params.contentType === "suggestive" && !params.needsFaceConsistency) {
    return "huggingface";
  }

  // 3. TODO lo demás → Gemini (mejor calidad + face consistency)
  return "gemini";
}
```

### **Diagrama de Flujo**:

```
Usuario crea personaje
    ↓
¿Tiene foto de referencia? ─── NO ──→ Genera con descripción
    ↓ SÍ                                       ↓
    ↓                                    GEMINI IMAGEN
Extrae características faciales              (Fast mode)
    ↓                                          ↓
GEMINI IMAGEN (con reference)          Genera 10 expresiones
    ↓                                          ↓
Genera 10-20 expresiones base    ←───────────┘
    ↓
Almacena en DB + CDN
    ↓
CACHE LISTO

Durante conversación:
    ↓
Sistema emocional detecta emoción
    ↓
Busca en cache (emoción + intensidad)
    ↓
¿Existe? ─── SÍ ──→ Usa cached image (0ms, $0)
    ↓ NO
    ↓
¿Es contenido NSFW? ─── SÍ ──→ HUGGING FACE
    ↓ NO                            ↓
    ↓                        Genera + cache
GEMINI IMAGEN                       ↓
    ↓                               ↓
Genera + cache    ←─────────────────┘
    ↓
Retorna URL
```

---

## 🛠️ IMPLEMENTACIÓN TÉCNICA

### **1. Gemini Imagen Client**

```typescript
// lib/visual-system/gemini-imagen-client.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ImageGenerationParams {
  prompt: string;
  negativePrompt?: string;
  referenceImage?: string; // URL o base64
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
  numberOfImages?: number; // 1-4
  seed?: number; // Para consistencia
}

export class GeminiImagenClient {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey?: string) {
    this.client = new GoogleGenerativeAI(
      apiKey || process.env.GEMINI_API_KEY || ""
    );
    this.model = "imagen-3.0-generate-001"; // Fast mode
  }

  async generateImage(params: ImageGenerationParams): Promise<{
    imageUrl: string;
    seed: number;
    prompt: string;
  }> {
    try {
      console.log(`[GeminiImagen] Generating image with prompt: ${params.prompt.substring(0, 50)}...`);

      // Construir request
      const request: any = {
        prompt: params.prompt,
        number_of_images: params.numberOfImages || 1,
        aspect_ratio: params.aspectRatio || "1:1",
      };

      if (params.negativePrompt) {
        request.negative_prompt = params.negativePrompt;
      }

      if (params.seed) {
        request.seed = params.seed;
      }

      if (params.referenceImage) {
        request.reference_images = [
          {
            reference_type: "STYLE", // o "SUBJECT" para copiar persona
            image: params.referenceImage,
          },
        ];
      }

      // Generar
      const model = this.client.getGenerativeModel({
        model: this.model,
      });

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: params.prompt,
              },
            ],
          },
        ],
        generationConfig: request,
      });

      // Extraer imagen
      const response = result.response;
      const imageData = response.candidates?.[0]?.content?.parts?.[0];

      if (!imageData || !imageData.inlineData) {
        throw new Error("No image generated");
      }

      // Convertir base64 a URL (subir a storage)
      const imageBase64 = imageData.inlineData.data;
      const imageUrl = await this.uploadToStorage(imageBase64);

      console.log(`[GeminiImagen] ✅ Image generated: ${imageUrl}`);

      return {
        imageUrl,
        seed: params.seed || Math.floor(Math.random() * 1000000),
        prompt: params.prompt,
      };
    } catch (error) {
      console.error("[GeminiImagen] Error generating image:", error);
      throw error;
    }
  }

  private async uploadToStorage(base64: string): Promise<string> {
    // TODO: Implementar upload a Cloudflare R2 / AWS S3
    // Por ahora, retornar data URL
    return `data:image/png;base64,${base64}`;
  }

  /**
   * Genera expresión facial específica para un personaje
   */
  async generateCharacterExpression(params: {
    characterDescription: string;
    emotionType: string;
    intensity: "low" | "medium" | "high";
    referenceImage?: string;
    seed?: number;
  }): Promise<{ imageUrl: string; seed: number }> {
    const { characterDescription, emotionType, intensity, referenceImage, seed } = params;

    // Construir prompt optimizado
    const prompt = this.buildExpressionPrompt(
      characterDescription,
      emotionType,
      intensity
    );

    const negativePrompt =
      "deformed, distorted, disfigured, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, mutated hands, mutated fingers, bad hands, bad fingers, long neck, long body, mutation, mutated, ugly, disgusting, blurry, low quality, watermark, text, signature";

    const result = await this.generateImage({
      prompt,
      negativePrompt,
      referenceImage,
      seed,
      aspectRatio: "1:1",
      numberOfImages: 1,
    });

    return {
      imageUrl: result.imageUrl,
      seed: result.seed,
    };
  }

  private buildExpressionPrompt(
    characterDescription: string,
    emotionType: string,
    intensity: "low" | "medium" | "high"
  ): string {
    const emotionDescriptors: Record<string, Record<string, string>> = {
      joy: {
        low: "subtle smile, gentle happiness, soft expression",
        medium: "bright smile, joyful expression, happy eyes",
        high: "wide smile, laughing, very happy, radiant expression",
      },
      distress: {
        low: "slight frown, concerned look, worried expression",
        medium: "sad expression, teary eyes, distressed look",
        high: "crying, very sad, tears streaming, heartbroken expression",
      },
      anger: {
        low: "slight annoyance, furrowed brow, mild frustration",
        medium: "angry expression, intense gaze, frowning",
        high: "very angry, furious expression, intense rage",
      },
      fear: {
        low: "nervous look, slight anxiety, worried",
        medium: "scared expression, fearful eyes, anxious",
        high: "terrified, very scared, panicked expression",
      },
      affection: {
        low: "warm smile, gentle gaze, soft expression",
        medium: "loving expression, warm eyes, caring look",
        high: "deeply affectionate, loving gaze, tender expression",
      },
      neutral: {
        low: "calm expression, neutral face, relaxed",
        medium: "neutral expression, peaceful look",
        high: "serene, very calm, composed expression",
      },
    };

    const emotionDesc =
      emotionDescriptors[emotionType]?.[intensity] ||
      emotionDescriptors.neutral.medium;

    return `High quality portrait photo, ${characterDescription}, ${emotionDesc}, professional photography, natural lighting, detailed face, clear features, looking at camera, upper body shot, 8k uhd, soft focus background`;
  }
}

// Singleton
let geminImagenClient: GeminiImagenClient | null = null;

export function getGeminiImagenClient(): GeminiImagenClient {
  if (!geminiImagenClient) {
    geminiImagenClient = new GeminiImagenClient();
  }
  return geminiImagenClient;
}
```

---

### **2. Hugging Face Spaces Client**

```typescript
// lib/visual-system/huggingface-spaces-client.ts

import { Client } from "@gradio/client";

export interface HFImageGenerationParams {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  guidanceScale?: number;
  inferenceSteps?: number;
  seed?: number;
  randomizeSeed?: boolean;
}

export class HuggingFaceSpacesClient {
  private spaceUrl: string;
  private client: any;

  constructor(spaceUrl?: string) {
    this.spaceUrl = spaceUrl || "Heartsync/NSFW-Uncensored-photo";
  }

  async connect(): Promise<void> {
    if (!this.client) {
      console.log(`[HFSpaces] Connecting to ${this.spaceUrl}...`);
      this.client = await Client.connect(this.spaceUrl);
      console.log(`[HFSpaces] ✅ Connected`);
    }
  }

  async generateImage(params: HFImageGenerationParams): Promise<{
    imageUrl: string;
    seed: number;
  }> {
    try {
      await this.connect();

      console.log(`[HFSpaces] Generating NSFW image...`);

      const result = await this.client.predict("/infer", {
        prompt: params.prompt,
        negative_prompt:
          params.negativePrompt ||
          "text, watermark, signature, cartoon, anime, illustration, painting, drawing, low quality, blurry",
        seed: params.seed || 0,
        randomize_seed: params.randomizeSeed ?? true,
        width: params.width || 1024,
        height: params.height || 1024,
        guidance_scale: params.guidanceScale || 7,
        num_inference_steps: params.inferenceSteps || 28,
      });

      // result.data contiene la URL de la imagen generada
      const imageUrl = result.data as string;

      console.log(`[HFSpaces] ✅ Image generated: ${imageUrl}`);

      return {
        imageUrl,
        seed: params.seed || 0,
      };
    } catch (error) {
      console.error("[HFSpaces] Error generating image:", error);
      throw error;
    }
  }

  /**
   * Genera prompt mejorado usando el boost del Space
   */
  async boostPrompt(keyword: string): Promise<string> {
    try {
      await this.connect();

      const result = await this.client.predict("/boost_prompt", {
        keyword,
      });

      return result.data as string;
    } catch (error) {
      console.error("[HFSpaces] Error boosting prompt:", error);
      return keyword; // Fallback al original
    }
  }

  /**
   * Obtiene un prompt aleatorio del Space
   */
  async getRandomPrompt(): Promise<string> {
    try {
      await this.connect();

      const result = await this.client.predict("/get_random_prompt", {});

      return result.data as string;
    } catch (error) {
      console.error("[HFSpaces] Error getting random prompt:", error);
      return "";
    }
  }
}

// Singleton
let hfSpacesClient: HuggingFaceSpacesClient | null = null;

export function getHuggingFaceSpacesClient(): HuggingFaceSpacesClient {
  if (!hfSpacesClient) {
    hfSpacesClient = new HuggingFaceSpacesClient();
  }
  return hfSpacesClient;
}
```

---

### **3. Unified Visual Generation Service**

```typescript
// lib/visual-system/visual-generation-service.ts

import { getGeminiImagenClient } from "./gemini-imagen-client";
import { getHuggingFaceSpacesClient } from "./huggingface-spaces-client";
import { prisma } from "@/lib/prisma";

export type ContentType = "sfw" | "suggestive" | "nsfw";
export type UserTier = "free" | "premium";

export interface VisualGenerationRequest {
  agentId: string;
  emotionType: string;
  intensity: "low" | "medium" | "high";
  context?: string;
  contentType?: ContentType;
  userTier?: UserTier;
}

export class VisualGenerationService {
  /**
   * Genera o recupera expresión visual para un agente
   */
  async getOrGenerateExpression(
    request: VisualGenerationRequest
  ): Promise<{
    imageUrl: string;
    type: "photo";
    cached: boolean;
  }> {
    const {
      agentId,
      emotionType,
      intensity,
      context,
      contentType = "sfw",
      userTier = "free",
    } = request;

    // 1. Buscar en cache
    const cached = await prisma.visualExpression.findFirst({
      where: {
        agentId,
        emotionType,
        intensity,
        context,
      },
      orderBy: {
        timesUsed: "desc",
      },
    });

    if (cached) {
      // Actualizar stats
      await prisma.visualExpression.update({
        where: { id: cached.id },
        data: {
          timesUsed: { increment: 1 },
          lastUsed: new Date(),
        },
      });

      console.log(`[VisualGen] Using cached expression: ${cached.id}`);

      return {
        imageUrl: cached.url,
        type: "photo",
        cached: true,
      };
    }

    // 2. No existe en cache - generar nueva
    console.log(
      `[VisualGen] No cache found, generating new expression for ${emotionType}/${intensity}`
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
  }): Promise<{ imageUrl: string; seed: number }> {
    const { agentId, emotionType, intensity, context, contentType, userTier } =
      params;

    // 1. Obtener apariencia del personaje
    const appearance = await prisma.characterAppearance.findUnique({
      where: { agentId },
    });

    if (!appearance) {
      throw new Error(`Character appearance not found for agent: ${agentId}`);
    }

    // 2. Seleccionar proveedor
    const provider = this.selectProvider({
      contentType,
      userTier,
      needsFaceConsistency: true,
      hasReferenceImage: !!appearance.referencePhotoUrl,
    });

    console.log(`[VisualGen] Using provider: ${provider}`);

    // 3. Generar imagen
    let imageUrl: string;
    let seed: number;

    if (provider === "gemini") {
      const gemini = getGeminiImagenClient();
      const result = await gemini.generateCharacterExpression({
        characterDescription: appearance.basePrompt,
        emotionType,
        intensity,
        referenceImage: appearance.basePhotoUrl || undefined,
        seed: appearance.seed || undefined,
      });

      imageUrl = result.imageUrl;
      seed = result.seed;
    } else {
      // Hugging Face Spaces
      const hf = getHuggingFaceSpacesClient();

      // Construir prompt para HF
      const prompt = `${appearance.basePrompt}, ${emotionType} expression, ${intensity} intensity, ${context || ""}`;

      const result = await hf.generateImage({
        prompt,
        seed: appearance.seed || undefined,
        width: 1024,
        height: 1024,
      });

      imageUrl = result.imageUrl;
      seed = result.seed;
    }

    // 4. Almacenar en base de datos
    const visualExpression = await prisma.visualExpression.create({
      data: {
        agentId,
        emotionType,
        intensity,
        context,
        type: "photo",
        url: imageUrl,
        generationParams: {
          provider,
          seed,
          contentType,
        },
        width: 1024,
        height: 1024,
        timesUsed: 1,
        lastUsed: new Date(),
      },
    });

    // 5. Actualizar stats de CharacterAppearance
    await prisma.characterAppearance.update({
      where: { agentId },
      data: {
        totalGenerations: { increment: 1 },
      },
    });

    console.log(
      `[VisualGen] ✅ New expression generated and cached: ${visualExpression.id}`
    );

    return { imageUrl, seed };
  }

  /**
   * Selecciona el proveedor adecuado
   */
  private selectProvider(params: {
    contentType: ContentType;
    userTier: UserTier;
    needsFaceConsistency: boolean;
    hasReferenceImage: boolean;
  }): "gemini" | "huggingface" {
    const { contentType, userTier, needsFaceConsistency } = params;

    // NSFW solo para premium users
    if (contentType === "nsfw") {
      if (userTier !== "premium") {
        throw new Error("NSFW content requires premium tier");
      }
      return "huggingface";
    }

    // Suggestive sin rostro → HF
    if (contentType === "suggestive" && !needsFaceConsistency) {
      return "huggingface";
    }

    // Default: Gemini (mejor calidad + consistencia facial)
    return "gemini";
  }

  /**
   * Pre-genera set de expresiones base al crear personaje
   */
  async generateBaseExpressions(agentId: string): Promise<void> {
    console.log(`[VisualGen] Generating base expressions for agent: ${agentId}`);

    const baseExpressions = [
      { emotionType: "neutral", intensity: "medium" as const },
      { emotionType: "joy", intensity: "low" as const },
      { emotionType: "joy", intensity: "medium" as const },
      { emotionType: "joy", intensity: "high" as const },
      { emotionType: "distress", intensity: "low" as const },
      { emotionType: "distress", intensity: "high" as const },
      { emotionType: "affection", intensity: "medium" as const },
      { emotionType: "concern", intensity: "medium" as const },
      { emotionType: "anger", intensity: "low" as const },
      { emotionType: "fear", intensity: "medium" as const },
    ];

    for (const expr of baseExpressions) {
      await this.getOrGenerateExpression({
        agentId,
        emotionType: expr.emotionType,
        intensity: expr.intensity,
        contentType: "sfw",
        userTier: "free",
      });
    }

    console.log(
      `[VisualGen] ✅ Generated ${baseExpressions.length} base expressions`
    );
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
```

---

## 📋 PRÓXIMOS PASOS

### **Paso 1: Instalar dependencias**
```bash
npm install @gradio/client
npm install @google/generative-ai
```

### **Paso 2: Extender schema Prisma**
```prisma
model CharacterAppearance {
  // ... (ya definido en VISUAL-SYSTEM-ANALYSIS.md)
}

model VisualExpression {
  // ... (ya definido en VISUAL-SYSTEM-ANALYSIS.md)
}
```

### **Paso 3: Integrar con sistema emocional**
Modificar `orchestrator.ts` para incluir visual generation en la respuesta

### **Paso 4: Crear UI de chat con imágenes**
Frontend que muestre la foto/expresión del personaje

---

## ✅ VENTAJAS DE ESTA ARQUITECTURA

1. ✅ **Costo optimizado**: $0.06 por imagen (Gemini) vs $0.25 (DALL-E)
2. ✅ **NSFW support**: Hugging Face Spaces gratis para tier premium
3. ✅ **Cache inteligente**: Genera una vez, usa 100 veces
4. ✅ **Fallback automático**: Si un provider falla, usa el otro
5. ✅ **Face consistency**: Gemini con reference images
6. ✅ **Escalable**: Ambos providers tienen buena capacidad

**¿Procedemos con la implementación?** 🎨🚀
