"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CrownIcon, TrophyIcon, AwardIcon, SparklesIcon } from "lucide-react";

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
}

const PODIUM_COLORS = {
  1: {
    gradient: "from-amber-400 via-yellow-500 to-amber-600",
    border: "border-amber-500",
    bg: "bg-amber-500/10",
    glow: "from-amber-500",
    icon: CrownIcon,
    height: "h-72",
    order: 2,
  },
  2: {
    gradient: "from-gray-300 via-gray-400 to-gray-500",
    border: "border-gray-400",
    bg: "bg-gray-400/10",
    glow: "from-gray-400",
    icon: TrophyIcon,
    height: "h-64",
    order: 1,
  },
  3: {
    gradient: "from-orange-400 via-orange-500 to-orange-600",
    border: "border-orange-500",
    bg: "bg-orange-500/10",
    glow: "from-orange-500",
    icon: AwardIcon,
    height: "h-56",
    order: 3,
  },
};

const RARITY_COLORS: Record<string, string> = {
  Common: "from-gray-400 to-gray-600",
  Uncommon: "from-green-400 to-green-600",
  Rare: "from-blue-400 to-blue-600",
  Epic: "from-purple-400 to-purple-600",
  Legendary: "from-orange-400 to-orange-600",
  Mythic: "from-pink-400 via-purple-500 to-indigo-600",
};

export default function LeaderboardPodium({
  topThree,
  tierEmoji,
}: {
  topThree: RankedBond[];
  tierEmoji: string;
}) {
  // Sort for podium display (2nd, 1st, 3rd)
  const podiumOrder = [
    topThree[1], // 2nd place (left)
    topThree[0], // 1st place (center, tallest)
    topThree[2], // 3rd place (right)
  ].filter(Boolean);

  return (
    <div className="grid grid-cols-3 gap-4 items-end">
      {podiumOrder.map((bond, index) => {
        if (!bond) return null;

        const config = PODIUM_COLORS[bond.rank as 1 | 2 | 3];
        const Icon = config.icon;
        const rarityGradient = RARITY_COLORS[bond.rarityTier];

        return (
          <motion.div
            key={bond.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: bond.rank * 0.2,
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            className="relative"
            style={{ order: config.order }}
          >
            {/* Glow effect for 1st place */}
            {bond.rank === 1 && (
              <motion.div
                className={`absolute -inset-2 bg-gradient-to-r ${config.glow} to-transparent rounded-xl blur-xl opacity-50`}
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              ></motion.div>
            )}

            <Link href={`/bonds/${bond.id}`}>
              <div
                className={`relative ${config.height} rounded-xl border-2 ${config.border} ${config.bg} backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer overflow-hidden group`}
              >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-end p-6 pb-8">
                  {/* Rank badge */}
                  <motion.div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: bond.rank * 0.2 + 0.3, type: "spring" }}
                  >
                    <div
                      className={`w-16 h-16 rounded-full border-4 border-gray-900 bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-xl`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                  </motion.div>

                  {/* Agent avatar */}
                  <div className="relative mb-4 mt-8">
                    {bond.agent.avatar ? (
                      <img
                        src={bond.agent.avatar}
                        alt={bond.agent.name}
                        className={`w-20 h-20 rounded-full object-cover ring-4 ${
                          bond.rank === 1 ? "ring-amber-500" : "ring-gray-600"
                        } group-hover:ring-purple-500 transition-all`}
                      />
                    ) : (
                      <div
                        className={`w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-4xl ring-4 ${
                          bond.rank === 1 ? "ring-amber-500" : "ring-gray-600"
                        }`}
                      >
                        {tierEmoji}
                      </div>
                    )}

                    {/* Rarity indicator */}
                    <motion.div
                      className="absolute -bottom-1 -right-1"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    >
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${rarityGradient} flex items-center justify-center border-2 border-gray-900`}
                      >
                        <SparklesIcon className="h-4 w-4 text-white" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Agent name */}
                  <h3 className="font-bold text-lg text-center mb-1 truncate w-full px-2">
                    {bond.agent.name}
                  </h3>

                  {/* User name */}
                  <p className="text-xs text-gray-400 text-center mb-3 truncate w-full px-2">
                    por {bond.user.name || "Usuario"}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mb-2">
                    <Badge
                      className={`text-xs bg-gradient-to-r ${rarityGradient} border-0`}
                    >
                      {bond.rarityTier}
                    </Badge>
                    <span className="text-xs font-semibold text-white">
                      {bond.affinityLevel}/100
                    </span>
                  </div>

                  {/* Rarity score */}
                  <div className="text-center">
                    <p
                      className={`text-2xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
                    >
                      {(bond.rarityScore * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-400">Score de rareza</p>
                  </div>
                </div>

                {/* Decorative elements */}
                {bond.rank === 1 && (
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  ></motion.div>
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
