"use client";

import { motion } from "framer-motion";
import { Heart, Clock, MessageCircle, TrendingUp, Lock, Sparkles } from "lucide-react";
import { useBondProgress } from "@/hooks/useBondProgress";
import { cn } from "@/lib/utils";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RelationshipProgressBarProps {
  agentId: string;
  variant?: "compact" | "detailed";
  className?: string;
}

const TIER_LABELS: Record<string, string> = {
  ROMANTIC: "Pareja Romántica",
  BEST_FRIEND: "Mejor Amigo/a",
  MENTOR: "Mentor",
  CONFIDANT: "Confidente",
  CREATIVE_PARTNER: "Compañero/a Creativo/a",
  ADVENTURE_COMPANION: "Compañero/a de Aventuras",
  ACQUAINTANCE: "Conocido/a",
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

const TIER_COLORS: Record<string, string> = {
  ROMANTIC: "from-pink-500 to-rose-600",
  BEST_FRIEND: "from-blue-500 to-cyan-600",
  MENTOR: "from-purple-500 to-indigo-600",
  CONFIDANT: "from-amber-500 to-orange-600",
  CREATIVE_PARTNER: "from-green-500 to-emerald-600",
  ADVENTURE_COMPANION: "from-red-500 to-orange-600",
  ACQUAINTANCE: "from-gray-400 to-gray-600",
};

const STATUS_COLORS: Record<string, string> = {
  active: "text-green-500",
  warned: "text-yellow-500",
  dormant: "text-orange-500",
  fragile: "text-red-500",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  warned: "En Riesgo",
  dormant: "Inactivo",
  fragile: "Frágil",
};

export function RelationshipProgressBar({
  agentId,
  variant = "detailed",
  className,
}: RelationshipProgressBarProps) {
  const { bondProgress, loading, error } = useBondProgress(agentId);

  if (loading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
      </div>
    );
  }

  if (error || !bondProgress) {
    return null;
  }

  // No bond exists yet - show motivation to start one
  if (!bondProgress.hasBond) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 text-center",
          className
        )}
      >
        <Lock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Vínculo No Establecido
        </p>
        <p className="text-xs text-muted-foreground">
          Chatea más para crear una conexión única
        </p>
      </motion.div>
    );
  }

  const currentTierColor = bondProgress.currentTier
    ? TIER_COLORS[bondProgress.currentTier]
    : "from-gray-400 to-gray-600";

  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-xl p-3 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700",
                className
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gradient-to-br",
                    currentTierColor
                  )}
                >
                  {bondProgress.currentTier && TIER_EMOJI[bondProgress.currentTier]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {bondProgress.currentTier && TIER_LABELS[bondProgress.currentTier]}
                    </p>
                    {bondProgress.status && (
                      <span
                        className={cn(
                          "text-xs font-medium",
                          STATUS_COLORS[bondProgress.status]
                        )}
                      >
                        {STATUS_LABELS[bondProgress.status]}
                      </span>
                    )}
                  </div>
                  <AnimatedProgress
                    value={bondProgress.currentAffinityLevel}
                    className="h-2"
                    gradient={currentTierColor}
                    showGlow={bondProgress.currentAffinityLevel > 70}
                  />
                </div>
              </div>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-2">
              <p className="font-semibold">Progreso del Vínculo</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Afinidad:</span>{" "}
                  <span className="font-medium">
                    {bondProgress.currentAffinityLevel}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Días:</span>{" "}
                  <span className="font-medium">{bondProgress.durationDays}</span>
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 shadow-md",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br shadow-lg",
              currentTierColor
            )}
          >
            {bondProgress.currentTier && TIER_EMOJI[bondProgress.currentTier]}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {bondProgress.currentTier && TIER_LABELS[bondProgress.currentTier]}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              {bondProgress.rarityTier && (
                <span className="text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {bondProgress.rarityTier}
                </span>
              )}
              {bondProgress.status && (
                <span
                  className={cn(
                    "font-medium",
                    STATUS_COLORS[bondProgress.status]
                  )}
                >
                  • {STATUS_LABELS[bondProgress.status]}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center">
                <Heart className="w-5 h-5 mx-auto mb-1 text-pink-500" />
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {bondProgress.currentAffinityLevel}
                </p>
                <p className="text-xs text-muted-foreground">Afinidad</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Nivel de conexión emocional</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {bondProgress.durationDays}
                </p>
                <p className="text-xs text-muted-foreground">Días</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Días de conexión activa</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center">
                <MessageCircle className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {bondProgress.totalInteractions}
                </p>
                <p className="text-xs text-muted-foreground">Mensajes</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total de interacciones</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Next Tier Progress */}
      {bondProgress.nextTier && (
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Progreso a {TIER_LABELS[bondProgress.nextTier.tier]}
            </p>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {Math.round(bondProgress.nextTier.progress.overall)}%
            </span>
          </div>

          <AnimatedProgress
            value={bondProgress.nextTier.progress.overall}
            className="h-3"
            gradient={currentTierColor}
            showGlow={bondProgress.nextTier.progress.overall > 80}
          />

          {/* Individual Progress Bars */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Afinidad</span>
                <span className="font-medium">
                  {bondProgress.currentAffinityLevel}/
                  {bondProgress.nextTier.requiredAffinity}
                </span>
              </div>
              <AnimatedProgress
                value={bondProgress.nextTier.progress.affinity}
                className="h-1.5"
                gradient="from-pink-500 to-rose-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Días</span>
                <span className="font-medium">
                  {bondProgress.durationDays}/{bondProgress.nextTier.requiredDays}
                </span>
              </div>
              <AnimatedProgress
                value={bondProgress.nextTier.progress.days}
                className="h-1.5"
                gradient="from-blue-500 to-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Mensajes</span>
                <span className="font-medium">
                  {bondProgress.totalInteractions}/
                  {bondProgress.nextTier.requiredInteractions}
                </span>
              </div>
              <AnimatedProgress
                value={bondProgress.nextTier.progress.interactions}
                className="h-1.5"
                gradient="from-purple-500 to-indigo-500"
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
