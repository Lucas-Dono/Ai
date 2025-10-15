"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { OnboardingProvider } from "@/contexts/OnboardingContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        <OnboardingProvider>{children}</OnboardingProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
