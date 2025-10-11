"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Building2, ArrowRight } from "lucide-react";
import { PLANS } from "@/lib/stripe/config";
import { motion } from "framer-motion";

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">(
    "month"
  );

  const handleSubscribe = async (planId: "pro" | "enterprise") => {
    setLoading(planId);
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
      setLoading(null);
    }
  };

  const plans = [
    {
      ...PLANS.free,
      icon: Sparkles,
      color: "from-gray-600 to-gray-800",
      popular: false,
    },
    {
      ...PLANS.pro,
      icon: Zap,
      color: "from-blue-600 to-purple-600",
      popular: true,
    },
    {
      ...PLANS.enterprise,
      icon: Building2,
      color: "from-purple-600 to-pink-600",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge
            variant="secondary"
            className="mb-4 bg-primary/10 text-primary border-primary/20"
          >
            Pricing
          </Badge>
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and scale as you grow. All plans include 14-day trial.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span
              className={`text-sm ${billingInterval === "month" ? "text-primary font-semibold" : "text-muted-foreground"}`}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBillingInterval(billingInterval === "month" ? "year" : "month")
              }
              className="relative w-16 h-8 bg-muted rounded-full transition-colors hover:bg-muted/80"
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-primary rounded-full transition-transform ${
                  billingInterval === "year" ? "translate-x-8" : ""
                }`}
              />
            </button>
            <span
              className={`text-sm ${billingInterval === "year" ? "text-primary font-semibold" : "text-muted-foreground"}`}
            >
              Yearly{" "}
              <Badge variant="secondary" className="ml-1 bg-green-500/10 text-green-600">
                Save 20%
              </Badge>
            </span>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const monthlyPrice = plan.price;
            const yearlyPrice = Math.floor(plan.price * 12 * 0.8);
            const displayPrice =
              billingInterval === "month" ? monthlyPrice : yearlyPrice / 12;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <Card
                  className={`p-8 h-full flex flex-col ${
                    plan.popular
                      ? "border-primary shadow-xl shadow-primary/20 scale-105"
                      : "border-border"
                  }`}
                >
                  {/* Header */}
                  <div className="mb-6">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold">
                        ${displayPrice.toFixed(0)}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {billingInterval === "year" && plan.price > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        ${yearlyPrice} billed annually
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="mb-6">
                    {plan.id === "free" ? (
                      <Button
                        onClick={() => router.push("/dashboard")}
                        variant="outline"
                        className="w-full"
                      >
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          handleSubscribe(plan.id as "pro" | "enterprise")
                        }
                        disabled={loading !== null}
                        className={`w-full ${
                          plan.popular
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            : ""
                        }`}
                      >
                        {loading === plan.id
                          ? "Loading..."
                          : `Start ${plan.id === "pro" ? "Pro" : "Enterprise"} Trial`}
                        {loading !== plan.id && (
                          <ArrowRight className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 flex-grow">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0 mt-0.5`}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">
                Can I change plans later?
              </h3>
              <p className="text-sm text-muted-foreground">
                Yes! You can upgrade, downgrade, or cancel your subscription at
                any time from your billing dashboard.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards (Visa, Mastercard, American
                Express) and bank transfers for Enterprise plans.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! Pro and Enterprise plans include a 14-day free trial. No
                credit card required to start.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">What happens after my trial ends?</h3>
              <p className="text-sm text-muted-foreground">
                You'll be charged automatically unless you cancel. You can
                cancel anytime during the trial period.
              </p>
            </Card>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-20 text-center"
        >
          <Card className="p-12 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border-primary/20">
            <h2 className="text-3xl font-bold mb-4">
              Ready to create your AI agents?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join hundreds of creators building the future of AI interactions.
              Start free, no credit card required.
            </p>
            <Button
              size="lg"
              onClick={() => router.push("/dashboard")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
