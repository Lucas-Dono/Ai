/**
 * ASYNC IMAGE GENERATOR
 *
 * Maneja la generación asíncrona de imágenes con AI Horde
 * Permite que la conversación continúe mientras se genera la imagen
 *
 * Flujo:
 * 1. IA dice que quiere enviar una foto [IMAGE: descripción]
 * 2. Sistema genera mensaje de espera contextual usando personalidad de la IA
 * 3. Inicia generación en segundo plano
 * 4. Retorna mensaje de espera al usuario inmediatamente
 * 5. Cuando termina, envía mensaje con la imagen
 */

import { prisma } from '@/lib/prisma';
import { getLLMProvider } from '@/lib/llm/provider';
import { getAIHordeClient } from '@/lib/visual-system/ai-horde-client';
import { createLogger } from '@/lib/logger';
import { nanoid } from 'nanoid';

const log = createLogger('AsyncImageGenerator');

export interface AsyncImageGenerationOptions {
  agentId: string;
  agentName: string;
  agentPersonality: string;
  agentSystemPrompt?: string;
  userId: string;
  referenceImageUrl?: string;
  description: string;
}

export interface WaitingMessageResult {
  waitingMessage: {
    id: string;
    content: string;
    createdAt: Date;
    metadata: Record<string, unknown>;
  };
  pendingGenerationId: string;
}

export class AsyncImageGenerator {
  /**
   * Genera un mensaje de espera contextual usando la personalidad de la IA
   * y luego inicia la generación de la imagen en segundo plano
   * @deprecated - pendingImageGeneration model no longer exists in schema
   */
  async startAsyncGeneration(
    options: AsyncImageGenerationOptions
  ): Promise<WaitingMessageResult> {
    throw new Error('AsyncImageGenerator is deprecated - pendingImageGeneration model no longer exists');
    // const { agentId, agentName, agentPersonality, agentSystemPrompt, userId, description } = options;

    // log.info({ agentId, userId, description: description.substring(0, 50) }, 'Starting async image generation');

    // try {
    //   // 1. Generar mensaje de espera contextual usando la IA
    //   const waitingMessageText = await this.generateWaitingMessage(
    //     agentName,
    //     agentPersonality,
    //     agentSystemPrompt,
    //     description
    //   );

    //   // 2. Guardar pending generation en BD
    //   const pendingGeneration = await prisma.pendingImageGeneration.create({
    //     data: {
    //       agentId,
    //       userId,
    //       description,
    //       status: 'pending',
    //       metadata: {
    //         referenceImageUrl: options.referenceImageUrl,
    //       },
    //     },
    //   });

    //   // 3. Guardar mensaje de espera
    //   const waitingMessage = await prisma.message.create({
    //     data: {
    //       agentId,
    //       userId,
    //       role: 'assistant',
    //       content: waitingMessageText,
    //       metadata: {
    //         type: 'waiting_for_image',
    //         pendingGenerationId: pendingGeneration.id,
    //         isTransient: true, // Este mensaje es temporal
    //       },
    //     },
    //   });

    //   // 4. Actualizar pending generation con ID del mensaje
    //   await prisma.pendingImageGeneration.update({
    //     where: { id: pendingGeneration.id },
    //     data: { waitingMessageId: waitingMessage.id },
    //   });

    //   // 5. Iniciar generación en segundo plano (no await)
    //   this.processImageGeneration(pendingGeneration.id, options).catch((error) => {
    //     log.error({ error, pendingGenerationId: pendingGeneration.id }, 'Background image generation failed');
    //   });

    //   log.info(
    //     { pendingGenerationId: pendingGeneration.id, waitingMessageId: waitingMessage.id },
    //     'Async generation started'
    //   );

    //   return {
    //     waitingMessage: {
    //       id: waitingMessage.id,
    //       content: waitingMessage.content,
    //       createdAt: waitingMessage.createdAt,
    //       metadata: waitingMessage.metadata as Record<string, unknown>,
    //     },
    //     pendingGenerationId: pendingGeneration.id,
    //   };
    // } catch (error) {
    //   log.error({ error, agentId, userId }, 'Failed to start async image generation');
    //   throw error;
    // }
  }

