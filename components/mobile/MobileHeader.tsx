/**
 * Mobile Header Component
 *
 * Responsive header with hamburger menu
 * - Hamburger menu for mobile
 * - Logo and branding
 * - Actions menu
 * - Haptic feedback
 * - Motion system standardized
 *
 * UPDATED: Integra motion system y haptic feedback de Phase 1
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X, Sparkles, Settings, CreditCard, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useHaptic } from "@/hooks/useHaptic";
import { fadeVariants, slideLeftVariants, TRANSITIONS } from "@/lib/motion/system";

interface MobileHeaderProps {
  title?: string;
  showMenu?: boolean;
}

export function MobileHeader({ title, showMenu = true }: MobileHeaderProps) {
  const t = useTranslations("mobileHeader");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();
  const { light, medium } = useHaptic();

  const displayName = session?.user?.name || session?.user?.email?.split("@")[0] || t("defaultUser");
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const toggleMenu = () => {
    medium(); // Haptic feedback al abrir/cerrar menú
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemClick = () => {
    light(); // Haptic feedback al seleccionar item
    setIsMenuOpen(false);
  };

  const menuItems = [
    { href: "/dashboard", labelKey: "menu.home", icon: Sparkles },
    { href: "/configuracion", labelKey: "menu.settings", icon: Settings },
    { href: "/dashboard/billing", labelKey: "menu.billing", icon: CreditCard },
    { href: "/administracion", labelKey: "menu.admin", icon: Shield },
  ];

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left: Menu Button */}
          {showMenu && (
            <motion.button
              onClick={toggleMenu}
              whileTap={{ scale: 0.95 }}
              transition={TRANSITIONS.fast}
              className="p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          )}

          {/* Center: Logo/Title */}
          <Link href="/dashboard" className="flex items-center gap-2 flex-1 justify-center">
            <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg">{title || t("brand")}</span>
          </Link>

          {/* Right: Theme Toggle */}
          <div className="w-11">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={handleMenuItemClick}
            />

            {/* Drawer */}
            <motion.div
              variants={slideLeftVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 z-50 shadow-2xl overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <motion.button
                  onClick={handleMenuItemClick}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-4 right-4 p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>

                <Link href="/dashboard" className="flex items-center gap-2" onClick={handleMenuItemClick}>
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-bold text-lg">{t("brand")}</span>
                </Link>
              </div>

              {/* User Info */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-secondary/20 to-primary/20 text-primary font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{displayName}</div>
                    <div className="text-xs text-muted-foreground">{t("viewProfile")}</div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="p-4">
                {menuItems.map((item) => (
                  <motion.div key={item.href} whileTap={{ scale: 0.98 }}>
                    <Link
                      href={item.href}
                      onClick={handleMenuItemClick}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mb-1 min-h-[44px]"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{t(item.labelKey)}</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
