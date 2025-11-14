/**
 * Feature Flags Configuration Tests
 */

import { describe, it, expect } from "vitest";
import {
  TIER_CONFIGS,
  FEATURE_METADATA,
  TIER_HIERARCHY,
  isTierSufficient,
  getNextTier,
  getUpgradeUrl,
} from "@/lib/feature-flags/config";
import { UserTier, Feature } from "@/lib/feature-flags/types";

describe("Feature Flags Configuration", () => {
  describe("TIER_CONFIGS", () => {
    it("should have configuration for all tiers", () => {
      expect(TIER_CONFIGS[UserTier.FREE]).toBeDefined();
      expect(TIER_CONFIGS[UserTier.PLUS]).toBeDefined();
      expect(TIER_CONFIGS[UserTier.ULTRA]).toBeDefined();
    });

    it("should have valid limits for each tier", () => {
      Object.values(TIER_CONFIGS).forEach((config) => {
        expect(config.limits).toBeDefined();
        expect(config.limits.maxAgents).toBeGreaterThanOrEqual(0);
        expect(config.limits.maxActiveWorlds).toBeGreaterThanOrEqual(0);
      });
    });

    it("should have increasing limits across tiers", () => {
      const freeLimits = TIER_CONFIGS[UserTier.FREE].limits;
      const plusLimits = TIER_CONFIGS[UserTier.PLUS].limits;
      const ultraLimits = TIER_CONFIGS[UserTier.ULTRA].limits;

      // Agents should increase
      expect(plusLimits.maxAgents).toBeGreaterThan(freeLimits.maxAgents);
      expect(ultraLimits.maxAgents).toBeGreaterThan(plusLimits.maxAgents);

      // Worlds should increase (or stay at -1 for unlimited)
      expect(plusLimits.maxActiveWorlds).toBeGreaterThanOrEqual(freeLimits.maxActiveWorlds);
    });

    it("should have Plus and Ultra with pricing", () => {
      expect(TIER_CONFIGS[UserTier.PLUS].price).toBeDefined();
      expect(TIER_CONFIGS[UserTier.ULTRA].price).toBeDefined();
      expect(TIER_CONFIGS[UserTier.FREE].price).toBeUndefined();
    });
  });

  describe("FEATURE_METADATA", () => {
    it("should have metadata for all features", () => {
      Object.values(Feature).forEach((feature) => {
        expect(FEATURE_METADATA[feature]).toBeDefined();
      });
    });

    it("should have required fields for each feature", () => {
      Object.values(FEATURE_METADATA).forEach((metadata) => {
        expect(metadata.feature).toBeDefined();
        expect(metadata.name).toBeTruthy();
        expect(metadata.description).toBeTruthy();
        expect(metadata.minTier).toBeDefined();
        expect(metadata.upgradeMessage).toBeTruthy();
        expect(metadata.category).toBeTruthy();
      });
    });

    it("should have valid minTier for each feature", () => {
      Object.values(FEATURE_METADATA).forEach((metadata) => {
        expect(Object.values(UserTier)).toContain(metadata.minTier);
      });
    });
  });

  describe("TIER_HIERARCHY", () => {
    it("should have all tiers in order", () => {
      expect(TIER_HIERARCHY).toEqual([
        UserTier.FREE,
        UserTier.PLUS,
        UserTier.ULTRA,
      ]);
    });
  });

  describe("isTierSufficient", () => {
    it("should allow same tier", () => {
      expect(isTierSufficient(UserTier.FREE, UserTier.FREE)).toBe(true);
      expect(isTierSufficient(UserTier.PLUS, UserTier.PLUS)).toBe(true);
      expect(isTierSufficient(UserTier.ULTRA, UserTier.ULTRA)).toBe(true);
    });

    it("should allow higher tiers", () => {
      expect(isTierSufficient(UserTier.PLUS, UserTier.FREE)).toBe(true);
      expect(isTierSufficient(UserTier.ULTRA, UserTier.FREE)).toBe(true);
      expect(isTierSufficient(UserTier.ULTRA, UserTier.PLUS)).toBe(true);
    });

    it("should deny lower tiers", () => {
      expect(isTierSufficient(UserTier.FREE, UserTier.PLUS)).toBe(false);
      expect(isTierSufficient(UserTier.FREE, UserTier.ULTRA)).toBe(false);
      expect(isTierSufficient(UserTier.PLUS, UserTier.ULTRA)).toBe(false);
    });
  });

  describe("getNextTier", () => {
    it("should return next tier for Free and Plus", () => {
      expect(getNextTier(UserTier.FREE)).toBe(UserTier.PLUS);
      expect(getNextTier(UserTier.PLUS)).toBe(UserTier.ULTRA);
    });

    it("should return null for Ultra (highest tier)", () => {
      expect(getNextTier(UserTier.ULTRA)).toBeNull();
    });
  });

  describe("getUpgradeUrl", () => {
    it("should return pricing URL with tier parameter", () => {
      expect(getUpgradeUrl(UserTier.PLUS)).toBe("/pricing?upgrade=plus");
      expect(getUpgradeUrl(UserTier.ULTRA)).toBe("/pricing?upgrade=ultra");
    });
  });

  describe("Feature Distribution", () => {
    it("should have Free tier with basic features only", () => {
      const freeFeatures = TIER_CONFIGS[UserTier.FREE].features;

      expect(freeFeatures).toContain(Feature.CHAT_BASIC);
      expect(freeFeatures).toContain(Feature.AGENT_CREATION);
      expect(freeFeatures).not.toContain(Feature.WORLDS);
      expect(freeFeatures).not.toContain(Feature.IMAGE_GENERATION);
    });

    it("should have Plus tier with intermediate features", () => {
      const plusFeatures = TIER_CONFIGS[UserTier.PLUS].features;

      expect(plusFeatures).toContain(Feature.CHAT_BASIC);
      expect(plusFeatures).toContain(Feature.WORLDS);
      expect(plusFeatures).toContain(Feature.IMAGE_GENERATION);
      expect(plusFeatures).toContain(Feature.VOICE_MESSAGES);
      expect(plusFeatures).not.toContain(Feature.API_ACCESS);
    });

    it("should have Ultra tier with all advanced features", () => {
      const ultraFeatures = TIER_CONFIGS[UserTier.ULTRA].features;

      expect(ultraFeatures).toContain(Feature.CHAT_BASIC);
      expect(ultraFeatures).toContain(Feature.WORLDS);
      expect(ultraFeatures).toContain(Feature.API_ACCESS);
      expect(ultraFeatures).toContain(Feature.ANALYTICS_ADVANCED);
      expect(ultraFeatures).toContain(Feature.EARLY_ACCESS);
    });
  });
});
