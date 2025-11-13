import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal - Circuit Prompt AI",
  description: "Información legal, términos de servicio, política de privacidad y recursos de ayuda para Circuit Prompt AI",
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
