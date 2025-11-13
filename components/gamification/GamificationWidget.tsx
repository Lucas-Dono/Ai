'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserLevelBadge } from './UserLevelBadge';
import { StreakFlame } from './StreakFlame';
import { XPProgressBar } from './XPProgressBar';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export function GamificationWidget() {
  const { data: session } = useSession();
  const [reputation, setReputation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchReputation();
    }
  }, [session]);

  const fetchReputation = async () => {
    try {
      const res = await fetch('/api/community/reputation/profile');
      if (res.ok) {
        const data = await res.json();
        setReputation(data.reputation);
      }
    } catch (error) {
      console.error('Error fetching reputation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session || loading || !reputation) {
    return null;
  }

  const nextLevelXP = Math.floor(reputation.level ** 2 * 100);

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <UserLevelBadge level={reputation.level} size="md" />
          <StreakFlame streak={reputation.currentStreak} size="sm" />
        </div>

        <XPProgressBar
          currentXP={reputation.points}
          currentLevel={reputation.level}
          nextLevelXP={nextLevelXP}
          showNumbers={false}
        />

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="font-bold text-lg">{reputation.points.toLocaleString()}</div>
            <div className="text-muted-foreground">Karma</div>
          </div>
          <div>
            <div className="font-bold text-lg">{reputation.badges.length}</div>
            <div className="text-muted-foreground">Badges</div>
          </div>
          <div>
            <div className="font-bold text-lg">{reputation.currentStreak}</div>
            <div className="text-muted-foreground">Racha</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href="/daily">Check-in</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href="/achievements">Logros</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
