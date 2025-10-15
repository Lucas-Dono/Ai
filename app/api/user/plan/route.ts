import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("[API /api/user/plan] GET request received");
    const session = await auth();

    console.log("[API /api/user/plan] Session:", {
      userId: session?.user?.id,
      userEmail: session?.user?.email,
    });

    if (!session?.user?.id) {
      console.log("[API /api/user/plan] No autorizado - sin sesión");
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Obtener el plan actualizado desde la base de datos
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, email: true },
    });

    console.log("[API /api/user/plan] Usuario encontrado:", {
      email: user?.email,
      plan: user?.plan,
    });

    if (!user) {
      console.log("[API /api/user/plan] Usuario no encontrado en BD");
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    console.log("[API /api/user/plan] Respondiendo con plan:", user.plan);
    return NextResponse.json({ plan: user.plan });
  } catch (error) {
    console.error("[API /api/user/plan] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener el plan del usuario" },
      { status: 500 }
    );
  }
}
