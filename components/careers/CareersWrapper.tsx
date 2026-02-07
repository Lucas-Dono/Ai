"use client";

import { ReactNode } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

interface CareersWrapperProps {
  children: ReactNode;
}

export function CareersWrapper({ children }: CareersWrapperProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
}
