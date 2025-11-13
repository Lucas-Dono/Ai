import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { MessagingService } from '@/lib/services/messaging.service';

/**
 * GET /api/messages/search?q=query - Buscar mensajes
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query debe tener al menos 2 caracteres' },
        { status: 400 }
      );
    }

    const messages = await MessagingService.searchMessages(
      session.user.id,
      query,
      limit
    );

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error('Error searching messages:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
