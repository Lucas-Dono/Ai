"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { getInitials, generateGradient } from "@/lib/utils";
import Image from "next/image";
import { Play, Pause } from "lucide-react";
import { useState, useRef } from "react";
import { MemoryHighlight } from "./MemoryHighlight";

interface GeneratedMultimedia {
  type: "image" | "audio";
  url: string;
  description: string;
  metadata?: Record<string, any>;
}

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
  multimedia?: GeneratedMultimedia[];
  memoryReferences?: Array<{
    type: "conversation" | "fact" | "event" | "person";
    content: string;
    originalTimestamp?: string;
    context?: string;
    confidence: number;
  }>;
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
            <div className="px-6 py-3">
              {/* Memory Highlights - Show BEFORE message content */}
              {!isUserMessage &&
                message.metadata?.memoryReferences &&
                message.metadata.memoryReferences.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {message.metadata.memoryReferences.map((memRef, idx) => (
                      <MemoryHighlight
                        key={idx}
                        memory={{
                          type: memRef.type,
                          content: memRef.content,
                          originalTimestamp: memRef.originalTimestamp
                            ? new Date(memRef.originalTimestamp)
                            : undefined,
                          context: memRef.context,
                          confidence: memRef.confidence,
                        }}
                      />
                    ))}
                  </div>
                )}

              <div className="whitespace-pre-wrap">{message.content}</div>

              {/* GENERATED MULTIMEDIA (imágenes y audios generados por IA) */}
              {message.metadata?.multimedia &&
                message.metadata.multimedia.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.metadata.multimedia.map((media, idx) => (
                      <div key={idx}>
                        {media.type === "image" && (
                          <div className="relative rounded-2xl overflow-hidden border border-border">
                            <Image
                              src={media.url}
                              alt={media.description}
                              width={400}
                              height={400}
                              className="object-cover"
                              unoptimized
                            />
                            {/* Descripción opcional */}
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs px-2 py-1">
                              {media.description}
                            </div>
                          </div>
                        )}

                        {media.type === "audio" && (
                          <div className="bg-muted/50 rounded-2xl p-3 flex items-center gap-3">
                            <audio
                              src={media.url}
                              controls
                              className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground">
                              🎤 {media.description.substring(0, 30)}
                              {media.description.length > 30 ? "..." : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
