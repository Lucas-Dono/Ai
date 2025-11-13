/**
 * SKELETON (Primitive)
 * Componente base de skeleton - shadcn/ui style
 */

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Variante de animación */
  variant?: 'pulse' | 'shimmer' | 'none';
}

export function Skeleton({
  className,
  variant = 'pulse',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-muted',
        variant === 'pulse' && 'animate-pulse',
        variant === 'shimmer' && 'animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%]',
        className
      )}
      role="status"
      aria-label="Loading..."
      {...props}
    />
  );
}

/**
 * Skeleton Circle - Para avatares
 */
export function SkeletonCircle({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  return (
    <Skeleton
      className={cn('rounded-full', sizes[size], className)}
    />
  );
}

/**
 * Skeleton Text - Para texto
 */
export function SkeletonText({
  lines = 1,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  if (lines === 1) {
    return <Skeleton className={cn('h-4 w-full', className)} />;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            // Última línea más corta
            i === lines - 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton Button
 */
export function SkeletonButton({
  size = 'default',
  className,
}: {
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  const sizes = {
    sm: 'h-8 w-20',
    default: 'h-10 w-24',
    lg: 'h-12 w-28',
  };

  return (
    <Skeleton
      className={cn('rounded-2xl', sizes[size], className)}
    />
  );
}

/**
 * Skeleton Image
 */
export function SkeletonImage({
  aspectRatio = 'video',
  className,
}: {
  aspectRatio?: 'square' | 'video' | 'portrait';
  className?: string;
}) {
  const ratios = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
  };

  return (
    <Skeleton
      className={cn('w-full rounded-2xl', ratios[aspectRatio], className)}
    />
  );
}
