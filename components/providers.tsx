"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { SWRProvider } from "@/lib/swr/config";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        <SWRProvider>
          <OnboardingProvider>
            {children}
            <Toaster position="top-right" richColors />
          </OnboardingProvider>
        </SWRProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
