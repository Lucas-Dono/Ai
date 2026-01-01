'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface Reputation {
  userId: string;
  points: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  badges: Array<{
    id: string;
    badgeId: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: Date;
  }>;
}

interface Stats {
  aisCreated: number;
  messagesSent: number;
  worldsCreated: number;
  behaviorsConfigured: number;
  importantEvents: number;
  postCount: number;
  commentCount: number;
  totalImports: number;
  totalLikes: number;
  [key: string]: number | boolean;
}

export function useGamification() {
  const { data: session } = useSession();
  const [reputation, setReputation] = useState<Reputation | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastLevel, setLastLevel] = useState<number | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchGamificationData();
    }
  }, [session]);

  useEffect(() => {
    if (reputation && lastLevel !== null && reputation.level > lastLevel) {
      handleLevelUp(reputation.level);
    }
    if (reputation) {
      setLastLevel(reputation.level);
    }
  }, [reputation?.level]);

  const fetchGamificationData = async () => {
    try {
      const res = await fetch('/api/community/reputation/profile');
      if (res.ok) {
        const data = await res.json();
        setReputation(data.reputation);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelUp = (newLevel: number) => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    toast.success(`¡Subiste al nivel ${newLevel}!`, {
      description: 'Sigue así para desbloquear más recompensas',
    });
  };

  const checkAndNotifyBadges = async () => {
    if (!session?.user?.id) return;

    try {
      // This would be called after actions that might award badges
      const res = await fetch('/api/community/reputation/profile');
      if (res.ok) {
        const data = await res.json();
        const newBadges = data.reputation.badges.filter(
          (b: any) =>
            !reputation?.badges.find((rb) => rb.badgeId === b.badgeId)
        );

        if (newBadges.length > 0) {
          newBadges.forEach((badge: any) => {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
            });

            toast.success(`¡Nuevo badge desbloqueado!`, {
              description: `${badge.icon} ${badge.name}`,
            });
          });
        }

        setReputation(data.reputation);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
  };

  const awardPoints = async (action: string) => {
    if (!session?.user?.id) return;

    try {
      // This would call a points awarding endpoint
      await fetchGamificationData();
      await checkAndNotifyBadges();
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  };

  const followUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.following ? 'Siguiendo usuario' : 'Dejaste de seguir');
        return data.following;
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Error al actualizar seguimiento');
    }
    return false;
  };

  const dailyCheckIn = async () => {
    try {
      const res = await fetch('/api/daily-checkin', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        toast.success(`¡Check-in exitoso! +${data.points} puntos`, {
          description: data.badgeAwarded
            ? `¡Desbloqueaste un nuevo badge! 🎉`
            : `Racha actual: ${data.streak} días`,
        });

        await fetchGamificationData();
        return true;
      } else {
        toast.error('Error al hacer check-in');
        return false;
      }
    } catch (error) {
      console.error('Error during check-in:', error);
      toast.error('Error al hacer check-in');
      return false;
    }
  };

  return {
    reputation,
    stats,
    loading,
    fetchGamificationData,
    checkAndNotifyBadges,
    awardPoints,
    followUser,
    dailyCheckIn,
  };
}
