import { Metadata } from "next";
import { LandingWrapper } from "@/components/landing/LandingWrapper";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LiveDemoChat } from "@/components/landing/LiveDemoChat";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { SocialProof } from "@/components/landing/SocialProof";
import { FinalCTA } from "@/components/landing/FinalCTA";

export const metadata: Metadata = {
  title: "Crea IAs Emocionales con Memoria Real | IA Sin Censura",
  description:
    "Plataforma líder para crear compañeros virtuales con emociones reales, memoria de largo plazo y mundos interactivos. Sin censura, sin límites. Gratis para siempre.",
  keywords: [
    "AI companion",
    "emotional AI",
    "virtual friend",
    "AI chat",
    "uncensored AI",
    "AI without restrictions",
    "AI personality",
    "custom AI",
    "AI memory",
    "AI emotions",
    "NSFW AI",
    "AI girlfriend",
    "AI boyfriend",
    "virtual world AI",
    "AI characters",
    "IA emocional",
    "compañero virtual",
    "chatbot inteligente",
  ],
  authors: [{ name: "Circuit Prompt" }],
  creator: "Circuit Prompt",
  publisher: "Circuit Prompt",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Crea IAs que realmente te entienden | Emociones Reales",
    description:
      "Compañeros virtuales con emociones reales, memoria de largo plazo y mundos interactivos. Sin censura, sin límites.",
    url: "/",
    siteName: "Circuit Prompt AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Circuit Prompt AI - Emotional AI Companions",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crea IAs que realmente te entienden",
    description:
      "Compañeros virtuales con emociones reales, memoria de largo plazo. Sin censura, sin límites.",
    images: ["/og-image.png"],
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
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
};

export default function LandingPage() {
  // JSON-LD Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Circuit Prompt AI",
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
        <div id="features">
          <FeaturesGrid />
        </div>
        <HowItWorks />
        <div id="demo">
          <LiveDemoChat />
        </div>
        <ComparisonTable />
        <SocialProof />
        <FinalCTA />
      </LandingWrapper>
    </>
  );
}
