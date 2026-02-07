'use client';

import { cn } from '@/lib/utils';

interface StreakFlameProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function StreakFlame({
  streak,
  size = 'md',
  showText = true,
  className
}: StreakFlameProps) {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const getFlameAnimation = (s: number) => {
    if (s >= 100) return 'animate-pulse';
    if (s >= 30) return 'animate-bounce';
    if (s >= 7) return 'animate-pulse';
    return '';
  };

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span className={cn(sizeClasses[size], getFlameAnimation(streak))}>
        🔥
      </span>
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-bold text-orange-500">{streak}</span>
          <span className="text-xs text-muted-foreground">días</span>
        </div>
      )}
    </div>
  );
}
