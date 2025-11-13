import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSubscriptionPreference } from "@/lib/mercadopago/subscription";
import { createStripeCheckoutSession } from "@/lib/stripe/checkout";
import { billingLogger as log } from "@/lib/logging/loggers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planId, provider = "mercadopago", billingInterval = "monthly" } = body;

    // Validar planId
    if (!planId || (planId !== "plus" && planId !== "ultra")) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Validar provider
    if (provider !== "mercadopago" && provider !== "stripe") {
      return NextResponse.json({ error: "Invalid payment provider" }, { status: 400 });
    }

    log.info(
      { userId: session.user.id, planId, provider, billingInterval },
      "Creating checkout session"
    );

    let checkoutUrl: string;

    // Crear checkout según el proveedor seleccionado
    if (provider === "stripe") {
      // STRIPE CHECKOUT
      checkoutUrl = await createStripeCheckoutSession({
        userId: session.user.id,
        email: session.user.email!,
        planId: planId as "plus" | "ultra",
        billingInterval: billingInterval as "monthly" | "yearly",
      });

      log.info({ userId: session.user.id, provider: "stripe" }, "Stripe checkout created");
    } else {
      // MERCADOPAGO CHECKOUT
      checkoutUrl = await createSubscriptionPreference(
        session.user.id,
        session.user.email!,
        planId,
        session.user.name || undefined
      );

      log.info({ userId: session.user.id, provider: "mercadopago" }, "MercadoPago checkout created");
    }

    return NextResponse.json({
      url: checkoutUrl,
      provider
    });
  } catch (error: any) {
    log.error({ err: error }, "Error creating checkout session");
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        message: error.message
      },
      { status: 500 }
    );
  }
}
