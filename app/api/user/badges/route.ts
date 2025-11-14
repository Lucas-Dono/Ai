import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logging/logger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkAndAwardBadges } from "@/lib/gamification/badge-system";

/**
 * GET /api/user/badges
 * Obtener badges del usuario actual
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener badges del usuario
    const badges = await prisma.bondBadge.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { earnedAt: "desc" },
      ],
    });

    // Obtener rewards
    const rewards = await prisma.userRewards.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      badges,
      rewards: rewards || {
        totalPoints: 0,
        availablePoints: 0,
        level: 1,
        xp: 0,
        xpToNext: 100,
        currentStreak: 0,
        longestStreak: 0,
      },
    });
  } catch (error) {
    log.error({ error }, "Error fetching badges");
    return NextResponse.json(
      { error: "Error al obtener badges" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/badges/check
 * Verificar y otorgar nuevos badges
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const awardedBadges = await checkAndAwardBadges(session.user.id);

    return NextResponse.json({
      success: true,
      newBadges: awardedBadges,
      count: awardedBadges.length,
    });
  } catch (error) {
    log.error({ error }, "Error checking badges");
    return NextResponse.json(
      { error: "Error al verificar badges" },
      { status: 500 }
    );
  }
}
