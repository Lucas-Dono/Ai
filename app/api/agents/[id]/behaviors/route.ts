/**
 * API Endpoint: GET /api/agents/[id]/behaviors
 *
 * Obtiene información detallada de los behaviors de un agente:
 * - BehaviorProfiles activos
 * - Historial de triggers
 * - Historial de progresión de fases
 * - Estado actual de intensidades
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    // Verificar que el agente existe
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        name: true,
        userId: true,
        nsfwMode: true,
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    // Obtener todos los BehaviorProfiles del agente
    const behaviorProfiles = await prisma.behaviorProfile.findMany({
      where: { agentId },
      orderBy: { createdAt: "desc" },
    });

    // Obtener BehaviorProgressionState
    const progressionState = await prisma.behaviorProgressionState.findUnique({
      where: { agentId },
    });

    // Obtener historial de triggers (últimos 100)
    const triggerHistory = await prisma.behaviorTriggerLog.findMany({
      where: {
        message: {
          agentId,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        message: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            role: true,
          },
        },
      },
    });

    // Calcular estadísticas
    const stats = {
      totalTriggers: triggerHistory.length,
      triggersByType: {} as Record<string, number>,
      triggersByBehavior: {} as Record<string, number>,
      averageWeight: 0,
    };

    let totalWeight = 0;

    triggerHistory.forEach((trigger) => {
      // Count by type
      stats.triggersByType[trigger.triggerType] =
        (stats.triggersByType[trigger.triggerType] || 0) + 1;

      // Count by behavior (solo un behavior por trigger en schema actual)
      const behavior = trigger.behaviorType;
      stats.triggersByBehavior[behavior] =
        (stats.triggersByBehavior[behavior] || 0) + 1;

      totalWeight += trigger.weight;
    });

    if (triggerHistory.length > 0) {
      stats.averageWeight = totalWeight / triggerHistory.length;
    }

    // Formatear phase history de cada profile
    const profilesWithHistory = behaviorProfiles.map((profile) => {
      const phaseHistory = (profile.phaseHistory as any[]) || [];

      return {
        ...profile,
        phaseHistory: phaseHistory.map((entry: any) => ({
          phase: entry.phase,
          startedAt: entry.startedAt,
          endedAt: entry.endedAt || null,
          interactions: entry.interactions || 0,
          triggers: entry.triggers || [],
        })),
      };
    });

    return NextResponse.json({
      agent: {
        id: agent.id,
        name: agent.name,
        nsfwMode: agent.nsfwMode,
      },
      behaviorProfiles: profilesWithHistory,
      progressionState,
      triggerHistory: triggerHistory.map((trigger) => ({
        id: trigger.id,
        triggerType: trigger.triggerType,
        behaviorType: trigger.behaviorType,
        weight: trigger.weight,
        detectedText: trigger.detectedText,
        detectedAt: trigger.createdAt,
        message: {
          id: trigger.message.id,
          content: trigger.message.content,
          createdAt: trigger.message.createdAt,
          role: trigger.message.role,
        },
      })),
      stats,
    });
  } catch (error) {
    console.error("[API] Error fetching behavior details:", error);
    return NextResponse.json(
      { error: "Failed to fetch behavior details" },
      { status: 500 }
    );
  }
}
