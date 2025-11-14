import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const NSFW_CONSENT_VERSION = "v1.0";

/**
 * POST /api/user/nsfw-consent
 * Guardar consentimiento NSFW del usuario
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No autenticado" },
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        isAdult: true,
        nsfwConsent: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // CRITICAL: Verificar que el usuario es adulto (18+)
    if (!user.isAdult) {
      console.log(
        `[NSFW CONSENT] Intento de menor de edad: ${session.user.email}`
      );
      return NextResponse.json(
        {
          error:
            "Debes tener 18 años o más para acceder a contenido NSFW. Esta acción ha sido registrada.",
        },
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Si ya tiene consentimiento, retornar
    if (user.nsfwConsent) {
      return NextResponse.json(
        {
          success: true,
          message: "Ya tienes consentimiento NSFW activo",
          nsfwConsent: true,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Guardar consentimiento
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        nsfwConsent: true,
        nsfwConsentAt: new Date(),
        nsfwConsentVersion: NSFW_CONSENT_VERSION,
      },
      select: {
        id: true,
        nsfwConsent: true,
        nsfwConsentAt: true,
        nsfwConsentVersion: true,
      },
    });

    console.log(
      `[NSFW CONSENT] Consentimiento otorgado: ${session.user.email} (${NSFW_CONSENT_VERSION})`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Consentimiento NSFW guardado exitosamente",
        nsfwConsent: updatedUser.nsfwConsent,
        nsfwConsentAt: updatedUser.nsfwConsentAt,
        nsfwConsentVersion: updatedUser.nsfwConsentVersion,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[NSFW CONSENT] Error:", error);
    return NextResponse.json(
      {
        error: "Error al guardar consentimiento",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * DELETE /api/user/nsfw-consent
 * Revocar consentimiento NSFW del usuario
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No autenticado" },
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        nsfwConsent: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Revocar consentimiento
    await prisma.user.update({
      where: { id: user.id },
      data: {
        nsfwConsent: false,
        nsfwConsentAt: null,
        nsfwConsentVersion: null,
      },
    });

    console.log(
      `[NSFW CONSENT] Consentimiento revocado: ${session.user.email}`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Consentimiento NSFW revocado exitosamente",
        nsfwConsent: false,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[NSFW CONSENT] Error revoking:", error);
    return NextResponse.json(
      {
        error: "Error al revocar consentimiento",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * GET /api/user/nsfw-consent
 * Obtener estado de consentimiento NSFW
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No autenticado" },
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        isAdult: true,
        nsfwConsent: true,
        nsfwConsentAt: true,
        nsfwConsentVersion: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return NextResponse.json(
      {
        isAdult: user.isAdult,
        nsfwConsent: user.nsfwConsent,
        nsfwConsentAt: user.nsfwConsent ? user.nsfwConsentAt : null,
        nsfwConsentVersion: user.nsfwConsent ? user.nsfwConsentVersion : null,
        canAccessNSFW: user.isAdult && user.nsfwConsent,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[NSFW CONSENT] Error getting status:", error);
    return NextResponse.json(
      {
        error: "Error al obtener estado de consentimiento",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
