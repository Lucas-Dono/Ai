# 💳 Quick Start - Sistema Dual de Pagos

Guía de 10 minutos para configurar Paddle + MercadoPago.

## 🎯 TL;DR

Tu app detecta automáticamente el país y usa:
- 🌊 **Paddle** para USA/Europa/Global (✅ Confirmado en Argentina)
- 💙 **MercadoPago** para LATAM

**Revenue potencial**: $15K+/mes con 1,000 usuarios mixtos.

---

## ⚡ Setup en 3 Pasos

### 1️⃣ Configurar Paddle (10 min)

```bash
# 1. Crear cuenta
https://vendors.paddle.com/ → Sign Up
✅ Confirmar que Argentina está disponible como país

# 2. Verificar identidad y configurar pagos
Dashboard → Settings → Payouts → Add Bank Account
Soporte: Transferencia bancaria, PayPal

# 3. Crear productos y precios
Dashboard → Catalog → Products → New Product

Crear 4 precios:
- Plus Monthly: $22 USD/mes (incluye fee 10%)
- Plus Yearly: $222 USD/año
- Ultra Monthly: $56 USD/mes
- Ultra Yearly: $556 USD/año

# 4. Obtener credenciales
Settings → Authentication → API Keys → Create

# 5. Configurar webhook
Settings → Notifications → Webhooks → Add Endpoint
URL: https://tudominio.com/api/webhooks/paddle
Events: Seleccionar todos (subscription.*, transaction.*)
```

### 2️⃣ Agregar a .env

```bash
# Paddle
PADDLE_API_KEY="paddle_live_xxx"
PADDLE_WEBHOOK_SECRET="pdl_ntfset_xxx"

# IDs de precios (copiar del dashboard → Catalog → Prices)
PADDLE_PLUS_MONTHLY_PRICE_ID="pri_xxx"
PADDLE_PLUS_YEARLY_PRICE_ID="pri_xxx"
PADDLE_ULTRA_MONTHLY_PRICE_ID="pri_xxx"
PADDLE_ULTRA_YEARLY_PRICE_ID="pri_xxx"

# MercadoPago (ya configurado)
MERCADOPAGO_ACCESS_TOKEN="APP_USR-xxx"
MERCADOPAGO_PUBLIC_KEY="APP_USR-xxx"
```

### 3️⃣ Migrar Base de Datos

```bash
# Aplicar cambios
npx prisma db push

# O crear migración
npx prisma migrate dev --name add_paddle_support

# Reiniciar app
npm run dev
```

---

## 🧪 Probar el Sistema

### Probar Detección de País:

```bash
# GET request para ver pricing
curl http://localhost:3000/api/billing/checkout-unified?planId=plus

# Response:
{
  "countryCode": "AR",
  "provider": "mercadopago",
  "pricing": {
    "amount": 5000,
    "currency": "ARS",
    "displayPrice": "$5,000"
  }
}
```

### Probar Checkout:

```javascript
// En tu frontend
const handleSubscribe = async () => {
  const res = await fetch('/api/billing/checkout-unified', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      planId: 'plus',
      interval: 'month',
    }),
  });

  const { checkoutUrl } = await res.json();
  window.location.href = checkoutUrl;
};
```

---

## 📊 Pricing por País

| País | Proveedor | Plus/mes | Ultra/mes |
|------|-----------|----------|-----------|
| 🇦🇷 Argentina | MercadoPago | $5,000 ARS | $12,000 ARS |
| 🇧🇷 Brasil | MercadoPago | R$25 | R$60 |
| 🇲🇽 México | MercadoPago | $100 MXN | $240 MXN |
| 🇺🇸 USA | Paddle | $22 USD | $56 USD |
| 🇬🇧 UK | Paddle | $23 USD | $59 USD |
| 🌍 Resto | Paddle | $22 USD | $56 USD |

---

## ✅ Verificar que Todo Funciona

```bash
# 1. Detectar país
curl http://localhost:3000/api/billing/checkout-unified?planId=plus

# 2. Ver webhooks en logs
tail -f logs/billing.log

# 3. Probar checkout en navegador
# Ir a: http://localhost:3000/dashboard/billing
# Click "Upgrade to Plus"

# 4. Verificar suscripción en DB
npx prisma studio
# Ver tabla Subscription
```

---

## 🚨 Errores Comunes

### "API key not configured"
```bash
# Verificar que esté en .env
echo $LEMONSQUEEZY_API_KEY

# Si está vacío, agregar y reiniciar
```

### "Country detection fallback to US"
```bash
# Normal en desarrollo local
# En producción usa headers de Cloudflare/Vercel automáticamente
```

### Webhook no funciona
```bash
# 1. Verificar URL pública
# 2. Verificar secret en .env
# 3. Ver logs: tail -f logs/billing.log
```

---

## 📈 Monitorear Revenue

```typescript
// Dashboard simple
const { data } = await fetch('/api/admin/revenue-stats');

console.log(`
  Total suscriptores: ${data.total.subscriptions}
  Revenue mensual: $${data.total.monthlyRevenue} USD

  Paddle: ${data.providers.paddle.subscriptions} subs
  MercadoPago: ${data.providers.mercadoPago.subscriptions} subs
`);
```

---

## 🎉 ¡Listo para Reddit!

Tu sistema está configurado para:
- ✅ Detectar país automáticamente
- ✅ Mostrar pricing regional
- ✅ Procesar pagos globales (135+ países)
- ✅ Recibir dinero en cuenta argentina
- ✅ Emails automáticos de confirmación

**Próximo paso**: Lanzar en r/InternetIsBeautiful o r/SideProject

---

## 📚 Más Info

- [Documentación Completa](./PAYMENT_SYSTEM_DUAL.md)
- [Paddle Dashboard](https://vendors.paddle.com/)
- [Paddle API Docs](https://developer.paddle.com/)
- [MercadoPago Dashboard](https://www.mercadopago.com.ar/developers/)

---

**Tiempo total**: ~15 minutos
**Costo setup**: $0
**Revenue potencial**: $10K-50K/mes 💰

¿Problemas? Lee la [documentación completa](./PAYMENT_SYSTEM_DUAL.md) o abre un issue.
