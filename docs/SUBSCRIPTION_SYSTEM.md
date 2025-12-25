# Sistema de Suscripciones - MercadoPago

## 📋 Resumen

Sistema completo de suscripciones recurrentes integrado con MercadoPago para la plataforma Blaniel.

---

## 🎯 Flujo Completo de Suscripción

### 1. Creación de Suscripción

**Usuario selecciona un plan** → **Crea PreApproval en MercadoPago** → **Redirige al checkout**

```typescript
// lib/mercadopago/subscription.ts
const initPoint = await createSubscriptionPreference(
  userId,
  email,
  "plus", // o "ultra"
  name
);
```

**Parámetros configurados:**
- `payer_email`: Email del usuario
- `external_reference`: userId (crítico para identificar al usuario)
- `auto_recurring`: Configuración de cobro mensual
- `back_url`: URL de retorno después del pago

---

### 2. Primer Pago

**Usuario completa datos de tarjeta** → **MercadoPago procesa pago** → **Envía webhooks**

**Webhooks enviados:**
1. `payment` - Confirma el pago inicial
2. `subscription_preapproval` - Confirma la suscripción activa

**Procesamiento automático:**
```typescript
// app/api/webhooks/mercadopago/route.ts
- Verifica firma HMAC-SHA256 ✅
- Procesa el pago
- Sincroniza suscripción con DB
- Actualiza plan del usuario a "plus" o "ultra"
- Crea invoice/factura
```

---

### 3. Renovación Mensual Automática

**MercadoPago cobra automáticamente cada mes** según la configuración del PreApproval.

#### Escenarios posibles:

#### ✅ Pago Exitoso
```
MercadoPago cobra → payment.status = "approved" → Webhook → Usuario mantiene plan
```

- Se crea nueva invoice
- Usuario recibe email de confirmación (TODO)
- Suscripción se renueva por 30 días más

#### ❌ Pago Fallido
```
MercadoPago intenta cobrar → payment.status = "rejected" → Webhook → Log de fallo
```

**Razones comunes:**
- `cc_rejected_insufficient_amount`: Fondos insuficientes
- `cc_rejected_bad_filled_card_number`: Tarjeta inválida
- `cc_rejected_card_disabled`: Tarjeta deshabilitada

**Reintentos automáticos:**
- MercadoPago reintenta automáticamente según su configuración
- Por defecto: 3 intentos en 10 días
- Si todos fallan → `subscription_preapproval.status = "cancelled"` → Webhook → Downgrade a FREE

#### 🔄 Manejo de Reintentos

```typescript
// En el webhook
case "rejected":
  log.warn({ userId, paymentId, statusDetail }, 'Payment rejected');
  // TODO: Enviar email notificando el rechazo
  // MercadoPago reintentará automáticamente
  break;
```

**Después de agotar reintentos:**
```typescript
case "cancelled":
  // PreApproval cancelado por falta de pago
  await prisma.user.update({
    where: { id: userId },
    data: { plan: "free" }, // Downgrade automático
  });
  // TODO: Enviar email de cancelación
  break;
```

---

### 4. Cancelación por el Usuario

**Usuario hace click en "Cancelar Suscripción"** → **POST /api/billing/cancel** → **MercadoPago cancela PreApproval** → **Webhook** → **Downgrade al final del período**

```typescript
// app/api/billing/cancel/route.ts

POST /api/billing/cancel
Body: {
  "reason": "too_expensive", // Opcional
  "feedback": "Me gustaría un plan intermedio" // Opcional
}

Response: {
  "success": true,
  "message": "Subscription cancelled. You will keep access until the end of your current billing period.",
  "currentPeriodEnd": "2025-12-07T00:00:00.000Z"
}
```

**Comportamiento:**
1. Cancela PreApproval en MercadoPago inmediatamente
2. Marca `cancelAtPeriodEnd = true` en DB
3. Usuario mantiene acceso hasta `currentPeriodEnd`
4. Al llegar `currentPeriodEnd` → Downgrade a FREE automático
5. Guarda razón de cancelación en metadata (para analytics)

---

### 5. Reactivación de Suscripción

Si el usuario cancela pero luego cambia de opinión **ANTES** de que termine el período:

```typescript
PATCH /api/billing/cancel

Response: {
  "success": true,
  "message": "Subscription reactivated successfully"
}
```

**Comportamiento:**
1. Reactiva PreApproval en MercadoPago
2. Marca `cancelAtPeriodEnd = false`
3. Usuario continúa en su plan sin interrupción
4. El cobro mensual continúa normalmente

---

## 🔐 Seguridad: Verificación de Firma

Todos los webhooks verifican la firma HMAC-SHA256 para prevenir ataques:

