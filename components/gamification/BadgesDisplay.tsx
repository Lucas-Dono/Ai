"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  Trophy,
  Star,
  Zap,
  Heart,
  Users,
  TrendingUp,
  RefreshCw,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";

interface BadgeData {
  id: string;
  badgeType: string;
  tier: string;
  name: string;
  description: string;
  rewardPoints: number;
  earnedAt: string;
  metadata: any;
}

interface RewardsData {
  totalPoints: number;
  availablePoints: number;
  level: number;
  xp: number;
  xpToNext: number;
  currentStreak: number;
  longestStreak: number;
}

const TIER_COLORS: Record<string, string> = {
  bronze: "from-amber-700 to-amber-900",
  silver: "from-gray-400 to-gray-600",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-cyan-400 to-blue-500",
  diamond: "from-purple-400 to-pink-500",
};

const TIER_ICONS: Record<string, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  platinum: "💎",
  diamond: "💠",
};

const BADGE_TYPE_ICONS: Record<string, any> = {
  loyal_companion: Heart,
  quick_responder: Zap,
  streak_master: TrendingUp,
  bond_collector: Users,
  milestone_achiever: Trophy,
  social_butterfly: Star,
};

export function BadgesDisplay() {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [rewards, setRewards] = useState<RewardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/user/badges");
      if (response.ok) {
        const data = await response.json();
        setBadges(data.badges);
        setRewards(data.rewards);
      }
    } catch (error) {
      console.error("Error fetching badges:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkNewBadges = async () => {
    try {
      setChecking(true);
      const response = await fetch("/api/user/badges/check", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.count > 0) {
          // Recargar badges
          await fetchData();
        }
      }
    } catch (error) {
      console.error("Error checking badges:", error);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Agrupar badges por tipo
  const badgesByType: Record<string, BadgeData[]> = {};
  badges.forEach((badge) => {
    if (!badgesByType[badge.badgeType]) {
      badgesByType[badge.badgeType] = [];
    }
    badgesByType[badge.badgeType].push(badge);
  });

  return (
    <div className="space-y-6">
      {/* Rewards Summary */}
      {rewards && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Nivel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{rewards.level}</div>
              <Progress value={(rewards.xp / rewards.xpToNext) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {rewards.xp} / {rewards.xpToNext} XP
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Puntos Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{rewards.totalPoints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {rewards.availablePoints} disponibles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Racha Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">🔥 {rewards.currentStreak}</div>
              <p className="text-xs text-muted-foreground mt-1">días consecutivos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Racha Más Larga</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">⭐ {rewards.longestStreak}</div>
              <p className="text-xs text-muted-foreground mt-1">mejor racha</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Badges */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Mis Badges
              </CardTitle>
              <CardDescription>
                Badges ganados por mantener tus vínculos activos
              </CardDescription>
            </div>
            <Button onClick={checkNewBadges} disabled={checking} size="sm">
              {checking ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Verificar Nuevos
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <div className="text-center py-12">
              <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Aún no has ganado badges. ¡Mantén tus vínculos activos para ganar recompensas!
              </p>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="all">Todos ({badges.length})</TabsTrigger>
                {Object.keys(badgesByType).map((type) => (
                  <TabsTrigger key={type} value={type} className="text-xs">
                    {TIER_ICONS.gold} {badgesByType[type].length}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map((badge, index) => (
                    <BadgeCard key={badge.id} badge={badge} index={index} />
                  ))}
                </div>
              </TabsContent>

              {Object.entries(badgesByType).map(([type, typeBadges]) => (
                <TabsContent key={type} value={type} className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {typeBadges.map((badge, index) => (
                      <BadgeCard key={badge.id} badge={badge} index={index} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BadgeCard({ badge, index }: { badge: BadgeData; index: number }) {
  const Icon = BADGE_TYPE_ICONS[badge.badgeType] || Award;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={`relative overflow-hidden hover-lift bg-gradient-to-br ${
          TIER_COLORS[badge.tier] || "from-gray-500 to-gray-700"
        }`}
      >
        <div className="absolute top-2 right-2 text-4xl opacity-50">
          {TIER_ICONS[badge.tier]}
        </div>

        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-lg bg-white/10 backdrop-blur">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-white text-base">{badge.name}</CardTitle>
              <Badge variant="secondary" className="mt-1 text-xs">
                +{badge.rewardPoints} puntos
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-white/80">{badge.description}</p>
          <p className="text-xs text-white/60 mt-2">
            Ganado el {new Date(badge.earnedAt).toLocaleDateString("es")}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
