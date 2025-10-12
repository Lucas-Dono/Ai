export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: "top" | "bottom" | "left" | "right";
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  condition?: () => boolean; // Optional condition to show step
}

export interface OnboardingTour {
  id: string;
  name: string;
  description: string;
  steps: OnboardingStep[];
  requiredForCompletion?: boolean;
}

export interface OnboardingProgress {
  completedTours: string[];
  completedSteps: string[];
  currentTour: string | null;
  currentStep: number;
  skippedTours: string[];
  isOnboardingComplete: boolean;
  lastUpdated: Date;
}

export interface OnboardingContextType {
  progress: OnboardingProgress;
  startTour: (tourId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  resetOnboarding: () => void;
  isStepCompleted: (stepId: string) => boolean;
  isTourCompleted: (tourId: string) => boolean;
}
