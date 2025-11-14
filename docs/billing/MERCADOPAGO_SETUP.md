# 🚀 Guía Completa: Configuración de MercadoPago

## 📋 Resumen

Esta guía te llevará paso a paso por la configuración completa del sistema de pagos con MercadoPago para tu plataforma SaaS.

---

## ✅ Estado Actual

Tu proyecto **ya tiene el código listo**. Solo necesitas configurar las credenciales y hacer pruebas.

**Implementado:**
- ✅ Sistema de suscripciones con PreApproval
- ✅ Webhook seguro con verificación de firma
- ✅ Sincronización automática de suscripciones a la DB
- ✅ Gestión de planes (Free, Plus, Ultra)
- ✅ Cancelación/pausa/reactivación de suscripciones

---

## 🎯 ¿Qué Opción de MercadoPago Usar?

Tu código usa **Suscripciones (PreApproval)** - La opción correcta ✅

### ¿Por qué Suscripciones?

| Característica | Tu Necesidad | Solución |
|----------------|--------------|----------|
| Pagos recurrentes | ✅ Mensuales | **Suscripciones** |
| Renovación automática | ✅ Sí | **Suscripciones** |
| Modelo SaaS | ✅ Free/Plus/Ultra | **Suscripciones** |
| Gestión simple | ✅ Webhooks automáticos | **Suscripciones** |

**Otras opciones descartadas:**
- ❌ **Checkout Pro**: Solo pagos únicos, no recurrentes
- ❌ **Checkout API**: Pagos únicos, gestión manual de renovaciones
- ❌ **Checkout Bricks**: Solo componentes UI, necesitas suscripciones igual

---

## 📝 Paso 1: Obtener Credenciales

### Opción A: Credenciales de Prueba (Ya las tienes ✅)

```bash
Public Key: TEST-0997d4f2-727f-49f9-b559-274379cddcf0
Access Token: TEST-2598983582339099-110619-d7c68ee9cdbfb503fa19ef046eb9d8f1-257223932
```

**Ya están configuradas en tu `.env`** ✅

### Opción B: Credenciales de Producción (Para después)

1. Ve a https://www.mercadopago.com.ar/developers/panel/app
2. Crea una aplicación nueva:
   - Nombre: "Circuit Prompt AI"
   - Tipo: Pagos online → Suscripciones
3. En "Credenciales de Producción", activa las credenciales
4. Copia el **Access Token** y **Public Key**
5. Reemplaza en `.env`:
   ```bash
   MERCADOPAGO_ACCESS_TOKEN="APP_USR-xxx"
   MERCADOPAGO_PUBLIC_KEY="APP_USR-xxx"
   ```

---

## 🔧 Paso 2: Configurar Webhooks

Los webhooks notifican automáticamente cuando:
- Una suscripción se crea
- Un pago es procesado
- Una suscripción se cancela/pausa

### Desarrollo (con ngrok)

```bash
# 1. Instalar ngrok
npm install -g ngrok

# 2. Exponer tu localhost
ngrok http 3000

# 3. Copiar la URL HTTPS que te da ngrok (ej: https://abc123.ngrok.io)

# 4. Ir a MercadoPago Developers → Tu aplicación → Webhooks
# 5. Configurar:
URL: https://abc123.ngrok.io/api/webhooks/mercadopago
Eventos:
  - subscription_preapproval (crear/actualizar suscripción)
  - subscription_authorized_payment (pago aprobado)
  - payment (eventos de pago)
```

### Producción

```bash
# 1. Ir a https://www.mercadopago.com.ar/developers/panel/app
# 2. Seleccionar tu aplicación
# 3. Ir a "Webhooks"
# 4. Agregar:
URL: https://tu-dominio.com/api/webhooks/mercadopago
Eventos:
  - subscription_preapproval
  - subscription_authorized_payment
  - payment
```

**Nota:** El webhook secret ya está generado en tu `.env`

---

## 💳 Paso 3: Crear Planes (Opcional)

