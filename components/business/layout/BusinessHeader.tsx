"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Bell,
  Settings,
  HelpCircle,
  ChevronDown,
  Activity,
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
} from "lucide-react";

interface BusinessHeaderProps {
  className?: string;
}

export function BusinessHeader({ className }: BusinessHeaderProps) {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "success",
      title: "Agent deployed successfully",
      message: "Customer Support Bot is now active",
      time: "2 min ago",
      read: false,
    },
    {
      id: 2,
      type: "warning",
      title: "High API usage detected",
      message: "Data Analyst agent exceeded 80% of daily quota",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      type: "info",
      title: "Weekly report ready",
      message: "Analytics report for this week is available",
      time: "3 hours ago",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Get page title based on pathname
  const getPageTitle = () => {
    if (pathname === "/business/dashboard") return "Dashboard";
    if (pathname.startsWith("/business/agents")) return "AI Agents";
    if (pathname.startsWith("/business/workflows")) return "Workflows";
    if (pathname.startsWith("/business/analytics")) return "Analytics";
    if (pathname.startsWith("/business/team")) return "Team Management";
    if (pathname.startsWith("/business/api")) return "API & Integration";
    if (pathname.startsWith("/business/settings")) return "Settings";
    return "AI Business Suite";
  };

  const getPageDescription = () => {
    if (pathname === "/business/dashboard")
      return "Real-time overview of your AI operations";
    if (pathname.startsWith("/business/agents"))
      return "Manage and monitor your AI agents";
    if (pathname.startsWith("/business/workflows"))
      return "Orchestrate multi-agent workflows";
    if (pathname.startsWith("/business/analytics"))
      return "Performance metrics and insights";
    if (pathname.startsWith("/business/team"))
      return "Manage team members and permissions";
    if (pathname.startsWith("/business/api"))
      return "Developer tools and API management";
    if (pathname.startsWith("/business/settings"))
      return "Configure your organization settings";
    return "Enterprise AI management platform";
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-business-success" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-business-warning" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-business-error" />;
      default:
        return <Activity className="h-4 w-4 text-business-accent" />;
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 z-30 flex items-center justify-between gap-4",
        "business-header-height",
        "border-b border-business bg-business-secondary/80 backdrop-blur-md",
        "business-animate-fade-in",
        className
      )}
      style={{ left: "var(--business-sidebar-width)", right: 0 }}
    >
      {/* Page Title */}
      <div className="flex flex-col px-6">
        <h1 className="text-2xl font-bold text-business-primary">
          {getPageTitle()}
        </h1>
        <p className="text-sm text-business-muted">{getPageDescription()}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 px-6">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-business-muted" />
          <Input
            type="search"
            placeholder="Search agents, workflows..."
            className="w-64 pl-9 bg-business-tertiary border-business focus-visible:ring-[rgb(var(--business-primary))]"
          />
        </div>

        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-business"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Export Data</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <FileText className="h-4 w-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative border-business"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(var(--business-error))] text-xs font-bold text-white"
                >
                  {unreadCount}
                </motion.span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-2">
              <DropdownMenuLabel className="p-0">
                Notifications
              </DropdownMenuLabel>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-xs"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 cursor-pointer",
                    !notification.read && "bg-business-tertiary/50"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex w-full items-start gap-2">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <p className="text-xs text-business-muted">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-[rgb(var(--business-primary))]" />
                    )}
                  </div>
                  <span className="text-xs text-business-muted">
                    {notification.time}
                  </span>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-xs text-business-brand font-medium">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help */}
        <Button
          variant="outline"
          size="icon"
          className="border-business hidden sm:inline-flex"
          title="Help & Documentation"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* Settings */}
        <Button
          variant="outline"
          size="icon"
          className="border-business"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
