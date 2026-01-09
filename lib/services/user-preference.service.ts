import { prisma } from '@/lib/prisma';

interface PreferenceUpdate {
  postType?: string;
  tags?: string[];
  communityId?: string;
}

export class UserPreferenceService {
  /**
   * Incrementar preferencias del usuario basado en una acción (seguir, like, comentar, etc.)
   */
  static async incrementPreference(
    userId: string,
    data: PreferenceUpdate,
    weight: number = 1
  ) {
    // Obtener o crear preferencias del usuario
    let preferences = await prisma.userContentPreference.findUnique({
      where: { userId }
    });

    if (!preferences) {
      preferences = await prisma.userContentPreference.create({
        data: {
          userId,
          preferredPostTypes: {},
          preferredTags: {},
          preferredCommunities: {}
        }
      });
    }

    // Parsear JSON actual
    const postTypes = (preferences.preferredPostTypes as any) || {};
    const tags = (preferences.preferredTags as any) || {};
    const communities = (preferences.preferredCommunities as any) || {};

    // Incrementar tipo de post
    if (data.postType) {
      postTypes[data.postType] = (postTypes[data.postType] || 0) + weight;
    }

    // Incrementar tags
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach(tag => {
        tags[tag] = (tags[tag] || 0) + weight;
      });
    }

    // Incrementar comunidad
    if (data.communityId) {
      communities[data.communityId] = (communities[data.communityId] || 0) + weight;
    }

    // Actualizar en DB
    const updated = await prisma.userContentPreference.update({
      where: { userId },
      data: {
        preferredPostTypes: postTypes,
        preferredTags: tags,
        preferredCommunities: communities
      }
    });

    return updated;
  }

  /**
   * Obtener preferencias del usuario
   */
  static async getUserPreferences(userId: string) {
    let preferences = await prisma.userContentPreference.findUnique({
      where: { userId }
    });

    if (!preferences) {
      // Crear preferencias vacías si no existen
      preferences = await prisma.userContentPreference.create({
        data: {
          userId,
          preferredPostTypes: {},
          preferredTags: {},
          preferredCommunities: {}
        }
      });
    }

    return {
      postTypes: (preferences.preferredPostTypes as any) || {},
      tags: (preferences.preferredTags as any) || {},
      communities: (preferences.preferredCommunities as any) || {}
    };
  }

  /**
   * Calcular score personalizado para un post
   */
  static calculatePersonalizedScore(
    post: {
      upvotes: number;
      downvotes: number;
      type: string;
      tags: any;
      communityId: string | null;
    },
    preferences: {
      postTypes: Record<string, number>;
      tags: Record<string, number>;
      communities: Record<string, number>;
    }
  ): number {
    // Score base (engagement)
    let score = post.upvotes - post.downvotes;

    // Bonus por tipo de post
    const typeBonus = preferences.postTypes[post.type] || 0;
    score += typeBonus * 2;

    // Bonus por tags
    const postTags = Array.isArray(post.tags) ? post.tags : [];
    postTags.forEach((tag: string) => {
      const tagBonus = preferences.tags[tag] || 0;
      score += tagBonus * 1.5;
    });

    // Bonus por comunidad
    if (post.communityId) {
      const communityBonus = preferences.communities[post.communityId] || 0;
      score += communityBonus * 3;
    }

    return score;
  }

  /**
   * Registrar acción del usuario (para actualizar preferencias)
   * Diferentes acciones tienen diferentes pesos
   */
  static async trackAction(
    userId: string,
    action: 'follow' | 'upvote' | 'comment' | 'save' | 'view',
    postData: PreferenceUpdate
  ) {
    // Mapear acción a peso
    const weights = {
      follow: 3,   // Alta señal de interés
      save: 2,     // Guarda para después
      comment: 2,  // Engagement activo
      upvote: 1,   // Likes
      view: 0.5    // Solo vió el post
    };

    const weight = weights[action];

    return await this.incrementPreference(userId, postData, weight);
  }

  /**
   * Resetear preferencias de un usuario
   */
  static async resetPreferences(userId: string) {
    return await prisma.userContentPreference.update({
      where: { userId },
      data: {
        preferredPostTypes: {},
        preferredTags: {},
        preferredCommunities: {}
      }
    });
  }
}
