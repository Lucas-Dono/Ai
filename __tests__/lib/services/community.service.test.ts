/**
 * Community Service Tests
 * Tests: 10
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommunityService } from '@/lib/services/community.service';
import { mockPrismaClient, resetAllMocks } from '../../setup';

describe('CommunityService', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('createCommunity', () => {
    it('should create a community successfully', async () => {
      const mockCommunity = {
        id: 'community-1',
        slug: 'test-community',
        name: 'Test Community',
        description: 'A test community',
        category: 'tech',
        type: 'public',
        ownerId: 'user-1',
        User: { id: 'user-1', name: 'Test User', image: null },
        createdAt: new Date(),
      };

      mockPrismaClient.community.findUnique = vi.fn().mockResolvedValue(null);
      mockPrismaClient.community.create = vi.fn().mockResolvedValue(mockCommunity);
      mockPrismaClient.communityMember.create = vi.fn().mockResolvedValue({});

      const result = await CommunityService.createCommunity('user-1', {
        name: 'Test Community',
        slug: 'test-community',
        description: 'A test community',
        category: 'tech',
      });

      expect(result).toMatchObject({
        id: 'community-1',
        slug: 'test-community',
        name: 'Test Community',
        ownerId: 'user-1',
      });
      expect(mockPrismaClient.community.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Test Community',
            slug: 'test-community',
          }),
        })
      );
      expect(mockPrismaClient.communityMember.create).toHaveBeenCalled();
    });

    it('should throw error if slug already exists', async () => {
      mockPrismaClient.community.findUnique = vi.fn().mockResolvedValue({ id: 'existing' });

      await expect(
        CommunityService.createCommunity('user-1', {
          name: 'Test',
          slug: 'existing-slug',
          description: 'Test',
          category: 'tech',
        })
      ).rejects.toThrow('Ya existe una comunidad con ese slug');
    });
  });

  describe('joinCommunity', () => {
    it('should join a public community', async () => {
      mockPrismaClient.community.findUnique = vi.fn().mockResolvedValue({
        id: 'community-1',
        type: 'public',
      });
      mockPrismaClient.communityMember.findUnique = vi.fn().mockResolvedValue(null);
      mockPrismaClient.communityMember.create = vi.fn().mockResolvedValue({
        id: 'member-1',
        role: 'member',
      });
      mockPrismaClient.community.update = vi.fn().mockResolvedValue({});

      const result = await CommunityService.joinCommunity('community-1', 'user-1');

      expect(result).toHaveProperty('role', 'member');
      expect(mockPrismaClient.community.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { memberCount: { increment: 1 } },
        })
      );
    });

    it('should throw error if already a member', async () => {
      mockPrismaClient.community.findUnique = vi.fn().mockResolvedValue({ type: 'public' });
      mockPrismaClient.communityMember.findUnique = vi.fn().mockResolvedValue({ id: 'member-1' });

      await expect(CommunityService.joinCommunity('community-1', 'user-1')).rejects.toThrow(
        'Ya eres miembro de esta comunidad'
      );
    });

    it('should throw error for private communities', async () => {
      mockPrismaClient.community.findUnique = vi.fn().mockResolvedValue({
        id: 'community-1',
        type: 'private',
      });
      mockPrismaClient.communityMember.findUnique = vi.fn().mockResolvedValue(null);

      await expect(CommunityService.joinCommunity('community-1', 'user-1')).rejects.toThrow(
        'Esta comunidad es privada'
      );
    });
  });

  describe('leaveCommunity', () => {
    it('should leave a community successfully', async () => {
      mockPrismaClient.communityMember.findUnique = vi.fn().mockResolvedValue({
        id: 'member-1',
        role: 'member',
      });
      mockPrismaClient.communityMember.delete = vi.fn().mockResolvedValue({});
      mockPrismaClient.community.update = vi.fn().mockResolvedValue({});

      const result = await CommunityService.leaveCommunity('community-1', 'user-1');

      expect(result).toEqual({ success: true });
      expect(mockPrismaClient.community.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { memberCount: { decrement: 1 } },
        })
      );
    });

    it('should not allow owner to leave', async () => {
      mockPrismaClient.communityMember.findUnique = vi.fn().mockResolvedValue({
        id: 'member-1',
        role: 'owner',
      });

      await expect(CommunityService.leaveCommunity('community-1', 'user-1')).rejects.toThrow(
        'El dueño no puede salir de la comunidad'
      );
    });
  });

  describe('updateCommunity', () => {
    it('should update community as owner', async () => {
      mockPrismaClient.communityMember.findUnique = vi.fn().mockResolvedValue({
        role: 'owner',
      });
      mockPrismaClient.community.update = vi.fn().mockResolvedValue({
        id: 'community-1',
        name: 'Updated Name',
      });

      const result = await CommunityService.updateCommunity('community-1', 'user-1', {
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
    });

    it('should throw error if not owner or moderator', async () => {
      mockPrismaClient.communityMember.findUnique = vi.fn().mockResolvedValue({
        role: 'member',
      });

      await expect(
        CommunityService.updateCommunity('community-1', 'user-1', { name: 'New Name' })
      ).rejects.toThrow('No tienes permiso para editar esta comunidad');
    });
  });

  describe('getCommunityMembers', () => {
    it('should get paginated members', async () => {
      const mockMembers = [
        { id: 'member-1', role: 'owner', userId: 'user-1' },
        { id: 'member-2', role: 'member', userId: 'user-2' },
      ];

      mockPrismaClient.communityMember.findMany = vi.fn().mockResolvedValue(mockMembers);
      mockPrismaClient.communityMember.count = vi.fn().mockResolvedValue(2);

      const result = await CommunityService.getCommunityMembers('community-1', 1, 50);

      expect(result.members).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 50,
        total: 2,
        totalPages: 1,
      });
    });
  });

  describe('listCommunities', () => {
    it('should list communities with filters', async () => {
      const mockCommunities = [
        {
          id: 'community-1',
          name: 'Tech Community',
          category: 'tech',
          memberCount: 100,
        },
      ];

      mockPrismaClient.community.findMany = vi.fn().mockResolvedValue(mockCommunities);
      mockPrismaClient.community.count = vi.fn().mockResolvedValue(1);

      const result = await CommunityService.listCommunities({
        category: 'tech',
        sortBy: 'members',
      });

      expect(result.communities).toHaveLength(1);
      expect(result.communities[0].category).toBe('tech');
    });
  });
});
