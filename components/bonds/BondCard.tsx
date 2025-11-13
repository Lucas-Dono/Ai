"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUpIcon,
  ClockIcon,
  SparklesIcon,
  AlertTriangleIcon,
  MessageCircleIcon,
} from "lucide-react";

interface Bond {
  id: string;
  tier: string;
  rarityTier: string;
  rarityScore: number;
  globalRank: number | null;
  durationDays: number;
  affinityLevel: number;
  narrativesUnlocked: string[];
  totalInteractions: number;
  status: string;
  decayPhase: string;
  lastInteraction: string;
  agent: {
    id: string;
    name: string;
    avatar: string | null;
    description: string | null;
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

const STATUS_INFO: Record<
  string,
  { color: string; label: string; description: string }
> = {
  active: {
    color: "text-green-500",
    label: "Activo",
    description: "Vínculo saludable y en buen estado",
  },
  dormant: {
    color: "text-yellow-500",
    label: "Dormido",
    description: "Requiere atención pronto",
  },
  fragile: {
    color: "text-orange-500",
    label: "Frágil",
    description: "En riesgo de deteriorarse",
  },
  at_risk: {
    color: "text-red-500",
    label: "En Riesgo",
    description: "¡Interactúa pronto para salvarlo!",
  },
};

export default function BondCard({ bond }: { bond: Bond }) {
  const rarityGradient = RARITY_COLORS[bond.rarityTier] || RARITY_COLORS.Common;
  const tierEmoji = TIER_EMOJI[bond.tier] || "❓";
  const statusInfo = STATUS_INFO[bond.status] || STATUS_INFO.active;

  const isHighRarity =
    bond.rarityTier === "Legendary" || bond.rarityTier === "Mythic";
  const isAtRisk = bond.status === "fragile" || bond.status === "at_risk";

  // Calculate days since last interaction
  const daysSinceInteraction = Math.floor(
    (Date.now() - new Date(bond.lastInteraction).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative group"
    >
      {/* Glow effect for high rarity */}
      {isHighRarity && (
        <motion.div
          className={`absolute -inset-1 bg-gradient-to-r ${rarityGradient} rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000`}
          animate={{
            opacity: [0.25, 0.5, 0.25],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        ></motion.div>
      )}

      {/* At-risk pulse effect */}
      {isAtRisk && (
        <motion.div
          className="absolute -inset-1 bg-red-500/30 rounded-xl blur"
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        ></motion.div>
      )}

      <Link href={`/bonds/${bond.id}`}>
        <div
          className={`relative bg-gradient-to-br ${rarityGradient} rounded-xl p-[2px] cursor-pointer`}
        >
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 space-y-4 h-full">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Avatar */}
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
                  {/* Status indicator dot */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${
                            statusInfo.color.replace("text-", "bg-")
                          }`}
                        ></div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{statusInfo.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Name and tier */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-lg truncate">
                    {bond.agent.name}
                  </h4>
                  <p className="text-xs text-gray-400 truncate">
                    {bond.tier.replace(/_/g, " ")}
                  </p>
                </div>
              </div>

              {/* Status badge */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <Badge
                  variant="outline"
                  className={`text-xs ${statusInfo.color} border-current`}
                >
                  {statusInfo.label}
                </Badge>
                {isAtRisk && (
                  <AlertTriangleIcon className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>

            {/* Rarity and Rank */}
            <div className="flex items-center justify-between">
              <Badge
                className={`px-3 py-1 text-xs font-bold bg-gradient-to-r ${rarityGradient} text-white border-0`}
              >
                <SparklesIcon className="h-3 w-3 mr-1" />
                {bond.rarityTier}
              </Badge>
              {bond.globalRank && bond.globalRank <= 100 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="text-xs gap-1">
                        <TrendingUpIcon className="h-3 w-3" />#{bond.globalRank}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Ranking global</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-gray-800/50 rounded-lg p-2">
                      <p className="text-xl font-bold text-purple-400">
                        {bond.affinityLevel}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase">
                        Afinidad
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Nivel de afinidad (0-100)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-gray-800/50 rounded-lg p-2">
                      <p className="text-xl font-bold text-blue-400">
                        {bond.durationDays}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase">Días</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Duración del vínculo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-gray-800/50 rounded-lg p-2">
                      <p className="text-xl font-bold text-green-400">
                        {bond.totalInteractions}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase">Chats</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Interacciones totales</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Affinity Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Progreso</span>
                <span className="text-white font-semibold">
                  {bond.affinityLevel}%
                </span>
              </div>
              <Progress
                value={bond.affinityLevel}
                className="h-2 bg-gray-700"
                indicatorClassName={`bg-gradient-to-r ${rarityGradient}`}
              />
            </div>

            {/* Bottom Info */}
            <div className="pt-2 border-t border-gray-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-gray-400">
                <ClockIcon className="h-3 w-3" />
                <span>
                  {daysSinceInteraction === 0
                    ? "Hoy"
                    : `Hace ${daysSinceInteraction}d`}
                </span>
              </div>
              {bond.narrativesUnlocked.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 text-purple-400">
                        <MessageCircleIcon className="h-3 w-3" />
                        <span>{bond.narrativesUnlocked.length} arcos</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Arcos narrativos desbloqueados</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Decay warning */}
            {isAtRisk && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-2 text-xs text-red-400 flex items-start gap-2">
                <AlertTriangleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>
                  Este vínculo está en riesgo. Interactúa pronto para evitar que
                  se deteriore.
                </p>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
