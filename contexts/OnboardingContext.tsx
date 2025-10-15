"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  OnboardingContextType,
  OnboardingProgress,
} from "@/lib/onboarding/types";
import { getTourById, getNextTour, getRequiredTours } from "@/lib/onboarding/tours";

const STORAGE_KEY = "onboarding_progress";

const defaultProgress: OnboardingProgress = {
  completedTours: [],
  completedSteps: [],
  currentTour: null,
  currentStep: 0,
  skippedTours: [],
  isOnboardingComplete: false,
  lastUpdated: new Date(),
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<OnboardingProgress>(defaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProgress({
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated),
        });
      } catch (error) {
        console.error("Failed to parse onboarding progress:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, [progress, isLoaded]);

  const startTour = useCallback((tourId: string) => {
    const tour = getTourById(tourId);
    if (!tour) {
      console.error(`Tour ${tourId} not found`);
      return;
    }

    setProgress((prev) => ({
      ...prev,
      currentTour: tourId,
      currentStep: 0,
      lastUpdated: new Date(),
    }));
  }, []);

  const nextStep = useCallback(() => {
    setProgress((prev) => {
      if (!prev.currentTour) return prev;

      const tour = getTourById(prev.currentTour);
      if (!tour) return prev;

      const currentStepData = tour.steps[prev.currentStep];
      const newCompletedSteps = [...prev.completedSteps];
      if (currentStepData && !newCompletedSteps.includes(currentStepData.id)) {
        newCompletedSteps.push(currentStepData.id);
      }

      // If this was the last step, complete the tour
      if (prev.currentStep >= tour.steps.length - 1) {
        return {
          ...prev,
          completedSteps: newCompletedSteps,
          completedTours: [...prev.completedTours, prev.currentTour],
          currentTour: null,
          currentStep: 0,
          lastUpdated: new Date(),
        };
      }

      return {
        ...prev,
        completedSteps: newCompletedSteps,
        currentStep: prev.currentStep + 1,
        lastUpdated: new Date(),
      };
    });
  }, []);

  const prevStep = useCallback(() => {
    setProgress((prev) => {
      if (!prev.currentTour || prev.currentStep === 0) return prev;

      return {
        ...prev,
        currentStep: prev.currentStep - 1,
        lastUpdated: new Date(),
      };
    });
  }, []);

  const skipTour = useCallback(() => {
    setProgress((prev) => {
      if (!prev.currentTour) return prev;

      return {
        ...prev,
        skippedTours: [...prev.skippedTours, prev.currentTour],
        currentTour: null,
        currentStep: 0,
        lastUpdated: new Date(),
      };
    });
  }, []);

  const completeTour = useCallback(() => {
    setProgress((prev) => {
      if (!prev.currentTour) return prev;

      const tour = getTourById(prev.currentTour);
      if (!tour) return prev;

      // Mark all steps as completed
      const allStepIds = tour.steps.map((step) => step.id);
      const newCompletedSteps = [
        ...new Set([...prev.completedSteps, ...allStepIds]),
      ];

      // Check if all required tours are now complete
      const requiredTours = getRequiredTours();
      const newCompletedTours = [...prev.completedTours, prev.currentTour];
      const allRequiredComplete = requiredTours.every((t) =>
        newCompletedTours.includes(t.id)
      );

      return {
        ...prev,
        completedSteps: newCompletedSteps,
        completedTours: newCompletedTours,
        currentTour: null,
        currentStep: 0,
        isOnboardingComplete: allRequiredComplete,
        lastUpdated: new Date(),
      };
    });
  }, []);

  const resetOnboarding = useCallback(() => {
    setProgress(defaultProgress);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isStepCompleted = useCallback(
    (stepId: string) => {
      return progress.completedSteps.includes(stepId);
    },
    [progress.completedSteps]
  );

  const isTourCompleted = useCallback(
    (tourId: string) => {
      return progress.completedTours.includes(tourId);
    },
    [progress.completedTours]
  );

  const value: OnboardingContextType = {
    progress,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    resetOnboarding,
    isStepCompleted,
    isTourCompleted,
  };

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
