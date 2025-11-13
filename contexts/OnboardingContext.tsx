"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useTransition } from "react";
import {
  OnboardingContextType,
  OnboardingProgress,
} from "@/lib/onboarding/types";
import { useOnboardingTours, getTourById, getNextTour, getRequiredTours } from "@/lib/onboarding/tours";
import { awardTourCompletion, checkMasterBadge, type TourReward } from "@/lib/onboarding/gamification";
import { useRouter, usePathname } from "next/navigation";

const STORAGE_KEY = "onboarding_progress";
const PENDING_TOUR_KEY = "pending_tour";

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
  const [currentReward, setCurrentReward] = useState<TourReward | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  // Obtener tours traducidos
  const onboardingTours = useOnboardingTours();

  // Load progress from backend (with localStorage fallback)
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // Try to load from backend first
        const response = await fetch('/api/onboarding/progress');

        // Check if response is actually JSON before trying to parse
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');

        if (response.ok && isJson) {
          let data;
          try {
            data = await response.json();
          } catch (jsonError) {
            console.error("Failed to parse backend response as JSON:", jsonError);
            throw new Error("Invalid JSON response from backend");
          }

          // Convert backend data to local format
          const backendProgress: OnboardingProgress = {
            completedTours: data.completedTours || [],
            completedSteps: [], // Backend doesn't track individual steps
            currentTour: data.currentTour || null,
            currentStep: data.currentStep || 0,
            skippedTours: [],
            isOnboardingComplete: false,
            lastUpdated: new Date(),
          };

          setProgress(backendProgress);

          // Also restore badges and karma from backend
          if (data.badges) {
            localStorage.setItem('unlocked_badges', JSON.stringify(data.badges));
          }
          if (data.totalKarma !== undefined) {
            localStorage.setItem('total_karma', data.totalKarma.toString());
          }
          if (data.shownTriggers) {
            localStorage.setItem('contextualTriggers', JSON.stringify(data.shownTriggers));
          }

          // Save progress to localStorage as cache
          localStorage.setItem(STORAGE_KEY, JSON.stringify(backendProgress));
        } else if (response.status === 401) {
          // User not authenticated - this is expected on public pages
          console.debug("User not authenticated, using localStorage fallback");
          throw new Error("Not authenticated");
        } else if (!isJson) {
          // Response is not JSON (probably HTML from a redirect)
          console.debug("Backend returned non-JSON response (probably redirect), using localStorage fallback");
          throw new Error("Non-JSON response from backend");
        } else {
          throw new Error(`Backend returned ${response.status}`);
        }
      } catch (error) {
        console.debug("Using localStorage fallback for onboarding progress:", error instanceof Error ? error.message : error);

        // Fallback to localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && stored.trim()) {
          try {
            const parsed = JSON.parse(stored);
            setProgress({
              ...parsed,
              lastUpdated: new Date(parsed.lastUpdated),
            });
          } catch (parseError) {
            console.error("Failed to parse localStorage onboarding progress, resetting:", parseError);
            // Clear corrupted localStorage data
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem('unlocked_badges');
            localStorage.removeItem('total_karma');
            localStorage.removeItem('contextualTriggers');
            // Use default progress
            setProgress(defaultProgress);
          }
        } else {
          // No stored data, use defaults
          setProgress(defaultProgress);
        }
      } finally {
        setIsLoaded(true);
      }
    };

    loadProgress();
  }, []);

  // Save progress to both localStorage and backend (but not while navigating)
  useEffect(() => {
    if (isLoaded && !isNavigating) {
      // Save to localStorage immediately (for quick access)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

      // Sync to backend (async, non-blocking)
      const syncToBackend = async () => {
        try {
          // Get badges and karma from localStorage (gamification system)
          const badges = JSON.parse(localStorage.getItem('unlocked_badges') || '[]');
          const karma = parseInt(localStorage.getItem('total_karma') || '0', 10);
          const triggers = JSON.parse(localStorage.getItem('contextualTriggers') || '{}');

          await fetch('/api/onboarding/progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              completedTours: progress.completedTours,
              currentTour: progress.currentTour,
              currentStep: progress.currentStep,
              badges: badges,
              totalKarma: karma,
              shownTriggers: triggers,
            }),
          });
        } catch (error) {
          // Silent fail - localStorage is still working
          console.error("Failed to sync progress to backend:", error);
        }
      };

      // Debounce sync to avoid too many requests
      const timeoutId = setTimeout(syncToBackend, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [progress, isLoaded, isNavigating]);

  // Restaurar tour pendiente después de navegación
  useEffect(() => {
    console.log('🔄 [TOUR] Restore effect triggered:', { isNavigating, isLoaded, pathname });

    if (!isNavigating && isLoaded) {
      // Usar requestAnimationFrame para asegurar que el DOM esté listo
      const frameId = requestAnimationFrame(() => {
        const pendingTour = sessionStorage.getItem(PENDING_TOUR_KEY);
        console.log('📦 [TOUR] Checking sessionStorage:', pendingTour);

        if (pendingTour) {
          try {
            const { tourId, step, timestamp } = JSON.parse(pendingTour);
            const age = Date.now() - timestamp;
            console.log('⏰ [TOUR] Pending tour age:', age, 'ms');

            // Solo restaurar si es reciente (< 5 segundos)
            if (age < 5000) {
              console.log('✅ [TOUR] Restoring tour:', { tourId, step });
              setProgress((prev) => ({
                ...prev,
                currentTour: tourId,
                currentStep: step,
                lastUpdated: new Date(),
              }));
            } else {
              console.log('⏰ [TOUR] Tour too old, discarding');
            }
            sessionStorage.removeItem(PENDING_TOUR_KEY);
          } catch (error) {
            console.error('❌ [TOUR] Error restoring pending tour:', error);
            sessionStorage.removeItem(PENDING_TOUR_KEY);
          }
        } else {
          console.log('📭 [TOUR] No pending tour in sessionStorage');
        }
      });

      return () => cancelAnimationFrame(frameId);
    }
  }, [isNavigating, pathname, isLoaded]);

  // Detectar cuando la navegación se completa
  useEffect(() => {
    console.log('🎯 [TOUR] Navigation detection effect:', { pathname, isNavigating });

    if (isNavigating) {
      console.log('⏳ [TOUR] Navigation in progress, waiting for next frame');

      let timerId: NodeJS.Timeout | null = null;

      // Usar requestAnimationFrame para asegurar que el DOM esté actualizado
      // antes de marcar la navegación como completa
      const frameId = requestAnimationFrame(() => {
        timerId = setTimeout(() => {
          console.log('✅ [TOUR] Navigation complete, setting isNavigating to false');
          setIsNavigating(false);
        }, 50); // Reducido de 100ms a 50ms
      });

      return () => {
        console.log('🧹 [TOUR] Cleaning up navigation timer');
        cancelAnimationFrame(frameId);
        if (timerId) {
          clearTimeout(timerId);
        }
      };
    }
  }, [pathname, isNavigating]);

  const startTour = useCallback((tourId: string) => {
    console.log('🎯 [TOUR] startTour called:', { tourId, currentPath: pathname });
    const startTime = performance.now();

    const tour = getTourById(onboardingTours, tourId);
    if (!tour) {
      console.error(`Tour ${tourId} not found`);
      return;
    }

    console.log('🎯 [TOUR] Tour found:', { tourId, startPage: tour.startPage });

    // Si necesitamos navegar a otra página
    if (tour.startPage && pathname !== tour.startPage) {
      console.log('🚀 [TOUR] Navigation required:', { from: pathname, to: tour.startPage });

      // Guardar el tour en sessionStorage ANTES de navegar
      const pendingData = {
        tourId,
        step: 0,
        timestamp: Date.now()
      };
      sessionStorage.setItem(PENDING_TOUR_KEY, JSON.stringify(pendingData));
      console.log('💾 [TOUR] Saved to sessionStorage:', pendingData);

      setIsNavigating(true);
      console.log('⏱️ [TOUR] Time before navigation:', performance.now() - startTime, 'ms');

      // Navegar usando transition para evitar errores
      startTransition(() => {
        console.log('🌐 [TOUR] Calling router.push');
        router.push(tour.startPage!);
      });
    } else {
      console.log('✅ [TOUR] Already on correct page, starting immediately');
      // Ya estamos en la página correcta, iniciar inmediatamente
      setProgress((prev) => ({
        ...prev,
        currentTour: tourId,
        currentStep: 0,
        lastUpdated: new Date(),
      }));
      console.log('⏱️ [TOUR] Total time:', performance.now() - startTime, 'ms');
    }
  }, [onboardingTours, pathname, router]);

  const nextStep = useCallback(() => {
    setProgress((prev) => {
      if (!prev.currentTour) return prev;

      const tour = getTourById(onboardingTours, prev.currentTour);
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

      // Check if next step requires a different page
      const nextStepData = tour.steps[prev.currentStep + 1];
      const nextState = {
        ...prev,
        completedSteps: newCompletedSteps,
        currentStep: prev.currentStep + 1,
        lastUpdated: new Date(),
      };

      if (nextStepData?.requiredPage && pathname !== nextStepData.requiredPage) {
        // Guardar estado antes de navegar
        sessionStorage.setItem(PENDING_TOUR_KEY, JSON.stringify({
          tourId: prev.currentTour,
          step: prev.currentStep + 1,
          timestamp: Date.now()
        }));

        setIsNavigating(true);
        startTransition(() => {
          router.push(nextStepData.requiredPage!);
        });
      }

      return nextState;
    });
  }, [onboardingTours, pathname, router]);

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
    // Limpiar cualquier tour pendiente
    sessionStorage.removeItem(PENDING_TOUR_KEY);

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

  const completeTour = useCallback(async () => {
    // Limpiar cualquier tour pendiente
    sessionStorage.removeItem(PENDING_TOUR_KEY);

    setProgress((prev) => {
      if (!prev.currentTour) return prev;

      const tour = getTourById(onboardingTours, prev.currentTour);
      if (!tour) return prev;

      // Mark all steps as completed
      const allStepIds = tour.steps.map((step) => step.id);
      const newCompletedSteps = [
        ...new Set([...prev.completedSteps, ...allStepIds]),
      ];

      // Check if all required tours are now complete
      const requiredTours = getRequiredTours(onboardingTours);
      const newCompletedTours = [...prev.completedTours, prev.currentTour];
      const allRequiredComplete = requiredTours.every((t) =>
        newCompletedTours.includes(t.id)
      );

      // Award rewards asynchronously
      (async () => {
        const reward = await awardTourCompletion(prev.currentTour!);
        if (reward) {
          setCurrentReward(reward);
        }

        // Check for master badge
        const earnedMasterBadge = checkMasterBadge(newCompletedTours);
        if (earnedMasterBadge) {
          console.log('🏆 Master Badge earned!');
        }
      })();

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
  }, [onboardingTours]);

  const resetOnboarding = useCallback(async () => {
    setProgress(defaultProgress);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('unlocked_badges');
    localStorage.removeItem('total_karma');
    localStorage.removeItem('unlocked_features');
    localStorage.removeItem('contextualTriggers');
    sessionStorage.removeItem(PENDING_TOUR_KEY);

    // Also reset on backend
    try {
      await fetch('/api/onboarding/progress', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error("Failed to reset progress on backend:", error);
    }
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

  const clearReward = useCallback(() => {
    setCurrentReward(null);
  }, []);

  // Mark a step as completed (for URL-based tours)
  const markStepCompleted = useCallback((stepId: string) => {
    setProgress((prev) => {
      if (prev.completedSteps.includes(stepId)) {
        return prev; // Already completed
      }

      const newCompletedSteps = [...prev.completedSteps, stepId];

      // Save to localStorage
      const newProgress = {
        ...prev,
        completedSteps: newCompletedSteps,
        lastUpdated: new Date(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));

      return newProgress;
    });
  }, []);

  // Mark a tour as completed (for URL-based tours)
  const markTourCompleted = useCallback(async (tourId: string) => {
    setProgress((prev) => {
      if (prev.completedTours.includes(tourId)) {
        return prev; // Already completed
      }

      const newCompletedTours = [...prev.completedTours, tourId];

      // Check if all required tours are complete
      const requiredTours = getRequiredTours(onboardingTours);
      const allRequiredComplete = requiredTours.every((tour) =>
        newCompletedTours.includes(tour.id)
      );

      // Save to localStorage
      const newProgress = {
        ...prev,
        completedTours: newCompletedTours,
        isOnboardingComplete: allRequiredComplete,
        lastUpdated: new Date(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));

      // Award completion rewards asynchronously
      (async () => {
        const reward = await awardTourCompletion(tourId);
        if (reward) {
          setCurrentReward(reward);
        }

        // Persist progress to backend
        try {
          await fetch('/api/onboarding/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              completedTours: newCompletedTours,
            }),
          });
        } catch (error) {
          console.error("Failed to persist tour completion to backend:", error);
        }

        // Check for master badge
        const earnedMasterBadge = checkMasterBadge(newCompletedTours);
        if (earnedMasterBadge) {
          console.log('🏆 Master Badge earned!');
        }
      })();

      return newProgress;
    });
  }, [onboardingTours]);

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
    currentReward,
    clearReward,
    markStepCompleted,
    markTourCompleted,
  };

  // Render the provider even if not loaded, just don't show children yet
  return (
    <OnboardingContext.Provider value={value}>
      {isLoaded ? children : null}
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
