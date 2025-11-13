/**
 * Feature Flags React Hook
 * Frontend hook para acceder a feature flags
 */

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { Feature, UserTier, FeatureLimits, FeatureUsage } from "@/lib/feature-flags/types";

/**
 * Feature check result from API
 */
interface FeatureCheckResult {
  hasAccess: boolean;
  feature: Feature;
  userTier: UserTier;
  requiredTier?: UserTier;
  reason?: string;
  upgradeUrl?: string;
}

/**
 * Feature usage result from API
 */
interface FeatureUsageResult {
  canUse: boolean;
  reason?: string;
  upgradeUrl?: string;
  usage?: FeatureUsage;
}

/**
 * Hook return type
 */
interface UseFeatures {
  // User tier
  userTier: UserTier;
  isLoading: boolean;

  // Feature checks
  hasFeature: (feature: Feature) => boolean;
  checkFeature: (feature: Feature) => FeatureCheckResult | null;

  // Limits
  limits: FeatureLimits | null;
  getLimit: (limitKey: keyof FeatureLimits) => number;

  // Feature categories
  canCreateWorlds: boolean;
  canGenerateImages: boolean;
  canPublishMarketplace: boolean;
  canAccessAPI: boolean;
  hasVoiceMessages: boolean;
  hasEarlyAccess: boolean;

  // Usage checking
  canUseFeature: (feature: Feature) => Promise<FeatureUsageResult>;
  trackFeatureUsage: (feature: Feature, count?: number) => Promise<void>;

  // Upgrade helpers
  needsUpgrade: (feature: Feature) => boolean;
  getUpgradeUrl: (feature: Feature) => string | null;
}

/**
 * Client-side feature map cache
 * Evita hacer fetch repetido durante la sesión
 */
const featureCache = new Map<
  string,
  {
    features: Set<Feature>;
    limits: FeatureLimits;
    tier: UserTier;
    timestamp: number;
  }
>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * useFeatures Hook
 * Main hook para acceder a feature flags en el frontend
 *
 * @example
 * function MyComponent() {
 *   const { hasFeature, canCreateWorlds, needsUpgrade } = useFeatures();
 *
 *   if (!hasFeature(Feature.WORLDS)) {
 *     return <UpgradePrompt feature={Feature.WORLDS} />;
 *   }
 *
 *   return <WorldCreator />;
 * }
 */
