/**
 * Reputation Service - Sistema de reputación y gamificación
 */

import { prisma } from '@/lib/prisma';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  pointsRequired?: number;
  condition?: string;
}

export const BADGES: BadgeDefinition[] = [
  // Participación
  { id: 'first_post', name: 'Primer Post', description: 'Creaste tu primer post', icon: '📝', condition: 'postCount >= 1' },
  { id: 'prolific_poster', name: 'Escritor Prolífico', description: 'Creaste 100 posts', icon: '✍️', condition: 'postCount >= 100' },
  { id: 'first_comment', name: 'Primer Comentario', description: 'Dejaste tu primer comentario', icon: '💬', condition: 'commentCount >= 1' },
  { id: 'conversation_starter', name: 'Iniciador de Conversaciones', description: '50 comentarios', icon: '🗣️', condition: 'commentCount >= 50' },
  
  // Popularidad
  { id: 'first_upvote', name: 'Primera Aprobación', description: 'Recibiste tu primer upvote', icon: '👍', condition: 'receivedUpvotes >= 1' },
  { id: 'popular', name: 'Popular', description: 'Recibiste 100 upvotes', icon: '⭐', condition: 'receivedUpvotes >= 100' },
  { id: 'viral', name: 'Viral', description: 'Un post con 1000+ upvotes', icon: '🔥', condition: 'maxPostUpvotes >= 1000' },
  
  // Ayuda
  { id: 'helper', name: 'Ayudante', description: '10 respuestas aceptadas', icon: '🆘', condition: 'acceptedAnswers >= 10' },
  { id: 'expert', name: 'Experto', description: '50 respuestas aceptadas', icon: '🎓', condition: 'acceptedAnswers >= 50' },
  
  // Comunidad
  { id: 'community_builder', name: 'Constructor de Comunidad', description: 'Creaste una comunidad', icon: '🏗️', condition: 'createdCommunities >= 1' },
  { id: 'moderator', name: 'Moderador', description: 'Moderador en una comunidad', icon: '🛡️', condition: 'isModerator' },
  
  // Investigación
  { id: 'researcher', name: 'Investigador', description: 'Publicaste un proyecto de investigación', icon: '🔬', condition: 'researchProjects >= 1' },
  { id: 'collaborator', name: 'Colaborador', description: 'Contribuiste a 5 proyectos', icon: '🤝', condition: 'researchContributions >= 5' },
  
  // Marketplace
  { id: 'creator', name: 'Creador', description: 'Publicaste un tema', icon: '🎨', condition: 'publishedThemes >= 1' },
  { id: 'bestseller', name: 'Best Seller', description: '1000+ descargas en un tema', icon: '💎', condition: 'maxThemeDownloads >= 1000' },
  
  // Puntos
  { id: 'bronze', name: 'Bronce', description: '100 puntos de reputación', icon: '🥉', pointsRequired: 100 },
  { id: 'silver', name: 'Plata', description: '500 puntos de reputación', icon: '🥈', pointsRequired: 500 },
  { id: 'gold', name: 'Oro', description: '1000 puntos de reputación', icon: '🥇', pointsRequired: 1000 },
  { id: 'platinum', name: 'Platino', description: '5000 puntos de reputación', icon: '💍', pointsRequired: 5000 },
  { id: 'diamond', name: 'Diamante', description: '10000 puntos de reputación', icon: '💎', pointsRequired: 10000 },
];

