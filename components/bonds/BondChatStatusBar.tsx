"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HeartIcon,
  SparklesIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  InfoIcon,
  ExternalLinkIcon,
  ZapIcon,
} from "lucide-react";

interface BondStatus {
  hasBond: boolean;
  bondId?: string;
  tier?: string;
  affinityLevel?: number;
  rarityTier?: string;
  status?: string;
  daysInactive?: number;
  canEstablish?: boolean;
  reason?: string; // Why can't establish
}

const TIER_EMOJI: Record<string, string> = {
  ROMANTIC: "💜",
  BEST_FRIEND: "🤝",
  MENTOR: "🧑‍🏫",
  CONFIDANT: "🤫",
  CREATIVE_PARTNER: "🎨",
  ADVENTURE_COMPANION: "⚔️",
  ACQUAINTANCE: "👋",
};

const RARITY_COLORS: Record<string, string> = {
  Common: "from-gray-400 to-gray-600",
  Uncommon: "from-green-400 to-green-600",
  Rare: "from-blue-400 to-blue-600",
  Epic: "from-purple-400 to-purple-600",
  Legendary: "from-orange-400 to-orange-600",
  Mythic: "from-pink-400 via-purple-500 to-indigo-600",
};

const STATUS_INFO: Record<string, { color: string; icon: any; message: string }> = {
  active: {
    color: "text-green-500",
    icon: HeartIcon,
    message: "Vínculo saludable",
  },
  dormant: {
    color: "text-yellow-500",
    icon: AlertTriangleIcon,
    message: "Necesita atención",
  },
  fragile: {
    color: "text-orange-500",
    icon: AlertTriangleIcon,
    message: "En riesgo",
  },
  at_risk: {
    color: "text-red-500",
    icon: AlertTriangleIcon,
    message: "¡Riesgo crítico!",
  },
};

export default function BondChatStatusBar({
  agentId,
  agentName,
  userId,
}: {
  agentId: string;
  agentName: string;
  userId: string;
}) {
  const [bondStatus, setBondStatus] = useState<BondStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchBondStatus();
  }, [agentId, userId]);

  const fetchBondStatus = async () => {
    try {
      const res = await fetch(
        `/api/bonds/check-status?agentId=${agentId}&userId=${userId}`
      );
      if (res.ok) {
        const data = await res.json();
        setBondStatus(data);
      }
    } catch (error) {
      console.error("Error fetching bond status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm p-3">
        <div className="h-8 bg-gray-800 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!bondStatus) return null;

  const { hasBond, bondId, tier, affinityLevel, rarityTier, status, daysInactive, canEstablish, reason } =
    bondStatus;

  if (!hasBond) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-sm p-4"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">
                {canEstablish
                  ? "Establece un vínculo exclusivo"
                  : "Vínculo no disponible"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {canEstablish
                  ? "Crea una conexión única y especial"
                  : reason || "Este tipo de vínculo está lleno"}
              </p>
            </div>
          </div>

          {canEstablish ? (
            <Button size="sm" className="flex-shrink-0">
              <HeartIcon className="h-4 w-4 mr-2" />
              Establecer
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="flex-shrink-0">
              <InfoIcon className="h-4 w-4 mr-2" />
              Unirse a Cola
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  const tierEmoji = TIER_EMOJI[tier!] || "❓";
  const rarityGradient = RARITY_COLORS[rarityTier!];
  const statusInfo = STATUS_INFO[status!];
  const isAtRisk = status === "fragile" || status === "at_risk";
  const StatusIcon = statusInfo?.icon || HeartIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-t backdrop-blur-sm ${
        isAtRisk
          ? "border-red-500/50 bg-red-900/20"
          : "border-purple-500/30 bg-gradient-to-r from-gray-900/80 to-gray-800/80"
      }`}
    >
      {/* Compact view */}
      <div className="p-3">
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`w-10 h-10 rounded-full ${
                    isAtRisk ? "bg-red-600" : `bg-gradient-to-br ${rarityGradient}`
                  } flex items-center justify-center flex-shrink-0 cursor-pointer`}
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <StatusIcon className="h-5 w-5 text-white" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{statusInfo?.message}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-white">
                {tierEmoji} {tier?.replace(/_/g, " ")}
              </span>
              <Badge
                variant="outline"
                className={`text-xs bg-gradient-to-r ${rarityGradient} border-0`}
              >
                {rarityTier}
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <Progress
                value={affinityLevel}
                className="h-2 flex-1"
                indicatorClassName={`bg-gradient-to-r ${rarityGradient}`}
              />
              <span className="text-xs font-semibold text-gray-400 flex-shrink-0">
                {affinityLevel}%
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isAtRisk && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-red-400 text-xs">
                      <AlertTriangleIcon className="h-4 w-4 animate-pulse" />
                      <span>{daysInactive}d</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {daysInactive} días sin interacción
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="h-8 w-8 p-0"
            >
              <InfoIcon className="h-4 w-4" />
            </Button>

            <Button size="sm" variant="outline" asChild className="h-8">
              <Link href={`/bonds/${bondId}`}>
                <ExternalLinkIcon className="h-3 w-3 mr-1" />
                Ver
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-gray-700"
          >
            <div className="p-4 space-y-3 bg-gray-900/50">
              {/* Warning */}
              {isAtRisk && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-xs text-red-200">
                  <p className="font-semibold mb-1">⚠️ Vínculo en Riesgo</p>
                  <p>
                    Este vínculo lleva {daysInactive} días sin interacción.
                    Continúa chateando para mantenerlo activo.
                  </p>
                </div>
              )}

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <ZapIcon className="h-3 w-3 text-purple-400" />
                  </div>
                  <p className="text-xs text-gray-400">Interacción</p>
                  <p className="text-sm font-bold text-white">
                    +{Math.floor(Math.random() * 5) + 1}
                  </p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUpIcon className="h-3 w-3 text-green-400" />
                  </div>
                  <p className="text-xs text-gray-400">Afinidad</p>
                  <p className="text-sm font-bold text-white">{affinityLevel}%</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <SparklesIcon className="h-3 w-3 text-amber-400" />
                  </div>
                  <p className="text-xs text-gray-400">Rareza</p>
                  <p className="text-sm font-bold text-white truncate">
                    {rarityTier}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" asChild>
                  <Link href={`/bonds/${bondId}`}>
                    Ver Detalles Completos
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
