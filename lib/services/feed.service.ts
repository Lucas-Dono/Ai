/**
 * Feed Service - Feed algorítmico simple (sin ML)
 */

import { prisma } from '@/lib/prisma';
import { UserModerationService } from './user-moderation.service';

/**
 * Helper: Construye condición WHERE para filtrar posts según privacidad
 * - Posts sin comunidad (globales): siempre visibles
 * - Posts de comunidades públicas: siempre visibles
 * - Posts de comunidades privadas/restringidas: solo si el usuario es miembro
 */
function buildPrivacyFilter(userId?: string) {
  const privacyConditions: any[] = [
    // Posts globales (sin comunidad) - siempre visibles
    { communityId: null },
    // Posts de comunidades públicas - siempre visibles
    {
      AND: [
        { communityId: { not: null } },
        {
          community: {
            type: 'public'
          }
        }
      ]
    }
  ];

  // Si hay usuario autenticado, incluir posts de sus comunidades privadas
  if (userId) {
    privacyConditions.push({
      AND: [
        { communityId: { not: null } },
        {
          community: {
            type: { in: ['private', 'restricted'] },
            members: {
              some: { userId }
            }
          }
        }
      ]
    });
  }

  return { OR: privacyConditions };
}

/**
 * Helper: Construye condición WHERE para filtrar contenido bloqueado/oculto
 */
async function buildModerationFilters(userId?: string) {
  if (!userId) {
    return {}; // Sin filtros si no hay usuario
  }

  const filters = await UserModerationService.getFeedFilters(userId);

  const conditions: any[] = [];

  // Excluir posts ocultos
  if (filters.hiddenPostIds.length > 0) {
    conditions.push({
      id: { notIn: filters.hiddenPostIds },
    });
  }

  // Excluir posts de usuarios bloqueados
  if (filters.blockedUserIds.length > 0) {
    conditions.push({
      authorId: { notIn: filters.blockedUserIds },
    });
  }

  // Excluir posts con tags no deseados
  if (filters.hiddenTags.length > 0) {
    conditions.push({
      NOT: {
        tags: {
          hasSome: filters.hiddenTags,
        },
      },
    });
  }

  // Excluir tipos de post no deseados
  if (filters.hiddenPostTypes.length > 0) {
    conditions.push({
      type: { notIn: filters.hiddenPostTypes },
    });
  }

  // Excluir comunidades no deseadas
  if (filters.hiddenCommunityIds.length > 0) {
    conditions.push({
      OR: [
        { communityId: null }, // Permitir posts globales
        { communityId: { notIn: filters.hiddenCommunityIds } },
      ],
    });
  }

  if (conditions.length === 0) {
    return {};
  }

  return { AND: conditions };
}