export const ReputationService = {
  /**
   * Obtener reputación del usuario
   */
  async getUserReputation(userId: string) {
    let reputation = await prisma.userReputation.findUnique({
      where: { userId },
      include: {
        badges: {
          orderBy: { earnedAt: 'desc' },
        },
      },
    });

    if (!reputation) {
      reputation = await prisma.userReputation.create({
        data: { userId },
        include: { badges: true },
      });
    }

    return reputation;
  },

  /**
   * Calcular nivel basado en puntos
   */
  calculateLevel(points: number): number {
    // Nivel = raíz cuadrada de (puntos / 100)
    return Math.floor(Math.sqrt(points / 100)) + 1;
  },

  /**
   * Añadir puntos de reputación
   */
  async addPoints(userId: string, points: number, reason: string) {
    const reputation = await prisma.userReputation.upsert({
      where: { userId },
      create: {
        userId,
        points,
        level: this.calculateLevel(points),
      },
      update: {
        points: { increment: points },
      },
    });

    const newLevel = this.calculateLevel(reputation.points + points);

    if (newLevel > reputation.level) {
      await prisma.userReputation.update({
        where: { userId },
        data: { level: newLevel },
      });
    }

    // Verificar badges por puntos
    await this.checkAndAwardBadges(userId);

    return reputation;
  },

  /**
   * Verificar y otorgar badges
   */
  async checkAndAwardBadges(userId: string) {
    const reputation = await this.getUserReputation(userId);
    const existingBadges = reputation.badges.map(b => b.badgeId);

    // Obtener estadísticas del usuario
    const stats = await this.getUserStats(userId);

    const newBadges: string[] = [];

    for (const badge of BADGES) {
      if (existingBadges.includes(badge.id)) continue;

      let shouldAward = false;

      // Verificar por puntos
      if (badge.pointsRequired && reputation.points >= badge.pointsRequired) {
        shouldAward = true;
      }

      // Verificar por condición
      if (badge.condition) {
        shouldAward = this.evaluateCondition(badge.condition, stats);
      }

      if (shouldAward) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
          },
        });
        newBadges.push(badge.id);
      }
    }

    return newBadges;
  },

  /**
   * Evaluar condición de badge
   */
  evaluateCondition(condition: string, stats: any): boolean {
    try {
      // Crear función segura para evaluar condición
      const fn = new Function(...Object.keys(stats), `return ${condition}`);
      return fn(...Object.values(stats));
    } catch {
      return false;
    }
  },

  /**
   * Obtener estadísticas del usuario
   */
  async getUserStats(userId: string) {
    const [
      postCount,
      commentCount,
      receivedUpvotes,
      acceptedAnswers,
      createdCommunities,
      researchProjects,
      researchContributions,
      publishedThemes,
      maxPostUpvotes,
      maxThemeDownloads,
      moderatorCount,
    ] = await Promise.all([
      prisma.communityPost.count({ where: { authorId: userId, status: 'published' } }),
      prisma.communityComment.count({ where: { authorId: userId, status: 'published' } }),
      prisma.communityPost.aggregate({
        where: { authorId: userId },
        _sum: { upvotes: true },
      }),
      prisma.communityComment.count({ where: { authorId: userId, isAcceptedAnswer: true } }),
      prisma.community.count({ where: { ownerId: userId } }),
      prisma.researchProject.count({ where: { leaderId: userId } }),
      prisma.researchContributor.count({ where: { userId } }),
      prisma.marketplaceTheme.count({ where: { authorId: userId, status: 'approved' } }),
      prisma.communityPost.findFirst({
        where: { authorId: userId },
        orderBy: { upvotes: 'desc' },
        select: { upvotes: true },
      }),
      prisma.marketplaceTheme.findFirst({
        where: { authorId: userId },
        orderBy: { downloadCount: 'desc' },
        select: { downloadCount: true },
      }),
      prisma.communityMember.count({ where: { userId, canModerate: true } }),
    ]);

    return {
      postCount,
      commentCount,
      receivedUpvotes: receivedUpvotes._sum.upvotes || 0,
      acceptedAnswers,
      createdCommunities,
      researchProjects,
      researchContributions,
      publishedThemes,
      maxPostUpvotes: maxPostUpvotes?.upvotes || 0,
      maxThemeDownloads: maxThemeDownloads?.downloadCount || 0,
      isModerator: moderatorCount > 0,
    };
  },

  /**
   * Obtener leaderboard
   */
  async getLeaderboard(timeRange: 'day' | 'week' | 'month' | 'all' = 'all', limit = 50) {
    const where: any = {};

    if (timeRange !== 'all') {
      const now = new Date();
      const ranges = { day: 1, week: 7, month: 30 };
      const days = ranges[timeRange];
      const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      where.updatedAt = { gte: since };
    }

    const leaders = await prisma.userReputation.findMany({
      where,
      orderBy: [
        { points: 'desc' },
        { level: 'desc' },
      ],
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        badges: {
          orderBy: { earnedAt: 'desc' },
          take: 5,
        },
      },
    });

    return leaders;
  },

  /**
   * Actualizar streak diario
   */
  async updateDailyStreak(userId: string) {
    const reputation = await this.getUserReputation(userId);
    const now = new Date();
    const lastActive = reputation.lastActiveDate;

    if (!lastActive) {
      // Primera actividad
      await prisma.userReputation.update({
        where: { userId },
        data: {
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: now,
        },
      });
      return 1;
    }

    const daysSinceLastActive = Math.floor(
      (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastActive === 0) {
      // Mismo día
      return reputation.currentStreak;
    } else if (daysSinceLastActive === 1) {
      // Día consecutivo
      const newStreak = reputation.currentStreak + 1;
      await prisma.userReputation.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, reputation.longestStreak),
          lastActiveDate: now,
        },
      });
      return newStreak;
    } else {
      // Streak roto
      await prisma.userReputation.update({
        where: { userId },
        data: {
          currentStreak: 1,
          lastActiveDate: now,
        },
      });
      return 1;
    }
  },

  /**
   * Otorgar puntos por acción
   */
  async awardPoints(userId: string, action: string) {
    const pointsByAction: Record<string, number> = {
      post_created: 5,
      post_upvoted: 2,
      post_viral: 50,
      comment_created: 2,
      comment_upvoted: 1,
      answer_accepted: 15,
      community_created: 20,
      theme_published: 10,
      theme_downloaded: 1,
      research_published: 25,
      event_won: 100,
      daily_login: 1,
    };

    const points = pointsByAction[action] || 0;
    if (points > 0) {
      await this.addPoints(userId, points, action);
    }

    return points;
  },
};
