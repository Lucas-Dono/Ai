/**
 * Moderation Suggestions Service
 *
 * Sistema inteligente que analiza patrones de moderación del usuario
 * y sugiere automáticamente filtros y bloqueos basados en su comportamiento.
 */

import { prisma } from '@/lib/prisma';

interface Suggestion {
  id: string;
  type: 'block_user' | 'hide_tag' | 'hide_post_type' | 'hide_community';
  title: string;
  description: string;
  action: {
    type: string;
    value: string;
    metadata?: any;
  };
  confidence: number; // 0-100
  reason: string;
}

export const ModerationSuggestionsService = {
  /**
   * Obtener sugerencias inteligentes para el usuario
   */
  async getSuggestions(userId: string): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];

    // Obtener datos de moderación recientes (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // TODO: HiddenPost, BlockedUser, ContentPreference models removed - need to implement alternative
    const hiddenPosts: any[] = [];
    const blockedUsers: any[] = [];
    const contentPreferences: any[] = [];

    // const [hiddenPosts, blockedUsers, contentPreferences] = await Promise.all([
    //   prisma.hiddenPost.findMany({
    //     where: {
    //       userId,
    //       createdAt: { gte: thirtyDaysAgo },
    //     },
    //     include: {
    //       post: {
    //         select: {
    //           authorId: true,
    //           type: true,
    //           tags: true,
    //           communityId: true,
    //         },
    //       },
    //     },
    //   }),
    //   prisma.blockedUser.findMany({
    //     where: { userId },
    //     select: { blockedId: true },
    //   }),
    //   prisma.contentPreference.findMany({
    //     where: { userId },
    //     select: { type: true, value: true },
    //   }),
    // ]);

    const blockedUserIds = new Set(blockedUsers.map((b: any) => b.blockedId));
    const existingPreferences = new Set(
      contentPreferences.map((p: any) => `${p.type}:${p.value}`)
    );

    // 1. Analizar autores de posts ocultos frecuentemente
    const authorFrequency = new Map<string, number>();
    hiddenPosts.forEach((hp: any) => {
      if (hp.post?.authorId) {
        const count = authorFrequency.get(hp.post.authorId) || 0;
        authorFrequency.set(hp.post.authorId, count + 1);
      }
    });

    // Sugerir bloquear autores con 3+ posts ocultos
    for (const [authorId, count] of authorFrequency.entries()) {
      if (count >= 3 && !blockedUserIds.has(authorId)) {
        const author = await prisma.user.findUnique({
          where: { id: authorId },
          select: { name: true },
        });

        suggestions.push({
          id: `block-${authorId}`,
          type: 'block_user',
          title: `Bloquear a ${author?.name || 'este usuario'}`,
          description: `Has ocultado ${count} posts de este usuario en el último mes`,
          action: {
            type: 'block_user',
            value: authorId,
            metadata: { userName: author?.name },
          },
          confidence: Math.min(100, count * 25),
          reason: `Ocultaste ${count} posts de este autor`,
        });
      }
    }

    // 2. Analizar tags frecuentes en posts ocultos
    const tagFrequency = new Map<string, number>();
    hiddenPosts.forEach((hp: any) => {
      if (hp.post?.tags) {
        hp.post.tags.forEach((tag: string) => {
          const count = tagFrequency.get(tag) || 0;
          tagFrequency.set(tag, count + 1);
        });
      }
    });

    // Sugerir ocultar tags con 4+ ocurrencias
    for (const [tag, count] of tagFrequency.entries()) {
      const prefKey = `tag:${tag}`;
      if (count >= 4 && !existingPreferences.has(prefKey)) {
        suggestions.push({
          id: `hide-tag-${tag}`,
          type: 'hide_tag',
          title: `No me interesa #${tag}`,
          description: `Has ocultado ${count} posts con esta etiqueta`,
          action: {
            type: 'content_preference',
            value: JSON.stringify({ type: 'tag', value: tag, action: 'hide' }),
          },
          confidence: Math.min(100, count * 20),
          reason: `Ocultaste ${count} posts con esta etiqueta`,
        });
      }
    }

    // 3. Analizar tipos de posts ocultos frecuentemente
    const typeFrequency = new Map<string, number>();
    hiddenPosts.forEach((hp: any) => {
      if (hp.post?.type) {
        const count = typeFrequency.get(hp.post.type) || 0;
        typeFrequency.set(hp.post.type, count + 1);
      }
    });

    // Sugerir ocultar tipos con 5+ ocurrencias
    for (const [type, count] of typeFrequency.entries()) {
      const prefKey = `postType:${type}`;
      if (count >= 5 && !existingPreferences.has(prefKey)) {
        const typeLabels: Record<string, string> = {
          question: 'Preguntas',
          discussion: 'Discusiones',
          showcase: 'Showcases',
          guide: 'Guías',
          news: 'Noticias',
        };

        suggestions.push({
          id: `hide-type-${type}`,
          type: 'hide_post_type',
          title: `No me interesan los posts de tipo "${typeLabels[type] || type}"`,
          description: `Has ocultado ${count} posts de este tipo`,
          action: {
            type: 'content_preference',
            value: JSON.stringify({ type: 'postType', value: type, action: 'hide' }),
          },
          confidence: Math.min(100, count * 15),
          reason: `Ocultaste ${count} posts de este tipo`,
        });
      }
    }

    // 4. Analizar comunidades frecuentes en posts ocultos
    const communityFrequency = new Map<string, number>();
    hiddenPosts.forEach((hp: any) => {
      if (hp.post?.communityId) {
        const count = communityFrequency.get(hp.post.communityId) || 0;
        communityFrequency.set(hp.post.communityId, count + 1);
      }
    });

    // Sugerir ocultar comunidades con 3+ posts ocultos
    for (const [communityId, count] of communityFrequency.entries()) {
      const prefKey = `community:${communityId}`;
      if (count >= 3 && !existingPreferences.has(prefKey)) {
        const community = await prisma.community.findUnique({
          where: { id: communityId },
          select: { name: true },
        });

        suggestions.push({
          id: `hide-community-${communityId}`,
          type: 'hide_community',
          title: `No me interesa la comunidad "${community?.name || 'esta comunidad'}"`,
          description: `Has ocultado ${count} posts de esta comunidad`,
          action: {
            type: 'content_preference',
            value: JSON.stringify({ type: 'community', value: communityId, action: 'hide' }),
            metadata: { communityName: community?.name },
          },
          confidence: Math.min(100, count * 25),
          reason: `Ocultaste ${count} posts de esta comunidad`,
        });
      }
    }

    // Ordenar sugerencias por confianza (mayor a menor)
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  },

  /**
   * Aplicar una sugerencia automáticamente
   */
  async applySuggestion(userId: string, suggestionId: string): Promise<boolean> {
    const suggestions = await this.getSuggestions(userId);
    const suggestion = suggestions.find(s => s.id === suggestionId);

    if (!suggestion) {
      throw new Error('Sugerencia no encontrada');
    }

    // TODO: BlockedUser and ContentPreference models removed - need to implement alternative
    throw new Error('Suggestion application disabled - models removed');

    // // Aplicar la acción según el tipo
    // switch (suggestion.type) {
    //   case 'block_user':
    //     await prisma.blockedUser.create({
    //       data: {
    //         userId,
    //         blockedId: suggestion.action.value,
    //         reason: `Auto-bloqueado por sugerencia: ${suggestion.reason}`,
    //       },
    //     });
    //     break;

    //   case 'hide_tag':
    //   case 'hide_post_type':
    //   case 'hide_community':
    //     const prefData = JSON.parse(suggestion.action.value);
    //     await prisma.contentPreference.upsert({
    //       where: {
    //         userId_type_value: {
    //           userId,
    //           type: prefData.type,
    //           value: prefData.value,
    //         },
    //       },
    //       create: {
    //         userId,
    //         type: prefData.type,
    //         value: prefData.value,
    //         action: prefData.action,
    //       },
    //       update: {
    //         action: prefData.action,
    //       },
    //     });
    //     break;

    //   default:
    //     throw new Error('Tipo de sugerencia no soportado');
    // }

    return true;
  },

  /**
   * Descartar una sugerencia (para no mostrarla de nuevo)
   * Esto podría guardarse en una tabla separada si quisieras trackear descartes
   */
  async dismissSuggestion(userId: string, suggestionId: string): Promise<boolean> {
    // Por ahora solo retornamos true
    // En el futuro podrías guardar esto en una tabla DismissedSuggestions
    return true;
  },

  /**
   * Obtener un resumen de las acciones de moderación recientes
   */
  async getModerationSummary(userId: string, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // TODO: HiddenPost, BlockedUser, ContentPreference models removed - need to implement alternative
    const recentHides = 0;
    const recentBlocks = 0;
    const recentPreferences = 0;

    // const [recentHides, recentBlocks, recentPreferences] = await Promise.all([
    //   prisma.hiddenPost.count({
    //     where: {
    //       userId,
    //       createdAt: { gte: startDate },
    //     },
    //   }),
    //   prisma.blockedUser.count({
    //     where: {
    //       userId,
    //       createdAt: { gte: startDate },
    //     },
    //   }),
    //   prisma.contentPreference.count({
    //     where: {
    //       userId,
    //       createdAt: { gte: startDate },
    //     },
    //   }),
    // ]);

    return {
      recentHides,
      recentBlocks,
      recentPreferences,
      totalActions: recentHides + recentBlocks + recentPreferences,
      period: `${days} días`,
    };
  },
};