export function useFeatures(): UseFeatures {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const userPlan = session?.user?.plan as UserTier | undefined;

  const [features, setFeatures] = useState<Set<Feature>>(new Set());
  const [limits, setLimits] = useState<FeatureLimits | null>(null);
  const [userTier, setUserTier] = useState<UserTier>(UserTier.FREE);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch features and limits from API
  useEffect(() => {
    if (status === "loading") return;

    if (!userId) {
      // No user logged in - default to free tier
      setUserTier(UserTier.FREE);
      setFeatures(new Set());
      setLimits(null);
      setIsLoading(false);
      return;
    }

    // Check cache first
    const cached = featureCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setFeatures(cached.features);
      setLimits(cached.limits);
      setUserTier(cached.tier);
      setIsLoading(false);
      return;
    }

    // Fetch from API
    const fetchFeatures = async () => {
      try {
        const response = await fetch("/api/features");

        if (!response.ok) {
          throw new Error("Failed to fetch features");
        }

        const data = await response.json();

        const featureSet = new Set<Feature>(data.features || []);
        const tier = data.tier || UserTier.FREE;
        const limitsData = data.limits || null;

        setFeatures(featureSet);
        setLimits(limitsData);
        setUserTier(tier);

        // Cache result
        featureCache.set(userId, {
          features: featureSet,
          limits: limitsData,
          tier,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error("Failed to fetch features:", error);

        // Fallback to session plan
        const tier = userPlan || UserTier.FREE;
        setUserTier(tier);
        setFeatures(new Set());
        setLimits(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatures();
  }, [userId, status, userPlan]);

  // Check if user has a specific feature
  const hasFeature = useCallback(
    (feature: Feature): boolean => {
      return features.has(feature);
    },
    [features]
  );

  // Get detailed feature check
  const checkFeature = useCallback(
    (feature: Feature): FeatureCheckResult | null => {
      const hasAccess = hasFeature(feature);

      if (hasAccess) {
        return {
          hasAccess: true,
          feature,
          userTier,
        };
      }

      // TODO: Could fetch metadata from API if needed
      return {
        hasAccess: false,
        feature,
        userTier,
      };
    },
    [hasFeature, userTier]
  );

  // Get specific limit
  const getLimit = useCallback(
    (limitKey: keyof FeatureLimits): number => {
      if (!limits) return 0;
      return limits[limitKey];
    },
    [limits]
  );

  // Check if user can use a feature (with usage limits)
  const canUseFeature = useCallback(
    async (feature: Feature): Promise<FeatureUsageResult> => {
      if (!userId) {
        return {
          canUse: false,
          reason: "Please log in to use this feature",
        };
      }

      try {
        const response = await fetch(
          `/api/features/check?feature=${feature}`
        );

        if (!response.ok) {
          throw new Error("Failed to check feature usage");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Failed to check feature usage:", error);
        return {
          canUse: false,
          reason: "Error checking feature availability",
        };
      }
    },
    [userId]
  );

  // Track feature usage
  const trackFeatureUsage = useCallback(
    async (feature: Feature, count: number = 1): Promise<void> => {
      if (!userId) return;

      try {
        await fetch("/api/features/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feature, count }),
        });
      } catch (error) {
        console.error("Failed to track feature usage:", error);
      }
    },
    [userId]
  );

  // Check if needs upgrade for feature
  const needsUpgrade = useCallback(
    (feature: Feature): boolean => {
      return !hasFeature(feature);
    },
    [hasFeature]
  );

  // Get upgrade URL for feature
  const getUpgradeUrl = useCallback(
    (feature: Feature): string | null => {
      if (hasFeature(feature)) return null;
      // TODO: Could determine exact tier needed from metadata
      return `/pricing`;
    },
    [hasFeature]
  );

  // Convenience flags for common features
  const canCreateWorlds = hasFeature(Feature.WORLDS);
  const canGenerateImages = hasFeature(Feature.IMAGE_GENERATION);
  const canPublishMarketplace = hasFeature(Feature.MARKETPLACE_PUBLISHING);
  const canAccessAPI = hasFeature(Feature.API_ACCESS);
  const hasVoiceMessages = hasFeature(Feature.VOICE_MESSAGES);
  const hasEarlyAccess = hasFeature(Feature.EARLY_ACCESS);

  return {
    userTier,
    isLoading,
    hasFeature,
    checkFeature,
    limits,
    getLimit,
    canCreateWorlds,
    canGenerateImages,
    canPublishMarketplace,
    canAccessAPI,
    hasVoiceMessages,
    hasEarlyAccess,
    canUseFeature,
    trackFeatureUsage,
    needsUpgrade,
    getUpgradeUrl,
  };
}

/**
 * Simple hook to just get user tier
 */
export function useUserTier(): {
  tier: UserTier;
  isFree: boolean;
  isPlus: boolean;
  isUltra: boolean;
  isLoading: boolean;
} {
  const { userTier, isLoading } = useFeatures();

  return {
    tier: userTier,
    isFree: userTier === UserTier.FREE,
    isPlus: userTier === UserTier.PLUS,
    isUltra: userTier === UserTier.ULTRA,
    isLoading,
  };
}

/**
 * Hook to invalidate feature cache (call after plan change)
 */
export function useInvalidateFeatureCache() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useCallback(() => {
    if (userId) {
      featureCache.delete(userId);
    }
  }, [userId]);
}
