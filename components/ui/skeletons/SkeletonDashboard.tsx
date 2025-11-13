/**
 * SKELETON DASHBOARD
 * Loading placeholders para dashboard y estadísticas
 */

import { cn } from '@/lib/utils';

interface SkeletonDashboardProps {
  className?: string;
}

/**
 * Skeleton para grid de stats
 */
export function SkeletonStatsGrid({ className }: SkeletonDashboardProps) {
  return (
    <div
      className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}
      role="status"
      aria-label="Loading statistics..."
    >
      {[1, 2, 3].map((i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  );
}

/**
 * Tarjeta de estadística individual
 */
export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl bg-card p-6 border space-y-3',
        className
      )}
    >
      {/* Icono + título */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-muted" />
        <div className="h-4 bg-muted rounded w-24" />
      </div>

      {/* Valor principal */}
      <div className="h-8 bg-muted rounded w-20" />

      {/* Cambio/tendencia */}
      <div className="h-3 bg-muted rounded w-32" />
    </div>
  );
}

/**
 * Skeleton para gráfico
 */
export function SkeletonChart({ className }: SkeletonDashboardProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl bg-card p-6 border space-y-4',
        className
      )}
      role="status"
      aria-label="Loading chart..."
    >
      {/* Título */}
      <div className="h-5 bg-muted rounded w-1/3" />

      {/* Chart area */}
      <div className="h-64 bg-muted rounded-2xl flex items-end gap-2 p-4">
        {[40, 65, 45, 70, 55, 80, 60].map((height, i) => (
          <div
            key={i}
            className="flex-1 bg-muted-foreground/20 rounded-t-lg"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

      {/* Leyenda */}
      <div className="flex gap-4">
        <div className="h-3 bg-muted rounded w-24" />
        <div className="h-3 bg-muted rounded w-24" />
      </div>
    </div>
  );
}

/**
 * Skeleton para tabla
 */
export function SkeletonTable({
  className,
  rows = 5,
  columns = 4,
}: SkeletonDashboardProps & { rows?: number; columns?: number }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl bg-card border overflow-hidden',
        className
      )}
      role="status"
      aria-label="Loading table..."
    >
      {/* Header */}
      <div className="border-b bg-muted/50 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className={cn(
                    'h-3 bg-muted rounded',
                    colIndex === 0 ? 'w-3/4' : 'w-full' // Primera columna más corta
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton para actividad reciente
 */
export function SkeletonActivity({ className }: SkeletonDashboardProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl bg-card p-6 border space-y-4',
        className
      )}
      role="status"
      aria-label="Loading activity..."
    >
      {/* Título */}
      <div className="h-5 bg-muted rounded w-1/3" />

      {/* Items de actividad */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-3">
            {/* Dot/icono */}
            <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0 mt-1" />

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-2/3" />
              <div className="h-2 bg-muted rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
