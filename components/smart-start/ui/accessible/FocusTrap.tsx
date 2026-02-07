/**
 * FocusTrap Component
 * Traps focus within a specific element (useful for modals, dropdowns, etc.)
 *
 * Features:
 * - Traps Tab key to cycle within container
 * - Auto-focuses first element on mount
 * - Restores focus on unmount
 * - Respects disabled state
 * - Works with dynamic content
 */

'use client';

import React, { useEffect, useRef, ReactNode, useCallback } from 'react';

interface FocusTrapProps {
  children: ReactNode;
  /**
   * Whether focus trap is active
   */
  active?: boolean;
  /**
   * Auto-focus first element on mount
   */
  autoFocus?: boolean;
  /**
   * Restore focus to previous element on unmount
   */
  restoreFocus?: boolean;
  /**
   * Callback when user tries to escape the trap (e.g., Tab on last element)
   */
  onEscape?: () => void;
  /**
   * Element to focus when trap activates
   * If not provided, focuses first focusable element
   */
  initialFocus?: string; // CSS selector
  className?: string;
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]:not([disabled])',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]:not([contenteditable="false"])',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors)).filter(
    el => {
      // Filter out invisible elements
      return !!(
        el.offsetWidth ||
        el.offsetHeight ||
        el.getClientRects().length
      );
    }
  );
}

export function FocusTrap({
  children,
  active = true,
  autoFocus = true,
  restoreFocus = true,
  onEscape,
  initialFocus,
  className,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  /**
   * Focus first focusable element
   */
  const focusFirstElement = useCallback(() => {
    if (!containerRef.current) return;

    // Try to focus initial focus element if provided
    if (initialFocus) {
      const element = containerRef.current.querySelector<HTMLElement>(initialFocus);
      if (element) {
        element.focus();
        return;
      }
    }

    // Otherwise focus first focusable element
    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [initialFocus]);

  /**
   * Handle Tab key to trap focus
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!active || !containerRef.current) return;
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements(containerRef.current);

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      // Shift + Tab (moving backwards)
      if (e.shiftKey) {
        // If on first element, wrap to last
        if (activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();

          // Notify escape callback
          if (onEscape) {
            onEscape();
          }
        }
      }
      // Tab (moving forwards)
      else {
        // If on last element, wrap to first
        if (activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();

          // Notify escape callback
          if (onEscape) {
            onEscape();
          }
        }
      }
    },
    [active, onEscape]
  );

  // Setup focus trap
  useEffect(() => {
    if (!active) return;

    // Save currently focused element
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Auto-focus if requested
    if (autoFocus) {
      // Small delay to ensure content is rendered
      const timer = setTimeout(focusFirstElement, 50);
      return () => clearTimeout(timer);
    }
  }, [active, autoFocus, focusFirstElement]);

  // Listen for Tab key
  useEffect(() => {
    if (!active) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, handleKeyDown]);

  // Restore focus on unmount
  useEffect(() => {
    return () => {
      if (restoreFocus && previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [restoreFocus]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

/**
 * Hook to manage focus trap state
 */
export function useFocusTrap(initialActive = false) {
  const [active, setActive] = React.useState(initialActive);

  const activate = useCallback(() => setActive(true), []);
  const deactivate = useCallback(() => setActive(false), []);
  const toggle = useCallback(() => setActive(prev => !prev), []);

  return {
    active,
    activate,
    deactivate,
    toggle,
  };
}
