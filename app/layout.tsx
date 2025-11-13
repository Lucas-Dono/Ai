import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { RootLayoutWrapper } from "@/components/layout/root-layout-wrapper";
import { AccessibilitySkipLink } from "@/components/ui/accessibility-skip-link";
import { IntlProvider } from "@/components/providers/intl-provider";
import { getMessages } from "@/lib/i18n/get-messages";
import { AccessibilityFilters } from "@/components/accessibility/AccessibilityFilters";

export const metadata: Metadata = {
  title: "Circuit Prompt AI - Create emotional AIs with real memory",
  description:
    "Leading platform to create emotional AI companions with real emotions, long-term memory and interactive virtual worlds. Uncensored, unlimited.",
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
  ],
  authors: [{ name: "Circuit Prompt" }],
  openGraph: {
    title: "Circuit Prompt AI - Create AIs that truly understand you",
    description: "Create emotional AI companions with real emotions and long-term memory",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get locale and messages on the server side
  const messagesPromise = getMessages();

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="antialiased overflow-x-hidden">
        <AccessibilitySkipLink />
        <AccessibilityFilters />
        <IntlProvider messagesPromise={messagesPromise}>
          <Providers>
            <RootLayoutWrapper>
              <main id="main-content" tabIndex={-1}>
                {children}
              </main>
            </RootLayoutWrapper>
          </Providers>
        </IntlProvider>
      </body>
    </html>
  );
}
