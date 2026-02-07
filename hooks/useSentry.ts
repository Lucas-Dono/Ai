"use client";

/**
 * React Hook for Sentry Integration
 *
 * Provides easy access to Sentry functionality in React components
 */

import { useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import {
  captureCustomError,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  type ErrorContext,
} from "@/lib/sentry/custom-error";
import { trackInteraction, trackNavigation } from "@/lib/sentry/breadcrumbs";

export function useSentry() {
  const { data: session } = useSession();

  // Set user context when session changes
  useEffect(() => {
    if (session?.user) {
      setUserContext({
        id: session.user.id || "",
        email: session.user.email || undefined,
        username: session.user.name || undefined,
      });
    } else {
      clearUserContext();
    }
  }, [session]);

  // Capture error with context
  const captureError = useCallback(
    (error: Error, context?: Omit<ErrorContext, "userId" | "userEmail">) => {
      captureCustomError(error, {
        ...context,
        userId: session?.user?.id,
        userEmail: session?.user?.email || undefined,
      });
    },
    [session]
  );

  // Track user interaction
  const trackClick = useCallback(
    (element: string, data?: Record<string, any>) => {
      trackInteraction(element, "click", data);
    },
    []
  );

  // Track navigation
  const trackPageView = useCallback((from: string, to: string) => {
    trackNavigation(from, to);
  }, []);

  // Add custom breadcrumb
  const addCustomBreadcrumb = useCallback(
    (message: string, category: string, data?: Record<string, any>) => {
      addBreadcrumb(message, category, data);
    },
    []
  );

  return {
    captureError,
    trackClick,
    trackPageView,
    addBreadcrumb: addCustomBreadcrumb,
  };
}
