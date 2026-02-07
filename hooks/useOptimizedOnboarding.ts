/**
 * OPTIMIZED ONBOARDING HOOK
 *
 * Comprehensive hook for managing onboarding with:
 * - Analytics tracking
 * - Time tracking per step
 * - A/B testing support
 * - Progress persistence
 * - Auto-save state
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { onboardingAnalytics, OnboardingStep } from "@/lib/onboarding/analytics";
import { OnboardingTracker } from "@/lib/onboarding/tracking";

export interface OnboardingState {
  currentStep: OnboardingStep;
  selectedTemplate?: {
    id: string;
    name: string;
    description: string;
    personality: string;
    icon: any;
    color: string;
  };
  createdAgentId?: string;
  hasCompletedChat?: boolean;
  startTime?: number;
  stepStartTimes: Record<OnboardingStep, number>;
}

export interface UseOptimizedOnboardingReturn {
  // State
  state: OnboardingState;
  currentStep: OnboardingStep;
  progress: number;

  // Navigation
  nextStep: () => void;
  goToStep: (step: OnboardingStep) => void;
  skipStep: (reason?: string) => void;
  skipToDashboard: () => void;

  // Actions
  selectTemplate: (template: any, agentId: string) => void;
  completeChat: () => void;
  completeCustomization: () => void;
  completeCommunity: () => void;
  completeOnboarding: () => void;

  // Analytics
  trackTemplateSelect: (templateId: string, templateName: string) => void;
  trackMessageSent: (messageNumber: number, isSuggested: boolean) => void;

  // Utilities
  getTimeSpentOnCurrentStep: () => number;
  getTotalTimeSpent: () => number;
}

const STEPS: OnboardingStep[] = ["intro", "choose", "chat", "customize", "community", "complete"];
const STORAGE_KEY = "optimized_onboarding_state";

export function useOptimizedOnboarding(): UseOptimizedOnboardingReturn {
  const router = useRouter();

  // Initialize state from localStorage if available
  const [state, setState] = useState<OnboardingState>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return {
            ...parsed,
            stepStartTimes: parsed.stepStartTimes || {},
          };
        } catch {
          // Ignore parse errors
        }
      }
    }

    return {
      currentStep: "intro" as OnboardingStep,
      stepStartTimes: {
        intro: Date.now(),
      } as Record<OnboardingStep, number>,
      startTime: Date.now(),
    };
  });

  // Track step start time
  const stepStartTimeRef = useRef<number>(Date.now());

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  // Track step view on mount and when step changes
  useEffect(() => {
    onboardingAnalytics.trackStepView(state.currentStep);
    stepStartTimeRef.current = Date.now();

    // Update step start times
    setState(prev => ({
      ...prev,
      stepStartTimes: {
        ...prev.stepStartTimes,
        [state.currentStep]: Date.now(),
      },
    }));
  }, [state.currentStep]);

  // Check if onboarding was already completed
  useEffect(() => {
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem("onboarding_completed");
      if (completed === "true") {
        router.push("/dashboard");
      }
    }
  }, [router]);

  /**
   * Get time spent on current step in milliseconds
   */
  const getTimeSpentOnCurrentStep = useCallback((): number => {
    return Date.now() - stepStartTimeRef.current;
  }, []);

  /**
   * Get total time spent in onboarding in milliseconds
   */
  const getTotalTimeSpent = useCallback((): number => {
    return state.startTime ? Date.now() - state.startTime : 0;
  }, [state.startTime]);

  /**
   * Move to next step
   */
  const nextStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(state.currentStep);
    if (currentIndex < STEPS.length - 1) {
      const timeSpent = getTimeSpentOnCurrentStep();

      // Track completion of current step
      onboardingAnalytics.trackStepComplete(state.currentStep, { timeSpent });

      const nextStepIndex = currentIndex + 1;
      setState(prev => ({
        ...prev,
        currentStep: STEPS[nextStepIndex],
      }));
    }
  }, [state.currentStep, getTimeSpentOnCurrentStep]);

  /**
   * Go to specific step
   */
  const goToStep = useCallback((step: OnboardingStep) => {
    const timeSpent = getTimeSpentOnCurrentStep();
    onboardingAnalytics.trackStepComplete(state.currentStep, { timeSpent });

    setState(prev => ({
      ...prev,
      currentStep: step,
    }));
  }, [state.currentStep, getTimeSpentOnCurrentStep]);

  /**
   * Skip current step
   */
  const skipStep = useCallback((reason?: string) => {
    onboardingAnalytics.trackSkip(state.currentStep, reason);
    nextStep();
  }, [state.currentStep, nextStep]);

  /**
   * Skip entire onboarding and go to dashboard
   */
  const skipToDashboard = useCallback(() => {
    onboardingAnalytics.trackOnboardingAbandoned(state.currentStep, "user_skipped_to_dashboard");
    localStorage.setItem("onboarding_completed", "true");
    localStorage.removeItem(STORAGE_KEY);
    router.push("/dashboard");
  }, [state.currentStep, router]);

  /**
   * Handle template selection
   */
  const selectTemplate = useCallback((template: any, agentId: string) => {
    setState(prev => ({
      ...prev,
      selectedTemplate: template,
      createdAgentId: agentId,
    }));

    // Track in analytics
    onboardingAnalytics.trackTemplateSelect(template.id, template.name);
    onboardingAnalytics.trackAICreated(agentId, template.id);

    // Track in onboarding system
    OnboardingTracker.trackFirstAICreated();

    nextStep();
  }, [nextStep]);

  /**
   * Complete chat step
   */
  const completeChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasCompletedChat: true,
    }));

    OnboardingTracker.trackFirstConversation();
    nextStep();
  }, [nextStep]);

  /**
   * Complete customization step
   */
  const completeCustomization = useCallback(() => {
    OnboardingTracker.trackAICustomization();
    nextStep();
  }, [nextStep]);

  /**
   * Complete community step
   */
  const completeCommunity = useCallback(() => {
    OnboardingTracker.trackCommunityJoin();
    nextStep();
  }, [nextStep]);

  /**
   * Complete entire onboarding
   */
  const completeOnboarding = useCallback(() => {
    const totalTime = getTotalTimeSpent();

    // Track completion
    onboardingAnalytics.trackOnboardingComplete(totalTime);

    // Mark as completed
    localStorage.setItem("onboarding_completed", "true");
    localStorage.removeItem(STORAGE_KEY);

    // Redirect after delay
    setTimeout(() => {
      router.push("/dashboard");
    }, 3000);
  }, [getTotalTimeSpent, router]);

  /**
   * Track template selection (for analytics)
   */
  const trackTemplateSelect = useCallback((templateId: string, templateName: string) => {
    onboardingAnalytics.trackTemplateSelect(templateId, templateName);
  }, []);

  /**
   * Track message sent during first conversation
   */
  const trackMessageSent = useCallback((messageNumber: number, isSuggested: boolean) => {
    onboardingAnalytics.trackMessageSent(messageNumber, isSuggested);
  }, []);

  // Calculate progress percentage
  const progress = (STEPS.indexOf(state.currentStep) / (STEPS.length - 1)) * 100;

  return {
    // State
    state,
    currentStep: state.currentStep,
    progress,

    // Navigation
    nextStep,
    goToStep,
    skipStep,
    skipToDashboard,

    // Actions
    selectTemplate,
    completeChat,
    completeCustomization,
    completeCommunity,
    completeOnboarding,

    // Analytics
    trackTemplateSelect,
    trackMessageSent,

    // Utilities
    getTimeSpentOnCurrentStep,
    getTotalTimeSpent,
  };
}
