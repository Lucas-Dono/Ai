import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logging/logger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getRetentionLeaderboard,
  getUserLeaderboardPosition,
} from "@/lib/gamification/retention-leaderboard";

/**
 * GET /api/leaderboard/retention
 * Obtener leaderboard de retention
 *
 * Query params:
 * - type: "global" | "weekly" | "monthly" (default: "global")
 * - limit: number (default: 50, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;

    const type = (searchParams.get("type") || "global") as "global" | "weekly" | "monthly";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    // Obtener leaderboard
    const leaderboard = await getRetentionLeaderboard({
      type,
      limit,
      userId: session?.user?.id,
    });

    // Si el usuario está autenticado, incluir su posición
    let userPosition = null;
    if (session?.user?.id) {
      userPosition = await getUserLeaderboardPosition(session.user.id);
    }

    return NextResponse.json({
      type,
      leaderboard,
      userPosition,
      total: leaderboard.length,
    });
  } catch (error) {
    log.error({ error }, "Error fetching retention leaderboard");
    return NextResponse.json(
      { error: "Error al obtener leaderboard" },
      { status: 500 }
    );
  }
}
