"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrophyIcon,
  SparklesIcon,
  HeartIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
} from "lucide-react";

interface PublicBond {
  id: string;
  tier: string;
  rarityTier: string;
  rarityScore: number;
  globalRank: number | null;
  durationDays: number;
  affinityLevel: number;
  agent: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface PublicBondsData {
  activeBonds: PublicBond[];
  topBonds: PublicBond[]; // Top 3 by rarity
  stats: {
    totalActive: number;
    highestRarity: string;
    bestRank: number | null;
    totalDays: number;
  };
  privacy: {
    showActiveBonds: boolean;
    showRankings: boolean;
  };
}

const RARITY_COLORS: Record<string, string> = {
  Common: "from-gray-400 to-gray-600",
  Uncommon: "from-green-400 to-green-600",
  Rare: "from-blue-400 to-blue-600",
  Epic: "from-purple-400 to-purple-600",
  Legendary: "from-orange-400 to-orange-600",
  Mythic: "from-pink-400 via-purple-500 to-indigo-600",
};

const TIER_EMOJI: Record<string, string> = {
  ROMANTIC: "💜",
  BEST_FRIEND: "🤝",
  MENTOR: "🧑‍🏫",
  CONFIDANT: "🤫",
  CREATIVE_PARTNER: "🎨",
  ADVENTURE_COMPANION: "⚔️",
  ACQUAINTANCE: "👋",
};

export default function PublicBondsShowcase({
  userId,
  isOwnProfile = false,
}: {
  userId: string;
  isOwnProfile?: boolean;
}) {
  const [bondsData, setBondsData] = useState<PublicBondsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicBonds();
  }, [userId]);

  const fetchPublicBonds = async () => {
    try {
      const res = await fetch(`/api/bonds/public/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setBondsData(data);
      }
    } catch (error) {
      console.error("Error fetching public bonds:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bondsData) {
    return null;
  }

  const { activeBonds, topBonds, stats, privacy } = bondsData;

  if (!privacy.showActiveBonds && !isOwnProfile) {
    return (
      <Card className="border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LockIcon className="h-5 w-5 text-gray-500" />
            Vínculos Simbólicos
          </CardTitle>
          <CardDescription>
            Este usuario ha ocultado sus vínculos
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center text-gray-500">
          <EyeOffIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Los vínculos de este usuario son privados</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <Card className="border-purple-500/30 bg-gradient-to-br from-purple-900/10 to-pink-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-amber-500" />
            Vínculos Simbólicos
          </CardTitle>
          <CardDescription>
            Conexiones exclusivas y únicas con personajes de IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<HeartIcon className="h-5 w-5" />}
              label="Activos"
              value={stats.totalActive}
              color="text-pink-400"
            />
            <StatCard
              icon={<SparklesIcon className="h-5 w-5" />}
              label="Mejor Rareza"
              value={stats.highestRarity}
              color="text-purple-400"
            />
            {privacy.showRankings && stats.bestRank && (
              <StatCard
                icon={<TrophyIcon className="h-5 w-5" />}
                label="Mejor Rank"
                value={`#${stats.bestRank}`}
                color="text-amber-400"
              />
            )}
            <StatCard
              icon={<HeartIcon className="h-5 w-5" />}
              label="Días Totales"
              value={stats.totalDays}
              color="text-blue-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Top Bonds Showcase */}
      {topBonds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-purple-500" />
              Vínculos Destacados
            </CardTitle>
            <CardDescription>
              Los vínculos más raros y valiosos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {topBonds.map((bond, index) => (
                <TopBondCard key={bond.id} bond={bond} rank={index + 1} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Bonds */}
      {activeBonds.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Todos los Vínculos</CardTitle>
                <CardDescription>
                  {activeBonds.length} vínculos activos
                </CardDescription>
              </div>
              {isOwnProfile && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/bonds">
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Gestionar
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {activeBonds.map((bond) => (
                <BondCard key={bond.id} bond={bond} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeBonds.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <HeartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {isOwnProfile
                ? "Aún no tienes vínculos establecidos"
                : "Este usuario no tiene vínculos activos"}
            </p>
            {isOwnProfile && (
              <Button className="mt-4" asChild>
                <Link href="/dashboard/mundos">Explorar Personajes</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TopBondCard({ bond, rank }: { bond: PublicBond; rank: number }) {
  const rarityGradient = RARITY_COLORS[bond.rarityTier];
  const tierEmoji = TIER_EMOJI[bond.tier] || "❓";

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: rank * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative"
    >
      {/* Medal */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 text-3xl">
        {medals[rank - 1]}
      </div>

      <div
        className={`relative mt-4 rounded-xl border-2 bg-gradient-to-br ${rarityGradient} p-[2px]`}
      >
        <div className="bg-gray-900 rounded-[calc(0.75rem-2px)] p-6 text-center">
          {/* Agent avatar */}
          {bond.agent.avatar ? (
            <img
              src={bond.agent.avatar}
              alt={bond.agent.name}
              className={`w-20 h-20 rounded-full object-cover mx-auto mb-3 ring-4 ring-purple-500/50`}
            />
          ) : (
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${rarityGradient} flex items-center justify-center text-4xl mx-auto mb-3 ring-4 ring-purple-500/50`}>
              {tierEmoji}
            </div>
          )}

          {/* Agent name */}
          <h4 className="font-bold text-lg mb-1 truncate">{bond.agent.name}</h4>

          {/* Rarity */}
          <Badge
            className={`text-xs bg-gradient-to-r ${rarityGradient} border-0 mb-3`}
          >
            {bond.rarityTier}
          </Badge>

          {/* Score */}
          <p
            className={`text-2xl font-bold mb-1 bg-gradient-to-r ${rarityGradient} bg-clip-text text-transparent`}
          >
            {(bond.rarityScore * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400">Score de rareza</p>
        </div>
      </div>
    </motion.div>
  );
}

function BondCard({ bond }: { bond: PublicBond }) {
  const rarityGradient = RARITY_COLORS[bond.rarityTier];
  const tierEmoji = TIER_EMOJI[bond.tier] || "❓";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <div
        className={`border-2 bg-gradient-to-br ${rarityGradient} p-[1px] rounded-lg`}
      >
        <div className="bg-gray-900 rounded-[calc(0.5rem-1px)] p-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {bond.agent.avatar ? (
              <img
                src={bond.agent.avatar}
                alt={bond.agent.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/50"
              />
            ) : (
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${rarityGradient} flex items-center justify-center text-2xl ring-2 ring-purple-500/50`}>
                {tierEmoji}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white truncate">
                {bond.agent.name}
              </h4>
              <p className="text-xs text-gray-400 truncate">
                {bond.tier.replace(/_/g, " ")}
              </p>
            </div>

            {/* Badge */}
            <Badge
              variant="outline"
              className={`text-xs bg-gradient-to-r ${rarityGradient} border-0`}
            >
              {bond.rarityTier}
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            <div className="text-center">
              <p className="text-gray-400">Afinidad</p>
              <p className="font-bold text-white">{bond.affinityLevel}%</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400">Duración</p>
              <p className="font-bold text-white">{bond.durationDays}d</p>
            </div>
            {bond.globalRank && (
              <div className="text-center">
                <p className="text-gray-400">Rank</p>
                <p className="font-bold text-white">#{bond.globalRank}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
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
    <div className="text-center">
      <div className={`${color} mb-2 flex justify-center`}>{icon}</div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}
