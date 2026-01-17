"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { OnboardingMenu } from "@/components/onboarding/OnboardingMenu";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { FriendRequestsPanel } from "@/components/social/FriendRequestsPanel";
import { LanguageSwitcher } from "@/components/language-switcher";
import { UserMenu } from "@/components/layout/UserMenu";
import { GroupsNavItem } from "@/components/dashboard/GroupsNavItem";
import { useClientLocale } from "@/hooks/useClientLocale";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Home,
  Heart,
  Briefcase,
  Network,
  Settings,
  Plus,
  Sparkles,
  CreditCard,
  Users,
  BarChart3,
  Activity,
  Compass,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useClientLocale();
  const [userPlan, setUserPlan] = useState<string>("free");

  useEffect(() => {
    // Fetch fresh user data from the database
    const fetchUserPlan = async () => {
      if (session?.user?.id) {
        try {
          console.log("[DashboardNav] Fetching plan for user:", session.user.id);
          const res = await fetch(`/api/user/plan`);
          console.log("[DashboardNav] Response status:", res.status);

          // Si es 401, el usuario no está autenticado - redirigir a login
          if (res.status === 401) {
            router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
            return;
          }

          if (res.ok) {
            const data = await res.json();
            console.log("[DashboardNav] Plan data received:", data);
            setUserPlan(data.plan || "free");
            console.log("[DashboardNav] userPlan state updated to:", data.plan);
          } else {
            console.error("[DashboardNav] Error response:", await res.text());
          }
        } catch (error) {
          console.error("[DashboardNav] Error fetching user plan:", error);
        }
      } else {
        console.log("[DashboardNav] No session or user ID");
      }
    };

    fetchUserPlan();
  }, [session?.user?.id, router]);

  const displayName = session?.user?.name || session?.user?.email?.split("@")[0] || "Usuario";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const planLabels: Record<string, string> = {
    free: t("navigation.planLabels.free"),
    plus: t("navigation.planLabels.plus"),
    ultra: t("navigation.planLabels.ultra"),
  };

  const navItems = [
    { href: "/dashboard", label: t("navigation.home"), icon: Home },
    { href: "/dashboard/grupos", label: t("navigation.groups"), icon: Network },
    { href: "/dashboard/my-stats", label: t("navigation.myProgress"), icon: BarChart3 },
    { href: "/community", label: t("navigation.community"), icon: Users },
    { href: "/explore", label: t("navigation.explore") || "Explorar", icon: Compass },
    { href: "/dashboard/billing", label: t("navigation.billing"), icon: CreditCard },
    { href: "/dashboard/kpis", label: t("navigation.kpis"), icon: Activity },
    { href: "/configuracion", label: t("navigation.settings"), icon: Settings },
  ];

  return (
    <nav data-tour="sidebar-nav" className="hidden lg:flex fixed left-0 top-0 h-full w-64 border-r border-border bg-card/50 backdrop-blur-sm flex-col">
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="h-10 w-10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
          </div>
          <span className="font-bold text-lg">{t("navigation.brand")}</span>
        </Link>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => {
          // Check if current path matches or starts with the item href (for nested routes)
          const cleanHref = item.href.split('?')[0]; // Remove query params for matching

          // Fix: Prevent /dashboard from matching all dashboard subroutes
          const isActive = pathname === cleanHref ||
            (pathname.startsWith(cleanHref + '/') && cleanHref !== '/dashboard');

          // Add data-tour attribute based on route
          const getTourAttr = (href: string) => {
            if (href === '/community') return 'community-link';
            if (href === '/dashboard/grupos') return 'groups-link';
            if (href === '/dashboard/billing') return 'billing-link';
            if (href === '/dashboard/my-stats') return 'my-stats-link';
            return undefined;
          };

          // Use custom component for Groups item
          if (item.href === '/dashboard/grupos') {
            return (
              <GroupsNavItem
                key={item.href}
                label={item.label}
                isActive={isActive}
              />
            );
          }

          return (
            <Link key={item.href} href={item.href} data-tour={getTourAttr(item.href)}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border space-y-4">
        <Link href="/create-character" data-tour="create-ai-button">
          <Button className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t("navigation.newAI")}
          </Button>
        </Link>

        <div className="flex gap-2 py-2">
          <FriendRequestsPanel popoverSide="top" popoverAlign="start" />
          <NotificationDropdown popoverSide="top" popoverAlign="start" />
          <OnboardingMenu />
          <LanguageSwitcher variant="compact" />
        </div>

        <UserMenu
          displayName={displayName}
          initials={initials}
          userPlan={userPlan}
        />
      </div>
    </nav>
  );
}
