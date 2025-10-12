"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Sparkles, X } from "lucide-react";
import confetti from "canvas-confetti";

export function WelcomeBanner() {
  const { progress, startTour, isTourCompleted } = useOnboarding();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show banner if user hasn't completed welcome tour and hasn't dismissed it
    const dismissed = localStorage.getItem("welcome_banner_dismissed");
    if (!isTourCompleted("welcome") && !dismissed) {
      setIsVisible(true);
    }
  }, [isTourCompleted]);

  const handleStartTour = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    startTour("welcome");
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("welcome_banner_dismissed", "true");
    setIsVisible(false);
    setIsDismissed(true);
  };

  if (!isVisible || progress.isOnboardingComplete) {
    return null;
  }

  return (
    <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl">Welcome to Creador de Inteligencias!</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-8 w-8 -mr-2 -mt-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-muted-foreground">
          We're excited to have you here! Take a quick tour to learn how to create and
          manage your AI agents. It only takes a few minutes and will help you get the
          most out of the platform.
        </p>
      </CardContent>

      <CardFooter className="gap-2">
        <Button onClick={handleStartTour} className="gap-2">
          <Sparkles className="h-4 w-4" />
          Start Tour
        </Button>
        <Button variant="outline" onClick={handleDismiss}>
          Maybe Later
        </Button>
      </CardFooter>
    </Card>
  );
}
