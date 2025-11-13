import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logging/logger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/user/notification-preferences
 * Obtener preferencias de notificaciones del usuario actual
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener o crear preferencias
    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId: session.user.id },
    });

    // Si no existen, crear con valores por defecto
    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    log.error({ error }, "Error fetching notification preferences");
    return NextResponse.json(
      { error: "Error al obtener preferencias" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/notification-preferences
 * Actualizar preferencias de notificaciones
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validar frecuencias
    const validFrequencies = ["daily", "weekly", "never"];
    if (body.bondWarningFrequency && !validFrequencies.includes(body.bondWarningFrequency)) {
      return NextResponse.json(
        { error: "Frecuencia inválida para bondWarningFrequency" },
        { status: 400 }
      );
    }
    if (body.bondDormantFrequency && !validFrequencies.includes(body.bondDormantFrequency)) {
      return NextResponse.json(
        { error: "Frecuencia inválida para bondDormantFrequency" },
        { status: 400 }
      );
    }
    if (body.bondFragileFrequency && !validFrequencies.includes(body.bondFragileFrequency)) {
      return NextResponse.json(
        { error: "Frecuencia inválida para bondFragileFrequency" },
        { status: 400 }
      );
    }

    // Validar horas preferidas
    if (body.preferredNotificationHours) {
      if (!Array.isArray(body.preferredNotificationHours)) {
        return NextResponse.json(
          { error: "preferredNotificationHours debe ser un array" },
          { status: 400 }
        );
      }
      const invalidHours = body.preferredNotificationHours.filter(
        (h: number) => h < 0 || h > 23
      );
      if (invalidHours.length > 0) {
        return NextResponse.json(
          { error: "Las horas deben estar entre 0 y 23" },
          { status: 400 }
        );
      }
    }

    // Actualizar preferencias (upsert)
    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: session.user.id },
      update: body,
      create: {
        userId: session.user.id,
        ...body,
      },
    });

    log.info(
      { userId: session.user.id, updates: Object.keys(body) },
      "Notification preferences updated"
    );

    return NextResponse.json(preferences);
  } catch (error) {
    log.error({ error }, "Error updating notification preferences");
    return NextResponse.json(
      { error: "Error al actualizar preferencias" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/notification-preferences/mute-bond
 * Silenciar notificaciones de un bond específico
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bondId, unmute } = body;

    if (!bondId) {
      return NextResponse.json(
        { error: "bondId es requerido" },
        { status: 400 }
      );
    }

    // Verificar que el bond pertenece al usuario
    const bond = await prisma.symbolicBond.findFirst({
      where: {
        id: bondId,
        userId: session.user.id,
      },
    });

    if (!bond) {
      return NextResponse.json(
        { error: "Bond no encontrado" },
        { status: 404 }
      );
    }

    // Obtener preferencias actuales
    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId: session.user.id },
    });

    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: { userId: session.user.id },
      });
    }

    // Actualizar lista de bonds silenciados
    const mutedBonds = (preferences.mutedBonds as string[]) || [];
    let newMutedBonds: string[];

    if (unmute) {
      // Remover de la lista
      newMutedBonds = mutedBonds.filter((id) => id !== bondId);
    } else {
      // Agregar a la lista si no está ya
      newMutedBonds = mutedBonds.includes(bondId)
        ? mutedBonds
        : [...mutedBonds, bondId];
    }

    // Actualizar
    const updated = await prisma.notificationPreferences.update({
      where: { userId: session.user.id },
      data: {
        mutedBonds: newMutedBonds,
      },
    });

    log.info(
      { userId: session.user.id, bondId, action: unmute ? "unmute" : "mute" },
      "Bond notification preferences updated"
    );

    return NextResponse.json({
      success: true,
      bondId,
      muted: !unmute,
      mutedBonds: newMutedBonds,
    });
  } catch (error) {
    log.error({ error }, "Error muting/unmuting bond");
    return NextResponse.json(
      { error: "Error al actualizar preferencias" },
      { status: 500 }
    );
  }
}
