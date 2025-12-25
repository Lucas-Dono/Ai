import { Metadata } from "next";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SponsorsHero } from "@/components/sponsors/SponsorsHero";
import { HowItWorks } from "@/components/sponsors/HowItWorks";
import { VisualExamples } from "@/components/sponsors/VisualExamples";
import { OurAudience } from "@/components/sponsors/OurAudience";
import { PricingPackages } from "@/components/sponsors/PricingPackages";
import { CaseStudies } from "@/components/sponsors/CaseStudies";
import { FAQ } from "@/components/sponsors/FAQ";
import { FinalCTA } from "@/components/sponsors/FinalCTA";

export const metadata: Metadata = {
  title: "Sponsors | Publicidad Nativa en Conversaciones AI - Blaniel",
  description:
    "Llega a miles de usuarios comprometidos con product placement orgánico en conversaciones de IA. Engagement 10-50x mayor que display ads. Desde $2,500/mes.",
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
    title: "Sponsors - Publicidad Nativa que Convierte | Blaniel",
    description:
      "Product placement orgánico en conversaciones de IA. Engagement 10-50x mayor que display ads. Audience de alto valor con 28 min de sesión promedio.",
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
      "Engagement 10-50x mayor que display ads. Llega a usuarios de alto valor durante conversaciones que importan.",
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
    name: "Blaniel Sponsor Program",
    description:
      "Native advertising through contextual product placement in AI conversations. Reach engaged users with 10-50x better engagement than display ads.",
    provider: {
      "@type": "Organization",
      name: "Blaniel",
      url: process.env.NEXT_PUBLIC_APP_URL,
    },
    areaServed: ["Argentina", "Mexico", "United States", "Brazil", "Latin America"],
    offers: [
      {
        "@type": "Offer",
        name: "Bronze Package",
        price: "2500",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "2500",
          priceCurrency: "USD",
          unitText: "MONTH",
        },
      },
      {
        "@type": "Offer",
        name: "Silver Package",
        price: "7500",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "7500",
          priceCurrency: "USD",
          unitText: "MONTH",
        },
      },
      {
        "@type": "Offer",
        name: "Gold Package",
        price: "20000",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "20000",
          priceCurrency: "USD",
          unitText: "MONTH",
        },
      },
    ],
    audience: {
      "@type": "Audience",
      audienceType: "Brand Marketers, CMOs, Marketing Directors",
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
        <PricingPackages />
        <CaseStudies />
        <FAQ />
        <FinalCTA />
        <LandingFooter />
      </div>
    </>
  );
}
