"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedProgressProps {
  value: number; // 0-100
  className?: string;
  barClassName?: string;
  showGlow?: boolean;
  gradient?: string;
}

export function AnimatedProgress({
  value,
  className,
  barClassName,
  showGlow = false,
  gradient = "from-purple-500 to-pink-500",
}: AnimatedProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full",
        "bg-gray-200 dark:bg-gray-800",
        className
      )}
    >
      {/* Glow effect when enabled */}
      {showGlow && clampedValue > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className={cn(
            "absolute inset-0 blur-md bg-gradient-to-r",
            gradient
          )}
        />
      )}

      {/* Progress bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clampedValue}%` }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          duration: 0.8,
        }}
        className={cn(
          "relative h-full rounded-full bg-gradient-to-r",
          gradient,
          barClassName
        )}
      >
        {/* Shimmer effect */}
        {clampedValue > 0 && (
          <motion.div
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 1,
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        )}
      </motion.div>
    </div>
  );
}
