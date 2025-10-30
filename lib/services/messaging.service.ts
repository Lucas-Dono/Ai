/**
 * Messaging Service - Sistema de mensajería directa
 */

import { prisma } from '@/lib/prisma';
import { NotificationService } from './notification.service';

export interface CreateConversationData {
  participants: string[]; // Array de user IDs
  title?: string;
}

export interface SendMessageData {
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: any;
}

export const MessagingService = {
  /**
   * Crear o obtener conversación
   */
  async getOrCreateConversation(userId: string, otherUserIds: string[], title?: string) {
    const allParticipants = [userId, ...otherUserIds].sort();

    // Buscar conversación existente con los mismos participantes
    const existing = await prisma.directConversation.findFirst({
      where: {
        participants: {
          every: {
            userId: { in: allParticipants },
          },
        },
        AND: [
          {
            participants: {
              some: { userId: allParticipants[0] },
            },
          },
          ...allParticipants.slice(1).map(id => ({
            participants: {
              some: { userId: id },
            },
          })),
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        lastMessage: true,
      },
    });

    if (existing) {
      return existing;
    }

    // Crear nueva conversación
    const conversation = await prisma.directConversation.create({
      data: {
        title,
        participants: {
          create: allParticipants.map(participantId => ({
            userId: participantId,
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return conversation;
  },

  /**
   * Enviar mensaje
   */
  async sendMessage(data: SendMessageData) {
    // Verificar que el sender es participante
    const participant = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "DirectConversation"
      WHERE id = ${data.conversationId}
      AND EXISTS (
        SELECT 1 FROM "_DirectConversationParticipants"
        WHERE "A" = ${data.conversationId}
        AND "B" = ${data.senderId}
      )
    `;

    if (!participant || participant.length === 0) {
      throw new Error('No eres participante de esta conversación');
    }

    // Crear mensaje
    const message = await prisma.directMessage.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
        attachments: data.attachments || {},
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Actualizar última actividad y último mensaje
    await prisma.directConversation.update({
      where: { id: data.conversationId },
      data: {
        lastMessageId: message.id,
        lastActivityAt: new Date(),
      },
    });

    // Incrementar contador de no leídos para otros participantes
    await prisma.$executeRaw`
      UPDATE "_DirectConversationParticipants" AS dcp
      SET "unreadCount" = COALESCE("unreadCount", 0) + 1
      WHERE dcp."A" = ${data.conversationId}
      AND dcp."B" != ${data.senderId}
    `;

    // Notificar a otros participantes
    const conversation = await prisma.directConversation.findUnique({
      where: { id: data.conversationId },
      include: {
        participants: {
          select: { userId: true },
        },
      },
    });

    const otherParticipants = conversation!.participants
      .filter(p => p.userId !== data.senderId)
      .map(p => p.userId);

    // Crear notificaciones
    await Promise.all(
      otherParticipants.map(recipientId =>
        NotificationService.notifyDirectMessage(
          data.conversationId,
          data.senderId,
          recipientId,
          data.content.substring(0, 100)
        )
      )
    );

    return message;
  },

  /**
   * Obtener mensajes de una conversación
   */
  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    // Verificar que el usuario es participante
    const participant = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "DirectConversation"
      WHERE id = ${conversationId}
      AND EXISTS (
        SELECT 1 FROM "_DirectConversationParticipants"
        WHERE "A" = ${conversationId}
        AND "B" = ${userId}
      )
    `;

    if (!participant || participant.length === 0) {
      throw new Error('No tienes acceso a esta conversación');
    }

    const [messages, total] = await Promise.all([
      prisma.directMessage.findMany({
        where: { conversationId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.directMessage.count({ where: { conversationId } }),
    ]);

    return {
      messages: messages.reverse(), // Invertir para mostrar en orden cronológico
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Obtener conversaciones del usuario
   */
  async getUserConversations(userId: string) {
    const conversations = await prisma.directConversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        lastMessage: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastActivityAt: 'desc',
      },
    });

    // Calcular unread count para cada conversación
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadResult = await prisma.$queryRaw<Array<{ unreadCount: number }>>`
          SELECT COALESCE("unreadCount", 0) as "unreadCount"
          FROM "_DirectConversationParticipants"
          WHERE "A" = ${conv.id}
          AND "B" = ${userId}
        `;

        return {
          ...conv,
          unreadCount: unreadResult[0]?.unreadCount || 0,
        };
      })
    );

    return conversationsWithUnread;
  },

  /**
   * Marcar conversación como leída
   */
  async markAsRead(conversationId: string, userId: string) {
    await prisma.$executeRaw`
      UPDATE "_DirectConversationParticipants"
      SET "unreadCount" = 0
      WHERE "A" = ${conversationId}
      AND "B" = ${userId}
    `;

    return { success: true };
  },

  /**
   * Eliminar mensaje
   */
  async deleteMessage(messageId: string, userId: string) {
    const message = await prisma.directMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Mensaje no encontrado');
    }

    if (message.senderId !== userId) {
      throw new Error('No tienes permisos para eliminar este mensaje');
    }

    await prisma.directMessage.delete({
      where: { id: messageId },
    });

    return { success: true };
  },

  /**
   * Buscar mensajes
   */
  async searchMessages(userId: string, query: string, limit = 20) {
    const messages = await prisma.directMessage.findMany({
      where: {
        content: {
          contains: query,
          mode: 'insensitive',
        },
        conversation: {
          participants: {
            some: {
              userId,
            },
          },
        },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return messages;
  },
};
