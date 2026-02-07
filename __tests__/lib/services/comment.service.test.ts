/**
 * Comment Service Tests
 * Tests: 12
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommentService } from '@/lib/services/comment.service';
import { mockPrismaClient, resetAllMocks } from '../../setup';

describe('CommentService', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      const mockComment = {
        id: 'comment-1',
        postId: 'post-1',
        authorId: 'user-1',
        content: 'Test comment',
        isByOP: false,
        User: { id: 'user-1', name: 'Test User', image: null },
      };

      mockPrismaClient.communityPost.findUnique = vi.fn().mockResolvedValue({
        id: 'post-1',
        authorId: 'user-2',
        isLocked: false,
        communityId: null,
      });
      mockPrismaClient.communityComment.create = vi.fn().mockResolvedValue(mockComment);
      mockPrismaClient.communityPost.update = vi.fn().mockResolvedValue({});

      const result = await CommentService.createComment('user-1', {
        postId: 'post-1',
        content: 'Test comment',
      });

      expect(result).toEqual(mockComment);
      expect(mockPrismaClient.communityPost.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            commentCount: { increment: 1 },
          }),
        })
      );
    });

    it('should mark comment as by OP when author is post author', async () => {
      mockPrismaClient.communityPost.findUnique = vi.fn().mockResolvedValue({
        id: 'post-1',
        authorId: 'user-1',
        isLocked: false,
        communityId: null,
      });
      mockPrismaClient.communityComment.create = vi.fn().mockResolvedValue({
        id: 'comment-1',
        isByOP: true,
      });
      mockPrismaClient.communityPost.update = vi.fn().mockResolvedValue({});

      const result = await CommentService.createComment('user-1', {
        postId: 'post-1',
        content: 'Test',
      });

      expect(result.isByOP).toBe(true);
    });

    it('should throw error if post is locked', async () => {
      mockPrismaClient.communityPost.findUnique = vi.fn().mockResolvedValue({
        id: 'post-1',
        isLocked: true,
      });

      await expect(
        CommentService.createComment('user-1', {
          postId: 'post-1',
          content: 'Test',
        })
      ).rejects.toThrow('Post bloqueado para comentarios');
    });

    it('should check community permissions', async () => {
      mockPrismaClient.communityPost.findUnique = vi.fn().mockResolvedValue({
        id: 'post-1',
        authorId: 'user-2',
        isLocked: false,
        communityId: 'community-1',
        Community: { id: 'community-1' },
      });
      mockPrismaClient.communityMember.findUnique = vi.fn().mockResolvedValue({
        canComment: true,
        isBanned: false,
        isMuted: false,
      });
      mockPrismaClient.communityComment.create = vi.fn().mockResolvedValue({
        id: 'comment-1',
      });
      mockPrismaClient.communityPost.update = vi.fn().mockResolvedValue({});

      await CommentService.createComment('user-1', {
        postId: 'post-1',
        content: 'Test',
      });

      expect(mockPrismaClient.communityMember.findUnique).toHaveBeenCalled();
    });

    it('should create nested reply', async () => {
      mockPrismaClient.communityPost.findUnique = vi.fn().mockResolvedValue({
        id: 'post-1',
        authorId: 'user-2',
        isLocked: false,
        communityId: null,
      });
      mockPrismaClient.communityComment.create = vi.fn().mockResolvedValue({
        id: 'comment-2',
        parentId: 'comment-1',
      });
      mockPrismaClient.communityPost.update = vi.fn().mockResolvedValue({});

      const result = await CommentService.createComment('user-1', {
        postId: 'post-1',
        content: 'Reply',
        parentId: 'comment-1',
      });

      expect(result.parentId).toBe('comment-1');
    });
  });

  describe('voteComment', () => {
    it('should upvote a comment', async () => {
      mockPrismaClient.commentVote.findUnique = vi.fn().mockResolvedValue(null);
      mockPrismaClient.commentVote.create = vi.fn().mockResolvedValue({});
      mockPrismaClient.communityComment.update = vi.fn().mockResolvedValue({});

      const result = await CommentService.voteComment('comment-1', 'user-1', 'upvote');

      expect(result.voteType).toBe('upvote');
      expect(mockPrismaClient.communityComment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            upvotes: { increment: 1 },
            score: { increment: 1 },
          }),
        })
      );
    });

    it('should toggle vote when voting same way twice', async () => {
      mockPrismaClient.commentVote.findUnique = vi.fn().mockResolvedValue({
        voteType: 'upvote',
      });
      mockPrismaClient.commentVote.delete = vi.fn().mockResolvedValue({});
      mockPrismaClient.communityComment.update = vi.fn().mockResolvedValue({});

      const result = await CommentService.voteComment('comment-1', 'user-1', 'upvote');

      expect(result.voteType).toBeNull();
      expect(mockPrismaClient.commentVote.delete).toHaveBeenCalled();
    });

    it('should change vote from upvote to downvote', async () => {
      mockPrismaClient.commentVote.findUnique = vi.fn().mockResolvedValue({
        voteType: 'upvote',
      });
      mockPrismaClient.commentVote.update = vi.fn().mockResolvedValue({});
      mockPrismaClient.communityComment.update = vi.fn().mockResolvedValue({});

      const result = await CommentService.voteComment('comment-1', 'user-1', 'downvote');

      expect(result.voteType).toBe('downvote');
    });
  });

  describe('getCommentsByPost', () => {
    it('should get comments sorted by top', async () => {
      const mockComments = [
        {
          id: 'comment-1',
          score: 100,
          User: { id: 'user-1', name: 'User', image: null },
          _count: { other_CommunityComment: 0 },
          CommentVote: [],
        },
        {
          id: 'comment-2',
          score: 50,
          User: { id: 'user-2', name: 'User2', image: null },
          _count: { other_CommunityComment: 0 },
          CommentVote: [],
        },
      ];

      mockPrismaClient.communityComment.findMany = vi.fn().mockResolvedValue(mockComments);

      const result = await CommentService.getCommentsByPost('post-1', 'top');

      expect(result).toHaveLength(2);
      expect(mockPrismaClient.communityComment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { score: 'desc' },
        })
      );
    });
  });

  describe('markAsAcceptedAnswer', () => {
    it('should mark comment as accepted by post author', async () => {
      mockPrismaClient.communityComment.findUnique = vi.fn().mockResolvedValue({
        id: 'comment-1',
        CommunityPost: { id: 'post-1', authorId: 'user-1' },
      });
      mockPrismaClient.communityComment.update = vi.fn().mockResolvedValue({});

      const result = await CommentService.markAsAcceptedAnswer('comment-1', 'user-1');

      expect(result.success).toBe(true);
      expect(mockPrismaClient.communityComment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { isAcceptedAnswer: true },
        })
      );
    });

    it('should throw error if not post author', async () => {
      mockPrismaClient.communityComment.findUnique = vi.fn().mockResolvedValue({
        id: 'comment-1',
        CommunityPost: { id: 'post-1', authorId: 'user-2' },
      });

      await expect(CommentService.markAsAcceptedAnswer('comment-1', 'user-1')).rejects.toThrow(
        'Solo el autor del post puede aceptar respuestas'
      );
    });
  });

  describe('deleteComment', () => {
    it('should delete comment as author', async () => {
      mockPrismaClient.communityComment.findUnique = vi.fn().mockResolvedValue({
        id: 'comment-1',
        authorId: 'user-1',
        postId: 'post-1',
        CommunityPost: { communityId: null },
      });
      mockPrismaClient.communityComment.update = vi.fn().mockResolvedValue({});
      mockPrismaClient.communityPost.update = vi.fn().mockResolvedValue({});

      const result = await CommentService.deleteComment('comment-1', 'user-1');

      expect(result.success).toBe(true);
      expect(mockPrismaClient.communityPost.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { commentCount: { decrement: 1 } },
        })
      );
    });
  });
});
