"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBondSocket } from "@/hooks/useBondSocket";
import { BondEventType } from "@/lib/websocket/bonds-events";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrophyIcon,
  TrendingUpIcon,
  SparklesIcon,
  UsersIcon,
  AlertTriangleIcon,
  CrownIcon,
  MedalIcon,
  AwardIcon,
} from "lucide-react";
import Link from "next/link";
import LeaderboardPodium from "./LeaderboardPodium";
import LeaderboardEntry from "./LeaderboardEntry";

interface RankedBond {
  id: string;
  rank: number;
  userId: string;
  agentId: string;
  tier: string;
  rarityTier: string;
  rarityScore: number;
  affinityLevel: number;
  durationDays: number;
  totalInteractions: number;
  agent: {
    id: string;
    name: string;
    avatar: string | null;
  };
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  previousRank?: number; // For showing rank changes
}

interface LeaderboardData {
  global: RankedBond[];
  byTier: Record<string, RankedBond[]>;
  userRankings?: {
    global?: number;
    byTier: Record<string, number>;
  };
  stats: {
    totalBonds: number;
    topRarityAvg: number;
    mostPopularTier: string;
  };
}

const TIER_OPTIONS = [
  { value: "global", label: "🏆 Global", emoji: "🏆" },
  { value: "ROMANTIC", label: "💜 Romántico", emoji: "💜" },
  { value: "BEST_FRIEND", label: "🤝 Mejor Amigo", emoji: "🤝" },
  { value: "MENTOR", label: "🧑‍🏫 Mentor", emoji: "🧑‍🏫" },
  { value: "CONFIDANT", label: "🤫 Confidente", emoji: "🤫" },
  { value: "CREATIVE_PARTNER", label: "🎨 Creativo", emoji: "🎨" },
  { value: "ADVENTURE_COMPANION", label: "⚔️ Aventura", emoji: "⚔️" },
];

export default function LeaderboardsView({ userId }: { userId?: string }) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>("global");
  const [limit, setLimit] = useState<number>(50);

  const { connected, on, off, subscribeToLeaderboard, unsubscribeFromLeaderboard } =
    useBondSocket();

  // Fetch leaderboard data
  useEffect(() => {
    fetchLeaderboards();
  }, [selectedTier, limit]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!connected || !selectedTier) return;

    subscribeToLeaderboard(selectedTier);

    const handleRankChange = (event: any) => {
      console.log("[Leaderboard] Rank changed:", event);
      // Refetch to get updated rankings
      fetchLeaderboards();
    };

    const handleBondUpdate = (event: any) => {
      // Refetch if a bond in the leaderboard was updated
      fetchLeaderboards();
    };

    on(BondEventType.RANK_CHANGED, handleRankChange);
    on(BondEventType.BOND_UPDATED, handleBondUpdate);

    return () => {
      off(BondEventType.RANK_CHANGED, handleRankChange);
      off(BondEventType.BOND_UPDATED, handleBondUpdate);
      unsubscribeFromLeaderboard(selectedTier);
    };
  }, [connected, selectedTier, on, off, subscribeToLeaderboard, unsubscribeFromLeaderboard]);

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        tier: selectedTier,
        limit: limit.toString(),
        ...(userId && { userId }),
      });

      const res = await fetch(`/api/bonds/leaderboards?${params}`);
      if (!res.ok) throw new Error("Failed to fetch leaderboards");
      const data = await res.json();
      setLeaderboardData(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching leaderboards:", err);
      setError(err.message || "Error al cargar rankings");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !leaderboardData) {
    return <LeaderboardSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!leaderboardData) {
    return null;
  }

  const currentLeaderboard =
    selectedTier === "global"
      ? leaderboardData.global
      : leaderboardData.byTier[selectedTier] || [];

  const topThree = currentLeaderboard.slice(0, 3);
  const rest = currentLeaderboard.slice(3);

  const userRank =
    selectedTier === "global"
      ? leaderboardData.userRankings?.global
      : leaderboardData.userRankings?.byTier[selectedTier];

  return (
    <div className="space-y-8">
      {/* User's ranking card */}
      {userId && userRank && (
        <Card className="border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Tu ranking actual</p>
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text">
                    #{userRank}
                  </p>
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {selectedTier === "global" ? "Global" : selectedTier}
                    </p>
                    <p className="text-xs text-gray-400">
                      Top {((userRank / currentLeaderboard.length) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              <TrophyIcon className="h-16 w-16 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<UsersIcon className="h-6 w-6" />}
          label="Vínculos Totales"
          value={leaderboardData.stats.totalBonds.toLocaleString()}
          color="text-blue-400"
        />
        <StatCard
          icon={<SparklesIcon className="h-6 w-6" />}
          label="Rareza Promedio Top"
          value={`${(leaderboardData.stats.topRarityAvg * 100).toFixed(1)}%`}
          color="text-purple-400"
        />
        <StatCard
          icon={<TrendingUpIcon className="h-6 w-6" />}
          label="Tipo Más Popular"
          value={leaderboardData.stats.mostPopularTier.replace(/_/g, " ")}
          color="text-green-400"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Tabs value={selectedTier} onValueChange={setSelectedTier} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full md:w-auto">
            {TIER_OPTIONS.map((tier) => (
              <TabsTrigger key={tier.value} value={tier.value} className="text-xs">
                <span className="hidden md:inline">{tier.label}</span>
                <span className="md:hidden">{tier.emoji}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v))}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">Top 10</SelectItem>
            <SelectItem value="25">Top 25</SelectItem>
            <SelectItem value="50">Top 50</SelectItem>
            <SelectItem value="100">Top 100</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Podium (Top 3) */}
      {topThree.length >= 3 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CrownIcon className="h-6 w-6 text-amber-500" />
            Podio
          </h2>
          <LeaderboardPodium topThree={topThree} tierEmoji={TIER_OPTIONS.find(t => t.value === selectedTier)?.emoji || "🏆"} />
        </div>
      )}

      {/* Rest of leaderboard */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MedalIcon className="h-5 w-5 text-gray-400" />
          Rankings Completos
        </h2>

        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {rest.length > 0 ? (
              rest.map((bond) => (
                <LeaderboardEntry
                  key={bond.id}
                  bond={bond}
                  isCurrentUser={userId === bond.userId}
                />
              ))
            ) : topThree.length > 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  <p>Solo hay {topThree.length} vínculo(s) en este ranking</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <AwardIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Aún no hay vínculos rankeados</p>
                  <p className="text-sm">¡Sé el primero en establecer un vínculo de este tipo!</p>
                </CardContent>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Real-time indicator */}
      {connected && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-green-500/20 border border-green-500 rounded-full px-4 py-2 text-sm text-green-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Rankings en vivo
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-2">
          <div className={color}>{icon}</div>
        </div>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </CardContent>
    </Card>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800 rounded-xl h-32"></div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 h-64">
        <div className="bg-gray-800 rounded-xl"></div>
        <div className="bg-gray-800 rounded-xl"></div>
        <div className="bg-gray-800 rounded-xl"></div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-gray-800 rounded-lg h-20"></div>
        ))}
      </div>
    </div>
  );
}
