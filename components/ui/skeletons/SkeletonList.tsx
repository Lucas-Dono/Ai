/**
 * SKELETON LIST
 * Loading placeholder para listas
 */

import { cn } from '@/lib/utils';

interface SkeletonListProps {
  className?: string;
  /** Número de items */
  count?: number;
  /** Variante de item */
  variant?: 'simple' | 'detailed' | 'compact';
}

export function SkeletonList({
  className,
  count = 5,
  variant = 'simple',
}: SkeletonListProps) {
  return (
    <div
      className={cn('space-y-3', className)}
      role="status"
      aria-label="Loading list..."
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          {variant === 'simple' && <SkeletonListItemSimple />}
          {variant === 'detailed' && <SkeletonListItemDetailed />}
          {variant === 'compact' && <SkeletonListItemCompact />}
        </div>
      ))}
    </div>
  );
}

/**
 * Item simple - Solo texto
 */
function SkeletonListItemSimple() {
  return (
    <div className="rounded-2xl bg-card p-4 border">
      <div className="h-4 bg-muted rounded w-3/4" />
    </div>
  );
}

/**
 * Item detallado - Avatar + título + descripción
 */
function SkeletonListItemDetailed() {
  return (
    <div className="rounded-2xl bg-card p-4 border flex items-start gap-4">
      {/* Avatar */}
      <div className="h-12 w-12 rounded-full bg-muted flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-5/6" />
      </div>

      {/* Action */}
      <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0" />
    </div>
  );
}

/**
 * Item compacto - Solo una línea
 */
function SkeletonListItemCompact() {
  return (
    <div className="flex items-center gap-3 p-2">
      <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0" />
      <div className="h-3 bg-muted rounded flex-1" />
      <div className="h-3 bg-muted rounded w-16" />
    </div>
  );
}
