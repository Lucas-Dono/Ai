import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserSubscription } from "@/lib/mercadopago/subscription";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Obtener suscripción del usuario
    const subscription = await getUserSubscription(session.user.id);

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Mercado Pago no tiene un portal de cliente como Stripe
    // Redirigir a la página de gestión de suscripciones de Mercado Pago
    const portalUrl = `https://www.mercadopago.com/subscriptions/${subscription.mercadopagoPreapprovalId}`;

    return NextResponse.json({
      url: portalUrl,
      message: "Manage your subscription through Mercado Pago"
    });
  } catch (error) {
    console.error("Error getting subscription portal:", error);
    return NextResponse.json(
      { error: "Failed to get subscription portal" },
      { status: 500 }
    );
  }
}
