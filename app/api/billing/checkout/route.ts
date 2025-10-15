import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSubscriptionPreference } from "@/lib/mercadopago/subscription";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planId } = body;

    if (!planId || (planId !== "pro" && planId !== "enterprise")) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Crear preferencia de pago en Mercado Pago
    const checkoutUrl = await createSubscriptionPreference(
      session.user.id,
      session.user.email!,
      planId,
      session.user.name || undefined
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("Error creating Mercado Pago preference:", error);
    return NextResponse.json(
      { error: "Failed to create payment preference" },
      { status: 500 }
    );
  }
}
