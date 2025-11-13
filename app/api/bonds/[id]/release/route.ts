/**
 * POST /api/bonds/[id]/release
 *
 * Libera voluntariamente un bond
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { releaseBond } from "@/lib/services/symbolic-bonds.service";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Verificar que el bond pertenece al usuario
    const bond = await prisma.symbolicBond.findUnique({
      where: { id: params.id },
    });

    if (!bond) {
      return NextResponse.json(
        { error: "Bond no encontrado" },
        { status: 404 }
      );
    }

    if (bond.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const result = await releaseBond(params.id, "voluntary");

    return NextResponse.json({
      success: true,
      message: "Bond liberado exitosamente. Tu legado permanece.",
      legacyBadge: result.legacyBadge,
    });
  } catch (error: any) {
    console.error("Error releasing bond:", error);
    return NextResponse.json(
      { error: error.message || "Error al liberar bond" },
      { status: 500 }
    );
  }
}
