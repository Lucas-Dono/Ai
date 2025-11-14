# Integración Frontend: Stripe Checkout

Guía para integrar Stripe Checkout en el frontend de la aplicación.

## 📋 Contenido

1. [Componente de Checkout](#componente-de-checkout)
2. [API Endpoint para crear sesión](#api-endpoint-para-crear-sesión)
3. [Manejo de Success/Cancel](#manejo-de-successcancel)
4. [Portal de Cliente](#portal-de-cliente)

---

## 🛒 Componente de Checkout

### 1. Instalar Stripe.js

Ya instalado en `package.json`:
```json
"@stripe/stripe-js": "^8.0.0"
```

### 2. Crear Componente de Pricing

```typescript
// components/pricing/PricingCard.tsx
"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface Plan {
  name: "plus" | "ultra";
  displayName: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
}

const PLANS: Plan[] = [
  {
    name: "plus",
    displayName: "Plan Plus",
    price: {
      monthly: 9.99,
      yearly: 99.90, // ~15% descuento
    },
    features: [
      "10 agentes",
      "1,000 mensajes/día",
      "Voz habilitada",
      "Generación de imágenes",
    ],
  },
  {
    name: "ultra",
    displayName: "Plan Ultra",
    price: {
      monthly: 29.99,
      yearly: 299.90,
    },
    features: [
      "Agentes ilimitados",
      "Mensajes ilimitados",
      "Voz habilitada",
      "Generación de imágenes",
      "Soporte prioritario",
    ],
  },
];

export function PricingCard({ plan }: { plan: Plan }) {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    try {
      setLoading(true);

      // 1. Crear Checkout Session en el backend
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: plan.name,
          billingInterval,
        }),
      });

      const { sessionId } = await response.json();

      // 2. Redirigir a Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe!.redirectToCheckout({ sessionId });

      if (error) {
        console.error("Stripe checkout error:", error);
        alert("Error al iniciar checkout. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Error al procesar el pago. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const price = plan.price[billingInterval];
  const pricePerMonth =
    billingInterval === "yearly" ? price / 12 : price;

  return (
    <div className="border rounded-lg p-6 shadow-lg">
      {/* Header */}
      <h3 className="text-2xl font-bold mb-2">{plan.displayName}</h3>

      {/* Precio */}
      <div className="mb-4">
        <span className="text-4xl font-bold">${price}</span>
        <span className="text-gray-600">
          /{billingInterval === "monthly" ? "mes" : "año"}
        </span>
        {billingInterval === "yearly" && (
          <div className="text-sm text-green-600 mt-1">
            ${pricePerMonth.toFixed(2)}/mes (¡ahorra 15%!)
          </div>
        )}
      </div>

      {/* Toggle Monthly/Yearly */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setBillingInterval("monthly")}
          className={`flex-1 py-2 px-4 rounded ${
            billingInterval === "monthly"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Mensual
        </button>
        <button
          onClick={() => setBillingInterval("yearly")}
          className={`flex-1 py-2 px-4 rounded ${
            billingInterval === "yearly"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Anual
        </button>
      </div>

      {/* Features */}
      <ul className="space-y-2 mb-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Procesando..." : "Comenzar Ahora"}
      </button>
    </div>
  );
}

// Página de Pricing
export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Elige el plan perfecto para ti
        </h1>
        <p className="text-gray-600">
          Cancela en cualquier momento. Sin permanencia.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {PLANS.map((plan) => (
          <PricingCard key={plan.name} plan={plan} />
        ))}
      </div>
    </div>
  );
}
```

---

## 🔧 API Endpoint para Crear Sesión

```typescript
// app/api/checkout/create-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PLANS } from "@/lib/stripe/config";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parsear request
    const { plan, billingInterval } = await req.json();

    if (!plan || !billingInterval) {
      return NextResponse.json(
        { error: "Missing plan or billingInterval" },
        { status: 400 }
      );
    }

    // 3. Obtener Price ID
    const priceId = STRIPE_PLANS[plan]?.[billingInterval];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // 4. Verificar si ya tiene customer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true, email: true },
    });

    // 5. Crear o reutilizar customer
    let customerId = user?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email || session.user.email!,
        metadata: {
          userId: session.user.id,
        },
      });
      customerId = customer.id;

      // Guardar customer ID
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // 6. Crear Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/pricing?canceled=true`,
      metadata: {
        userId: session.user.id,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
        },
        // Opcional: Trial de 7 días
        // trial_period_days: 7,
      },
      // Permitir códigos de descuento
      allow_promotion_codes: true,
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error: any) {
    console.error("Create checkout session error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## ✅ Páginas de Success/Cancel

### Success Page

```typescript
// app/checkout/success/page.tsx
import { Suspense } from "react";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutSuccess() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />

        <h1 className="text-3xl font-bold mb-4">
          ¡Suscripción Exitosa!
        </h1>

        <p className="text-gray-600 mb-8">
          Tu suscripción ha sido activada. Ya tienes acceso a todas las
          funcionalidades premium.
        </p>

        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700"
          >
            Ir al Dashboard
          </Link>

          <Link
            href="/agents"
            className="block w-full border border-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50"
          >
            Crear mi Primer Agente
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Recibirás un email de confirmación con los detalles de tu suscripción.
        </p>
      </div>
    </div>
  );
}
```

### Cancel Page (redirect a pricing)

```typescript
// app/pricing/page.tsx (modificar para mostrar mensaje)
export default function PricingPage({
  searchParams,
}: {
  searchParams: { canceled?: string };
}) {
  return (
    <div className="container mx-auto px-4 py-12">
      {searchParams.canceled && (
        <div className="max-w-2xl mx-auto mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Checkout cancelado. Si tienes alguna pregunta, no dudes en
            contactarnos.
          </p>
        </div>
      )}

      {/* ... resto del componente de pricing ... */}
    </div>
  );
}
```

---

## 🎛️ Portal de Cliente

Permite a usuarios gestionar su suscripción (actualizar tarjeta, cancelar, etc.)

### Componente del Portal

```typescript
// components/settings/BillingSettings.tsx
"use client";

import { useState } from "react";
import { CreditCard, ExternalLink } from "lucide-react";

export function BillingSettings({
  currentPlan,
}: {
  currentPlan: "free" | "plus" | "ultra";
}) {
  const [loading, setLoading] = useState(false);

  async function handleManageBilling() {
    try {
      setLoading(true);

      // Crear portal session
      const response = await fetch("/api/billing/create-portal-session", {
        method: "POST",
      });

      const { url } = await response.json();

      // Redirigir al portal
      window.location.href = url;
    } catch (error) {
      console.error("Portal error:", error);
      alert("Error al abrir el portal de facturación.");
    } finally {
      setLoading(false);
    }
  }

  if (currentPlan === "free") {
    return (
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Plan Actual</h3>
        <p className="text-gray-600 mb-4">Plan Free</p>
        <a
          href="/pricing"
          className="inline-flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Upgrade a Premium
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-2">Suscripción</h3>
      <p className="text-gray-600 mb-4">
        Plan {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
      </p>

      <button
        onClick={handleManageBilling}
        disabled={loading}
        className="inline-flex items-center gap-2 border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50"
      >
        <CreditCard className="w-4 h-4" />
        {loading ? "Cargando..." : "Gestionar Suscripción"}
      </button>

      <p className="text-sm text-gray-500 mt-4">
        Actualiza tu tarjeta, cambia de plan o cancela tu suscripción.
      </p>
    </div>
  );
}
```

### API Endpoint del Portal

```typescript
// app/api/billing/create-portal-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Obtener customer ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    // 3. Crear portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${req.headers.get("origin")}/settings/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error("Create portal session error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## 🔐 Variables de Entorno Frontend

```bash
# .env.local (Frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..." # o pk_live_ en producción
```

---

## 🎨 Ejemplo Completo de Flujo

```
1. Usuario visita /pricing
   ↓
2. Hace click en "Comenzar Ahora" (Plan Plus, Mensual)
   ↓
3. POST /api/checkout/create-session
   ↓
4. Backend:
   - Verifica sesión
   - Crea/obtiene customer
   - Crea checkout session
   - Retorna sessionId
   ↓
5. Frontend: stripe.redirectToCheckout({ sessionId })
   ↓
6. Stripe Checkout Page (hosted por Stripe)
   - Usuario ingresa datos de tarjeta
   - Stripe procesa pago
   ↓
7. Success:
   - Stripe: checkout.session.completed → Webhook
   - Webhook actualiza BD
   - Usuario redirigido a /checkout/success
   ↓
8. Usuario con acceso premium 🎉
```

---

## 📱 Responsive Design

```typescript
// Ejemplo de pricing responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {PLANS.map((plan) => (
    <PricingCard key={plan.name} plan={plan} />
  ))}
</div>
```

---

## 🎁 Códigos de Descuento

```typescript
// En create checkout session:
const checkoutSession = await stripe.checkout.sessions.create({
  // ...
  allow_promotion_codes: true, // ← Permite códigos de descuento
  // ...
});

// Crear códigos en Stripe Dashboard:
// Products → Coupons → Create coupon
// Ejemplo: LAUNCH20 = 20% off
```

---

## 🧪 Testing Frontend

```bash
# Usar tarjetas de test de Stripe:
# Visa: 4242 4242 4242 4242
# Expiry: cualquier fecha futura
# CVC: cualquier 3 dígitos
# ZIP: cualquier 5 dígitos

# Simular pagos fallidos:
# 4000 0000 0000 0002 → declined
```

---

## 📚 Referencias

- [Stripe Checkout Docs](https://stripe.com/docs/checkout)
- [Stripe.js Reference](https://stripe.com/docs/js)
- [Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Testing Cards](https://stripe.com/docs/testing)

---

**¡Listo para integrar pagos! 💳**
