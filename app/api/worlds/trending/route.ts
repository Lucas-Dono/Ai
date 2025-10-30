import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/worlds/trending - Obtener mundos trending (top 10)
export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");

    // Calcular un score compuesto para el ranking
    // Formula: (viewCount * 0.4) + (interactionCount * 0.3) + (rating * 20 * 0.2) + (recencyBonus * 0.1)
    const worlds = await prisma.world.findMany({
      where: {
        isPredefined: true,
        visibility: "public",
      },
      include: {
        _count: {
          select: {
            interactions: true,
            worldAgents: true,
          },
        },
      },
      orderBy: [
        { viewCount: "desc" },
        { createdAt: "desc" },
      ],
    });

    // Calcular score para cada mundo
    const worldsWithScore = worlds.map((world) => {
      const viewScore = world.viewCount * 0.4;
      const interactionScore = world._count.interactions * 0.3;
      const ratingScore = (world.rating || 0) * 20 * 0.2;

      // Bonus de recencia (mundos vistos recientemente)
      let recencyBonus = 0;
      if (world.lastViewedAt) {
        const daysSinceView = Math.floor(
          (Date.now() - new Date(world.lastViewedAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        recencyBonus = Math.max(0, 10 - daysSinceView) * 0.1; // Máximo 1 punto, decae con días
      }

      const totalScore = viewScore + interactionScore + ratingScore + recencyBonus;

      return {
        ...world,
        trendingScore: totalScore,
        metrics: {
          viewCount: world.viewCount,
          interactionCount: world._count.interactions,
          agentCount: world._count.worldAgents,
          rating: world.rating,
          totalTimeSpent: world.totalTimeSpent,
        },
      };
    });

    // Ordenar por score y tomar top N
    const trending = worldsWithScore
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit);

    return NextResponse.json({
      trending,
      total: trending.length,
    });
  } catch (error) {
    console.error("Error fetching trending worlds:", error);
    return NextResponse.json(
      { error: "Error al obtener mundos trending" },
      { status: 500 }
    );
  }
}
