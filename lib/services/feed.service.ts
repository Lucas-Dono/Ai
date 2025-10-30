/**
 * Feed Service - Feed algorítmico simple (sin ML)
 */

import { prisma } from '@/lib/prisma';

export const FeedService = {
  async getPersonalizedFeed(userId: string, page = 1, limit = 25) {
    const skip = (page - 1) * limit;

    // Obtener comunidades del usuario
    const userCommunities = await prisma.communityMember.findMany({
      where: { userId },
      select: { communityId: true },
    });

    const communityIds = userCommunities.map(m => m.communityId);

    // Obtener usuarios que sigue
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map(f => f.followingId);

    // Feed personalizado: posts de comunidades + posts de usuarios seguidos + trending
    const posts = await prisma.communityPost.findMany({
      where: {
        status: 'published',
        OR: [
          { communityId: { in: communityIds } },
          { authorId: { in: followingIds } },
          {
            AND: [
              { score: { gte: 5 } },
              {
                createdAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
              },
            ],
          },
        ],
      },
      orderBy: [
        { isPinned: 'desc' },
        { lastActivityAt: 'desc' },
      ],
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
            awards: true,
          },
        },
      },
    });

    return posts;
  },

  async getHotFeed(page = 1, limit = 25) {
    const skip = (page - 1) * limit;

    // Hot = score alto + reciente
    const posts = await prisma.communityPost.findMany({
      where: { status: 'published' },
      orderBy: [
        { isPinned: 'desc' },
        { score: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
            awards: true,
          },
        },
      },
    });

    return posts;
  },

  async getNewFeed(page = 1, limit = 25) {
    const skip = (page - 1) * limit;

    const posts = await prisma.communityPost.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
            awards: true,
          },
        },
      },
    });

    return posts;
  },

  async getTopFeed(timeRange: 'day' | 'week' | 'month' | 'year' | 'all' = 'week', page = 1, limit = 25) {
    const skip = (page - 1) * limit;

    const ranges: Record<string, number> = {
      day: 1,
      week: 7,
      month: 30,
      year: 365,
    };

    const where: any = { status: 'published' };

    if (timeRange !== 'all') {
      const days = ranges[timeRange];
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: since };
    }

    const posts = await prisma.communityPost.findMany({
      where,
      orderBy: { score: 'desc' },
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
            awards: true,
          },
        },
      },
    });

    return posts;
  },

  async getFollowingFeed(userId: string, page = 1, limit = 25) {
    const skip = (page - 1) * limit;

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map(f => f.followingId);

    if (followingIds.length === 0) {
      return [];
    }

    const posts = await prisma.communityPost.findMany({
      where: {
        status: 'published',
        authorId: { in: followingIds },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
            awards: true,
          },
        },
      },
    });

    return posts;
  },
};
