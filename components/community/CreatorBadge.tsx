/**
 * CreatorBadge - Badge de creator con nivel basado en karma/reputación
 */

"use client";

import { Star, Award, Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CreatorBadgeProps {
  reputation: number;
  className?: string;
}

interface BadgeLevel {
  minReputation: number;
  label: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
}

const BADGE_LEVELS: BadgeLevel[] = [
  {
    minReputation: 10000,
    label: "Legendary Creator",
    icon: Crown,
    color: "text-yellow-500",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    minReputation: 5000,
    label: "Master Creator",
    icon: Award,
    color: "text-purple-500",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    minReputation: 1000,
    label: "Elite Creator",
    icon: Sparkles,
    color: "text-blue-500",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    minReputation: 100,
    label: "Rising Creator",
    icon: Star,
    color: "text-green-500",
    gradient: "from-green-500 to-emerald-500",
  },
];

export function CreatorBadge({ reputation, className }: CreatorBadgeProps) {
  // Find the appropriate badge level
  const badgeLevel = BADGE_LEVELS.find(level => reputation >= level.minReputation);

  if (!badgeLevel) {
    return null; // No badge if reputation is too low
  }

  const Icon = badgeLevel.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "gap-1 border-0 bg-gradient-to-r text-white",
              badgeLevel.gradient,
              className
            )}
          >
            <Icon className="h-3 w-3" />
            <span className="text-xs font-semibold">{badgeLevel.label.split(' ')[0]}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">{badgeLevel.label}</p>
            <p className="text-xs text-muted-foreground">{reputation.toLocaleString()} karma</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Calcular el siguiente nivel de badge
 */
export function getNextBadgeLevel(reputation: number): {
  nextLevel: BadgeLevel | null;
  progress: number;
} {
  // Find current and next level
  let currentLevel: BadgeLevel | null = null;
  let nextLevel: BadgeLevel | null = null;

  for (let i = BADGE_LEVELS.length - 1; i >= 0; i--) {
    if (reputation >= BADGE_LEVELS[i].minReputation) {
      currentLevel = BADGE_LEVELS[i];
      nextLevel = i > 0 ? BADGE_LEVELS[i - 1] : null;
      break;
    } else {
      nextLevel = BADGE_LEVELS[i];
    }
  }

  // Calculate progress
  let progress = 0;
  if (nextLevel) {
    const currentMin = currentLevel?.minReputation || 0;
    const nextMin = nextLevel.minReputation;
    const range = nextMin - currentMin;
    const current = reputation - currentMin;
    progress = Math.min(100, (current / range) * 100);
  } else {
    progress = 100; // Max level reached
  }

  return { nextLevel, progress };
}
