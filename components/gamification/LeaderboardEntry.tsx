'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { UserLevelBadge } from './UserLevelBadge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface LeaderboardEntryProps {
  rank: number;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  level: number;
  points: number;
  badges: Array<{ icon: string; name: string }>;
  isCurrentUser?: boolean;
  className?: string;
}

export function LeaderboardEntry({
  rank,
  user,
  level,
  points,
  badges,
  isCurrentUser = false,
  className,
}: LeaderboardEntryProps) {
  const getRankDisplay = (r: number) => {
    if (r === 1) return '🥇';
    if (r === 2) return '🥈';
    if (r === 3) return '🥉';
    return `#${r}`;
  };

  const getRankClass = (r: number) => {
    if (r === 1) return 'text-yellow-500 text-2xl';
    if (r === 2) return 'text-gray-400 text-2xl';
    if (r === 3) return 'text-orange-600 text-2xl';
    return 'text-muted-foreground text-lg font-medium';
  };

  return (
    <Card
      className={cn(
        'p-4 transition-all hover:shadow-md',
        isCurrentUser && 'ring-2 ring-primary bg-primary/5',
        className
      )}
    >
      <Link href={`/profile/${user.id}`} className="block">
        <div className="flex items-center gap-4">
          <div className={cn('min-w-[3rem] text-center', getRankClass(rank))}>
            {getRankDisplay(rank)}
          </div>

          <Avatar className="h-12 w-12">
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{user.name || 'Usuario'}</h3>
              {isCurrentUser && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  Tú
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <UserLevelBadge level={level} size="sm" showText={false} />
              <span className="text-sm text-muted-foreground">
                {points.toLocaleString()} puntos
              </span>
            </div>
          </div>

          <div className="flex gap-1">
            {badges.slice(0, 3).map((badge, index) => (
              <span
                key={index}
                className="text-2xl"
                title={badge.name}
              >
                {badge.icon}
              </span>
            ))}
            {badges.length > 3 && (
              <span className="text-xs text-muted-foreground self-center">
                +{badges.length - 3}
              </span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}
