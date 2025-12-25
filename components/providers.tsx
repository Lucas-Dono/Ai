"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { SWRProvider } from "@/lib/swr/config";
import { Toaster } from "sonner";
import { TourOverlay } from "@/components/onboarding/TourOverlay";
import { OnboardingRewardHandler } from "@/components/onboarding/OnboardingRewardHandler";
import { CommandPalette, useCommandPalette } from "@/components/ui/command-palette";

/**
 * Componente interno que maneja el Command Palette
 * FASE 4: DELIGHT & POLISH
 */
function CommandPaletteWrapper() {
  const { open, setOpen } = useCommandPalette();

  return <CommandPalette open={open} onOpenChange={setOpen} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <SWRProvider>
        <OnboardingProvider>
          {children}
          <TourOverlay />
          <OnboardingRewardHandler />
          <CommandPaletteWrapper />
          <Toaster position="top-right" richColors />
        </OnboardingProvider>
      </SWRProvider>
    </ThemeProvider>
  );
}
