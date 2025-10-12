import { MercadoPagoConfig, Payment, PreApproval, Customer } from "mercadopago";

// Inicializar Mercado Pago
export const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
  },
});

// Clientes de API
export const paymentClient = new Payment(mercadopago);
export const preApprovalClient = new PreApproval(mercadopago);
export const customerClient = new Customer(mercadopago);

// Planes de suscripción (precios en moneda local - ajustar según país)
export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    description: "Perfecto para probar la plataforma",
    price: 0,
    currency: "ARS",
    interval: "month" as const,
    features: [
      "2 agentes de IA",
      "100 mensajes por mes",
      "Inteligencia emocional básica",
      "1 mundo virtual",
      "Soporte por email",
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
    description: "Para usuarios avanzados y profesionales",
    price: 9900,
    currency: "ARS",
    interval: "month" as const,
    mercadopagoPreapprovalPlanId: process.env.MERCADOPAGO_PRO_PLAN_ID,
    features: [
      "20 agentes de IA",
      "5,000 mensajes por mes",
      "Inteligencia emocional avanzada",
      "Mundos virtuales ilimitados",
      "Personalización de voz y personalidad",
      "Exportar conversaciones",
      "Soporte prioritario",
      "Acceso a API",
    ],
    limits: {
      agents: 20,
      messages: 5000,
      worlds: -1,
      tokensPerMessage: 4000,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "Para equipos y organizaciones",
    price: 29900,
    currency: "ARS",
    interval: "month" as const,
    mercadopagoPreapprovalPlanId: process.env.MERCADOPAGO_ENTERPRISE_PLAN_ID,
    features: [
      "Agentes de IA ilimitados",
      "Mensajes ilimitados",
      "Seguridad de nivel empresarial",
      "Autenticación SSO y SAML",
      "Colaboración en equipo",
      "Opciones white-label",
      "Integraciones personalizadas",
      "Gerente de cuenta dedicado",
      "Garantía de SLA",
    ],
    limits: {
      agents: -1,
      messages: -1,
      worlds: -1,
      tokensPerMessage: 8000,
    },
  },
} as const;

export type PlanId = keyof typeof PLANS;

// Mapeo de monedas por país
export const CURRENCY_BY_COUNTRY = {
  AR: { currency: "ARS", symbol: "$", locale: "es-AR" },
  BR: { currency: "BRL", symbol: "R$", locale: "pt-BR" },
  CL: { currency: "CLP", symbol: "$", locale: "es-CL" },
  CO: { currency: "COP", symbol: "$", locale: "es-CO" },
  MX: { currency: "MXN", symbol: "$", locale: "es-MX" },
  PE: { currency: "PEN", symbol: "S/", locale: "es-PE" },
  UY: { currency: "UYU", symbol: "$", locale: "es-UY" },
} as const;

export function hasPlanFeature(planId: PlanId, feature: string): boolean {
  return (PLANS[planId].features as readonly string[]).includes(feature);
}

export function getPlanLimit(
  planId: PlanId,
  resource: keyof (typeof PLANS)[PlanId]["limits"]
): number {
  return PLANS[planId].limits[resource];
}

export function canCreateResource(
  planId: PlanId,
  resource: keyof (typeof PLANS)[PlanId]["limits"],
  currentCount: number
): boolean {
  const limit = getPlanLimit(planId, resource);
  if (limit === -1) return true;
  return currentCount < limit;
}

export function formatPrice(
  amount: number,
  countryCode: keyof typeof CURRENCY_BY_COUNTRY = "AR"
): string {
  const config = CURRENCY_BY_COUNTRY[countryCode];
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
  }).format(amount);
}

export const MERCADOPAGO_URLS = {
  success: `${process.env.NEXTAUTH_URL}/dashboard/billing/success`,
  failure: `${process.env.NEXTAUTH_URL}/dashboard/billing/failure`,
  pending: `${process.env.NEXTAUTH_URL}/dashboard/billing/pending`,
  notification: `${process.env.NEXTAUTH_URL}/api/webhooks/mercadopago`,
};
