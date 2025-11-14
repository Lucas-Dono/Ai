/**
 * API Route: Multimodal Agent Message
 *
 * Endpoint que procesa mensajes del usuario y genera respuestas multimodales:
 * - Analiza la emoción del mensaje
 * - Genera respuesta de texto
 * - Genera audio (voz del personaje)
 * - Genera imagen (expresión facial)
 * - Decide autónomamente qué combinación enviar
 *
 * POST /api/agents/[id]/message-multimodal
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLLMProvider } from "@/lib/llm/provider";
import { getEmotionalSystemOrchestrator } from "@/lib/emotional-system/orchestrator";
import { getVisualGenerationService } from "@/lib/visual-system/visual-generation-service";
import { getEmotionalAnalyzer } from "@/lib/multimodal/emotional-analyzer";
import { getEmotionalOrchestrator } from "@/lib/multimodal/orchestrator";
import { getVoiceService } from "@/lib/multimodal/voice-service";
import { getUserTier } from "@/lib/billing/user-tier";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const agentId = id;

    // 1. Verificar que el agente existe y el usuario tiene acceso
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        internalState: true,
        voiceConfig: true,
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (agent.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log(`[MultimodalAPI] Processing message for agent: ${agent.name}`);

    // 2. Analizar emoción del mensaje del usuario
    const analyzer = getEmotionalAnalyzer();
    const userEmotion = await analyzer.analyzeMessage(message);

    console.log(`[MultimodalAPI] User emotion:`, userEmotion);

    // 3. Generar respuesta completa del agente (con emoción y personalidad)
    const orchestrator = getEmotionalOrchestrator();
    const agentResponse = await orchestrator.generateResponse({
      agentId,
      userMessage: message,
      userEmotion,
      includeMetadata: true,
    });

    console.log(`[MultimodalAPI] Agent response generated`);
    console.log(`[MultimodalAPI] Agent emotion:`, agentResponse.emotion);

    // 4. Obtener tier del usuario
    const userTier = await getUserTier(session.user.id);
    console.log(`[MultimodalAPI] User tier:`, userTier);

    // 5. Decidir qué modalidades incluir
    const modalityDecision = decideModalities({
      messageLength: agentResponse.text.length,
      emotion: agentResponse.emotion,
      userTier,
      hasVoice: !!agent.voiceConfig,
    });

    console.log(`[MultimodalAPI] Modalities:`, modalityDecision);

    // 6. Generar contenido según modalidades
    const responseContent: {
      text: string;
      audioUrl?: string;
      imageUrl?: string;
      emotion: {
        type: string;
        intensity: "low" | "medium" | "high";
      };
    } = {
      text: agentResponse.text,
      emotion: {
        type: agentResponse.emotion.dominantEmotion,
        intensity: agentResponse.emotion.intensity,
      },
    };

    // 6.1 Generar imagen (expresión facial) - Comentado por ahora
    // TODO: Descomentar cuando se necesite generación de imágenes
    /*
    if (modalityDecision.includeImage && agent.avatar) {
      try {
        const visualService = getVisualGenerationService();
        const imageResult = await visualService.getOrGenerateExpression({
          agentId,
          emotionType: agentResponse.emotion.dominantEmotion,
          intensity: agentResponse.emotion.intensity,
          contentType: "sfw",
          userTier,
        });

        responseContent.imageUrl = imageResult.imageUrl;
        console.log(`[MultimodalAPI] Image generated: ${imageResult.cached ? "cached" : "new"}`);
      } catch (error) {
        console.error(`[MultimodalAPI] Error generating image:`, error);
        // Continuar sin imagen si falla
      }
    }
    */

    // 6.2 Generar audio (voz del personaje)
    if (modalityDecision.includeAudio) {
      try {
        const voiceService = getVoiceService();
        const audioResult = await voiceService.generateSpeech({
          text: agentResponse.text,
          agentId,
          emotion: agentResponse.emotion.dominantEmotion,
          intensity: agentResponse.emotion.intensity,
        });

        responseContent.audioUrl = audioResult.audioUrl;
        console.log(`[MultimodalAPI] Audio generated: ${audioResult.cached ? "cached" : "new"}`);
      } catch (error) {
        console.error(`[MultimodalAPI] Error generating audio:`, error);
        // Continuar sin audio si falla
      }
    }

    // 7. Guardar mensaje en la base de datos - Comentado por ahora
    // TODO: Descomentar cuando se implemente el modelo Conversation
    /*
    const conversation = await prisma.conversation.findFirst({
      where: {
        agentId,
        userId: session.user.id,
      },
    });

    if (conversation) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: "assistant",
          content: agentResponse.text,
          metadata: {
            audioUrl: responseContent.audioUrl,
            imageUrl: responseContent.imageUrl,
            emotion: responseContent.emotion,
            modalities: modalityDecision,
          },
        },
      });
    }
    */

    // 8. Retornar respuesta multimodal
    return NextResponse.json({
      success: true,
      response: responseContent,
      messageId: Date.now().toString(),
    });
  } catch (error) {
    console.error("[MultimodalAPI] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Decide qué modalidades incluir en la respuesta
 * La IA decide autónomamente basándose en contexto
 */
function decideModalities(params: {
  messageLength: number;
  emotion: {
    dominantEmotion: string;
    intensity: "low" | "medium" | "high";
  };
  userTier: string;
  hasVoice: boolean;
}): {
  includeText: boolean;
  includeAudio: boolean;
  includeImage: boolean;
} {
  const { messageLength, emotion, userTier, hasVoice } = params;

  // Siempre incluir texto
  const includeText = true;

  // Incluir audio si:
  // - El agente tiene voz configurada
  // - Y (mensaje corto-medio O emoción intensa)
  // - Y el usuario tiene tier plus/ultra
  const includeAudio =
    hasVoice &&
    (messageLength < 200 || emotion.intensity === "high") &&
    (userTier === "plus" || userTier === "ultra");

  // Incluir imagen deshabilitado por ahora
  const includeImage = false;

  return {
    includeText,
    includeAudio,
    includeImage,
  };
}
