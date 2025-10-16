import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLLMProvider } from "@/lib/llm/provider";
import { EmotionalEngine } from "@/lib/relations/engine";
import { createMemoryManager } from "@/lib/memory/manager";
import { checkRateLimit } from "@/lib/redis/ratelimit";
import { canUseResource, trackUsage } from "@/lib/usage/tracker";
import { auth } from "@/lib/auth";
import { behaviorOrchestrator } from "@/lib/behavior-system";
import { getRelationshipStage, shouldAdvanceStage } from "@/lib/relationship/stages";
import { getPromptForStage } from "@/lib/relationship/prompt-generator";
import type { StagePrompts } from "@/lib/relationship/prompt-generator";
import type { RelationshipStage } from "@/lib/relationship/stages";
import {
  analyzeMessageEmotions,
  applyEmotionDeltas,
  getEmotionalSummary,
  updateInternalState,
  type PlutchikEmotionState,
} from "@/lib/emotions";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userPlan = session.user.plan || "free";

    // Check rate limit
    const rateLimitResult = await checkRateLimit(userId, userPlan);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          limit: rateLimitResult.limit,
          reset: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit?.toString() || "0",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.reset?.toString() || "0",
          },
        }
      );
    }

    // Check message quota
    const quotaCheck = await canUseResource(userId, "message");
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: quotaCheck.reason,
          current: quotaCheck.current,
          limit: quotaCheck.limit,
          upgrade: "/pricing",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { content, messageType, metadata } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Determinar el contenido real que procesa la IA
    let contentForAI = content;
    let contentForUser = content;
    let messageMetadata: any = metadata || {};

    // Si es un GIF, traducir a texto para la IA
    if (messageType === "gif" && metadata?.description) {
      contentForAI = `[El usuario envió un GIF de: ${metadata.description}]`;
      contentForUser = content; // URL del GIF para mostrar al usuario
      messageMetadata = {
        ...metadata,
        messageType: "gif",
        gifDescription: metadata.description,
      };
    }

    // Si es audio, indicar que es un mensaje de voz
    if (messageType === "audio") {
      contentForAI = content; // Ya debería venir transcrito
      messageMetadata = {
        ...metadata,
        messageType: "audio",
        audioDuration: metadata?.duration,
      };
    }

    // Obtener agente y verificar ownership
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (agent.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Guardar mensaje del usuario (con URL/contenido visual)
    const userMessage = await prisma.message.create({
      data: {
        agentId,
        userId,
        role: "user",
        content: contentForUser, // URL del GIF o contenido original
        metadata: messageMetadata,
      },
    });

    // Obtener relación actual
    let relation = await prisma.relation.findFirst({
      where: {
        subjectId: agentId,
        targetId: userId,
        targetType: "user",
      },
    });

    if (!relation) {
      relation = await prisma.relation.create({
        data: {
          subjectId: agentId,
          targetId: userId,
          targetType: "user",
          trust: 0.5,
          affinity: 0.5,
          respect: 0.5,
          privateState: { love: 0, curiosity: 0 },
          visibleState: { trust: 0.5, affinity: 0.5, respect: 0.5 },
          stage: "stranger",
          totalInteractions: 0,
        },
      });
    }

    // Actualizar contador de interacciones y etapa de relación
    const newTotalInteractions = relation.totalInteractions + 1;
    const newStage = getRelationshipStage(newTotalInteractions);
    const stageChanged = shouldAdvanceStage(newTotalInteractions, relation.stage as RelationshipStage);

    // ===== SISTEMA EMOCIONAL COMPLETO (Plutchik) =====
    // Obtener o crear InternalState del agente
    let internalState = await prisma.internalState.findUnique({
      where: { agentId },
    });

    let currentEmotions: PlutchikEmotionState;
    if (!internalState) {
      // Crear estado inicial neutro
      const { createNeutralState } = await import("@/lib/emotions");
      currentEmotions = createNeutralState();

      internalState = await prisma.internalState.create({
        data: {
          agentId,
          currentEmotions,
          moodValence: 0.0,
          moodArousal: 0.5,
          moodDominance: 0.5,
          activeGoals: [],
          conversationBuffer: [],
        },
      });
    } else {
      currentEmotions = internalState.currentEmotions as PlutchikEmotionState;
    }

    // Analizar el mensaje del usuario y calcular deltas emocionales
    // Usar contentForAI para que analice la descripción del GIF, no la URL
    const emotionDeltas = analyzeMessageEmotions(contentForAI);

    // Aplicar deltas con decay e inercia
    const newEmotionState = applyEmotionDeltas(
      currentEmotions,
      emotionDeltas,
      internalState.emotionDecayRate,
      internalState.emotionInertia
    );

    // Obtener resumen emocional
    const emotionalSummary = getEmotionalSummary(newEmotionState);

    // Actualizar InternalState en DB
    await updateInternalState(agentId, newEmotionState, prisma);

    // Actualizar relación (mantener compatibilidad con sistema legacy)
    // Mapear emociones Plutchik a métricas legacy
    const trust = newEmotionState.trust;
    const affinity = (newEmotionState.joy + newEmotionState.trust) / 2;
    const respect = (newEmotionState.trust + newEmotionState.anticipation) / 2;

    await prisma.relation.update({
      where: { id: relation.id },
      data: {
        trust,
        affinity,
        respect,
        privateState: {
          love: (newEmotionState.joy + newEmotionState.trust) / 2,
          curiosity: (newEmotionState.surprise + newEmotionState.anticipation) / 2,
        },
        visibleState: { trust, affinity, respect },
        totalInteractions: newTotalInteractions,
        stage: newStage,
        lastInteractionAt: new Date(),
      },
    });

    // Create memory manager for RAG
    const memoryManager = createMemoryManager(agentId, userId);

    // Obtener mensajes recientes
    const recentMessages = await prisma.message.findMany({
      where: { agentId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // ===== BEHAVIOR SYSTEM INTEGRATION =====
    // Procesar mensaje a través del behavior system
    const behaviorOrchestration = await behaviorOrchestrator.processIncomingMessage({
      agent,
      userMessage,
      recentMessages,
      dominantEmotion: undefined, // TODO: inferir de newState o EmotionalEngine
      emotionalState: {
        valence: newState.valence,
        arousal: newState.arousal,
        dominance: newState.dominance,
      },
    });

    // ===== RELATIONSHIP STAGE PROMPT SELECTION =====
    // Obtener el prompt apropiado para la etapa actual de relación
    const stagePrompts = agent.stagePrompts as StagePrompts | null;
    const basePrompt = getPromptForStage(
      stagePrompts,
      newStage,
      agent.systemPrompt
    );

    // Ajustar system prompt con emoción usando el nuevo sistema
    const emotionalContext = `
Estado emocional actual:
- Emociones dominantes: ${emotionalSummary.dominant.join(", ")}
${emotionalSummary.secondary.length > 0 ? `- Emociones secundarias: ${emotionalSummary.secondary.join(", ")}` : ""}
- Mood general: ${emotionalSummary.mood}
- Valence (placer): ${(emotionalSummary.pad.valence * 100).toFixed(0)}%
- Arousal (activación): ${(emotionalSummary.pad.arousal * 100).toFixed(0)}%

Refleja estas emociones de manera sutil en tu tono y respuestas.
`;

    const emotionalPrompt = `${basePrompt}\n\n${emotionalContext}`;

    // Combinar prompt emocional con behavior prompt
    let enhancedPrompt = emotionalPrompt;
    if (behaviorOrchestration.enhancedSystemPrompt) {
      enhancedPrompt += "\n\n" + behaviorOrchestration.enhancedSystemPrompt;
    }

    // Build enhanced prompt with RAG context
    // Usar contentForAI para que el sistema RAG busque por descripción, no por URL
    const finalPrompt = await memoryManager.buildEnhancedPrompt(
      enhancedPrompt,
      contentForAI
    );

    // Generar respuesta con LLM
    const llm = getLLMProvider();
    let response = await llm.generate({
      systemPrompt: finalPrompt,
      messages: recentMessages.reverse().map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    // ===== CONTENT MODERATION =====
    // Moderar respuesta si hay behaviors activos
    if (behaviorOrchestration.activeBehaviors.length > 0) {
      const primaryBehavior = behaviorOrchestration.activeBehaviors[0];

      // Obtener el BehaviorProfile para acceder a currentPhase
      const behaviorProfile = await prisma.behaviorProfile.findFirst({
        where: {
          agentId,
          behaviorType: primaryBehavior.behaviorType,
        },
      });

      const moderation = behaviorOrchestration.moderator.moderateResponse(
        response,
        primaryBehavior.behaviorType,
        behaviorProfile?.currentPhase || 1,
        agent.nsfwMode || false
      );

      // Si la respuesta fue modificada o bloqueada, usar la versión moderada
      if (!moderation.allowed) {
        response = moderation.warning || "Lo siento, no puedo continuar con este tipo de contenido.";
      } else if (moderation.modifiedResponse) {
        response = moderation.modifiedResponse;
      }
    }

    // Estimar tokens usados (aproximación simple)
    const estimatedTokens = Math.ceil((content.length + response.length) / 4);

    // Guardar respuesta
    const assistantMessage = await prisma.message.create({
      data: {
        agentId,
        role: "assistant",
        content: response,
        metadata: {
          // Sistema emocional completo (Plutchik)
          emotions: {
            dominant: emotionalSummary.dominant,
            secondary: emotionalSummary.secondary,
            mood: emotionalSummary.mood,
            pad: emotionalSummary.pad,
            // Mantener compatibilidad legacy
            visible: emotionalSummary.dominant,
          },
          relationLevel: emotionalSummary.mood,
          tokensUsed: estimatedTokens,
          // Behavior System Metadata
          behaviors: {
            active: behaviorOrchestration.metadata.behaviorsActive,
            phase: behaviorOrchestration.metadata.phase,
            safetyLevel: behaviorOrchestration.metadata.safetyLevel,
            triggers: behaviorOrchestration.metadata.triggers,
          },
        },
      },
    });

    // Track usage and store memories in parallel
    await Promise.all([
      trackUsage(userId, "message", 1, agentId, {
        agentName: agent.name,
        contentLength: content.length,
        responseLength: response.length,
      }),
      trackUsage(userId, "tokens", estimatedTokens, agentId, {
        model: "gemini",
        agentId,
      }),
      // Store user message in memory
      memoryManager.storeMessage(content, "user", {
        messageId: assistantMessage.id,
      }),
      // Store assistant response in memory
      memoryManager.storeMessage(response, "assistant", {
        messageId: assistantMessage.id,
        emotions: emotionalSummary.dominant,
        relationLevel: emotionalSummary.mood,
      }),
    ]);

    // Create response with rate limit headers
    const responseData = {
      message: assistantMessage,
      // Sistema emocional completo
      emotions: {
        dominant: emotionalSummary.dominant,
        secondary: emotionalSummary.secondary,
        mood: emotionalSummary.mood,
        pad: emotionalSummary.pad,
        // Estado emocional detallado
        detailed: {
          joy: Math.round(newEmotionState.joy * 100),
          trust: Math.round(newEmotionState.trust * 100),
          fear: Math.round(newEmotionState.fear * 100),
          surprise: Math.round(newEmotionState.surprise * 100),
          sadness: Math.round(newEmotionState.sadness * 100),
          disgust: Math.round(newEmotionState.disgust * 100),
          anger: Math.round(newEmotionState.anger * 100),
          anticipation: Math.round(newEmotionState.anticipation * 100),
        },
      },
      relationLevel: emotionalSummary.mood,
      state: {
        trust,
        affinity,
        respect,
      },
      // Relationship Progression Data
      relationship: {
        stage: newStage,
        totalInteractions: newTotalInteractions,
        stageChanged,
      },
      // Behavior System Data
      behaviors: {
        active: behaviorOrchestration.metadata.behaviorsActive,
        phase: behaviorOrchestration.metadata.phase,
        safetyLevel: behaviorOrchestration.metadata.safetyLevel,
        triggers: behaviorOrchestration.metadata.triggers,
      },
      usage: {
        messagesRemaining: quotaCheck.limit === -1 ? "unlimited" : (quotaCheck.limit! - quotaCheck.current! - 1),
        tokensUsed: estimatedTokens,
      },
    };

    return NextResponse.json(responseData, {
      headers: {
        "X-RateLimit-Limit": rateLimitResult.limit?.toString() || "0",
        "X-RateLimit-Remaining": rateLimitResult.remaining?.toString() || "0",
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
