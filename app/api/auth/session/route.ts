import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * GET /api/auth/session
 * Returns the current user session
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        plan: (session.user as any).plan || 'free',
      },
    });
  } catch (error) {
    console.error("[Auth Session] Error getting session:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

// Force Node.js runtime
export const runtime = 'nodejs';
