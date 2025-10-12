import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/config";
import { syncSubscription } from "@/lib/stripe/subscription";
import { prisma } from "@/lib/prisma";

// Configuración para Next.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // Manejar eventos de Stripe
  try {
    switch (event.type) {
      // Suscripción creada
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      // Suscripción actualizada
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      // Suscripción eliminada
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      // Pago exitoso
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      // Pago fallido
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      // Checkout completado
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// Handlers para cada tipo de evento

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log("Subscription created:", subscription.id);
  await syncSubscription(subscription);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log("Subscription updated:", subscription.id);
  await syncSubscription(subscription);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("Subscription deleted:", subscription.id);

  const userId = subscription.metadata.userId;
  if (!userId) return;

  // Downgrade a plan free
  await prisma.user.update({
    where: { id: userId },
    data: { plan: "free" },
  });

  // Actualizar estado de suscripción
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: "canceled",
      canceledAt: new Date(),
    },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log("Invoice paid:", invoice.id);

  const subscriptionId = (invoice as any).subscription as string | undefined;
  if (!subscriptionId) return;

  // Buscar suscripción
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
    include: { user: true },
  });

  if (!subscription) return;

  // Crear o actualizar invoice en DB
  await prisma.invoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: {
      userId: subscription.userId,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: "paid",
      hostedUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
      paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
    },
    update: {
      status: "paid",
      hostedUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
      paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
    },
  });

  // Crear registro de pago
  const paymentIntentId = (invoice as any).payment_intent;
  if (paymentIntentId && typeof paymentIntentId === 'string') {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    await prisma.payment.create({
      data: {
        userId: subscription.userId,
        stripePaymentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        paymentMethod: paymentIntent.payment_method_types[0],
      },
    });
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log("Invoice payment failed:", invoice.id);

  const subscriptionId = (invoice as any).subscription as string | undefined;
  if (!subscriptionId) return;

  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
    include: { user: true },
  });

  if (!subscription) return;

  // Actualizar invoice
  await prisma.invoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: {
      userId: subscription.userId,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: "uncollectible",
      hostedUrl: invoice.hosted_invoice_url,
    },
    update: {
      status: "uncollectible",
    },
  });

  // TODO: Enviar email de notificación al usuario
  console.log(
    `Payment failed for user ${subscription.user.email}. Sending notification...`
  );
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("Checkout completed:", session.id);

  const userId = session.metadata?.userId;
  if (!userId) return;

  // Obtener suscripción
  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    await syncSubscription(subscription);
  }

  // TODO: Enviar email de bienvenida
  console.log(`Checkout completed for user ${userId}. Sending welcome email...`);
}
