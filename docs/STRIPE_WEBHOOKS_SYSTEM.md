# Sistema de Webhooks de Stripe

Sistema completo de gestión de suscripciones mediante webhooks de Stripe, incluyendo manejo de eventos críticos, sincronización con base de datos, notificaciones por email y casos edge.

## 📋 Índice

1. [Arquitectura](#arquitectura)
2. [Eventos Manejados](#eventos-manejados)
3. [Configuración](#configuración)
4. [Seguridad](#seguridad)
5. [Flujo de Eventos](#flujo-de-eventos)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitectura

### Archivos del Sistema

```
lib/stripe/
├── config.ts                    # Configuración de Stripe y constantes
├── subscription-sync.ts         # Lógica de sincronización de suscripciones
└── email-notifications.ts       # Sistema de notificaciones por email

app/api/webhooks/stripe/
└── route.ts                     # Webhook handler principal

prisma/schema.prisma             # Modelos: Subscription, Invoice, WebhookEvent

__tests__/lib/stripe/
└── webhook-handler.test.ts      # Tests comprehensivos
```

### Componentes Principales

1. **Webhook Handler** (`app/api/webhooks/stripe/route.ts`)
   - Verifica firmas de Stripe
   - Implementa idempotencia
   - Enruta eventos a handlers específicos

2. **Subscription Sync** (`lib/stripe/subscription-sync.ts`)
   - Sincroniza estado de Stripe con BD local
   - Maneja upgrades/downgrades
   - Detecta cambios en suscripciones

3. **Email Notifications** (`lib/stripe/email-notifications.ts`)
   - Envía notificaciones a usuarios
   - Templates para cada tipo de evento
   - Integración con servicios de email

---

## 🔔 Eventos Manejados

### 1. `checkout.session.completed`
**Cuándo:** Nueva suscripción completada

**Acciones:**
- ✅ Crear/actualizar customer en Stripe
- ✅ Actualizar `user.plan` en BD
- ✅ Crear registro de suscripción
- ✅ Enviar email de bienvenida
- ✅ Activar features del tier

**Ejemplo:**
```typescript
{
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_abc123",
      customer: "cus_abc123",
      subscription: "sub_abc123",
      metadata: { userId: "user_123" }
    }
  }
}
```

### 2. `customer.subscription.updated`
**Cuándo:** Cambio en suscripción (upgrade/downgrade/reactivation)

**Acciones:**
- ✅ Detectar tipo de cambio (upgrade/downgrade/reactivation)
- ✅ Actualizar `user.plan` en BD
- ✅ Ajustar límites según nuevo tier
- ✅ Enviar email de confirmación

**Tipos de cambio:**
- **Upgrade:** Plus → Ultra
- **Downgrade:** Ultra → Plus
- **Reactivation:** Canceled → Active
- **Changed:** Otros cambios

### 3. `customer.subscription.deleted`
**Cuándo:** Suscripción cancelada

**Acciones:**
- ✅ Downgrade a plan `free`
- ✅ Mantener datos del usuario
- ✅ Deshabilitar features premium
- ✅ Enviar email de cancelación con incentivo

**Nota:** El acceso premium se mantiene hasta `current_period_end`

### 4. `invoice.payment_succeeded`
**Cuándo:** Pago exitoso (renovación mensual/anual)

**Acciones:**
- ✅ Confirmar renovación
- ✅ Crear registro de invoice
- ✅ Extender período de suscripción
- ✅ Enviar recibo por email

### 5. `invoice.payment_failed`
**Cuándo:** Pago fallido (tarjeta rechazada, fondos insuficientes, etc.)

**Acciones:**
- ✅ Registrar intento fallido
- ✅ Notificar al usuario inmediatamente
- ✅ Grace period de 3 intentos
- ✅ Después de 3 fallos → Stripe cancela automáticamente

**Grace Period:**
- Intento 1: Email de aviso
- Intento 2: Email urgente
- Intento 3: Email final antes de cancelación
- Stripe reintenta automáticamente cada ~24-48h

### 6. `customer.subscription.trial_will_end`
**Cuándo:** Trial termina en 3 días

**Acciones:**
- ✅ Notificar al usuario
- ✅ Recordar que comenzará el cobro
- ✅ Mostrar monto y fecha

---

## ⚙️ Configuración

### 1. Variables de Entorno

Agregar en `.env`:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY="sk_test_..." # o sk_live_ en producción
STRIPE_PUBLISHABLE_KEY="pk_test_..." # Usado en frontend
STRIPE_WEBHOOK_SECRET="whsec_..." # CRÍTICO para seguridad

# Stripe Price IDs (desde Dashboard → Products → Prices)
STRIPE_PLUS_MONTHLY_PRICE_ID="price_..."
STRIPE_PLUS_YEARLY_PRICE_ID="price_..."
STRIPE_ULTRA_MONTHLY_PRICE_ID="price_..."
STRIPE_ULTRA_YEARLY_PRICE_ID="price_..."
```

### 2. Configurar Webhook en Stripe

1. Ve a [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. URL: `https://tu-dominio.com/api/webhooks/stripe`
4. Selecciona eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
5. Copia el **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 3. Crear Productos en Stripe

```bash
# Plan Plus - Mensual
stripe products create --name="Plan Plus" --description="10 agentes, 1000 mensajes/día"
stripe prices create --product=prod_xxx --unit-amount=999 --currency=usd --recurring[interval]=month

# Plan Plus - Anual (con descuento)
stripe prices create --product=prod_xxx --unit-amount=9990 --currency=usd --recurring[interval]=year

# Plan Ultra - Mensual
stripe products create --name="Plan Ultra" --description="Agentes ilimitados, todo incluido"
stripe prices create --product=prod_yyy --unit-amount=2999 --currency=usd --recurring[interval]=month

# Plan Ultra - Anual
stripe prices create --product=prod_yyy --unit-amount=29990 --currency=usd --recurring[interval]=year
```

### 4. Migrar Base de Datos

```bash
# Generar migración
npx prisma migrate dev --name add_stripe_fields

# Aplicar en producción
npx prisma migrate deploy
```

---

## 🔒 Seguridad

### 1. Verificación de Firma

**CRÍTICO:** Todos los webhooks DEBEN verificar la firma de Stripe.

```typescript
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe/config";

const signature = headers().get("stripe-signature");
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  STRIPE_WEBHOOK_SECRET
);
// ✅ Si llega aquí, el webhook es legítimo
```

**Beneficios:**
- Previene webhooks falsos
- Evita ataques de replay
- Verifica integridad de datos

### 2. Idempotencia

**Problema:** Stripe puede enviar el mismo evento múltiples veces.

**Solución:** Usar `WebhookEvent` para tracking.

```typescript
const existingEvent = await prisma.webhookEvent.findUnique({
  where: { stripeEventId: event.id }
});

if (existingEvent) {
  return { received: true, skipped: true }; // ✅ Ya procesado
}

// Registrar evento
await prisma.webhookEvent.create({
  data: { stripeEventId: event.id, type: event.type }
});

// Procesar...

// Marcar como procesado
await prisma.webhookEvent.update({
  where: { stripeEventId: event.id },
  data: { processed: true, processedAt: new Date() }
});
```

### 3. Atomic Operations

**Problema:** Múltiples updates pueden causar inconsistencias.

**Solución:** Usar transacciones de Prisma cuando sea necesario.

```typescript
await prisma.$transaction([
  prisma.subscription.update({ ... }),
  prisma.user.update({ ... }),
  prisma.invoice.create({ ... })
]);
```

### 4. Metadata Validation

**Siempre incluir `userId` en metadata:**

```typescript
// ✅ CORRECTO
const session = await stripe.checkout.sessions.create({
  customer: customer.id,
  metadata: { userId: user.id }, // ← CRÍTICO
  // ...
});

// ❌ INCORRECTO
const session = await stripe.checkout.sessions.create({
  customer: customer.id,
  // Sin metadata → no podemos asociar al usuario
});
```

---

## 🔄 Flujo de Eventos

### Flujo 1: Nueva Suscripción

```
Usuario completa checkout
        ↓
Stripe: checkout.session.completed
        ↓
Webhook Handler
        ↓
┌─────────────────────────────────┐
│ 1. Verificar firma              │
│ 2. Check idempotencia           │
│ 3. Obtener suscripción completa │
└─────────────────────────────────┘
        ↓
syncStripeSubscription()
        ↓
┌─────────────────────────────────┐
│ 1. Crear/update Subscription    │
│ 2. Actualizar user.plan          │
│ 3. Guardar stripeCustomerId     │
└─────────────────────────────────┘
        ↓
sendWelcomeEmail()
        ↓
✅ Usuario tiene acceso premium
```

### Flujo 2: Pago Fallido

```
Renovación → Pago rechazado
        ↓
Stripe: invoice.payment_failed
        ↓
Webhook Handler
        ↓
handlePaymentFailed()
        ↓
┌─────────────────────────────────┐
│ 1. Registrar intento fallido    │
│ 2. Contar attempt_count          │
│ 3. Crear invoice con status fail │
└─────────────────────────────────┘
        ↓
sendPaymentFailedEmail()
        ↓
┌─────────────────────────────────┐
│ Intento 1: "Actualiza tu tarjeta"│
│ Intento 2: "Urgente - 1 intento" │
│ Intento 3: "Última oportunidad"  │
└─────────────────────────────────┘
        ↓
Si 3 fallos:
  Stripe: customer.subscription.deleted
        ↓
  Downgrade a free
```

### Flujo 3: Upgrade de Plan

```
Usuario cambia Plus → Ultra
        ↓
Stripe: customer.subscription.updated
        ↓
Webhook Handler
        ↓
┌─────────────────────────────────┐
│ 1. Obtener suscripción anterior │
│ 2. Detectar tipo de cambio       │
└─────────────────────────────────┘
        ↓
detectSubscriptionChange()
  → "upgrade"
        ↓
syncStripeSubscription()
        ↓
┌─────────────────────────────────┐
│ user.plan: "plus" → "ultra"     │
│ Límites actualizados             │
└─────────────────────────────────┘
        ↓
sendEmail({ type: "subscription_updated" })
        ↓
✅ Usuario tiene acceso Ultra
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Solo tests de Stripe
npm test webhook-handler.test

# Con coverage
npm test -- --coverage
```

### Test con Stripe CLI

Stripe CLI permite simular webhooks localmente:

```bash
# Instalar Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks a localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# En otra terminal, trigger eventos
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

### Tests Manuales en Dashboard

1. Ve a [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Selecciona tu endpoint
3. Click en **"Send test webhook"**
4. Elige el evento y click **"Send test webhook"**
5. Verifica logs y BD

---

## 🐛 Troubleshooting

### Webhook no se recibe

**Posibles causas:**
1. URL incorrecta en Stripe Dashboard
2. Firewall bloqueando requests de Stripe
3. HTTPS requerido en producción

**Solución:**
```bash
# Verificar que el endpoint responde
curl -X POST https://tu-dominio.com/api/webhooks/stripe

# Debe retornar error de firma (es normal):
# { "error": "Missing signature" }
```

### Error: "Invalid signature"

**Causa:** `STRIPE_WEBHOOK_SECRET` incorrecto o no configurado.

**Solución:**
1. Ve a Stripe Dashboard → Webhooks
2. Click en tu endpoint
3. Copia "Signing secret"
4. Actualiza `.env`: `STRIPE_WEBHOOK_SECRET="whsec_..."`
5. Reinicia servidor

### Evento procesado múltiples veces

**Causa:** Sistema de idempotencia no funcionando.

**Solución:**
```sql
-- Verificar eventos duplicados
SELECT "stripeEventId", COUNT(*)
FROM "WebhookEvent"
GROUP BY "stripeEventId"
HAVING COUNT(*) > 1;

-- Si hay duplicados, el problema está en la lógica de check
```

### Usuario no recibe email

**Causa:** Servicio de email no configurado (es solo un placeholder).

**Solución:**
```typescript
// Integrar servicio real en email-notifications.ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@tu-dominio.com',
  to: emailData.to,
  subject: emailContent.subject,
  html: emailContent.html,
});
```

### Plan no actualiza en BD

**Causa:** `metadata.userId` faltante en Stripe.

**Solución:**
```typescript
// Al crear checkout session, SIEMPRE incluir userId
const session = await stripe.checkout.sessions.create({
  customer: customer.id,
  metadata: { userId: user.id }, // ← CRÍTICO
  subscription_data: {
    metadata: { userId: user.id }, // ← También aquí
  },
  // ...
});
```

### Error: "Cannot read property 'id' of undefined"

**Causa:** Estructura de evento de Stripe cambió.

**Solución:**
```typescript
// Usar optional chaining
const priceId = subscription.items.data[0]?.price?.id;
if (!priceId) {
  log.error("Missing price ID in subscription");
  return;
}
```

---

## 📊 Monitoreo

### Métricas Importantes

1. **Webhook Success Rate**
   ```sql
   SELECT
     COUNT(*) FILTER (WHERE processed = true) * 100.0 / COUNT(*) as success_rate
   FROM "WebhookEvent"
   WHERE "createdAt" > NOW() - INTERVAL '24 hours';
   ```

2. **Failed Payments**
   ```sql
   SELECT COUNT(*)
   FROM "Invoice"
   WHERE status = 'payment_failed'
   AND "createdAt" > NOW() - INTERVAL '7 days';
   ```

3. **Churn Rate**
   ```sql
   SELECT COUNT(*)
   FROM "Subscription"
   WHERE status = 'cancelled'
   AND "canceledAt" > NOW() - INTERVAL '30 days';
   ```

### Logs

```typescript
// Todos los logs usan billingLogger
import { billingLogger as log } from "@/lib/logging/loggers";

log.info({ userId, plan }, "Subscription created");
log.warn({ attempt: 3 }, "Payment failed - final attempt");
log.error({ err }, "Webhook processing failed");
```

---

## 🚀 Deployment

### Checklist Pre-Producción

- [ ] `STRIPE_SECRET_KEY` usa `sk_live_`
- [ ] `STRIPE_WEBHOOK_SECRET` de producción configurado
- [ ] Webhook URL apunta a dominio de producción
- [ ] HTTPS habilitado
- [ ] Tests pasando
- [ ] Servicio de email configurado
- [ ] Monitoring configurado
- [ ] Logs configurados

### Rollback Plan

Si algo sale mal:

1. **Desactivar webhook** en Stripe Dashboard (temporalmente)
2. **Rollback código** a versión anterior
3. **Verificar BD** - no debería haber datos corruptos
4. **Re-activar webhook** cuando esté listo
5. **Procesar eventos perdidos** manualmente si es necesario

---

## 📚 Referencias

- [Stripe Webhooks Docs](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Best Practices](https://stripe.com/docs/webhooks/best-practices)

---

## 💡 Tips

1. **Siempre usar test mode** durante desarrollo (`sk_test_`, `whsec_test_`)
2. **Stripe CLI** es tu mejor amigo para testing local
3. **Logs detallados** salvan vidas - logea todo
4. **Idempotencia** es crítica - el mismo evento puede llegar 2+ veces
5. **Verificar firmas** SIEMPRE - nunca confíes en un webhook sin verificar
6. **Metadata** - incluye `userId` en TODOS los objetos de Stripe
7. **Grace period** - dar al usuario tiempo de actualizar tarjeta (3 intentos)
8. **Email notifications** - mantener al usuario informado en cada paso

---

**¿Preguntas?** Consulta los tests en `__tests__/lib/stripe/webhook-handler.test.ts` para ejemplos de cada caso.
