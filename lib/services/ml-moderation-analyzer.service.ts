/**
 * ML Moderation Analyzer Service
 *
 * Análisis inteligente de patrones de moderación usando embeddings
 * con sistema de colas para no afectar operaciones críticas.
 */

import { prisma } from '@/lib/prisma';
import { getEmbedding, getBatchEmbeddings, findSimilar } from '@/lib/embeddings/smart-embeddings';
import { cosineSimilarity } from '@/lib/memory/openai-embeddings';
import { createLogger } from '@/lib/logger';

const log = createLogger('MLModerationAnalyzer');

interface MLSuggestion {
  id: string;
  type: 'hide_post' | 'block_user' | 'hide_tag' | 'hide_type' | 'hide_community';
  title: string;
  description: string;
  confidence: number;
  reason: string;
  action: any;
  metadata?: any;
}

export const MLModerationAnalyzer = {
  /**
   * Analizar patrones y generar sugerencias ML
   * SE EJECUTA EN HORARIO DE BAJA CARGA (vía cron nocturno)
   */
  async analyzeModerationPatterns(userId: string): Promise<MLSuggestion[]> {
    log.info({ userId }, 'Iniciando análisis ML de moderación');

    const suggestions: MLSuggestion[] = [];

    try {
      // 1. Análisis de similitud semántica en posts ocultos
      const semanticSuggestions = await this.analyzeSemanticPatterns(userId);
      suggestions.push(...semanticSuggestions);

      // 2. Análisis de comportamiento de autores
      const authorSuggestions = await this.analyzeAuthorPatterns(userId);
      suggestions.push(...authorSuggestions);

      // 3. Análisis de clusters de contenido
      const clusterSuggestions = await this.analyzeContentClusters(userId);
      suggestions.push(...clusterSuggestions);

      log.info(
        { userId, suggestionsCount: suggestions.length },
        'Análisis ML completado'
      );
    } catch (error) {
      log.error({ userId, error }, 'Error en análisis ML');
    }

    // Ordenar por confianza y retornar top 10
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  },

  /**
   * 1. Análisis de similitud semántica
   * Encuentra posts similares a los que el usuario oculta
   */
  async analyzeSemanticPatterns(userId: string): Promise<MLSuggestion[]> {
    const suggestions: MLSuggestion[] = [];

    try {
      // TODO: HiddenPost model removed - need to implement alternative
      // Obtener posts ocultos recientes (últimos 30 días)
      const hiddenPosts: any[] = []; // await prisma.hiddenPost.findMany({
      //   where: {
      //     userId,
      //     createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      //   },
      //   include: {
      //     post: {
      //       select: {
      //         id: true,
      //         title: true,
      //         content: true,
      //         tags: true,
      //         type: true,
      //       },
      //     },
      //   },
      //   take: 20,
      // });

      if (hiddenPosts.length < 3) {
        log.debug({ userId }, 'Pocos posts ocultos para análisis semántico');
        return suggestions;
      }

      log.info(
        { userId, hiddenCount: hiddenPosts.length },
        'Analizando similitud semántica'
      );

      // Obtener embeddings de posts ocultos (usa cola con prioridad baja)
      const hiddenTexts = hiddenPosts.map(
        (hp: any) => `${hp.post.title} ${hp.post.content}`.substring(0, 1000)
      );

      const hiddenEmbeddings = await getBatchEmbeddings(hiddenTexts, {
        context: 'ml',
        userId,
        onProgress: (completed, total) => {
          log.debug(
            { userId, completed, total },
            'Progreso embeddings posts ocultos'
          );
        },
      });

      // Calcular centroide (promedio) de embeddings ocultos
      const centroid = this.calculateCentroid(hiddenEmbeddings);

      // Buscar posts recientes en el feed
      const recentPosts = await prisma.communityPost.findMany({
        where: {
          status: 'published',
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          NOT: {
            id: { in: hiddenPosts.map((hp: any) => hp.postId) },
          },
        },
        select: {
          id: true,
          title: true,
          content: true,
          authorId: true,
        },
        take: 100,
      });

      // Analizar similitud con cada post
      for (const post of recentPosts) {
        const postText = `${post.title} ${post.content}`.substring(0, 1000);

        // Obtener embedding (usa caché si está disponible)
        const postEmbedding = await getEmbedding(postText, {
          context: 'ml',
          userId,
        });

        const similarity = cosineSimilarity(centroid, postEmbedding);

        // Si es muy similar (>75%), sugerir ocultar
        if (similarity > 0.75) {
          suggestions.push({
            id: `semantic_hide_${post.id}`,
            type: 'hide_post',
            title: `Post similar a contenido que ocultaste`,
            description: `"${post.title.substring(0, 50)}..."`,
            confidence: Math.round(similarity * 100),
            reason: `${Math.round(similarity * 100)}% similar a posts que ocultaste`,
            action: {
              type: 'hide_post',
              postId: post.id,
            },
            metadata: {
              similarity,
              postId: post.id,
            },
          });
        }
      }

      log.info(
        { userId, suggestionsCount: suggestions.length },
        'Análisis semántico completado'
      );
    } catch (error) {
      log.error({ userId, error }, 'Error en análisis semántico');
    }

    return suggestions;
  },

  /**
   * 2. Análisis de comportamiento de autores
   * Detecta patrones en autores bloqueados vs no bloqueados
   */
  async analyzeAuthorPatterns(userId: string): Promise<MLSuggestion[]> {
    const suggestions: MLSuggestion[] = [];

    try {
      // TODO: BlockedUser model removed - need to implement alternative
      // Obtener usuarios bloqueados y sus posts
      const blockedUsers: any[] = []; // await prisma.blockedUser.findMany({
      //   where: { userId },
      //   include: {
      //     blockedUser: {
      //       include: {
      //         posts: {
      //           where: { status: 'published' },
      //           select: { title: true, content: true, type: true, tags: true },
      //           take: 10,
      //         },
      //       },
      //     },
      //   },
      // });

      if (blockedUsers.length < 2) {
        return suggestions; // Necesitamos al menos 2 usuarios bloqueados
      }

      // Crear "perfil" promedio de usuarios bloqueados
      const blockedTexts = blockedUsers.flatMap((bu: any) =>
        bu.blockedUser.posts.map(
          (p: any) => `${p.title} ${p.content}`.substring(0, 1000)
        )
      );

      if (blockedTexts.length === 0) {
        return suggestions;
      }

      const blockedEmbeddings = await getBatchEmbeddings(blockedTexts, {
        context: 'ml',
        userId,
      });

      const blockedCentroid = this.calculateCentroid(blockedEmbeddings);

      // Analizar autores de posts recientes que el usuario ve
      // NOTE: User model doesn't have posts relation, using CommunityPost instead
      const recentPosts = await prisma.communityPost.findMany({
        where: {
          status: 'published',
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        select: {
          id: true,
          title: true,
          content: true,
          authorId: true,
        },
        take: 100,
      });

      // Group posts by author
      const authorPostsMap = new Map<string, any[]>();
      recentPosts.forEach(post => {
        if (!authorPostsMap.has(post.authorId)) {
          authorPostsMap.set(post.authorId, []);
        }
        authorPostsMap.get(post.authorId)!.push(post);
      });

      // Comparar cada autor con el perfil de bloqueados
      for (const [authorId, posts] of authorPostsMap.entries()) {
        if (posts.length === 0) continue;

        const authorTexts = posts.map(
          p => `${p.title} ${p.content}`.substring(0, 1000)
        );

        const authorEmbeddings = await getBatchEmbeddings(authorTexts, {
          context: 'ml',
          userId,
        });

        const authorCentroid = this.calculateCentroid(authorEmbeddings);
        const similarity = cosineSimilarity(blockedCentroid, authorCentroid);

        // Si es muy similar a usuarios bloqueados (>70%), sugerir bloquear
        if (similarity > 0.7) {
          suggestions.push({
            id: `author_block_${authorId}`,
            type: 'block_user',
            title: `Usuario con contenido similar a bloqueados`,
            description: `Usuario publica contenido similar a usuarios que bloqueaste`,
            confidence: Math.round(similarity * 100),
            reason: `${Math.round(similarity * 100)}% similar a usuarios bloqueados`,
            action: {
              type: 'block_user',
              userId: authorId,
            },
            metadata: {
              similarity,
              authorId,
            },
          });
        }
      }
    } catch (error) {
      log.error({ userId, error }, 'Error en análisis de autores');
    }

    return suggestions;
  },

  /**
   * 3. Análisis de clusters de contenido
   * Encuentra grupos de contenido similar que el usuario oculta
   */
  async analyzeContentClusters(userId: string): Promise<MLSuggestion[]> {
    const suggestions: MLSuggestion[] = [];

    try {
      // TODO: HiddenPost model removed - need to implement alternative
      // Obtener posts ocultos con tags
      const hiddenPosts: any[] = []; // await prisma.hiddenPost.findMany({
      //   where: {
      //     userId,
      //     createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      //   },
      //   include: {
      //     post: {
      //       select: {
      //         tags: true,
      //         type: true,
      //       },
      //     },
      //   },
      // });

      if (hiddenPosts.length < 5) {
        return suggestions;
      }

      // Analizar frecuencia de tags y tipos
      const tagFreq = new Map<string, number>();
      const typeFreq = new Map<string, number>();

      hiddenPosts.forEach((hp: any) => {
        hp.post.tags.forEach((tag: string) => {
          tagFreq.set(tag, (tagFreq.get(tag) || 0) + 1);
        });
        typeFreq.set(hp.post.type, (typeFreq.get(hp.post.type) || 0) + 1);
      });

      // Sugerir ocultar tags frecuentes
      for (const [tag, count] of tagFreq.entries()) {
        const percentage = (count / hiddenPosts.length) * 100;

        if (percentage > 30) {
          // Si >30% de posts ocultos tienen este tag
          suggestions.push({
            id: `cluster_tag_${tag}`,
            type: 'hide_tag',
            title: `Patrón detectado: posts con #${tag}`,
            description: `${count} de ${hiddenPosts.length} posts ocultos tienen este tag`,
            confidence: Math.round(percentage),
            reason: `${Math.round(percentage)}% de posts ocultos tienen este tag`,
            action: {
              type: 'content_preference',
              value: JSON.stringify({ type: 'tag', value: tag, action: 'hide' }),
            },
          });
        }
      }

      // Sugerir ocultar tipos frecuentes
      for (const [type, count] of typeFreq.entries()) {
        const percentage = (count / hiddenPosts.length) * 100;

        if (percentage > 40) {
          // Si >40% de posts ocultos son de este tipo
          suggestions.push({
            id: `cluster_type_${type}`,
            type: 'hide_type',
            title: `Patrón detectado: posts tipo "${type}"`,
            description: `${count} de ${hiddenPosts.length} posts ocultos son de este tipo`,
            confidence: Math.round(percentage),
            reason: `${Math.round(percentage)}% de posts ocultos son de este tipo`,
            action: {
              type: 'content_preference',
              value: JSON.stringify({ type: 'postType', value: type, action: 'hide' }),
            },
          });
        }
      }
    } catch (error) {
      log.error({ userId, error }, 'Error en análisis de clusters');
    }

    return suggestions;
  },

  /**
   * Calcular centroide de embeddings
   */
  calculateCentroid(embeddings: number[][]): number[] {
    if (embeddings.length === 0) return [];

    const dim = embeddings[0].length;
    const centroid = new Array(dim).fill(0);

    for (const emb of embeddings) {
      for (let i = 0; i < dim; i++) {
        centroid[i] += emb[i];
      }
    }

    return centroid.map(val => val / embeddings.length);
  },

  /**
   * Guardar sugerencias ML en base de datos
   */
  async saveSuggestions(userId: string, suggestions: MLSuggestion[]): Promise<void> {
    // TODO: MLSuggestion model removed - need to implement alternative
    log.info({ userId, count: suggestions.length }, 'Sugerencias ML (not saved - model removed)');
    // // Eliminar sugerencias antiguas (>7 días)
    // await prisma.mLSuggestion.deleteMany({
    //   where: {
    //     userId,
    //     createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    //   },
    // });

    // // Guardar nuevas sugerencias
    // await prisma.mLSuggestion.createMany({
    //   data: suggestions.map(s => ({
    //     userId,
    //     suggestionId: s.id,
    //     type: s.type,
    //     title: s.title,
    //     description: s.description,
    //     confidence: s.confidence,
    //     reason: s.reason,
    //     action: s.action,
    //     metadata: s.metadata,
    //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    //   })),
    //   skipDuplicates: true,
    // });

    // log.info({ userId, count: suggestions.length }, 'Sugerencias ML guardadas');
  },

  /**
   * Obtener sugerencias ML guardadas
   */
  async getSavedSuggestions(userId: string): Promise<MLSuggestion[]> {
    // TODO: MLSuggestion model removed - need to implement alternative
    return [];
    // const saved = await prisma.mLSuggestion.findMany({
    //   where: {
    //     userId,
    //     expiresAt: { gt: new Date() },
    //   },
    //   orderBy: { confidence: 'desc' },
    //   take: 10,
    // });

    // return saved.map((s: any) => ({
    //   id: s.suggestionId,
    //   type: s.type as any,
    //   title: s.title,
    //   description: s.description,
    //   confidence: s.confidence,
    //   reason: s.reason,
    //   action: s.action,
    //   metadata: s.metadata,
    // }));
  },
};
