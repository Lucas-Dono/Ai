"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  Bot,
  Workflow,
  BarChart3,
  Users,
  Code,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Briefcase,
  Shield,
  Activity,
  Database,
  Zap,
  LogOut,
  HelpCircle,
  Bell,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string | number;
  children?: {
    href: string;
    label: string;
  }[];
}

interface BusinessSidebarProps {
  className?: string;
}

export function BusinessSidebar({ className }: BusinessSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [stats, setStats] = useState({
    activeAgents: 0,
    activeWorkflows: 0,
    teamMembers: 0,
  });

  // Load stats
  useEffect(() => {
    // TODO: Replace with real API call
    setStats({
      activeAgents: 12,
      activeWorkflows: 3,
      teamMembers: 8,
    });
  }, []);

  const navItems: NavItem[] = [
    {
      href: "/business/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/business/agents",
      label: "Agents",
      icon: Bot,
      badge: stats.activeAgents || undefined,
      children: [
        { href: "/business/agents", label: "All Agents" },
        { href: "/business/agents?status=active", label: "Active" },
        { href: "/business/agents?status=idle", label: "Idle" },
        { href: "/business/agents/new", label: "Create New" },
      ],
    },
    {
      href: "/business/workflows",
      label: "Workflows",
      icon: Workflow,
      badge: stats.activeWorkflows || undefined,
      children: [
        { href: "/business/workflows", label: "All Workflows" },
        { href: "/business/workflows?status=active", label: "Active" },
        { href: "/business/workflows?status=scheduled", label: "Scheduled" },
        { href: "/business/workflows/builder", label: "Create New" },
      ],
    },
    {
      href: "/business/analytics",
      label: "Analytics",
      icon: BarChart3,
      children: [
        { href: "/business/analytics/overview", label: "Overview" },
        { href: "/business/analytics/agents", label: "Agent Performance" },
        { href: "/business/analytics/costs", label: "Cost Analysis" },
        { href: "/business/analytics/reports", label: "Reports" },
      ],
    },
    {
      href: "/business/team",
      label: "Team",
      icon: Users,
      badge: stats.teamMembers || undefined,
      children: [
        { href: "/business/team/members", label: "Members" },
        { href: "/business/team/roles", label: "Roles & Permissions" },
        { href: "/business/team/invitations", label: "Invitations" },
      ],
    },
    {
      href: "/business/api",
      label: "API & Integration",
      icon: Code,
      children: [
        { href: "/business/api/keys", label: "API Keys" },
        { href: "/business/api/docs", label: "Documentation" },
        { href: "/business/api/webhooks", label: "Webhooks" },
      ],
    },
    {
      href: "/business/settings",
      label: "Settings",
      icon: Settings,
      children: [
        { href: "/business/settings/organization", label: "Organization" },
        { href: "/business/settings/billing", label: "Billing" },
        { href: "/business/settings/security", label: "Security" },
        { href: "/business/settings/integrations", label: "Integrations" },
      ],
    },
  ];

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    if (href === "/business/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isExpanded = (href: string) => expandedItems.includes(href);

  // Auto-expand active parent
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children && isActive(item.href)) {
        if (!expandedItems.includes(item.href)) {
          setExpandedItems((prev) => [...prev, item.href]);
        }
      }
    });
  }, [pathname]);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col",
        "business-sidebar-width",
        "border-r border-business bg-business-secondary backdrop-blur-sm",
        "business-animate-slide-in",
        className
      )}
    >
      {/* Logo & Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-business px-6">
        <Link href="/business/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--business-primary))] to-[rgb(var(--business-accent))] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-[rgb(var(--business-primary))] to-[rgb(var(--business-accent))] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-business-primary">AI Business</span>
            <span className="text-xs text-business-muted">Enterprise Suite</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 business-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const expanded = isExpanded(item.href);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.href} className="space-y-1">
              {/* Main Item */}
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpanded(item.href)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-[rgb(var(--business-primary))] text-white shadow-business-md"
                        : "text-business-secondary hover:bg-business-tertiary hover:text-business-primary"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant={active ? "secondary" : "outline"}
                        className="h-5 min-w-5 px-1.5 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                    {expanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-[rgb(var(--business-primary))] text-white shadow-business-md"
                        : "text-business-secondary hover:bg-business-tertiary hover:text-business-primary"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant={active ? "secondary" : "outline"}
                        className="h-5 min-w-5 px-1.5 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )}
              </motion.div>

              {/* Children */}
              <AnimatePresence>
                {hasChildren && expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-8 space-y-1 border-l-2 border-business-border-light pl-3 py-1">
                      {item.children?.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block rounded-md px-3 py-2 text-sm transition-all",
                              childActive
                                ? "font-medium text-business-brand bg-[rgb(var(--business-primary))]/10"
                                : "text-business-muted hover:text-business-primary hover:bg-business-hover"
                            )}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="border-t border-business px-3 py-3 space-y-2">
        <Link href="/business/agents/new">
          <Button
            size="sm"
            className="w-full bg-[rgb(var(--business-primary))] hover:bg-[rgb(var(--business-primary-hover))] text-white shadow-business-md"
          >
            <Zap className="h-4 w-4 mr-2" />
            New Agent
          </Button>
        </Link>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-business"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-business"
            title="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {/* User Profile */}
      <div className="border-t border-business px-3 py-3">
        <div className="flex items-center gap-3 rounded-lg bg-business-tertiary p-3">
          <Avatar className="h-10 w-10 ring-2 ring-[rgb(var(--business-primary))]/20">
            <AvatarFallback className="bg-gradient-to-br from-[rgb(var(--business-primary))] to-[rgb(var(--business-accent))] text-white font-semibold">
              JD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-business-primary truncate">
              John Doe
            </div>
            <div className="flex items-center gap-2 text-xs text-business-muted">
              <Shield className="h-3 w-3" />
              <span>Admin</span>
              <Badge variant="outline" className="h-4 px-1.5 text-xs">
                Enterprise
              </Badge>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* System Status */}
      <div className="border-t border-business px-3 py-2 bg-business-tertiary/50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-business-muted">
            <Activity className="h-3 w-3" />
            <span>System Status</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[rgb(var(--business-success))] animate-pulse" />
            <span className="text-business-success font-medium">Operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
