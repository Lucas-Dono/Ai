/**
 * Notification Service - Sistema de notificaciones
 */

import { prisma } from '@/lib/prisma';
import { PushNotificationServerService } from './push-notification-server.service';

export interface CreateNotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: any;
}

export const NotificationService = {
  /**
   * Crear notificación
   */
  async createNotification(data: CreateNotificationData) {
    const notification = await prisma.notification.create({
      data: {
        recipientId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        relatedId: (data.metadata as any)?.relatedId,
        relatedType: (data.metadata as any)?.relatedType,
        actorId: (data.metadata as any)?.actorId,
        actorName: (data.metadata as any)?.actorName,
        actorAvatar: (data.metadata as any)?.actorAvatar,
      },
    });

    // Enviar push notification si el usuario tiene tokens
    try {
      await PushNotificationServerService.sendToUser(data.userId, {
        title: data.title,
        body: data.message,
        data: {
          notificationId: notification.id,
          type: data.type,
          actionUrl: data.actionUrl,
          ...data.metadata,
        },
      });
    } catch (error) {
      console.error('Error enviando push notification:', error);
      // No fallar si la push notification falla
    }

    return notification;
  },

  /**
   * Crear notificación masiva
   */
  async createBulkNotifications(notifications: CreateNotificationData[]) {
    const created = await prisma.notification.createMany({
      data: notifications.map(n => ({
        recipientId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        actionUrl: n.actionUrl,
        relatedId: (n.metadata as any)?.relatedId,
        relatedType: (n.metadata as any)?.relatedType,
        actorId: (n.metadata as any)?.actorId,
        actorName: (n.metadata as any)?.actorName,
        actorAvatar: (n.metadata as any)?.actorAvatar,
      })),
    });

    return created;
  },

  /**
   * Obtener notificaciones del usuario
   */
  async getUserNotifications(userId: string, page = 1, limit = 50) {
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { recipientId: userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { recipientId: userId } }),
      prisma.notification.count({ where: { recipientId: userId, isRead: false } }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Marcar como leída
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.recipientId !== userId) {
      throw new Error('Notificación no encontrada');
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return updated;
  },

  /**
   * Marcar todas como leídas
   */
  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { success: true };
  },

  /**
   * Eliminar notificación
   */
  async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.recipientId !== userId) {
      throw new Error('Notificación no encontrada');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { success: true };
  },

  /**
   * Eliminar todas las notificaciones
   */
  async deleteAllNotifications(userId: string) {
    await prisma.notification.deleteMany({
      where: { recipientId: userId },
    });

    return { success: true };
  },

  /**
   * Obtener conteo de notificaciones no leídas
   */
  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });

    return { count };
  },

  /**
   * Notificaciones por tipo
   */

  // Nuevo post en comunidad seguida
  async notifyNewPostInCommunity(postId: string, communityId: string, authorId: string) {
    const members = await prisma.communityMember.findMany({
      where: {
        communityId,
        userId: { not: authorId }, // No notificar al autor
      },
      select: { userId: true },
    });

    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: { title: true },
    });

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { name: true },
    });

    const notifications = members.map(member => ({
      userId: member.userId,
      type: 'new_post',
      title: 'Nuevo post en ' + community?.name,
      message: post?.title || 'Nuevo post disponible',
      actionUrl: `/community/posts/${postId}`,
      metadata: { postId, communityId },
    }));

    if (notifications.length > 0) {
      await this.createBulkNotifications(notifications);
    }
  },

  // Nueva respuesta a tu post
  async notifyNewComment(commentId: string, postId: string, authorId: string) {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: { authorId: true, title: true },
    });

    if (!post || post.authorId === authorId) return; // No notificar al autor del comentario

    await this.createNotification({
      userId: post.authorId,
      type: 'new_comment',
      title: 'Nuevo comentario en tu post',
      message: `Alguien comentó en "${post.title}"`,
      actionUrl: `/community/posts/${postId}#comment-${commentId}`,
      metadata: { postId, commentId },
    });
  },

  // Nueva respuesta a tu comentario
  async notifyCommentReply(replyId: string, parentCommentId: string, authorId: string) {
    const parentComment = await prisma.communityComment.findUnique({
      where: { id: parentCommentId },
      select: { authorId: true, postId: true },
    });

    if (!parentComment || parentComment.authorId === authorId) return;

    await this.createNotification({
      userId: parentComment.authorId,
      type: 'comment_reply',
      title: 'Nueva respuesta a tu comentario',
      message: 'Alguien respondió a tu comentario',
      actionUrl: `/community/posts/${parentComment.postId}#comment-${replyId}`,
      metadata: { replyId, parentCommentId },
    });
  },

  // Upvote en tu post
  async notifyPostUpvote(postId: string, voterId: string) {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: { authorId: true, title: true, upvotes: true },
    });

    if (!post || post.authorId === voterId) return;

    // Solo notificar en milestones (10, 50, 100, 500, 1000)
    const milestones = [10, 50, 100, 500, 1000];
    if (milestones.includes(post.upvotes)) {
      await this.createNotification({
        userId: post.authorId,
        type: 'post_milestone',
        title: `¡${post.upvotes} upvotes!`,
        message: `Tu post "${post.title}" alcanzó ${post.upvotes} upvotes`,
        actionUrl: `/community/posts/${postId}`,
        metadata: { postId, upvotes: post.upvotes },
      });
    }
  },

  // Award recibido
  async notifyAward(postId: string, awardType: string, senderId: string) {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: { authorId: true, title: true },
    });

    if (!post || post.authorId === senderId) return;

    await this.createNotification({
      userId: post.authorId,
      type: 'award_received',
      title: '¡Recibiste un award!',
      message: `Tu post "${post.title}" recibió un award: ${awardType}`,
      actionUrl: `/community/posts/${postId}`,
      metadata: { postId, awardType },
    });
  },

  // Respuesta aceptada
  async notifyAnswerAccepted(commentId: string, postId: string) {
    const comment = await prisma.communityComment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });

    if (!comment) return;

    await this.createNotification({
      userId: comment.authorId,
      type: 'answer_accepted',
      title: '¡Tu respuesta fue aceptada!',
      message: 'El autor aceptó tu respuesta como la solución',
      actionUrl: `/community/posts/${postId}#comment-${commentId}`,
      metadata: { postId, commentId },
    });
  },

  // Nuevo seguidor
  async notifyNewFollower(followedId: string, followerId: string) {
    const follower = await prisma.user.findUnique({
      where: { id: followerId },
      select: { name: true },
    });

    await this.createNotification({
      userId: followedId,
      type: 'new_follower',
      title: 'Nuevo seguidor',
      message: `${follower?.name} comenzó a seguirte`,
      actionUrl: `/profile/${followerId}`,
      metadata: { followerId },
    });
  },

  // Invitación a evento
  async notifyEventInvitation(eventId: string, userId: string) {
    const event = await prisma.communityEvent.findUnique({
      where: { id: eventId },
      select: { title: true, startDate: true },
    });

    await this.createNotification({
      userId,
      type: 'event_invitation',
      title: 'Invitación a evento',
      message: `Fuiste invitado al evento: ${event?.title}`,
      actionUrl: `/community/events/${eventId}`,
      metadata: { eventId },
    });
  },

  // Recordatorio de evento
  async notifyEventReminder(eventId: string) {
    const event = await prisma.communityEvent.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          select: { userId: true },
        },
      },
    });

    if (!event) return;

    const notifications = event.registrations.map(reg => ({
      userId: reg.userId,
      type: 'event_reminder',
      title: 'Recordatorio de evento',
      message: `El evento "${event.title}" comienza pronto`,
      actionUrl: `/community/events/${eventId}`,
      metadata: { eventId },
    }));

    if (notifications.length > 0) {
      await this.createBulkNotifications(notifications);
    }
  },

  // Nuevo badge ganado
  async notifyBadgeEarned(userId: string, badgeName: string, badgeIcon: string) {
    await this.createNotification({
      userId,
      type: 'badge_earned',
      title: '¡Nuevo badge desbloqueado!',
      message: `Ganaste el badge: ${badgeIcon} ${badgeName}`,
      actionUrl: '/profile',
      metadata: { badgeName, badgeIcon },
    });
  },

  // Nivel alcanzado
  async notifyLevelUp(userId: string, newLevel: number) {
    await this.createNotification({
      userId,
      type: 'level_up',
      title: '¡Nivel alcanzado!',
      message: `Alcanzaste el nivel ${newLevel}`,
      actionUrl: '/profile',
      metadata: { level: newLevel },
    });
  },

  // Mensaje directo
  async notifyDirectMessage(conversationId: string, senderId: string, recipientId: string, preview: string) {
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true },
    });

    await this.createNotification({
      userId: recipientId,
      type: 'direct_message',
      title: `Mensaje de ${sender?.name}`,
      message: preview,
      actionUrl: `/messages/${conversationId}`,
      metadata: { conversationId, senderId },
    });
  },

  // Proyecto aceptado como colaborador
  async notifyProjectAccepted(projectId: string, userId: string, projectTitle: string) {
    await this.createNotification({
      userId,
      type: 'project_accepted',
      title: '¡Solicitud aceptada!',
      message: `Fuiste aceptado como colaborador en: ${projectTitle}`,
      actionUrl: `/research/projects/${projectId}`,
      metadata: { projectId },
    });
  },

  /**
   * Notificar a followers de un post sobre un nuevo comentario
   */
  async notifyPostFollowers(
    postId: string,
    postTitle: string,
    commentAuthorId: string,
    commentAuthorName: string,
    commentAuthorAvatar: string | null,
    commentContent: string
  ) {
    // Obtener followers del post
    const followers = await prisma.postFollower.findMany({
      where: {
        postId,
        notificationsEnabled: true,
        userId: { not: commentAuthorId } // Excluir al autor del comentario
      },
      select: {
        userId: true
      }
    });

    if (followers.length === 0) {
      return { count: 0 };
    }

    // Crear notificaciones para todos los followers
    const notifications = followers.map(follower => ({
      userId: follower.userId,
      type: 'followed_post_comment',
      title: 'Nuevo comentario en post que sigues',
      message: `${commentAuthorName} comentó en "${postTitle}": "${commentContent.substring(0, 80)}${commentContent.length > 80 ? '...' : ''}"`,
      actionUrl: `/community/post/${postId}`,
      metadata: {
        relatedId: postId,
        relatedType: 'post',
        actorId: commentAuthorId,
        actorName: commentAuthorName,
        actorAvatar: commentAuthorAvatar,
      },
    }));

    const result = await this.createBulkNotifications(notifications);

    return { count: result.count };
  },
};
