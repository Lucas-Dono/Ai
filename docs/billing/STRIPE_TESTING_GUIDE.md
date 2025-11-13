# Guía Rápida: Testing de Webhooks de Stripe

## 🎯 Quick Start (5 minutos)

### 1. Setup Inicial

```bash
# Instalar dependencias
npm install

# Configurar environment (test mode)
cp .env.example .env

# Agregar keys de Stripe TEST
# STRIPE_SECRET_KEY="sk_test_..."
# STRIPE_WEBHOOK_SECRET="whsec_test_..." (obtendrás después)

# Migrar BD
npx prisma migrate dev
```

### 2. Instalar Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_amd64.tar.gz
tar -xvf stripe_linux_amd64.tar.gz
sudo mv stripe /usr/local/bin/

# Windows
scoop install stripe

# Verificar instalación
stripe --version
```

### 3. Login a Stripe

```bash
stripe login
# Se abrirá navegador para autorizar
```

### 4. Iniciar Testing

```bash
# Terminal 1: Forward webhooks a localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copiar el webhook signing secret que aparece:
# > Ready! Your webhook signing secret is whsec_xxx...

# Actualizar .env:
# STRIPE_WEBHOOK_SECRET="whsec_xxx..."

# Terminal 2: Iniciar servidor
npm run dev

# Terminal 3: Trigger eventos
stripe trigger customer.subscription.created
```

---

## 🧪 Tests Automatizados

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Solo Stripe tests
npm test webhook-handler

# Con coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Verbose mode
npm test -- --reporter=verbose
```

### Verificar Coverage

```bash
npm test -- --coverage

# Debería mostrar ~90%+ coverage en:
# - lib/stripe/subscription-sync.ts
# - lib/stripe/config.ts
```

---

## 🎬 Scenarios de Testing

### Scenario 1: Nueva Suscripción

```bash
# 1. Trigger evento
stripe trigger checkout.session.completed

# 2. Verificar logs del servidor
# Debería ver:
# [billing] Stripe webhook received and verified
# [billing] Handling checkout.session.completed
# [billing] Subscription synced successfully

# 3. Verificar BD
psql $DATABASE_URL -c "SELECT * FROM \"Subscription\" ORDER BY \"createdAt\" DESC LIMIT 1;"

# 4. Verificar usuario actualizado
psql $DATABASE_URL -c "SELECT id, email, plan FROM \"User\" WHERE plan != 'free' LIMIT 1;"
```

### Scenario 2: Pago Exitoso

```bash
# 1. Trigger evento
stripe trigger invoice.payment_succeeded

# 2. Verificar logs
# [billing] Handling invoice.payment_succeeded
# [billing] Payment succeeded processed

# 3. Verificar invoice en BD
psql $DATABASE_URL -c "SELECT * FROM \"Invoice\" WHERE status = 'paid' ORDER BY \"createdAt\" DESC LIMIT 1;"
```

### Scenario 3: Pago Fallido

```bash
# 1. Trigger evento
stripe trigger invoice.payment_failed

# 2. Verificar logs
# [billing] Payment failed
# [billing] Payment failed - user notified

# 3. Verificar invoice con status failed
psql $DATABASE_URL -c "SELECT * FROM \"Invoice\" WHERE status = 'payment_failed' ORDER BY \"createdAt\" DESC LIMIT 1;"
```

### Scenario 4: Cancelación

```bash
# 1. Trigger evento
stripe trigger customer.subscription.deleted

# 2. Verificar logs
# [billing] Handling customer.subscription.deleted
# [billing] User downgraded to free plan

# 3. Verificar usuario downgraded
psql $DATABASE_URL -c "SELECT id, email, plan FROM \"User\" WHERE id = 'user_id_aqui';"
# plan debería ser "free"
```

### Scenario 5: Update de Suscripción

```bash
# 1. Trigger evento
stripe trigger customer.subscription.updated

# 2. Verificar logs
# [billing] Handling customer.subscription.updated
# [billing] Subscription updated successfully

# 3. Verificar cambios en BD
psql $DATABASE_URL -c "SELECT * FROM \"Subscription\" ORDER BY \"updatedAt\" DESC LIMIT 1;"
```

---

## 🔍 Debugging

### Ver Logs Detallados

```bash
# Logs del servidor (Terminal 2)
# Los logs de billing usan formato JSON
grep "billing" logs/app.log | tail -20

# O si usas pino-pretty:
npm run dev | pino-pretty
```

### Ver Eventos en Stripe CLI

```bash
# Terminal con stripe listen muestra todos los eventos:
stripe listen --forward-to localhost:3000/api/webhooks/stripe --print-json

# Salida:
# {
#   "id": "evt_xxx",
#   "type": "customer.subscription.created",
#   "data": { ... }
# }
```

### Verificar Webhook Events en BD

```sql
-- Ver últimos 10 eventos procesados
SELECT
  "stripeEventId",
  type,
  processed,
  "processedAt",
  "createdAt"
FROM "WebhookEvent"
ORDER BY "createdAt" DESC
LIMIT 10;

-- Ver eventos no procesados (posible error)
SELECT *
FROM "WebhookEvent"
WHERE processed = false
AND "createdAt" < NOW() - INTERVAL '5 minutes';
```

---

## 🎨 Test con Stripe Dashboard

### 1. Acceder a Test Mode

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle a **"Test mode"** (arriba a la derecha)

### 2. Crear Webhook de Test

1. Ve a **Developers → Webhooks**
2. Click **"Add endpoint"**
3. URL: `https://tu-ngrok-url.ngrok.io/api/webhooks/stripe`
   (usa ngrok para exponer localhost)
4. Selecciona eventos
5. Copiar signing secret

