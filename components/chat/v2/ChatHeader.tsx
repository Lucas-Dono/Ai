/**
 * Modern Chat Header Component
 *
 * Features:
 * - Glassmorphism with backdrop blur
 * - Animated status indicators
 * - Smooth action buttons
 * - Better typography and spacing
 */

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Search,
  Download,
  Trash2,
  PanelRightClose,
  PanelRightOpen,
  MoreVertical,
} from "lucide-react";
import { Avatar } from "./Avatar";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  agentName: string;
  agentAvatar?: string;
  isTyping?: boolean;
  isOnline?: boolean;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onSearch?: () => void;
  onExport?: () => void;
  onReset?: () => void;
}

export function ChatHeader({
  agentName,
  agentAvatar,
  isTyping = false,
  isOnline = true,
  sidebarOpen = true,
  onToggleSidebar,
  onSearch,
  onExport,
  onReset,
}: ChatHeaderProps) {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "relative z-10",
        "px-6 py-4",
        "flex items-center gap-4",
        // Glassmorphism effect
        "bg-gradient-to-r from-white/80 via-white/70 to-white/80",
        "dark:from-gray-900/80 dark:via-gray-800/70 dark:to-gray-900/80",
        "backdrop-blur-xl",
        "border-b border-white/20 dark:border-gray-700/50",
        "shadow-lg"
      )}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 animate-gradient-x" />

      {/* Avatar and Info */}
      <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
        <Avatar
          src={agentAvatar}
          alt={agentName}
          size="lg"
          status={isTyping ? "typing" : isOnline ? "online" : "offline"}
          showStatus
        />

        <div className="flex-1 min-w-0">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent truncate"
          >
            {agentName}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            {isTyping ? (
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1">
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                    className="w-1.5 h-1.5 rounded-full bg-blue-500"
                  />
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-blue-500"
                  />
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-1.5 h-1.5 rounded-full bg-blue-500"
                  />
                </div>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                  escribiendo...
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                  )}
                />
                {isOnline ? "En línea" : "Desconectado"}
              </span>
            )}
          </motion.div>
        </div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 flex items-center gap-2"
      >
        {onSearch && (
          <ActionButton
            icon={<Search className="w-4 h-4" />}
            onClick={onSearch}
            label="Buscar"
          />
        )}

        {onExport && (
          <ActionButton
            icon={<Download className="w-4 h-4" />}
            onClick={onExport}
            label="Exportar"
          />
        )}

        {onReset && (
          <ActionButton
            icon={<Trash2 className="w-4 h-4" />}
            onClick={onReset}
            label="Resetear"
            variant="danger"
          />
        )}

        {onToggleSidebar && (
          <ActionButton
            icon={
              sidebarOpen ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRightOpen className="w-4 h-4" />
              )
            }
            onClick={onToggleSidebar}
            label="Toggle Sidebar"
          />
        )}

        <ActionButton
          icon={<MoreVertical className="w-4 h-4" />}
          onClick={() => {}}
          label="Más opciones"
        />
      </motion.div>
    </motion.header>
  );
}

// Action Button Component
function ActionButton({
  icon,
  onClick,
  label,
  variant = "default",
}: {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
  variant?: "default" | "danger";
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      title={label}
      className={cn(
        "p-2.5 rounded-xl",
        "backdrop-blur-md",
        "border",
        "shadow-md",
        "transition-all duration-200",
        "hover:shadow-lg",
        variant === "danger"
          ? [
              "bg-red-500/10 hover:bg-red-500/20",
              "border-red-500/30",
              "text-red-600 dark:text-red-400",
            ]
          : [
              "bg-white/50 hover:bg-white/70",
              "dark:bg-gray-800/50 dark:hover:bg-gray-800/70",
              "border-white/30",
              "text-gray-700 dark:text-gray-300",
            ]
      )}
    >
      {icon}
    </motion.button>
  );
}
