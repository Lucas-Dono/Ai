import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/worlds/[id]/track-view - Trackear visita a un mundo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: worldId } = await params;
    const body = await request.json();
    const { timeSpent } = body; // Tiempo en segundos (opcional)

    // Incrementar viewCount y actualizar lastViewedAt
    const world = await prisma.world.update({
      where: { id: worldId },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
        ...(timeSpent && { totalTimeSpent: { increment: timeSpent } }),
      },
      select: {
        id: true,
        name: true,
        viewCount: true,
        totalTimeSpent: true,
      },
    });

    return NextResponse.json({
      success: true,
      world,
    });
  } catch (error) {
    console.error("Error tracking world view:", error);
    return NextResponse.json(
      { error: "Error al trackear visita" },
      { status: 500 }
    );
  }
}
