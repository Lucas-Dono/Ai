import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLLMProvider } from "@/lib/llm/provider";
import { EmotionalEngine } from "@/lib/relations/engine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: worldId } = await params;
    const body = await req.json();
    const { content, userId = "default-user" } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Obtener mundo y sus agentes
    const world = await prisma.world.findUnique({
      where: { id: worldId },
      include: {
        worldAgents: {
          include: {
            agent: true,
          },
        },
      },
    });

    if (!world) {
      return NextResponse.json({ error: "World not found" }, { status: 404 });
    }

    // Guardar mensaje del usuario
    await prisma.message.create({
      data: {
        worldId,
        userId,
        role: "user",
        content,
      },
    });

    // Generar respuestas de cada agente
    const llm = getLLMProvider();
    const responses = [];

    for (const wa of world.worldAgents) {
      const agent = wa.agent;

      // Obtener mensajes recientes del mundo
      const recentMessages = await prisma.message.findMany({
        where: { worldId },
        orderBy: { createdAt: "desc" },
        take: 15,
      });

      // Obtener relación del agente con el usuario
      let relation = await prisma.relation.findFirst({
        where: {
          subjectId: agent.id,
          targetId: userId,
        },
      });

      if (!relation) {
        relation = await prisma.relation.create({
          data: {
            subjectId: agent.id,
            targetId: userId,
            trust: 0.5,
            affinity: 0.5,
            respect: 0.5,
            privateState: { love: 0, curiosity: 0 },
            visibleState: { trust: 0.5, affinity: 0.5, respect: 0.5 },
          },
        });
      }

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

      // Analizar y actualizar emociones
      const newState = EmotionalEngine.analyzeMessage(content, currentState);

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

      // Ajustar prompt
      const adjustedPrompt = EmotionalEngine.adjustPromptForEmotion(
        agent.systemPrompt,
        newState
      );

      // Generar respuesta
      const response = await llm.generate({
        systemPrompt: `${adjustedPrompt}\n\nEstás en un mundo grupal llamado "${world.name}". Otros agentes están presentes. Responde considerando el contexto grupal.`,
        messages: recentMessages.reverse().map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      });

      // Guardar respuesta del agente
      const agentMessage = await prisma.message.create({
        data: {
          worldId,
          agentId: agent.id,
          role: "assistant",
          content: response,
          metadata: {
            agentName: agent.name,
            emotions: EmotionalEngine.getVisibleEmotions(newState),
          },
        },
      });

      responses.push({
        agentId: agent.id,
        agentName: agent.name,
        message: agentMessage,
        emotions: EmotionalEngine.getVisibleEmotions(newState),
      });
    }

    return NextResponse.json({ responses });
  } catch (error) {
    console.error("Error sending message to world:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
