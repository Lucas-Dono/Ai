/**
 * Messaging Service Tests
 * Tests: 15
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MessagingService } from '@/lib/services/messaging.service';
import { mockPrismaClient, resetAllMocks } from '../../setup';

describe('MessagingService', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('getOrCreateConversation', () => {
    it('should return existing 1-on-1 conversation', async () => {
      const mockConversation = {
        id: 'conv-1',
        type: 'direct',
        participants: ['user-1', 'user-2'],
        DirectMessage: [],
      };

      // Service uses findMany + filter, not findFirst
      mockPrismaClient.directConversation.findMany = vi.fn().mockResolvedValue([mockConversation]);

      const result = await MessagingService.getOrCreateConversation('user-1', ['user-2']);

      expect(result).toEqual(mockConversation);
      expect(mockPrismaClient.directConversation.create).not.toHaveBeenCalled();
    });

    it('should create new conversation if not exists', async () => {
      const mockConversation = {
        id: 'conv-1',
        type: 'direct',
        participants: ['user-1', 'user-2'],
        DirectMessage: [],
      };

      // Service uses findMany + filter, not findFirst
      mockPrismaClient.directConversation.findMany = vi.fn().mockResolvedValue([]);
      mockPrismaClient.directConversation.create = vi.fn().mockResolvedValue(mockConversation);

      const result = await MessagingService.getOrCreateConversation('user-1', ['user-2']);

      expect(result).toEqual(mockConversation);
      expect(mockPrismaClient.directConversation.create).toHaveBeenCalled();
    });

    it('should create group conversation for 3+ users', async () => {
      const mockConversation = {
        id: 'conv-1',
        type: 'group',
        participants: ['user-1', 'user-2', 'user-3'],
        DirectMessage: [],
      };

      mockPrismaClient.directConversation.create = vi.fn().mockResolvedValue(mockConversation);

      const result = await MessagingService.getOrCreateConversation('user-1', ['user-2', 'user-3'], {
        type: 'group',
        name: 'Test Group',
      });

      expect(result.type).toBe('group');
      expect(result.participants).toHaveLength(3);
    });
  });

  describe('sendMessage', () => {
    it('should send message in conversation', async () => {
      const mockMessage = {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        recipientId: 'user-2',
        content: 'Hello!',
        contentType: 'text',
      };

      mockPrismaClient.directConversation.findUnique = vi.fn().mockResolvedValue({
        id: 'conv-1',
        participants: ['user-1', 'user-2'],
      });
      mockPrismaClient.directMessage.create = vi.fn().mockResolvedValue(mockMessage);
      mockPrismaClient.directConversation.update = vi.fn().mockResolvedValue({});

      const result = await MessagingService.sendMessage({
        conversationId: 'conv-1',
        senderId: 'user-1',
        recipientId: 'user-2',
        content: 'Hello!',
      });

      expect(result).toEqual(mockMessage);
      expect(mockPrismaClient.directConversation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            lastMessagePreview: 'Hello!',
          }),
        })
      );
    });

    it('should throw error if sender not participant', async () => {
      mockPrismaClient.directConversation.findUnique = vi.fn().mockResolvedValue({
        id: 'conv-1',
        participants: ['user-2', 'user-3'],
      });

      await expect(
        MessagingService.sendMessage({
          conversationId: 'conv-1',
          senderId: 'user-1',
          recipientId: 'user-2',
          content: 'Hello!',
        })
      ).rejects.toThrow('No eres participante de esta conversación');
    });

    it('should throw error if conversation not found', async () => {
      mockPrismaClient.directConversation.findUnique = vi.fn().mockResolvedValue(null);

      await expect(
        MessagingService.sendMessage({
          conversationId: 'conv-1',
          senderId: 'user-1',
          recipientId: 'user-2',
          content: 'Hello!',
        })
      ).rejects.toThrow('Conversación no encontrada');
    });
  });

  describe('getMessages', () => {
    it('should get paginated messages', async () => {
      const mockMessages = [
        { id: 'msg-1', content: 'Hello', createdAt: new Date() },
        { id: 'msg-2', content: 'Hi', createdAt: new Date() },
      ];

      mockPrismaClient.directConversation.findUnique = vi.fn().mockResolvedValue({
        id: 'conv-1',
        participants: ['user-1', 'user-2'],
      });
      mockPrismaClient.directMessage.findMany = vi.fn().mockResolvedValue(mockMessages);
      mockPrismaClient.directMessage.count = vi.fn().mockResolvedValue(2);

      const result = await MessagingService.getMessages('conv-1', 'user-1', 1, 50);

      expect(result.messages).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should throw error if user not participant', async () => {
      mockPrismaClient.directConversation.findUnique = vi.fn().mockResolvedValue({
        id: 'conv-1',
        participants: ['user-2', 'user-3'],
      });

      await expect(MessagingService.getMessages('conv-1', 'user-1')).rejects.toThrow(
        'No tienes acceso a esta conversación'
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark messages as read', async () => {
      mockPrismaClient.directConversation.findUnique = vi.fn().mockResolvedValue({
        id: 'conv-1',
        participants: ['user-1', 'user-2'],
      });
      mockPrismaClient.directMessage.updateMany = vi.fn().mockResolvedValue({ count: 3 });

      const result = await MessagingService.markAsRead('conv-1', 'user-1');

      expect(result.success).toBe(true);
      expect(mockPrismaClient.directMessage.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            recipientId: 'user-1',
            isRead: false,
          }),
          data: expect.objectContaining({
            isRead: true,
          }),
        })
      );
    });
  });

  describe('getUserConversations', () => {
    it('should get user conversations with unread counts', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          participants: ['user-1', 'user-2'],
          DirectMessage: [{ id: 'msg-1', content: 'Hello' }],
        },
      ];

      mockPrismaClient.directConversation.findMany = vi.fn().mockResolvedValue(mockConversations);
      mockPrismaClient.directMessage.count = vi.fn().mockResolvedValue(2);

      const result = await MessagingService.getUserConversations('user-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('unreadCount', 2);
    });
  });

  describe('deleteMessage', () => {
    it('should soft delete message as sender', async () => {
      mockPrismaClient.directMessage.findUnique = vi.fn().mockResolvedValue({
        id: 'msg-1',
        senderId: 'user-1',
      });
      mockPrismaClient.directMessage.update = vi.fn().mockResolvedValue({});

      const result = await MessagingService.deleteMessage('msg-1', 'user-1');

      expect(result.success).toBe(true);
      expect(mockPrismaClient.directMessage.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isDeleted: true,
            content: '[Mensaje eliminado]',
          }),
        })
      );
    });

    it('should throw error if not sender', async () => {
      mockPrismaClient.directMessage.findUnique = vi.fn().mockResolvedValue({
        id: 'msg-1',
        senderId: 'user-2',
      });

      await expect(MessagingService.deleteMessage('msg-1', 'user-1')).rejects.toThrow(
        'No tienes permisos para eliminar este mensaje'
      );
    });
  });

  describe('editMessage', () => {
    it('should edit message as sender', async () => {
      mockPrismaClient.directMessage.findUnique = vi.fn().mockResolvedValue({
        id: 'msg-1',
        senderId: 'user-1',
        content: 'Original',
      });
      mockPrismaClient.directMessage.update = vi.fn().mockResolvedValue({
        id: 'msg-1',
        content: 'Edited',
        isEdited: true,
      });

      const result = await MessagingService.editMessage('msg-1', 'user-1', 'Edited');

      expect(result.content).toBe('Edited');
      expect(result.isEdited).toBe(true);
    });
  });

  describe('searchMessages', () => {
    it('should search messages in user conversations', async () => {
      mockPrismaClient.directConversation.findMany = vi.fn().mockResolvedValue([
        { id: 'conv-1', participants: ['user-1', 'user-2'] },
        { id: 'conv-2', participants: ['user-1', 'user-3'] },
      ]);
      mockPrismaClient.directMessage.findMany = vi.fn().mockResolvedValue([
        { id: 'msg-1', content: 'Hello world', DirectConversation: { id: 'conv-1' } },
      ]);

      const result = await MessagingService.searchMessages('user-1', 'hello', 20);

      expect(result).toHaveLength(1);
      expect(mockPrismaClient.directMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            content: expect.objectContaining({
              contains: 'hello',
              mode: 'insensitive',
            }),
          }),
        })
      );
    });
  });

  describe('deleteConversation', () => {
    it('should delete conversation and messages', async () => {
      mockPrismaClient.directConversation.findUnique = vi.fn().mockResolvedValue({
        id: 'conv-1',
        participants: ['user-1', 'user-2'],
      });
      mockPrismaClient.directMessage.deleteMany = vi.fn().mockResolvedValue({ count: 5 });
      mockPrismaClient.directConversation.delete = vi.fn().mockResolvedValue({});

      const result = await MessagingService.deleteConversation('conv-1', 'user-1');

      expect(result.success).toBe(true);
      expect(mockPrismaClient.directMessage.deleteMany).toHaveBeenCalled();
      expect(mockPrismaClient.directConversation.delete).toHaveBeenCalled();
    });
  });
});
