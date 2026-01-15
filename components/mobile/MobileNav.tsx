/**
 * Mobile Bottom Navigation Component
 *
 * Fixed bottom navigation bar for mobile devices
 * - Touch-friendly buttons (min 44px)
 * - Active state indicators
 * - Badge counts for notifications
 * - Smooth animations
 * - Haptic feedback integration
 * - Motion system standardized
 *
 * UPDATED: Integra motion system y haptic feedback de Phase 1
 */

"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/useHaptic";
import { scaleVariants, TRANSITIONS } from "@/lib/motion/system";
import { mobileTheme } from "@/lib/mobile-theme";
import {
  Home,
  MessagesSquare,
  Users,
  User,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  badge?: number;
  matchPaths?: string[];
}

const navItemsConfig: NavItem[] = [
  {
    href: "/dashboard",
    labelKey: "home",
    icon: Home,
    matchPaths: ["/dashboard"],
  },
  {
    href: "/dashboard/grupos",
    labelKey: "groups",
    icon: MessagesSquare,
    matchPaths: ["/dashboard/grupos"],
  },
  {
    href: "/community",
    labelKey: "community",
    icon: Users,
    matchPaths: ["/community"],
  },
  {
    href: "/configuracion",
    labelKey: "profile",
    icon: User,
    matchPaths: ["/configuracion"],
  },
];

export function MobileNav() {
  const t = useTranslations("mobileNav");
  const pathname = usePathname();
  const { light } = useHaptic();

  const handleNavClick = () => {
    light(); // Haptic feedback en navegación
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl shadow-2xl pb-safe"
      style={{
        backgroundColor: mobileTheme.colors.background.secondary,
        borderTopWidth: 1,
        borderTopColor: mobileTheme.colors.border.light,
      }}
    >
      <div
        className="flex items-center justify-around px-2"
        style={{ height: mobileTheme.tabBar.height }}
      >
        {navItemsConfig.map((item) => {
          const isActive =
            item.matchPaths?.some((path) => pathname.startsWith(path)) ||
            pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className="relative flex flex-col items-center justify-center flex-1 h-full min-w-[44px] touch-manipulation"
            >
              <div className="relative flex flex-col items-center gap-1">
                {/* Icon - usando scaleVariants del motion system */}
                <motion.div
                  variants={scaleVariants}
                  whileTap="tap"
                  className="relative"
                >
                  <item.icon
                    className="transition-all duration-200"
                    size={isActive ? 28 : 24}
                    strokeWidth={isActive ? 2.5 : 2}
                    style={{
                      color: isActive
                        ? mobileTheme.colors.primary[500]
                        : mobileTheme.colors.text.tertiary,
                    }}
                  />

                  {/* Badge - usando scaleVariants */}
                  {item.badge && item.badge > 0 && (
                    <motion.span
                      variants={scaleVariants}
                      initial="hidden"
                      animate="visible"
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                    >
                      {item.badge > 9 ? "9+" : item.badge}
                    </motion.span>
                  )}
                </motion.div>

                {/* Label */}
                <span
                  className="transition-colors duration-200"
                  style={{
                    fontSize: mobileTheme.tabBar.labelFontSize,
                    fontWeight: mobileTheme.tabBar.labelFontWeight,
                    color: isActive
                      ? mobileTheme.colors.primary[500]
                      : mobileTheme.colors.text.tertiary,
                  }}
                >
                  {t(item.labelKey)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
