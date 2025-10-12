import { NextRequest, NextResponse } from "next/server";
import { preApprovalClient, paymentClient } from "@/lib/mercadopago/config";
import { syncSubscription } from "@/lib/mercadopago/subscription";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log("Mercado Pago webhook received:", body);

    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    switch (type) {
      case "preapproval":
        await handlePreApprovalEvent(data.id);
        break;

      case "payment":
        await handlePaymentEvent(data.id);
        break;

      case "subscription_preapproval":
        await handleSubscriptionEvent(data.id);
        break;

      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Mercado Pago webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePreApprovalEvent(preapprovalId: string) {
  try {
    const preapproval = await preApprovalClient.get({ id: preapprovalId });
    
    console.log("PreApproval event:", preapproval);

    await syncSubscription(preapproval);

    if (preapproval.status === "cancelled") {
      const userId = preapproval.external_reference;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { plan: "free" },
        });
      }
    }
  } catch (error) {
    console.error("Error handling preapproval event:", error);
  }
}

async function handlePaymentEvent(paymentId: string) {
  try {
    const payment = await paymentClient.get({ id: paymentId });
    
    console.log("Payment event:", payment);

    if (!payment.external_reference) return;

    const userId = payment.external_reference;

    await prisma.payment.upsert({
      where: { mercadopagoPaymentId: String(payment.id) },
      create: {
        userId,
        mercadopagoPaymentId: String(payment.id),
        amount: payment.transaction_amount || 0,
        currency: payment.currency_id || "ARS",
        status: payment.status || "pending",
        statusDetail: payment.status_detail || null,
        paymentMethod: payment.payment_type_id || null,
      },
      update: {
        status: payment.status || "pending",
        statusDetail: payment.status_detail || null,
      },
    });

    if (payment.status === "approved" && payment.transaction_amount) {
      await prisma.invoice.create({
        data: {
          userId,
          mercadopagoPaymentId: String(payment.id),
          amount: payment.transaction_amount,
          currency: payment.currency_id || "ARS",
          status: "approved",
          paidAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error("Error handling payment event:", error);
  }
}

async function handleSubscriptionEvent(subscriptionId: string) {
  try {
    const preapproval = await preApprovalClient.get({ id: subscriptionId });
    
    console.log("Subscription event:", preapproval);

    await syncSubscription(preapproval);
  } catch (error) {
    console.error("Error handling subscription event:", error);
  }
}