### 3. Enviar Test Webhook

1. En Dashboard → Webhooks → Tu endpoint
2. Click **"Send test webhook"**
3. Selecciona evento (ej: `customer.subscription.created`)
4. Click **"Send test webhook"**
5. Verificar respuesta (debería ser 200 OK)

### 4. Ver Logs en Dashboard

1. En la página del webhook, sección **"Recent Events"**
2. Click en evento para ver:
   - Request body
   - Response status
   - Response time
   - Errores (si hay)

---

## 🚨 Troubleshooting

### Problema: "Invalid signature"

**Causa:** `STRIPE_WEBHOOK_SECRET` incorrecto.

**Solución:**
```bash
# Obtener secret correcto
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copiar el "webhook signing secret" que aparece

# Actualizar .env
STRIPE_WEBHOOK_SECRET="whsec_xxx..."

# Reiniciar servidor
npm run dev
```

### Problema: Webhook no llega

**Causa:** URL incorrecta o servidor no corriendo.

**Solución:**
```bash
# Verificar servidor corriendo
curl http://localhost:3000/api/webhooks/stripe
# Debería retornar error de signature (es normal)

# Verificar Stripe CLI conectado
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Debería decir "Ready!"
```

### Problema: "Cannot find user"

**Causa:** Evento de Stripe no tiene `metadata.userId`.

**Solución:**
```bash
# Crear evento con metadata correcta
# Usa Stripe API o Dashboard para crear con metadata
```

### Problema: Tests fallan

**Causa:** Mocks no configurados o BD no limpia.

**Solución:**
```bash
# Limpiar BD de test
npm run test:setup

# O manualmente
psql $DATABASE_URL -c "TRUNCATE TABLE \"WebhookEvent\", \"Subscription\", \"Invoice\" CASCADE;"

# Re-ejecutar tests
npm test
```

---

## 📊 Métricas de Test

### Success Rate

```sql
SELECT
  COUNT(*) FILTER (WHERE processed = true) as success,
  COUNT(*) FILTER (WHERE processed = false) as failed,
  COUNT(*) FILTER (WHERE processed = true) * 100.0 / COUNT(*) as success_rate
FROM "WebhookEvent"
WHERE "createdAt" > NOW() - INTERVAL '1 hour';
```

### Processing Time

```sql
SELECT
  type,
  AVG(EXTRACT(EPOCH FROM ("processedAt" - "createdAt"))) as avg_processing_seconds,
  MAX(EXTRACT(EPOCH FROM ("processedAt" - "createdAt"))) as max_processing_seconds
FROM "WebhookEvent"
WHERE processed = true
GROUP BY type;
```

### Failed Payments

```sql
SELECT
  COUNT(*) as total_failed,
  SUM(amount) / 100.0 as total_amount_failed
FROM "Invoice"
WHERE status = 'payment_failed'
AND "createdAt" > NOW() - INTERVAL '7 days';
```

---

## 🎯 Checklist de Testing

Antes de deployment, verificar:

### Funcionalidad
- [ ] ✅ Nueva suscripción crea registro en BD
- [ ] ✅ Usuario actualizado con plan correcto
- [ ] ✅ Pago exitoso crea invoice
- [ ] ✅ Pago fallido registra intento
- [ ] ✅ Cancelación downgrade a free
- [ ] ✅ Update de suscripción detecta cambio
- [ ] ✅ Idempotencia funciona (mismo evento 2 veces)

### Seguridad
- [ ] ✅ Firma de webhook verificada
- [ ] ✅ Webhook sin firma rechazado (401)
- [ ] ✅ Metadata.userId requerido
- [ ] ✅ Evento duplicado no reprocesado

### Robustez
- [ ] ✅ Maneja metadata faltante sin crash
- [ ] ✅ Maneja price ID desconocido
- [ ] ✅ Maneja errors de BD gracefully
- [ ] ✅ Logs todos los eventos importantes

### Performance
- [ ] ✅ Procesamiento < 1 segundo
- [ ] ✅ No bloquea otros requests
- [ ] ✅ Queries optimizadas (índices)

---

## 🔗 Quick Links

- **Stripe Dashboard:** https://dashboard.stripe.com
- **Stripe CLI Docs:** https://stripe.com/docs/stripe-cli
- **Testing Guide:** https://stripe.com/docs/testing
- **Webhook Reference:** https://stripe.com/docs/api/events

---

## 💡 Tips Pro

1. **Usar fixtures de Stripe CLI:**
   ```bash
   stripe fixtures fixtures/subscription.json
   ```

2. **Filter logs por tipo:**
   ```bash
   stripe listen --events customer.subscription.updated,invoice.payment_failed
   ```

3. **Replay evento:**
   ```bash
   # Obtener ID de evento del Dashboard
   stripe events resend evt_xxx
   ```

4. **Mock time (para trials):**
   ```bash
   stripe trigger customer.subscription.trial_will_end --override current_period_end=$(date -d "+3 days" +%s)
   ```

5. **Debug mode:**
   ```bash
   DEBUG=stripe:* npm run dev
   ```

---

## 🎬 Video Tutorial (opcional)

Si prefieres video, sigue estos pasos:

1. Abre [este video oficial de Stripe](https://www.youtube.com/watch?v=oYSLhriIZaA)
2. Sigue los pasos para test mode
3. Usa nuestro endpoint: `/api/webhooks/stripe`

---

**Happy Testing! 🚀**

Si encuentras problemas, revisa:
1. Los logs del servidor
2. La documentación completa en `docs/STRIPE_WEBHOOKS_SYSTEM.md`
3. Los tests en `__tests__/lib/stripe/webhook-handler.test.ts`
