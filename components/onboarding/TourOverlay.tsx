"use client";

import { useEffect, useState, useCallback } from "react";
import { TourCard } from "./TourCard";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { getTourById } from "@/lib/onboarding/tours";
import { OnboardingStep } from "@/lib/onboarding/types";

export function TourOverlay() {
  const { progress, nextStep, prevStep, skipTour, completeTour } = useOnboarding();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [cardPosition, setCardPosition] = useState<any>({});

  const currentTour = progress.currentTour ? getTourById(progress.currentTour) : null;
  const currentStepData: OnboardingStep | undefined = currentTour?.steps[progress.currentStep];

  const calculatePosition = useCallback((element: HTMLElement | null, step: OnboardingStep) => {
    if (!element) {
      // Center the card if no target
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const rect = element.getBoundingClientRect();
    const cardWidth = 400;
    const cardHeight = 280; // Approximate
    const spacing = 20;

    let position: any = {};

    switch (step.position) {
      case "top":
        position = {
          bottom: window.innerHeight - rect.top + spacing,
          left: Math.max(spacing, rect.left + rect.width / 2 - cardWidth / 2),
        };
        break;
      case "bottom":
        position = {
          top: rect.bottom + spacing,
          left: Math.max(spacing, rect.left + rect.width / 2 - cardWidth / 2),
        };
        break;
      case "left":
        position = {
          top: Math.max(spacing, rect.top + rect.height / 2 - cardHeight / 2),
          right: window.innerWidth - rect.left + spacing,
        };
        break;
      case "right":
        position = {
          top: Math.max(spacing, rect.top + rect.height / 2 - cardHeight / 2),
          left: rect.right + spacing,
        };
        break;
      default:
        position = {
          top: rect.bottom + spacing,
          left: Math.max(spacing, rect.left + rect.width / 2 - cardWidth / 2),
        };
    }

    // Ensure card stays within viewport
    if (position.left && position.left + cardWidth > window.innerWidth - spacing) {
      position.left = window.innerWidth - cardWidth - spacing;
    }
    if (position.top && position.top + cardHeight > window.innerHeight - spacing) {
      position.top = window.innerHeight - cardHeight - spacing;
    }

    return position;
  }, []);

  useEffect(() => {
    if (!currentStepData?.target) {
      setTargetElement(null);
      setCardPosition(calculatePosition(null, currentStepData!));
      return;
    }

    // Find target element
    const element = document.querySelector(currentStepData.target) as HTMLElement;
    setTargetElement(element);
    setCardPosition(calculatePosition(element, currentStepData));

    // Scroll target into view
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    // Recalculate position on window resize
    const handleResize = () => {
      setCardPosition(calculatePosition(element, currentStepData));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentStepData, calculatePosition]);

  if (!currentTour || !currentStepData) {
    return null;
  }

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        style={{ zIndex: 10000 }}
        onClick={skipTour}
      />

      {/* Spotlight on target element */}
      {targetElement && (
        <div
          className="fixed border-4 border-primary rounded-xl shadow-2xl pointer-events-none animate-pulse"
          style={{
            zIndex: 10000,
            top: targetElement.getBoundingClientRect().top - 4,
            left: targetElement.getBoundingClientRect().left - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
          }}
        />
      )}

      {/* Tour card */}
      <TourCard
        step={currentStepData}
        currentStep={progress.currentStep}
        totalSteps={currentTour.steps.length}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipTour}
        onComplete={completeTour}
        position={cardPosition}
      />
    </>
  );
}
