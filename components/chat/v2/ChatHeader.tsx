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

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Search,
  Download,
  Trash2,
  PanelRightClose,
  PanelRightOpen,
  MoreVertical,
  Brain,
} from "lucide-react";
import { Avatar } from "./Avatar";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  agentName: string;
  agentAvatar?: string;
  agentId?: string;
  isTyping?: boolean;
  isOnline?: boolean;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onSearch?: () => void;
  onExport?: () => void;
  onReset?: () => void;
  onDelete?: () => void;
}

export function ChatHeader({
  agentName,
  agentAvatar,
  agentId,
  isTyping = false,
  isOnline = true,
  sidebarOpen = true,
  onToggleSidebar,
  onSearch,
  onExport,
  onReset,
  onDelete,
}: ChatHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Ensure we're on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate menu position when it opens
  useEffect(() => {
    if (showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8, // 8px below the button
        right: window.innerWidth - rect.right, // Align right edge
      });
    }
  }, [showMenu]);

  return (
    <>
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "relative z-10",
        "px-4 py-3",
        "flex items-center justify-between gap-3",
        // Glassmorphism effect
        "bg-gradient-to-r from-white/80 via-white/70 to-white/80",
        "dark:from-gray-900/80 dark:via-gray-800/70 dark:to-gray-900/80",
        "backdrop-blur-xl",
        "border-b border-white/20 dark:border-gray-700/50",
        "shadow-lg",
        "safe-area-inset-top",
        "min-h-[72px]",
        "max-w-full overflow-hidden"
      )}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 animate-gradient-x" />

      {/* Avatar and Info */}
      <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
        <div className="flex-shrink-0">
          <Avatar
            src={agentAvatar}
            alt={agentName}
            size="md"
            status={isTyping ? "typing" : isOnline ? "online" : "offline"}
            showStatus
          />
        </div>

        <div className="flex-1 min-w-0 overflow-hidden py-1">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent truncate"
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
        className="relative z-10 flex items-center gap-2 flex-shrink-0"
      >
        {/* Toggle Sidebar Button (desktop only) */}
        {onToggleSidebar && (
          <div className="hidden lg:block">
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
          </div>
        )}

        {/* More Options Menu */}
        <div className="relative" ref={buttonRef}>
          <ActionButton
            icon={<MoreVertical className="w-4 h-4" />}
            onClick={() => setShowMenu(!showMenu)}
            label="Más opciones"
          />
        </div>
      </motion.div>
    </motion.header>

    {/* Dropdown Menu rendered as Portal */}
    {mounted && showMenu && createPortal(
      <AnimatePresence>
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] cursor-pointer"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: `${menuPosition.top}px`,
              right: `${menuPosition.right}px`,
              zIndex: 9999,
            }}
            className="w-56 rounded-2xl overflow-hidden shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/30 dark:border-gray-700/50"
          >
            {agentId && (
              <MenuItem
                icon={<Brain className="w-4 h-4" />}
                label="Gestionar Memoria"
                onClick={() => {
                  window.location.href = `/agentes/${agentId}/memory`;
                }}
              />
            )}

            {onSearch && (
              <MenuItem
                icon={<Search className="w-4 h-4" />}
                label="Buscar en conversación"
                onClick={() => {
                  onSearch();
                  setShowMenu(false);
                }}
              />
            )}

            {onExport && (
              <MenuItem
                icon={<Download className="w-4 h-4" />}
                label="Exportar a PDF"
                onClick={() => {
                  onExport();
                  setShowMenu(false);
                }}
              />
            )}

            {(onReset || onDelete) && (
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
            )}

            {onReset && (
              <MenuItem
                icon={<Trash2 className="w-4 h-4" />}
                label="Resetear conversación"
                onClick={() => {
                  onReset();
                  setShowMenu(false);
                }}
                variant="danger"
              />
            )}

            {onDelete && (
              <MenuItem
                icon={<Trash2 className="w-4 h-4" />}
                label="Eliminar agente"
                onClick={() => {
                  onDelete();
                  setShowMenu(false);
                }}
                variant="danger"
              />
            )}
          </motion.div>
        </>
      </AnimatePresence>,
      document.body
    )}
  </>
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
        "w-10 h-10 flex items-center justify-center",
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

// Menu Item Component
function MenuItem({
  icon,
  label,
  onClick,
  variant = "default",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3",
        "text-left text-sm font-medium",
        "transition-colors duration-150",
        variant === "danger"
          ? [
              "text-red-600 dark:text-red-400",
              "hover:bg-red-500/10",
            ]
          : [
              "text-gray-700 dark:text-gray-300",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
            ]
      )}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}
