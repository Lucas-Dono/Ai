"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { onboardingTours } from "@/lib/onboarding/tours";
import { GraduationCap, Check, PlayCircle, RotateCcw } from "lucide-react";

export function OnboardingMenu() {
  const { progress, startTour, isTourCompleted, resetOnboarding } = useOnboarding();
  const [open, setOpen] = useState(false);

  const completedCount = progress.completedTours.length;
  const totalCount = onboardingTours.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  const handleStartTour = (tourId: string) => {
    startTour(tourId);
    setOpen(false);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your onboarding progress?")) {
      resetOnboarding();
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative gap-2">
          <GraduationCap className="h-4 w-4" />
          Tours
          {!progress.isOnboardingComplete && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {completedCount}/{totalCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Onboarding Tours</span>
          {progress.isOnboardingComplete && (
            <Badge variant="success" className="gap-1">
              <Check className="h-3 w-3" />
              Complete
            </Badge>
          )}
        </DropdownMenuLabel>

        {!progress.isOnboardingComplete && (
          <>
            <div className="px-2 py-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Overall Progress</span>
                <span className="font-medium">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <div className="max-h-[400px] overflow-y-auto">
          {onboardingTours.map((tour) => {
            const isCompleted = isTourCompleted(tour.id);
            const isRequired = tour.requiredForCompletion;

            return (
              <DropdownMenuItem
                key={tour.id}
                onClick={() => handleStartTour(tour.id)}
                className="flex items-start gap-3 py-3 cursor-pointer"
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <PlayCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{tour.name}</span>
                    {isRequired && !isCompleted && (
                      <Badge variant="outline" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {tour.description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {tour.steps.length} steps
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleReset} className="text-destructive">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Progress
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
