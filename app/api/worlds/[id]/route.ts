import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const world = await prisma.world.findUnique({
      where: { id },
      include: {
        worldAgents: {
          include: {
            agent: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!world) {
      return NextResponse.json({ error: "World not found" }, { status: 404 });
    }

    return NextResponse.json(world);
  } catch (error) {
    console.error("Error fetching world:", error);
    return NextResponse.json(
      { error: "Failed to fetch world" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.world.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting world:", error);
    return NextResponse.json(
      { error: "Failed to delete world" },
      { status: 500 }
    );
  }
}
