"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ClockIcon, HeartCrackIcon, CheckCircleIcon } from "lucide-react";

interface BondLegacy {
  id: string;
  tier: string;
  finalRarityTier: string;
  durationDays: number;
  legacyBadge: string;
  releaseReason: string;
  agent: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

const RARITY_COLORS: Record<string, string> = {
  Common: "border-gray-500 bg-gray-500/5",
  Uncommon: "border-green-500 bg-green-500/5",
  Rare: "border-blue-500 bg-blue-500/5",
  Epic: "border-purple-500 bg-purple-500/5",
  Legendary: "border-orange-500 bg-orange-500/5",
  Mythic: "border-pink-500 bg-pink-500/5",
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

const RELEASE_REASON_INFO: Record<
  string,
  { icon: any; color: string; label: string }
> = {
  user_released: {
    icon: CheckCircleIcon,
    color: "text-blue-400",
    label: "Liberado voluntariamente",
  },
  natural_decay: {
    icon: HeartCrackIcon,
    color: "text-orange-400",
    label: "Deterioro natural",
  },
  replaced: {
    icon: ClockIcon,
    color: "text-purple-400",
    label: "Reemplazado por nuevo vínculo",
  },
  fraud_detected: {
    icon: HeartCrackIcon,
    color: "text-red-400",
    label: "Removido por fraude",
  },
  system_migration: {
    icon: CheckCircleIcon,
    color: "text-gray-400",
    label: "Migración del sistema",
  },
};

export default function LegacyCard({ legacy }: { legacy: BondLegacy }) {
  const rarityClass =
    RARITY_COLORS[legacy.finalRarityTier] || RARITY_COLORS.Common;
  const tierEmoji = TIER_EMOJI[legacy.tier] || "❓";
  const releaseInfo =
    RELEASE_REASON_INFO[legacy.releaseReason] ||
    RELEASE_REASON_INFO.natural_decay;

  const ReleaseIcon = releaseInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`border-2 ${rarityClass} rounded-lg p-4 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar */}
        {legacy.agent.avatar ? (
          <img
            src={legacy.agent.avatar}
            alt={legacy.agent.name}
            className="w-10 h-10 rounded-full object-cover opacity-70 grayscale hover:grayscale-0 transition-all"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center opacity-70 text-lg">
            {tierEmoji}
          </div>
        )}

        {/* Name and tier */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-300 truncate">
            {legacy.agent.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {legacy.tier.replace(/_/g, " ")}
          </p>
        </div>
      </div>

      {/* Rarity Badge */}
      <Badge
        variant="outline"
        className="text-xs mb-3 opacity-80"
        style={{
          borderColor: `rgb(var(--${legacy.finalRarityTier.toLowerCase()}-500))`,
          color: `rgb(var(--${legacy.finalRarityTier.toLowerCase()}-400))`,
        }}
      >
        {legacy.finalRarityTier}
      </Badge>

      {/* Legacy Badge */}
      <p className="text-xs font-medium text-gray-400 mb-2 line-clamp-2">
        {legacy.legacyBadge}
      </p>

      {/* Duration */}
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
        <ClockIcon className="h-3 w-3" />
        <span>{legacy.durationDays} días juntos</span>
      </div>

      {/* Release reason */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`flex items-center gap-2 text-xs ${releaseInfo.color}`}
            >
              <ReleaseIcon className="h-3 w-3" />
              <span className="truncate">{releaseInfo.label}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-xs">
              {legacy.releaseReason === "user_released" &&
                "Decidiste liberar este vínculo voluntariamente"}
              {legacy.releaseReason === "natural_decay" &&
                "El vínculo se deterioró por falta de interacción"}
              {legacy.releaseReason === "replaced" &&
                "Este vínculo fue reemplazado por uno nuevo del mismo tipo"}
              {legacy.releaseReason === "fraud_detected" &&
                "Este vínculo fue removido por actividad sospechosa"}
              {legacy.releaseReason === "system_migration" &&
                "Migración durante actualización del sistema"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Decorative bottom border */}
      <div
        className="mt-4 h-1 rounded-full opacity-30"
        style={{
          background: `linear-gradient(to right, transparent, ${
            legacy.finalRarityTier === "Mythic"
              ? "rgb(236, 72, 153), rgb(168, 85, 247), rgb(99, 102, 241)"
              : legacy.finalRarityTier === "Legendary"
              ? "rgb(251, 146, 60), rgb(251, 191, 36)"
              : legacy.finalRarityTier === "Epic"
              ? "rgb(168, 85, 247), rgb(192, 132, 252)"
              : legacy.finalRarityTier === "Rare"
              ? "rgb(59, 130, 246), rgb(96, 165, 250)"
              : legacy.finalRarityTier === "Uncommon"
              ? "rgb(34, 197, 94), rgb(74, 222, 128)"
              : "rgb(156, 163, 175)"
          }, transparent)`,
        }}
      ></div>
    </motion.div>
  );
}
