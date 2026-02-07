"use client";

import { Sparkles, Heart, Brain } from "lucide-react";

interface TierBadgeProps {
  tier: "free" | "plus" | "ultra";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function TierBadge({ tier, size = "md", showLabel = true }: TierBadgeProps) {
  const config = {
    free: {
      label: "Free",
      icon: <Sparkles />,
      gradient: "from-gray-400 to-gray-500",
      bg: "bg-gray-100",
      text: "text-gray-700",
      border: "border-gray-300",
    },
    plus: {
      label: "Plus",
      icon: <Heart />,
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-300",
    },
    ultra: {
      label: "Ultra",
      icon: <Brain />,
      gradient: "from-purple-500 via-pink-500 to-purple-600",
      bg: "bg-gradient-to-r from-purple-100 to-pink-100",
      text: "text-purple-700",
      border: "border-purple-300",
    },
  };

  const tierConfig = config[tier];

  const sizes = {
    sm: {
      container: "px-2 py-1",
      icon: "w-3 h-3",
      text: "text-xs",
    },
    md: {
      container: "px-3 py-1.5",
      icon: "w-4 h-4",
      text: "text-sm",
    },
    lg: {
      container: "px-4 py-2",
      icon: "w-5 h-5",
      text: "text-base",
    },
  };

  const sizeConfig = sizes[size];

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full border-2
        ${tierConfig.bg} ${tierConfig.border} ${sizeConfig.container}
      `}
    >
      <div className={`${tierConfig.text} ${sizeConfig.icon}`}>{tierConfig.icon}</div>
      {showLabel && (
        <span className={`font-bold ${tierConfig.text} ${sizeConfig.text}`}>{tierConfig.label}</span>
      )}
    </div>
  );
}

// Animated tier badge with glow effect (for special cases)
export function AnimatedTierBadge({ tier }: { tier: "free" | "plus" | "ultra" }) {
  if (tier !== "ultra") {
    return <TierBadge tier={tier} size="md" />;
  }

  return (
    <div className="relative inline-block">
      {/* Glow effect */}
      <div className="absolute inset-0 blur-md bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 rounded-full animate-pulse" />

      {/* Badge */}
      <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-purple-300 bg-gradient-to-r from-purple-100 to-pink-100">
        <Brain className="w-5 h-5 text-purple-700" />
        <span className="font-bold text-purple-700 text-sm">Ultra</span>
        <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
      </div>
    </div>
  );
}

// Tier comparison tooltip component
export function TierComparisonTooltip({ tier }: { tier: "free" | "plus" | "ultra" }) {
  const details = {
    free: {
      fields: "~60 campos",
      sections: "7 secciones básicas",
      model: "Gemini Flash Lite",
      special: null,
    },
    plus: {
      fields: "~160 campos",
      sections: "13 secciones completas",
      model: "Gemini Flash Lite",
      special: "Rutinas + Living AI",
    },
    ultra: {
      fields: "~240+ campos",
      sections: "16 secciones (13 + 3 Ultra)",
      model: "Gemini Flash Full",
      special: "Análisis psicológico completo",
    },
  };

  const tierDetails = details[tier];

  return (
    <div className="absolute z-10 w-64 p-4 bg-white border-2 border-gray-200 rounded-xl shadow-xl">
      <div className="mb-3">
        <TierBadge tier={tier} size="md" />
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="font-semibold text-gray-700">Campos:</span>{" "}
          <span className="text-gray-600">{tierDetails.fields}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Secciones:</span>{" "}
          <span className="text-gray-600">{tierDetails.sections}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Modelo:</span>{" "}
          <span className="text-gray-600">{tierDetails.model}</span>
        </div>
        {tierDetails.special && (
          <div className="pt-2 border-t border-gray-200">
            <span className="font-semibold text-purple-700">✨ {tierDetails.special}</span>
          </div>
        )}
      </div>
    </div>
  );
}
