"use client";

/**
 * Voice Input Button Component
 *
 * Botón para activar entrada de voz en el chat
 * - Integra con VoiceRecorder
 * - Envía audio a /api/chat/voice
 * - Muestra transcripción y respuesta con audio
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Loader2 } from "lucide-react";
import { VoiceRecorder } from "./VoiceRecorder";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VoiceInputButtonProps {
  agentId: string;
  onTranscription?: (text: string) => void;
  onResponse?: (response: {
    text: string;
    audioBase64?: string;
    emotions: string[];
  }) => void;
  disabled?: boolean;
}

export function VoiceInputButton({
  agentId,
  onTranscription,
  onResponse,
  disabled,
}: VoiceInputButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
  };

  const handleSendVoice = async (audioBlob: Blob, duration: number) => {
    setIsRecording(false);
    setIsProcessing(true);

    try {
      // Crear FormData con audio y metadata
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("agentId", agentId);
      formData.append("language", "es"); // Español por defecto

      // Enviar a API
      const response = await fetch("/api/chat/voice", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Error al procesar voz");
      }

      const data = await response.json();

      console.log("[VoiceInput] Response:", data);

      // Notificar transcripción
      if (onTranscription) {
        onTranscription(data.transcription);
      }

      // Notificar respuesta
      if (onResponse) {
        onResponse({
          text: data.response.text,
          audioBase64: data.response.audioBase64,
          emotions: data.response.emotions || [],
        });
      }

      // Auto-reproducir audio si está disponible
      if (data.response.audioBase64 && data.voiceConfig.autoPlay) {
        const audio = new Audio(
          `data:audio/mpeg;base64,${data.response.audioBase64}`
        );
        audio.play().catch((err) => {
          console.error("[VoiceInput] Error playing audio:", err);
        });
      }

      toast.success("Mensaje de voz procesado correctamente");
    } catch (error: any) {
      console.error("[VoiceInput] Error:", error);
      toast.error(error.message || "Error al procesar mensaje de voz");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isRecording) {
    return (
      <div className="w-full">
        <VoiceRecorder onSend={handleSendVoice} onCancel={handleCancelRecording} />
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleStartRecording}
      disabled={disabled || isProcessing}
      className={cn(
        "rounded-full transition-all",
        isProcessing && "animate-pulse"
      )}
      title="Grabar mensaje de voz"
    >
      {isProcessing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
}
