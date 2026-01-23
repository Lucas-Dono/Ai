/**
 * Servicio de Emails para Posts Seguidos
 * Maneja el envío de notificaciones por email cuando hay actividad en posts seguidos
 */

import { nanoid } from "nanoid";
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { newCommentEmailTemplate, digestEmailTemplate, type NewCommentEmailData, type DigestEmailData } from '@/lib/email/templates/post-follow-templates';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export class PostFollowEmailService {
  /**
   * Enviar email de nuevo comentario a seguidores del post
   */
  static async notifyNewComment(
    postId: string,
    commentId: string,
    commentAuthorId: string
  ) {
    try {
      // Obtener información del post y comentario
      const [post, comment] = await Promise.all([
        prisma.communityPost.findUnique({
          where: { id: postId },
          include: {
            Community: {
              select: { name: true, slug: true }
            }
          }
        }),
        prisma.communityComment.findUnique({
          where: { id: commentId },
          include: {
            User: {
              select: { name: true }
            }
          }
        })
      ]);

      if (!post || !comment) {
        throw new Error('Post o comentario no encontrado');
      }

      // Obtener seguidores que tienen emails habilitados
      const followers = await prisma.postFollower.findMany({
        where: {
          postId,
          notificationsEnabled: true,
          userId: { not: commentAuthorId } // No notificar al autor del comentario
        },
        include: {
          User: {
            select: {
              id: true,
              email: true,
              name: true,
              EmailNotificationConfig: true
            }
          }
        }
      });

      // Enviar emails basados en la configuración de cada usuario
      const emailPromises = followers.map(async (follower) => {
        const config = follower.User.EmailNotificationConfig;

        // Verificar si el usuario quiere recibir notificaciones de nuevos comentarios
        if (!config?.newComments) {
          return null;
        }

        // Si la frecuencia es instant, enviar email inmediatamente
        if (config.frequency === 'instant') {
          const unsubscribeUrl = `${APP_URL}/community/post/${postId}?unfollow=true`;
          const postUrl = `${APP_URL}/community/post/${postId}#comment-${commentId}`;

          const emailData: NewCommentEmailData = {
            userName: follower.User.name || 'Usuario',
            postTitle: post.title,
            postUrl,
            commentAuthor: comment.User.name || 'Alguien',
            commentContent: comment.content,
            unsubscribeUrl
          };

          return sendEmail({
            to: follower.User.email,
            subject: `Nuevo comentario en "${post.title}"`,
            html: newCommentEmailTemplate(emailData)
          });
        }

        // Para daily/weekly, se acumularán en el digest
        return null;
      });

      const results = await Promise.allSettled(emailPromises.filter(p => p !== null));

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;

      return {
        success: true,
        sent: successCount,
        failed: failCount
      };

    } catch (error: any) {
      console.error('Error enviando emails de nuevo comentario:', error);
      throw error;
    }
  }

  /**
   * Generar y enviar digest diario para un usuario
   */
  static async sendDailyDigest(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          EmailNotificationConfig: true
        }
      });

      if (!user || !user.email) {
        throw new Error('Usuario no encontrado');
      }

      const config = user.EmailNotificationConfig;

      // Verificar si el usuario quiere recibir digests
      if (!config || config.frequency !== 'daily' || !config.digestSummary) {
        return { success: false, reason: 'Usuario no configurado para digests diarios' };
      }

      // Obtener actividad de las últimas 24 horas
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const activity = await this.getPostFollowActivity(userId, yesterday, new Date());

      if (activity.posts.length === 0) {
        return { success: false, reason: 'Sin actividad para reportar' };
      }

      // Enviar digest
      const emailData: DigestEmailData = {
        userName: user.name || 'Usuario',
        periodLabel: 'Hoy',
        posts: activity.posts.map(p => ({
          id: p.id,
          title: p.title,
          url: `${APP_URL}/community/post/${p.id}`,
          newCommentsCount: p.newCommentsCount,
          community: p.Community || undefined
        })),
        totalNewComments: activity.totalNewComments,
        unsubscribeUrl: `${APP_URL}/settings/notifications?unsubscribe=digest`,
        managePreferencesUrl: `${APP_URL}/community/following`
      };

      await sendEmail({
        to: user.email,
        subject: `Tu resumen diario de actividad en Blaniel`,
        html: digestEmailTemplate(emailData)
      });

      // Registrar digest enviado
      await prisma.postFollowDigest.create({
        data: {
          id: nanoid(),
          userId,
          type: 'daily',
          postIds: activity.posts.map(p => p.id),
          totalNewComments: activity.totalNewComments,
          totalNewReplies: 0, // TODO: Implementar tracking de replies
          postsCount: activity.posts.length,
          periodStart: yesterday,
          periodEnd: new Date()
        }
      });

      // Actualizar timestamp del último digest enviado
      await prisma.emailNotificationConfig.update({
        where: { userId },
        data: { lastDigestSentAt: new Date() }
      });

      return { success: true };

    } catch (error: any) {
      console.error('Error enviando digest diario:', error);
      throw error;
    }
  }

  /**
   * Generar y enviar digest semanal para un usuario
   */
  static async sendWeeklyDigest(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          EmailNotificationConfig: true
        }
      });

      if (!user || !user.email) {
        throw new Error('Usuario no encontrado');
      }

      const config = user.EmailNotificationConfig;

      // Verificar si el usuario quiere recibir digests
      if (!config || config.frequency !== 'weekly' || !config.digestSummary) {
        return { success: false, reason: 'Usuario no configurado para digests semanales' };
      }

      // Obtener actividad de los últimos 7 días
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const activity = await this.getPostFollowActivity(userId, lastWeek, new Date());

      if (activity.posts.length === 0) {
        return { success: false, reason: 'Sin actividad para reportar' };
      }

      // Enviar digest
      const emailData: DigestEmailData = {
        userName: user.name || 'Usuario',
        periodLabel: 'Esta Semana',
        posts: activity.posts.map(p => ({
          id: p.id,
          title: p.title,
          url: `${APP_URL}/community/post/${p.id}`,
          newCommentsCount: p.newCommentsCount,
          community: p.Community || undefined
        })),
        totalNewComments: activity.totalNewComments,
        unsubscribeUrl: `${APP_URL}/settings/notifications?unsubscribe=digest`,
        managePreferencesUrl: `${APP_URL}/community/following`
      };

      await sendEmail({
        to: user.email,
        subject: `Tu resumen semanal de actividad en Blaniel`,
        html: digestEmailTemplate(emailData)
      });

      // Registrar digest enviado
      await prisma.postFollowDigest.create({
        data: {
          id: nanoid(),
          userId,
          type: 'weekly',
          postIds: activity.posts.map(p => p.id),
          totalNewComments: activity.totalNewComments,
          totalNewReplies: 0,
          postsCount: activity.posts.length,
          periodStart: lastWeek,
          periodEnd: new Date()
        }
      });

      // Actualizar timestamp del último digest enviado
      await prisma.emailNotificationConfig.update({
        where: { userId },
        data: { lastDigestSentAt: new Date() }
      });

      return { success: true };

    } catch (error: any) {
      console.error('Error enviando digest semanal:', error);
      throw error;
    }
  }

  /**
   * Obtener actividad de posts seguidos en un período
   */
  private static async getPostFollowActivity(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    // Obtener posts seguidos
    const followedPosts = await prisma.postFollower.findMany({
      where: { userId },
      select: { postId: true }
    });

    const postIds = followedPosts.map(f => f.postId);

    if (postIds.length === 0) {
      return { posts: [], totalNewComments: 0 };
    }

    // Obtener comentarios nuevos en estos posts
    const newComments = await prisma.communityComment.findMany({
      where: {
        postId: { in: postIds },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        postId: true
      }
    });

    // Agrupar por post
    const commentsByPost = newComments.reduce((acc, comment) => {
      acc[comment.postId] = (acc[comment.postId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Obtener información de posts con actividad
    const postsWithActivity = await prisma.communityPost.findMany({
      where: {
        id: { in: Object.keys(commentsByPost) }
      },
      select: {
        id: true,
        title: true,
        Community: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    const posts = postsWithActivity.map(post => ({
      ...post,
      newCommentsCount: commentsByPost[post.id] || 0
    }));

    const totalNewComments = Object.values(commentsByPost).reduce((a, b) => a + b, 0);

    return {
      posts,
      totalNewComments
    };
  }

  /**
   * Obtener o crear configuración de email para un usuario
   */
  static async getOrCreateEmailConfig(userId: string) {
    let config = await prisma.emailNotificationConfig.findUnique({
      where: { userId }
    });

    if (!config) {
      config = await prisma.emailNotificationConfig.create({
        data: {
          id: nanoid(),
          updatedAt: new Date(),
          userId,
          frequency: 'instant',
          newComments: true,
          newReplies: true,
          postUpdates: true,
          digestSummary: true
        }
      });
    }

    return config;
  }

  /**
   * Actualizar configuración de email de un usuario
   */
  static async updateEmailConfig(
    userId: string,
    updates: {
      frequency?: 'instant' | 'daily' | 'weekly' | 'disabled';
      newComments?: boolean;
      newReplies?: boolean;
      postUpdates?: boolean;
      digestSummary?: boolean;
      digestDay?: string;
      digestTime?: string;
    }
  ) {
    // Asegurar que existe la configuración
    await this.getOrCreateEmailConfig(userId);

    const updated = await prisma.emailNotificationConfig.update({
      where: { userId },
      data: updates
    });

    return updated;
  }
}
