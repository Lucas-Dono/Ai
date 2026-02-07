'use client';

import { useEffect } from 'react';
import { useSmartStart } from '../context/SmartStartContext';

interface UseKeyboardNavigationOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  enableArrowKeys?: boolean;
}

/**
 * Custom hook for keyboard navigation in Smart Start wizard
 * Provides common keyboard shortcuts for better UX
 */
export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = {}) {
  const { goBack, skip } = useSmartStart();
  const { onEnter, onEscape, enableArrowKeys = false } = options;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      const isInputElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Enter key - trigger custom action if provided
      if (event.key === 'Enter' && !isInputElement && onEnter) {
        event.preventDefault();
        onEnter();
        return;
      }

      // Escape key - go back or trigger custom action
      if (event.key === 'Escape') {
        event.preventDefault();
        if (onEscape) {
          onEscape();
        } else {
          goBack();
        }
        return;
      }

      // Cmd/Ctrl + K - Skip wizard
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        skip();
        return;
      }

      // Arrow keys navigation (if enabled)
      if (enableArrowKeys && !isInputElement) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goBack();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEnter, onEscape, enableArrowKeys, goBack, skip]);
}
