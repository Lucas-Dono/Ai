"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Users, Globe2, Image, Mic } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface UsageMetric {
  label: string;
  current: number;
  limit: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  unit?: string;
}

interface UsageMetricsProps {
  metrics: UsageMetric[];
}

export function UsageMetrics({ metrics }: UsageMetricsProps) {
  const t = useTranslations("billing.components.usageMetrics");

  return (
    <Card className="p-8">
      <h3 className="text-xl font-semibold mb-6">{t("title")}</h3>
      <div className="space-y-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const percentage =
            metric.limit === -1 ? 0 : (metric.current / metric.limit) * 100;
          const isUnlimited = metric.limit === -1;
          const isNearLimit = percentage >= 80 && !isUnlimited;
          const isAtLimit = percentage >= 100 && !isUnlimited;

          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-2xl ${metric.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-sm">{metric.label}</span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-lg font-bold ${
                      isAtLimit
                        ? "text-red-600"
                        : isNearLimit
                          ? "text-orange-600"
                          : metric.color.replace("bg-", "text-").replace("-500", "-600")
                    }`}
                  >
                    {isUnlimited ? t("unlimited") : metric.current}
                  </span>
                  {!isUnlimited && (
                    <>
                      <span className="text-muted-foreground"> / </span>
                      <span className="text-muted-foreground">
                        {metric.limit}
                      </span>
                    </>
                  )}
                  {metric.unit && (
                    <span className="text-xs text-muted-foreground ml-1">
                      {metric.unit}
                    </span>
                  )}
                </div>
              </div>
              {!isUnlimited && (
                <div className="relative">
                  <Progress
                    value={Math.min(percentage, 100)}
                    className={`h-2 ${
                      isAtLimit
                        ? "[&>div]:bg-red-500"
                        : isNearLimit
                          ? "[&>div]:bg-orange-500"
                          : ""
                    }`}
                  />
                  {isNearLimit && (
                    <p className="text-xs text-orange-600 mt-1">
                      {isAtLimit
                        ? t("atLimit")
                        : t("nearLimit")}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

export function UsageMetricsSkeleton() {
  return (
    <Card className="p-8">
      <div className="h-7 w-32 bg-muted rounded animate-pulse mb-6" />
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-2xl animate-pulse" />
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-6 w-16 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-2 w-full bg-muted rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </Card>
  );
}
