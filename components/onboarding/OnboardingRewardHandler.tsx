"use client";

import { useOnboarding } from "@/contexts/OnboardingContext";
import { RewardNotification } from "./RewardNotification";

/**
 * Componente que maneja la visualización de recompensas
 * cuando el usuario completa tours
 */
export function OnboardingRewardHandler() {
  const { currentReward, clearReward } = useOnboarding();

  return (
    <RewardNotification
      reward={currentReward}
      onClose={clearReward}
    />
  );
}
