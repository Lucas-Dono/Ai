/**
 * Modern Chat Input Component
 *
 * Features:
 * - Glassmorphism effect
 * - Floating action buttons
 * - Smooth focus animations
 * - Better shadows and borders
 * - Typing indicator integration
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Send, Mic, ImageIcon, Smile } from "lucide-react";
import { MessageSendAnimation } from "./MessageSendAnimation";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onVoice?: () => void;
  onImage?: () => void;
  onEmoji?: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onVoice,
  onImage,
  onEmoji,
  placeholder = "Escribe un mensaje...",
  disabled = false,
  maxLength = 10000,
}: ChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [sendAnimationTriggered, setSendAnimationTriggered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleSend = () => {
    if (!value.trim() || disabled) return;

    // Trigger animation
    setSendAnimationTriggered(true);

    // Send message after short delay (for visual effect)
    setTimeout(() => {
      onSend();
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        handleSend();
      }
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="relative px-6 py-4">
      {/* Glassmorphism Container */}
      <motion.div
        animate={{
          boxShadow: isFocused
            ? "0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(99, 102, 241, 0.3)"
            : "0 10px 30px rgba(0, 0, 0, 0.05)",
        }}
        className={cn(
          "relative rounded-3xl overflow-hidden",
          "bg-gradient-to-br from-white/90 to-white/70",
          "dark:from-gray-800/90 dark:to-gray-900/70",
          "backdrop-blur-xl",
          "border border-white/30 dark:border-gray-700/50",
          "transition-all duration-300"
        )}
      >
        {/* Gradient overlay on focus */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 pointer-events-none"
            />
          )}
        </AnimatePresence>

        <div className="relative z-10 flex items-end gap-2 p-2">
          {/* Action Buttons - Left Side - Always Visible */}
          <div className="flex items-center gap-1 pb-2">
            {onEmoji && (
              <ActionButton
                icon={<Smile className="w-4 h-4" />}
                onClick={onEmoji}
                label="Stickers/GIF"
              />
            )}
            {onImage && (
              <ActionButton
                icon={<ImageIcon className="w-4 h-4" />}
                onClick={onImage}
                label="Imagen"
              />
            )}
            {onVoice && (
              <ActionButton
                icon={<Mic className="w-4 h-4" />}
                onClick={onVoice}
                label="Voz"
              />
            )}
          </div>

          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
              rows={1}
              className={cn(
                "w-full px-4 py-3 rounded-2xl",
                "bg-transparent",
                "text-gray-900 dark:text-gray-100",
                "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                "resize-none",
                "outline-none",
                "max-h-32",
                "transition-all duration-200",
                "font-medium"
              )}
            />

            {/* Character count */}
            {value.length > maxLength * 0.9 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-gray-500 text-right px-4 pb-1"
              >
                {value.length} / {maxLength}
              </motion.div>
            )}
          </div>

          {/* Send Button */}
          <motion.button
            whileHover={canSend ? { scale: 1.05 } : {}}
            whileTap={canSend ? { scale: 0.95 } : {}}
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              "p-3 rounded-full mb-2",
              "transition-all duration-300",
              "shadow-lg",
              canSend
                ? [
                    "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500",
                    "hover:shadow-xl hover:shadow-purple-500/50",
                    "text-white",
                    "cursor-pointer",
                  ]
                : [
                    "bg-gray-200 dark:bg-gray-700",
                    "text-gray-400 dark:text-gray-500",
                    "cursor-not-allowed",
                  ]
            )}
          >
            <motion.div
              animate={
                canSend
                  ? {
                      rotate: [0, -10, 10, 0],
                      scale: [1, 1.1, 1],
                    }
                  : {}
              }
              transition={{ duration: 0.5 }}
            >
              <Send className="w-5 h-5" />
            </motion.div>
          </motion.button>
        </div>
      </motion.div>

      {/* Send Animation */}
      <MessageSendAnimation
        triggered={sendAnimationTriggered}
        onComplete={() => setSendAnimationTriggered(false)}
      />
    </div>
  );
}

// Action Button Component
function ActionButton({
  icon,
  onClick,
  label,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={label}
      className={cn(
        "p-2 rounded-full",
        "bg-gradient-to-br from-gray-100 to-gray-50",
        "dark:from-gray-700 dark:to-gray-800",
        "text-gray-600 dark:text-gray-300",
        "transition-all duration-200",
        "hover:shadow-md"
      )}
    >
      {icon}
    </motion.button>
  );
}
