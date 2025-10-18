import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
    const session = await auth();
    if (!session?.user?.id) {
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
    const [deletedMessages, resetRelation, resetInternalState] = await Promise.all([
      // 1. Borrar todos los mensajes del agente (tanto del usuario como del agente)
      prisma.message.deleteMany({
        where: {
          agentId,
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

      // 3. Resetear el estado emocional interno
      prisma.internalState.deleteMany({
        where: {
          agentId,
        },
      }),
    ]);

    console.log(`[Reset] Resultados:`);
    console.log(`  - Mensajes borrados: ${deletedMessages.count}`);
    console.log(`  - Relaciones borradas: ${resetRelation.count}`);
    console.log(`  - Estados internos borrados: ${resetInternalState.count}`);

    return NextResponse.json({
      success: true,
      deleted: {
        messages: deletedMessages.count,
        relations: resetRelation.count,
        internalStates: resetInternalState.count,
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
