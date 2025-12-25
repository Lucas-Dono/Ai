/**
 * EMOTIONAL CHAT API ENDPOINT
 *
 * Endpoint principal para chat con sistema emocional avanzado
 * POST /api/chat/emotional
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { getEmotionalSystemOrchestrator } from "@/lib/emotional-system/orchestrator";

export async function POST(req: NextRequest) {
  console.log("[API /api/chat/emotional] POST request received");

  try {
    // 1. Autenticación
    const user = await getAuthenticatedUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // 2. Parse body
    const body = await req.json();
    const { agentId, message } = body;

    if (!agentId || !message) {
      return NextResponse.json(
        { error: "agentId y message son requeridos" },
        { status: 400 }
      );
    }

    console.log(`[API] Processing emotional chat for agent ${agentId}...`);
    console.log(`[API] User message: "${message}"`);

    // 3. Verificar que el usuario es dueño del agente
    const { prisma } = await import("@/lib/prisma");
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { userId: true, name: true },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agente no encontrado" }, { status: 404 });
    }

    if (agent.userId !== user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para chatear con este agente" },
        { status: 403 }
      );
    }

    // 4. Procesar mensaje con sistema emocional
    const orchestrator = getEmotionalSystemOrchestrator();
    const response = await orchestrator.processMessage({
      agentId,
      userMessage: message,
      userId: user.id,
    });

    console.log(`[API] ✅ Response generated successfully`);

    // 5. Retornar respuesta
    return NextResponse.json({
      success: true,
      response: response.responseText,
      metadata: {
        processingTime: response.metadata.processingTimeMs,
        emotionsTriggered: response.metadata.emotionsTriggered,
        goalsActivated: response.metadata.goalsActivated,
      },
    });
  } catch (error: any) {
    console.error("[API /api/chat/emotional] Error:", error);

    return NextResponse.json(
      {
        error: "Error procesando mensaje",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Obtener estado emocional actual del agente (debug)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const agentId = req.nextUrl.searchParams.get("agentId");
    if (!agentId) {
      return NextResponse.json({ error: "agentId requerido" }, { status: 400 });
    }

    // Verificar ownership
    const { prisma } = await import("@/lib/prisma");
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        personalityCore: true,
        internalState: true,
        characterGrowth: true,
        semanticMemory: true,
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agente no encontrado" }, { status: 404 });
    }

    if (agent.userId !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Retornar estado emocional
    return NextResponse.json({
      success: true,
      emotionalState: {
        personality: {
          bigFive: {
            openness: agent.personalityCore?.openness,
            conscientiousness: agent.personalityCore?.conscientiousness,
            extraversion: agent.personalityCore?.extraversion,
            agreeableness: agent.personalityCore?.agreeableness,
            neuroticism: agent.personalityCore?.neuroticism,
          },
          coreValues: agent.personalityCore?.coreValues,
        },
        currentState: {
          emotions: agent.internalState?.currentEmotions,
          mood: {
            valence: agent.internalState?.moodValence,
            arousal: agent.internalState?.moodArousal,
            dominance: agent.internalState?.moodDominance,
          },
          needs: {
            connection: agent.internalState?.needConnection,
            autonomy: agent.internalState?.needAutonomy,
            competence: agent.internalState?.needCompetence,
            novelty: agent.internalState?.needNovelty,
          },
        },
        growth: {
          trustLevel: agent.characterGrowth?.trustLevel,
          intimacyLevel: agent.characterGrowth?.intimacyLevel,
          relationshipStage: agent.semanticMemory?.relationshipStage,
          conversationCount: agent.characterGrowth?.conversationCount,
        },
      },
    });
  } catch (error: any) {
    console.error("[API GET /api/chat/emotional] Error:", error);
    return NextResponse.json(
      { error: "Error obteniendo estado", details: error.message },
      { status: 500 }
    );
  }
}
