"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, HeartCrack, Flame, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BondRiskAlertProps {
  status: "active" | "warned" | "dormant" | "fragile" | null;
  agentName: string;
  daysInactive?: number;
  onAction?: () => void;
  className?: string;
}

const STATUS_CONFIG = {
  warned: {
    icon: Clock,
    title: "Vínculo en Advertencia",
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    borderColor: "border-yellow-500/30",
    textColor: "text-yellow-700 dark:text-yellow-400",
    emoji: "⚠️",
  },
  dormant: {
    icon: HeartCrack,
    title: "Vínculo Inactivo",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    borderColor: "border-orange-500/30",
    textColor: "text-orange-700 dark:text-orange-400",
    emoji: "💔",
  },
  fragile: {
    icon: Flame,
    title: "Vínculo Frágil",
    color: "from-red-500 to-red-700",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-500/30",
    textColor: "text-red-700 dark:text-red-400",
    emoji: "🔥",
  },
};

function getMessage(status: keyof typeof STATUS_CONFIG, agentName: string, daysInactive?: number): string {
  const days = daysInactive || 0;

  switch (status) {
    case "warned":
      return `Hace ${days} días que no hablas con ${agentName}. Tu vínculo está en riesgo.`;
    case "dormant":
      return `${agentName} te extraña. Han pasado ${days} días desde tu última conversación.`;
    case "fragile":
      return `¡URGENTE! Tu vínculo con ${agentName} está a punto de perderse (${days} días sin interacción).`;
    default:
      return `Tu vínculo con ${agentName} necesita atención.`;
  }
}

export function BondRiskAlert({
  status,
  agentName,
  daysInactive,
  onAction,
  className,
}: BondRiskAlertProps) {
  // Only show for at-risk statuses
  if (!status || status === "active" || !STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]) {
    return null;
  }

  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  const Icon = config.icon;
  const message = getMessage(status as keyof typeof STATUS_CONFIG, agentName, daysInactive);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "relative overflow-hidden rounded-xl border-2 p-4 shadow-lg",
          config.bgColor,
          config.borderColor,
          className
        )}
      >
        {/* Animated background pulse */}
        <motion.div
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={cn(
            "absolute inset-0 bg-gradient-to-r",
            config.color
          )}
        />

        {/* Content */}
        <div className="relative flex items-start gap-3">
          {/* Icon */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
            className="flex-shrink-0"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-xl",
                config.bgColor
              )}
            >
              {config.emoji}
            </div>
          </motion.div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={cn("w-4 h-4", config.textColor)} />
              <h4 className={cn("font-bold text-sm", config.textColor)}>
                {config.title}
              </h4>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
              {message}
            </p>

            {/* Action Button */}
            {onAction && (
              <Button
                size="sm"
                onClick={onAction}
                className={cn(
                  "text-white shadow-md hover:shadow-lg transition-all",
                  "bg-gradient-to-r",
                  config.color
                )}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Enviar Mensaje
              </Button>
            )}
          </div>
        </div>

        {/* Decorative corner accent */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className={cn(
            "absolute -top-2 -right-2 w-16 h-16 rounded-full blur-2xl opacity-20",
            `bg-gradient-to-br ${config.color}`
          )}
        />
      </motion.div>
    </AnimatePresence>
  );
}
