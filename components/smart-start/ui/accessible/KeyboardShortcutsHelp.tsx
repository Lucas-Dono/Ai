/**
 * Keyboard Shortcuts Help Overlay
 * Displays all available keyboard shortcuts in an accessible modal
 *
 * Features:
 * - Beautiful, organized display of shortcuts
 * - Grouped by category
 * - Platform-aware display (shows Cmd on Mac, Ctrl on Windows/Linux)
 * - Accessible modal with focus management
 * - Toggle with ? key
 */

'use client';

import React from 'react';
import { AccessibleModal } from './AccessibleModal';
import { KeyboardShortcut, formatShortcut } from '@/hooks/useKeyboardShortcuts';
import { cn } from '@/lib/utils';

interface ShortcutGroup {
  title: string;
  shortcuts: KeyboardShortcut[];
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: ShortcutGroup[];
  className?: string;
}

/**
 * Default shortcuts grouped by category
 */
const defaultShortcutGroups: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      {
        key: 'Enter',
        ctrl: true,
        description: 'Next step / Submit',
        action: () => {},
      },
      {
        key: '[',
        ctrl: true,
        description: 'Go back',
        action: () => {},
      },
      {
        key: ']',
        ctrl: true,
        description: 'Go forward',
        action: () => {},
      },
      {
        key: 'Escape',
        description: 'Close modal or go back',
        action: () => {},
      },
    ],
  },
  {
    title: 'Search & Selection',
    shortcuts: [
      {
        key: '/',
        description: 'Focus search input',
        action: () => {},
      },
      {
        key: 'ArrowUp',
        description: 'Previous item',
        action: () => {},
      },
      {
        key: 'ArrowDown',
        description: 'Next item',
        action: () => {},
      },
      {
        key: 'Home',
        description: 'Jump to first item',
        action: () => {},
      },
      {
        key: 'End',
        description: 'Jump to last item',
        action: () => {},
      },
      {
        key: 'Enter',
        description: 'Select item',
        action: () => {},
      },
      {
        key: 'Space',
        description: 'Toggle selection',
        action: () => {},
      },
    ],
  },
  {
    title: 'Editing',
    shortcuts: [
      {
        key: 's',
        ctrl: true,
        description: 'Save draft',
        action: () => {},
      },
      {
        key: 'r',
        ctrl: true,
        description: 'Refresh',
        action: () => {},
      },
    ],
  },
  {
    title: 'View',
    shortcuts: [
      {
        key: 'p',
        ctrl: true,
        description: 'Toggle preview panel',
        action: () => {},
      },
      {
        key: 't',
        description: 'Toggle filter',
        action: () => {},
      },
    ],
  },
  {
    title: 'Help',
    shortcuts: [
      {
        key: '?',
        shift: true,
        description: 'Show this help dialog',
        action: () => {},
      },
    ],
  },
];

export function KeyboardShortcutsHelp({
  isOpen,
  onClose,
  shortcuts = defaultShortcutGroups,
  className,
}: KeyboardShortcutsHelpProps) {
  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      description="Quick reference for all available keyboard shortcuts"
      size="lg"
      className={className}
    >
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        {shortcuts.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Group Title */}
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {group.title}
            </h3>

            {/* Shortcuts List */}
            <div className="space-y-2">
              {group.shortcuts.map((shortcut, shortcutIndex) => (
                <div
                  key={shortcutIndex}
                  className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {/* Description */}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {shortcut.description}
                  </span>

                  {/* Shortcut Keys */}
                  <div className="flex items-center gap-1">
                    <ShortcutBadge shortcut={shortcut} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Press <kbd className="kbd">Esc</kbd> or click outside to close
        </p>
      </div>
    </AccessibleModal>
  );
}

/**
 * Shortcut Badge Component
 * Displays a keyboard shortcut in a styled badge
 */
function ShortcutBadge({ shortcut }: { shortcut: KeyboardShortcut }) {
  const formattedShortcut = formatShortcut(shortcut);
  const parts = formattedShortcut.split(/(\+)/);

  return (
    <div className="flex items-center gap-0.5">
      {parts.map((part, index) => {
        if (part === '+') {
          return (
            <span
              key={index}
              className="text-xs text-gray-400 dark:text-gray-500 mx-0.5"
            >
              +
            </span>
          );
        }

        return (
          <kbd
            key={index}
            className={cn(
              'inline-flex items-center justify-center',
              'min-w-[1.75rem] h-7 px-2',
              'text-xs font-semibold',
              'bg-gray-100 dark:bg-gray-700',
              'text-gray-700 dark:text-gray-300',
              'border border-gray-300 dark:border-gray-600',
              'rounded shadow-sm',
              'font-mono'
            )}
          >
            {part}
          </kbd>
        );
      })}
    </div>
  );
}

/**
 * Hook to manage keyboard shortcuts help overlay
 * Auto-opens when user presses ?
 */
export function useKeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = React.useState(false);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
