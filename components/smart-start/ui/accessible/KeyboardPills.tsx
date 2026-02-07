/**
 * KeyboardPills - Accessible pill/tag component with keyboard navigation
 * Supports: Arrow keys, Enter/Space, Home/End
 * WCAG AA compliant
 */

'use client';

import React, { useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

export interface PillOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface KeyboardPillsProps {
  options: PillOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiple?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  pillClassName?: string;
  label?: string;
  description?: string;
}

export function KeyboardPills({
  options,
  selected,
  onChange,
  multiple = true,
  orientation = 'horizontal',
  className,
  pillClassName,
  label,
  description,
}: KeyboardPillsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = React.useState<number>(0);

  // Get pill element by index
  const getPillElement = useCallback(
    (index: number): HTMLButtonElement | null => {
      if (!containerRef.current) return null;
      const pills = containerRef.current.querySelectorAll<HTMLButtonElement>(
        '[role="option"]'
      );
      return pills[index] || null;
    },
    []
  );

  // Focus pill at index
  const focusPill = useCallback(
    (index: number) => {
      const pill = getPillElement(index);
      if (pill && !pill.disabled) {
        pill.focus();
        setFocusedIndex(index);
      }
    },
    [getPillElement]
  );

  // Handle arrow key navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const isHorizontal = orientation === 'horizontal';
      const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
      const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

      let newIndex = focusedIndex;

      switch (e.key) {
        case nextKey:
          e.preventDefault();
          // Find next non-disabled option
          for (let i = focusedIndex + 1; i < options.length; i++) {
            if (!options[i].disabled) {
              newIndex = i;
              break;
            }
          }
          break;

        case prevKey:
          e.preventDefault();
          // Find previous non-disabled option
          for (let i = focusedIndex - 1; i >= 0; i--) {
            if (!options[i].disabled) {
              newIndex = i;
              break;
            }
          }
          break;

        case 'Home':
          e.preventDefault();
          // Find first non-disabled option
          newIndex = options.findIndex(opt => !opt.disabled);
          break;

        case 'End':
          e.preventDefault();
          // Find last non-disabled option
          for (let i = options.length - 1; i >= 0; i--) {
            if (!options[i].disabled) {
              newIndex = i;
              break;
            }
          }
          break;

        default:
          return;
      }

      if (newIndex !== focusedIndex && newIndex >= 0) {
        focusPill(newIndex);
      }
    },
    [focusedIndex, options, orientation, focusPill]
  );

  // Toggle selection
  const toggleOption = useCallback(
    (optionId: string) => {
      if (multiple) {
        const newSelected = selected.includes(optionId)
          ? selected.filter(id => id !== optionId)
          : [...selected, optionId];
        onChange(newSelected);
      } else {
        onChange([optionId]);
      }
    },
    [multiple, selected, onChange]
  );

  // Auto-focus first selected or first option on mount
  useEffect(() => {
    if (options.length === 0) return;

    const firstSelectedIndex = selected.length > 0
      ? options.findIndex(opt => opt.id === selected[0])
      : 0;

    if (firstSelectedIndex >= 0) {
      setFocusedIndex(firstSelectedIndex);
    }
  }, []);  // Only on mount

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      {label && (
        <label
          id="pills-label"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          {label}
        </label>
      )}

      {/* Description */}
      {description && (
        <p id="pills-description" className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}

      {/* Pills container */}
      <div
        ref={containerRef}
        role="listbox"
        aria-labelledby={label ? 'pills-label' : undefined}
        aria-describedby={description ? 'pills-description' : undefined}
        aria-multiselectable={multiple}
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex gap-2',
          orientation === 'vertical' ? 'flex-col' : 'flex-wrap'
        )}
      >
        {options.map((option, index) => {
          const isSelected = selected.includes(option.id);

          return (
            <button
              key={option.id}
              role="option"
              aria-selected={isSelected}
              disabled={option.disabled}
              tabIndex={index === focusedIndex ? 0 : -1}
              onClick={() => toggleOption(option.id)}
              onFocus={() => setFocusedIndex(index)}
              className={cn(
                // Base styles
                'inline-flex items-center gap-2 px-4 py-2 rounded-full',
                'text-sm font-medium transition-all duration-200',
                'border-2 focus:outline-none',

                // Focus visible (keyboard navigation)
                'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',

                // States
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-gray-300 dark:border-gray-600 hover:border-primary/50',

                // Disabled
                option.disabled && 'opacity-50 cursor-not-allowed',

                // Custom className
                pillClassName
              )}
            >
              {option.icon && <span aria-hidden="true">{option.icon}</span>}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Screen reader instructions */}
      <div className="sr-only" role="status" aria-live="polite">
        {selected.length > 0
          ? `${selected.length} option${selected.length === 1 ? '' : 's'} selected`
          : 'No options selected'}
      </div>
    </div>
  );
}
