/**
 * Messaging Service - Sistema de mensajería directa
 */

import { nanoid } from "nanoid";
import { prisma } from '@/lib/prisma';

export interface CreateConversationData {
  participants: string[]; // Array de user IDs
  type?: 'direct' | 'group';
  name?: string;
  icon?: string;
}

export interface SendMessageData {
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  contentType?: string;
  attachmentUrl?: string;
  sharedItemId?: string;
  sharedItemType?: string;
}

export const MessagingService = {
  /**
   * Crear o obtener conversación
   */
  async getOrCreateConversation(
    userId: string,
    otherUserIds: string[],
    options?: { name?: string; icon?: string; type?: 'direct' | 'group' }
  ) {
    const allParticipants = [userId, ...otherUserIds].sort();
    const type = options?.type || (allParticipants.length === 2 ? 'direct' : 'group');

    // Para conversaciones 1-on-1, buscar existente
    if (type === 'direct' && allParticipants.length === 2) {
      // Find all direct conversations and filter in memory
      // (JSON hasEvery operator is not supported)
      const conversations = await prisma.directConversation.findMany({
        where: {
          type: 'direct',
        },
        include: {
          DirectMessage: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      const existing = conversations.find(conv => {
        const participants = conv.participants as string[];
        return participants.length === 2 &&
               allParticipants.every(p => participants.includes(p));
      });

      if (existing) {
        return existing;
      }
    }

    // Crear nueva conversación
    const conversation = await prisma.directConversation.create({
      data: {
        id: nanoid(),
        updatedAt: new Date(),
        type,
        name: options?.name,
        icon: options?.icon,
        participants: allParticipants,
        lastMessageAt: new Date(),
      },
      include: {
        DirectMessage: true,
      },
    });

    return conversation;
  },

  /**
   * Enviar mensaje
   */
  async sendMessage(data: SendMessageData) {
    // Verificar que la conversación existe y el sender es participante
    const conversation = await prisma.directConversation.findUnique({
      where: { id: data.conversationId },
    });

    if (!conversation) {
      throw new Error('Conversación no encontrada');
    }

    const participants = conversation.participants as string[];
    if (!participants.includes(data.senderId)) {
      throw new Error('No eres participante de esta conversación');
    }

    // Crear mensaje
    const message = await prisma.directMessage.create({
      data: {
        id: nanoid(),
        updatedAt: new Date(),
        conversationId: data.conversationId,
        senderId: data.senderId,
        recipientId: data.recipientId,
        content: data.content,
        contentType: data.contentType || 'text',
        attachmentUrl: data.attachmentUrl,
        sharedItemId: data.sharedItemId,
        sharedItemType: data.sharedItemType,
      },
    });

    // Actualizar conversación
    await prisma.directConversation.update({
      where: { id: data.conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: data.content.substring(0, 100),
      },
    });

    return message;
  },

  /**
   * Obtener mensajes de una conversación
   */
  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    // Verificar que el usuario es participante
    const conversation = await prisma.directConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversación no encontrada');
    }

    const participants = conversation.participants as string[];
    if (!participants.includes(userId)) {
      throw new Error('No tienes acceso a esta conversación');
    }

    const [messages, total] = await Promise.all([
      prisma.directMessage.findMany({
        where: {
          conversationId,
          isDeleted: false,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.directMessage.count({
        where: {
          conversationId,
          isDeleted: false,
        },
      }),
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
    // Get all conversations and filter in memory
    // (JSON has operator is not supported)
    const allConversations = await prisma.directConversation.findMany({
      include: {
        DirectMessage: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          where: {
            isDeleted: false,
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    const conversations = allConversations.filter(conv => {
      const participants = conv.participants as string[];
      return participants.includes(userId);
    });

    // Calcular mensajes no leídos para cada conversación
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.directMessage.count({
          where: {
            conversationId: conv.id,
            recipientId: userId,
            isRead: false,
            isDeleted: false,
          },
        });

        return {
          ...conv,
          unreadCount,
        };
      })
    );

    return conversationsWithUnread;
  },

  /**
   * Marcar mensajes como leídos
   */
  async markAsRead(conversationId: string, userId: string) {
    // Verificar que el usuario es participante
    const conversation = await prisma.directConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversación no encontrada');
    }

    const participants = conversation.participants as string[];
    if (!participants.includes(userId)) {
      throw new Error('No tienes acceso a esta conversación');
    }

    // Marcar mensajes como leídos
    await prisma.directMessage.updateMany({
      where: {
        conversationId,
        recipientId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true };
  },

  /**
   * Editar mensaje
   */
  async editMessage(messageId: string, userId: string, newContent: string) {
    const message = await prisma.directMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Mensaje no encontrado');
    }

    if (message.senderId !== userId) {
      throw new Error('No tienes permisos para editar este mensaje');
    }

    const updated = await prisma.directMessage.update({
      where: { id: messageId },
      data: {
        content: newContent,
        isEdited: true,
      },
    });

    return updated;
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

    // Soft delete
    await prisma.directMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        content: '[Mensaje eliminado]',
      },
    });

    return { success: true };
  },

  /**
   * Actualizar configuración de conversación
   */
  async updateConversation(
    conversationId: string,
    userId: string,
    data: { isMuted?: boolean; isArchived?: boolean; name?: string; icon?: string }
  ) {
    // Verificar que el usuario es participante
    const conversation = await prisma.directConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversación no encontrada');
    }

    const participants = conversation.participants as string[];
    if (!participants.includes(userId)) {
      throw new Error('No tienes acceso a esta conversación');
    }

    const updated = await prisma.directConversation.update({
      where: { id: conversationId },
      data,
    });

    return updated;
  },

  /**
   * Eliminar conversación
   */
  async deleteConversation(conversationId: string, userId: string) {
    // Verificar que el usuario es participante
    const conversation = await prisma.directConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversación no encontrada');
    }

    const participants = conversation.participants as string[];
    if (!participants.includes(userId)) {
      throw new Error('No tienes acceso a esta conversación');
    }

    // Eliminar todos los mensajes y la conversación
    await prisma.directMessage.deleteMany({
      where: { conversationId },
    });

    await prisma.directConversation.delete({
      where: { id: conversationId },
    });

    return { success: true };
  },

  /**
   * Buscar mensajes
   */
  async searchMessages(userId: string, query: string, limit = 20) {
    // Obtener IDs de conversaciones del usuario
    // (JSON has operator is not supported)
    const allConversations = await prisma.directConversation.findMany({
      select: { id: true, participants: true },
    });

    const conversationIds = allConversations
      .filter(conv => {
        const participants = conv.participants as string[];
        return participants.includes(userId);
      })
      .map(c => c.id);

    const messages = await prisma.directMessage.findMany({
      where: {
        conversationId: { in: conversationIds },
        content: {
          contains: query,
          mode: 'insensitive',
        },
        isDeleted: false,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        DirectConversation: true,
      },
    });

    return messages;
  },
};
