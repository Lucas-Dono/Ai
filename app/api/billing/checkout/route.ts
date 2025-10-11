import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe/subscription";

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

    const checkoutUrl = await createCheckoutSession(
      session.user.id,
      session.user.email!,
      planId,
      session.user.name || undefined
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
