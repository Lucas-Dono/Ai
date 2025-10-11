import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, userId = "default-user", agentIds = [] } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Crear mundo
    const world = await prisma.world.create({
      data: {
        userId,
        name,
        description,
      },
    });

    // Añadir agentes al mundo
    if (agentIds.length > 0) {
      await prisma.worldAgent.createMany({
        data: agentIds.map((agentId: string) => ({
          worldId: world.id,
          agentId,
        })),
      });
    }

    return NextResponse.json(world, { status: 201 });
  } catch (error) {
    console.error("Error creating world:", error);
    return NextResponse.json(
      { error: "Failed to create world" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId") || "default-user";

    const worlds = await prisma.world.findMany({
      where: { userId },
      include: {
        worldAgents: {
          include: {
            agent: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(worlds);
  } catch (error) {
    console.error("Error fetching worlds:", error);
    return NextResponse.json(
      { error: "Failed to fetch worlds" },
      { status: 500 }
    );
  }
}
