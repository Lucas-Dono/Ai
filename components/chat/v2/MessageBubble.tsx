/**
 * Modern Message Bubble Component
 *
 * Features:
 * - Glassmorphism effect
 * - Smooth gradients
 * - Entry/exit animations
 * - Hover effects
 * - Better shadows and spacing
 * - Emoji reactions
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, CheckCheck, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface MessageBubbleProps {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  status?: "sending" | "sent" | "delivered" | "read";
  avatar?: string;
  agentName?: string;
  reactions?: Array<{ emoji: string; count: number }>;
  onReact?: (emoji: string) => void;
  isHighlighted?: boolean;
}

const statusIcons = {
  sending: Clock,
  sent: Check,
  delivered: CheckCheck,
  read: CheckCheck,
};

export function MessageBubble({
  id,
  content,
  isUser,
  timestamp,
  status = "sent",
  avatar,
  agentName,
  reactions,
  onReact,
  isHighlighted,
}: MessageBubbleProps) {
  const StatusIcon = statusIcons[status];

  return (
    <motion.div
      id={`message-${id}`}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        boxShadow: isHighlighted
          ? "0 0 0 3px rgba(234, 179, 8, 0.4)"
          : "none",
      }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.5,
      }}
      className={cn(
        "flex items-end gap-2 group",
        isUser ? "flex-row-reverse" : "flex-row",
        "px-4 py-1"
      )}
    >
      {/* Avatar - Only for agent messages */}
      {!isUser && avatar && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 shadow-md"
        >
          <img src={avatar} alt={agentName || "Agent"} className="w-full h-full object-cover" />
        </motion.div>
      )}

      <div className={cn("flex flex-col", isUser ? "items-end" : "items-start", "max-w-[75%]")}>
        {/* Agent name (for agent messages only) */}
        {!isUser && agentName && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs font-medium text-gray-400 mb-1 px-2"
          >
            {agentName}
          </motion.span>
        )}

        {/* Message Bubble */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "relative rounded-2xl px-4 py-2.5",
            "backdrop-blur-xl",
            "border",
            "shadow-lg",
            "transition-all duration-300",
            "group-hover:shadow-xl",
            isUser
              ? [
                  // User message - Modern gradient
                  "bg-gradient-to-br from-blue-500/90 via-indigo-500/90 to-purple-500/90",
                  "border-white/20",
                  "text-white",
                  "rounded-tr-md",
                ]
              : [
                  // Agent message - Glassmorphism
                  "bg-gradient-to-br from-white/10 to-white/5",
                  "dark:from-gray-800/40 dark:to-gray-900/40",
                  "border-white/10",
                  "text-gray-900 dark:text-gray-100",
                  "rounded-tl-md",
                ]
          )}
        >
          {/* Content */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm leading-relaxed whitespace-pre-wrap break-words"
          >
            {content}
          </motion.p>

          {/* Timestamp and Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "flex items-center gap-1 mt-1.5",
              isUser ? "justify-end" : "justify-start"
            )}
          >
            <span
              className={cn(
                "text-[10px] font-medium",
                isUser ? "text-white/70" : "text-gray-500 dark:text-gray-400"
              )}
            >
              {format(timestamp, "HH:mm", { locale: es })}
            </span>

            {/* Status indicator (user messages only) */}
            {isUser && StatusIcon && (
              <StatusIcon
                className={cn(
                  "w-3.5 h-3.5",
                  status === "read"
                    ? "text-blue-300"
                    : status === "sending"
                    ? "text-white/50 animate-pulse"
                    : "text-white/60"
                )}
              />
            )}
          </motion.div>

          {/* Gradient overlay for depth */}
          <div
            className={cn(
              "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
              isUser
                ? "bg-gradient-to-t from-white/10 to-transparent"
                : "bg-gradient-to-t from-black/5 to-transparent"
            )}
          />
        </motion.div>

        {/* Reactions */}
        <AnimatePresence>
          {reactions && reactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                "flex gap-1 mt-1",
                isUser ? "flex-row-reverse" : "flex-row"
              )}
            >
              {reactions.map((reaction, idx) => (
                <motion.button
                  key={reaction.emoji}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onReact?.(reaction.emoji)}
                  className={cn(
                    "px-2 py-0.5 rounded-full",
                    "bg-white/80 dark:bg-gray-800/80",
                    "backdrop-blur-sm",
                    "border border-white/20",
                    "shadow-sm",
                    "text-xs",
                    "hover:shadow-md",
                    "transition-all duration-200"
                  )}
                >
                  {reaction.emoji}
                  {reaction.count > 1 && (
                    <span className="ml-1 text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                      {reaction.count}
                    </span>
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
