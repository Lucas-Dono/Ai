'use client';

import { Card } from '@/components/ui/card';
import { DailyCheckIn } from './DailyCheckIn';
import { useRouter } from 'next/navigation';

interface DailyRewardsViewProps {
  reputation: any;
}

export function DailyRewardsView({ reputation }: DailyRewardsViewProps) {
  const router = useRouter();

  const handleCheckIn = () => {
    router.refresh();
  };

  const streakMilestones = [
    { days: 1, reward: '10 karma', icon: '🎁' },
    { days: 3, reward: '35 karma', icon: '🎁' },
    { days: 7, reward: '50 karma + Badge', icon: '🏆' },
    { days: 14, reward: '120 karma', icon: '🎁' },
    { days: 30, reward: '200 karma + Special Badge', icon: '💎' },
    { days: 60, reward: '450 karma', icon: '🎁' },
    { days: 100, reward: '500 karma + Legendary Badge', icon: '👑' },
  ];

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-4xl">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground">
          Recompensas Diarias
        </h1>
        <p className="text-muted-foreground">
          Haz check-in cada día para ganar recompensas progresivas
        </p>
      </div>

      {/* Daily Check-in Widget */}
      <DailyCheckIn onCheckIn={handleCheckIn} />

      {/* Streak Milestones */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Hitos de Racha</h2>
        <p className="text-muted-foreground mb-6">
          Desbloquea recompensas especiales al alcanzar estos hitos
        </p>

        <div className="space-y-3">
          {streakMilestones.map((milestone) => {
            const achieved = reputation.currentStreak >= milestone.days;
            const current = reputation.currentStreak === milestone.days;

            return (
              <div
                key={milestone.days}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  current
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                    : achieved
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                    : 'border-gray-200 dark:border-gray-700 opacity-60'
                }`}
              >
                <div className="text-4xl">{milestone.icon}</div>

                <div className="flex-1">
                  <h3 className="font-semibold">Día {milestone.days}</h3>
                  <p className="text-sm text-muted-foreground">{milestone.reward}</p>
                </div>

                {achieved && (
                  <div className="text-green-500 font-bold">✓ Completado</div>
                )}
                {current && (
                  <div className="text-orange-500 font-bold animate-pulse">← Estás aquí</div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tips Card */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <h3 className="text-lg font-semibold mb-2">💡 Consejos</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Haz check-in cada 24 horas para mantener tu racha</li>
          <li>• Si pierdes un día, tu racha se reinicia a 1</li>
          <li>• Las recompensas aumentan exponencialmente con tu racha</li>
          <li>• Los badges de racha son permanentes una vez desbloqueados</li>
          <li>• Establece un recordatorio diario para no perder tu racha</li>
        </ul>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold text-orange-500">
            {reputation.currentStreak}
          </div>
          <div className="text-sm text-muted-foreground mt-2">Racha Actual</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold text-yellow-500">
            {reputation.longestStreak}
          </div>
          <div className="text-sm text-muted-foreground mt-2">Mejor Racha</div>
        </Card>
      </div>
    </div>
  );
}
