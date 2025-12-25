import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { checkFeature } from "@/lib/feature-flags";
import { Feature } from "@/lib/feature-flags/types";
import { getTierLimits } from "@/lib/usage/tier-limits";

/**
 * POST /api/groups
 * Create a new group
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const userPlan = user.plan || "free";

    // 1. Verificar feature access
    const featureCheck = await checkFeature(user.id, Feature.GROUPS);
    if (!featureCheck.hasAccess) {
      return NextResponse.json(
        {
          error: "Grupos solo disponibles en Free+",
          upgradeUrl: "/pricing",
        },
        { status: 403 }
      );
    }

    // 2. Verificar límite de grupos activos
    const groupCount = await prisma.group.count({
      where: {
        creatorId: user.id,
        status: "ACTIVE",
      },
    });

    const limits = getTierLimits(userPlan);
    if (groupCount >= limits.resources.activeGroups) {
      return NextResponse.json(
        {
          error: `Límite de ${limits.resources.activeGroups} grupos alcanzado`,
          current: groupCount,
          limit: limits.resources.activeGroups,
          upgradeUrl: "/pricing",
        },
        { status: 403 }
      );
    }

    // 3. Validar datos del request
    const body = await req.json();
    const { name, description, visibility = "private" } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "El nombre del grupo es requerido" },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "El nombre no puede exceder 100 caracteres" },
        { status: 400 }
      );
    }

    // 4. Crear grupo
    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        creatorId: user.id,
        visibility: ["private", "invite_only", "public"].includes(visibility)
          ? visibility
          : "private",
        status: "ACTIVE",
      },
    });

    // 5. Añadir creador como owner
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        memberType: "user",
        userId: user.id,
        role: "owner",
        canInviteMembers: true,
        canRemoveMembers: true,
        canManageAIs: true,
        canEditSettings: true,
        isActive: true,
      },
    });

    // 6. Crear estado de simulación inicial
    await prisma.groupSimulationState.create({
      data: {
        groupId: group.id,
        currentTurn: 0,
        totalMessages: 0,
        lastSpeakerId: null,
        lastSpeakerType: null,
        recentTopics: [],
        activeSpeakers: [],
        aiQueueOrder: [],
      },
    });

    // 7. Retornar grupo creado
    return NextResponse.json(
      {
        group,
        message: "Grupo creado exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/groups
 * List user's groups
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // 1. Obtener grupos del usuario
    const groups = await prisma.group.findMany({
      where: {
        status: "ACTIVE",
        members: {
          some: {
            userId: user.id,
            isActive: true,
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        members: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            agent: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
            members: true,
          },
        },
      },
      orderBy: { lastActivityAt: "desc" },
    });

    // 2. Calcular estadísticas y unread counts para cada grupo
    const groupsWithStats = await Promise.all(
      groups.map(async (group) => {
        // Encontrar el miembro actual
        const currentMember = group.members.find(
          (m) => m.userId === user.id && m.memberType === "user"
        );

        return {
          ...group,
          unreadCount: currentMember?.unreadCount || 0,
          lastSeenAt: currentMember?.lastSeenAt || null,
          role: currentMember?.role || "member",
          isMuted: currentMember?.isMuted || false,
        };
      })
    );

    return NextResponse.json({
      groups: groupsWithStats,
      total: groupsWithStats.length,
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
