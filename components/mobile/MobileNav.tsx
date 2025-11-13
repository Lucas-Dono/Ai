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
import {
  Home,
  Users,
  PlusCircle,
  Bell,
  User,
  MessageCircle,
  Heart,
} from "lucide-react";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
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
    href: "/community",
    labelKey: "community",
    icon: Users,
    matchPaths: ["/community"],
  },
  {
    href: "/constructor",
    labelKey: "create",
    icon: PlusCircle,
    matchPaths: ["/constructor"],
  },
  {
    href: "/notifications",
    labelKey: "notifications",
    icon: Bell,
    matchPaths: ["/notifications"],
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 shadow-2xl pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
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
              <div className="relative">
                {/* Active indicator background - usando motion system */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute inset-0 -m-2 bg-primary/10 rounded-2xl"
                    transition={TRANSITIONS.standard}
                  />
                )}

                {/* Icon - usando scaleVariants del motion system */}
                <motion.div
                  variants={scaleVariants}
                  whileTap="tap"
                  className="relative z-10"
                >
                  <item.icon
                    className={cn(
                      "w-6 h-6 transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-gray-500 dark:text-gray-400"
                    )}
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
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-[11px] mt-1 font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-gray-500 dark:text-gray-400"
                )}
              >
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
