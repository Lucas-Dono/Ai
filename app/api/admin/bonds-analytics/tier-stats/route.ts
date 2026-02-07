import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { getTierStats } from "@/lib/services/bond-analytics.service";

/**
 * GET /api/admin/bonds-analytics/tier-stats
 * Obtener estadísticas por tier del sistema de bonds
 * Solo accesible para admins
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get tier stats
    const stats = await getTierStats();

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("[API] Error fetching tier stats:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
