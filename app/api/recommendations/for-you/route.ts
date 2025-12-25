import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/middleware/auth-helper";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/recommendations/for-you
 *
 * Retorna recomendaciones personalizadas basadas en el historial de interacciones del usuario.
 *
 * Lógica:
 * 1. Si el usuario tiene suficientes interacciones (>= 5 mensajes o >= 2 agentes):
 *    - Analiza los agentes con los que más interactúa
 *    - Extrae los tags de esos agentes
 *    - Recomienda agentes similares
 *
 * 2. Si el usuario es nuevo (sin suficientes datos):
 *    - Usa fallback con tags predefinidos (nsfw, romantic, emotional, creative)
 *    - El usuario nunca sabrá que no está personalizado
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Obtener interacciones del usuario con agentes
    const interactions = await prisma.userInteraction.findMany({
      where: {
        userId,
        itemType: "agent",
        interactionType: {
          in: ["message", "chat"],
        },
      },
      select: {
        itemId: true,
        messageCount: true,
        duration: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 2. Agrupar y sumar mensajes por agente
    const agentStats = new Map<string, { messageCount: number; duration: number }>();

    for (const interaction of interactions) {
      const agentId = interaction.itemId;
      const existing = agentStats.get(agentId) || { messageCount: 0, duration: 0 };

      agentStats.set(agentId, {
        messageCount: existing.messageCount + (interaction.messageCount || 0),
        duration: existing.duration + (interaction.duration || 0),
      });
    }

    // Convertir a array y ordenar por mensajes
    const sortedAgents = Array.from(agentStats.entries())
      .map(([agentId, stats]) => ({ agentId, ...stats }))
      .sort((a, b) => b.messageCount - a.messageCount);

    // 3. Determinar si tenemos suficientes datos
    const totalMessages = sortedAgents.reduce((sum, a) => sum + a.messageCount, 0);
    const uniqueAgents = sortedAgents.length;
    const hasSufficientData = totalMessages >= 5 || uniqueAgents >= 2;

    let recommendedAgents;

    if (hasSufficientData) {
      // 4A. Usuario con datos: Recomendaciones personalizadas

      // Obtener top 3 agentes más interactuados
      const topAgentIds = sortedAgents.slice(0, 3).map(a => a.agentId);

      // Obtener esos agentes con sus tags
      const topAgents = await prisma.agent.findMany({
        where: {
          id: { in: topAgentIds },
        },
        select: {
          id: true,
          tags: true,
        },
      });

      // Extraer todos los tags únicos de los agentes favoritos
      const preferredTags = new Set<string>();
      for (const agent of topAgents) {
        if (Array.isArray(agent.tags)) {
          agent.tags.forEach(tag => preferredTags.add(tag.toLowerCase()));
        }
      }

      // Buscar agentes similares basados en tags
      const allFeaturedAgents = await prisma.agent.findMany({
        where: {
          userId: null, // Solo agentes públicos
          featured: true,
          id: { notIn: topAgentIds }, // Excluir agentes con los que ya interactúa
        },
        select: {
          id: true,
          name: true,
          description: true,
          avatar: true,
          tags: true,
          featured: true,
          cloneCount: true,
        },
      });

      // Calcular score de similaridad para cada agente
      const agentsWithScore = allFeaturedAgents.map(agent => {
        let score = 0;

        if (Array.isArray(agent.tags)) {
          for (const tag of agent.tags) {
            if (preferredTags.has(tag.toLowerCase())) {
              score++;
            }
          }
        }

        return { agent, score };
      });

      // Ordenar por score y tomar top 4
      recommendedAgents = agentsWithScore
        .filter(a => a.score > 0) // Solo agentes con al menos 1 tag en común
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map(a => a.agent);

      // Si no hay suficientes recomendaciones personalizadas, completar con fallback
      if (recommendedAgents.length < 4) {
        const fallbackTags = ['nsfw', 'romantic', 'emotional', 'creative'];
        const fallbackAgents = await prisma.agent.findMany({
          where: {
            userId: null,
            featured: true,
            id: {
              notIn: [
                ...topAgentIds,
                ...recommendedAgents.map(a => a.id)
              ]
            },
            tags: {
              hasSome: fallbackTags,
            },
          },
          take: 4 - recommendedAgents.length,
          orderBy: {
            cloneCount: 'desc',
          },
        });

        recommendedAgents = [...recommendedAgents, ...fallbackAgents];
      }

    } else {
      // 4B. Usuario nuevo: Fallback con tags predefinidos
      const fallbackTags = ['nsfw', 'romantic', 'emotional', 'creative'];

      recommendedAgents = await prisma.agent.findMany({
        where: {
          userId: null,
          featured: true,
          tags: {
            hasSome: fallbackTags,
          },
        },
        take: 4,
        orderBy: {
          cloneCount: 'desc',
        },
      });
    }

    // 5. Retornar recomendaciones
    return NextResponse.json({
      recommendations: recommendedAgents,
      personalized: hasSufficientData,
      stats: hasSufficientData ? {
        totalMessages,
        uniqueAgents,
        topAgents: sortedAgents.slice(0, 3).map(a => a.agentId),
      } : null,
    });

  } catch (error) {
    console.error("[ForYou] Error generating recommendations:", error);
    return NextResponse.json(
      { error: "Error generating recommendations" },
      { status: 500 }
    );
  }
}
