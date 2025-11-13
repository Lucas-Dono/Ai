import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { MessagingService } from '@/lib/services/messaging.service';

/**
 * POST /api/messages/conversations/[id]/read - Marcar mensajes como leídos
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const result = await MessagingService.markAsRead((await params).id, session.user.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error marking as read:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
