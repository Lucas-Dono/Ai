'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface XPProgressBarProps {
  currentXP: number;
  currentLevel: number;
  nextLevelXP: number;
  showNumbers?: boolean;
  className?: string;
}

export function XPProgressBar({
  currentXP,
  currentLevel,
  nextLevelXP,
  showNumbers = true,
  className,
}: XPProgressBarProps) {
  // Calculate XP needed for current level
  const currentLevelXP = Math.floor((currentLevel - 1) ** 2 * 100);
  const xpInCurrentLevel = currentXP - currentLevelXP;
  const xpNeededForNext = nextLevelXP - currentLevelXP;
  const progress = (xpInCurrentLevel / xpNeededForNext) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Nivel {currentLevel}</span>
        {showNumbers && (
          <span className="text-muted-foreground">
            {xpInCurrentLevel} / {xpNeededForNext} XP
          </span>
        )}
        <span className="font-medium">Nivel {currentLevel + 1}</span>
      </div>

      <div className="relative">
        <Progress value={progress} className="h-3" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
    </div>
  );
}
