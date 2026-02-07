/**
 * UpgradePrompt Component
 * Shows upgrade message when user doesn't have feature access
 */

"use client";

import Link from "next/link";
import { Feature, UserTier } from "@/lib/feature-flags/types";
import { FEATURE_METADATA, TIER_CONFIGS, getNextTier, getUpgradeUrl } from "@/lib/feature-flags/config";
import { useFeatures } from "@/hooks/useFeatures";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Sparkles, Zap, Crown } from "lucide-react";

interface UpgradePromptProps {
  feature: Feature;
  variant?: "alert" | "card" | "inline";
  className?: string;
}

/**
 * UpgradePrompt - Shows message to upgrade for feature access
 *
 * @example
 * <UpgradePrompt feature={Feature.WORLDS} />
 *
 * @example
 * <UpgradePrompt feature={Feature.IMAGE_GENERATION} variant="card" />
 */
export function UpgradePrompt({
  feature,
  variant = "alert",
  className = "",
}: UpgradePromptProps) {
  const { userTier } = useFeatures();
  const metadata = FEATURE_METADATA[feature];
  const nextTier = getNextTier(userTier);
  const targetTier = nextTier || metadata.minTier;
  const targetConfig = TIER_CONFIGS[targetTier];
  const upgradeUrl = getUpgradeUrl(targetTier);

  const TierIcon = getTierIcon(targetTier);

  if (variant === "card") {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
            <TierIcon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold">{metadata.name}</h3>
            <p className="text-sm text-muted-foreground">
              {metadata.upgradeMessage}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link href={upgradeUrl}>
                <Button>
                  Actualizar a {targetConfig.name}
                  {targetConfig.price && (
                    <span className="ml-2 text-xs opacity-80">
                      desde ${targetConfig.price.monthly}/mes
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost">Ver planes</Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Lock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {metadata.upgradeMessage}
        </span>
        <Link href={upgradeUrl}>
          <Button size="sm" variant="outline">
            Actualizar
          </Button>
        </Link>
      </div>
    );
  }

  // Alert variant (default)
  return (
    <Alert className={className}>
      <Lock className="h-4 w-4" />
      <AlertTitle>{metadata.name} - {targetConfig.name} Feature</AlertTitle>
      <AlertDescription>
        <p className="mb-3">{metadata.upgradeMessage}</p>
        <div className="flex gap-2">
          <Link href={upgradeUrl}>
            <Button size="sm">
              Actualizar a {targetConfig.name}
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="sm" variant="outline">
              Ver planes
            </Button>
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * FeatureLocked - Button/element that shows locked state
 *
 * @example
 * <FeatureLocked feature={Feature.WORLDS}>
 *   <button>Create World</button>
 * </FeatureLocked>
 */
interface FeatureLockedProps {
  feature: Feature;
  children: React.ReactNode;
  showTooltip?: boolean;
}

export function FeatureLocked({
  feature,
  children,
  showTooltip = true,
}: FeatureLockedProps) {
  const metadata = FEATURE_METADATA[feature];

  return (
    <div className="relative group">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Lock className="h-5 w-5 text-muted-foreground" />
      </div>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
          <div className="bg-popover border rounded-2xl shadow-lg p-3 whitespace-nowrap">
            <p className="text-sm font-medium">{metadata.name}</p>
            <p className="text-xs text-muted-foreground">
              {metadata.upgradeMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * TierBadge - Shows user's current tier
 */
export function TierBadge({ tier }: { tier: UserTier }) {
  const config = TIER_CONFIGS[tier];
  const Icon = getTierIcon(tier);

  const colors = {
    [UserTier.FREE]: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    [UserTier.PLUS]: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    [UserTier.ULTRA]: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white",
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${colors[tier]}`}>
      <Icon className="h-4 w-4" />
      {config.name}
    </div>
  );
}

/**
 * UpgradeCTA - Call-to-action for upgrades
 */
export function UpgradeCTA({ feature }: { feature: Feature }) {
  const { userTier } = useFeatures();
  const metadata = FEATURE_METADATA[feature];
  const nextTier = getNextTier(userTier);
  const targetTier = nextTier || metadata.minTier;
  const targetConfig = TIER_CONFIGS[targetTier];
  const upgradeUrl = getUpgradeUrl(targetTier);

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Desbloquea {metadata.name}</h3>
          <p className="text-sm text-white/90">
            {metadata.upgradeMessage}
          </p>
          {targetConfig.price && (
            <p className="text-2xl font-bold">
              ${targetConfig.price.monthly}
              <span className="text-sm font-normal">/mes</span>
            </p>
          )}
        </div>
        <Crown className="h-12 w-12 text-white/80" />
      </div>
      <div className="mt-4 flex gap-3">
        <Link href={upgradeUrl}>
          <Button size="lg" variant="secondary">
            Actualizar ahora
          </Button>
        </Link>
        <Link href="/pricing">
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
            Ver todos los planes
          </Button>
        </Link>
      </div>
    </div>
  );
}

/**
 * Helper: Get icon for tier
 */
function getTierIcon(tier: UserTier): React.ComponentType<{ className?: string }> {
  switch (tier) {
    case UserTier.FREE:
      return Lock;
    case UserTier.PLUS:
      return Sparkles;
    case UserTier.ULTRA:
      return Crown;
    default:
      return Zap;
  }
}
