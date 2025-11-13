import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/agents/[id]/rating - Obtener rating de un agente
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    // Obtener agente con reviews
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        name: true,
        rating: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agente no encontrado" },
        { status: 404 }
      );
    }

    const totalReviews = agent.reviews.length;
    const averageRating = agent.rating || 0;

    // Calcular distribución de ratings
    const ratingDistribution = {
      5: agent.reviews.filter((r) => r.rating === 5).length,
      4: agent.reviews.filter((r) => r.rating === 4).length,
      3: agent.reviews.filter((r) => r.rating === 3).length,
      2: agent.reviews.filter((r) => r.rating === 2).length,
      1: agent.reviews.filter((r) => r.rating === 1).length,
    };

    return NextResponse.json({
      agentId: agent.id,
      agentName: agent.name,
      averageRating: Number(averageRating.toFixed(2)),
      totalReviews,
      ratingDistribution,
    });
  } catch (error) {
    console.error("Error fetching rating:", error);
    return NextResponse.json(
      { error: "Error al obtener rating" },
      { status: 500 }
    );
  }
}
