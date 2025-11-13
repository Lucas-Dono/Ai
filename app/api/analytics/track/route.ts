/**
 * API Route: POST /api/analytics/track
 *
 * Endpoint para tracking de eventos de analytics desde el cliente.
 * Se usa para eventos que necesitan ser trackeados en el navegador
 * (como mobile sessions, client-side interactions, etc.)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { trackEvent, EventType } from "@/lib/analytics/kpi-tracker";
import { z } from "zod";

const trackEventSchema = z.object({
  eventType: z.string(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parsear y validar body
    const body = await req.json();
    const validationResult = trackEventSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error },
        { status: 400 }
      );
    }

    const { eventType, metadata = {} } = validationResult.data;

    // Validar que el eventType existe en el enum
    const validEventTypes = Object.values(EventType);
    if (!validEventTypes.includes(eventType as EventType)) {
      return NextResponse.json(
        { error: "Invalid event type", validTypes: validEventTypes },
        { status: 400 }
      );
    }

    // Track the event
    await trackEvent(eventType as EventType, metadata);

    return NextResponse.json({
      success: true,
      message: "Event tracked successfully",
    });
  } catch (error) {
    console.error("[Analytics Track API] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
