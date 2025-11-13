/**
 * Feature Flags Service Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  getUserTier,
  hasFeature,
  checkFeature,
  getEnabledFeatures,
  getFeatureLimits,
  getLimit,
  checkLimit,
  canUseFeature,
  invalidateUserTierCache,
} from "@/lib/feature-flags";
import { UserTier, Feature } from "@/lib/feature-flags/types";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock Redis
vi.mock("@/lib/redis/config", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
  getCacheKey: (type: string, id: string) => `cache:${type}:${id}`,
  CACHE_TTL: {
    user: 300,
  },
  isRedisConfigured: () => false, // Use in-memory for tests
}));

describe("Feature Flags Service", () => {
  const mockUserId = "test-user-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserTier", () => {
    it("should return user's tier from database", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserId,
        plan: "plus",
      } as any);

      const tier = await getUserTier(mockUserId);
      expect(tier).toBe(UserTier.PLUS);
    });

    it("should default to FREE tier if user not found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const tier = await getUserTier(mockUserId);
      expect(tier).toBe(UserTier.FREE);
    });

    it("should default to FREE tier if plan is invalid", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserId,
        plan: null,
      } as any);

      const tier = await getUserTier(mockUserId);
      expect(tier).toBe(UserTier.FREE);
    });
  });

  describe("hasFeature", () => {
    it("should return true for features user has", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserId,
        plan: "plus",
      } as any);

      const result = await hasFeature(mockUserId, Feature.WORLDS);
      expect(result).toBe(true);
    });

    it("should return false for features user doesn't have", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserId,
        plan: "free",
      } as any);

      const result = await hasFeature(mockUserId, Feature.WORLDS);
      expect(result).toBe(false);
    });

    it("should work for Ultra tier with all features", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserId,
        plan: "ultra",
      } as any);

      const results = await Promise.all([
        hasFeature(mockUserId, Feature.WORLDS),
        hasFeature(mockUserId, Feature.API_ACCESS),
        hasFeature(mockUserId, Feature.ANALYTICS_ADVANCED),
      ]);

      expect(results.every((r) => r === true)).toBe(true);
    });
  });

  describe("checkFeature", () => {
    it("should return hasAccess=true for allowed features", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserId,
        plan: "plus",
      } as any);

      const result = await checkFeature(mockUserId, Feature.WORLDS);

      expect(result.hasAccess).toBe(true);
      expect(result.feature).toBe(Feature.WORLDS);
      expect(result.userTier).toBe(UserTier.PLUS);
    });

    it("should return hasAccess=false with upgrade info for denied features", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserId,
        plan: "free",
      } as any);

      const result = await checkFeature(mockUserId, Feature.WORLDS);

      expect(result.hasAccess).toBe(false);
      expect(result.feature).toBe(Feature.WORLDS);
      expect(result.userTier).toBe(UserTier.FREE);
      expect(result.requiredTier).toBe(UserTier.PLUS);
      expect(result.reason).toBeTruthy();
      expect(result.upgradeUrl).toBeTruthy();
    });
  });

  describe("getEnabledFeatures", () => {
    it("should return all features for user's tier", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserId,
        plan: "plus",
      } as any);

      const features = await getEnabledFeatures(mockUserId);

      expect(features).toContain(Feature.CHAT_BASIC);
      expect(features).toContain(Feature.WORLDS);
      expect(features).toContain(Feature.IMAGE_GENERATION);
      expect(features).not.toContain(Feature.API_ACCESS); // Ultra only
    });
  });

  describe("getFeatureLimits", () => {
    it("should return limits for user's tier", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserId,
        plan: "plus",
      } as any);

      const limits = await getFeatureLimits(mockUserId);

      expect(limits.maxAgents).toBe(20);
      expect(limits.maxActiveWorlds).toBe(5);
      expect(limits.imageGenerationsPerDay).toBe(10);
    });

    it("should return Free limits for free tier", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserId,
        plan: "free",
      } as any);

      const limits = await getFeatureLimits(mockUserId);

      expect(limits.maxAgents).toBe(3);
      expect(limits.maxActiveWorlds).toBe(0);
      expect(limits.imageGenerationsPerDay).toBe(0);
    });

    it("should return unlimited (-1) for Ultra tier features", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserId,
        plan: "ultra",
      } as any);

      const limits = await getFeatureLimits(mockUserId);

      expect(limits.messagesPerDay).toBe(-1); // Unlimited
      expect(limits.maxMarketplaceItems).toBe(-1); // Unlimited
    });
  });

  describe("getLimit", () => {
    it("should return specific limit value", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserId,
        plan: "plus",
      } as any);

      const maxAgents = await getLimit(mockUserId, "maxAgents");
      expect(maxAgents).toBe(20);

      const maxWorlds = await getLimit(mockUserId, "maxActiveWorlds");
      expect(maxWorlds).toBe(5);
    });
  });

  describe("checkLimit", () => {
    it("should return withinLimit=true when under limit", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserId,
        plan: "plus",
      } as any);

      const result = await checkLimit(mockUserId, "maxAgents", 5);

      expect(result.withinLimit).toBe(true);
      expect(result.limit).toBe(20);
      expect(result.current).toBe(5);
      expect(result.remaining).toBe(15);
    });

    it("should return withinLimit=false when at/over limit", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserId,
        plan: "plus",
      } as any);

      const result = await checkLimit(mockUserId, "maxAgents", 20);

      expect(result.withinLimit).toBe(false);
      expect(result.limit).toBe(20);
      expect(result.current).toBe(20);
      expect(result.remaining).toBe(0);
    });

    it("should always return withinLimit=true for unlimited (-1)", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserId,
        plan: "ultra",
      } as any);

      const result = await checkLimit(mockUserId, "messagesPerDay", 9999);

      expect(result.withinLimit).toBe(true);
      expect(result.limit).toBe(-1);
      expect(result.remaining).toBe(-1);
    });
  });

  describe("canUseFeature", () => {
    it("should allow feature if user has access and within limits", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserId,
        plan: "plus",
      } as any);

      const result = await canUseFeature(mockUserId, Feature.IMAGE_GENERATION);

      expect(result.canUse).toBe(true);
      expect(result.usage).toBeDefined();
    });

    it("should deny feature if user doesn't have access", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserId,
        plan: "free",
      } as any);

      const result = await canUseFeature(mockUserId, Feature.WORLDS);

      expect(result.canUse).toBe(false);
      expect(result.reason).toBeTruthy();
      expect(result.upgradeUrl).toBeTruthy();
    });
  });

  describe("invalidateUserTierCache", () => {
    it("should clear cache without errors", async () => {
      await expect(invalidateUserTierCache(mockUserId)).resolves.not.toThrow();
    });
  });
});