export const FeedService = {
  async getPersonalizedFeed(userId: string, page = 1, limit = 25) {
    // Limitar paginación para prevenir abuso
    const safePage = Math.max(1, Math.min(page, 1000)); // Máximo 1000 páginas
    const safeLimit = Math.max(1, Math.min(limit, 100)); // Máximo 100 items por página
    const skip = (safePage - 1) * safeLimit;

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

    // Obtener filtros de moderación personal
    const moderationFilters = await buildModerationFilters(userId);

    // Feed personalizado: posts de comunidades + posts de usuarios seguidos + trending
    const posts = await prisma.communityPost.findMany({
      where: {
        status: 'published',
        AND: [
          {
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
          buildPrivacyFilter(userId),
          moderationFilters,
        ],
      },
      orderBy: [
        { isPinned: 'desc' },
        { lastActivityAt: 'desc' },
      ],
      skip,
      take: safeLimit,
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

  async getHotFeed(page = 1, limit = 25, userId?: string) {
    const safePage = Math.max(1, Math.min(page, 1000));
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const skip = (safePage - 1) * safeLimit;

    // Obtener filtros de moderación personal
    const moderationFilters = await buildModerationFilters(userId);

    // Hot = score alto + reciente
    const posts = await prisma.communityPost.findMany({
      where: {
        status: 'published',
        ...buildPrivacyFilter(userId),
        ...moderationFilters,
      },
      orderBy: [
        { isPinned: 'desc' },
        { score: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: safeLimit,
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

  async getNewFeed(page = 1, limit = 25, userId?: string) {
    const safePage = Math.max(1, Math.min(page, 1000));
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const skip = (safePage - 1) * safeLimit;

    // Obtener filtros de moderación personal
    const moderationFilters = await buildModerationFilters(userId);

    const posts = await prisma.communityPost.findMany({
      where: {
        status: 'published',
        ...buildPrivacyFilter(userId),
        ...moderationFilters,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: safeLimit,
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

  async getTopFeed(timeRange: 'day' | 'week' | 'month' | 'year' | 'all' = 'week', page = 1, limit = 25, userId?: string) {
    const safePage = Math.max(1, Math.min(page, 1000));
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const skip = (safePage - 1) * safeLimit;

    const ranges: Record<string, number> = {
      day: 1,
      week: 7,
      month: 30,
      year: 365,
    };

    // Obtener filtros de moderación personal
    const moderationFilters = await buildModerationFilters(userId);

    const where: any = {
      status: 'published',
      ...buildPrivacyFilter(userId),
      ...moderationFilters,
    };

    if (timeRange !== 'all') {
      const days = ranges[timeRange];
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: since };
    }

    const posts = await prisma.communityPost.findMany({
      where,
      orderBy: { score: 'desc' },
      skip,
      take: safeLimit,
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
    const safePage = Math.max(1, Math.min(page, 1000));
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const skip = (safePage - 1) * safeLimit;

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map(f => f.followingId);

    if (followingIds.length === 0) {
      return [];
    }

    // Obtener filtros de moderación personal
    const moderationFilters = await buildModerationFilters(userId);

    const posts = await prisma.communityPost.findMany({
      where: {
        status: 'published',
        authorId: { in: followingIds },
        ...buildPrivacyFilter(userId),
        ...moderationFilters,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: safeLimit,
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

  /**
   * Feed "Home" - Posts de comunidades a las que el usuario está suscrito
   * Similar al Home feed de Reddit
   */
  async getHomeFeed(userId: string, page = 1, limit = 25) {
    const safePage = Math.max(1, Math.min(page, 1000));
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const skip = (safePage - 1) * safeLimit;

    // Obtener comunidades del usuario
    const userCommunities = await prisma.communityMember.findMany({
      where: { userId },
      select: { communityId: true },
    });

    const communityIds = userCommunities.map(m => m.communityId);

    // Si no está en ninguna comunidad, devolver array vacío
    // (o podrías devolver posts trending como fallback)
    if (communityIds.length === 0) {
      return [];
    }

    // Obtener filtros de moderación personal
    const moderationFilters = await buildModerationFilters(userId);

    // Posts de las comunidades suscritas
    const posts = await prisma.communityPost.findMany({
      where: {
        status: 'published',
        communityId: { in: communityIds },
        ...moderationFilters,
      },
      orderBy: [
        { isPinned: 'desc' },
        { lastActivityAt: 'desc' },
      ],
      skip,
      take: safeLimit,
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
            primaryColor: true,
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

  /**
   * Trending Communities - Comunidades con más actividad reciente
   * Calcula basado en posts y comentarios de los últimos 7 días
   */
  async getTrendingCommunities(limit = 10) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Obtener comunidades públicas con actividad reciente
    const communities = await prisma.community.findMany({
      where: {
        type: 'public',
        posts: {
          some: {
            createdAt: { gte: sevenDaysAgo },
          },
        },
      },
      include: {
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
        posts: {
          where: {
            createdAt: { gte: sevenDaysAgo },
          },
          select: {
            id: true,
            score: true,
            commentCount: true,
          },
        },
      },
      take: 50, // Obtener más para calcular
    });

    // Calcular score de trending para cada comunidad
    const communitiesWithScore = communities.map(community => {
      // Score = posts recientes * 2 + suma de scores + suma de comentarios
      const recentPostCount = community.posts.length;
      const totalScore = community.posts.reduce((sum, post) => sum + post.score, 0);
      const totalComments = community.posts.reduce((sum, post) => sum + post.commentCount, 0);

      const trendingScore = (recentPostCount * 2) + totalScore + (totalComments * 0.5);

      return {
        id: community.id,
        name: community.name,
        slug: community.slug,
        description: community.description,
        icon: community.icon,
        primaryColor: community.primaryColor,
        memberCount: community._count.members,
        postCount: community._count.posts,
        recentActivity: recentPostCount,
        trendingScore,
      };
    });

    // Ordenar por trending score y retornar top N
    return communitiesWithScore
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit);
  },
};
