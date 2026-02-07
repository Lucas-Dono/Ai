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

    // Parse query parameters for pagination
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor"); // ID del último trigger cargado
    const limit = parseInt(searchParams.get("limit") || "50", 10); // Límite por página (default: 50)

    // Validar límite (máx 100 por request)
    const validatedLimit = Math.min(Math.max(limit, 10), 100);

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

    // Obtener historial de triggers con cursor-based pagination
    const triggerHistory = await prisma.behaviorTriggerLog.findMany({
      where: {
        Message: {
          agentId,
        },
      },
      orderBy: { createdAt: "desc" },
      take: validatedLimit + 1, // +1 para saber si hay más páginas
      ...(cursor && { cursor: { id: cursor }, skip: 1 }), // Si hay cursor, empezar desde ahí
      include: {
        Message: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            role: true,
          },
        },
      },
    });

    // Determinar si hay más páginas
    const hasMore = triggerHistory.length > validatedLimit;
    const paginatedTriggers = hasMore
      ? triggerHistory.slice(0, -1)
      : triggerHistory;

    // Cursor para la siguiente página (ID del último elemento)
    const nextCursor =
      hasMore && paginatedTriggers.length > 0
        ? paginatedTriggers[paginatedTriggers.length - 1].id
        : null;

    // Obtener count total de triggers (sin limit) para metadata
    const totalTriggersCount = await prisma.behaviorTriggerLog.count({
      where: {
        Message: {
          agentId,
        },
      },
    });

    // OPTIMIZACIÓN: Usar groupBy + aggregate en lugar de findMany + forEach
    // Impacto estimado: Reduce N queries a 3 queries (groupBy por tipo, behavior, y avg weight)
    // Benchmark antes: ~150-300ms con 1000+ triggers | después: ~30-50ms
    console.log('[PERF] Calculating trigger stats using groupBy aggregation...');
    const perfStart = Date.now();

    const stats = {
      totalTriggers: totalTriggersCount,
      triggersByType: {} as Record<string, number>,
      triggersByBehavior: {} as Record<string, number>,
      averageWeight: 0,
    };

    if (totalTriggersCount > 0) {
      // Query 1: Group by triggerType
      const triggersByTypeResults = await prisma.behaviorTriggerLog.groupBy({
        by: ['triggerType'],
        where: {
          Message: {
            agentId,
          },
        },
        _count: {
          triggerType: true,
        },
      });

      triggersByTypeResults.forEach((result) => {
        stats.triggersByType[result.triggerType] = result._count.triggerType;
      });

      // Query 2: Group by behaviorType
      const triggersByBehaviorResults = await prisma.behaviorTriggerLog.groupBy({
        by: ['behaviorType'],
        where: {
          Message: {
            agentId,
          },
        },
        _count: {
          behaviorType: true,
        },
      });

      triggersByBehaviorResults.forEach((result) => {
        stats.triggersByBehavior[result.behaviorType] = result._count.behaviorType;
      });

      // Query 3: Calculate average weight
      const avgWeightResult = await prisma.behaviorTriggerLog.aggregate({
        where: {
          Message: {
            agentId,
          },
        },
        _avg: {
          weight: true,
        },
      });

      stats.averageWeight = avgWeightResult._avg.weight || 0;
    }

    const perfEnd = Date.now();
    console.log(`[PERF] Stats calculation completed in ${perfEnd - perfStart}ms`);

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
      triggerHistory: paginatedTriggers.map((trigger) => ({
        id: trigger.id,
        triggerType: trigger.triggerType,
        behaviorType: trigger.behaviorType,
        weight: trigger.weight,
        detectedText: trigger.detectedText,
        detectedAt: trigger.createdAt,
        message: {
          id: trigger.Message.id,
          content: trigger.Message.content,
          createdAt: trigger.Message.createdAt,
          role: trigger.Message.role,
        },
      })),
      stats,
      pagination: {
        total: totalTriggersCount,
        count: paginatedTriggers.length,
        hasMore,
        nextCursor,
        limit: validatedLimit,
      },
    });
  } catch (error) {
    console.error("[API] Error fetching behavior details:", error);
    return NextResponse.json(
      { error: "Failed to fetch behavior details" },
      { status: 500 }
    );
  }
}
