"use client";

import { Progress } from "./progress";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressIndicator({
  value,
  label,
  showPercentage = true,
  size = "md",
  className
}: ProgressIndicatorProps) {
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3"
  };

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && (
            <span className="font-medium">{Math.round(value)}%</span>
          )}
        </div>
      )}
      <Progress value={value} className={sizeClasses[size]} />
    </div>
  );
}
