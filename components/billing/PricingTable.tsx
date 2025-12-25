"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, Zap, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { PLANS } from "@/lib/mercadopago/config";

interface PricingTableProps {
  currentPlan?: "free" | "plus" | "ultra";
  onSelectPlan: (planId: "plus" | "ultra") => void;
  loading?: boolean;
  className?: string;
}

export function PricingTable({
  currentPlan = "free",
  onSelectPlan,
  loading = false,
  className = "",
}: PricingTableProps) {
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const t = useTranslations("billing");

  const planConfigs = [
    {
      ...PLANS.free,
      icon: Sparkles,
      color: "from-gray-500 to-gray-700",
      borderColor: "border-gray-300 dark:border-gray-700",
      popular: false,
    },
    {
      ...PLANS.plus,
      icon: Crown,
      color: "from-blue-500 to-purple-600",
      borderColor: "border-blue-500",
      popular: true,
    },
    {
      ...PLANS.ultra,
      icon: Zap,
      color: "from-purple-500 to-pink-600",
      borderColor: "border-purple-500",
      popular: false,
    },
  ];

  const formatPrice = (price: number) => {
    if (price === 0) return "Gratis";
    return `$${price.toLocaleString("es-AR")}`;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header Section */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block mb-4"
        >
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 text-sm px-4 py-1">
            Planes Premium
          </Badge>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          Elige tu plan perfecto
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Desbloquea todo el potencial de tus compañeros IA con características exclusivas
        </motion.p>
      </div>

      {/* Billing Interval Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center mb-8"
      >
        <div className="inline-flex items-center gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={billingInterval === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setBillingInterval("month")}
            className="px-6"
          >
            Mensual
          </Button>
          <Button
            variant={billingInterval === "year" ? "default" : "ghost"}
            size="sm"
            onClick={() => setBillingInterval("year")}
            className="px-6"
          >
            Anual
            <Badge className="ml-2 bg-green-500 text-white text-xs">
              -20%
            </Badge>
          </Button>
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {planConfigs.map((plan, index) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;
          const isFree = plan.id === "free";
          const price = billingInterval === "year" && !isFree
            ? Math.round(plan.price * 12 * 0.8)
            : plan.price;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`relative ${plan.popular ? "md:scale-105 z-10" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
                    ⭐ Más Popular
                  </Badge>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                    ✓ Plan Actual
                  </Badge>
                </div>
              )}

              <Card
                className={`p-8 h-full flex flex-col transition-all duration-300 ${
                  plan.popular
                    ? `${plan.borderColor} border-2 shadow-2xl shadow-blue-500/20`
                    : "border-border hover:border-primary/50"
                } ${isCurrentPlan ? "bg-muted/30" : ""} hover:shadow-xl`}
              >
                {/* Icon & Title */}
                <div className="mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  {isFree ? (
                    <div className="text-5xl font-bold">Gratis</div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl font-bold">
                          {formatPrice(price)}
                        </span>
                        <span className="text-muted-foreground">
                          /{billingInterval === "month" ? "mes" : "año"}
                        </span>
                      </div>
                      {billingInterval === "year" && (
                        <p className="text-sm text-green-600 font-medium">
                          ¡Ahorra ${(plan.price * 12 * 0.2).toLocaleString("es-AR")} al año!
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* CTA Button */}
                <div className="mb-8">
                  {isCurrentPlan ? (
                    <Button disabled variant="secondary" className="w-full" size="lg">
                      <Check className="mr-2 h-4 w-4" />
                      Plan Actual
                    </Button>
                  ) : isFree ? (
                    <Button disabled variant="outline" className="w-full" size="lg">
                      Plan Gratuito
                    </Button>
                  ) : (
                    <Button
                      onClick={() => onSelectPlan(plan.id as "plus" | "ultra")}
                      disabled={loading}
                      size="lg"
                      className={`w-full ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                          : ""
                      }`}
                    >
                      {loading ? (
                        "Cargando..."
                      ) : (
                        <>
                          Comenzar con {plan.name}
                          {plan.popular && <Sparkles className="ml-2 h-4 w-4" />}
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 flex-grow">
                  {plan.features.map((feature, i) => {
                    const isNegative = feature.startsWith("❌");
                    const cleanFeature = feature.replace(/^[✅❌]\s*/, "");

                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                            isNegative
                              ? "bg-muted"
                              : `bg-gradient-to-br ${plan.color}`
                          }`}
                        >
                          {isNegative ? (
                            <X className="w-3 h-3 text-muted-foreground" />
                          ) : (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            isNegative
                              ? "text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {cleanFeature}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Badge for Popular */}
                {plan.popular && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span>Mejor relación calidad-precio</span>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Trust Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-16 text-center"
      >
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span>Cancela cuando quieras</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span>Pago seguro con Mercado Pago</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span>Soporte en español</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
