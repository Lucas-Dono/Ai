/**
 * STRIPE SUBSCRIPTION SYNC SERVICE
 *
 * Sincroniza el estado de suscripciones de Stripe con la base de datos local
 */

import { prisma } from "@/lib/prisma";
import { stripe, getPlanFromPriceId } from "./config";
import { billingLogger as log } from "@/lib/logging/loggers";
import type Stripe from "stripe";

/**
 * Sincroniza una suscripción de Stripe con la BD local
 */
export async function syncStripeSubscription(
  subscription: Stripe.Subscription
): Promise<void> {
  try {
    const userId = subscription.metadata.userId;

    if (!userId) {
      log.error(
        { subscriptionId: subscription.id },
        "Subscription missing userId metadata"
      );
      return;
    }

    log.info(
      {
        subscriptionId: subscription.id,
        userId,
        status: subscription.status,
      },
      "Syncing Stripe subscription"
    );

    // Determinar el plan basado en el price_id
    const priceId = subscription.items.data[0]?.price.id;
    const plan = priceId ? getPlanFromPriceId(priceId) : null;

    if (!plan) {
      log.warn(
        { subscriptionId: subscription.id, priceId },
        "Could not determine plan from price ID"
      );
      return;
    }

    // Actualizar o crear suscripción en BD
    await prisma.subscription.upsert({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      create: {
        userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        status: subscription.status,
        priceId,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
        trialStart: (subscription as any).trial_start
          ? new Date((subscription as any).trial_start * 1000)
          : null,
        trialEnd: (subscription as any).trial_end
          ? new Date((subscription as any).trial_end * 1000)
          : null,
        canceledAt: (subscription as any).canceled_at
          ? new Date((subscription as any).canceled_at * 1000)
          : null,
        metadata: subscription.metadata as any,
      },
      update: {
        status: subscription.status,
        priceId,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
        canceledAt: (subscription as any).canceled_at
          ? new Date((subscription as any).canceled_at * 1000)
          : null,
        metadata: subscription.metadata as any,
      },
    });

    // Actualizar plan del usuario según el estado de la suscripción
    const shouldHavePremiumAccess =
      subscription.status === "active" || subscription.status === "trialing";

    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: shouldHavePremiumAccess ? plan : "free",
        stripeCustomerId: subscription.customer as string,
      },
    });

    log.info(
      {
        userId,
        plan: shouldHavePremiumAccess ? plan : "free",
        status: subscription.status,
      },
      "Subscription synced successfully"
    );
  } catch (error) {
    log.error(
      { err: error, subscriptionId: subscription.id },
      "Error syncing subscription"
    );
    throw error;
  }
}

/**
 * Maneja la cancelación de una suscripción
 */
export async function handleSubscriptionCancellation(
  subscription: Stripe.Subscription
): Promise<void> {
  try {
    const userId = subscription.metadata.userId;

    if (!userId) {
      log.error(
        { subscriptionId: subscription.id },
        "Cancelled subscription missing userId"
      );
      return;
    }

    log.info(
      {
        subscriptionId: subscription.id,
        userId,
      },
      "Handling subscription cancellation"
    );

    // Actualizar suscripción en BD
    await prisma.subscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        status: "cancelled",
        canceledAt: new Date(),
      },
    });

    // Downgrade a free
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: "free",
      },
    });

    log.info({ userId }, "User downgraded to free plan");
  } catch (error) {
    log.error(
      { err: error, subscriptionId: subscription.id },
      "Error handling cancellation"
    );
    throw error;
  }
}

/**
 * Maneja renovación exitosa de suscripción
 */
export async function handleSubscriptionRenewal(
  invoice: Stripe.Invoice
): Promise<void> {
  try {
    const subscriptionId = (invoice as any).subscription as string;
    const userId = invoice.metadata?.userId;

    if (!userId) {
      log.warn({ invoiceId: invoice.id }, "Invoice missing userId metadata");
      return;
    }

    log.info(
      {
        invoiceId: invoice.id,
        subscriptionId,
        userId,
      },
      "Handling subscription renewal"
    );

    // Registrar el pago en BD
    await prisma.invoice.create({
      data: {
        userId,
        stripeInvoiceId: invoice.id,
        stripePaymentIntentId: (invoice as any).payment_intent as string,
        amount: (invoice as any).amount_paid,
        currency: invoice.currency,
        status: "paid",
        paidAt: (invoice as any).status_transitions?.paid_at
          ? new Date((invoice as any).status_transitions.paid_at * 1000)
          : new Date(),
      },
    });

    log.info({ userId, amount: (invoice as any).amount_paid }, "Renewal invoice created");
  } catch (error) {
    log.error({ err: error, invoiceId: invoice.id }, "Error handling renewal");
    throw error;
  }
}

/**
 * Maneja fallo de pago
 */
export async function handlePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  try {
    const userId = invoice.metadata?.userId;
    const subscriptionId = (invoice as any).subscription as string;

    if (!userId) {
      log.warn({ invoiceId: invoice.id }, "Failed invoice missing userId");
      return;
    }

    log.warn(
      {
        invoiceId: invoice.id,
        subscriptionId,
        userId,
        attempt: (invoice as any).attempt_count,
      },
      "Payment failed"
    );

    // Registrar el intento fallido
    await prisma.invoice.create({
      data: {
        userId,
        stripeInvoiceId: invoice.id,
        stripePaymentIntentId: (invoice as any).payment_intent as string,
        amount: (invoice as any).amount_due,
        currency: invoice.currency,
        status: "payment_failed",
        statusDetail: `Attempt ${(invoice as any).attempt_count}: Payment failed`,
      },
    });

    // Si ya hubo 3 intentos fallidos, considerar suspender
    if ((invoice as any).attempt_count && (invoice as any).attempt_count >= 3) {
      log.error(
        { userId, subscriptionId },
        "Payment failed 3 times - subscription will be cancelled by Stripe"
      );
      // Stripe automáticamente cancela después de 3 fallos, solo logeamos
    }
  } catch (error) {
    log.error(
      { err: error, invoiceId: invoice.id },
      "Error handling payment failure"
    );
    throw error;
  }
}

/**
 * Detecta el tipo de cambio en una suscripción (upgrade/downgrade/reactivation)
 */
export function detectSubscriptionChange(
  oldSubscription: Stripe.Subscription | null,
  newSubscription: Stripe.Subscription
): "upgrade" | "downgrade" | "reactivation" | "changed" | null {
  if (!oldSubscription) {
    return null; // Nueva suscripción
  }

  // Reactivación de suscripción cancelada
  if (
    oldSubscription.status === "canceled" &&
    newSubscription.status === "active"
  ) {
    return "reactivation";
  }

  // Cambio de precio (upgrade/downgrade)
  const oldPriceId = oldSubscription.items.data[0]?.price.id;
  const newPriceId = newSubscription.items.data[0]?.price.id;

  if (oldPriceId !== newPriceId) {
    const oldPlan = oldPriceId ? getPlanFromPriceId(oldPriceId) : null;
    const newPlan = newPriceId ? getPlanFromPriceId(newPriceId) : null;

    if (oldPlan === "plus" && newPlan === "ultra") {
      return "upgrade";
    }
    if (oldPlan === "ultra" && newPlan === "plus") {
      return "downgrade";
    }
  }

  return "changed";
}
