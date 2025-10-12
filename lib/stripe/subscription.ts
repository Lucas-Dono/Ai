import { stripe, PLANS, STRIPE_URLS } from "./config";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// Crear o recuperar cliente de Stripe
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  // Buscar usuario en DB
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  // Si ya tiene customer ID, retornarlo
  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Crear nuevo customer en Stripe
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId,
    },
  });

  // Guardar customer ID en DB
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

// Crear sesión de checkout
export async function createCheckoutSession(
  userId: string,
  email: string,
  planId: "pro" | "enterprise",
  name?: string
): Promise<string> {
  const customerId = await getOrCreateStripeCustomer(userId, email, name);
  const plan = PLANS[planId];

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    billing_address_collection: "auto",
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 14, // 14 días de trial
      metadata: {
        userId,
        planId,
      },
    },
    success_url: STRIPE_URLS.success + "?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: STRIPE_URLS.cancel,
    metadata: {
      userId,
      planId,
    },
  });

  return session.url!;
}

// Crear portal de cliente
export async function createCustomerPortalSession(
  userId: string
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    throw new Error("User has no Stripe customer ID");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: STRIPE_URLS.portal,
  });

  return session.url;
}

// Cancelar suscripción
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd = true
): Promise<void> {
  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: cancelAtPeriodEnd,
  });

  // Actualizar en DB
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      cancelAtPeriodEnd,
      canceledAt: cancelAtPeriodEnd ? new Date() : null,
    },
  });
}

// Reactivar suscripción
export async function reactivateSubscription(
  subscriptionId: string
): Promise<void> {
  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      cancelAtPeriodEnd: false,
      canceledAt: null,
    },
  });
}

// Sincronizar suscripción desde Stripe a DB
export async function syncSubscription(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = subscription.metadata.userId;
  if (!userId) {
    console.error("No userId in subscription metadata");
    return;
  }

  // Actualizar plan del usuario
  const planId = subscription.metadata.planId || "pro";
  await prisma.user.update({
    where: { id: userId },
    data: { plan: planId },
  });

  // Crear o actualizar suscripción en DB
  const sub = subscription as any;
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      userId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      stripeProductId: subscription.items.data[0].price.product as string,
      status: subscription.status,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      trialStart: sub.trial_start
        ? new Date(sub.trial_start * 1000)
        : null,
      trialEnd: sub.trial_end
        ? new Date(sub.trial_end * 1000)
        : null,
      canceledAt: sub.canceled_at
        ? new Date(sub.canceled_at * 1000)
        : null,
    },
    update: {
      status: subscription.status,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      trialStart: sub.trial_start
        ? new Date(sub.trial_start * 1000)
        : null,
      trialEnd: sub.trial_end
        ? new Date(sub.trial_end * 1000)
        : null,
      canceledAt: sub.canceled_at
        ? new Date(sub.canceled_at * 1000)
        : null,
    },
  });
}

// Obtener suscripción activa del usuario
export async function getUserSubscription(userId: string) {
  return await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ["active", "trialing"] },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Verificar si usuario tiene suscripción activa
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  return !!subscription;
}
