import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal - Blaniel",
  description: "Información legal, términos de servicio, política de privacidad y recursos de ayuda para Blaniel",
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
