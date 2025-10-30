import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/middleware/auth-helper';

import { CommentService } from '@/lib/services/comment.service';

/**
 * POST /api/community/comments/[id]/vote - Votar comentario
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { voteType } = await request.json();
    if (!['upvote', 'downvote'].includes(voteType)) {
      return NextResponse.json({ error: 'Tipo de voto inválido' }, { status: 400 });
    }

    const result = await CommentService.voteComment(params.id, session.user.id, voteType);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
