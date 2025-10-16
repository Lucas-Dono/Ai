"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { getInitials, generateGradient } from "@/lib/utils";
import Image from "next/image";
import { Play, Pause } from "lucide-react";
import { useState, useRef } from "react";

interface MessageMetadata {
  emotions?: {
    dominant?: string[];
    secondary?: string[];
    mood?: string;
  };
  relationLevel?: string;
  messageType?: "text" | "gif" | "audio";
  gifDescription?: string;
  audioDuration?: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: MessageMetadata;
}

interface MessageBubbleProps {
  message: Message;
  agentName?: string;
  isUser?: boolean;
}

export function MessageBubble({ message, agentName, isUser }: MessageBubbleProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const messageType = message.metadata?.messageType || "text";
  const isUserMessage = message.role === "user";

  const toggleAudioPlayback = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(message.content);
      audioRef.current.onended = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlayingAudio(!isPlayingAudio);
  };

  const formatAudioDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 ${isUserMessage ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <Avatar
        className={`${
          !isUserMessage ? "border-2 border-primary" : ""
        } shrink-0`}
      >
        <AvatarFallback
          className={
            !isUserMessage
              ? "bg-gradient-to-br from-primary to-secondary text-white"
              : "bg-muted"
          }
          style={
            !isUserMessage && agentName
              ? { background: generateGradient(agentName) }
              : undefined
          }
        >
          {!isUserMessage && agentName ? getInitials(agentName) : "U"}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div
        className={`flex-1 max-w-2xl ${
          isUserMessage ? "text-right" : ""
        }`}
      >
        <div
          className={`inline-block rounded-2xl ${
            !isUserMessage
              ? "bg-card border border-border"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {/* TEXT MESSAGE */}
          {messageType === "text" && (
            <div className="px-6 py-3 whitespace-pre-wrap">
              {message.content}
            </div>
          )}

          {/* GIF MESSAGE */}
          {messageType === "gif" && (
            <div className="overflow-hidden rounded-2xl">
              <div className="relative aspect-video max-w-sm">
                <Image
                  src={message.content}
                  alt={message.metadata?.gifDescription || "GIF"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              {/* Descripción del GIF (visible en hover) */}
              {message.metadata?.gifDescription && (
                <div className="px-3 py-2 text-xs text-muted-foreground border-t">
                  {message.metadata.gifDescription}
                </div>
              )}
            </div>
          )}

          {/* AUDIO MESSAGE */}
          {messageType === "audio" && (
            <div className="px-4 py-3 flex items-center gap-3 min-w-[200px]">
              <button
                onClick={toggleAudioPlayback}
                className={`p-2 rounded-full ${
                  !isUserMessage
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-white/20 hover:bg-white/30"
                }`}
              >
                {isPlayingAudio ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 ml-0.5" />
                )}
              </button>

              {/* Waveform visual (simplificado) */}
              <div className="flex-1 flex items-center gap-0.5 h-8">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full ${
                      !isUserMessage ? "bg-primary/30" : "bg-white/30"
                    }`}
                    style={{
                      height: `${Math.random() * 60 + 20}%`,
                    }}
                  />
                ))}
              </div>

              {/* Duration */}
              <span className="text-xs font-mono">
                {formatAudioDuration(message.metadata?.audioDuration)}
              </span>
            </div>
          )}
        </div>

        {/* Emotion Badges (solo para mensajes del asistente) */}
        {!isUserMessage &&
          message.metadata?.emotions?.dominant &&
          message.metadata.emotions.dominant.length > 0 && (
            <div className="mt-2 flex gap-1 flex-wrap">
              {message.metadata.emotions.dominant.map((emotion, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-xs"
                >
                  {emotion}
                </Badge>
              ))}
              {message.metadata.emotions.secondary &&
                message.metadata.emotions.secondary.length > 0 && (
                  <>
                    {message.metadata.emotions.secondary.slice(0, 2).map((emotion, i) => (
                      <Badge
                        key={`sec-${i}`}
                        variant="secondary"
                        className="text-xs"
                      >
                        {emotion}
                      </Badge>
                    ))}
                  </>
                )}
            </div>
          )}

        {/* Mood indicator */}
        {!isUserMessage && message.metadata?.emotions?.mood && (
          <div className="mt-1 text-xs text-muted-foreground">
            Mood: {message.metadata.emotions.mood}
          </div>
        )}
      </div>
    </motion.div>
  );
}
