"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CancelSubscriptionDialog } from "@/components/billing/CancelSubscriptionDialog";
import { UpgradeDialog } from "@/components/billing/UpgradeDialog";
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCcw,
} from "lucide-react";
import { motion } from "framer-motion";
import { PLANS } from "@/lib/mercadopago/config";

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
}

export default function ManageSubscriptionPage() {
  const router = useRouter();
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [reactivating, setReactivating] = useState(false);

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

  async function handleCancel(reason: string, feedback: string) {
    const response = await fetch("/api/billing/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, feedback }),
    });

    if (!response.ok) {
      throw new Error("Failed to cancel subscription");
    }

    // Refetch billing data
    await fetchBillingData();
  }

  async function handleReactivate() {
    setReactivating(true);
    try {
      const response = await fetch("/api/billing/cancel", {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to reactivate subscription");
      }

      // Refetch billing data
      await fetchBillingData();
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      alert("Failed to reactivate subscription");
    } finally {
      setReactivating(false);
    }
  }

  async function handleUpgrade(planId: "plus" | "ultra") {
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) throw new Error("Failed to create checkout session");

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error:", error);
      alert("Error al iniciar el proceso de pago");
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

  if (currentPlan === "free") {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/billing")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-grow">
              <h1 className="text-4xl font-bold mb-2">Manage Subscription</h1>
            </div>
          </div>

          <Card className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No Active Subscription</h3>
            <p className="text-muted-foreground mb-6">
              You're currently on the Free plan. Upgrade to unlock premium features!
            </p>
            <Button
              onClick={() => router.push("/dashboard/billing/plans")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              View Plans
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  const isTrialing = subscription?.trialEnd
    ? new Date(subscription.trialEnd) > new Date()
    : false;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
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
            <h1 className="text-4xl font-bold mb-2">Manage Subscription</h1>
            <p className="text-muted-foreground">
              Update your plan or cancel your subscription
            </p>
          </div>
        </div>

        {/* Current Plan */}
        <Card className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold">{planDetails.name} Plan</h2>
                <Badge
                  variant={
                    subscription?.cancelAtPeriodEnd
                      ? "destructive"
                      : isTrialing
                        ? "secondary"
                        : "default"
                  }
                  className={
                    subscription?.cancelAtPeriodEnd
                      ? ""
                      : isTrialing
                        ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                        : ""
                  }
                >
                  {subscription?.cancelAtPeriodEnd
                    ? "Cancelling"
                    : isTrialing
                      ? "Trial"
                      : "Active"}
                </Badge>
              </div>
              <p className="text-muted-foreground">{planDetails.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">${planDetails.price}</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
          </div>

          {subscription && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Calendar className="w-4 h-4" />
              <span>
                {subscription.cancelAtPeriodEnd
                  ? "Subscription ends on "
                  : "Next billing date: "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </span>
            </div>
          )}

          {/* Cancellation Warning */}
          {subscription?.cancelAtPeriodEnd && (
            <Card className="p-4 bg-orange-500/10 border-orange-500/20 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-grow">
                  <h4 className="font-semibold text-orange-600 mb-1">
                    Subscription Ending Soon
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your subscription will be cancelled at the end of the current
                    billing period. You'll still have access to premium features until
                    then.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReactivate}
                    disabled={reactivating}
                    className="border-orange-500/20 hover:bg-orange-500/10"
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    {reactivating ? "Reactivating..." : "Reactivate Subscription"}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            {currentPlan === "plus" && (
              <Button
                onClick={() => setUpgradeDialogOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Upgrade to Ultra
              </Button>
            )}
            {!subscription?.cancelAtPeriodEnd && (
              <Button
                variant="destructive"
                onClick={() => setCancelDialogOpen(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Subscription
              </Button>
            )}
          </div>
        </Card>

        {/* Plan Comparison */}
        <Card className="p-8">
          <h3 className="text-xl font-semibold mb-4">Available Plans</h3>
          <div className="space-y-4">
            {Object.entries(PLANS)
              .filter(([key]) => key !== "free")
              .map(([key, plan]) => {
                const isCurrent = currentPlan === key;
                const isUpgrade =
                  (currentPlan === "plus" && key === "ultra") ||
                  (currentPlan === "free" && key !== "free");

                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-4 border rounded-2xl ${
                      isCurrent ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{plan.name}</h4>
                        {isCurrent && (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold">${plan.price}</div>
                        <div className="text-xs text-muted-foreground">
                          per month
                        </div>
                      </div>
                      {!isCurrent && isUpgrade && (
                        <Button
                          onClick={() => handleUpgrade(key as "plus" | "ultra")}
                          size="sm"
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Upgrade
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </motion.div>

      {/* Dialogs */}
      <CancelSubscriptionDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onCancel={handleCancel}
        nextBillDate={subscription?.currentPeriodEnd}
      />

      <UpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        currentPlan={currentPlan as "free" | "plus" | "ultra"}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}
