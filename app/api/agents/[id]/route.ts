import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('[API GET] Obteniendo agente:', id);

    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        messagesAsAgent: {
          orderBy: { createdAt: "asc" }, // ASC = orden cronológico (más antiguos primero)
          take: 50,
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error("[API GET] Error fetching agent:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent" },
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
    console.log('[API DELETE] Eliminando agente:', id);

    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar que el agente pertenece al usuario
    const agent = await prisma.agent.findUnique({
      where: { id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (agent.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Eliminar el agente (esto también eliminará las relaciones por CASCADE)
    await prisma.agent.delete({
      where: { id },
    });

    console.log('[API DELETE] Agente eliminado exitosamente');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API DELETE] Error deleting agent:", error);
    return NextResponse.json(
      { error: "Failed to delete agent" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('[API PATCH] Actualizando agente:', id);

    // Verificar autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar que el agente pertenece al usuario
    const agent = await prisma.agent.findUnique({
      where: { id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (agent.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Obtener datos del body
    const body = await req.json();
    const { name, personality, purpose, tone, description } = body;

    console.log('[API PATCH] Datos a actualizar:', { name, personality, purpose, tone, description });

    // Actualizar el agente
    const updatedAgent = await prisma.agent.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(personality && { personality }),
        ...(purpose && { purpose }),
        ...(tone && { tone }),
        ...(description && { description }),
      },
    });

    console.log('[API PATCH] Agente actualizado exitosamente');

    return NextResponse.json(updatedAgent);
  } catch (error) {
    console.error("[API PATCH] Error updating agent:", error);
    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 }
    );
  }
}