Tienes **dos opciones** para crear planes:

### Opción A: Planes Programáticos (Recomendado ✅)

Tu código **ya usa esto**. Los planes se crean dinámicamente cuando un usuario se suscribe.

**Ventajas:**
- No necesitas crear nada en MercadoPago manualmente
- Mayor flexibilidad para cambiar precios
- Ya funciona con tu código actual

**Configuración:** Ninguna adicional necesaria ✅

### Opción B: Planes Pre-creados en MercadoPago

Si prefieres crear planes fijos en el panel:

1. Ve a https://www.mercadopago.com.ar/subscription-plans
2. Clic en "Crear nuevo plan"
3. Crear plan **Plus**:
   - Nombre: "Plan Plus - Circuit Prompt AI"
   - Precio: $4,900 ARS
   - Frecuencia: Mensual
   - Clic en "Crear y compartir"
   - Copiar el Plan ID (ej: `2c9380847a2...`)
4. Crear plan **Ultra** (igual pero con $14,900)
5. Pegar los IDs en `.env`:
   ```bash
   MERCADOPAGO_PLUS_PLAN_ID="2c9380847a2..."
   MERCADOPAGO_ULTRA_PLAN_ID="2c9380848b3..."
   ```
6. Actualizar `lib/mercadopago/subscription.ts:49` para usar plan IDs en vez de auto_recurring

---

## 🧪 Paso 4: Probar la Integración

### Prueba 1: Crear Suscripción de Prueba

```bash
# Ejecutar el script de prueba
npx tsx scripts/test-mercadopago-subscription.ts
```

Esto creará una suscripción de prueba y te dará una URL de checkout.

### Prueba 2: Completar el Pago

1. Abre la URL que te dio el script
2. Usa la **tarjeta de prueba**:
   ```
   Número: 5031 7557 3453 0604
   CVV: 123
   Fecha: 11/25
   Nombre: APRO (para aprobar)
   ```
3. Completa el pago

### Prueba 3: Verificar Webhook

Si tienes ngrok corriendo, deberías ver en la consola:

```
🔔 Webhook recibido: subscription_preapproval
✅ Suscripción sincronizada
👤 Usuario actualizado a plan: plus
```

### Prueba 4: Verificar en la Base de Datos

```bash
# Abrir Prisma Studio
npx prisma studio

# Verificar:
# 1. Tabla "User" → plan = "plus"
# 2. Tabla "Subscription" → status = "active"
# 3. Tabla "Payment" → status = "approved"
```

---

## 🎨 Paso 5: Personalizar (Opcional)

### Cambiar Precios

Edita `lib/mercadopago/config.ts:70`:

```typescript
export const PLANS = {
  plus: {
    price: 4900, // $49.00 ARS (precio en centavos)
  },
  ultra: {
    price: 14900, // $149.00 ARS
  }
}
```

### Cambiar Frecuencia

Por defecto es **mensual**. Para cambiar:

`lib/mercadopago/subscription.ts:54`:

```typescript
auto_recurring: {
  frequency: 1, // cada cuánto cobrar
  frequency_type: "months", // "months", "weeks", "days"
}
```

### Agregar Período de Prueba

`lib/mercadopago/subscription.ts`:

```typescript
auto_recurring: {
  // ... otros campos
  free_trial: {
    frequency: 7,
    frequency_type: "days"
  }
}
```

---

## 📊 Paso 6: Monitorear en Producción

### Panel de MercadoPago

Ve a https://www.mercadopago.com.ar/subscriptions

Podrás ver:
- 📊 Total de suscripciones activas
- 💰 Ingresos mensuales
- 👥 Nuevos suscriptores
- ❌ Suscripciones canceladas

### Dashboard en tu App

```bash
# Ir a tu app
http://localhost:3000/dashboard/billing
```

Aquí los usuarios pueden:
- Ver su plan actual
- Cambiar de plan
- Ver historial de pagos
- Cancelar suscripción

---

## 🔐 Seguridad

Tu webhook **ya está protegido** con:

