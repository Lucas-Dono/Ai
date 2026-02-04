import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // CRITICAL: Better-auth no incluye campos custom como 'plan'
    // Necesitamos consultar Prisma para obtener el plan real del usuario
    const userWithPlan = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true }
    });

    const userPlan = userWithPlan?.plan || 'free';

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        plan: userPlan,
        createdAt: session.user.createdAt,
      },
    });
  } catch (error) {
    console.error("[Auth Session] Error getting session:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

// Force Node.js runtime
export const runtime = 'nodejs';
