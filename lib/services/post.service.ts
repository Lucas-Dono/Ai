/**
 * Post Service - Gestión de posts y discusiones
 */

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export interface CreatePostData {
  title: string;
  content: string;
  type: 'discussion' | 'question' | 'showcase' | 'help' | 'research' | 'poll' | 'announcement';
  communityId?: string;
  tags?: string[];
  images?: string[];
  videos?: string[];
  pollOptions?: Array<{ text: string }>;
  pollEndDate?: Date;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface SearchFilters {
  communityId?: string;
  type?: string;
  tags?: string[];
  authorId?: string;
  search?: string;
  sortBy?: 'hot' | 'new' | 'top' | 'controversial';
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
}

export const PostService = {
  /**
   * Crear nuevo post
   */
  async createPost(authorId: string, data: CreatePostData) {
    // Si es en una comunidad, verificar permisos
    if (data.communityId) {
      const member = await prisma.communityMember.findUnique({
        where: {
          communityId_userId: {
            communityId: data.communityId,
            userId: authorId,
          },
        },
      });

      if (!member || !member.canPost || member.isBanned || member.isMuted) {
        throw new Error('No tienes permiso para publicar en esta comunidad');
      }
    }

    // Generar slug del título
    const slug = data.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50) + '-' + Math.random().toString(36).substring(2, 8);

    const post = await prisma.communityPost.create({
      data: {
        authorId,
        title: data.title,
        content: data.content,
        type: data.type,
        communityId: data.communityId,
        tags: (data.tags || []) as Prisma.JsonValue,
        images: (data.images || []) as Prisma.JsonValue,
        videos: (data.videos || []) as Prisma.JsonValue,
        pollOptions: data.pollOptions as Prisma.JsonValue,
        pollEndDate: data.pollEndDate,
        slug,
      },
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
      },
    });

    // Incrementar contador de posts en la comunidad
    if (data.communityId) {
      await prisma.community.update({
        where: { id: data.communityId },
        data: { postCount: { increment: 1 } },
      });
    }

    return post;
  },

  /**
   * Obtener post por ID (alias)
   */
  async getPost(postId: string, userId?: string) {
    return this.getPostById(postId, userId);
  },

  /**
   * Obtener post por ID
   */
  async getPostById(postId: string, userId?: string) {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
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

    if (!post) {
      return null;
    }

    // Incrementar view count
    await prisma.communityPost.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
    });

    // Si hay userId, verificar si ya votó
    let userVote = null;
    if (userId) {
      userVote = await prisma.postVote.findUnique({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });
    }

    return {
      ...post,
      userVote: userVote?.voteType || null,
    };
  },

  /**
   * Actualizar post
   */
  async updatePost(postId: string, userId: string, data: UpdatePostData) {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post no encontrado');
    }

    if (post.authorId !== userId) {
      throw new Error('No tienes permiso para editar este post');
    }

    const updated = await prisma.communityPost.update({
      where: { id: postId },
      data: {
        ...data,
        tags: data.tags as Prisma.JsonValue | undefined,
      },
    });

    return updated;
  },

  /**
   * Eliminar post
   */
  async deletePost(postId: string, userId: string) {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post no encontrado');
    }

    // Verificar permisos (autor o moderador de la comunidad)
    let canDelete = post.authorId === userId;

    if (!canDelete && post.communityId) {
      const member = await prisma.communityMember.findUnique({
        where: {
          communityId_userId: {
            communityId: post.communityId,
            userId,
          },
        },
      });

      canDelete = member?.canModerate || false;
    }

    if (!canDelete) {
      throw new Error('No tienes permiso para eliminar este post');
    }

    await prisma.communityPost.update({
      where: { id: postId },
      data: { status: 'removed' },
    });

    // Decrementar contador de posts
    if (post.communityId) {
      await prisma.community.update({
        where: { id: post.communityId },
        data: { postCount: { decrement: 1 } },
      });
    }

    return { success: true };
  },

  /**
   * Votar en post (upvote/downvote)
   */
  async votePost(postId: string, userId: string, voteType: 'upvote' | 'downvote') {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post no encontrado');
    }

    // Verificar voto existente
    const existingVote = await prisma.postVote.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingVote) {
      // Si es el mismo voto, removerlo (toggle)
      if (existingVote.voteType === voteType) {
        await prisma.postVote.delete({
          where: {
            postId_userId: {
              postId,
              userId,
            },
          },
        });

        // Actualizar contadores
        const increment = voteType === 'upvote' ? -1 : 1;
        await prisma.communityPost.update({
          where: { id: postId },
          data: {
            [voteType === 'upvote' ? 'upvotes' : 'downvotes']: { decrement: 1 },
            score: { increment },
          },
        });

        return { voteType: null };
      }

      // Cambiar voto
      await prisma.postVote.update({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
        data: { voteType },
      });

      // Actualizar contadores (revertir anterior y aplicar nuevo)
      const oldType = existingVote.voteType;
      await prisma.communityPost.update({
        where: { id: postId },
        data: {
          upvotes: {
            [oldType === 'upvote' ? 'decrement' : 'increment']: 1,
          },
          downvotes: {
            [oldType === 'downvote' ? 'decrement' : 'increment']: 1,
          },
          score: {
            increment: voteType === 'upvote' ? 2 : -2,
          },
        },
      });

      return { voteType };
    }

    // Crear nuevo voto
    await prisma.postVote.create({
      data: {
        postId,
        userId,
        voteType,
      },
    });

    // Actualizar contadores
    const increment = voteType === 'upvote' ? 1 : -1;
    await prisma.communityPost.update({
      where: { id: postId },
      data: {
        [voteType === 'upvote' ? 'upvotes' : 'downvotes']: { increment: 1 },
        score: { increment },
      },
    });

    return { voteType };
  },

  /**
   * Dar award a post
   */
  async awardPost(postId: string, giverId: string, awardType: string) {
    const costs: Record<string, number> = {
      helpful: 10,
      wholesome: 25,
      gold: 50,
      platinum: 100,
    };

    const cost = costs[awardType] || 10;

    const award = await prisma.postAward.create({
      data: {
        postId,
        giverId,
        awardType,
        cost,
      },
    });

    // Incrementar contador de awards
    await prisma.communityPost.update({
      where: { id: postId },
      data: { awardCount: { increment: 1 } },
    });

    return award;
  },

  /**
   * Buscar posts con filtros
   */
  async searchPosts(filters: SearchFilters, page = 1, limit = 25) {
    const skip = (page - 1) * limit;

    const where: Prisma.CommunityPostWhereInput = {
      status: 'published',
    };

    if (filters.communityId) where.communityId = filters.communityId;
    if (filters.type) where.type = filters.type;
    if (filters.authorId) where.authorId = filters.authorId;

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        path: [],
        array_contains: filters.tags,
      };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Filtro de tiempo
    if (filters.timeRange && filters.timeRange !== 'all') {
      const now = new Date();
      const ranges: Record<string, number> = {
        day: 1,
        week: 7,
        month: 30,
        year: 365,
      };
      const days = ranges[filters.timeRange];
      const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: since };
    }

    // Ordenamiento
    let orderBy: Prisma.CommunityPostOrderByWithRelationInput[] = [];
    switch (filters.sortBy) {
      case 'hot':
        // Hot = score / (age in hours + 2)^1.8
        orderBy = [{ score: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'new':
        orderBy = [{ createdAt: 'desc' }];
        break;
      case 'top':
        orderBy = [{ score: 'desc' }];
        break;
      case 'controversial':
        // Controversial = posts con upvotes y downvotes similares
        orderBy = [{ commentCount: 'desc' }];
        break;
      default:
        orderBy = [{ lastActivityAt: 'desc' }];
    }

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        orderBy,
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
      }),
      prisma.communityPost.count({ where }),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Pin post (moderadores)
   */
  async pinPost(postId: string, userId: string) {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post || !post.communityId) {
      throw new Error('Post no encontrado o no está en una comunidad');
    }

    // Verificar permisos
    const member = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId: post.communityId,
          userId,
        },
      },
    });

    if (!member || !member.canModerate) {
      throw new Error('No tienes permiso para pin posts');
    }

    await prisma.communityPost.update({
      where: { id: postId },
      data: { isPinned: true },
    });

    return { success: true };
  },

  /**
   * Lock post (cerrar comentarios)
   */
  async lockPost(postId: string, userId: string) {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post || !post.communityId) {
      throw new Error('Post no encontrado o no está en una comunidad');
    }

    const member = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId: post.communityId,
          userId,
        },
      },
    });

    if (!member || !member.canModerate) {
      throw new Error('No tienes permiso para lock posts');
    }

    await prisma.communityPost.update({
      where: { id: postId },
      data: { isLocked: true },
    });

    return { success: true };
  },

  /**
   * Reportar post
   */
  async reportPost(
    postId: string,
    reporterId: string,
    reason: string,
    description?: string
  ) {
    const report = await prisma.postReport.create({
      data: {
        postId,
        reporterId,
        reason,
        description,
      },
    });

    return report;
  },
};
