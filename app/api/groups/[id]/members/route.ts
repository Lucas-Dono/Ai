import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { checkAddUserToGroupLimit } from "@/lib/redis/group-ratelimit";

/**
 * GET /api/groups/[id]/members
 * List all members of a group
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

    // 2. Obtener todos los miembros
    const members = await prisma.groupMember.findMany({
      where: {
        groupId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
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
        { role: "desc" }, // owner, moderator, member
        { joinedAt: "asc" },
      ],
    });

    return NextResponse.json({
      members,
      total: members.length,
    });
  } catch (error) {
    console.error("Error fetching group members:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups/[id]/members
 * Add a user to a group (requires canInviteMembers permission)
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

    // 1. Verificar permisos
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
        memberType: "user",
        isActive: true,
      },
    });

    if (!member || !member.canInviteMembers) {
      return NextResponse.json(
        { error: "No tienes permisos para invitar miembros" },
        { status: 403 }
      );
    }

    // 2. Verificar límite de usuarios por grupo
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
    const limitCheck = await checkAddUserToGroupLimit(groupId, creatorPlan);

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
    const { userId: newUserId } = body;

    if (!newUserId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 }
      );
    }

    // 4. Verificar que el usuario exista
    const newUser = await prisma.user.findUnique({
      where: { id: newUserId },
      select: { id: true, name: true, image: true },
    });

    if (!newUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // 5. Verificar que no sea ya miembro
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: newUserId,
        memberType: "user",
      },
    });

    if (existingMember) {
      if (existingMember.isActive) {
        return NextResponse.json(
          { error: "El usuario ya es miembro del grupo" },
          { status: 400 }
        );
      } else {
        // Reactivar membresía
        const reactivatedMember = await prisma.groupMember.update({
          where: { id: existingMember.id },
          data: {
            isActive: true,
            joinedAt: new Date(),
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        });

        return NextResponse.json({
          member: reactivatedMember,
          message: "Miembro reactivado exitosamente",
        });
      }
    }

    // 6. Crear nuevo miembro
    const newMember = await prisma.groupMember.create({
      data: {
        groupId,
        memberType: "user",
        userId: newUserId,
        role: "member",
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // 7. Actualizar total de miembros
    await prisma.group.update({
      where: { id: groupId },
      data: {
        totalMembers: { increment: 1 },
      },
    });

    // 8. Crear mensaje de sistema
    await prisma.groupMessage.create({
      data: {
        groupId,
        authorType: "user",
        content: `${newUser.name} se unió al grupo`,
        contentType: "system",
        isSystemMessage: true,
        turnNumber: (await prisma.groupMessage.count({ where: { groupId } })) + 1,
      },
    });

    return NextResponse.json(
      {
        member: newMember,
        message: "Miembro añadido exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding member to group:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
