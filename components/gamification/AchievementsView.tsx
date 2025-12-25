'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BadgeCard } from './BadgeCard';
import { BADGES } from '@/lib/services/reputation.service';
import { useState } from 'react';

interface AchievementsViewProps {
  reputation: any;
  stats: any;
}

export function AchievementsView({ reputation, stats }: AchievementsViewProps) {
  const [category, setCategory] = useState<string>('all');

  const earnedBadgeIds = reputation.badges.map((b: any) => b.badgeId);

  const categories = [
    { id: 'all', name: 'Todos', filter: () => true },
    { id: 'creator', name: 'Creador', filter: (b: any) => ['first_ai', 'ai_master', 'ai_legend', 'voice_master', 'multimodal_expert'].includes(b.id) },
    { id: 'engagement', name: 'Engagement', filter: (b: any) => b.id.startsWith('streak_') || ['early_adopter', 'power_user'].includes(b.id) },
    { id: 'community', name: 'Comunidad', filter: (b: any) => ['first_post', 'discussion_starter', 'helpful', 'award_giver', 'event_winner'].includes(b.id) },
    { id: 'sharer', name: 'Compartir', filter: (b: any) => ['first_share', 'popular_creator', 'liked_creator'].includes(b.id) },
    { id: 'level', name: 'Nivel', filter: (b: any) => ['bronze', 'silver', 'gold', 'platinum', 'diamond'].includes(b.id) },
  ];

  const currentCategory = categories.find(c => c.id === category)!;
  const filteredBadges = BADGES.filter(currentCategory.filter);

  const earnedCount = filteredBadges.filter(b => earnedBadgeIds.includes(b.id)).length;
  const totalCount = filteredBadges.length;
  const progress = (earnedCount / totalCount) * 100;

  const getBadgeProgress = (badge: any) => {
    if (badge.pointsRequired) {
      return {
        current: Math.min(reputation.points, badge.pointsRequired),
        max: badge.pointsRequired,
      };
    }

    if (badge.condition) {
      // Extract the stat name and required value from condition
      const match = badge.condition.match(/(\w+)\s*>=\s*(\d+)/);
      if (match) {
        const [, statName, requiredValue] = match;
        const current = stats[statName] || 0;
        return {
          current: Math.min(current, parseInt(requiredValue)),
          max: parseInt(requiredValue),
        };
      }
    }

    return null;
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground">
          Logros
        </h1>
        <p className="text-muted-foreground">
          Desbloquea badges completando desafíos
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">
              {earnedCount} / {totalCount}
            </h2>
            <p className="text-muted-foreground">Badges desbloqueados</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              {progress.toFixed(0)}%
            </div>
            <p className="text-sm text-muted-foreground">Completado</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-purple-400 to-pink-500 h-3 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>

      {/* Categories */}
      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="grid w-full grid-cols-6">
          {categories.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id}>
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={category} className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredBadges.map(badge => {
              const earned = earnedBadgeIds.includes(badge.id);
              const earnedBadge = reputation.badges.find((b: any) => b.badgeId === badge.id);
              const progress = getBadgeProgress(badge);

              return (
                <BadgeCard
                  key={badge.id}
                  icon={badge.icon}
                  name={badge.name}
                  description={badge.description}
                  earned={earned}
                  earnedAt={earnedBadge?.earnedAt}
                  progress={progress?.current}
                  maxProgress={progress?.max}
                />
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Tips */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
        <h3 className="text-lg font-semibold mb-2">Consejos para desbloquear badges</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>🤖 Crea y comparte IAs para obtener badges de creador</li>
          <li>🔥 Mantén tu racha diaria activa para badges de engagement</li>
          <li>💬 Participa en la comunidad con posts y comentarios</li>
          <li>🌟 Ayuda a otros usuarios para ganar karma rápido</li>
          <li>🎯 Completa objetivos específicos para badges especiales</li>
        </ul>
      </Card>
    </div>
  );
}
