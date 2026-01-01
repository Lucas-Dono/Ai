"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { usePathname } from "next/navigation";
import { ErrorBoundary } from "@/components/error-boundary";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { Toaster } from "@/components/ui/toast";
import { AccessibilityIndicator } from "@/components/accessibility/AccessibilityIndicator";
import { Footer } from "@/components/layout/footer";
import { PaymentModalProvider } from "@/components/billing/PaymentModalProvider";

interface RootLayoutWrapperProps {
  children: React.ReactNode;
}

export function RootLayoutWrapper({ children }: RootLayoutWrapperProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Hide footer in chat pages (agentes/[id] and grupos/[id])
  const isAgentChat = pathname?.startsWith('/agentes/') && !pathname.includes('/edit') && !pathname.includes('/behaviors') && !pathname.includes('/memory');
  const isGroupChat = pathname?.startsWith('/dashboard/grupos/') && pathname.split('/').length >= 4 && !pathname.includes('/configuracion') && !pathname.includes('/analytics');
  const isChat = isAgentChat || isGroupChat;

  // ANALYTICS TRACKING: Mobile Session Detection (Fase 6 - User Experience)
  useEffect(() => {
    if (!session?.user?.id) return;

    // Detect if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768;

    if (!isMobile) return;

    // Check if we've already tracked this session (avoid duplicate tracking)
    const sessionKey = `mobile_session_tracked_${session.user.id}`;
    const lastTracked = localStorage.getItem(sessionKey);
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;

    // Only track if it's been more than 1 hour since last tracking
    if (lastTracked && now - parseInt(lastTracked) < ONE_HOUR) {
      return;
    }

    // Track mobile session
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "mobile_session",
        metadata: {
          userId: session.user.id,
          userAgent: navigator.userAgent,
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
        },
      }),
    })
      .then((res) => {
        if (res.ok) {
          localStorage.setItem(sessionKey, now.toString());
          console.log("[TRACKING] Mobile session tracked");
        }
      })
      .catch((error) => {
        console.warn("[TRACKING] Failed to track mobile session:", error);
      });
  }, [session, status]);

  return (
    <ErrorBoundary variant="page">
      <div className="flex flex-col min-h-screen">
        <OfflineBanner />
        <div className="flex-1">{children}</div>
        {!isChat && <Footer />}
        <AccessibilityIndicator />
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--background)",
            color: "var(--foreground)",
            border: "1px solid var(--border)"
          }
        }}
        visibleToasts={3}
      />
      <PaymentModalProvider />
    </ErrorBoundary>
  );
}
