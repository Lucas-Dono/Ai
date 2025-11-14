"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlanCard } from "@/components/billing/PlanCard";
import {
  PaymentMethodSelector,
  type PaymentProvider,
} from "@/components/billing/PaymentMethodSelector";
import { PLANS } from "@/lib/mercadopago/config";
import { ArrowLeft, Check, X, Info } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

interface BillingData {
  plan: string;
}

export default function PlansPage() {
  const router = useRouter();
  const t = useTranslations("billing.plans");
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"plus" | "ultra" | null>(null);
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("mercadopago");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, []);

  async function fetchBillingData() {
    try {
      const response = await fetch("/api/billing/subscription");
      const data = await response.json();
      setBillingData(data);
    } catch (error) {
      console.error("Error fetching billing data:", error);
    } finally {
      setLoading(false);
    }
  }

  function handlePlanSelection(planId: "plus" | "ultra") {
    setSelectedPlan(planId);
    setShowPaymentDialog(true);
  }

  async function handleSubscribe() {
    if (!selectedPlan) return;

    setSubscribing(selectedPlan);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan,
          provider: paymentProvider,
          billingInterval: "monthly",
        }),
      });

      if (!response.ok) throw new Error("Failed to create checkout session");

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error:", error);
      alert(t("errors.subscribeError"));
      setSubscribing(null);
      setShowPaymentDialog(false);
    }
  }

  const currentPlan = billingData?.plan || "free";

  const comparisonFeatures = [
    {
      category: "Core Features",
      features: [
        { name: "AI Agents", free: "3", plus: "10", ultra: "Unlimited" },
        { name: "Text Messages", free: "20/day", plus: "Unlimited", ultra: "Unlimited" },
        { name: "Voice Messages", free: "0", plus: "100/month", ultra: "500/month" },
        { name: "Virtual Worlds", free: "1", plus: "5", ultra: "Unlimited" },
        { name: "Image Analysis", free: "5/month", plus: "50/month", ultra: "200/month" },
        { name: "Image Generation", free: "0", plus: "20/month", ultra: "100/month" },
      ],
    },
    {
      category: "Content & Behaviors",
      features: [
        { name: "NSFW Content", free: false, plus: true, ultra: true },
        { name: "Advanced Behaviors", free: false, plus: true, ultra: true, info: "Yandere, BPD, NPD, etc." },
        { name: "Visual Novels", free: false, plus: true, ultra: true },
        { name: "Proactive Messages", free: "1/week", plus: "20/month", ultra: "Unlimited" },
      ],
    },
    {
      category: "Premium Features",
      features: [
        { name: "Voice Cloning", free: false, plus: false, ultra: true },
        { name: "Priority Generation", free: false, plus: false, ultra: true },
        { name: "API Access", free: false, plus: false, ultra: true },
        { name: "Export Conversations", free: false, plus: true, ultra: true },
      ],
    },
    {
      category: "Experience",
      features: [
        { name: "Ads", free: true, plus: false, ultra: false },
        { name: "Support", free: "Community", plus: "Email", ultra: "24/7 Priority" },
        { name: "Early Access", free: false, plus: false, ultra: true },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/billing")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-grow">
            <h1 className="text-4xl font-bold mb-2">{t("title")}</h1>
            <p className="text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Current Plan Badge */}
        {currentPlan !== "free" && (
          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
            {t("currentlyOn", { plan: PLANS[currentPlan as keyof typeof PLANS].name })}
          </Badge>
        )}

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {Object.entries(PLANS).map(([key, plan]) => (
            <PlanCard
              key={key}
              id={key}
              name={plan.name}
              description={plan.description}
              price={plan.price}
              interval="month"
              features={[...plan.features]}
              isCurrentPlan={currentPlan === key}
              isPopular={key === "plus"}
              onSelect={() => {
                if (key === "free") {
                  router.push("/dashboard");
                } else {
                  handlePlanSelection(key as "plus" | "ultra");
                }
              }}
              loading={subscribing === key}
            />
          ))}
        </div>

        {/* Detailed Comparison Table */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">{t("comparison.title")}</h2>
          <div className="space-y-8">
            {comparisonFeatures.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <h3 className="text-lg font-semibold mb-4 text-primary">
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="grid grid-cols-4 gap-4 py-3 border-b border-border/50 last:border-0"
                    >
                      <div className="col-span-1 flex items-center gap-2">
                        <span className="text-sm font-medium">{feature.name}</span>
                        {feature.info && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-3 h-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">{feature.info}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div className="flex items-center justify-center">
                        {typeof feature.free === "boolean" ? (
                          feature.free ? (
                            <X className="w-5 h-5 text-red-500" />
                          ) : (
                            <Check className="w-5 h-5 text-muted-foreground" />
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {feature.free}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-center">
                        {typeof feature.plus === "boolean" ? (
                          feature.plus ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground" />
                          )
                        ) : (
                          <span className="text-sm font-medium">{feature.plus}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-center">
                        {typeof feature.ultra === "boolean" ? (
                          feature.ultra ? (
                            <Check className="w-5 h-5 text-purple-500" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground" />
                          )
                        ) : (
                          <span className="text-sm font-medium">{feature.ultra}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* FAQ */}
        <Card className="p-8 bg-muted/50">
          <h2 className="text-2xl font-bold mb-6">{t("faq.title")}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{t("faq.changePlans.question")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("faq.changePlans.answer")}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t("faq.paymentMethods.question")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("faq.paymentMethods.answer")}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t("faq.freeTrial.question")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("faq.freeTrial.answer")}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t("faq.exceedLimits.question")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("faq.exceedLimits.answer")}
              </p>
            </div>
          </div>
        </Card>

        {/* Payment Method Selection Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Selecciona tu método de pago
              </DialogTitle>
              <DialogDescription>
                {selectedPlan && (
                  <>
                    Has elegido el plan{" "}
                    <span className="font-semibold text-foreground">
                      {PLANS[selectedPlan].name}
                    </span>{" "}
                    por{" "}
                    <span className="font-semibold text-foreground">
                      {paymentProvider === "mercadopago"
                        ? `$${PLANS[selectedPlan].price.toLocaleString()} ARS/mes`
                        : "$5 USD/mes (Plus) o $15 USD/mes (Ultra)"}
                    </span>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <PaymentMethodSelector
                value={paymentProvider}
                onChange={setPaymentProvider}
                userCountry="AR"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                disabled={subscribing !== null}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubscribe}
                disabled={subscribing !== null}
                className="flex-1"
              >
                {subscribing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Procesando...
                  </>
                ) : (
                  "Continuar al pago"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
