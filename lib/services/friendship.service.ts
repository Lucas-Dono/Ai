/**
 * Friendship Service - Sistema de amigos cercanos
 */

import { prisma } from '@/lib/prisma';
import { FriendshipStatus } from '@prisma/client';
import { NotificationService } from './notification.service';

export interface FriendshipWithUser {
  id: string;
  status: FriendshipStatus;
  createdAt: Date;
  respondedAt: Date | null;
  friend: {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
  };
}

export const FriendshipService = {
  /**
   * Verificar si dos usuarios son amigos
   */
  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId1, addresseeId: userId2, status: 'ACCEPTED' },
          { requesterId: userId2, addresseeId: userId1, status: 'ACCEPTED' },
        ],
      },
    });
    return !!friendship;
  },

  /**
   * Obtener el estado de amistad entre dos usuarios
   */
  async getFriendshipStatus(
    currentUserId: string,
    targetUserId: string
  ): Promise<{
    status: 'none' | 'friends' | 'pending_sent' | 'pending_received' | 'blocked' | 'blocked_by';
    friendshipId: string | null;
  }> {
    // Verificar si el usuario actual envió solicitud
    const sentRequest = await prisma.friendship.findUnique({
      where: {
        requesterId_addresseeId: {
          requesterId: currentUserId,
          addresseeId: targetUserId,
        },
      },
    });

    if (sentRequest) {
      if (sentRequest.status === 'ACCEPTED') {
        return { status: 'friends', friendshipId: sentRequest.id };
      }
      if (sentRequest.status === 'PENDING') {
        return { status: 'pending_sent', friendshipId: sentRequest.id };
      }
      if (sentRequest.status === 'BLOCKED') {
        return { status: 'blocked', friendshipId: sentRequest.id };
      }
    }

    // Verificar si el usuario actual recibió solicitud
    const receivedRequest = await prisma.friendship.findUnique({
      where: {
        requesterId_addresseeId: {
          requesterId: targetUserId,
          addresseeId: currentUserId,
        },
      },
    });

    if (receivedRequest) {
      if (receivedRequest.status === 'ACCEPTED') {
        return { status: 'friends', friendshipId: receivedRequest.id };
      }
      if (receivedRequest.status === 'PENDING') {
        return { status: 'pending_received', friendshipId: receivedRequest.id };
      }
      if (receivedRequest.status === 'BLOCKED') {
        return { status: 'blocked_by', friendshipId: receivedRequest.id };
      }
    }

    return { status: 'none', friendshipId: null };
  },

  /**
   * Enviar solicitud de amistad
   */
  async sendFriendRequest(requesterId: string, addresseeId: string): Promise<{
    success: boolean;
    error?: string;
    friendship?: any;
  }> {
    // Verificar que no sea auto-solicitud
    if (requesterId === addresseeId) {
      return { success: false, error: 'No puedes enviarte una solicitud a ti mismo' };
    }

    // Verificar si ya existe una relación
    const existingStatus = await this.getFriendshipStatus(requesterId, addresseeId);

    if (existingStatus.status === 'friends') {
      return { success: false, error: 'Ya son amigos' };
    }
    if (existingStatus.status === 'pending_sent') {
      return { success: false, error: 'Ya enviaste una solicitud' };
    }
    if (existingStatus.status === 'pending_received') {
      return { success: false, error: 'Ya tienes una solicitud pendiente de este usuario' };
    }
    if (existingStatus.status === 'blocked' || existingStatus.status === 'blocked_by') {
      return { success: false, error: 'No se puede enviar solicitud' };
    }

    // Verificar que el usuario existe
    const addressee = await prisma.user.findUnique({
      where: { id: addresseeId },
      select: { id: true, name: true },
    });

    if (!addressee) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // Crear la solicitud
    const friendship = await prisma.friendship.create({
      data: {
        requesterId,
        addresseeId,
        status: 'PENDING',
      },
      include: {
        requester: {
          select: { id: true, name: true, image: true },
        },
        addressee: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Enviar notificación
    try {
      await NotificationService.createNotification({
        userId: addresseeId,
        type: 'friend_request',
        title: 'Nueva solicitud de amistad',
        message: `${friendship.requester.name || 'Alguien'} quiere ser tu amigo`,
        actionUrl: '/friends?tab=requests',
        metadata: {
          actorId: requesterId,
          actorName: friendship.requester.name,
          actorAvatar: friendship.requester.image,
          relatedId: friendship.id,
          relatedType: 'friendship',
        },
      });
    } catch (error) {
      console.error('Error enviando notificación de solicitud:', error);
    }

    return { success: true, friendship };
  },

  /**
   * Aceptar solicitud de amistad
   */
  async acceptFriendRequest(friendshipId: string, userId: string): Promise<{
    success: boolean;
    error?: string;
    friendship?: any;
  }> {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
      include: {
        requester: { select: { id: true, name: true, image: true } },
        addressee: { select: { id: true, name: true, image: true } },
      },
    });

    if (!friendship) {
      return { success: false, error: 'Solicitud no encontrada' };
    }

    // Solo el destinatario puede aceptar
    if (friendship.addresseeId !== userId) {
      return { success: false, error: 'No tienes permiso para aceptar esta solicitud' };
    }

    if (friendship.status !== 'PENDING') {
      return { success: false, error: 'Esta solicitud ya fue procesada' };
    }

    const updated = await prisma.friendship.update({
      where: { id: friendshipId },
      data: {
        status: 'ACCEPTED',
        respondedAt: new Date(),
      },
      include: {
        requester: { select: { id: true, name: true, image: true } },
        addressee: { select: { id: true, name: true, image: true } },
      },
    });

    // Notificar al solicitante
    try {
      await NotificationService.createNotification({
        userId: friendship.requesterId,
        type: 'friend_request_accepted',
        title: 'Solicitud aceptada',
        message: `${friendship.addressee.name || 'Alguien'} aceptó tu solicitud de amistad`,
        actionUrl: `/profile/${friendship.addresseeId}`,
        metadata: {
          actorId: friendship.addresseeId,
          actorName: friendship.addressee.name,
          actorAvatar: friendship.addressee.image,
          relatedId: friendship.id,
          relatedType: 'friendship',
        },
      });
    } catch (error) {
      console.error('Error enviando notificación:', error);
    }

    return { success: true, friendship: updated };
  },

  /**
   * Rechazar solicitud de amistad
   */
  async declineFriendRequest(friendshipId: string, userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return { success: false, error: 'Solicitud no encontrada' };
    }

    // Solo el destinatario puede rechazar
    if (friendship.addresseeId !== userId) {
      return { success: false, error: 'No tienes permiso para rechazar esta solicitud' };
    }

    if (friendship.status !== 'PENDING') {
      return { success: false, error: 'Esta solicitud ya fue procesada' };
    }

    await prisma.friendship.update({
      where: { id: friendshipId },
      data: {
        status: 'DECLINED',
        respondedAt: new Date(),
      },
    });

    return { success: true };
  },

  /**
   * Cancelar solicitud de amistad (enviada por mí)
   */
  async cancelFriendRequest(friendshipId: string, userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return { success: false, error: 'Solicitud no encontrada' };
    }

    // Solo el solicitante puede cancelar
    if (friendship.requesterId !== userId) {
      return { success: false, error: 'No tienes permiso para cancelar esta solicitud' };
    }

    if (friendship.status !== 'PENDING') {
      return { success: false, error: 'Esta solicitud ya fue procesada' };
    }

    await prisma.friendship.delete({
      where: { id: friendshipId },
    });

    return { success: true };
  },

  /**
   * Eliminar amistad
   */
  async removeFriend(friendshipId: string, userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return { success: false, error: 'Amistad no encontrada' };
    }

    // Cualquiera de los dos puede eliminar la amistad
    if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
      return { success: false, error: 'No tienes permiso para eliminar esta amistad' };
    }

    if (friendship.status !== 'ACCEPTED') {
      return { success: false, error: 'No son amigos' };
    }

    await prisma.friendship.delete({
      where: { id: friendshipId },
    });

    return { success: true };
  },

  /**
   * Bloquear usuario
   */
  async blockUser(blockerId: string, blockedId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (blockerId === blockedId) {
      return { success: false, error: 'No puedes bloquearte a ti mismo' };
    }

    // Buscar cualquier relación existente
    const existingSent = await prisma.friendship.findUnique({
      where: {
        requesterId_addresseeId: {
          requesterId: blockerId,
          addresseeId: blockedId,
        },
      },
    });

    const existingReceived = await prisma.friendship.findUnique({
      where: {
        requesterId_addresseeId: {
          requesterId: blockedId,
          addresseeId: blockerId,
        },
      },
    });

    // Eliminar relación existente si hay
    if (existingReceived) {
      await prisma.friendship.delete({
        where: { id: existingReceived.id },
      });
    }

    if (existingSent) {
      // Actualizar a bloqueado
      await prisma.friendship.update({
        where: { id: existingSent.id },
        data: { status: 'BLOCKED' },
      });
    } else {
      // Crear nueva relación de bloqueo
      await prisma.friendship.create({
        data: {
          requesterId: blockerId,
          addresseeId: blockedId,
          status: 'BLOCKED',
        },
      });
    }

    return { success: true };
  },

  /**
   * Desbloquear usuario
   */
  async unblockUser(blockerId: string, blockedId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    const block = await prisma.friendship.findUnique({
      where: {
        requesterId_addresseeId: {
          requesterId: blockerId,
          addresseeId: blockedId,
        },
      },
    });

    if (!block || block.status !== 'BLOCKED') {
      return { success: false, error: 'Usuario no bloqueado' };
    }

    await prisma.friendship.delete({
      where: { id: block.id },
    });

    return { success: true };
  },

  /**
   * Obtener lista de amigos
   */
  async getFriends(
    userId: string,
    options: { page?: number; limit?: number; search?: string } = {}
  ): Promise<{
    friends: FriendshipWithUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, search } = options;

    const where = {
      OR: [
        { requesterId: userId, status: 'ACCEPTED' as FriendshipStatus },
        { addresseeId: userId, status: 'ACCEPTED' as FriendshipStatus },
      ],
    };

    const [friendships, total] = await Promise.all([
      prisma.friendship.findMany({
        where,
        include: {
          requester: { select: { id: true, name: true, image: true, email: true } },
          addressee: { select: { id: true, name: true, image: true, email: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { respondedAt: 'desc' },
      }),
      prisma.friendship.count({ where }),
    ]);

    // Mapear para obtener el amigo (el otro usuario)
    let friends = friendships.map((f) => {
      const friend = f.requesterId === userId ? f.addressee : f.requester;
      return {
        id: f.id,
        status: f.status,
        createdAt: f.createdAt,
        respondedAt: f.respondedAt,
        friend,
      };
    });

    // Filtrar por búsqueda si se proporciona
    if (search) {
      const searchLower = search.toLowerCase();
      friends = friends.filter(
        (f) =>
          f.friend.name?.toLowerCase().includes(searchLower) ||
          f.friend.email.toLowerCase().includes(searchLower)
      );
    }

    return {
      friends,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Obtener solicitudes pendientes recibidas
   */
  async getPendingRequests(
    userId: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<{
    requests: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20 } = options;

    const where = {
      addresseeId: userId,
      status: 'PENDING' as FriendshipStatus,
    };

    const [requests, total] = await Promise.all([
      prisma.friendship.findMany({
        where,
        include: {
          requester: { select: { id: true, name: true, image: true, email: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.friendship.count({ where }),
    ]);

    return {
      requests: requests.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        user: r.requester,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Obtener solicitudes pendientes enviadas
   */
  async getSentRequests(
    userId: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<{
    requests: any[];
    total: number;
  }> {
    const { page = 1, limit = 20 } = options;

    const where = {
      requesterId: userId,
      status: 'PENDING' as FriendshipStatus,
    };

    const [requests, total] = await Promise.all([
      prisma.friendship.findMany({
        where,
        include: {
          addressee: { select: { id: true, name: true, image: true, email: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.friendship.count({ where }),
    ]);

    return {
      requests: requests.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        user: r.addressee,
      })),
      total,
    };
  },

  /**
   * Obtener usuarios bloqueados
   */
  async getBlockedUsers(userId: string): Promise<any[]> {
    const blocked = await prisma.friendship.findMany({
      where: {
        requesterId: userId,
        status: 'BLOCKED',
      },
      include: {
        addressee: { select: { id: true, name: true, image: true } },
      },
    });

    return blocked.map((b) => ({
      id: b.id,
      user: b.addressee,
      blockedAt: b.updatedAt,
    }));
  },

  /**
   * Contar solicitudes pendientes (para badge)
   */
  async getPendingRequestsCount(userId: string): Promise<number> {
    return prisma.friendship.count({
      where: {
        addresseeId: userId,
        status: 'PENDING',
      },
    });
  },
};