```typescript
// app/api/webhooks/mercadopago/route.ts

function verifyMercadoPagoSignature(req, body): boolean {
  const xSignature = req.headers.get("x-signature"); // "ts=1234567890,v1=abc123..."
  const xRequestId = req.headers.get("x-request-id");

  // Construir manifest según especificación de MercadoPago
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${timestamp};`;

  // Calcular HMAC-SHA256
  const computedHash = crypto
    .createHmac("sha256", process.env.MERCADOPAGO_WEBHOOK_SECRET)
    .update(manifest)
    .digest("hex");

  return computedHash === receivedHash;
}
```

**Si la firma es inválida** → **401 Unauthorized** → Webhook rechazado

---

## 📊 Modelos de Base de Datos

### Subscription
```typescript
model Subscription {
  id                        String
  userId                    String
  mercadopagoPreapprovalId  String  @unique
  status                    String  // "pending", "authorized", "paused", "cancelled"
  currentPeriodStart        DateTime
  currentPeriodEnd          DateTime
  cancelAtPeriodEnd         Boolean
  canceledAt                DateTime?
  metadata                  Json?   // Razones de cancelación, etc.
}
```

### Payment
```typescript
model Payment {
  id                    String
  userId                String
  mercadopagoPaymentId  String  @unique
  amount                Float
  currency              String  // "ARS", "BRL", etc.
  status                String  // "approved", "rejected", "pending", etc.
  statusDetail          String? // Detalles del rechazo
  paymentMethod         String?
}
```

### Invoice
```typescript
model Invoice {
  id                    String
  userId                String
  mercadopagoPaymentId  String
  amount                Float
  currency              String
  status                String
  paidAt                DateTime
}
```

---

## 🎨 Endpoints de API

### Crear Suscripción
```
POST /api/billing/checkout
Body: { "planId": "plus" }
Response: { "checkoutUrl": "https://www.mercadopago.com.ar/..." }
```

### Cancelar Suscripción
```
POST /api/billing/cancel
Body: {
  "reason": "too_expensive",
  "feedback": "Opcional"
}
Response: { "success": true, "currentPeriodEnd": "2025-12-07" }
```

### Reactivar Suscripción
```
PATCH /api/billing/cancel
Response: { "success": true, "message": "Subscription reactivated" }
```

### Webhook (solo MercadoPago)
```
POST /api/webhooks/mercadopago
Headers:
  - x-signature: ts=...,v1=...
  - x-request-id: uuid
Body: {
  "type": "subscription_preapproval",
  "data": { "id": "preapproval_id" }
}
```

---

## 📧 Notificaciones por Email (TODO)

Sistema de emails pendiente de implementación:

### Email de Bienvenida
Enviado cuando se activa la suscripción por primera vez.

### Email de Confirmación de Pago
Enviado cada mes cuando el pago es exitoso.

### Email de Fallo de Pago
Enviado cuando un pago falla, con instrucciones para actualizar tarjeta.

### Email de Último Intento
Enviado antes del último reintento de pago.

### Email de Cancelación
Enviado cuando la suscripción se cancela (por usuario o por falta de pago).

### Email de Reactivación
Enviado cuando el usuario reactiva su suscripción.

---

## 🔄 Estados de Suscripción

| Estado | Descripción | Plan del Usuario |
|--------|-------------|------------------|
| `pending` | Suscripción creada, pago pendiente | FREE |
| `authorized` | Suscripción activa y pagada | PLUS/ULTRA |
| `paused` | Pausada por el usuario | PLUS/ULTRA (mantiene) |
| `cancelled` | Cancelada definitivamente | FREE |

---

## 🛠️ Configuración de Producción

### Variables de Entorno Requeridas

```bash
# Credenciales de MercadoPago (PRODUCCIÓN)
MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
MERCADOPAGO_PUBLIC_KEY="APP_USR-..."
MERCADOPAGO_CLIENT_ID="..."
MERCADOPAGO_CLIENT_SECRET="..."
MERCADOPAGO_WEBHOOK_SECRET="..." # Generar en panel de MercadoPago

# URLs
NEXTAUTH_URL="https://tu-dominio.com"
APP_URL="https://tu-dominio.com"
```

### Configuración del Webhook en MercadoPago

1. Panel → Tu aplicación → Webhooks
2. URL: `https://tu-dominio.com/api/webhooks/mercadopago`
3. Eventos:
   - ✅ Pagos
   - ✅ Planes y suscripciones
   - ✅ Reclamos (opcional)
4. Guardar y generar el `MERCADOPAGO_WEBHOOK_SECRET`

---

## ⚠️ Limitaciones Conocidas

### Webhooks Automáticos en Modo TEST
- Los webhooks automáticos NO funcionan con usuarios de prueba
- Solo funcionan las simulaciones manuales desde el panel
- **Solución**: Usar credenciales de producción para testing real

### Delay de Webhooks
- Los webhooks pueden tardar hasta 10 minutos en llegar
- MercadoPago tiene reintentos automáticos
- **Solución**: Implementar polling manual si es crítico

---

## 📈 Métricas y Analytics

### Datos a trackear:
- Tasa de conversión (checkouts creados vs pagos completados)
- Razones de cancelación (almacenadas en `metadata`)
- Tasa de churn mensual
- Ingresos recurrentes mensuales (MRR)
- Lifetime Value (LTV) promedio

### Logs Estructurados
Todos los eventos se loggean con Pino:

```typescript
log.info({ userId, subscriptionId, preapprovalId }, 'Event description');
```

---

## 🚀 Próximos Pasos

### Implementación Pendiente:
- [ ] Sistema de emails transaccionales
- [ ] UI de gestión de suscripción en dashboard
- [ ] Analytics dashboard para métricas de suscripciones
- [ ] Sistema de cupones/descuentos
- [ ] Soporte para múltiples monedas
- [ ] Pruebas unitarias para webhooks
- [ ] Tests end-to-end del flujo completo

---

## 📞 Soporte

- **Documentación oficial**: https://www.mercadopago.com.ar/developers/es/docs/subscriptions
- **Panel de aplicaciones**: https://www.mercadopago.com.ar/developers/panel/app
- **Logs del servidor**: Ver `billing` module en logs de producción

---

## 📝 Changelog

### 2025-11-07
- ✅ Implementado webhook con verificación de firma HMAC-SHA256
- ✅ Manejo completo de estados de suscripción
- ✅ Downgrade automático cuando falla el pago
- ✅ Endpoint de cancelación con metadata
- ✅ Endpoint de reactivación
- ✅ Logging estructurado con Pino
- ✅ Documentación completa del sistema
