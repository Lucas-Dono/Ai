import { Metadata } from "next";
import {
  CareersWrapper,
  CareersHero,
  WhyBlaniel,
  OpenPositions,
  HowToApply,
  CareersCTA,
} from "@/components/careers";

export const metadata: Metadata = {
  title: "Careers | Únete al Equipo - Blaniel",
  description:
    "Construye el futuro de las conexiones humanas con IA. Posiciones remotas en desarrollo, diseño y community. Únete al equipo Blaniel.",
  keywords: [
    "careers",
    "jobs",
    "hiring",
    "remote work",
    "developer jobs",
    "designer jobs",
    "community manager",
    "trabajos remotos",
    "empleo",
    "desarrollo",
    "diseño",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/careers",
  },
  openGraph: {
    title: "Careers - Únete al Equipo Blaniel",
    description:
      "Construye el futuro de las conexiones humanas con IA. Posiciones remotas disponibles.",
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
      <OpenPositions />
      <HowToApply />
      <CareersCTA />
    </CareersWrapper>
  );
}
