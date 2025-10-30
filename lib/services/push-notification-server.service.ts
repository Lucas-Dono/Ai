/**
 * Push Notification Server Service - Envío de notificaciones push desde el servidor
 */

import { prisma } from '@/lib/prisma';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

// Crear instancia de Expo SDK
const expo = new Expo();

export interface PushToken {
  userId: string;
  token: string;
  platform: 'ios' | 'android';
  deviceId: string;
}

export const PushNotificationServerService = {
  /**
   * Registrar token de push
   */
  async registerToken(userId: string, token: string, platform: 'ios' | 'android', deviceId: string) {
    // Verificar que el token sea válido
    if (!Expo.isExpoPushToken(token)) {
      throw new Error('Token de push inválido');
    }

    // Guardar o actualizar token en la base de datos
    // Nota: Necesitarás agregar un modelo PushToken al schema de Prisma
    await prisma.$executeRaw`
      INSERT INTO "PushToken" ("userId", token, platform, "deviceId", "createdAt", "updatedAt")
      VALUES (${userId}, ${token}, ${platform}, ${deviceId}, NOW(), NOW())
      ON CONFLICT (token)
      DO UPDATE SET "userId" = ${userId}, platform = ${platform}, "deviceId" = ${deviceId}, "updatedAt" = NOW()
    `;

    return { success: true };
  },

  /**
   * Eliminar token
   */
  async removeToken(token: string) {
    await prisma.$executeRaw`
      DELETE FROM "PushToken" WHERE token = ${token}
    `;
    return { success: true };
  },

  /**
   * Obtener tokens de un usuario
   */
  async getUserTokens(userId: string): Promise<string[]> {
    const result = await prisma.$queryRaw<Array<{ token: string }>>`
      SELECT token FROM "PushToken" WHERE "userId" = ${userId}
    `;
    return result.map(r => r.token);
  },

  /**
   * Enviar notificación push a un usuario
   */
  async sendToUser(userId: string, notification: {
    title: string;
    body: string;
    data?: any;
    sound?: string;
    badge?: number;
  }) {
    const tokens = await this.getUserTokens(userId);

    if (tokens.length === 0) {
      console.log(`Usuario ${userId} no tiene tokens de push registrados`);
      return { success: false, reason: 'no_tokens' };
    }

    return await this.sendToTokens(tokens, notification);
  },

  /**
   * Enviar notificación a múltiples tokens
   */
  async sendToTokens(tokens: string[], notification: {
    title: string;
    body: string;
    data?: any;
    sound?: string;
    badge?: number;
    priority?: 'default' | 'normal' | 'high';
  }) {
    // Filtrar tokens válidos
    const validTokens = tokens.filter(token => Expo.isExpoPushToken(token));

    if (validTokens.length === 0) {
      return { success: false, reason: 'no_valid_tokens' };
    }

    // Crear mensajes
    const messages: ExpoPushMessage[] = validTokens.map(token => ({
      to: token,
      sound: notification.sound || 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      badge: notification.badge,
      priority: notification.priority || 'high',
    }));

    // Dividir en chunks (Expo requiere máximo 100 mensajes por request)
    const chunks = expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    try {
      for (const chunk of chunks) {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }

      // Verificar errores
      const errors = tickets.filter(ticket => ticket.status === 'error');
      if (errors.length > 0) {
        console.error('Errores enviando notificaciones:', errors);
      }

      return {
        success: true,
        sent: tickets.length,
        errors: errors.length,
        tickets,
      };
    } catch (error) {
      console.error('Error enviando push notifications:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Enviar notificación a múltiples usuarios
   */
  async sendToUsers(userIds: string[], notification: {
    title: string;
    body: string;
    data?: any;
    sound?: string;
    badge?: number;
  }) {
    const results = await Promise.all(
      userIds.map(userId => this.sendToUser(userId, notification))
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;

    return {
      success: true,
      total: results.length,
      successful,
      failed,
    };
  },

  /**
   * Verificar receipts de notificaciones enviadas
   * (Para saber si fueron entregadas/leídas)
   */
  async checkReceipts(receiptIds: string[]) {
    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    const receipts = [];

    for (const chunk of receiptIdChunks) {
      try {
        const receiptChunk = await expo.getPushNotificationReceiptsAsync(chunk);
        receipts.push(receiptChunk);
      } catch (error) {
        console.error('Error obteniendo receipts:', error);
      }
    }

    return receipts;
  },
};
