'use client';

import { ChevronRight } from 'lucide-react';
import { mobileTheme } from '@/lib/mobile-theme';

interface MobileSectionHeaderProps {
  title: string;
  subtitle?: string;
  onViewAll?: () => void;
  badge?: {
    text: string;
    className?: string;
  };
}

export default function MobileSectionHeader({
  title,
  subtitle,
  onViewAll,
  badge,
}: MobileSectionHeaderProps) {
  return (
    <div
      className="flex items-start justify-between"
      style={{
        paddingLeft: `${mobileTheme.spacing.lg}px`,
        paddingRight: `${mobileTheme.spacing.lg}px`,
      }}
    >
      {/* Título y subtítulo */}
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center gap-2">
          <h2
            className="font-bold"
            style={{
              fontSize: `${mobileTheme.typography.fontSize.xl}px`,
              color: mobileTheme.colors.text.primary,
              lineHeight: mobileTheme.typography.lineHeight.tight,
            }}
          >
            {title}
          </h2>

          {/* Badge - Sincronizado con desktop */}
          {badge && (
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badge.className || 'bg-gray-800/50 text-gray-300 border-gray-700'}`}
            >
              {badge.text}
            </span>
          )}
        </div>

        {subtitle && (
          <p
            style={{
              fontSize: `${mobileTheme.typography.fontSize.sm}px`,
              color: mobileTheme.colors.text.secondary,
              lineHeight: mobileTheme.typography.lineHeight.normal,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Botón "Ver todo" */}
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 transition-opacity hover:opacity-80 active:opacity-60"
          style={{
            fontSize: `${mobileTheme.typography.fontSize.sm}px`,
            color: mobileTheme.colors.primary[500],
            fontWeight: mobileTheme.typography.fontWeight.semibold,
          }}
        >
          <span>Ver todo</span>
          <ChevronRight
            size={16}
            strokeWidth={2.5}
          />
        </button>
      )}
    </div>
  );
}
