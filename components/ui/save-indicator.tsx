"use client";

import { Check, Cloud, CloudOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface SaveIndicatorProps {
  status: SaveStatus;
  className?: string;
  showText?: boolean;
}

export function SaveIndicator({
  status,
  className,
  showText = true
}: SaveIndicatorProps) {
  const config = {
    idle: {
      icon: Cloud,
      text: "Sin cambios",
      color: "text-muted-foreground",
      animate: false
    },
    saving: {
      icon: Loader2,
      text: "Guardando...",
      color: "text-blue-500",
      animate: true
    },
    saved: {
      icon: Check,
      text: "Guardado",
      color: "text-green-500",
      animate: false
    },
    error: {
      icon: CloudOff,
      text: "Error al guardar",
      color: "text-destructive",
      animate: false
    }
  };

  const current = config[status];
  const Icon = current.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex items-center gap-2 text-sm",
          current.color,
          className
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            current.animate && "animate-spin"
          )}
        />
        {showText && <span>{current.text}</span>}
      </motion.div>
    </AnimatePresence>
  );
}
