import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLLMProvider } from "@/lib/llm/provider";
import { EmotionalEngine } from "@/lib/relations/engine";
import { getVectorStore } from "@/lib/vector/store";
import { checkRateLimit } from "@/lib/redis/ratelimit";
import { canUseResource, trackUsage } from "@/lib/usage/tracker";
import { auth } from "@/lib/auth";

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
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
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

    // Guardar mensaje del usuario
    await prisma.message.create({
      data: {
        agentId,
        userId,
        role: "user",
        content,
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
        },
      });
    }

    // Analizar emoción del mensaje
    const currentState = {
      valence: 0.5,
      arousal: 0.5,
      dominance: 0.5,
      trust: relation.trust,
      affinity: relation.affinity,
      respect: relation.respect,
      love: (relation.privateState as { love?: number }).love || 0,
      curiosity: (relation.privateState as { curiosity?: number }).curiosity || 0,
    };

    const newState = EmotionalEngine.analyzeMessage(content, currentState);

    // Actualizar relación
    await prisma.relation.update({
      where: { id: relation.id },
      data: {
        trust: newState.trust,
        affinity: newState.affinity,
        respect: newState.respect,
        privateState: { love: newState.love, curiosity: newState.curiosity },
        visibleState: {
          trust: newState.trust,
          affinity: newState.affinity,
          respect: newState.respect,
        },
      },
    });

    // Obtener mensajes recientes
    const recentMessages = await prisma.message.findMany({
      where: { agentId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Ajustar system prompt con emoción
    const adjustedPrompt = EmotionalEngine.adjustPromptForEmotion(
      agent.systemPrompt,
      newState
    );

    // Generar respuesta con LLM
    const llm = getLLMProvider();
    const response = await llm.generate({
      systemPrompt: adjustedPrompt,
      messages: recentMessages.reverse().map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    // Estimar tokens usados (aproximación simple)
    const estimatedTokens = Math.ceil((content.length + response.length) / 4);

    // Guardar respuesta
    const assistantMessage = await prisma.message.create({
      data: {
        agentId,
        role: "assistant",
        content: response,
        metadata: {
          emotions: EmotionalEngine.getVisibleEmotions(newState),
          relationLevel: EmotionalEngine.getRelationshipLevel(newState),
          tokensUsed: estimatedTokens,
        },
      },
    });

    // Track usage
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
    ]);

    // Guardar en memoria vectorial
    const vectorStore = getVectorStore();
    await vectorStore.addMemory(agentId, `User: ${content}\nAgent: ${response}`);

    // Create response with rate limit headers
    const responseData = {
      message: assistantMessage,
      emotions: EmotionalEngine.getVisibleEmotions(newState),
      relationLevel: EmotionalEngine.getRelationshipLevel(newState),
      state: {
        trust: newState.trust,
        affinity: newState.affinity,
        respect: newState.respect,
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
