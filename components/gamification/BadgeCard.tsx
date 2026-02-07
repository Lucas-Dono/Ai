'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BadgeCardProps {
  icon: string;
  name: string;
  description: string;
  earned?: boolean;
  progress?: number;
  maxProgress?: number;
  earnedAt?: Date;
  onClick?: () => void;
  className?: string;
}

export function BadgeCard({
  icon,
  name,
  description,
  earned = false,
  progress,
  maxProgress,
  earnedAt,
  onClick,
  className,
}: BadgeCardProps) {
  return (
    <motion.div
      whileHover={earned ? { scale: 1.05, rotate: [0, -2, 2, -2, 0] } : { scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      <Card
        className={cn(
          'relative p-4 cursor-pointer transition-all',
          earned
            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-300 dark:border-yellow-700'
            : 'bg-muted/50 opacity-60 grayscale'
        )}
        onClick={onClick}
      >
        {earned && (
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 animate-pulse rounded-2xl" />
        )}

        <div className="relative flex flex-col items-center text-center space-y-2">
          <div className={cn(
            'text-5xl transition-all',
            earned && 'drop-shadow-lg'
          )}>
            {icon}
          </div>

          <div>
            <h3 className={cn(
              'font-bold text-sm',
              earned ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {name}
            </h3>
            <p className={cn(
              'text-xs mt-1',
              earned ? 'text-muted-foreground' : 'text-muted-foreground/60'
            )}>
              {description}
            </p>
          </div>

          {!earned && progress !== undefined && maxProgress !== undefined && (
            <div className="w-full">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full transition-all"
                  style={{ width: `${(progress / maxProgress) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {progress} / {maxProgress}
              </p>
            </div>
          )}

          {earned && earnedAt && (
            <p className="text-xs text-muted-foreground">
              Obtenido el {new Date(earnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
