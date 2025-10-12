/**
 * Progress Bar Component
 * Displays a metric as a progress bar with label and value
 */

"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  label: string;
  value: number; // 0-1
  color?: "blue" | "green" | "purple" | "orange" | "red";
  showPercentage?: boolean;
}

const colorClasses = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

export function ProgressBar({
  label,
  value,
  color = "blue",
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = Math.round(value * 100);
  const colorClass = colorClasses[color];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        {showPercentage && (
          <span className="text-muted-foreground">{percentage}%</span>
        )}
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
