import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserUsageStats } from "@/lib/billing/usage-stats";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getUserUsageStats(session.user.id);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching usage stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage stats" },
      { status: 500 }
    );
  }
}
