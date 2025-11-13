"use client";

/**
 * Multimodal Message Component
 *
 * Muestra mensajes con múltiples modalidades:
 * - Texto
 * - Audio (voz del personaje)
 * - Imagen (expresión facial)
 * - Indicador emocional
 */

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface MultimodalMessageProps {
  text: string;
  audioUrl?: string;
  imageUrl?: string;
  emotion?: {
    type: string;
    intensity: "low" | "medium" | "high";
  };
  agentName?: string;
  agentAvatar?: string;
  timestamp?: Date;
  autoPlayAudio?: boolean;
}

export function MultimodalMessage({
  text,
  audioUrl,
  imageUrl,
  emotion,
  agentName,
  agentAvatar,
  timestamp,
  autoPlayAudio = false,
}: MultimodalMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-play audio si está habilitado
  useEffect(() => {
    if (autoPlayAudio && audioUrl && !audioRef.current) {
      playAudio();
    }
  }, [audioUrl, autoPlayAudio]);

  const playAudio = () => {
    if (!audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setAudioProgress(0);
      };
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          const progress =
            (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setAudioProgress(progress);
        }
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const getEmotionColor = (emotionType: string): string => {
    const colors: Record<string, string> = {
      joy: "text-yellow-400",
      happiness: "text-yellow-400",
      sadness: "text-blue-400",
      anger: "text-red-400",
      fear: "text-purple-400",
      surprise: "text-pink-400",
      disgust: "text-green-400",
      neutral: "text-gray-400",
      love: "text-rose-400",
      excitement: "text-orange-400",
      anxiety: "text-indigo-400",
    };
    return colors[emotionType.toLowerCase()] || "text-gray-400";
  };

  const getIntensityBadge = (intensity: "low" | "medium" | "high"): string => {
    const badges: Record<string, string> = {
      low: "bg-gray-500/20 text-gray-400",
      medium: "bg-blue-500/20 text-blue-400",
      high: "bg-red-500/20 text-red-400",
    };
    return badges[intensity];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
    >
      {/* Avatar / Imagen emocional */}
      <div className="flex-shrink-0">
        {imageUrl ? (
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-white/20">
            <Image
              src={imageUrl}
              alt="Expresión del personaje"
              fill
              className="object-cover"
            />
            {emotion && (
              <div
                className={cn(
                  "absolute top-1 right-1 w-3 h-3 rounded-full animate-pulse",
                  emotion.intensity === "high"
                    ? "bg-red-500"
                    : emotion.intensity === "medium"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                )}
              />
            )}
          </div>
        ) : agentAvatar ? (
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-white/20">
            <Image
              src={agentAvatar}
              alt={agentName || "Avatar"}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {agentName?.[0] || "A"}
            </span>
          </div>
        )}
      </div>

      {/* Contenido del mensaje */}
      <div className="flex-1 space-y-2">
        {/* Header: Nombre + Emoción */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {agentName && (
              <span className="font-semibold text-white">{agentName}</span>
            )}
            {emotion && (
              <div className="flex items-center gap-1">
                <span className={cn("text-xs capitalize", getEmotionColor(emotion.type))}>
                  {emotion.type}
                </span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    getIntensityBadge(emotion.intensity)
                  )}
                >
                  {emotion.intensity}
                </span>
              </div>
            )}
          </div>
          {timestamp && (
            <span className="text-xs text-gray-400">
              {timestamp.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Texto del mensaje */}
        <div className="text-white/90 leading-relaxed">{text}</div>

        {/* Audio player (si existe) */}
        {audioUrl && (
          <div className="flex items-center gap-2 mt-3 p-2 rounded-2xl bg-white/5">
            <Button
              variant="ghost"
              size="icon"
              onClick={playAudio}
              className="h-8 w-8 rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>

            {/* Progress bar */}
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${audioProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <Volume2 className="h-4 w-4 text-white/50" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
