/**
 * KeyboardTabs - Fully accessible tabs component
 * Features:
 * - Arrow key navigation (Left/Right or Up/Down based on orientation)
 * - Home/End to jump to first/last tab
 * - Enter/Space to select tab
 * - Automatic tabpanel switching
 * - ARIA tablist/tab/tabpanel roles
 * - WCAG AA compliant
 */

'use client';

import React, { useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  badge?: string | number;
}

interface KeyboardTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  selectedTab?: string;
  onTabChange?: (tabId: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
  tabListClassName?: string;
  tabClassName?: string;
  panelClassName?: string;
}

export function KeyboardTabs({
  tabs,
  defaultTab,
  selectedTab: controlledSelectedTab,
  onTabChange,
  orientation = 'horizontal',
  variant = 'default',
  className,
  tabListClassName,
  tabClassName,
  panelClassName,
}: KeyboardTabsProps) {
  // Controlled vs uncontrolled state
  const isControlled = controlledSelectedTab !== undefined;
  const [internalSelectedTab, setInternalSelectedTab] = useState(
    defaultTab || tabs[0]?.id || ''
  );

  const selectedTab = isControlled ? controlledSelectedTab : internalSelectedTab;

  const [focusedTabIndex, setFocusedTabIndex] = useState(
    tabs.findIndex(tab => tab.id === selectedTab)
  );

  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Sync focused index with selected tab
  useEffect(() => {
    const index = tabs.findIndex(tab => tab.id === selectedTab);
    if (index !== -1) {
      setFocusedTabIndex(index);
    }
  }, [selectedTab, tabs]);

  // Focus a specific tab
  const focusTab = useCallback((index: number) => {
    const tab = tabs[index];
    if (tab && !tab.disabled) {
      const element = tabRefs.current.get(tab.id);
      if (element) {
        element.focus();
        setFocusedTabIndex(index);
      }
    }
  }, [tabs]);

  // Select a tab
  const selectTab = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || tab.disabled) return;

    if (!isControlled) {
      setInternalSelectedTab(tabId);
    }

    if (onTabChange) {
      onTabChange(tabId);
    }
  }, [tabs, isControlled, onTabChange]);

  // Find next non-disabled tab
  const findNextTab = useCallback((currentIndex: number, direction: 'next' | 'prev'): number => {
    const increment = direction === 'next' ? 1 : -1;
    let nextIndex = currentIndex + increment;

    // Wrap around
    if (nextIndex >= tabs.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = tabs.length - 1;

    // Skip disabled tabs
    while (tabs[nextIndex]?.disabled) {
      nextIndex += increment;
      if (nextIndex >= tabs.length) nextIndex = 0;
      if (nextIndex < 0) nextIndex = tabs.length - 1;

      // Prevent infinite loop if all tabs disabled
      if (nextIndex === currentIndex) break;
    }

    return nextIndex;
  }, [tabs]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const isHorizontal = orientation === 'horizontal';
      const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
      const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

      switch (e.key) {
        case nextKey:
          e.preventDefault();
          const nextIndex = findNextTab(focusedTabIndex, 'next');
          focusTab(nextIndex);
          // Auto-select on navigation (common pattern)
          selectTab(tabs[nextIndex].id);
          break;

        case prevKey:
          e.preventDefault();
          const prevIndex = findNextTab(focusedTabIndex, 'prev');
          focusTab(prevIndex);
          // Auto-select on navigation (common pattern)
          selectTab(tabs[prevIndex].id);
          break;

        case 'Home':
          e.preventDefault();
          const firstIndex = tabs.findIndex(tab => !tab.disabled);
          if (firstIndex !== -1) {
            focusTab(firstIndex);
            selectTab(tabs[firstIndex].id);
          }
          break;

        case 'End':
          e.preventDefault();
          const lastIndex = tabs.reduce((lastValid, tab, index) => {
            return !tab.disabled ? index : lastValid;
          }, -1);
          if (lastIndex !== -1) {
            focusTab(lastIndex);
            selectTab(tabs[lastIndex].id);
          }
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          const currentTab = tabs[focusedTabIndex];
          if (currentTab && !currentTab.disabled) {
            selectTab(currentTab.id);
          }
          break;
      }
    },
    [orientation, focusedTabIndex, tabs, findNextTab, focusTab, selectTab]
  );

  // Variant styles
  const getVariantStyles = useCallback((isSelected: boolean, isDisabled: boolean) => {
    if (variant === 'pills') {
      return cn(
        'rounded-full px-4 py-2 transition-all',
        isSelected
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-transparent hover:bg-accent hover:text-accent-foreground',
        isDisabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
      );
    }

    if (variant === 'underline') {
      return cn(
        'border-b-2 px-4 py-2 transition-all',
        isSelected
          ? 'border-primary text-primary font-medium'
          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600',
        isDisabled && 'opacity-50 cursor-not-allowed hover:border-transparent'
      );
    }

    // Default variant
    return cn(
      'px-4 py-2 border-b-2 transition-all',
      isSelected
        ? 'border-primary bg-background text-foreground font-medium'
        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 text-muted-foreground',
      isDisabled && 'opacity-50 cursor-not-allowed hover:border-transparent'
    );
  }, [variant]);

  const selectedTabData = tabs.find(tab => tab.id === selectedTab);

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div
        role="tablist"
        aria-orientation={orientation}
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'flex-row border-b border-gray-200 dark:border-gray-700' : 'flex-col space-y-1',
          variant === 'pills' && 'border-none bg-muted p-1 rounded-lg gap-1',
          tabListClassName
        )}
      >
        {tabs.map((tab, index) => {
          const isSelected = tab.id === selectedTab;
          const isFocused = index === focusedTabIndex;

          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) {
                  tabRefs.current.set(tab.id, el);
                } else {
                  tabRefs.current.delete(tab.id);
                }
              }}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`tabpanel-${tab.id}`}
              aria-disabled={tab.disabled}
              tabIndex={isFocused ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && selectTab(tab.id)}
              onKeyDown={handleKeyDown}
              className={cn(
                'relative flex items-center gap-2 text-sm font-medium transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                getVariantStyles(isSelected, !!tab.disabled),
                tabClassName
              )}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'ml-1 px-2 py-0.5 text-xs font-semibold rounded-full',
                    isSelected
                      ? 'bg-primary-foreground/20'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      {selectedTabData && (
        <div
          role="tabpanel"
          id={`tabpanel-${selectedTabData.id}`}
          aria-labelledby={`tab-${selectedTabData.id}`}
          tabIndex={0}
          className={cn(
            'mt-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md',
            panelClassName
          )}
        >
          {selectedTabData.content}
        </div>
      )}

      {/* Screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {selectedTabData && `${selectedTabData.label} tab selected`}
      </div>
    </div>
  );
}
