"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Users,
  MessageSquare,
  Globe2,
  Mic,
  Image as ImageIcon,
  FileText,
  ArrowRight,
} from "lucide-react";
import { PLANS } from "@/lib/mercadopago/config";
import { UsageMetrics, UsageMetricsSkeleton } from "@/components/billing/UsageMetrics";
import { UsageCostTracker } from "@/components/billing/UsageCostTracker";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface Subscription {
  id: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
}

interface BillingData {
  plan: string;
  subscription: Subscription | null;
  hasMercadoPagoCustomer: boolean;
}

interface UsageStats {
  agents: { current: number; limit: number };
  tokens: {
    tokensUsedToday: number;
    tokenLimitToday: number;
    tokensUsedWeekly: number;
    tokenLimitWeekly: number;
    messagesUsedToday: number;
    messageLimitToday: number;
    messagesUsedWeekly: number;
    messageLimitWeekly: number;
  };
  worlds: { current: number; limit: number };
  voiceMessages: { current: number; limit: number; currentDaily?: number; dailyLimit?: number };
  imageAnalysis: { current: number; limit: number; currentDaily?: number; dailyLimit?: number };
  imageGeneration: { current: number; limit: number };
}

export default function BillingPage() {
  const router = useRouter();
  const t = useTranslations("billing");
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  useEffect(() => {
    fetchBillingData();
    fetchUsageStats();
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

  async function fetchUsageStats() {
    try {
      const response = await fetch("/api/billing/usage");
      const data = await response.json();
      setUsageStats(data);
    } catch (error) {
      console.error("Error fetching usage stats:", error);
    }
  }

  async function openCustomerPortal() {
    setPortalLoading(true);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error opening portal:", error);
      alert(t("errors.portalError"));
      setPortalLoading(false);
    }
  }

  // PHASE 5: Updated to use unified checkout endpoint
  async function handleUpgrade(planId: "plus" | "ultra") {
    try {
      const response = await fetch("/api/billing/checkout-unified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          interval: "monthly",
        }),
      });

      if (!response.ok) throw new Error("Failed to create checkout session");

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error:", error);
      alert(t("errors.checkoutError"));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPlan = billingData?.plan || "free";
  const planDetails = PLANS[currentPlan as keyof typeof PLANS];
  const subscription = billingData?.subscription;

  const isTrialing = subscription?.trialEnd
    ? new Date(subscription.trialEnd) > new Date()
    : false;
  const trialDaysLeft = subscription?.trialEnd
    ? Math.ceil(
        (new Date(subscription.trialEnd).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        {/* Trial Alert */}
        {isTrialing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-6 bg-blue-500/10 border-blue-500/20 hover-lift-glow">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-grow">
                  <h3 className="font-semibold text-blue-600 mb-1">
                    {t("trial.active")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("trial.daysLeft", { days: trialDaysLeft })}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Cancellation Alert */}
        {subscription?.cancelAtPeriodEnd && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-6 bg-orange-500/10 border-orange-500/20 hover-lift-glow">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-grow">
                  <h3 className="font-semibold text-orange-600 mb-1">
                    {t("cancellation.title")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("cancellation.message", {
                      date: new Date(subscription.currentPeriodEnd).toLocaleDateString()
                    })}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Current Plan Card - PHASE 5: Improved with MD3 design */}
        <Card className="p-8 hover-lift-glow bg-gradient-to-br from-primary/5 via-purple-500/5 to-transparent"
>
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold">{t("currentPlan.title", { plan: planDetails?.name })}</h2>
                <Badge
                  variant={
                    subscription?.status === "active" ? "default" : "secondary"
                  }
                  className="capitalize"
                >
                  {subscription?.status || "free"}
                </Badge>
              </div>
              <p className="text-muted-foreground">{planDetails?.description}</p>
            </div>
            {currentPlan !== "free" && (
              <div className="text-right">
                <div className="text-3xl font-bold">
                  ${planDetails?.price}
                </div>
                <div className="text-sm text-muted-foreground">{t("currentPlan.perMonth")}</div>
              </div>
            )}
          </div>

          {/* Plan Features */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {planDetails?.features.slice(0, 4).map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            {currentPlan === "free" ? (
              <>
                <Button
                  onClick={() => setUpgradeDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  {t("currentPlan.actions.upgrade")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/billing/plans")}
                >
                  {t("currentPlan.actions.comparePlans")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={openCustomerPortal}
                  disabled={portalLoading}
                  variant="default"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {portalLoading ? t("currentPlan.actions.loading") : t("currentPlan.actions.manage")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/billing/plans")}
                >
                  {t("currentPlan.actions.comparePlans")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/billing/history")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {t("currentPlan.actions.history")}
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Subscription Details - PHASE 5: Improved design */}
        {subscription && (
          <Card className="p-8 hover-lift-glow">
            <h3 className="text-xl font-semibold mb-6">{t("subscriptionDetails.title")}</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{t("subscriptionDetails.nextBilling")}</span>
                </div>
                <div className="text-lg font-semibold">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">{t("subscriptionDetails.status")}</span>
                </div>
                <div className="text-lg font-semibold capitalize">
                  {subscription.status}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Usage Stats */}
        {usageStats ? (
          <UsageMetrics
            metrics={[
              {
                label: t("usage.agents"),
                current: usageStats.agents.current,
                limit: usageStats.agents.limit,
                icon: Users,
                color: "bg-blue-500",
              },
              {
                label: t("usage.messages", {
                  period: t("usage.today")
                }),
                current: usageStats.tokens.messagesUsedToday,
                limit: usageStats.tokens.messageLimitToday,
                icon: MessageSquare,
                color: "bg-green-500",
                // TOKEN-BASED: Mostrar tokens exactos y límite semanal
                unit: `(${usageStats.tokens.tokensUsedToday.toLocaleString()}/${usageStats.tokens.tokenLimitToday.toLocaleString()} tokens) · ${usageStats.tokens.messagesUsedWeekly}/${usageStats.tokens.messageLimitWeekly} esta semana`,
              },
              {
                label: t("usage.worlds"),
                current: usageStats.worlds.current,
                limit: usageStats.worlds.limit,
                icon: Globe2,
                color: "bg-purple-500",
              },
              // ANTI-ABUSE: Mostrar límites diarios para voz e imágenes (características costosas)
              ...(usageStats.voiceMessages.dailyLimit && usageStats.voiceMessages.dailyLimit > 0
                ? [
                    {
                      label: `${t("usage.voice")} (${t("usage.today")})`,
                      current: usageStats.voiceMessages.currentDaily || 0,
                      limit: usageStats.voiceMessages.dailyLimit,
                      icon: Mic,
                      color: "bg-orange-500",
                      unit: `/ ${usageStats.voiceMessages.current}/${usageStats.voiceMessages.limit} ${t("usage.thisMonth")}`,
                    },
                  ]
                : [
                    {
                      label: t("usage.voice"),
                      current: usageStats.voiceMessages.current,
                      limit: usageStats.voiceMessages.limit,
                      icon: Mic,
                      color: "bg-orange-500",
                      unit: t("usage.perMonth"),
                    },
                  ]),
              ...(usageStats.imageAnalysis.dailyLimit && usageStats.imageAnalysis.dailyLimit > 0
                ? [
                    {
                      label: `${t("usage.imageAnalysis")} (${t("usage.today")})`,
                      current: usageStats.imageAnalysis.currentDaily || 0,
                      limit: usageStats.imageAnalysis.dailyLimit,
                      icon: ImageIcon,
                      color: "bg-pink-500",
                      unit: `/ ${usageStats.imageAnalysis.current}/${usageStats.imageAnalysis.limit} ${t("usage.thisMonth")}`,
                    },
                  ]
                : [
                    {
                      label: t("usage.imageAnalysis"),
                      current: usageStats.imageAnalysis.current,
                      limit: usageStats.imageAnalysis.limit,
                      icon: ImageIcon,
                      color: "bg-pink-500",
                      unit: t("usage.perMonth"),
                    },
                  ]),
              {
                label: t("usage.imageGeneration"),
                current: usageStats.imageGeneration.current,
                limit: usageStats.imageGeneration.limit,
                icon: ImageIcon,
                color: "bg-indigo-500",
                unit: t("usage.perMonth"),
              },
            ]}
          />
        ) : (
          <UsageMetricsSkeleton />
        )}

        {/* PHASE 5: Real-time Cost Tracker with Refund Calculator */}
        {currentPlan !== "free" && <UsageCostTracker />}

        {/* Need Help - PHASE 5: Improved design */}
        <Card className="p-6 bg-muted/50 hover-lift-glow">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">{t("help.title")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("help.message", { email: "billing@creador-ia.com" }).split("billing@creador-ia.com")[0]}
                <a
                  href="mailto:billing@creador-ia.com"
                  className="text-primary hover:underline"
                >
                  billing@creador-ia.com
                </a>
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* PHASE 5: Upgrade Modal with MD3 design */}
      <UpgradeModal
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        currentPlan={currentPlan as "free" | "plus" | "ultra"}
        onUpgrade={handleUpgrade}
        context={{
          type: "voluntary",
          message: "Desbloquea todo el potencial de tu creatividad",
        }}
      />
    </div>
  );
}
