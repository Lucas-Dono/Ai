/**
 * Marketplace Character Service Tests
 * Tests: 12
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MarketplaceCharacterService } from '@/lib/services/marketplace-character.service';
import { mockPrismaClient, resetAllMocks } from '../../setup';

describe('MarketplaceCharacterService', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('createCharacter', () => {
    it('should create a character successfully', async () => {
      const mockCharacter = {
        id: 'char-1',
        name: 'Test Character',
        description: 'A test character',
        category: 'anime',
        authorId: 'user-1',
        status: 'pending',
        author: { id: 'user-1', name: 'Author', image: null },
      };

      mockPrismaClient.marketplaceCharacter.create = vi.fn().mockResolvedValue(mockCharacter);

      const result = await MarketplaceCharacterService.createCharacter('user-1', {
        name: 'Test Character',
        description: 'A test character',
        category: 'anime',
        tags: ['test', 'anime'],
        personality: 'friendly',
        backstory: 'Test backstory',
        systemPrompt: 'You are a test character',
      });

      expect(result).toEqual(mockCharacter);
      expect(result.status).toBe('pending');
    });
  });

  describe('downloadCharacter', () => {
    it('should download character and increment counter', async () => {
      const mockCharacter = {
        id: 'char-1',
        status: 'approved',
        name: 'Test Character',
      };

      mockPrismaClient.marketplaceCharacter.findUnique = vi
        .fn()
        .mockResolvedValueOnce(mockCharacter)
        .mockResolvedValueOnce({ ...mockCharacter, author: { id: 'user-2', name: 'Author' } });
      mockPrismaClient.characterDownload.findUnique = vi.fn().mockResolvedValue(null);
      mockPrismaClient.characterDownload.create = vi.fn().mockResolvedValue({});
      mockPrismaClient.marketplaceCharacter.update = vi.fn().mockResolvedValue({});

      const result = await MarketplaceCharacterService.downloadCharacter('char-1', 'user-1');

      expect(mockPrismaClient.characterDownload.create).toHaveBeenCalled();
      expect(mockPrismaClient.marketplaceCharacter.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { downloadCount: { increment: 1 } },
        })
      );
    });

    it('should not increment counter if already downloaded', async () => {
      mockPrismaClient.marketplaceCharacter.findUnique = vi
        .fn()
        .mockResolvedValueOnce({ id: 'char-1', status: 'approved' })
        .mockResolvedValueOnce({ id: 'char-1', status: 'approved' });
      mockPrismaClient.characterDownload.findUnique = vi.fn().mockResolvedValue({
        id: 'download-1',
      });

      await MarketplaceCharacterService.downloadCharacter('char-1', 'user-1');

      expect(mockPrismaClient.characterDownload.create).not.toHaveBeenCalled();
    });

    it('should throw error if character not approved', async () => {
      mockPrismaClient.marketplaceCharacter.findUnique = vi.fn().mockResolvedValue({
        id: 'char-1',
        status: 'pending',
      });

      await expect(
        MarketplaceCharacterService.downloadCharacter('char-1', 'user-1')
      ).rejects.toThrow('Este personaje no está disponible para descarga');
    });
  });

  describe('rateCharacter', () => {
    it('should rate character after downloading', async () => {
      mockPrismaClient.characterDownload.findUnique = vi.fn().mockResolvedValue({
        id: 'download-1',
      });
      mockPrismaClient.characterRating.upsert = vi.fn().mockResolvedValue({
        id: 'rating-1',
        rating: 5,
        user: { id: 'user-1', name: 'User', image: null },
      });
      mockPrismaClient.characterRating.aggregate = vi.fn().mockResolvedValue({
        _avg: { rating: 4.5 },
        _count: 10,
      });
      mockPrismaClient.marketplaceCharacter.update = vi.fn().mockResolvedValue({});

      const result = await MarketplaceCharacterService.rateCharacter(
        'char-1',
        'user-1',
        5,
        'Great character!'
      );

      expect(result.rating).toBe(5);
      expect(mockPrismaClient.marketplaceCharacter.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            averageRating: 4.5,
            ratingCount: 10,
          }),
        })
      );
    });

    it('should throw error if not downloaded', async () => {
      mockPrismaClient.characterDownload.findUnique = vi.fn().mockResolvedValue(null);

      await expect(
        MarketplaceCharacterService.rateCharacter('char-1', 'user-1', 5)
      ).rejects.toThrow('Debes descargar el personaje antes de calificarlo');
    });

    it('should validate rating range', async () => {
      mockPrismaClient.characterDownload.findUnique = vi.fn().mockResolvedValue({});

      await expect(
        MarketplaceCharacterService.rateCharacter('char-1', 'user-1', 6)
      ).rejects.toThrow('La calificación debe estar entre 1 y 5');

      await expect(
        MarketplaceCharacterService.rateCharacter('char-1', 'user-1', 0)
      ).rejects.toThrow('La calificación debe estar entre 1 y 5');
    });
  });

  describe('listCharacters', () => {
    it('should list approved characters', async () => {
      const mockCharacters = [
        {
          id: 'char-1',
          name: 'Character 1',
          status: 'approved',
          author: { id: 'user-1', name: 'Author', image: null },
        },
      ];

      mockPrismaClient.marketplaceCharacter.findMany = vi.fn().mockResolvedValue(mockCharacters);
      mockPrismaClient.marketplaceCharacter.count = vi.fn().mockResolvedValue(1);

      const result = await MarketplaceCharacterService.listCharacters({}, 1, 25, 'popular');

      expect(result.characters).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by category', async () => {
      mockPrismaClient.marketplaceCharacter.findMany = vi.fn().mockResolvedValue([]);
      mockPrismaClient.marketplaceCharacter.count = vi.fn().mockResolvedValue(0);

      await MarketplaceCharacterService.listCharacters({ category: 'anime' });

      expect(mockPrismaClient.marketplaceCharacter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'anime',
          }),
        })
      );
    });

    it('should filter by tags', async () => {
      mockPrismaClient.marketplaceCharacter.findMany = vi.fn().mockResolvedValue([]);
      mockPrismaClient.marketplaceCharacter.count = vi.fn().mockResolvedValue(0);

      await MarketplaceCharacterService.listCharacters({ tags: ['anime', 'friendly'] });

      expect(mockPrismaClient.marketplaceCharacter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tags: { hasSome: ['anime', 'friendly'] },
          }),
        })
      );
    });
  });

  describe('updateCharacter', () => {
    it('should update character as author', async () => {
      mockPrismaClient.marketplaceCharacter.findUnique = vi.fn().mockResolvedValue({
        id: 'char-1',
        authorId: 'user-1',
      });
      mockPrismaClient.marketplaceCharacter.update = vi.fn().mockResolvedValue({
        id: 'char-1',
        name: 'Updated Name',
      });

      const result = await MarketplaceCharacterService.updateCharacter('char-1', 'user-1', {
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
    });

    it('should throw error if not author', async () => {
      mockPrismaClient.marketplaceCharacter.findUnique = vi.fn().mockResolvedValue({
        id: 'char-1',
        authorId: 'user-2',
      });

      await expect(
        MarketplaceCharacterService.updateCharacter('char-1', 'user-1', { name: 'Updated' })
      ).rejects.toThrow('No tienes permisos para editar este personaje');
    });
  });

  describe('deleteCharacter', () => {
    it('should delete character as author', async () => {
      mockPrismaClient.marketplaceCharacter.findUnique = vi.fn().mockResolvedValue({
        id: 'char-1',
        authorId: 'user-1',
      });
      mockPrismaClient.marketplaceCharacter.delete = vi.fn().mockResolvedValue({});

      const result = await MarketplaceCharacterService.deleteCharacter('char-1', 'user-1');

      expect(result.success).toBe(true);
    });
  });

  describe('importToAgent', () => {
    it('should import character as agent', async () => {
      const mockCharacter = {
        id: 'char-1',
        name: 'Test Character',
        description: 'Test',
        personality: 'friendly',
        systemPrompt: 'You are helpful',
        status: 'approved',
      };

      mockPrismaClient.marketplaceCharacter.findUnique = vi
        .fn()
        .mockResolvedValueOnce(mockCharacter)
        .mockResolvedValueOnce(mockCharacter);
      mockPrismaClient.characterDownload.findUnique = vi.fn().mockResolvedValue(null);
      mockPrismaClient.characterDownload.create = vi.fn().mockResolvedValue({});
      mockPrismaClient.marketplaceCharacter.update = vi.fn().mockResolvedValue({});
      mockPrismaClient.agent.create = vi.fn().mockResolvedValue({
        id: 'agent-1',
        name: 'Test Character',
      });

      const result = await MarketplaceCharacterService.importToAgent('char-1', 'user-1');

      expect(result.id).toBe('agent-1');
      expect(mockPrismaClient.agent.create).toHaveBeenCalled();
    });
  });
});
