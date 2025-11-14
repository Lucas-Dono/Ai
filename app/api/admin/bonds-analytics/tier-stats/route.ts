import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTierStats } from "@/lib/services/bond-analytics.service";

/**
 * GET /api/admin/bonds-analytics/tier-stats
 * Obtener estadísticas por tier del sistema de bonds
 * Solo accesible para admins
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
