import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-server";

/**
 * DELETE /api/agents/:id/conversation/reset
 *
 * Borra toda la conversación con un agente y resetea la relación al estado inicial.
 * Útil para testing y para empezar de cero.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    // Get authenticated user
    const user = await getAuthenticatedUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Verificar que el agente existe y pertenece al usuario
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (agent.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log(`[Reset] Borrando conversación para agente ${agentId} y usuario ${userId}`);

    // Ejecutar operaciones en paralelo
    const [deletedMessages, resetRelation] = await Promise.all([
      // 1. Borrar solo los mensajes de este usuario con el agente
      prisma.message.deleteMany({
        where: {
          agentId,
          userId, // Important: Only delete this user's messages
        },
      }),

      // 2. Resetear o borrar la relación
      prisma.relation.deleteMany({
        where: {
          subjectId: agentId,
          targetId: userId,
          targetType: "user",
        },
      }),
    ]);

    // Note: We DON'T reset InternalState because it's shared across all users
    // and represents the agent's global emotional state

    console.log(`[Reset] Resultados:`);
    console.log(`  - Mensajes borrados: ${deletedMessages.count}`);
    console.log(`  - Relaciones borradas: ${resetRelation.count}`);

    return NextResponse.json({
      success: true,
      deleted: {
        messages: deletedMessages.count,
        relations: resetRelation.count,
      },
      message: "Conversación reseteada exitosamente",
    });

  } catch (error) {
    console.error("[Reset] Error:", error);
    return NextResponse.json(
      { error: "Failed to reset conversation" },
      { status: 500 }
    );
  }
}
