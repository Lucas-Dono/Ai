"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TypingIndicator({ className, size = "md" }: TypingIndicatorProps) {
  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5"
  };

  const containerPadding = {
    sm: "px-3 py-2",
    md: "px-4 py-3",
    lg: "px-5 py-4"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-muted",
        containerPadding[size],
        className
      )}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
          className={cn(
            "bg-muted-foreground rounded-full",
            dotSizes[size]
          )}
        />
      ))}
    </div>
  );
}
