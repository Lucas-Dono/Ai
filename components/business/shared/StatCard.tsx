"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  description?: string;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  trend = "neutral",
  description,
  loading = false,
  className,
}: StatCardProps) {
  const getTrendIcon = () => {
    if (trend === "up") return TrendingUp;
    if (trend === "down") return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (changeType === "increase") return "text-business-success";
    if (changeType === "decrease") return "text-business-error";
    return "text-business-muted";
  };

  const TrendIcon = getTrendIcon();

  if (loading) {
    return (
      <Card className={cn("business-stat-card", className)}>
        <div className="space-y-3">
          <div className="h-4 w-24 business-skeleton" />
          <div className="h-8 w-32 business-skeleton" />
          <div className="h-3 w-40 business-skeleton" />
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className={cn("business-stat-card group", className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-business-secondary uppercase tracking-wide">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-business-primary">
                {value}
              </h3>
              {change !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-sm font-medium",
                    getTrendColor()
                  )}
                >
                  <TrendIcon className="h-4 w-4" />
                  {Math.abs(change)}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-business-muted">{description}</p>
            )}
          </div>
          {Icon && (
            <div className="rounded-lg bg-gradient-to-br from-[rgb(var(--business-primary))]/10 to-[rgb(var(--business-accent))]/10 p-3 group-hover:scale-110 transition-transform">
              <Icon className="h-6 w-6 text-business-brand" />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
