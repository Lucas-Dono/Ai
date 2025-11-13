/**
 * Post Service Tests
 * Tests: 15
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PostService } from '@/lib/services/post.service';
import { mockPrismaClient, resetAllMocks } from '../../setup';

describe('PostService', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const mockPost = {
        id: 'post-1',
        title: 'Test Post',
        content: 'Test content',
        type: 'discussion',
        authorId: 'user-1',
        slug: 'test-post-abc123',
        author: { id: 'user-1', name: 'Test User', image: null },
      };

      mockPrismaClient.communityPost.create = vi.fn().mockResolvedValue(mockPost);

      const result = await PostService.createPost('user-1', {
        title: 'Test Post',
        content: 'Test content',
        type: 'discussion',
      });

      expect(result).toEqual(mockPost);
      expect(mockPrismaClient.communityPost.create).toHaveBeenCalled();
    });

    it('should check permissions when posting in community', async () => {
      mockPrismaClient.communityMember.findUnique = vi.fn().mockResolvedValue({
        canPost: true,
        isBanned: false,
        isMuted: false,
      });
      mockPrismaClient.communityPost.create = vi.fn().mockResolvedValue({
        id: 'post-1',
      });
      mockPrismaClient.community.update = vi.fn().mockResolvedValue({});

      await PostService.createPost('user-1', {
        title: 'Test',
        content: 'Test',
        type: 'discussion',
        communityId: 'community-1',
      });

      expect(mockPrismaClient.communityMember.findUnique).toHaveBeenCalled();
      expect(mockPrismaClient.community.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { postCount: { increment: 1 } },
        })
      );
    });

    it('should throw error if user is banned from community', async () => {
      mockPrismaClient.communityMember.findUnique = vi.fn().mockResolvedValue({
        canPost: false,
        isBanned: true,
      });

      await expect(
        PostService.createPost('user-1', {
          title: 'Test',
          content: 'Test',
          type: 'discussion',
          communityId: 'community-1',
        })
      ).rejects.toThrow('No tienes permiso para publicar en esta comunidad');
    });
  });

  describe('votePost', () => {
    it('should upvote a post', async () => {
      mockPrismaClient.communityPost.findUnique = vi.fn().mockResolvedValue({
        id: 'post-1',
      });
      mockPrismaClient.postVote.findUnique = vi.fn().mockResolvedValue(null);
      mockPrismaClient.postVote.create = vi.fn().mockResolvedValue({});
      mockPrismaClient.communityPost.update = vi.fn().mockResolvedValue({});

      const result = await PostService.votePost('post-1', 'user-1', 'upvote');

      expect(result.voteType).toBe('upvote');
      expect(mockPrismaClient.communityPost.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            upvotes: { increment: 1 },
            score: { increment: 1 },
          }),
        })
      );
    });

    it('should toggle vote when voting same way twice', async () => {
      mockPrismaClient.communityPost.findUnique = vi.fn().mockResolvedValue({ id: 'post-1' });
      mockPrismaClient.postVote.findUnique = vi.fn().mockResolvedValue({
        voteType: 'upvote',
      });
      mockPrismaClient.postVote.delete = vi.fn().mockResolvedValue({});
      mockPrismaClient.communityPost.update = vi.fn().mockResolvedValue({});

      const result = await PostService.votePost('post-1', 'user-1', 'upvote');

      expect(result.voteType).toBeNull();
      expect(mockPrismaClient.postVote.delete).toHaveBeenCalled();
    });

    it('should change vote from upvote to downvote', async () => {
      mockPrismaClient.communityPost.findUnique = vi.fn().mockResolvedValue({ id: 'post-1' });
      mockPrismaClient.postVote.findUnique = vi.fn().mockResolvedValue({
        voteType: 'upvote',
      });
      mockPrismaClient.postVote.update = vi.fn().mockResolvedValue({});
      mockPrismaClient.communityPost.update = vi.fn().mockResolvedValue({});

      const result = await PostService.votePost('post-1', 'user-1', 'downvote');

      expect(result.voteType).toBe('downvote');
      expect(mockPrismaClient.postVote.update).toHaveBeenCalled();
    });
  });

  describe('deletePost', () => {
    it('should delete post as author', async () => {
      mockPrismaClient.communityPost.findUnique = vi.fn().mockResolvedValue({
        id: 'post-1',
        authorId: 'user-1',
        communityId: null,
      });
      mockPrismaClient.communityPost.update = vi.fn().mockResolvedValue({});

      const result = await PostService.deletePost('post-1', 'user-1');

      expect(result.success).toBe(true);
      expect(mockPrismaClient.communityPost.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'removed' },
        })
      );
    });

    it('should delete post as moderator', async () => {
      mockPrismaClient.communityPost.findUnique = vi.fn().mockResolvedValue({
        id: 'post-1',
        authorId: 'user-2',
        communityId: 'community-1',
      });
      mockPrismaClient.communityMember.findUnique = vi.fn().mockResolvedValue({
        canModerate: true,
      });
      mockPrismaClient.communityPost.update = vi.fn().mockResolvedValue({});
      mockPrismaClient.community.update = vi.fn().mockResolvedValue({});

      const result = await PostService.deletePost('post-1', 'user-1');

      expect(result.success).toBe(true);
    });

    it('should throw error if not authorized', async () => {
      mockPrismaClient.communityPost.findUnique = vi.fn().mockResolvedValue({
        id: 'post-1',
        authorId: 'user-2',
        communityId: 'community-1',
      });
      mockPrismaClient.communityMember.findUnique = vi.fn().mockResolvedValue({
        canModerate: false,
      });

      await expect(PostService.deletePost('post-1', 'user-1')).rejects.toThrow(
        'No tienes permiso para eliminar este post'
      );
    });
  });

  describe('searchPosts', () => {
    it('should search posts with filters', async () => {
      const mockPosts = [
        {
          id: 'post-1',
          title: 'Test Post',
          type: 'discussion',
          author: { id: 'user-1', name: 'User', image: null },
        },
      ];

      mockPrismaClient.communityPost.findMany = vi.fn().mockResolvedValue(mockPosts);
      mockPrismaClient.communityPost.count = vi.fn().mockResolvedValue(1);

      const result = await PostService.searchPosts({
        type: 'discussion',
        sortBy: 'hot',
      });

      expect(result.posts).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by time range', async () => {
      mockPrismaClient.communityPost.findMany = vi.fn().mockResolvedValue([]);
      mockPrismaClient.communityPost.count = vi.fn().mockResolvedValue(0);

      await PostService.searchPosts({
        timeRange: 'week',
      });

      expect(mockPrismaClient.communityPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.any(Object),
          }),
        })
      );
    });
  });

  describe('reportPost', () => {
    it('should create a report', async () => {
      mockPrismaClient.postReport.create = vi.fn().mockResolvedValue({
        id: 'report-1',
        postId: 'post-1',
        reporterId: 'user-1',
        reason: 'spam',
      });

      const result = await PostService.reportPost('post-1', 'user-1', 'spam', 'This is spam');

      expect(result).toHaveProperty('id', 'report-1');
      expect(mockPrismaClient.postReport.create).toHaveBeenCalled();
    });
  });

  describe('getPostById', () => {
    it('should get post and increment view count', async () => {
      const mockPost = {
        id: 'post-1',
        title: 'Test Post',
        author: { id: 'user-1', name: 'User', image: null },
      };

      mockPrismaClient.communityPost.findUnique = vi.fn().mockResolvedValue(mockPost);
      mockPrismaClient.communityPost.update = vi.fn().mockResolvedValue({});
      mockPrismaClient.postVote.findUnique = vi.fn().mockResolvedValue(null);

      const result = await PostService.getPostById('post-1', 'user-1');

      expect(result).toMatchObject(mockPost);
      expect(mockPrismaClient.communityPost.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { viewCount: { increment: 1 } },
        })
      );
    });
  });

  describe('pinPost', () => {
    it('should pin post as moderator', async () => {
      mockPrismaClient.communityPost.findUnique = vi.fn().mockResolvedValue({
        id: 'post-1',
        communityId: 'community-1',
      });
      mockPrismaClient.communityMember.findUnique = vi.fn().mockResolvedValue({
        canModerate: true,
      });
      mockPrismaClient.communityPost.update = vi.fn().mockResolvedValue({});

      const result = await PostService.pinPost('post-1', 'user-1');

      expect(result.success).toBe(true);
    });
  });
});
