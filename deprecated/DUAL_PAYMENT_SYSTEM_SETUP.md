# 💳 Sistema Dual de Pagos: MercadoPago + Stripe

## ✅ Estado: IMPLEMENTADO

Tu proyecto ahora soporta **dos sistemas de pago simultáneos**:
- **MercadoPago** (ideal para Argentina y Latinoamérica)
- **Stripe** (ideal para pagos internacionales)

---

## 🎯 Qué se implementó

### 1. Frontend
- ✅ **PaymentMethodSelector**: Componente para elegir entre MercadoPago y Stripe
- ✅ **Dialog de selección**: Modal antes del checkout con información de cada método
- ✅ **Badges de recomendación**: Sugiere el mejor método según ubicación del usuario
- ✅ **Información contextual**: Explica ventajas de cada método

### 2. Backend
- ✅ **Endpoint unificado**: `/api/billing/checkout` ahora acepta `provider` como parámetro
- ✅ **Stripe checkout**: Función `createStripeCheckoutSession()` en `lib/stripe/checkout.ts`
- ✅ **MercadoPago checkout**: Mantiene la función existente `createSubscriptionPreference()`
- ✅ **Logging completo**: Registra todas las operaciones para debugging

### 3. Infraestructura
- ✅ **Webhooks**: Ambos sistemas tienen webhooks configurados
- ✅ **Base de datos**: Prisma schema soporta ambos providers
- ✅ **Seguridad**: Verificación de firmas en ambos webhooks
- ✅ **Idempotencia**: Evita procesamiento duplicado

---

## 🚀 Configuración Rápida (5 minutos)

### Paso 1: Configurar MercadoPago (ya lo tienes)
```bash
# En tu .env
MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
MERCADOPAGO_WEBHOOK_SECRET="..."
MERCADOPAGO_PLUS_PLAN_ID="..."
MERCADOPAGO_ULTRA_PLAN_ID="..."
```

### Paso 2: Configurar Stripe

#### 2.1. Crear cuenta en Stripe
1. Ve a https://dashboard.stripe.com/register
2. Completa el registro (nombre, email, contraseña)
3. Activa el modo de prueba (Test Mode)

#### 2.2. Obtener API Keys
1. Ve a https://dashboard.stripe.com/apikeys
2. Copia:
   - **Secret key** (sk_test_...) → `STRIPE_SECRET_KEY`
   - **Publishable key** (pk_test_...) → `STRIPE_PUBLISHABLE_KEY`

```bash
# Agregar a tu .env
STRIPE_SECRET_KEY="sk_test_51Abc123..."
STRIPE_PUBLISHABLE_KEY="pk_test_51Abc123..."
```

#### 2.3. Crear Productos y Precios

**Opción A: Desde el Dashboard (Recomendado)**

1. Ve a https://dashboard.stripe.com/products
2. Click en "Add product"

**Para el Plan Plus:**
- **Name:** AI Companion Plus
- **Description:** 10 AI agents, unlimited messages, 100 voice messages/month
- **Pricing:** $5.00 USD
- **Billing period:** Monthly
- Click "Save"
- Copia el **Price ID** (price_xxxxx) → `STRIPE_PLUS_MONTHLY_PRICE_ID`

**Para el Plan Ultra:**
- **Name:** AI Companion Ultra
- **Description:** Unlimited AI agents, 500 voice messages/month, priority features
- **Pricing:** $15.00 USD
- **Billing period:** Monthly
- Click "Save"
- Copia el **Price ID** (price_xxxxx) → `STRIPE_ULTRA_MONTHLY_PRICE_ID`

**Planes Anuales (Opcional - 20% descuento):**
- Plus Anual: $48.00 USD/year (ahorro de $12)
- Ultra Anual: $144.00 USD/year (ahorro de $36)

```bash
# Agregar a tu .env
STRIPE_PLUS_MONTHLY_PRICE_ID="price_1ABC123..."
STRIPE_PLUS_YEARLY_PRICE_ID="price_1XYZ789..."  # Opcional
STRIPE_ULTRA_MONTHLY_PRICE_ID="price_1DEF456..."
STRIPE_ULTRA_YEARLY_PRICE_ID="price_1UVW012..."  # Opcional
```

**Opción B: Usar Stripe CLI (Avanzado)**

