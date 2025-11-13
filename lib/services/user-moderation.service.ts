/**
 * User Moderation Service - Moderación personal de cada usuario
 * Permite a los usuarios controlar qué contenido ven en su feed
 */

import { prisma } from '@/lib/prisma';

export const UserModerationService = {
  /**
   * OCULTAR POSTS
   */
  async hidePost(userId: string, postId: string, reason?: string) {
    // Verificar que el post existe
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post no encontrado');
    }

    // Crear o actualizar el registro de post oculto
    const hidden = await prisma.hiddenPost.upsert({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
      create: {
        userId,
        postId,
        reason,
      },
      update: {
        reason,
      },
    });

    return { success: true, hidden };
  },

  async unhidePost(userId: string, postId: string) {
    await prisma.hiddenPost.deleteMany({
      where: {
        userId,
        postId,
      },
    });

    return { success: true };
  },

  async getHiddenPosts(userId: string) {
    return await prisma.hiddenPost.findMany({
      where: { userId },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async isPostHidden(userId: string, postId: string) {
    const hidden = await prisma.hiddenPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    return !!hidden;
  },

  /**
   * BLOQUEAR USUARIOS
   */
  async blockUser(userId: string, blockedId: string, reason?: string) {
    // No puedes bloquearte a ti mismo
    if (userId === blockedId) {
      throw new Error('No puedes bloquearte a ti mismo');
    }

    // Verificar que el usuario bloqueado existe
    const userToBlock = await prisma.user.findUnique({
      where: { id: blockedId },
    });

    if (!userToBlock) {
      throw new Error('Usuario no encontrado');
    }

    // Crear bloqueo
    const blocked = await prisma.blockedUser.upsert({
      where: {
        userId_blockedId: {
          userId,
          blockedId,
        },
      },
      create: {
        userId,
        blockedId,
        reason,
      },
      update: {
        reason,
      },
    });

    // Si te siguen, eliminar el follow
    await prisma.follow.deleteMany({
      where: {
        followerId: blockedId,
        followingId: userId,
      },
    });

    // Si los sigues, eliminar tu follow
    await prisma.follow.deleteMany({
      where: {
        followerId: userId,
        followingId: blockedId,
      },
    });

    return { success: true, blocked };
  },

  async unblockUser(userId: string, blockedId: string) {
    await prisma.blockedUser.deleteMany({
      where: {
        userId,
        blockedId,
      },
    });

    return { success: true };
  },

  async getBlockedUsers(userId: string) {
    return await prisma.blockedUser.findMany({
      where: { userId },
      include: {
        blockedUser: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async isUserBlocked(userId: string, blockedId: string) {
    const blocked = await prisma.blockedUser.findUnique({
      where: {
        userId_blockedId: {
          userId,
          blockedId,
        },
      },
    });

    return !!blocked;
  },

  /**
   * PREFERENCIAS DE CONTENIDO (No me interesa)
   */
  async setContentPreference(
    userId: string,
    type: 'tag' | 'postType' | 'community',
    value: string,
    action: 'hide' | 'reduce' | 'block' = 'hide'
  ) {
    const preference = await prisma.contentPreference.upsert({
      where: {
        userId_type_value: {
          userId,
          type,
          value,
        },
      },
      create: {
        userId,
        type,
        value,
        action,
      },
      update: {
        action,
      },
    });

    return { success: true, preference };
  },

  async removeContentPreference(
    userId: string,
    type: 'tag' | 'postType' | 'community',
    value: string
  ) {
    await prisma.contentPreference.deleteMany({
      where: {
        userId,
        type,
        value,
      },
    });

    return { success: true };
  },

  async getContentPreferences(userId: string) {
    return await prisma.contentPreference.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * FILTROS PARA EL FEED
   * Retorna las condiciones que deben excluirse del feed
   */
  async getFeedFilters(userId: string) {
    // Posts ocultos
    const hiddenPosts = await prisma.hiddenPost.findMany({
      where: { userId },
      select: { postId: true },
    });

    // Usuarios bloqueados
    const blockedUsers = await prisma.blockedUser.findMany({
      where: { userId },
      select: { blockedId: true },
    });

    // Preferencias de contenido
    const preferences = await prisma.contentPreference.findMany({
      where: { userId },
    });

    // Tags a ocultar
    const hiddenTags = preferences
      .filter(p => p.type === 'tag' && p.action === 'hide')
      .map(p => p.value);

    // Tipos de post a ocultar
    const hiddenPostTypes = preferences
      .filter(p => p.type === 'postType' && p.action === 'hide')
      .map(p => p.value);

    // Comunidades a ocultar
    const hiddenCommunities = preferences
      .filter(p => p.type === 'community' && p.action === 'hide')
      .map(p => p.value);

    return {
      hiddenPostIds: hiddenPosts.map(h => h.postId),
      blockedUserIds: blockedUsers.map(b => b.blockedId),
      hiddenTags,
      hiddenPostTypes,
      hiddenCommunityIds: hiddenCommunities,
    };
  },

  /**
   * Verificar si un post debe ser visible para el usuario
   */
  async shouldShowPost(userId: string, post: any) {
    // Post oculto
    const isHidden = await this.isPostHidden(userId, post.id);
    if (isHidden) return false;

    // Autor bloqueado
    const isBlocked = await this.isUserBlocked(userId, post.authorId);
    if (isBlocked) return false;

    // Preferencias de contenido
    const preferences = await this.getContentPreferences(userId);

    // Verificar tags
    if (post.tags && Array.isArray(post.tags)) {
      const hiddenTags = preferences
        .filter(p => p.type === 'tag' && p.action === 'hide')
        .map(p => p.value);

      const hasHiddenTag = post.tags.some((tag: string) =>
        hiddenTags.includes(tag)
      );

      if (hasHiddenTag) return false;
    }

    // Verificar tipo de post
    const hiddenTypes = preferences
      .filter(p => p.type === 'postType' && p.action === 'hide')
      .map(p => p.value);

    if (hiddenTypes.includes(post.type)) return false;

    // Verificar comunidad
    if (post.communityId) {
      const hiddenCommunities = preferences
        .filter(p => p.type === 'community' && p.action === 'hide')
        .map(p => p.value);

      if (hiddenCommunities.includes(post.communityId)) return false;
    }

    return true;
  },

  /**
   * Estadísticas de moderación del usuario
   */
  async getModerationStats(userId: string) {
    const [hiddenPostsCount, blockedUsersCount, preferencesCount] = await Promise.all([
      prisma.hiddenPost.count({ where: { userId } }),
      prisma.blockedUser.count({ where: { userId } }),
      prisma.contentPreference.count({ where: { userId } }),
    ]);

    return {
      hiddenPosts: hiddenPostsCount,
      blockedUsers: blockedUsersCount,
      contentPreferences: preferencesCount,
    };
  },
};
