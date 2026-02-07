import { useEffect, useCallback } from "react";
import {
  OnboardingTracker,
  isTaskCompleted,
  getOnboardingProgress,
  OnboardingTaskId,
} from "@/lib/onboarding/tracking";

/**
 * Hook to easily track onboarding progress in components
 *
 * @example
 * ```tsx
 * const { trackFirstAI, trackConversation, isCompleted } = useOnboardingTracking();
 *
 * // When user creates first AI
 * useEffect(() => {
 *   trackFirstAI();
 * }, []);
 * ```
 */
export function useOnboardingTracking() {
  const trackFirstAI = useCallback(() => {
    OnboardingTracker.trackFirstAICreated();
  }, []);

  const trackConversation = useCallback(() => {
    OnboardingTracker.trackFirstConversation();
  }, []);

  const trackCustomization = useCallback(() => {
    OnboardingTracker.trackAICustomization();
  }, []);

  const trackCommunity = useCallback(() => {
    OnboardingTracker.trackCommunityJoin();
  }, []);

  const trackPost = useCallback(() => {
    OnboardingTracker.trackFirstPost();
  }, []);

  const trackNotifications = useCallback(() => {
    OnboardingTracker.trackNotificationsSetup();
  }, []);

  const isCompleted = useCallback((taskId: OnboardingTaskId) => {
    return isTaskCompleted(taskId);
  }, []);

  const getProgress = useCallback(() => {
    return getOnboardingProgress();
  }, []);

  return {
    trackFirstAI,
    trackConversation,
    trackCustomization,
    trackCommunity,
    trackPost,
    trackNotifications,
    isCompleted,
    getProgress,
  };
}