```bash
# Instalar Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Linux: https://stripe.com/docs/stripe-cli#install
# Windows: scoop install stripe

# Login
stripe login

# Crear productos
stripe products create \
  --name="AI Companion Plus" \
  --description="10 AI agents, unlimited messages"

stripe prices create \
  --product=prod_xxxxx \
  --unit-amount=500 \
  --currency=usd \
  --recurring[interval]=month
```

#### 2.4. Configurar Webhook

1. Ve a https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. **Endpoint URL:** `https://tu-dominio.com/api/webhooks/stripe`
   - En desarrollo: `http://localhost:3000/api/webhooks/stripe`
4. **Eventos a escuchar:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
5. Click "Add endpoint"
6. Copia el **Signing secret** (whsec_...) → `STRIPE_WEBHOOK_SECRET`

```bash
# Agregar a tu .env
STRIPE_WEBHOOK_SECRET="whsec_abc123..."
```

#### 2.5. Test con Stripe CLI (Desarrollo local)

Para testear webhooks en desarrollo local:

```bash
# Terminal 1: Iniciar tu app
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3: Trigger un evento de prueba
stripe trigger checkout.session.completed
```

---

## 💰 Precios Sugeridos

### MercadoPago (Argentina)
- **Plus:** $4,900 ARS/mes (~$5 USD)
- **Ultra:** $14,900 ARS/mes (~$15 USD)

### Stripe (Internacional)
- **Plus:** $5.00 USD/mes o $48 USD/año
- **Ultra:** $15.00 USD/mes o $144 USD/año

**Nota:** Podés ajustar los precios según tu mercado. Stripe te cobra:
- 2.9% + $0.30 USD por transacción exitosa
- +1% para tarjetas internacionales

---

## 🧪 Testing

### 1. Test Manual

**MercadoPago:**
```bash
# Tarjeta de prueba
Número: 5031 7557 3453 0604
CVV: 123
Vencimiento: 11/25
Nombre: APRO
```

**Stripe:**
```bash
# Tarjeta de prueba exitosa
Número: 4242 4242 4242 4242
CVV: cualquiera
Vencimiento: cualquier fecha futura

# Tarjeta que requiere 3D Secure
Número: 4000 0025 0000 3155

# Tarjeta que será rechazada
Número: 4000 0000 0000 0002
```

### 2. Flow completo

1. Ve a `/dashboard/billing/plans`
2. Click en "Upgrade to Plus" o "Upgrade to Ultra"
3. Verás el modal de selección de método de pago
4. Selecciona **MercadoPago** o **Stripe**
5. Click "Continuar al pago"
6. Completa el checkout
7. Verifica que:
   - El webhook se recibió correctamente (logs)
   - El plan del usuario se actualizó en la BD
   - El usuario tiene acceso a las features premium

---

## 📊 Monitoreo

### Ver Logs

```bash
# Logs de checkouts
grep "Creating checkout session" logs/*.log

# Logs de webhooks
grep "webhook received" logs/*.log

# Logs de errores
grep "ERROR" logs/*.log
```

### Queries útiles de Prisma

```typescript
// Ver todas las suscripciones activas
await prisma.subscription.findMany({
  where: { status: "active" },
  include: { user: true }
});

// Ver suscripciones por proveedor
await prisma.subscription.groupBy({
  by: ['stripeSubscriptionId', 'mercadopagoPreapprovalId'],
  _count: true
});

// Ver eventos de webhook no procesados
await prisma.webhookEvent.findMany({
  where: { processed: false },
  orderBy: { createdAt: 'desc' }
});
```

---

## 🔧 Troubleshooting

### Problema: "Stripe client not initialized"
**Solución:** Verifica que `STRIPE_SECRET_KEY` esté en tu `.env`

### Problema: "Invalid webhook signature"
**Solución:**
1. Verifica que `STRIPE_WEBHOOK_SECRET` sea correcto
2. En desarrollo local, usa `stripe listen`
3. En producción, verifica que la URL del webhook sea HTTPS

### Problema: "Price ID not configured"
**Solución:** Verifica que todos los Price IDs estén en `.env`:
```bash
STRIPE_PLUS_MONTHLY_PRICE_ID="price_..."
STRIPE_ULTRA_MONTHLY_PRICE_ID="price_..."
```

### Problema: Usuario no puede ver features premium
**Solución:**
1. Verifica que el webhook se recibió: `SELECT * FROM "WebhookEvent"`
2. Verifica que la suscripción existe: `SELECT * FROM "Subscription"`
3. Verifica el plan del usuario: `SELECT plan FROM "User" WHERE id='...'`

