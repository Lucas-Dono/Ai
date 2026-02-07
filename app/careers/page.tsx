import { Metadata } from "next";
import {
  CareersWrapper,
  CareersHero,
  WhyBlaniel,
  AreasOfInterest,
  TalentPool,
  CareersCTA,
} from "@/components/careers";

export const metadata: Metadata = {
  title: "Careers | Sé Parte de Nuestro Futuro - Blaniel",
  description:
    "Únete a la próxima generación de IA emocional. Registra tu perfil en nuestra bolsa de talento y te contactaremos cuando surjan oportunidades.",
  keywords: [
    "careers",
    "talent pool",
    "remote work",
    "AI jobs",
    "emotional AI",
    "bolsa de talento",
    "oportunidades",
    "desarrollo",
    "diseño",
    "community",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/careers",
  },
  openGraph: {
    title: "Careers - Sé Parte de Nuestro Futuro | Blaniel",
    description:
      "Únete a la próxima generación de IA emocional. Registra tu perfil en nuestra bolsa de talento.",
    url: "/careers",
    siteName: "Blaniel",
    type: "website",
  },
};

export default function CareersPage() {
  return (
    <CareersWrapper>
      <CareersHero />
      <WhyBlaniel />
      <AreasOfInterest />
      <TalentPool />
      <CareersCTA />
    </CareersWrapper>
  );
}
