import { NextRequest, NextResponse } from 'next/server';
import { FeedService } from '@/lib/services/feed.service';

/**
 * GET /api/community/feed/new - Feed New
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    const posts = await FeedService.getNewFeed(page, limit);
    return NextResponse.json({ posts, page, limit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
