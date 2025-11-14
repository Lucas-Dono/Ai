import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { markAllBondNotificationsAsRead } from "@/lib/services/bond-notifications.service";

/**
 * POST /api/bonds/notifications/mark-all-read
 * Marcar todas las notificaciones de bonds como leídas
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await markAllBondNotificationsAsRead(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API] Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
