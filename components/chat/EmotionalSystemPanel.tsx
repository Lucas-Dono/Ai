"use client";

/**
 * Emotional System Panel
 *
 * Panel visual del sistema emocional del agente
 * - Mostrar emociones actuales
 * - Nivel de relación
 * - Estadísticas (trust, affinity, respect)
 * - Toggle activable por el usuario
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmotionalState {
  emotions: string[];
  relationLevel: number;
  relationState: {
    trust: number;
    affinity: number;
    respect: number;
  };
}

interface EmotionalSystemPanelProps {
  agentName: string;
  emotionalState: EmotionalState;
  className?: string;
}

const EMOTION_ICONS: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  surprised: "😮",
  fearful: "😨",
  disgusted: "🤢",
  neutral: "😐",
  excited: "🤩",
  calm: "😌",
  anxious: "😰",
  confused: "😕",
  loving: "🥰",
};

const getRelationshipInfo = (level: number) => {
  if (level < 20) return { label: "Desconocido", color: "bg-gray-500", emoji: "👤" };
  if (level < 40) return { label: "Conocido", color: "bg-blue-500", emoji: "🙂" };
  if (level < 60) return { label: "Amigo", color: "bg-green-500", emoji: "😊" };
  if (level < 80) return { label: "Buen amigo", color: "bg-yellow-500", emoji: "😄" };
  return { label: "Mejor amigo", color: "bg-purple-500", emoji: "🤗" };
};

export function EmotionalSystemPanel({
  agentName,
  emotionalState,
  className,
}: EmotionalSystemPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { emotions, relationLevel, relationState } = emotionalState;
  const primaryEmotion = emotions[0] || "neutral";
  const relationInfo = getRelationshipInfo(relationLevel);

  if (!isVisible) {
    // Botón flotante para activar
    return (
      <div className={cn("fixed bottom-20 right-4 z-40", className)}>
        <Button
          onClick={() => setIsVisible(true)}
          className="rounded-full h-12 w-12 shadow-lg bg-purple-600 hover:bg-purple-700"
          title="Mostrar sistema emocional"
        >
          <Eye className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-20 right-4 z-40", className)}>
      <div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-500/20 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-300" />
            <h3 className="text-sm font-semibold text-white">
              Estado Emocional
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 w-7 text-purple-300 hover:text-white hover:bg-purple-800/50"
            >
              <span className="text-xs">{isExpanded ? "−" : "+"}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible(false)}
              className="h-7 w-7 text-purple-300 hover:text-white hover:bg-purple-800/50"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 min-w-[280px]">
          {/* Emoción principal */}
          <div className="flex items-center gap-3">
            <span className="text-4xl">
              {EMOTION_ICONS[primaryEmotion] || "😐"}
            </span>
            <div className="flex-1">
              <p className="text-xs text-purple-300">Se siente</p>
              <p className="text-sm font-semibold text-white capitalize">
                {primaryEmotion}
              </p>
              {emotions.length > 1 && (
                <p className="text-xs text-purple-400">
                  +{emotions.length - 1} emoción{emotions.length > 2 ? "es" : ""} más
                </p>
              )}
            </div>
          </div>

          {/* Nivel de relación */}
          <div>
            <div className="flex justify-between items-center text-xs text-purple-300 mb-2">
              <div className="flex items-center gap-1">
                <span>{relationInfo.emoji}</span>
                <span>{relationInfo.label}</span>
              </div>
              <span className="font-semibold">{relationLevel}%</span>
            </div>
            <div className="h-2 bg-purple-950/50 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  relationInfo.color
                )}
                style={{ width: `${relationLevel}%` }}
              />
            </div>
          </div>

          {/* Estadísticas detalladas (expandible) */}
          {isExpanded && (
            <div className="pt-3 border-t border-purple-500/20 space-y-3 animate-in slide-in-from-top duration-200">
              <p className="text-xs text-purple-300 font-semibold">
                Detalles de la relación:
              </p>

              {/* Trust */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-purple-300">🔒 Confianza</span>
                  <span className="text-white font-semibold">
                    {Math.round(relationState.trust * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-purple-950/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${relationState.trust * 100}%` }}
                  />
                </div>
              </div>

              {/* Affinity */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-purple-300">❤️ Afinidad</span>
                  <span className="text-white font-semibold">
                    {Math.round(relationState.affinity * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-purple-950/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-pink-500 transition-all duration-500"
                    style={{ width: `${relationState.affinity * 100}%` }}
                  />
                </div>
              </div>

              {/* Respect */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-purple-300">⭐ Respeto</span>
                  <span className="text-white font-semibold">
                    {Math.round(relationState.respect * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-purple-950/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 transition-all duration-500"
                    style={{ width: `${relationState.respect * 100}%` }}
                  />
                </div>
              </div>

              {/* Todas las emociones */}
              {emotions.length > 1 && (
                <div>
                  <p className="text-xs text-purple-300 mb-2">
                    Emociones activas:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {emotions.map((emotion, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-800/50 rounded-full text-xs text-white flex items-center gap-1"
                      >
                        <span>{EMOTION_ICONS[emotion] || "😐"}</span>
                        <span className="capitalize">{emotion}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nota informativa */}
          <p className="text-[10px] text-purple-400/60 text-center pt-2 border-t border-purple-500/10">
            Este panel muestra el estado emocional de {agentName}
          </p>
        </div>
      </div>
    </div>
  );
}
