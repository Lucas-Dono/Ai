/**
 * FeatureGate Component
 * Conditionally render children based on feature access
 */

"use client";

import { ReactNode } from "react";
import { Feature } from "@/lib/feature-flags/types";
import { useFeatures } from "@/hooks/useFeatures";
import { UpgradePrompt } from "./UpgradePrompt";

interface FeatureGateProps {
  feature: Feature;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  loadingFallback?: ReactNode;
}

/**
 * FeatureGate - Renders children only if user has access to feature
 *
 * @example
 * <FeatureGate feature={Feature.WORLDS}>
 *   <WorldCreator />
 * </FeatureGate>
 *
 * @example
 * <FeatureGate
 *   feature={Feature.IMAGE_GENERATION}
 *   fallback={<CustomUpgradeMessage />}
 * >
 *   <ImageGenerator />
 * </FeatureGate>
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  loadingFallback = null,
}: FeatureGateProps) {
  const { hasFeature, isLoading } = useFeatures();

  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  if (!hasFeature(feature)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showUpgradePrompt) {
      return <UpgradePrompt feature={feature} />;
    }

    return null;
  }

  return <>{children}</>;
}

/**
 * FeatureGuard - Higher-order component version
 *
 * @example
 * const ProtectedComponent = FeatureGuard(
 *   MyComponent,
 *   Feature.WORLDS
 * );
 */
export function FeatureGuard<P extends object>(
  Component: React.ComponentType<P>,
  feature: Feature,
  fallback?: ReactNode
) {
  return function GuardedComponent(props: P) {
    return (
      <FeatureGate feature={feature} fallback={fallback}>
        <Component {...props} />
      </FeatureGate>
    );
  };
}
