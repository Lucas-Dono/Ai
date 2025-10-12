import { preApprovalClient, customerClient, PLANS, MERCADOPAGO_URLS } from "./config";
import { prisma } from "@/lib/prisma";

// Crear o recuperar cliente de Mercado Pago
export async function getOrCreateMercadoPagoCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  // Buscar usuario en DB
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mercadopagoCustomerId: true },
  });

  // Si ya tiene customer ID, retornarlo
  if (user?.mercadopagoCustomerId) {
    return user.mercadopagoCustomerId;
  }

  // Crear nuevo customer en Mercado Pago
  const customer = await customerClient.create({
    body: {
      email,
      first_name: name || "Usuario",
      description: `Cliente ${email}`,
    },
  });

  // Guardar customer ID en DB
  await prisma.user.update({
    where: { id: userId },
    data: { mercadopagoCustomerId: customer.id },
  });

  return customer.id!;
}

// Crear preferencia de pago para suscripción
export async function createSubscriptionPreference(
  userId: string,
  email: string,
  planId: "pro" | "enterprise",
  name?: string
): Promise<string> {
  const customerId = await getOrCreateMercadoPagoCustomer(userId, email, name);
  const plan = PLANS[planId];

  const preapproval = await preApprovalClient.create({
    body: {
      payer_email: email,
      back_url: MERCADOPAGO_URLS.success,
      reason: `Suscripción ${plan.name} - Creador de Inteligencias`,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: plan.price,
        currency_id: plan.currency,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 año
      },
      external_reference: userId,
      notification_url: MERCADOPAGO_URLS.notification,
      status: "pending",
    },
  });

  return preapproval.init_point!;
}

// Cancelar suscripción
export async function cancelSubscription(
  preapprovalId: string
): Promise<void> {
  await preApprovalClient.update({
    id: preapprovalId,
    body: {
      status: "cancelled",
    },
  });

  // Actualizar en DB
  await prisma.subscription.update({
    where: { mercadopagoPreapprovalId: preapprovalId },
    data: {
      status: "cancelled",
      canceledAt: new Date(),
    },
  });
}

// Pausar suscripción
export async function pauseSubscription(
  preapprovalId: string
): Promise<void> {
  await preApprovalClient.update({
    id: preapprovalId,
    body: {
      status: "paused",
    },
  });

  await prisma.subscription.update({
    where: { mercadopagoPreapprovalId: preapprovalId },
    data: {
      status: "paused",
    },
  });
}

// Reactivar suscripción
export async function reactivateSubscription(
  preapprovalId: string
): Promise<void> {
  await preApprovalClient.update({
    id: preapprovalId,
    body: {
      status: "authorized",
    },
  });

  await prisma.subscription.update({
    where: { mercadopagoPreapprovalId: preapprovalId },
    data: {
      status: "active",
      canceledAt: null,
    },
  });
}

// Sincronizar suscripción desde Mercado Pago a DB
export async function syncSubscription(
  preapprovalData: any
): Promise<void> {
  const userId = preapprovalData.external_reference;
  if (!userId) {
    console.error("No userId in preapproval external_reference");
    return;
  }

  // Determinar el plan basado en el monto
  let planId = "pro";
  if (preapprovalData.auto_recurring?.transaction_amount >= PLANS.enterprise.price) {
    planId = "enterprise";
  }

  // Actualizar plan del usuario
  await prisma.user.update({
    where: { id: userId },
    data: { plan: planId },
  });

  // Crear o actualizar suscripción en DB
  await prisma.subscription.upsert({
    where: { mercadopagoPreapprovalId: preapprovalData.id },
    create: {
      userId,
      mercadopagoPreapprovalId: preapprovalData.id,
      status: preapprovalData.status,
      currentPeriodStart: new Date(preapprovalData.date_created),
      currentPeriodEnd: new Date(preapprovalData.auto_recurring?.end_date || Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
    },
    update: {
      status: preapprovalData.status,
      currentPeriodEnd: new Date(preapprovalData.auto_recurring?.end_date || Date.now() + 30 * 24 * 60 * 60 * 1000),
      canceledAt: preapprovalData.status === "cancelled" ? new Date() : null,
    },
  });
}

// Obtener suscripción activa del usuario
export async function getUserSubscription(userId: string) {
  return await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ["active", "authorized"] },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Verificar si usuario tiene suscripción activa
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  return !!subscription;
}

// Obtener detalles de la suscripción desde Mercado Pago
export async function getSubscriptionDetails(preapprovalId: string) {
  try {
    const preapproval = await preApprovalClient.get({ id: preapprovalId });
    return preapproval;
  } catch (error) {
    console.error("Error fetching subscription details:", error);
    return null;
  }
}
