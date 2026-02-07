'use client';

import { cn } from '@/lib/utils';

interface UserLevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function UserLevelBadge({
  level,
  size = 'md',
  showText = true,
  className
}: UserLevelBadgeProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const getLevelColor = (lvl: number) => {
    if (lvl >= 50) return 'from-purple-500 to-pink-500';
    if (lvl >= 20) return 'from-yellow-400 to-orange-500';
    if (lvl >= 10) return 'from-blue-400 to-cyan-500';
    if (lvl >= 5) return 'from-green-400 to-emerald-500';
    return 'from-gray-400 to-gray-600';
  };

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div
        className={cn(
          'rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-white shadow-lg',
          sizeClasses[size],
          getLevelColor(level)
        )}
      >
        {level}
      </div>
      {showText && (
        <span className="text-sm font-medium text-muted-foreground">
          Nivel {level}
        </span>
      )}
    </div>
  );
}
