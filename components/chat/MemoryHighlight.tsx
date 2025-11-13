"use client";

import { motion } from "framer-motion";
import { Brain, Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface MemoryReference {
  type: "conversation" | "fact" | "event" | "person";
  content: string; // What is being remembered
  originalTimestamp?: Date; // When it was originally said/happened
  context?: string; // Additional context
  confidence: number; // 0-1, how confident we are this is a memory reference
}

interface MemoryHighlightProps {
  memory: MemoryReference;
  className?: string;
}

const memoryTypeIcons = {
  conversation: Brain,
  fact: Sparkles,
  event: Clock,
  person: Brain,
};

const memoryTypeLabels = {
  conversation: "Recordando conversación",
  fact: "Recordando dato",
  event: "Recordando evento",
  person: "Recordando persona",
};

const memoryTypeColors = {
  conversation: "text-blue-600 dark:text-blue-400",
  fact: "text-purple-600 dark:text-purple-400",
  event: "text-amber-600 dark:text-amber-400",
  person: "text-pink-600 dark:text-pink-400",
};

const memoryTypeBg = {
  conversation: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/30",
  fact: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/30",
  event: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/30",
  person: "bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800/30",
};

export function MemoryHighlight({ memory, className }: MemoryHighlightProps) {
  const Icon = memoryTypeIcons[memory.type];
  const label = memoryTypeLabels[memory.type];
  const colorClass = memoryTypeColors[memory.type];
  const bgClass = memoryTypeBg[memory.type];

  // Format timestamp if available
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 7) {
      return date.toLocaleDateString("es-ES", { month: "short", day: "numeric" });
    } else if (days > 0) {
      return `hace ${days} ${days === 1 ? "día" : "días"}`;
    } else if (hours > 0) {
      return `hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
    } else if (minutes > 0) {
      return `hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
    }
    return "hace un momento";
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm",
              "cursor-help transition-all duration-200",
              "hover:shadow-md hover:scale-[1.02]",
              bgClass,
              className
            )}
          >
            <Icon className={cn("w-4 h-4", colorClass)} />
            <span className={cn("font-medium", colorClass)}>{label}</span>
            {memory.confidence > 0 && memory.confidence < 0.8 && (
              <span className="text-xs text-muted-foreground opacity-60">
                ~{Math.round(memory.confidence * 100)}%
              </span>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-sm p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border shadow-lg"
        >
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", colorClass)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {label}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  &quot;{memory.content}&quot;
                </p>
              </div>
            </div>

            {memory.originalTimestamp && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {formatTimestamp(memory.originalTimestamp)}
                </p>
              </div>
            )}

            {memory.context && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-muted-foreground italic">
                  {memory.context}
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Compact version for inline display
 */
export function MemoryHighlightCompact({ memory }: MemoryHighlightProps) {
  const Icon = memoryTypeIcons[memory.type];
  const colorClass = memoryTypeColors[memory.type];

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md",
              "text-xs font-medium cursor-help",
              "bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm",
              "border border-gray-200/50 dark:border-gray-700/50",
              "hover:bg-white/80 dark:hover:bg-gray-800/80",
              "transition-all duration-200"
            )}
          >
            <Icon className={cn("w-3 h-3", colorClass)} />
            <span className={colorClass}>memoria</span>
          </motion.span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs p-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md"
        >
          <p className="text-sm text-gray-700 dark:text-gray-300">
            &quot;{memory.content}&quot;
          </p>
          {memory.originalTimestamp && (
            <p className="text-xs text-muted-foreground mt-1">
              <Clock className="w-3 h-3 inline mr-1" />
              {new Date(memory.originalTimestamp).toLocaleDateString("es-ES")}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
