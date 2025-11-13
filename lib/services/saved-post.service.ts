/**
 * Saved Post Service - Guardar posts para leer después
 */

import { prisma } from '@/lib/prisma';

export const SavedPostService = {
  /**
   * Guardar un post
   */
  async savePost(userId: string, postId: string, collectionName?: string) {
    // Verificar que el post existe
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new Error('Post no encontrado');
    }

    // Crear o actualizar saved post
    const savedPost = await prisma.savedPost.upsert({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
      update: {
        collectionName,
      },
      create: {
        userId,
        postId,
        collectionName,
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            type: true,
            score: true,
            commentCount: true,
            createdAt: true,
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
          },
        },
      },
    });

    return savedPost;
  },

  /**
   * Remover un post guardado
   */
  async unsavePost(userId: string, postId: string) {
    await prisma.savedPost.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    return { success: true };
  },

  /**
   * Verificar si un post está guardado
   */
  async isPostSaved(userId: string, postId: string): Promise<boolean> {
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    return !!savedPost;
  },

  /**
   * Obtener posts guardados de un usuario
   */
  async getSavedPosts(userId: string, filters?: {
    collectionName?: string;
    page?: number;
    limit?: number;
  }) {
    // Limitar paginación para prevenir abuso
    const page = Math.max(1, Math.min(filters?.page || 1, 1000));
    const limit = Math.max(1, Math.min(filters?.limit || 25, 100));
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (filters?.collectionName) {
      where.collectionName = filters.collectionName;
    }

    const savedPosts = await prisma.savedPost.findMany({
      where,
      orderBy: {
        savedAt: 'desc',
      },
      skip,
      take: limit,
      include: {
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            type: true,
            score: true,
            commentCount: true,
            images: true,
            tags: true,
            createdAt: true,
            status: true,
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
        },
      },
    });

    // Filtrar posts removidos/baneados (solo mostrar published)
    const filteredPosts = savedPosts.filter(
      (sp) => sp.post && sp.post.status === 'published'
    );

    return filteredPosts;
  },

  /**
   * Obtener colecciones de un usuario
   */
  async getCollections(userId: string) {
    const collections = await prisma.savedPost.groupBy({
      by: ['collectionName'],
      where: {
        userId,
        collectionName: {
          not: null,
        },
      },
      _count: true,
    });

    return collections.map(c => ({
      name: c.collectionName,
      count: c._count,
    }));
  },

  /**
   * Obtener estadísticas de saved posts
   */
  async getStats(userId: string) {
    const [total, withCollection] = await Promise.all([
      prisma.savedPost.count({
        where: { userId },
      }),
      prisma.savedPost.count({
        where: {
          userId,
          collectionName: {
            not: null,
          },
        },
      }),
    ]);

    const collections = await this.getCollections(userId);

    return {
      total,
      withCollection,
      withoutCollection: total - withCollection,
      collectionsCount: collections.length,
      collections,
    };
  },
};
