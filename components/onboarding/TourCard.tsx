"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { OnboardingStep } from "@/lib/onboarding/types";
import Link from "next/link";

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
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const handleAction = () => {
    if (step.action?.onClick) {
      step.action.onClick();
    }
    if (isLastStep) {
      onComplete();
    } else {
      onNext();
    }
  };

  return (
    <Card
      className="w-[400px] shadow-2xl border-2 border-primary/20 animate-in fade-in slide-in-from-bottom-4"
      style={{
        position: "fixed",
        zIndex: 10001,
        ...position,
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Badge variant="secondary" className="mb-2">
              Step {currentStep + 1} of {totalSteps}
            </Badge>
            <CardTitle className="text-lg">{step.title}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSkip}
            className="h-8 w-8 -mr-2 -mt-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.description}
        </p>
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
          Back
        </Button>

        <div className="flex gap-2">
          {!isLastStep && (
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip Tour
            </Button>
          )}

          {step.action ? (
            step.action.href ? (
              <Link href={step.action.href}>
                <Button size="sm" onClick={handleAction} className="gap-1">
                  {step.action.label}
                  {isLastStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </Link>
            ) : (
              <Button size="sm" onClick={handleAction} className="gap-1">
                {step.action.label}
                {isLastStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )
          ) : (
            <Button size="sm" onClick={isLastStep ? onComplete : onNext} className="gap-1">
              {isLastStep ? "Complete" : "Next"}
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
