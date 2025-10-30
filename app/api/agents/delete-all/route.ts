import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/agents/delete-all - Delete all user agents
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all agents from the user
    // This will cascade delete messages, memories, behaviors, etc.
    const result = await prisma.agent.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `${result.count} agentes eliminados exitosamente`,
    });
  } catch (error) {
    console.error("Error deleting agents:", error);
    return NextResponse.json(
      { error: "Error al eliminar los agentes" },
      { status: 500 }
    );
  }
}
