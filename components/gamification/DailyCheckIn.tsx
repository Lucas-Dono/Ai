'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StreakFlame } from './StreakFlame';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface DailyCheckInProps {
  onCheckIn?: () => void;
}

export function DailyCheckIn({ onCheckIn }: DailyCheckInProps) {
  const [loading, setLoading] = useState(false);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    fetchCheckInStatus();
  }, []);

  const fetchCheckInStatus = async () => {
    try {
      const res = await fetch('/api/daily-checkin');
      if (res.ok) {
        const data = await res.json();
        setCanCheckIn(data.canCheckIn);
        setStreak(data.currentStreak);
        setLongestStreak(data.longestStreak);
      }
    } catch (error) {
      console.error('Error fetching check-in status:', error);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/daily-checkin', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();

        // Trigger confetti
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

        setStreak(data.streak);
        setCanCheckIn(false);
        onCheckIn?.();
      } else {
        toast.error('Error al hacer check-in');
      }
    } catch (error) {
      console.error('Error during check-in:', error);
      toast.error('Error al hacer check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-orange-200 dark:border-orange-800">
      <div className="flex flex-col items-center text-center space-y-4">
        <StreakFlame streak={streak} size="lg" showText={false} />

        <div>
          <h3 className="text-2xl font-bold">Check-in Diario</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Vuelve cada día para mantener tu racha
          </p>
        </div>

        <div className="flex gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500">{streak}</div>
            <div className="text-xs text-muted-foreground">Racha actual</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-500">{longestStreak}</div>
            <div className="text-xs text-muted-foreground">Mejor racha</div>
          </div>
        </div>

        <Button
          onClick={handleCheckIn}
          disabled={!canCheckIn || loading}
          className="w-full"
          size="lg"
        >
          {loading ? 'Procesando...' : canCheckIn ? '¡Hacer Check-in!' : 'Ya hiciste check-in hoy'}
        </Button>

        <div className="grid grid-cols-3 gap-2 w-full text-center text-xs">
          <div className="bg-white/50 dark:bg-gray-800/50 rounded p-2">
            <div className="font-bold">+10</div>
            <div className="text-muted-foreground">Día 1</div>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 rounded p-2">
            <div className="font-bold">+50</div>
            <div className="text-muted-foreground">Día 7</div>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 rounded p-2">
            <div className="font-bold">+200</div>
            <div className="text-muted-foreground">Día 30</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
