"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Download,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { PLANS } from "@/lib/stripe/config";
import { motion } from "framer-motion";

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
  hasStripeCustomer: boolean;
}

export default function BillingPage() {
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

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
      alert("Error al abrir el portal de pagos");
      setPortalLoading(false);
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
          <h1 className="text-4xl font-bold mb-2">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing information
          </p>
        </div>

        {/* Trial Alert */}
        {isTrialing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-6 bg-blue-500/10 border-blue-500/20">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-grow">
                  <h3 className="font-semibold text-blue-600 mb-1">
                    Trial Period Active
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You have {trialDaysLeft} days left in your free trial. Your
                    card will be charged after the trial period ends.
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
            <Card className="p-6 bg-orange-500/10 border-orange-500/20">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-grow">
                  <h3 className="font-semibold text-orange-600 mb-1">
                    Subscription Ending
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your subscription will be canceled on{" "}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    . You'll be downgraded to the Free plan.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Current Plan Card */}
        <Card className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold">{planDetails?.name} Plan</h2>
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
                <div className="text-sm text-muted-foreground">per month</div>
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
              <Button
                onClick={() => (window.location.href = "/pricing")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
            ) : (
              <Button
                onClick={openCustomerPortal}
                disabled={portalLoading}
                variant="default"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {portalLoading ? "Loading..." : "Manage Subscription"}
              </Button>
            )}
          </div>
        </Card>

        {/* Subscription Details */}
        {subscription && (
          <Card className="p-8">
            <h3 className="text-xl font-semibold mb-6">Subscription Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Next Billing Date</span>
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
                  <span className="text-sm">Status</span>
                </div>
                <div className="text-lg font-semibold capitalize">
                  {subscription.status}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Usage Stats (Placeholder) */}
        <Card className="p-8">
          <h3 className="text-xl font-semibold mb-6">Current Usage</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-primary">
                {planDetails?.limits.agents === -1
                  ? "∞"
                  : `0 / ${planDetails?.limits.agents}`}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                AI Agents
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {planDetails?.limits.messages === -1
                  ? "∞"
                  : `0 / ${planDetails?.limits.messages}`}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Messages This Month
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {planDetails?.limits.worlds === -1
                  ? "∞"
                  : `0 / ${planDetails?.limits.worlds}`}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Virtual Worlds
              </div>
            </div>
          </div>
        </Card>

        {/* Need Help */}
        <Card className="p-6 bg-muted/50">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Need help?</h4>
              <p className="text-sm text-muted-foreground">
                If you have questions about billing or need to discuss
                Enterprise plans, please contact our support team at{" "}
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
    </div>
  );
}
