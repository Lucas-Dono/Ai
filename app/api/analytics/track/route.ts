/**
 * API Route: POST /api/analytics/track
 *
 * Endpoint para tracking de eventos de analytics desde el cliente.
 * Se usa para eventos que necesitan ser trackeados en el navegador
 * (como mobile sessions, client-side interactions, etc.)
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { trackEvent, EventType } from "@/lib/analytics/kpi-tracker";

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación (soporta web y mobile)
    const user = await getAuthenticatedUser(req);
    if (!user?.id) {
      console.log('[Analytics Track] No user authenticated');
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log('[Analytics Track] User authenticated:', user.id);

    // Parsear body
    const body = await req.json();
    console.log('[Analytics Track] Received body:', JSON.stringify(body));

    // Validación básica
    if (!body || typeof body !== 'object') {
      console.log('[Analytics Track] Invalid body type');
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { eventType, metadata = {} } = body;

    // Validar eventType
    if (!eventType || typeof eventType !== 'string') {
      console.log('[Analytics Track] Missing or invalid eventType:', eventType);
      return NextResponse.json(
        { error: "eventType is required and must be a string", received: eventType },
        { status: 400 }
      );
    }

    console.log('[Analytics Track] Validating eventType:', eventType);

    // Validar que el eventType existe en el enum
    const validEventTypes = Object.values(EventType);
    if (!validEventTypes.includes(eventType as EventType)) {
      console.log('[Analytics Track] Invalid eventType:', eventType, 'Valid types:', validEventTypes);
      return NextResponse.json(
        { error: "Invalid event type", received: eventType, validTypes: validEventTypes },
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
