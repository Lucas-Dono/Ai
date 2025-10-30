import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVeniceClient } from "@/lib/emotional-system/llm/venice";
import { EmotionalEngine } from "@/lib/relations/engine";

// Aumentar timeout a 60 segundos para generación de respuestas
export const maxDuration = 60;

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

    // Obtener el último turnNumber para incrementar
    const lastInteraction = await prisma.worldInteraction.findFirst({
      where: { worldId },
      orderBy: { turnNumber: 'desc' },
      select: { turnNumber: true },
    });

    const nextTurnNumber = (lastInteraction?.turnNumber || 0) + 1;

    console.log(`[World Message] Usuario envió mensaje, turno #${nextTurnNumber}`);

    // Para visual novel: solo generar respuesta del siguiente personaje en el turno
    // No todos los personajes responden a cada mensaje
    const venice = getVeniceClient();

    // Obtener la última interacción para determinar quién responde
    // (todas las interacciones deberían tener speakerId en un visual novel)
    const lastAgentInteraction = await prisma.worldInteraction.findFirst({
      where: { worldId },
      orderBy: { turnNumber: "desc" },
      include: { speaker: true }
    });

    // Determinar qué agente debería responder
    // Si es el primer mensaje, usar el primer agente del mundo
    // Si no, rotar al siguiente agente
    let respondingAgent = world.worldAgents[0]?.agent;

    if (lastAgentInteraction?.speaker) {
      const currentIndex = world.worldAgents.findIndex(
        wa => wa.agent.id === lastAgentInteraction.speaker.id
      );
      const nextIndex = (currentIndex + 1) % world.worldAgents.length;
      respondingAgent = world.worldAgents[nextIndex]?.agent;
    }

    if (!respondingAgent) {
      throw new Error("No hay agentes en este mundo");
    }

    // Obtener interacciones recientes del mundo para contexto
    const recentInteractions = await prisma.worldInteraction.findMany({
      where: { worldId },
      orderBy: { createdAt: "desc" },
      take: 10, // Menos que antes para no sobrecargar
    });

    // Construir historial de mensajes incluyendo el mensaje actual del usuario
    const messageHistory = [
      ...recentInteractions.reverse().map((i) => ({
        role: "assistant" as const,
        content: i.content,
      })),
      {
        role: "user" as const,
        content,
      }
    ];

    // Obtener relación del agente con el usuario
    let relation = await prisma.relation.findFirst({
      where: {
        subjectId: respondingAgent.id,
        targetId: userId,
      },
    });

    if (!relation) {
      relation = await prisma.relation.create({
        data: {
          subjectId: respondingAgent.id,
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
      respondingAgent.systemPrompt,
      newState
    );

    // Generar UNA sola respuesta con Venice (sin censura)
    console.log(`[World Message] Generando respuesta de ${respondingAgent.name}...`);
    console.log(`[World Message] Mensajes en historial: ${messageHistory.length}`);

    let response: string;
    try {
      response = await venice.generateWithMessages({
        systemPrompt: `${adjustedPrompt}\n\nEstás en un mundo grupal llamado "${world.name}". Otros agentes están presentes. Responde considerando el contexto grupal.`,
        messages: messageHistory,
        temperature: 0.9,
        maxTokens: 800,
      });

      console.log(`[World Message] Respuesta recibida de ${respondingAgent.name}: ${response.substring(0, 100)}...`);
    } catch (error) {
      console.error(`[World Message] Error generando respuesta de ${respondingAgent.name}:`, error);
      throw error;
    }

    // Guardar respuesta del agente como WorldInteraction
    const agentInteraction = await prisma.worldInteraction.create({
      data: {
        worldId,
        speakerId: respondingAgent.id,
        content: response,
        interactionType: 'dialogue',
        turnNumber: nextTurnNumber,
        speakerEmotion: EmotionalEngine.getVisibleEmotions(newState),
        metadata: {
          agentName: respondingAgent.name,
          userMessage: content, // Guardar el mensaje del usuario para contexto
        },
      },
    });

    console.log(`[World Message] Interacción guardada: Turn #${nextTurnNumber}`);

    // Retornar en el formato que espera el frontend
    return NextResponse.json({
      success: true,
      responses: [{
        message: {
          id: agentInteraction.id,
          role: 'assistant',
          content: response,
          agentId: respondingAgent.id,
          metadata: {
            agentName: respondingAgent.name,
            emotions: EmotionalEngine.getVisibleEmotions(newState),
          }
        }
      }]
    });
  } catch (error) {
    console.error("Error sending message to world:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
