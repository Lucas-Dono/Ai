"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X, Check, Loader2 } from "lucide-react";
import { OnboardingStep } from "@/lib/onboarding/types";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { useState, useEffect } from "react";

interface TourCardProps {
  step: OnboardingStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: () => void;
  position?: { top?: number; left?: number; right?: number; bottom?: number };
}

export function TourCard({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onComplete,
  position,
}: TourCardProps) {
  const t = useTranslations('tours.common');
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const [isValidated, setIsValidated] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Check validation status periodically
  useEffect(() => {
    // Reset validation state when step changes
    setIsValidated(false);
    setIsChecking(false);

    if (!step.validation || !step.requiresCompletion) {
      setIsValidated(true);
      return;
    }

    // Store the validation function reference to use in the interval
    const validationCheck = step.validation.customCheck;
    if (!validationCheck) {
      setIsValidated(true);
      return;
    }

    const checkValidation = async () => {
      setIsChecking(true);
      try {
        const result = await validationCheck();
        setIsValidated(result);
      } catch (error) {
        console.error('Validation check failed:', error);
        setIsValidated(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Check immediately
    checkValidation();

    // Check periodically (every 500ms)
    const interval = setInterval(checkValidation, 500);

    return () => clearInterval(interval);
    // Only re-run when step ID changes (not the whole step object)
    // We capture validationCheck at the start of the effect, so we don't need it in deps
  }, [step.id, step.requiresCompletion]);

  const handleAction = () => {
    // Mark that we're in a tour if navigating to another page
    if (step.action?.href) {
      // Check if the href is for creating a post
      if (step.action.href.includes('/community/create')) {
        sessionStorage.setItem('community_tour_active', 'true');
      }
    }

    if (step.action?.onClick) {
      step.action.onClick();
    }
    if (isLastStep) {
      onComplete();
    } else {
      onNext();
    }
  };

  const canProceed = !step.requiresCompletion || isValidated;
  const canSkip = !step.requiresCompletion;

  // Debug: log position
  console.log('🎴 [TOUR CARD] Rendering with position:', position);
  console.log('🎴 [TOUR CARD] Step:', step.id);

  // Ensure position has some default values if undefined/empty
  const safePosition = position && Object.keys(position).length > 0
    ? position
    : {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };

  console.log('🎴 [TOUR CARD] Safe position (after fallback):', safePosition);

  return (
    <Card
      className="w-[calc(100vw-2rem)] max-w-[400px] shadow-2xl border-2 border-primary/20 animate-in fade-in slide-in-from-bottom-4"
      style={{
        position: "fixed",
        zIndex: 10001,
        pointerEvents: "auto",
        ...safePosition,
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Badge variant="secondary" className="mb-2">
              {t("stepOf", { current: currentStep + 1, total: totalSteps })}
            </Badge>
            <CardTitle className="text-lg">{step.title}</CardTitle>
          </div>
          {canSkip && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSkip}
              className="h-8 w-8 -mr-2 -mt-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.description}
        </p>

        {/* Wait message for interactive steps */}
        {step.requiresCompletion && step.waitMessage && !isValidated && (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3">
            <p className="text-xs text-primary font-medium flex items-center gap-2">
              {isChecking && <Loader2 className="h-3 w-3 animate-spin" />}
              {step.waitMessage}
            </p>
          </div>
        )}

        {/* Success message when validated */}
        {step.requiresCompletion && isValidated && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-3">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
              <Check className="h-3 w-3" />
              ¡Perfecto! Puedes continuar al siguiente paso.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={isFirstStep}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("back")}
        </Button>

        <div className="flex gap-2">
          {!isLastStep && canSkip && (
            <Button variant="ghost" size="sm" onClick={onSkip}>
              {t("skipTour")}
            </Button>
          )}

          {step.action ? (
            step.action.href ? (
              <Link href={step.action.href}>
                <Button
                  size="sm"
                  onClick={handleAction}
                  className="gap-1"
                  disabled={!canProceed}
                >
                  {step.action.label}
                  {isLastStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </Link>
            ) : (
              <Button
                size="sm"
                onClick={handleAction}
                className="gap-1"
                disabled={!canProceed}
              >
                {step.action.label}
                {isLastStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )
          ) : (
            <Button
              size="sm"
              onClick={isLastStep ? onComplete : onNext}
              className="gap-1"
              disabled={!canProceed}
            >
              {isLastStep ? t("complete") : t("next")}
              {isLastStep ? (
                <Check className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardFooter>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 pb-4">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all ${
              idx === currentStep
                ? "w-6 bg-primary"
                : idx < currentStep
                ? "w-1.5 bg-primary/50"
                : "w-1.5 bg-muted"
            }`}
          />
        ))}
      </div>
    </Card>
  );
}
