"use client";

import { useEffect } from "react";
import { LandingWrapper } from "@/components/landing/LandingWrapper";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { InteractiveDemoSection } from "@/components/landing/InteractiveDemoSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { SocialProof } from "@/components/landing/SocialProof";
import { DownloadsSection } from "@/components/landing/DownloadsSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { trackPageView, createScrollDepthTracker } from "@/lib/analytics/track-client";

export default function LandingPage() {
  // Track page view on mount
  useEffect(() => {
    trackPageView({
      page: 'landing',
      title: 'Crea IAs Emocionales con Memoria Real',
    }).catch(() => {});
  }, []);

  // Track scroll depth
  useEffect(() => {
    const tracker = createScrollDepthTracker();
    return () => tracker.cleanup();
  }, []);
  // JSON-LD Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Blaniel",
    applicationCategory: "CommunicationApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "10000",
    },
    operatingSystem: "Web, iOS, Android",
    description:
      "Create emotional AI companions with real emotions, long-term memory, and interactive virtual worlds. Uncensored, unlimited.",
    featureList: [
      "Real Emotions (OCC + Plutchik)",
      "Long-term Memory",
      "Virtual Worlds",
      "Proactive Behavior",
      "Complete Customization",
      "Active Community",
      "Uncensored Content",
      "Open API",
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <LandingWrapper>
        <HeroSection />
        <DownloadsSection />
        <div id="features">
          <FeaturesGrid />
        </div>
        <InteractiveDemoSection />
        <HowItWorks />
        <ComparisonTable />
        <SocialProof />
        <FinalCTA />
      </LandingWrapper>
    </>
  );
}