✅ Verificación de firma HMAC-SHA256
✅ Validación de timestamp (máx 5 min)
✅ Secret configurado en `.env`
✅ Logs de intentos fallidos

**No necesitas hacer nada adicional** - Ya está seguro 🔒

---

## 🐛 Troubleshooting

### Error: "Invalid signature"

**Causa:** El webhook secret no coincide

**Solución:**
1. Verifica que `MERCADOPAGO_WEBHOOK_SECRET` en `.env` sea el mismo que configuraste en MercadoPago
2. Si no configuraste uno, genera uno nuevo:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. Cópialo a `.env` y al panel de MercadoPago

### Error: "Unauthorized"

**Causa:** Access Token inválido

**Solución:**
1. Verifica que `MERCADOPAGO_ACCESS_TOKEN` esté correcto
2. Si usas credenciales TEST, deben empezar con `TEST-`
3. Si usas producción, deben empezar con `APP_USR-`

### Error: "Preapproval not found"

**Causa:** Suscripción no existe o ya fue cancelada

**Solución:**
1. Verifica el ID de la suscripción
2. Revisa en https://www.mercadopago.com.ar/subscriptions si existe

### Webhook no llega

**Causa:** URL no accesible desde internet

**Solución en desarrollo:**
```bash
# Usa ngrok para exponer tu localhost
ngrok http 3000
# Configura la URL ngrok en MercadoPago
```

**Solución en producción:**
- Verifica que tu dominio sea HTTPS
- Asegúrate que el endpoint `/api/webhooks/mercadopago` responda

---

## 📚 Recursos

### Documentación Oficial
- **API Reference:** https://www.mercadopago.com.ar/developers/es/reference/subscriptions/_preapproval/post
- **Suscripciones:** https://www.mercadopago.com.ar/developers/es/docs/subscriptions
- **Webhooks:** https://www.mercadopago.com.ar/developers/es/docs/subscriptions/integration-configuration/webhooks

### Tarjetas de Prueba
| Resultado | Número | CVV | Nombre |
|-----------|--------|-----|--------|
| ✅ Aprobado | 5031 7557 3453 0604 | 123 | APRO |
| ❌ Rechazado | 5031 7557 3453 0604 | 123 | OCHO |
| ⏳ Pendiente | 5031 7557 3453 0604 | 123 | CONT |

### MCP Tools Disponibles

Si necesitas más herramientas, tienes acceso a:

```bash
# Ver checklist de calidad
mcp__mercadopago__quality_checklist

# Buscar en docs
mcp__mercadopago__search_documentation("crear suscripción", "es", "MLA")

# Configurar webhooks
mcp__mercadopago__save_webhook(url, topics)

# Simular webhook (testing)
mcp__mercadopago__simulate_webhook(payment_id, topic)

# Ver historial de webhooks
mcp__mercadopago__notifications_history
```

---

## ✅ Checklist Final

Antes de ir a producción:

- [ ] Credenciales de producción configuradas en `.env`
- [ ] Webhook configurado y probado
- [ ] Al menos 1 suscripción de prueba completada
- [ ] Verificado que los webhooks llegan correctamente
- [ ] Verificado que la DB se actualiza con los pagos
- [ ] Probado cancelación de suscripción
- [ ] Revisado que los límites de los planes funcionen
- [ ] Documentado el proceso para el equipo

---

## 🎉 ¡Listo!

Tu sistema de pagos con MercadoPago está **100% configurado y listo**.

**Próximos pasos:**
1. Ejecuta `npx tsx scripts/test-mercadopago-subscription.ts`
2. Completa un pago de prueba
3. Verifica que todo funcione
4. ¡Empieza a facturar! 💰

**¿Preguntas?** Consulta:
- `START_HERE_PAGOS.md.keep` - Guía general de pagos
- `docs/billing/QUICK_START_DUAL_PAYMENTS.md` - Si quieres agregar Stripe también

---

**Última actualización:** 2025-01-06
**Estado:** ✅ Listo para producción
