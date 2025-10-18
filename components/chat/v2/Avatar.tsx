/**
 * Modern Avatar Component with Presence Ring
 *
 * Features:
 * - Animated presence ring (online/offline/typing)
 * - Glassmorphism border effect
 * - Smooth transitions
 * - Size variants
 */

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "typing" | "away";
  showStatus?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
  xl: "w-20 h-20",
};

const statusColors = {
  online: "bg-emerald-500",
  offline: "bg-gray-400",
  typing: "bg-blue-500",
  away: "bg-amber-500",
};

export function Avatar({
  src,
  alt,
  size = "md",
  status = "offline",
  showStatus = true,
  className,
}: AvatarProps) {
  const initials = alt
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      className={cn("relative flex-shrink-0", className)}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      {/* Presence Ring - Animated */}
      {showStatus && status === "online" && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3))",
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.7, 0.3, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Typing Animation Ring */}
      {showStatus && status === "typing" && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(37, 99, 235, 0.4))",
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}

      {/* Avatar Container with Glassmorphism */}
      <div
        className={cn(
          "relative rounded-full overflow-hidden",
          "bg-gradient-to-br from-white/10 to-white/5",
          "backdrop-blur-md",
          "border border-white/20",
          "shadow-lg",
          sizeClasses[size]
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white font-semibold">
            {initials}
          </div>
        )}
      </div>

      {/* Status Indicator Dot */}
      {showStatus && (
        <motion.div
          className={cn(
            "absolute bottom-0 right-0",
            "rounded-full border-2 border-white/50",
            "shadow-lg",
            size === "sm" ? "w-2.5 h-2.5" : size === "md" ? "w-3 h-3" : "w-4 h-4",
            statusColors[status]
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
        >
          {/* Pulse effect for online/typing */}
          {(status === "online" || status === "typing") && (
            <motion.div
              className={cn("absolute inset-0 rounded-full", statusColors[status])}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
