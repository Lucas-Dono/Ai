import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLLMProvider } from "@/lib/llm/provider";
import { EmotionalEngine } from "@/lib/relations/engine";
import { getVectorStore } from "@/lib/vector/store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const body = await req.json();
    const { content, userId = "default-user" } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Obtener agente
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Guardar mensaje del usuario
    const userMessage = await prisma.message.create({
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
      },
    });

    if (!relation) {
      relation = await prisma.relation.create({
        data: {
          subjectId: agentId,
          targetId: userId,
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

    // Guardar respuesta
    const assistantMessage = await prisma.message.create({
      data: {
        agentId,
        role: "assistant",
        content: response,
        metadata: {
          emotions: EmotionalEngine.getVisibleEmotions(newState),
          relationLevel: EmotionalEngine.getRelationshipLevel(newState),
        },
      },
    });

    // Guardar en memoria vectorial
    const vectorStore = getVectorStore();
    await vectorStore.addMemory(agentId, `User: ${content}\nAgent: ${response}`);

    return NextResponse.json({
      message: assistantMessage,
      emotions: EmotionalEngine.getVisibleEmotions(newState),
      relationLevel: EmotionalEngine.getRelationshipLevel(newState),
      state: {
        trust: newState.trust,
        affinity: newState.affinity,
        respect: newState.respect,
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