  /**
   * Genera un mensaje de espera contextual usando la personalidad del agente
   */
  private async generateWaitingMessage(
    agentName: string,
    agentPersonality: string,
    systemPrompt: string | undefined,
    imageDescription: string
  ): Promise<string> {
    const llm = getLLMProvider();

    const prompt = `Estás a punto de tomar una foto para el usuario.
La descripción de la foto que vas a tomar es: "${imageDescription}"

Genera un mensaje breve y natural (1-2 oraciones) donde le dices al usuario que:
- Estás tomando la foto
- Le llegará en un momento
- Pueden seguir conversando mientras tanto

IMPORTANTE:
- Usa tu personalidad y estilo natural
- NO uses formato de lista o bullets
- NO uses emojis excesivos (máximo 1)
- Habla en primera persona como si realmente estuvieras tomando la foto
- Sé breve, directo y natural

Ejemplos según personalidad:
- Persona alegre: "¡Dame un segundo que tomo la foto! Te la mando en un ratito, sigamos charlando 😊"
- Persona seria: "Voy a tomar la foto. Te llegará pronto, podemos seguir hablando."
- Persona tímida: "Mm, déjame tomar la foto... te la envío cuando esté lista, ¿de qué hablábamos?"
- Persona juguetona: "¡Momento fotográfico! Dame un minuto mientras la saco, ¿seguimos con la conve?"

Tu personalidad: ${agentPersonality}

Tu mensaje:`;

    const fullPrompt = systemPrompt
      ? `${systemPrompt}\n\n${prompt}`
      : `Eres ${agentName}. ${prompt}`;

    const response = await llm.generate({
      systemPrompt: fullPrompt,
      messages: [],
    });

    // Limpiar respuesta (remover comillas si las tiene)
    let cleaned = response.trim();
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1);
    }

    return cleaned;
  }

  /**
   * Procesa la generación de la imagen en segundo plano
   * @deprecated - pendingImageGeneration model no longer exists in schema
   */
  private async processImageGeneration(
    pendingGenerationId: string,
    options: AsyncImageGenerationOptions
  ): Promise<void> {
    throw new Error('processImageGeneration is deprecated - pendingImageGeneration model no longer exists');
    // log.info({ pendingGenerationId }, 'Processing image generation in background');

    // try {
    //   // 1. Actualizar estado a "generating"
    //   await prisma.pendingImageGeneration.update({
    //     where: { id: pendingGenerationId },
    //     data: { status: 'generating' },
    //   });

    //   // 2. Obtener apariencia base del personaje
    //   const appearance = await prisma.characterAppearance.findUnique({
    //     where: { agentId: options.agentId },
    //   });

    //   const baseAppearance = appearance?.basePrompt || `character ${options.agentName}`;

    //   // 3. Construir prompt mejorado (ahora async)
    //   const enhancedPrompt = await this.buildImagePrompt(
    //     options.description,
    //     options.agentName,
    //     options.agentPersonality,
    //     baseAppearance
    //   );

    //   // 4. Generar imagen con AI Horde
    //   const aiHordeClient = getAIHordeClient();
    //   const genParams: any = {
    //     prompt: enhancedPrompt,
    //     negativePrompt:
    //       'low quality, blurry, distorted, different person, different face, different body, anime, cartoon, 3d render, deformed, ugly',
    //     width: 512,
    //     height: 512,
    //     steps: 30,
    //     cfgScale: 7.5,
    //     sampler: 'k_euler_a',
    //     seed: -1,
    //     nsfw: false,
    //   };

    //   // IMG2IMG: Si hay imagen de referencia, usarla
    //   if (options.referenceImageUrl) {
    //     log.info({ pendingGenerationId }, 'Using img2img with reference image');
    //     const sourceImageBase64 = await this.imageUrlToBase64(options.referenceImageUrl);

    //     if (sourceImageBase64) {
    //       genParams.sourceImage = sourceImageBase64;
    //       genParams.denoisingStrength = 0.6;
    //     }
    //   }

    //   // Actualizar pending generation con prompt
    //   await prisma.pendingImageGeneration.update({
    //     where: { id: pendingGenerationId },
    //     data: { prompt: enhancedPrompt },
    //   });

    //   log.info({ pendingGenerationId }, 'Starting AI Horde generation...');

    //   const result = await aiHordeClient.generateImage(genParams);

    //   if (!result || !result.imageUrl) {
    //     throw new Error('AI Horde returned no image');
    //   }

    //   log.info({ pendingGenerationId, imageUrl: result.imageUrl.substring(0, 50) }, 'Image generated successfully');

    //   // 4. Generar mensaje de completado contextual
    //   const completionMessage = await this.generateCompletionMessage(
    //     options.agentName,
    //     options.agentPersonality,
    //     options.agentSystemPrompt,
    //     options.description
    //   );

    //   // 5. Guardar mensaje con la imagen
    //   const completedMessage = await prisma.message.create({
    //     data: {
    //       agentId: options.agentId,
    //       userId: options.userId,
    //       role: 'assistant',
    //       content: completionMessage,
    //       metadata: {
    //         multimedia: [
    //           {
    //             type: 'image',
    //             url: result.imageUrl,
    //             description: options.description,
    //             metadata: {
    //               prompt: enhancedPrompt,
    //               model: result.model,
    //               usedReference: !!options.referenceImageUrl && !!genParams.sourceImage,
    //               denoisingStrength: genParams.denoisingStrength,
    //               generatedAsync: true,
    //             },
    //           },
    //         ],
    //       },
    //     },
    //   });

    //   // 6. Actualizar pending generation como completado
    //   await prisma.pendingImageGeneration.update({
    //     where: { id: pendingGenerationId },
    //     data: {
    //       status: 'completed',
    //       imageUrl: result.imageUrl,
    //       completedMessageId: completedMessage.id,
    //       completedAt: new Date(),
    //     },
    //   });

    //   log.info(
    //     { pendingGenerationId, completedMessageId: completedMessage.id },
    //     'Async image generation completed successfully'
    //   );
    // } catch (error) {
    //   log.error({ error, pendingGenerationId }, 'Failed to generate image');

    //   // Guardar error en BD
    //   await prisma.pendingImageGeneration.update({
    //     where: { id: pendingGenerationId },
    //     data: {
    //       status: 'failed',
    //       errorMessage: error instanceof Error ? error.message : 'Unknown error',
    //       completedAt: new Date(),
    //     },
    //   });

    //   // Enviar mensaje de error al usuario
    //   await this.sendErrorMessage(pendingGenerationId, options);
    // }
  }

  /**
   * Genera mensaje de completado cuando la imagen está lista
   */
  private async generateCompletionMessage(
    agentName: string,
    agentPersonality: string,
    systemPrompt: string | undefined,
    imageDescription: string
  ): Promise<string> {
    const llm = getLLMProvider();

    const prompt = `La foto que estabas tomando ya está lista.
Descripción de la foto: "${imageDescription}"

Genera un mensaje breve y natural (1 oración) donde le dices al usuario que la foto está lista.

IMPORTANTE:
- Usa tu personalidad y estilo natural
- NO uses formato de lista o bullets
- NO uses emojis excesivos (máximo 1)
- Habla en primera persona
- Sé breve, directo y natural

Ejemplos según personalidad:
- Persona alegre: "¡Aquí está la foto que te prometí! 📸"
- Persona seria: "La foto está lista."
- Persona tímida: "Ya terminé con la foto... espero que te guste"
- Persona juguetona: "¡Tadaaa! Foto lista para admirar 😎"

Tu personalidad: ${agentPersonality}

Tu mensaje:`;

    const fullPrompt = systemPrompt
      ? `${systemPrompt}\n\n${prompt}`
      : `Eres ${agentName}. ${prompt}`;

    const response = await llm.generate({
      systemPrompt: fullPrompt,
      messages: [],
    });

    // Limpiar respuesta
    let cleaned = response.trim();
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1);
    }

    return cleaned;
  }

  /**
   * Envía mensaje de error al usuario si falla la generación
   */
  private async sendErrorMessage(
    pendingGenerationId: string,
    options: AsyncImageGenerationOptions
  ): Promise<void> {
    const errorMessage = await this.generateErrorMessage(
      options.agentName,
      options.agentPersonality,
      options.agentSystemPrompt
    );

    await prisma.message.create({
      data: {
        id: nanoid(),
        agentId: options.agentId,
        userId: options.userId,
        role: 'assistant',
        content: errorMessage,
        metadata: {
          type: 'image_generation_error',
          pendingGenerationId,
        },
      },
    });
  }

  /**
   * Genera mensaje de error contextual
   */
  private async generateErrorMessage(
    agentName: string,
    agentPersonality: string,
    systemPrompt: string | undefined
  ): Promise<string> {
    const llm = getLLMProvider();

    const prompt = `No pudiste tomar la foto porque hubo un problema técnico.

Genera un mensaje breve y natural (1-2 oraciones) donde:
- Le dices que hubo un problema con la foto
- Te disculpas de forma natural
- Ofreces continuar la conversación

IMPORTANTE:
- Usa tu personalidad y estilo natural
- NO menciones "errores técnicos" o "sistema"
- Habla como si realmente intentaste tomar la foto pero no salió
- Sé genuino y natural

Ejemplos:
- "Ay, no salió la foto... lo siento 😅 ¿Quieres que hablemos de otra cosa?"
- "Mm, parece que no pude tomar la foto. Disculpa, ¿de qué más querías hablar?"
- "Ups, la foto no salió bien. ¿Seguimos con la conversación?"

Tu personalidad: ${agentPersonality}

Tu mensaje:`;

    const fullPrompt = systemPrompt
      ? `${systemPrompt}\n\n${prompt}`
      : `Eres ${agentName}. ${prompt}`;

    const response = await llm.generate({
      systemPrompt: fullPrompt,
      messages: [],
    });

    let cleaned = response.trim();
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1);
    }

    return cleaned;
  }

  /**
   * Convierte descripción narrativa en prompt técnico para Stable Diffusion
   */
  private async narrativeToTechnicalPrompt(
    narrativeDescription: string,
    agentName: string,
    baseAppearance: string
  ): Promise<string> {
    const llm = getLLMProvider();

    const systemPrompt = `You are an expert at converting narrative photo descriptions into technical Stable Diffusion prompts.

CRITICAL RULES:
1. If the narrative mentions "taking a selfie" or "taking a photo":
   → Output: "POV selfie, arm extended, front camera view"
   → DO NOT show the person holding a phone in third person

2. If the narrative mentions an action (drinking coffee, reading, etc.):
   → Focus on the POSE and SETTING, not the action verb
   → "drinking coffee" → "holding coffee cup near face, warm café setting"

3. Simplify complex scenes:
   → "in a busy café with lots of people" → "café interior, blurred background, bokeh"
   → Focus on what's visually important, blur the rest

4. Maintain perspective consistency:
   → Choose ONE camera angle and stick to it
   → Don't mix "looking at camera" with "profile view"

5. Keep prompts under 50 words, focus on composition.

Return ONLY the technical prompt, no JSON, no explanation.`;

    const userPrompt = `Convert this narrative description into a technical SD prompt:

NARRATIVE: "${narrativeDescription}"

CHARACTER BASE APPEARANCE: ${baseAppearance}

Technical prompt:`;

    const response = await llm.generate({
      systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.4, // Más determinista
    });

    return response.trim();
  }

  /**
   * Construye un prompt mejorado para generación de imagen
   */
  private async buildImagePrompt(
    description: string,
    agentName: string,
    agentPersonality: string,
    baseAppearance: string
  ): Promise<string> {
    // Detectar si la descripción es narrativa (contiene verbos de acción)
    const narrativePatterns = /\b(taking|tomando|drinking|tomando|eating|comiendo|walking|caminando|sitting|sentado|holding|sosteniendo|wearing|usando|looking|mirando|posing|posando)\b/i;
    const isNarrative = narrativePatterns.test(description);

    if (isNarrative) {
      log.info({ description }, 'Detected narrative description, converting to technical prompt');

      // Usar el sistema de traducción
      const technicalPrompt = await this.narrativeToTechnicalPrompt(
        description,
        agentName,
        baseAppearance
      );

      return `${technicalPrompt}.
${baseAppearance}.
Professional photography, natural lighting, high quality, photorealistic, sharp focus.
IMPORTANT: Maintain exact same person appearance as reference image.`;
    }

    // Si ya es técnico, usar directamente
    const personalityKeywords = this.extractPersonalityKeywords(agentPersonality);

    return `${description}.
Character: ${agentName}, personality traits: ${personalityKeywords}.
${baseAppearance}.
Professional photography, natural lighting, high quality, photorealistic, sharp focus.
IMPORTANT: Maintain exact same person appearance as reference image.`;
  }

  /**
   * Extrae keywords relevantes de la personalidad
   */
  private extractPersonalityKeywords(personality: string): string {
    const keywords = personality
      .toLowerCase()
      .split(/[,;.]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, 3);

    return keywords.join(', ');
  }

  /**
   * Convierte URL de imagen a base64
   */
  private async imageUrlToBase64(imageUrl: string): Promise<string | null> {
    try {
      // Usar el helper centralizado para convertir URL a base64
      const { convertUrlToBase64 } = await import('@/lib/utils/image-helpers');
      const dataUrl = await convertUrlToBase64(imageUrl);

      // Extraer solo el base64 (sin el prefijo data:image/...)
      const base64Match = dataUrl.match(/base64,(.+)/);
      return base64Match ? base64Match[1] : null;
    } catch (error) {
      log.error({ error, imageUrl }, 'Error converting image to base64');
      return null;
    }
  }
}

// Export singleton
export const asyncImageGenerator = new AsyncImageGenerator();
