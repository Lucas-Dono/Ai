/**
 * Stat Card Component
 * Displays a single metric with icon and trend indicator
 */

"use client";

import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

const colorClasses = {
  blue: "text-blue-500 bg-blue-500/10",
  green: "text-green-500 bg-green-500/10",
  purple: "text-purple-500 bg-purple-500/10",
  orange: "text-orange-500 bg-orange-500/10",
  red: "text-red-500 bg-red-500/10",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  color = "blue",
}: StatCardProps) {
  const colorClass = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <div
              className={`flex items-center text-sm font-medium ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
