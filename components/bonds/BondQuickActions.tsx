"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HeartIcon,
  SparklesIcon,
  TrendingUpIcon,
  ExternalLinkIcon,
  InfoIcon,
} from "lucide-react";

interface BondQuickActionsProps {
  bondId: string;
  tier: string;
  affinityLevel: number;
  rarityTier: string;
  agentName: string;
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

/**
 * Componente de acciones rápidas para bonds
 * Se muestra inline en el chat cuando el agente menciona el vínculo
 */
export default function BondQuickActions({
  bondId,
  tier,
  affinityLevel,
  rarityTier,
  agentName,
}: BondQuickActionsProps) {
  const rarityGradient = RARITY_COLORS[rarityTier] || RARITY_COLORS.Common;
  const tierEmoji = TIER_EMOJI[tier] || "❓";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="my-4"
    >
      <Card className={`border-2 bg-gradient-to-br ${rarityGradient} p-[1px]`}>
        <div className="bg-gray-900 rounded-[calc(0.5rem-1px)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${rarityGradient} flex items-center justify-center`}
                >
                  <HeartIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">
                    {tierEmoji} Vínculo {tier.replace(/_/g, " ")}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    con {agentName}
                  </p>
                </div>
              </div>

              <Badge
                variant="outline"
                className={`text-xs bg-gradient-to-r ${rarityGradient} border-0`}
              >
                {rarityTier}
              </Badge>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-gray-800/50 rounded p-2 text-center">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUpIcon className="h-3 w-3 text-green-400" />
                </div>
                <p className="text-xs text-gray-400">Afinidad</p>
                <p className="text-sm font-bold text-white">{affinityLevel}%</p>
              </div>

              <div className="bg-gray-800/50 rounded p-2 text-center">
                <div className="flex items-center justify-center mb-1">
                  <SparklesIcon className="h-3 w-3 text-purple-400" />
                </div>
                <p className="text-xs text-gray-400">Rareza</p>
                <p className="text-xs font-bold text-white truncate">
                  {rarityTier}
                </p>
              </div>

              <div className="bg-gray-800/50 rounded p-2 text-center">
                <div className="flex items-center justify-center mb-1">
                  <InfoIcon className="h-3 w-3 text-blue-400" />
                </div>
                <p className="text-xs text-gray-400">Estado</p>
                <p className="text-xs font-bold text-green-400">Activo</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs"
                asChild
              >
                <Link href={`/bonds/${bondId}`}>
                  <ExternalLinkIcon className="h-3 w-3 mr-1" />
                  Ver Detalles
                </Link>
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs"
                asChild
              >
                <Link href="/bonds/leaderboards">
                  <TrendingUpIcon className="h-3 w-3 mr-1" />
                  Rankings
                </Link>
              </Button>
            </div>

            {/* Info text */}
            <p className="text-[10px] text-gray-500 text-center mt-2">
              Cada interacción fortalece vuestro vínculo
            </p>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}
