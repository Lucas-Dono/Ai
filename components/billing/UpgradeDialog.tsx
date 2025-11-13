"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: "free" | "plus" | "ultra";
  onUpgrade: (planId: "plus" | "ultra") => Promise<void>;
}

export function UpgradeDialog({
  open,
  onOpenChange,
  currentPlan,
  onUpgrade,
}: UpgradeDialogProps) {
  const t = useTranslations("billing.components.upgradeDialog");
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: "plus" | "ultra") => {
    setLoading(planId);
    try {
      await onUpgrade(planId);
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      id: "plus" as const,
      name: "Plus",
      price: "$5",
      icon: Sparkles,
      color: "from-blue-600 to-purple-600",
      description: t("features.plus.description"),
      features: [
        t("features.plus.feature1"),
        t("features.plus.feature2"),
        t("features.plus.feature3"),
        t("features.plus.feature4"),
        t("features.plus.feature5"),
        t("features.plus.feature6"),
      ],
      isRecommended: currentPlan === "free",
    },
    {
      id: "ultra" as const,
      name: "Ultra",
      price: "$15",
      icon: Zap,
      color: "from-purple-600 to-pink-600",
      description: t("features.ultra.description"),
      features: [
        t("features.ultra.feature1"),
        t("features.ultra.feature2"),
        t("features.ultra.feature3"),
        t("features.ultra.feature4"),
        t("features.ultra.feature5"),
        t("features.ultra.feature6"),
        t("features.ultra.feature7"),
        t("features.ultra.feature8"),
      ],
      isRecommended: currentPlan === "plus",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative border rounded-2xl p-6 ${
                  plan.isRecommended
                    ? "border-primary shadow-lg shadow-primary/20"
                    : "border-border"
                } ${isCurrentPlan ? "opacity-50" : ""}`}
              >
                {plan.isRecommended && (
                  <Badge className="absolute -top-3 left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                    {t("recommended")}
                  </Badge>
                )}

                <div className="mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div
                        className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0 mt-0.5`}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading !== null || isCurrentPlan}
                  className={`w-full ${
                    plan.isRecommended
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      : ""
                  }`}
                >
                  {isCurrentPlan
                    ? t("currentPlan")
                    : loading === plan.id
                      ? t("processing")
                      : t("upgradeTo", { plan: plan.name })}
                </Button>
              </motion.div>
            );
          })}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <p className="text-sm text-muted-foreground text-center sm:text-left flex-grow">
            {t("trial")}
          </p>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("maybeLater")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
