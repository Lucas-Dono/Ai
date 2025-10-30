import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/lib/services/event.service';

/**
 * GET /api/community/events/[id]/participants - Obtener participantes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const participants = await EventService.getParticipants(params.id);
    return NextResponse.json(participants);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}
