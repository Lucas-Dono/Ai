"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useProactiveMessages } from "@/hooks/useProactiveMessages";
import { cn } from "@/lib/utils";

interface ProactiveMessageBadgeProps {
  agentId: string;
  className?: string;
  variant?: "compact" | "full";
}

export function ProactiveMessageBadge({
  agentId,
  className,
  variant = "compact",
}: ProactiveMessageBadgeProps) {
  const { messages, hasMessages } = useProactiveMessages(agentId, {
    pollingInterval: 600000, // 10 minutos (compartido con todas las instancias del mismo agentId)
    enabled: true, // Ahora usa sistema singleton - seguro para múltiples instancias
  });

  if (!hasMessages) {
    return null;
  }

  const messageCount = messages.length;

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "absolute -top-2 -right-2 z-10",
          className
        )}
      >
        {/* Pulse effect */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-purple-500"
        />

        {/* Badge */}
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold shadow-lg border-2 border-white dark:border-gray-900">
          {messageCount}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
        "text-xs font-semibold shadow-md",
        className
      )}
    >
      {/* Animated icon */}
      <motion.div
        animate={{
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 1,
        }}
      >
        <Sparkles className="w-3 h-3" />
      </motion.div>

      <span>
        {messageCount === 1
          ? "1 mensaje nuevo"
          : `${messageCount} mensajes nuevos`}
      </span>

      {/* Pulse dot */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
        className="w-2 h-2 rounded-full bg-white"
      />
    </motion.div>
  );
}

/**
 * Simple dot indicator for minimal display
 */
export function ProactiveMessageDot({
  agentId,
  className,
}: {
  agentId: string;
  className?: string;
}) {
  const { hasMessages } = useProactiveMessages(agentId, {
    pollingInterval: 600000, // 10 minutos (compartido con todas las instancias del mismo agentId)
    enabled: true, // Ahora usa sistema singleton - seguro para múltiples instancias
  });

  if (!hasMessages) {
    return null;
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn("relative", className)}
    >
      {/* Pulse effect */}
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.7, 0, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
        className="absolute inset-0 rounded-full bg-purple-500"
      />

      {/* Dot */}
      <div className="relative w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-white dark:border-gray-900 shadow-lg" />
    </motion.div>
  );
}
