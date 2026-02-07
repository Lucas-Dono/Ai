'use client';

import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface UserBadgeDisplayProps {
  badges: Array<{
    icon: string;
    name: string;
    description: string;
  }>;
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserBadgeDisplay({
  badges,
  maxDisplay = 3,
  size = 'sm',
  className,
}: UserBadgeDisplayProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = Math.max(0, badges.length - maxDisplay);

  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {displayBadges.map((badge, index) => (
        <Popover key={index}>
          <PopoverTrigger>
            <span
              className={cn(
                'cursor-pointer transition-transform hover:scale-125',
                sizeClasses[size]
              )}
              title={badge.name}
            >
              {badge.icon}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              <div className="text-4xl">{badge.icon}</div>
              <div>
                <h4 className="font-semibold">{badge.name}</h4>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ))}

      {remainingCount > 0 && (
        <Popover>
          <PopoverTrigger>
            <span
              className={cn(
                'cursor-pointer text-muted-foreground font-medium',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-base'
              )}
            >
              +{remainingCount}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              <h4 className="font-semibold">Más badges</h4>
              <div className="grid grid-cols-4 gap-2">
                {badges.slice(maxDisplay).map((badge, index) => (
                  <span key={index} className="text-2xl" title={badge.name}>
                    {badge.icon}
                  </span>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
