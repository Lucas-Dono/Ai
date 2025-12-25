import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { checkAddAIToGroupLimit } from "@/lib/redis/group-ratelimit";

/**
 * POST /api/groups/[id]/agents
 * Add an AI agent to a group
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // 1. Verificar permisos (canManageAIs)
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
        memberType: "user",
        isActive: true,
      },
    });

    if (!member || !member.canManageAIs) {
      return NextResponse.json(
        { error: "No tienes permisos para gestionar IAs en este grupo" },
        { status: 403 }
      );
    }

    // 2. Verificar límite de IAs por grupo
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        creator: {
          select: { plan: true },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }

    const creatorPlan = group.creator.plan || "free";
    const limitCheck = await checkAddAIToGroupLimit(groupId, creatorPlan);

    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: limitCheck.reason,
          current: limitCheck.current,
          limit: limitCheck.limit,
          upgradeUrl: "/pricing",
        },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body = await req.json();
    const { agentId, importanceLevel = "secondary" } = body;

    if (!agentId) {
      return NextResponse.json(
        { error: "agentId es requerido" },
        { status: 400 }
      );
    }

    // 4. Verificar que el agente exista
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        name: true,
        avatar: true,
        creatorId: true,
        isPublic: true,
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agente no encontrado" },
        { status: 404 }
      );
    }

    // 5. Verificar permisos de acceso al agente
    // El agente debe ser del usuario o público
    if (agent.creatorId !== user.id && !agent.isPublic) {
      return NextResponse.json(
        { error: "No tienes acceso a este agente" },
        { status: 403 }
      );
    }

    // 6. Verificar que no esté ya en el grupo
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        agentId,
        memberType: "agent",
      },
    });

    if (existingMember) {
      if (existingMember.isActive) {
        return NextResponse.json(
          { error: "El agente ya está en el grupo" },
          { status: 400 }
        );
      } else {
        // Reactivar
        const reactivatedMember = await prisma.groupMember.update({
          where: { id: existingMember.id },
          data: {
            isActive: true,
            joinedAt: new Date(),
            importanceLevel,
          },
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        });

        return NextResponse.json({
          member: reactivatedMember,
          message: "Agente reactivado exitosamente",
        });
      }
    }

    // 7. Validar importanceLevel
    if (!["main", "secondary", "filler"].includes(importanceLevel)) {
      return NextResponse.json(
        { error: "importanceLevel inválido" },
        { status: 400 }
      );
    }

    // 8. Crear nuevo miembro (agente)
    const newMember = await prisma.groupMember.create({
      data: {
        groupId,
        memberType: "agent",
        agentId,
        role: "member",
        isActive: true,
        importanceLevel,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // 9. Actualizar total de miembros
    await prisma.group.update({
      where: { id: groupId },
      data: {
        totalMembers: { increment: 1 },
      },
    });

    // 10. Crear mensaje de sistema
    await prisma.groupMessage.create({
      data: {
        groupId,
        authorType: "user",
        content: `${agent.name} se unió al grupo`,
        contentType: "system",
        isSystemMessage: true,
        turnNumber: (await prisma.groupMessage.count({ where: { groupId } })) + 1,
      },
    });

    return NextResponse.json(
      {
        member: newMember,
        message: "Agente añadido exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding agent to group:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/groups/[id]/agents
 * List all AI agents in a group
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // 1. Verificar que el usuario sea miembro
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
        memberType: "user",
        isActive: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "No eres miembro de este grupo" },
        { status: 403 }
      );
    }

    // 2. Obtener todos los agentes del grupo
    const agents = await prisma.groupMember.findMany({
      where: {
        groupId,
        memberType: "agent",
        isActive: true,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            avatar: true,
            personalityCore: true,
          },
        },
      },
      orderBy: [
        { importanceLevel: "asc" }, // main, secondary, filler
        { joinedAt: "asc" },
      ],
    });

    return NextResponse.json({
      agents,
      total: agents.length,
    });
  } catch (error) {
    console.error("Error fetching group agents:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
