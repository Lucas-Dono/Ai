import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { getConversionFunnel } from "@/lib/services/bond-analytics.service";

/**
 * GET /api/admin/bonds-analytics/funnel
 * Obtener conversion funnel del sistema de bonds
 * Solo accesible para admins
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get conversion funnel
    const funnel = await getConversionFunnel();

    return NextResponse.json(funnel);
  } catch (error: any) {
    console.error("[API] Error fetching conversion funnel:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
