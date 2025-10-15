"use client";

/**
 * Voice Recorder Component
 *
 * Permite al usuario grabar mensajes de voz
 * - Grabación en tiempo real
 * - Visualización de forma de onda
 * - Preview antes de enviar
 * - Cancelar grabación
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Square, Send, X, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [pausedDuration, setPausedDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      stopRecording();
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup audio analysis for waveform
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      // Start waveform animation
      drawWaveform();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      onCancel();
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "#1f1f1f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#10b981";
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      // Reanudar grabación
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      // Reanudar timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      // Reanudar animación de onda
      drawWaveform();
    } else {
      // Pausar grabación
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      setPausedDuration(duration);

      // Detener timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Pausar animación de onda
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, duration);
    }
  };

  const togglePlayback = () => {
    if (!audioBlob) return;

    if (!audioRef.current) {
      const url = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-[#1f1f1f] rounded-2xl p-4 space-y-3">
      {/* Waveform Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={80}
          className="w-full h-20 rounded-lg"
        />
        <div className={cn(
          "absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1",
          isPaused ? "bg-yellow-600" : "bg-red-600"
        )}>
          <div className={cn(
            "w-2 h-2 bg-white rounded-full",
            !isPaused && "animate-pulse"
          )} />
          {formatTime(duration)}
          {isPaused && <span className="ml-1">⏸</span>}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        {/* Cancel */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Middle controls */}
        <div className="flex items-center gap-2">
          {isRecording ? (
            <>
              {/* Pause/Resume Button */}
              <Button
                variant="default"
                size="icon"
                onClick={togglePause}
                className={cn(
                  "rounded-full h-10 w-10",
                  isPaused
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-yellow-600 hover:bg-yellow-700"
                )}
                title={isPaused ? "Reanudar" : "Pausar"}
              >
                {isPaused ? (
                  <Play className="h-4 w-4 ml-0.5" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>

              {/* Stop Button */}
              <Button
                variant="default"
                size="icon"
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-700 rounded-full h-12 w-12"
                title="Detener"
              >
                <Square className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="icon"
              onClick={togglePlayback}
              className="bg-green-600 hover:bg-green-700 rounded-full h-10 w-10"
              title={isPlaying ? "Pausar reproducción" : "Reproducir"}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>
          )}
        </div>

        {/* Send */}
        <Button
          variant="default"
          size="icon"
          onClick={handleSend}
          disabled={!audioBlob}
          className="bg-green-600 hover:bg-green-700 rounded-full h-12 w-12"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Info text */}
      <p className="text-xs text-gray-400 text-center">
        {isRecording
          ? "Grabando... Toca el cuadrado para detener"
          : "Preview - Toca play para escuchar"}
      </p>
    </div>
  );
}
