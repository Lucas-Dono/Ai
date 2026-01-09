import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/middleware/auth-helper';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/community/posts/following/communities - Obtener comunidades de posts seguidos
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession(request);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Obtener IDs de posts seguidos
    const followedPosts = await prisma.postFollower.findMany({
      where: { userId },
      select: { postId: true }
    });

    const postIds = followedPosts.map(f => f.postId);

    if (postIds.length === 0) {
      return NextResponse.json({ communities: [] });
    }

    // Obtener comunidades únicas de esos posts
    const posts = await prisma.communityPost.findMany({
      where: {
        id: { in: postIds },
        communityId: { not: null }
      },
      select: {
        community: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    // Filtrar comunidades únicas
    const communitiesMap = new Map();
    posts.forEach(post => {
      if (post.community) {
        communitiesMap.set(post.community.id, post.community);
      }
    });

    const communities = Array.from(communitiesMap.values());

    return NextResponse.json({ communities });
  } catch (error: any) {
    console.error('Error fetching communities:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener comunidades' },
      { status: 400 }
    );
  }
}
