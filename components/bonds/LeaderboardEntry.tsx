"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  SparklesIcon,
  HeartIcon,
  MessageCircleIcon,
  ClockIcon,
  MinusIcon,
} from "lucide-react";

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
  previousRank?: number;
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

export default function LeaderboardEntry({
  bond,
  isCurrentUser,
}: {
  bond: RankedBond;
  isCurrentUser?: boolean;
}) {
  const rarityGradient = RARITY_COLORS[bond.rarityTier];
  const tierEmoji = TIER_EMOJI[bond.tier] || "❓";

  // Calculate rank change
  const rankChange = bond.previousRank
    ? bond.previousRank - bond.rank
    : undefined;

  // Get rank badge style
  const getRankStyle = () => {
    if (bond.rank <= 10)
      return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
    if (bond.rank <= 25)
      return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
    if (bond.rank <= 50)
      return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
    return "bg-gray-700 text-gray-200";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.01, x: 4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Link href={`/bonds/${bond.id}`}>
        <div
          className={`relative flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
            isCurrentUser
              ? "border-purple-500 bg-purple-900/20 hover:bg-purple-900/30"
              : "border-gray-700 bg-gray-800/30 hover:bg-gray-800/50 hover:border-gray-600"
          }`}
        >
          {/* Rank badge */}
          <div className="flex-shrink-0">
            <div
              className={`w-12 h-12 rounded-lg ${getRankStyle()} flex items-center justify-center font-bold text-lg shadow-lg`}
            >
              #{bond.rank}
            </div>
          </div>

          {/* Agent avatar */}
          <div className="relative flex-shrink-0">
            {bond.agent.avatar ? (
              <img
                src={bond.agent.avatar}
                alt={bond.agent.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-500/50"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl ring-2 ring-purple-500/50">
                {tierEmoji}
              </div>
            )}

            {/* Rarity indicator */}
            <div
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br ${rarityGradient} border-2 border-gray-900 flex items-center justify-center`}
            >
              <SparklesIcon className="h-3 w-3 text-white" />
            </div>
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white truncate text-lg">
                  {bond.agent.name}
                </h4>
                <p className="text-xs text-gray-400 truncate">
                  {bond.tier.replace(/_/g, " ")} • por {bond.user.name || "Usuario"}
                </p>
              </div>

              {/* Rarity badge */}
              <Badge
                className={`text-xs bg-gradient-to-r ${rarityGradient} border-0 flex-shrink-0`}
              >
                {bond.rarityTier}
              </Badge>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <SparklesIcon className="h-3 w-3" />
                      <span className="font-semibold text-white">
                        {(bond.rarityScore * 100).toFixed(1)}%
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Score de rareza</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <HeartIcon className="h-3 w-3" />
                      <span>{bond.affinityLevel}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Nivel de afinidad</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <MessageCircleIcon className="h-3 w-3" />
                      <span>{bond.totalInteractions}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Interacciones totales</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      <span>{bond.durationDays}d</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Duración del vínculo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Rank change indicator */}
          {rankChange !== undefined && (
            <div className="flex-shrink-0">
              {rankChange > 0 ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 text-green-400">
                        <TrendingUpIcon className="h-5 w-5" />
                        <span className="text-sm font-semibold">+{rankChange}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Subió {rankChange} posiciones</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : rankChange < 0 ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 text-red-400">
                        <TrendingDownIcon className="h-5 w-5" />
                        <span className="text-sm font-semibold">{rankChange}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Bajó {Math.abs(rankChange)} posiciones</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 text-gray-400">
                        <MinusIcon className="h-5 w-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Sin cambios</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}

          {/* Current user indicator */}
          {isCurrentUser && (
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="text-xs border-purple-500 text-purple-400">
                Tú
              </Badge>
            </div>
          )}

          {/* Hover effect */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
      </Link>
    </motion.div>
  );
}
