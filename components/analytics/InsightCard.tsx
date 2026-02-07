/**
 * InsightCard Component
 * Displays AI-generated insights with visual flair
 */

import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  insight: string;
  variant?: "default" | "highlight";
}

export function InsightCard({ insight, variant = "default" }: InsightCardProps) {
  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all",
        variant === "highlight" && "border-purple-500/50 bg-purple-500/5"
      )}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "p-2 rounded-2xl shrink-0",
              variant === "highlight" ? "bg-purple-500/20" : "bg-muted"
            )}
          >
            <Sparkles
              className={cn(
                "h-4 w-4",
                variant === "highlight" ? "text-purple-500" : "text-muted-foreground"
              )}
            />
          </div>
          <p className="text-sm leading-relaxed">{insight}</p>
        </div>
      </CardContent>
    </Card>
  );
}
