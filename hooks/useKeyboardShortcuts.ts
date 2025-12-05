/**
 * Global Keyboard Shortcuts Hook
 * Provides centralized keyboard shortcut management for the application
 *
 * Features:
 * - Platform-aware (Cmd on Mac, Ctrl on Windows/Linux)
 * - Context-aware shortcuts (different shortcuts for different contexts)
 * - Conflict prevention with native browser shortcuts
 * - Visual feedback via toast/notification
 * - Easy to extend and maintain
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
  preventDefault?: boolean;
  enabled?: boolean;
}

export interface UseKeyboardShortcutsOptions {
  /**
   * Context for these shortcuts (e.g., 'wizard', 'search', 'customize')
   * Allows different shortcuts in different parts of the app
   */
  context?: string;

  /**
   * Whether shortcuts are enabled
   */
  enabled?: boolean;

  /**
   * Callback when a shortcut is triggered
   */
  onShortcutTrigger?: (shortcut: KeyboardShortcut) => void;
}

/**
 * Check if we're on Mac
 */
const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

/**
 * Normalize modifier keys based on platform
 * On Mac: Cmd = Meta, on Windows/Linux: Ctrl = Ctrl
 */
function matchesModifiers(
  event: KeyboardEvent,
  shortcut: KeyboardShortcut
): boolean {
  // Handle Ctrl/Cmd key (platform-specific)
  const expectsCtrlOrCmd = shortcut.ctrl || shortcut.meta;
  const hasCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

  if (expectsCtrlOrCmd && !hasCtrlOrCmd) return false;
  if (!expectsCtrlOrCmd && hasCtrlOrCmd) return false;

  // Alt key
  if (shortcut.alt && !event.altKey) return false;
  if (!shortcut.alt && event.altKey) return false;

  // Shift key
  if (shortcut.shift && !event.shiftKey) return false;
  if (!shortcut.shift && event.shiftKey) return false;

  return true;
}

/**
 * Match a keyboard event against a shortcut
 */
function matchesShortcut(
  event: KeyboardEvent,
  shortcut: KeyboardShortcut
): boolean {
  // Check if shortcut is enabled
  if (shortcut.enabled === false) return false;

  // Normalize key for comparison
  const eventKey = event.key.toLowerCase();
  const shortcutKey = shortcut.key.toLowerCase();

  // Match key
  if (eventKey !== shortcutKey) return false;

  // Match modifiers
  return matchesModifiers(event, shortcut);
}

/**
 * Check if we should ignore shortcuts (e.g., when typing in an input)
 */
function shouldIgnoreShortcut(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement;
  const tagName = target.tagName.toLowerCase();

  // Ignore shortcuts when typing in inputs/textareas
  const isInput = tagName === 'input' || tagName === 'textarea';
  const isContentEditable = target.isContentEditable;

  // Allow some shortcuts even in inputs (like Escape)
  const allowedInInputs = ['escape', 'enter'];
  if ((isInput || isContentEditable) && !allowedInInputs.includes(event.key.toLowerCase())) {
    return true;
  }

  return false;
}

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, onShortcutTrigger } = options;
  const shortcutsRef = useRef<KeyboardShortcut[]>(shortcuts);

  // Update shortcuts ref when they change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't process if disabled
      if (!enabled) return;

      // Don't process if we should ignore
      if (shouldIgnoreShortcut(event)) return;

      // Find matching shortcut
      const matchedShortcut = shortcutsRef.current.find(shortcut =>
        matchesShortcut(event, shortcut)
      );

      if (matchedShortcut) {
        // Prevent default if requested
        if (matchedShortcut.preventDefault !== false) {
          event.preventDefault();
          event.stopPropagation();
        }

        // Execute action
        matchedShortcut.action();

        // Notify callback
        if (onShortcutTrigger) {
          onShortcutTrigger(matchedShortcut);
        }
      }
    },
    [enabled, onShortcutTrigger]
  );

  useEffect(() => {
    if (!enabled) return;

    // Use capture phase to catch events before they bubble
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [handleKeyDown, enabled]);

  return {
    shortcuts: shortcutsRef.current,
    enabled,
  };
}

/**
 * Format shortcut for display
 * Example: formatShortcut({ key: 'k', ctrl: true }) => "Ctrl+K" or "⌘K" on Mac
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrl || shortcut.meta) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }

  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }

  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }

  // Capitalize key
  const key = shortcut.key.length === 1
    ? shortcut.key.toUpperCase()
    : shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1);

  parts.push(key);

  return parts.join(isMac ? '' : '+');
}

/**
 * Common shortcuts that can be reused across the app
 */
export const commonShortcuts = {
  /**
   * Command palette (Ctrl+K or Cmd+K)
   */
  commandPalette: (action: () => void): KeyboardShortcut => ({
    key: 'k',
    ctrl: true,
    description: 'Open command palette',
    action,
  }),

  /**
   * Close/Cancel (Escape)
   */
  close: (action: () => void): KeyboardShortcut => ({
    key: 'Escape',
    description: 'Close modal or cancel',
    action,
    preventDefault: false, // Allow Escape to propagate
  }),

  /**
   * Search (/)
   */
  search: (action: () => void): KeyboardShortcut => ({
    key: '/',
    description: 'Focus search input',
    action,
  }),

  /**
   * Help (?)
   */
  help: (action: () => void): KeyboardShortcut => ({
    key: '?',
    shift: true,
    description: 'Show keyboard shortcuts',
    action,
  }),

  /**
   * Save (Ctrl+S or Cmd+S)
   */
  save: (action: () => void): KeyboardShortcut => ({
    key: 's',
    ctrl: true,
    description: 'Save changes',
    action,
  }),

  /**
   * Submit (Ctrl+Enter or Cmd+Enter)
   */
  submit: (action: () => void): KeyboardShortcut => ({
    key: 'Enter',
    ctrl: true,
    description: 'Submit form',
    action,
  }),

  /**
   * Go back (Ctrl+[ or Cmd+[)
   */
  goBack: (action: () => void): KeyboardShortcut => ({
    key: '[',
    ctrl: true,
    description: 'Go back',
    action,
  }),

  /**
   * Go forward (Ctrl+] or Cmd+])
   */
  goForward: (action: () => void): KeyboardShortcut => ({
    key: ']',
    ctrl: true,
    description: 'Go forward',
    action,
  }),

  /**
   * Refresh (Ctrl+R or Cmd+R)
   */
  refresh: (action: () => void): KeyboardShortcut => ({
    key: 'r',
    ctrl: true,
    description: 'Refresh',
    action,
  }),

  /**
   * Next item (N)
   */
  next: (action: () => void): KeyboardShortcut => ({
    key: 'n',
    description: 'Next item',
    action,
  }),

  /**
   * Previous item (P)
   */
  previous: (action: () => void): KeyboardShortcut => ({
    key: 'p',
    description: 'Previous item',
    action,
  }),

  /**
   * Toggle (T)
   */
  toggle: (action: () => void): KeyboardShortcut => ({
    key: 't',
    description: 'Toggle',
    action,
  }),

  /**
   * Delete (Backspace or Delete)
   */
  delete: (action: () => void): KeyboardShortcut => ({
    key: 'Delete',
    description: 'Delete item',
    action,
  }),
};
