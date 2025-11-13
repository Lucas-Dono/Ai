"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface PlanCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  onSelect?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function PlanCard({
  id,
  name,
  description,
  price,
  interval,
  features,
  isCurrentPlan = false,
  isPopular = false,
  onSelect,
  loading = false,
  disabled = false,
}: PlanCardProps) {
  const t = useTranslations("billing.components.planCard");
  const Icon = id === "ultra" ? Zap : Sparkles;
  const color =
    id === "ultra"
      ? "from-purple-600 to-pink-600"
      : id === "plus"
        ? "from-blue-600 to-purple-600"
        : "from-gray-600 to-gray-800";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative h-full"
    >
      {isPopular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            {t("mostPopular")}
          </Badge>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
            {t("currentPlan")}
          </Badge>
        </div>
      )}

      <Card
        className={`p-8 h-full flex flex-col transition-all duration-300 ${
          isPopular
            ? "border-primary shadow-xl shadow-primary/20 scale-105 hover:scale-[1.06]"
            : "border-border hover:border-primary/50 hover:shadow-lg"
        } ${isCurrentPlan ? "bg-muted/30" : ""}`}
      >
        {/* Header */}
        <div className="mb-6">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-2">{name}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Price */}
        <div className="mb-6">
          {price === 0 ? (
            <div className="text-5xl font-bold">{t("free")}</div>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold">${price}</span>
                <span className="text-muted-foreground">{interval === "month" ? t("perMonth") : t("perYear")}</span>
              </div>
              {interval === "year" && (
                <p className="text-sm text-green-600 mt-1">{t("saveAnnual")}</p>
              )}
            </>
          )}
        </div>

        {/* CTA Button */}
        <div className="mb-6">
          {isCurrentPlan ? (
            <Button disabled variant="secondary" className="w-full">
              <Check className="mr-2 h-4 w-4" />
              {t("currentPlan")}
            </Button>
          ) : (
            <Button
              onClick={onSelect}
              disabled={loading || disabled}
              className={`w-full ${
                isPopular
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  : ""
              }`}
            >
              {loading ? t("loading") : id === "free" ? t("getStarted") : t("upgradeTo", { plan: name })}
            </Button>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3 flex-grow">
          {features.map((feature, i) => {
            const isNegative = feature.startsWith("❌");
            const isPositive = feature.startsWith("✅");

            return (
              <div key={i} className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full ${
                    isNegative
                      ? "bg-muted"
                      : `bg-gradient-to-br ${color}`
                  } flex items-center justify-center flex-shrink-0 mt-0.5`}
                >
                  {!isNegative && !isPositive && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span
                  className={`text-sm ${
                    isNegative ? "text-muted-foreground line-through" : "text-foreground"
                  }`}
                >
                  {feature.replace(/^[✅❌]\s*/, "")}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
