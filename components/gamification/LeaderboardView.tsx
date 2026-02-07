'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeaderboardEntry } from './LeaderboardEntry';
import { Skeleton } from '@/components/ui/skeleton';

interface LeaderboardViewProps {
  currentUserId?: string;
}

type TimeRange = 'week' | 'month' | 'all';

export function LeaderboardView({ currentUserId }: LeaderboardViewProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeRange]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/community/reputation/leaderboard?timeRange=${timeRange}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setLeaders(data);

        // Find current user's rank
        if (currentUserId) {
          const rank = data.findIndex((l: any) => l.userId === currentUserId);
          setUserRank(rank !== -1 ? rank + 1 : null);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground">
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          Los mejores creadores de la comunidad
        </p>
      </div>

      {userRank && (
        <Card className="p-4 bg-primary/5 border-primary">
          <p className="text-center">
            <span className="font-bold">Tu posición: #{userRank}</span>
            <span className="text-muted-foreground ml-2">
              ({leaders[userRank - 1]?.points.toLocaleString()} puntos)
            </span>
          </p>
        </Card>
      )}

      <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week">Esta Semana</TabsTrigger>
          <TabsTrigger value="month">Este Mes</TabsTrigger>
          <TabsTrigger value="all">Todo el Tiempo</TabsTrigger>
        </TabsList>

        <TabsContent value={timeRange} className="space-y-4 mt-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {leaders.map((leader, index) => (
                <LeaderboardEntry
                  key={leader.userId}
                  rank={index + 1}
                  user={leader.user}
                  level={leader.level}
                  points={leader.points}
                  badges={leader.badges}
                  isCurrentUser={leader.userId === currentUserId}
                />
              ))}
              {leaders.length === 0 && (
                <Card className="p-8">
                  <p className="text-center text-muted-foreground">
                    No hay datos para este período
                  </p>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Top AI Creators</h2>
          <div className="space-y-3">
            {leaders
              .sort((a, b) => {
                const aAIs = a.user.agents?.length || 0;
                const bAIs = b.user.agents?.length || 0;
                return bAIs - aAIs;
              })
              .slice(0, 5)
              .map((leader, index) => (
                <div key={leader.userId} className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-muted-foreground">
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold">{leader.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {leader.user.agents?.length || 0} IAs creadas
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Top Contributors</h2>
          <div className="space-y-3">
            {leaders
              .sort((a, b) => {
                const aPosts = a.user.posts?.length || 0;
                const bPosts = b.user.posts?.length || 0;
                return bPosts - aPosts;
              })
              .slice(0, 5)
              .map((leader, index) => (
                <div key={leader.userId} className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-muted-foreground">
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold">{leader.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {leader.user.posts?.length || 0} posts
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
