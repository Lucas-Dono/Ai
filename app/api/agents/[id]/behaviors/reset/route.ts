/**
 * API Endpoint: POST /api/agents/[id]/behaviors/reset
 *
 * Resetea todos los behaviors de un agente a su estado inicial.
 * - Elimina todos los BehaviorProfiles
 * - Elimina todos los BehaviorTriggerLogs
 * - Resetea BehaviorProgressionState
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: agentId } = params;

    // Verificar que el agente existe
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { id: true, name: true },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    // Eliminar todos los datos de behaviors en una transacción
    await prisma.$transaction(async (tx) => {
      // 1. Eliminar BehaviorProfiles (esto eliminará triggers por CASCADE)
      await tx.behaviorProfile.deleteMany({
        where: { agentId },
      });

      // 2. Eliminar o resetear BehaviorProgressionState
      const progressionState = await tx.behaviorProgressionState.findUnique({
        where: { agentId },
      });

      if (progressionState) {
        await tx.behaviorProgressionState.update({
          where: { agentId },
          data: {
            totalInteractions: 0,
            positiveInteractions: 0,
            negativeInteractions: 0,
            currentIntensities: {},
            lastCalculatedAt: new Date(),
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `Behaviors reseteados para ${agent.name}`,
      agentId: agent.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API] Error resetting behaviors:", error);
    return NextResponse.json(
      {
        error: "Failed to reset behaviors",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
