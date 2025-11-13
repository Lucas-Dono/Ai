import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { MessagingService } from '@/lib/services/messaging.service';

/**
 * GET /api/messages/conversations - Obtener conversaciones del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const conversations = await MessagingService.getUserConversations(session.user.id);
    return NextResponse.json(conversations);
  } catch (error: any) {
    console.error('Error getting conversations:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

/**
 * POST /api/messages/conversations - Crear o obtener conversación
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { participants, name, icon, type } = await request.json();

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json(
        { error: 'Participantes requeridos' },
        { status: 400 }
      );
    }

    const conversation = await MessagingService.getOrCreateConversation(
      session.user.id,
      participants,
      { name, icon, type }
    );

    return NextResponse.json(conversation, { status: 201 });
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
