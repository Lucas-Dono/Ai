/**
 * API: Conversaciones Recientes
 * GET /api/conversations/recent - Obtener conversaciones recientes del usuario
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ConversationTrackingService } from '@/lib/services/conversation-tracking.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Obtener parámetros
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Obtener conversaciones recientes
    const conversations = await ConversationTrackingService.getRecentConversations(
      userId,
      limit
    );

    return NextResponse.json({
      conversations,
      totalUnread: await ConversationTrackingService.getTotalUnreadCount(userId)
    });
  } catch (error) {
    console.error('Error fetching recent conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
