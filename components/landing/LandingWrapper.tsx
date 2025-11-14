"use client";

import { ReactNode } from "react";
import { LandingNav } from "./LandingNav";
import { LandingFooter } from "./LandingFooter";

interface LandingWrapperProps {
  children: ReactNode;
}

export function LandingWrapper({ children }: LandingWrapperProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
}
