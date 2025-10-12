import Stripe from "stripe";

// Inicializar Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
  typescript: true,
});

// Planes de suscripción
export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    description: "Perfect for trying out the platform",
    price: 0,
    interval: "month" as const,
    features: [
      "2 AI agents",
      "100 messages per month",
      "Basic emotional intelligence",
      "1 virtual world",
      "Email support",
    ],
    limits: {
      agents: 2,
      messages: 100,
      worlds: 1,
      tokensPerMessage: 1000,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "For power users and professionals",
    price: 29,
    interval: "month" as const,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID!,
    stripeProductId: process.env.STRIPE_PRO_PRODUCT_ID!,
    features: [
      "20 AI agents",
      "5,000 messages per month",
      "Advanced emotional intelligence",
      "Unlimited virtual worlds",
      "Voice & personality customization",
      "Export conversations",
      "Priority support",
      "API access",
    ],
    limits: {
      agents: 20,
      messages: 5000,
      worlds: -1, // unlimited
      tokensPerMessage: 4000,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "For teams and organizations",
    price: 99,
    interval: "month" as const,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    stripeProductId: process.env.STRIPE_ENTERPRISE_PRODUCT_ID!,
    features: [
      "Unlimited AI agents",
      "Unlimited messages",
      "Enterprise-grade security",
      "SSO & SAML authentication",
      "Team collaboration",
      "White-label options",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    limits: {
      agents: -1, // unlimited
      messages: -1, // unlimited
      worlds: -1, // unlimited
      tokensPerMessage: 8000,
    },
  },
} as const;

export type PlanId = keyof typeof PLANS;

// Verificar si un plan tiene una feature
export function hasPlanFeature(planId: PlanId, feature: string): boolean {
  return (PLANS[planId].features as readonly string[]).includes(feature);
}

// Obtener límite de un recurso
export function getPlanLimit(
  planId: PlanId,
  resource: keyof (typeof PLANS)[PlanId]["limits"]
): number {
  return PLANS[planId].limits[resource];
}

// Verificar si un usuario puede crear un recurso
export function canCreateResource(
  planId: PlanId,
  resource: keyof (typeof PLANS)[PlanId]["limits"],
  currentCount: number
): boolean {
  const limit = getPlanLimit(planId, resource);
  if (limit === -1) return true; // unlimited
  return currentCount < limit;
}

// Formatear precio
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

// URLs de Stripe
export const STRIPE_URLS = {
  success: `${process.env.NEXTAUTH_URL}/dashboard/billing/success`,
  cancel: `${process.env.NEXTAUTH_URL}/pricing`,
  portal: `${process.env.NEXTAUTH_URL}/dashboard/billing`,
};
