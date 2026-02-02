/**
 * Notification Service Tests
 * Tests: 12
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockPrismaClient, resetAllMocks } from '../../setup';

// Mock PushNotificationServerService
vi.mock('@/lib/services/push-notification-server.service', () => ({
  PushNotificationServerService: {
    sendToUser: vi.fn().mockResolvedValue({}),
  },
}));

// Override the global NotificationService mock with actual implementation for testing
vi.mock('@/lib/services/notification.service', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/services/notification.service')>();
  return mod;
});

// Import after mocking
const { NotificationService } = await import('@/lib/services/notification.service');

describe('NotificationService', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('createNotification', () => {
    it('should create a notification successfully', async () => {
      const mockNotification = {
        id: 'notif-1',
        recipientId: 'user-1',
        type: 'new_post',
        title: 'New Post',
        message: 'There is a new post',
        actionUrl: '/posts/123',
      };

      mockPrismaClient.notification.create = vi.fn().mockResolvedValue(mockNotification);

      const result = await NotificationService.createNotification({
        recipientId: 'user-1',
        type: 'new_post',
        title: 'New Post',
        message: 'There is a new post',
        actionUrl: '/posts/123',
      });

      expect(result).toEqual(mockNotification);
      expect(mockPrismaClient.notification.create).toHaveBeenCalled();
    });

    it('should not fail if push notification fails', async () => {
      mockPrismaClient.notification.create = vi.fn().mockResolvedValue({
        id: 'notif-1',
        recipientId: 'user-1',
      });

      const { PushNotificationServerService } = await import(
        '@/lib/services/push-notification-server.service'
      );
      vi.mocked(PushNotificationServerService.sendToUser).mockRejectedValueOnce(
        new Error('Push failed')
      );

      const result = await NotificationService.createNotification({
        recipientId: 'user-1',
        type: 'test',
        title: 'Test',
        message: 'Test',
      });

      expect(result).toBeDefined();
    });
  });

  describe('getUserNotifications', () => {
    it('should get paginated notifications with unread count', async () => {
      const mockNotifications = [
        { id: 'notif-1', title: 'Notification 1', isRead: false },
        { id: 'notif-2', title: 'Notification 2', isRead: true },
      ];

      mockPrismaClient.notification.findMany = vi.fn().mockResolvedValue(mockNotifications);
      mockPrismaClient.notification.count = vi.fn().mockResolvedValueOnce(2).mockResolvedValueOnce(1);

      const result = await NotificationService.getUserNotifications('user-1', 1, 50);

      expect(result.notifications).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.unreadCount).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockPrismaClient.notification.findUnique = vi.fn().mockResolvedValue({
        id: 'notif-1',
        recipientId: 'user-1',
        isRead: false,
      });
      mockPrismaClient.notification.update = vi.fn().mockResolvedValue({
        id: 'notif-1',
        isRead: true,
      });

      const result = await NotificationService.markAsRead('notif-1', 'user-1');

      expect(result.isRead).toBe(true);
    });

    it('should throw error if notification not found', async () => {
      mockPrismaClient.notification.findUnique = vi.fn().mockResolvedValue(null);

      await expect(NotificationService.markAsRead('notif-1', 'user-1')).rejects.toThrow(
        'Notificación no encontrada'
      );
    });

    it('should throw error if wrong user', async () => {
      mockPrismaClient.notification.findUnique = vi.fn().mockResolvedValue({
        id: 'notif-1',
        recipientId: 'user-2',
      });

      await expect(NotificationService.markAsRead('notif-1', 'user-1')).rejects.toThrow(
        'Notificación no encontrada'
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockPrismaClient.notification.updateMany = vi.fn().mockResolvedValue({ count: 5 });

      const result = await NotificationService.markAllAsRead('user-1');

      expect(result.success).toBe(true);
      expect(mockPrismaClient.notification.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            recipientId: 'user-1',
            isRead: false,
          }),
        })
      );
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      mockPrismaClient.notification.findUnique = vi.fn().mockResolvedValue({
        id: 'notif-1',
        recipientId: 'user-1',
      });
      mockPrismaClient.notification.delete = vi.fn().mockResolvedValue({});

      const result = await NotificationService.deleteNotification('notif-1', 'user-1');

      expect(result.success).toBe(true);
    });
  });

  describe('getUnreadCount', () => {
    it('should get unread count', async () => {
      mockPrismaClient.notification.count = vi.fn().mockResolvedValue(3);

      const result = await NotificationService.getUnreadCount('user-1');

      expect(result.count).toBe(3);
    });
  });

  describe('notifyNewComment', () => {
    it('should notify post author of new comment', async () => {
      mockPrismaClient.communityPost.findUnique = vi.fn().mockResolvedValue({
        id: 'post-1',
        authorId: 'user-1',
        title: 'Test Post',
      });
      mockPrismaClient.notification.create = vi.fn().mockResolvedValue({});

      await NotificationService.notifyNewComment('comment-1', 'post-1', 'user-2');

      expect(mockPrismaClient.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientId: 'user-1',
            type: 'new_comment',
          }),
        })
      );
    });

    it('should not notify if commenter is post author', async () => {
      mockPrismaClient.communityPost.findUnique = vi.fn().mockResolvedValue({
        id: 'post-1',
        authorId: 'user-1',
        title: 'Test Post',
      });

      await NotificationService.notifyNewComment('comment-1', 'post-1', 'user-1');

      expect(mockPrismaClient.notification.create).not.toHaveBeenCalled();
    });
  });

  describe('notifyBadgeEarned', () => {
    it('should notify user of new badge', async () => {
      mockPrismaClient.notification.create = vi.fn().mockResolvedValue({});

      await NotificationService.notifyBadgeEarned('user-1', 'First Post', '📝');

      expect(mockPrismaClient.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'badge_earned',
            title: '¡Nuevo badge desbloqueado!',
          }),
        })
      );
    });
  });

  describe('notifyLevelUp', () => {
    it('should notify user of level up', async () => {
      mockPrismaClient.notification.create = vi.fn().mockResolvedValue({});

      await NotificationService.notifyLevelUp('user-1', 5);

      expect(mockPrismaClient.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'level_up',
            message: 'Alcanzaste el nivel 5',
          }),
        })
      );
    });
  });

  describe('notifyDirectMessage', () => {
    it('should notify user of direct message', async () => {
      mockPrismaClient.user.findUnique = vi.fn().mockResolvedValue({
        id: 'user-2',
        name: 'Sender User',
      });
      mockPrismaClient.notification.create = vi.fn().mockResolvedValue({});

      await NotificationService.notifyDirectMessage('conv-1', 'user-2', 'user-1', 'Hello!');

      expect(mockPrismaClient.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientId: 'user-1',
            type: 'direct_message',
            message: 'Hello!',
          }),
        })
      );
    });
  });

  describe('notifyPostUpvote', () => {
    it('should notify at milestone upvotes', async () => {
      mockPrismaClient.communityPost.findUnique = vi.fn().mockResolvedValue({
        id: 'post-1',
        authorId: 'user-1',
        title: 'Great Post',
        upvotes: 100,
      });
      mockPrismaClient.notification.create = vi.fn().mockResolvedValue({});

      await NotificationService.notifyPostUpvote('post-1', 'user-2');

      expect(mockPrismaClient.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'post_milestone',
            title: '¡100 upvotes!',
          }),
        })
      );
    });

    it('should not notify at non-milestone upvotes', async () => {
      mockPrismaClient.communityPost.findUnique = vi.fn().mockResolvedValue({
        id: 'post-1',
        authorId: 'user-1',
        title: 'Great Post',
        upvotes: 75,
      });

      await NotificationService.notifyPostUpvote('post-1', 'user-2');

      expect(mockPrismaClient.notification.create).not.toHaveBeenCalled();
    });
  });
});
