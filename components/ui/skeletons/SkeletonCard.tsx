/**
 * SKELETON CARD
 * Loading placeholder para cards
 */

import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
  /** Mostrar avatar/imagen */
  showAvatar?: boolean;
  /** Número de líneas de texto */
  lines?: number;
  /** Mostrar acciones/botones al final */
  showActions?: boolean;
}

export function SkeletonCard({
  className,
  showAvatar = false,
  lines = 3,
  showActions = false,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl bg-card p-6 shadow-sm border',
        className
      )}
      role="status"
      aria-label="Loading..."
    >
      {/* Header con avatar opcional */}
      <div className="flex items-start space-x-4 mb-4">
        {showAvatar && (
          <div className="h-12 w-12 rounded-full bg-muted flex-shrink-0" />
        )}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>

      {/* Content lines */}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-3 bg-muted rounded',
              // Última línea más corta
              i === lines - 1 ? 'w-2/3' : 'w-full'
            )}
          />
        ))}
      </div>

      {/* Actions opcionales */}
      {showActions && (
        <div className="flex gap-2 mt-4">
          <div className="h-9 bg-muted rounded-2xl w-24" />
          <div className="h-9 bg-muted rounded-2xl w-24" />
        </div>
      )}
    </div>
  );
}
