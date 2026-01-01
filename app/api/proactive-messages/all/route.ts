import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/proactive-messages/all
 *
 * Endpoint optimizado que devuelve todos los mensajes proactivos del usuario
 * en una sola llamada, evitando múltiples queries por cada agente.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Query optimizada: obtiene todos los mensajes proactivos pendientes
    // del usuario en una sola llamada con JOIN
    const messages = await prisma.proactiveMessage.findMany({
      where: {
        agent: {
          userId: session.user.id,
        },
        delivered: false,
        OR: [
          { deliveredAt: null },
          {
            deliveredAt: {
              lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Más de 24h
            }
          }
        ]
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20, // Límite razonable
    });

    // Mapear a formato esperado por el frontend
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      agentId: msg.agent.id,
      agentName: msg.agent.name,
      agentAvatar: msg.agent.avatar,
      content: msg.content,
      triggerType: msg.triggerType,
      createdAt: msg.createdAt.toISOString(),
    }));

    return NextResponse.json({
      messages: formattedMessages,
      count: formattedMessages.length
    });

  } catch (error) {
    console.error("[API] Error fetching proactive messages:", error);
    return NextResponse.json(
      { error: "Error al obtener mensajes proactivos" },
      { status: 500 }
    );
  }
}
