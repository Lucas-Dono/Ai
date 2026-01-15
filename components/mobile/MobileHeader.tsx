/**
 * Mobile Header Component
 *
 * Responsive header with hamburger menu
 * - Similar al header de la app móvil React Native
 * - Logo y branding con Sparkles icon
 * - Barra de búsqueda integrada
 * - Actions: Crear y Settings
 * - Haptic feedback
 * - Motion system standardized
 *
 * UPDATED: Sincronizado con el diseño de la app móvil
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X, Sparkles, Settings, CreditCard, Shield, Search, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useHaptic } from "@/hooks/useHaptic";
import { fadeVariants, slideLeftVariants, TRANSITIONS } from "@/lib/motion/system";
import { mobileTheme } from "@/lib/mobile-theme";

interface MobileHeaderProps {
  title?: string;
  showMenu?: boolean;
}

export function MobileHeader({ title, showMenu = true }: MobileHeaderProps) {
  const t = useTranslations("mobileHeader");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
      <header
        className="lg:hidden sticky top-0 z-40 w-full backdrop-blur-xl shadow-sm"
        style={{
          backgroundColor: mobileTheme.colors.background.secondary,
          borderBottomWidth: '1px',
          borderBottomColor: mobileTheme.colors.border.light,
        }}
      >
        {/* Primera fila: Logo + Acciones */}
        <div className="flex items-center justify-between h-14 px-6">
          {/* Left: Logo + Brand */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Sparkles
              className="w-6 h-6"
              style={{ color: mobileTheme.colors.primary[500] }}
            />
            <span
              className="font-bold text-xl"
              style={{ color: mobileTheme.colors.text.primary }}
            >
              {title || t("brand")}
            </span>
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {/* Botón Crear */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              transition={TRANSITIONS.fast}
              className="p-2 flex items-center justify-center touch-manipulation"
              aria-label="Create"
              onClick={() => {
                light();
                // Navigate to create page
              }}
            >
              <Plus
                className="w-6 h-6"
                style={{ color: mobileTheme.colors.text.primary }}
              />
            </motion.button>

            {/* Botón Settings */}
            <motion.button
              onClick={toggleMenu}
              whileTap={{ scale: 0.95 }}
              transition={TRANSITIONS.fast}
              className="p-2 flex items-center justify-center touch-manipulation"
              aria-label="Settings"
            >
              <Settings
                className="w-6 h-6"
                style={{ color: mobileTheme.colors.text.primary }}
              />
            </motion.button>
          </div>
        </div>

        {/* Segunda fila: Barra de búsqueda */}
        <div className="px-6 pb-4">
          <div
            className="flex items-center gap-2 px-4 py-2.5"
            style={{
              backgroundColor: mobileTheme.colors.background.elevated,
              borderRadius: `${mobileTheme.borderRadius.lg}px`,
            }}
          >
            <Search
              className="w-5 h-5 flex-shrink-0"
              style={{ color: mobileTheme.colors.text.tertiary }}
            />
            <input
              type="text"
              placeholder={t("searchPlaceholder") || "Buscar compañeros, mundos..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-base placeholder:text-[#94A3B8]"
              style={{
                color: mobileTheme.colors.text.primary,
              }}
            />
            {searchQuery && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchQuery("")}
                className="p-1"
              >
                <X
                  className="w-5 h-5"
                  style={{ color: mobileTheme.colors.text.tertiary }}
                />
              </motion.button>
            )}
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
              className="lg:hidden fixed inset-0 z-40 backdrop-blur-sm"
              style={{
                backgroundColor: mobileTheme.colors.overlay,
              }}
              onClick={handleMenuItemClick}
            />

            {/* Drawer */}
            <motion.div
              variants={slideLeftVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50 overflow-y-auto"
              style={{
                backgroundColor: mobileTheme.colors.background.secondary,
                boxShadow: mobileTheme.shadows.xl,
              }}
            >
              {/* Header */}
              <div
                className="p-6"
                style={{
                  borderBottomWidth: '1px',
                  borderBottomColor: mobileTheme.colors.border.light,
                }}
              >
                <motion.button
                  onClick={handleMenuItemClick}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-4 right-4 p-2 transition-colors"
                  style={{
                    borderRadius: `${mobileTheme.borderRadius.lg}px`,
                  }}
                >
                  <X
                    className="w-6 h-6"
                    style={{ color: mobileTheme.colors.text.primary }}
                  />
                </motion.button>

                <Link href="/dashboard" className="flex items-center gap-2" onClick={handleMenuItemClick}>
                  <Sparkles
                    className="w-8 h-8"
                    style={{ color: mobileTheme.colors.primary[500] }}
                  />
                  <span
                    className="font-bold text-lg"
                    style={{ color: mobileTheme.colors.text.primary }}
                  >
                    {t("brand")}
                  </span>
                </Link>
              </div>

              {/* User Info */}
              <div
                className="p-6"
                style={{
                  borderBottomWidth: '1px',
                  borderBottomColor: mobileTheme.colors.border.light,
                }}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback
                      className="font-semibold"
                      style={{
                        background: `linear-gradient(135deg, ${mobileTheme.colors.primary[500]}33, ${mobileTheme.colors.secondary[500]}33)`,
                        color: mobileTheme.colors.primary[500],
                      }}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-medium text-sm truncate"
                      style={{ color: mobileTheme.colors.text.primary }}
                    >
                      {displayName}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: mobileTheme.colors.text.tertiary }}
                    >
                      {t("viewProfile")}
                    </div>
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
                      className="flex items-center gap-3 px-4 py-3 transition-colors mb-1 min-h-[44px]"
                      style={{
                        borderRadius: `${mobileTheme.borderRadius.lg}px`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = mobileTheme.colors.background.elevated;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <item.icon
                        className="w-5 h-5"
                        style={{ color: mobileTheme.colors.text.secondary }}
                      />
                      <span
                        className="font-medium"
                        style={{ color: mobileTheme.colors.text.primary }}
                      >
                        {t(item.labelKey)}
                      </span>
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
