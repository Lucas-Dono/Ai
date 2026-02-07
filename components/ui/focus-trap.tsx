"use client";

import { useEffect, useRef } from "react";

interface FocusTrapProps {
  children: React.ReactNode;
  enabled?: boolean;
}

/**
 * Component to trap focus within its children (for modals, dialogs, etc.)
 * Improves keyboard navigation accessibility
 */
export function FocusTrap({ children, enabled = true }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements
    const getFocusableElements = () => {
      return container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusableElements = Array.from(getFocusableElements());
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Focus first element on mount
    const firstFocusable = getFocusableElements()[0];
    if (firstFocusable) {
      firstFocusable.focus();
    }

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);

  return <div ref={containerRef}>{children}</div>;
}
