/**
 * API Endpoint: GET /api/agents/[id]/behaviors/intensity-history
 *
 * Obtiene datos históricos de intensidad de behaviors para gráficas.
 * Calcula intensidad basándose en triggers detectados a lo largo del tiempo.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: agentId } = params;

    // Verificar que el agente existe
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { id: true },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    // Obtener BehaviorProfiles para saber qué behaviors están activos
    const behaviorProfiles = await prisma.behaviorProfile.findMany({
      where: { agentId },
      select: {
        id: true,
        behaviorType: true,
        baseIntensity: true,
        currentPhase: true,
        createdAt: true,
      },
    });

    if (behaviorProfiles.length === 0) {
      return NextResponse.json({
        data: [],
        behaviors: [],
      });
    }

    // Obtener todos los triggers ordenados por fecha
    const allTriggers = await prisma.behaviorTriggerLog.findMany({
      where: {
        message: { agentId },
        behaviorType: {
          in: behaviorProfiles.map((p) => p.behaviorType),
        },
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        behaviorType: true,
        triggerType: true,
        weight: true,
        createdAt: true,
      },
    });

    // Agrupar por behavior y calcular intensidad acumulativa
    const behaviorData: Record<
      string,
      Array<{ timestamp: string; intensity: number; phase: number }>
    > = {};

    behaviorProfiles.forEach((profile) => {
      const behaviorType = profile.behaviorType;
      behaviorData[behaviorType] = [];

      // Punto inicial: creación del behavior
      behaviorData[behaviorType].push({
        timestamp: profile.createdAt.toISOString(),
        intensity: profile.baseIntensity,
        phase: 1,
      });

      // Calcular intensidad acumulativa basada en triggers
      let currentIntensity = profile.baseIntensity;
      const triggersForBehavior = allTriggers.filter(
        (t) => t.behaviorType === behaviorType
      );

      triggersForBehavior.forEach((trigger) => {
        // Aumentar intensidad basándose en peso del trigger
        // Peso positivo aumenta, peso negativo (reassurance) disminuye
        const intensityChange = trigger.weight * 0.1; // Factor de escalado
        currentIntensity = Math.max(
          0,
          Math.min(1, currentIntensity + intensityChange)
        );

        // Determinar fase basándose en intensidad
        // Simplificación: 0-0.2 = fase 1, 0.2-0.4 = fase 2, etc.
        const phase = Math.min(8, Math.floor(currentIntensity * 10) + 1);

        behaviorData[behaviorType].push({
          timestamp: trigger.createdAt.toISOString(),
          intensity: currentIntensity,
          phase,
        });
      });

      // Punto actual: última intensidad
      if (triggersForBehavior.length > 0) {
        behaviorData[behaviorType].push({
          timestamp: new Date().toISOString(),
          intensity: currentIntensity,
          phase: profile.currentPhase,
        });
      }
    });

    // Formatear para respuesta
    const formattedData = Object.entries(behaviorData).map(
      ([behaviorType, dataPoints]) => ({
        behaviorType,
        data: dataPoints,
        currentIntensity:
          dataPoints.length > 0
            ? dataPoints[dataPoints.length - 1].intensity
            : 0,
        totalDataPoints: dataPoints.length,
      })
    );

    return NextResponse.json({
      data: formattedData,
      behaviors: behaviorProfiles.map((p) => ({
        type: p.behaviorType,
        baseIntensity: p.baseIntensity,
        currentPhase: p.currentPhase,
      })),
      metadata: {
        totalTriggers: allTriggers.length,
        dateRange: {
          start:
            allTriggers.length > 0
              ? allTriggers[0].createdAt.toISOString()
              : new Date().toISOString(),
          end: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("[API] Error fetching intensity history:", error);
    return NextResponse.json(
      { error: "Failed to fetch intensity history" },
      { status: 500 }
    );
  }
}
