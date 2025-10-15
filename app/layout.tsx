import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Creador de Inteligencias - Crea, entrena y conecta tus propias IAs",
  description:
    "Plataforma dual para crear inteligencias artificiales emocionales y administrativas. Diseña IA que sienten, piensan y crean contigo.",
  keywords: [
    "inteligencia artificial",
    "IA emocional",
    "asistente virtual",
    "mundos virtuales",
    "chatbot",
  ],
  authors: [{ name: "CircuitPrompt" }],
  openGraph: {
    title: "Creador de Inteligencias",
    description: "Crea, entrena y conecta tus propias inteligencias",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
