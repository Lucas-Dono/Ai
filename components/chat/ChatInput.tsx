"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Mic,
  Smile,
  Image as ImageIcon,
  Paperclip,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VoiceRecorder } from "./VoiceRecorder";
import { GifPicker } from "./GifPicker";
import { EmojiPickerComponent } from "./EmojiPickerComponent";

interface ChatInputProps {
  onSendMessage: (content: string, type?: "text" | "audio" | "gif" | "sticker", metadata?: any) => void;
  onSendAudio?: (audioBlob: Blob) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  onSendAudio,
  disabled = false,
  placeholder = "Escribe tu mensaje...",
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim(), "text");
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInput((prev) => prev + emoji);
    setEmojiPickerOpen(false);
    inputRef.current?.focus();
  };

  const handleGifSelect = (gifUrl: string, description: string) => {
    // Enviar el GIF con su descripción para la IA
    onSendMessage(gifUrl, "gif", { description });
    setGifPickerOpen(false);
  };

  const handleAudioRecorded = (audioBlob: Blob) => {
    if (onSendAudio) {
      onSendAudio(audioBlob);
    }
    setIsRecording(false);
  };

  return (
    <div className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-4">
        {/* Recording Indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3"
            >
              <VoiceRecorder
                onRecordingComplete={handleAudioRecorded}
                onCancel={() => setIsRecording(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          {/* Action Buttons - Left Side */}
          <div className="flex items-center gap-1">
            {/* Emoji Picker */}
            <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  disabled={disabled}
                >
                  <Smile className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="start"
                className="p-0 border-0 w-auto"
              >
                <EmojiPickerComponent onEmojiSelect={handleEmojiSelect} />
              </PopoverContent>
            </Popover>

            {/* GIF Picker */}
            <Popover open={gifPickerOpen} onOpenChange={setGifPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  disabled={disabled}
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="start"
                className="w-[400px] p-0"
              >
                <GifPicker onSelect={handleGifSelect} />
              </PopoverContent>
            </Popover>

            {/* Attach Button (Future: stickers, files) */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              disabled={true}
              title="Próximamente: Stickers"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </div>

          {/* Text Input */}
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1"
            disabled={disabled || isRecording}
          />

          {/* Send/Voice Buttons - Right Side */}
          <div className="flex items-center gap-1">
            {input.trim() ? (
              <Button
                onClick={handleSend}
                size="icon"
                disabled={disabled}
                className="h-9 w-9 shrink-0"
              >
                {disabled ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <Button
                type="button"
                variant={isRecording ? "destructive" : "default"}
                size="icon"
                onMouseDown={() => setIsRecording(true)}
                className="h-9 w-9 shrink-0"
                disabled={disabled}
                title="Mantén presionado para grabar"
              >
                <Mic className={`h-4 w-4 ${isRecording ? "animate-pulse" : ""}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Helper Text */}
        <div className="mt-2 text-xs text-muted-foreground text-center">
          {isRecording
            ? "Mantén presionado para grabar, suelta para enviar"
            : "Enter para enviar, Shift+Enter para nueva línea"}
        </div>
      </div>
    </div>
  );
}
