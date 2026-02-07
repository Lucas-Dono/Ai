import { Metadata } from "next";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SponsorsHero } from "@/components/sponsors/SponsorsHero";
import { HowItWorks } from "@/components/sponsors/HowItWorks";
import { VisualExamples } from "@/components/sponsors/VisualExamples";
import { OurAudience } from "@/components/sponsors/OurAudience";
import { InvestmentCalculator } from "@/components/sponsors/InvestmentCalculator";
import { WhyItWorks } from "@/components/sponsors/WhyItWorks";
import { FAQ } from "@/components/sponsors/FAQ";
import { FinalCTA } from "@/components/sponsors/FinalCTA";

export const metadata: Metadata = {
  title: "Sponsors | Publicidad Nativa en Conversaciones AI - Blaniel",
  description:
    "Publicidad contextual en conversaciones de IA. Engagement 3-5x mayor que display ads. Programa beta con precios desde $100/mes. Disponibilidad limitada.",
  keywords: [
    "sponsor",
    "advertising",
    "native advertising",
    "AI advertising",
    "conversational commerce",
    "product placement",
    "brand partnership",
    "marketing AI",
    "influencer marketing",
    "ROI marketing",
    "publicidad nativa",
    "conversational marketing",
  ],
  authors: [{ name: "Blaniel" }],
  creator: "Blaniel",
  publisher: "Blaniel",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/sponsors",
  },
  openGraph: {
    title: "Sponsors - Publicidad Nativa en Conversaciones AI | Blaniel",
    description:
      "Programa beta de publicidad contextual en conversaciones de IA. Engagement 3-5x mayor que display ads. Audiencia early-adopter tech con 25-35 min de sesión promedio.",
    url: "/sponsors",
    siteName: "Blaniel",
    images: [
      {
        url: "/og-image-sponsors.png", // Crear este imagen después
        width: 1200,
        height: 630,
        alt: "Blaniel Sponsors - Native AI Advertising",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sponsors - Publicidad Nativa en Conversaciones AI",
    description:
      "Programa beta de publicidad contextual. Engagement 3-5x mayor que display ads. Disponibilidad limitada - Q2 2026.",
    images: ["/og-image-sponsors.png"],
    creator: "@circuitpromptai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function SponsorsPage() {
  // JSON-LD Structured Data for Sponsors Page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Blaniel Sponsor Program - Beta",
    description:
      "Native advertising through contextual product placement in AI conversations. Beta program with flexible pricing based on impressions. Engagement 3-5x better than display ads.",
    provider: {
      "@type": "Organization",
      name: "Blaniel",
      url: process.env.NEXT_PUBLIC_APP_URL,
    },
    areaServed: ["Argentina", "Mexico", "United States", "Brazil", "Latin America"],
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "100",
      highPrice: "5000",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        referenceQuantity: {
          "@type": "QuantityValue",
          value: "1",
          unitText: "MONTH",
        },
      },
      availability: "https://schema.org/LimitedAvailability",
      availabilityStarts: "2026-04-01",
      description: "Flexible pricing based on impressions. Beta pricing available for early adopters.",
    },
    audience: {
      "@type": "Audience",
      audienceType: "Brand Marketers, CMOs, Marketing Directors, Startups",
      geographicArea: {
        "@type": "Place",
        name: "Latin America and United States",
      },
    },
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main wrapper */}
      <div className="min-h-screen bg-background">
        <LandingNav />
        <SponsorsHero />
        <HowItWorks />
        <VisualExamples />
        <OurAudience />
        <InvestmentCalculator />
        <WhyItWorks />
        <FAQ />
        <FinalCTA />
        <LandingFooter />
      </div>
    </>
  );
}
