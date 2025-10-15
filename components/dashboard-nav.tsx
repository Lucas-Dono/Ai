"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { OnboardingMenu } from "@/components/onboarding/OnboardingMenu";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Home,
  Heart,
  Briefcase,
  Network,
  Settings,
  Plus,
  Shield,
  Sparkles,
  CreditCard,
  Store,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/dashboard?filter=companion", label: "Compañeros", icon: Heart },
  { href: "/dashboard?filter=assistant", label: "Asistentes", icon: Briefcase },
  { href: "/mundos", label: "Mundos", icon: Network },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/configuracion", label: "Configuración", icon: Settings },
  { href: "/administracion", label: "Admin", icon: Shield },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [userPlan, setUserPlan] = useState<string>("free");

  useEffect(() => {
    // Fetch fresh user data from the database
    const fetchUserPlan = async () => {
      if (session?.user?.id) {
        try {
          console.log("[DashboardNav] Fetching plan for user:", session.user.id);
          const res = await fetch(`/api/user/plan`);
          console.log("[DashboardNav] Response status:", res.status);

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
  }, [session?.user?.id]);

  const displayName = session?.user?.name || session?.user?.email?.split("@")[0] || "Usuario";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const planLabels: Record<string, string> = {
    free: "Free",
    basic: "Basic",
    pro: "Pro",
    enterprise: "Enterprise",
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-64 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col">
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-lg">Creador IA</span>
        </Link>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
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
        <Link href="/constructor">
          <Button className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva IA
          </Button>
        </Link>

        <div className="flex gap-2">
          <OnboardingMenu />
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 px-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-secondary/20 to-primary/20 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{displayName}</div>
            <div className="text-xs text-muted-foreground">Plan {planLabels[userPlan]}</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
