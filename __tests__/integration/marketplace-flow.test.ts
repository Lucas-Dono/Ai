/**
 * Marketplace Integration Flow Tests
 * Tests: Complete character sharing and importing flow
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MarketplaceCharacterService } from '@/lib/services/marketplace-character.service';
import { mockPrismaClient, resetAllMocks } from '../setup';

describe('Marketplace Flow Integration', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it('should complete full character sharing and importing flow', async () => {
    // Step 1: User creates and shares a character
    mockPrismaClient.marketplaceCharacter.create = vi.fn().mockResolvedValue({
      id: 'char-1',
      name: 'Anime Character',
      description: 'A cool anime character',
      authorId: 'user-1',
      status: 'pending',
      author: { id: 'user-1', name: 'Creator', image: null },
    });

    const character = await MarketplaceCharacterService.createCharacter('user-1', {
      name: 'Anime Character',
      description: 'A cool anime character',
      category: 'anime',
      tags: ['anime', 'friendly'],
      personality: 'Friendly and helpful',
      backstory: 'Born in a small village',
      systemPrompt: 'You are a helpful anime character',
    });

    expect(character.id).toBe('char-1');
    expect(character.status).toBe('pending');

    // Step 2: Admin approves the character (mock admin flow)
    mockPrismaClient.user.findUnique = vi.fn().mockResolvedValue({
      id: 'admin-1',
      metadata: { isAdmin: true },
    });
    mockPrismaClient.marketplaceCharacter.update = vi.fn().mockResolvedValue({
      id: 'char-1',
      status: 'approved',
    });

    await MarketplaceCharacterService.approveCharacter('char-1', 'admin-1');

    // Step 3: User-2 browses and finds the character
    mockPrismaClient.marketplaceCharacter.findMany = vi.fn().mockResolvedValue([
      {
        id: 'char-1',
        name: 'Anime Character',
        status: 'approved',
        category: 'anime',
        author: { id: 'user-1', name: 'Creator', image: null },
      },
    ]);
    mockPrismaClient.marketplaceCharacter.count = vi.fn().mockResolvedValue(1);

    const results = await MarketplaceCharacterService.listCharacters({
      category: 'anime',
    });

    expect(results.characters).toHaveLength(1);
    expect(results.characters[0].id).toBe('char-1');

    // Step 4: User-2 downloads the character
    const downloadCreateSpy = vi.fn().mockResolvedValue({});
    const downloadFindFirstSpy = vi.fn().mockResolvedValue(null);
    const charUpdateSpy = vi.fn().mockResolvedValue({});

    mockPrismaClient.marketplaceCharacter.findUnique = vi
      .fn()
      .mockResolvedValueOnce({ id: 'char-1', status: 'approved' })
      .mockResolvedValueOnce({
        id: 'char-1',
        name: 'Anime Character',
        status: 'approved',
        author: { id: 'user-1', name: 'Creator', image: null },
      });
    mockPrismaClient.characterDownload.findFirst = downloadFindFirstSpy;
    mockPrismaClient.characterDownload.create = downloadCreateSpy;
    mockPrismaClient.marketplaceCharacter.update = charUpdateSpy;

    await MarketplaceCharacterService.downloadCharacter('char-1', 'user-2');

    expect(downloadCreateSpy).toHaveBeenCalled();
    expect(charUpdateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { downloadCount: { increment: 1 } },
      })
    );

    // Step 5: User-2 rates the character
    const ratingUpsertSpy = vi.fn().mockResolvedValue({
      id: 'rating-1',
      rating: 5,
      review: 'Amazing character!',
    });

    mockPrismaClient.characterDownload.findFirst = vi.fn().mockResolvedValue({
      id: 'download-1',
    });
    mockPrismaClient.characterRating.upsert = ratingUpsertSpy;
    mockPrismaClient.characterRating.aggregate = vi.fn().mockResolvedValue({
      _avg: { rating: 5 },
      _count: 1,
    });
    mockPrismaClient.marketplaceCharacter.update = vi.fn().mockResolvedValue({});

    const rating = await MarketplaceCharacterService.rateCharacter(
      'char-1',
      'user-2',
      5,
      'Amazing character!'
    );

    expect(rating.rating).toBe(5);

    // Step 6: User-2 imports character as personal agent
    const agentCreateSpy = vi.fn().mockResolvedValue({
      id: 'agent-1',
      name: 'Anime Character',
      userId: 'user-2',
    });

    mockPrismaClient.marketplaceCharacter.findUnique = vi
      .fn()
      .mockResolvedValueOnce({
        id: 'char-1',
        name: 'Anime Character',
        description: 'A cool anime character',
        personality: 'Friendly',
        systemPrompt: 'You are helpful',
        status: 'approved',
        author: { id: 'user-1', name: 'Creator', image: null },
      })
      .mockResolvedValueOnce({
        id: 'char-1',
        name: 'Anime Character',
        description: 'A cool anime character',
        personality: 'Friendly',
        systemPrompt: 'You are helpful',
        status: 'approved',
        author: { id: 'user-1', name: 'Creator', image: null },
      });
    mockPrismaClient.characterDownload.findFirst = vi.fn().mockResolvedValue(null);
    mockPrismaClient.characterDownload.create = vi.fn().mockResolvedValue({});
    mockPrismaClient.marketplaceCharacter.update = vi.fn().mockResolvedValue({});
    mockPrismaClient.agent.create = agentCreateSpy;

    const agent = await MarketplaceCharacterService.importToAgent('char-1', 'user-2');

    expect(agent.id).toBe('agent-1');
    expect(agentCreateSpy).toHaveBeenCalled();

    // Verify complete flow
    expect(mockPrismaClient.marketplaceCharacter.create).toHaveBeenCalled();
    expect(downloadCreateSpy).toHaveBeenCalled();
    expect(ratingUpsertSpy).toHaveBeenCalled();
    expect(agentCreateSpy).toHaveBeenCalled();
  });

  it('should reject character with inappropriate content', async () => {
    mockPrismaClient.user.findUnique = vi.fn().mockResolvedValue({
      id: 'admin-1',
      metadata: { isAdmin: true },
    });
    mockPrismaClient.marketplaceCharacter.update = vi.fn().mockResolvedValue({
      id: 'char-1',
      status: 'rejected',
      rejectionReason: 'Inappropriate content',
    });

    const result = await MarketplaceCharacterService.rejectCharacter(
      'char-1',
      'admin-1',
      'Inappropriate content'
    );

    expect(result.status).toBe('rejected');
    expect((result as any).rejectionReason).toBe('Inappropriate content');
  });
});