---

## 💡 Mejores Prácticas

### 1. Testing en Producción
- **Siempre** usa `sk_test_` keys primero
- Crea una suscripción de prueba
- Verifica que todo funcione antes de cambiar a `sk_live_`

### 2. Seguridad
- ✅ Nunca expongas `STRIPE_SECRET_KEY` en el frontend
- ✅ Siempre verifica las firmas de webhooks
- ✅ Usa HTTPS en producción
- ✅ Implementa rate limiting en endpoints públicos

### 3. User Experience
- Muestra claramente las diferencias de precio (ARS vs USD)
- Explica por qué recomiendas un método sobre otro
- Proporciona soporte para ambos métodos de pago

### 4. Monitoreo
- Configura alertas para webhooks fallidos
- Monitorea la tasa de éxito de pagos
- Revisa logs diariamente
- Configura Stripe Dashboard notifications

---

## 🌍 Internacionalización

### Detectar país del usuario

```typescript
// Usando IP geolocation (ejemplo con Vercel)
const country = req.headers.get('x-vercel-ip-country') || 'AR';

// O usando el locale del navegador
const locale = req.headers.get('accept-language')?.split(',')[0] || 'es-AR';
```

### Recomendar provider automáticamente

```typescript
const latinAmericaCountries = ['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'UY'];
const recommendedProvider = latinAmericaCountries.includes(userCountry)
  ? 'mercadopago'
  : 'stripe';
```

---

## 📈 Analytics

### Métricas Importantes

Track these metrics in your analytics:

```typescript
// Conversión por método de pago
{
  provider: 'mercadopago' | 'stripe',
  plan: 'plus' | 'ultra',
  successful: boolean,
  amount: number,
  currency: string,
  country: string
}

// Razones de cancelación
{
  provider: 'mercadopago' | 'stripe',
  reason: string,
  feedback: string
}
```

---

## 🎁 Características Adicionales (Futuro)

Ideas para extender el sistema:

- [ ] **Cupones de descuento** (Stripe Coupons API)
- [ ] **Trials gratuitos** (7 días sin tarjeta)
- [ ] **Plan familiar** (5 usuarios por $20/mes)
- [ ] **Programa de referidos** (20% off por referido)
- [ ] **Plan anual con descuento** (2 meses gratis)
- [ ] **Facturación automática** (PDF por email)
- [ ] **Créditos de regalo** (para eventos especiales)

---

## 📞 Soporte

### Stripe
- **Dashboard:** https://dashboard.stripe.com
- **Docs:** https://stripe.com/docs
- **Support:** https://support.stripe.com

### MercadoPago
- **Dashboard:** https://www.mercadopago.com.ar/developers
- **Docs:** https://www.mercadopago.com/developers/es
- **Support:** Desde el dashboard

---

## ✅ Checklist Pre-Producción

- [ ] Variables de entorno configuradas en producción
- [ ] Webhooks configurados en Stripe Dashboard (producción)
- [ ] Webhooks configurados en MercadoPago Dashboard
- [ ] Cambiar `sk_test_` por `sk_live_` en producción
- [ ] Probar un pago real con tarjeta propia
- [ ] Verificar que el webhook funciona en producción
- [ ] Configurar alertas por email para pagos fallidos
- [ ] Documentar proceso de refunds para soporte
- [ ] Configurar notificaciones de Stripe
- [ ] Preparar FAQs sobre métodos de pago

---

## 🎉 ¡Listo!

Ahora tienes un sistema dual de pagos completamente funcional. Los usuarios pueden elegir entre:

- **MercadoPago:** Perfecto para Argentina (pesos, cuotas, Rapipago)
- **Stripe:** Perfecto para internacional (USD, tarjetas globales)

**Ventajas:**
- Mayor alcance de mercado
- Flexibilidad para usuarios
- Backup si un proveedor tiene problemas
- Listo para expansión internacional

---

**Implementado por:** Claude Code
**Fecha:** 2025-01-04
**Versión:** 1.0.0

¿Preguntas? Consulta los archivos de documentación:
- `BILLING_IMPLEMENTATION_SUMMARY.md` (MercadoPago)
- `STRIPE_IMPLEMENTATION_SUMMARY.md` (Stripe)
- Este archivo (`DUAL_PAYMENT_SYSTEM_SETUP.md`)
