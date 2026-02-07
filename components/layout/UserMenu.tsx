"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useClientLocale } from "@/hooks/useClientLocale";
import { signOut } from "@/lib/auth-client";
import { User, Settings, LogOut, CreditCard } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  displayName: string;
  initials: string;
  userPlan: string;
}

export function UserMenu({ displayName, initials, userPlan }: UserMenuProps) {
  const { t } = useClientLocale();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const planLabels: Record<string, string> = {
    free: t("navigation.planLabels.free"),
    plus: t("navigation.planLabels.plus"),
    ultra: t("navigation.planLabels.ultra"),
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 w-full hover:bg-accent/50 rounded-xl transition-colors cursor-pointer"
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gradient-to-br from-secondary/20 to-primary/20 text-primary font-semibold text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 text-left">
          <div className="font-medium text-xs truncate">{displayName}</div>
          <div className="text-[10px] text-muted-foreground">
            Plan {planLabels[userPlan]}
          </div>
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 right-0 w-56 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl z-50"
          >
            <div className="p-4 border-b border-border">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {planLabels[userPlan]}
                </p>
              </div>
            </div>

            <div className="py-2">
              <Link href="/configuracion" onClick={() => setIsOpen(false)}>
                <div className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-accent/50 transition-colors">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{t("userMenu.profile")}</span>
                </div>
              </Link>

              <Link href="/dashboard/billing" onClick={() => setIsOpen(false)}>
                <div className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-accent/50 transition-colors">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">{t("userMenu.billing")}</span>
                </div>
              </Link>

              <Link href="/configuracion" onClick={() => setIsOpen(false)}>
                <div className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-accent/50 transition-colors">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">{t("userMenu.settings")}</span>
                </div>
              </Link>
            </div>

            <div className="border-t border-border">
              <div
                onClick={handleLogout}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-accent/50 transition-colors text-destructive",
                  isLoggingOut && "opacity-50 cursor-not-allowed"
                )}
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">
                  {isLoggingOut ? t("userMenu.loggingOut") : t("userMenu.logout")}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
