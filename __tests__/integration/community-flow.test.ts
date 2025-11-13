/**
 * Community Integration Flow Tests
 * Tests: Complete user flows from signup to interaction
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommunityService } from '@/lib/services/community.service';
import { PostService } from '@/lib/services/post.service';
import { CommentService } from '@/lib/services/comment.service';
import { ReputationService } from '@/lib/services/reputation.service';
import { mockPrismaClient, resetAllMocks } from '../setup';

describe('Community Flow Integration', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it('should complete full community interaction flow', async () => {
    // Step 1: User creates a community
    mockPrismaClient.community.findUnique = vi.fn().mockResolvedValue(null);
    mockPrismaClient.community.create = vi.fn().mockResolvedValue({
      id: 'community-1',
      slug: 'test-community',
      name: 'Test Community',
      ownerId: 'user-1',
    });
    mockPrismaClient.communityMember.create = vi.fn().mockResolvedValue({
      role: 'owner',
    });

    const community = await CommunityService.createCommunity('user-1', {
      name: 'Test Community',
      slug: 'test-community',
      description: 'A test community',
      category: 'tech',
    });

    expect(community.id).toBe('community-1');

    // Step 2: Another user joins the community
    mockPrismaClient.community.findUnique = vi.fn().mockResolvedValue({
      id: 'community-1',
      type: 'public',
    });
    mockPrismaClient.communityMember.findUnique = vi.fn().mockResolvedValue(null);
    mockPrismaClient.communityMember.create = vi.fn().mockResolvedValue({
      role: 'member',
    });
    mockPrismaClient.community.update = vi.fn().mockResolvedValue({});

    await CommunityService.joinCommunity('community-1', 'user-2');

    // Step 3: User-2 creates a post
    mockPrismaClient.communityMember.findUnique = vi.fn().mockResolvedValue({
      canPost: true,
      isBanned: false,
      isMuted: false,
    });
    mockPrismaClient.communityPost.create = vi.fn().mockResolvedValue({
      id: 'post-1',
      title: 'My First Post',
      authorId: 'user-2',
      communityId: 'community-1',
    });
    mockPrismaClient.community.update = vi.fn().mockResolvedValue({});

    const post = await PostService.createPost('user-2', {
      title: 'My First Post',
      content: 'Hello community!',
      type: 'discussion',
      communityId: 'community-1',
    });

    expect(post.id).toBe('post-1');

    // Step 4: User-1 comments on the post
    mockPrismaClient.communityPost.findUnique = vi.fn().mockResolvedValue({
      id: 'post-1',
      authorId: 'user-2',
      isLocked: false,
      communityId: 'community-1',
      community: { id: 'community-1' },
    });
    mockPrismaClient.communityMember.findUnique = vi.fn().mockResolvedValue({
      canComment: true,
      isBanned: false,
      isMuted: false,
    });
    mockPrismaClient.communityComment.create = vi.fn().mockResolvedValue({
      id: 'comment-1',
      content: 'Great post!',
      authorId: 'user-1',
    });
    mockPrismaClient.communityPost.update = vi.fn().mockResolvedValue({});

    const comment = await CommentService.createComment('user-1', {
      postId: 'post-1',
      content: 'Great post!',
    });

    expect(comment.id).toBe('comment-1');

    // Step 5: User-1 upvotes the post
    mockPrismaClient.communityPost.findUnique = vi.fn().mockResolvedValue({
      id: 'post-1',
    });
    mockPrismaClient.postVote.findUnique = vi.fn().mockResolvedValue(null);
    mockPrismaClient.postVote.create = vi.fn().mockResolvedValue({});
    mockPrismaClient.communityPost.update = vi.fn().mockResolvedValue({});

    await PostService.votePost('post-1', 'user-1', 'upvote');

    // Step 6: Award reputation points
    mockPrismaClient.userReputation.upsert = vi.fn().mockResolvedValue({
      points: 5,
      level: 1,
    });
    mockPrismaClient.userReputation.findUnique = vi.fn().mockResolvedValue({
      userId: 'user-2',
      points: 5,
      level: 1,
      badges: [],
    });

    vi.spyOn(ReputationService, 'getUserStats').mockResolvedValue({
      aisCreated: 0,
      messagesSent: 0,
      voiceChats: 0,
      multimodalChats: 0,
      worldsCreated: 0,
      behaviorsConfigured: 0,
      importantEvents: 0,
      sharedAIs: 0,
      totalImports: 0,
      totalLikes: 0,
      currentStreak: 0,
      isEarlyAdopter: false,
      postCount: 1,
      commentCount: 0,
      receivedUpvotes: 1,
      acceptedAnswers: 0,
      createdCommunities: 0,
      researchProjects: 0,
      researchContributions: 0,
      publishedThemes: 0,
      maxPostUpvotes: 1,
      maxThemeDownloads: 0,
      isModerator: false,
      awardsGiven: 0,
      eventsWon: 0,
    }) as any;

    mockPrismaClient.userBadge.create = vi.fn().mockResolvedValue({});

    await ReputationService.awardPoints('user-2', 'post_created');

    // Verify all steps completed successfully
    expect(mockPrismaClient.community.create).toHaveBeenCalled();
    expect(mockPrismaClient.communityPost.create).toHaveBeenCalled();
    expect(mockPrismaClient.communityComment.create).toHaveBeenCalled();
    expect(mockPrismaClient.postVote.create).toHaveBeenCalled();
  });

  it('should handle permission checks throughout flow', async () => {
    // Test that banned user cannot post
    mockPrismaClient.communityMember.findUnique = vi.fn().mockResolvedValue({
      canPost: false,
      isBanned: true,
    });

    await expect(
      PostService.createPost('banned-user', {
        title: 'Test',
        content: 'Test',
        type: 'discussion',
        communityId: 'community-1',
      })
    ).rejects.toThrow('No tienes permiso para publicar');
  });
});
