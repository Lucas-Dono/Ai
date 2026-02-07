# Sistema de Billing - Guía Rápida 🚀

## URLs Principales

### Para Usuarios
```
/dashboard/billing              - Dashboard principal con métricas
/dashboard/billing/plans        - Comparar planes
/dashboard/billing/history      - Historial de pagos
/dashboard/billing/manage       - Gestionar suscripción
/pricing                        - Landing page de pricing (público)
```

### Para Testing
```
/dashboard/billing/success      - Success page (después de pago exitoso)
```

---

## Flujos de Usuario

### 1. Ver Estado de Suscripción
```
Usuario → /dashboard/billing
↓
Ve su plan actual (Free/Plus/Ultra)
Ve métricas de uso en tiempo real
Ve próximo pago y estado
```

### 2. Comparar Planes
```
Usuario → /dashboard/billing
↓
Click "Compare Plans"
↓
/dashboard/billing/plans
↓
Ve tabla comparativa detallada
Click "Upgrade to Plus/Ultra"
↓
Redirect a MercadoPago Checkout
```

### 3. Upgradear Plan
```
Usuario Free → /dashboard/billing
↓
Click "Upgrade Plan"
↓
Se abre UpgradeDialog
↓
Selecciona Plus o Ultra
↓
POST /api/billing/checkout
↓
Redirect a MercadoPago
↓
Usuario completa pago
↓
Webhook actualiza DB
↓
Redirect a /dashboard/billing/success
↓
Usuario ve nuevo plan activo
```

### 4. Ver Historial de Pagos
```
Usuario → /dashboard/billing
↓
Click "Payment History"
↓
/dashboard/billing/history
↓
GET /api/billing/invoices
↓
Ve lista de facturas
Click "Download Invoice" para PDF
```

### 5. Gestionar Suscripción
```
Usuario Plus/Ultra → /dashboard/billing
↓
Click "Manage Subscription"
↓
/dashboard/billing/manage
↓
Ve detalles de suscripción
Opciones:
  - Upgrade (Plus → Ultra)
  - Cancel Subscription
  - Reactivate (si está cancelando)
```

### 6. Cancelar Suscripción
```
Usuario → /dashboard/billing/manage
↓
Click "Cancel Subscription"
↓
CancelSubscriptionDialog se abre
↓
Paso 1: Confirmación con advertencias
↓
Paso 2: Survey (7 razones + feedback)
↓
Paso 3: Processing
↓
POST /api/billing/cancel
↓
Paso 4: Confirmación exitosa
↓
Suscripción cancelada al final del período
Usuario puede reactivar con botón
```

---

## API Endpoints

### GET /api/billing/subscription
**Obtiene suscripción actual**
```typescript
Response: {
  plan: "free" | "plus" | "ultra",
  subscription: {
    id: string,
    status: string,
    currentPeriodEnd: string,
    cancelAtPeriodEnd: boolean,
    trialEnd: string | null
  } | null,
  hasMercadoPagoCustomer: boolean
}
```

### GET /api/billing/usage
**Obtiene métricas de uso en tiempo real**
```typescript
Response: {
  agents: { current: number, limit: number },
  messages: { current: number, limit: number, period: string },
  worlds: { current: number, limit: number },
  voiceMessages: { current: number, limit: number },
  imageAnalysis: { current: number, limit: number },
  imageGeneration: { current: number, limit: number }
}
```

### POST /api/billing/checkout
**Crea sesión de checkout**
```typescript
Request: { planId: "plus" | "ultra" }
Response: { url: string }
```

### GET /api/billing/invoices
**Lista facturas del usuario**
```typescript
Response: {
  invoices: Array<{
    id: string,
    date: string,
    amount: number,
    currency: string,
    status: "paid" | "pending" | "failed",
    description: string,
    invoiceUrl?: string
  }>,
  total: number
}
```

### POST /api/billing/cancel
**Cancela suscripción**
```typescript
Request: { reason: string, feedback: string }
Response: {
  success: true,
  message: string,
  cancelAt: string
}
```

### PATCH /api/billing/cancel
**Reactiva suscripción cancelada**
```typescript
Response: {
  success: true,
  message: string
}
```

---

## Componentes Reusables

### Importar componentes
```typescript
import {
  PlanCard,
  UsageMetrics,
  PaymentHistory,
  UpgradeDialog,
  CancelSubscriptionDialog
} from "@/components/billing";
```

### Ejemplo: PlanCard
```tsx
<PlanCard
  id="plus"
  name="Plus"
  description="Ideal for regular users"
  price={4900}
  interval="month"
  features={[
    "10 AI Agents",
    "Unlimited messages",
    "NSFW enabled"
  ]}
  isCurrentPlan={currentPlan === "plus"}
  isPopular={true}
  onSelect={() => handleUpgrade("plus")}
  loading={loading}
/>
```

### Ejemplo: UsageMetrics
```tsx
<UsageMetrics
  metrics={[
    {
      label: "AI Agents",
      current: 8,
      limit: 10,
      icon: Users,
      color: "bg-blue-500"
    },
    // ... más métricas
  ]}
/>
```

### Ejemplo: UpgradeDialog
```tsx
<UpgradeDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  currentPlan="free"
  onUpgrade={async (planId) => {
    // Handle upgrade
  }}
/>
```

---

## Configuración de Planes

### Editar planes en: `lib/mercadopago/config.ts`

```typescript
export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    features: [...],
    limits: {
      agents: 3,
      messagesPerDay: 20,
      worlds: 1,
      // ...
    }
  },
  plus: {
    id: "plus",
    name: "Plus",
    price: 4900,
    // ...
  },
  ultra: {
    id: "ultra",
    name: "Ultra",
    price: 14900,
    // ...
  }
}
```

---

## Verificar Límites en tu Código

### Ejemplo: Verificar si puede crear agente
```typescript
import { canCreateResource } from "@/lib/billing/usage-stats";

const result = await canCreateResource(userId, "agent");

if (!result.allowed) {
  // Mostrar mensaje: result.reason
  // Sugerir upgrade
  return;
}

// Continuar creando agente
```

### Ejemplo: Obtener tier del usuario
```typescript
import { getUserTier } from "@/lib/billing/user-tier";

const tier = await getUserTier(userId);
// "free" | "plus" | "ultra"

if (tier === "free") {
  // Mostrar limitaciones
}
```

---

## Testing Checklist

### Manual Testing
- [ ] Usuario Free puede ver su plan y límites
- [ ] Métricas de uso se actualizan correctamente
- [ ] Botón "Upgrade" abre diálogo correcto
- [ ] Proceso de checkout redirige a MercadoPago
- [ ] Webhook actualiza plan después de pago
- [ ] Usuario Plus puede cancelar suscripción
- [ ] Survey de cancelación guarda feedback
- [ ] Usuario puede reactivar suscripción cancelada
- [ ] Historial de pagos muestra facturas correctamente
- [ ] Comparación de planes muestra features correctas
- [ ] Mobile responsive en todas las páginas
- [ ] Loading states funcionan correctamente
- [ ] Error states muestran mensajes apropiados

### API Testing
```bash
# Test subscription endpoint
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/billing/subscription

# Test usage endpoint
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/billing/usage

# Test invoices endpoint
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/billing/invoices

# Test checkout endpoint
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planId":"plus"}' \
  http://localhost:3000/api/billing/checkout
```

---

## Variables de Entorno Requeridas

```env
# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your_access_token
MERCADOPAGO_PLUS_PLAN_ID=your_plus_plan_id
MERCADOPAGO_ULTRA_PLAN_ID=your_ultra_plan_id

# NextAuth
NEXTAUTH_URL=http://localhost:3000
```

---

## Troubleshooting

### Problema: Métricas no se actualizan
**Solución:** Verificar que el endpoint `/api/billing/usage` funciona correctamente
```bash
# Check logs
npm run dev
# Visit /dashboard/billing
# Check Network tab en DevTools
```

### Problema: Checkout redirige a 404
**Solución:** Verificar que `MERCADOPAGO_ACCESS_TOKEN` está configurado
```bash
# Check env vars
echo $MERCADOPAGO_ACCESS_TOKEN
```

### Problema: Invoices no aparecen
**Solución:** Verificar que existen registros en DB
```bash
# Check database
npx prisma studio
# Navigate to Invoice table
```

### Problema: Cancelación no funciona
**Solución:** Verificar permisos y suscripción activa
```bash
# Check subscription status in DB
# Verify subscription is not already cancelled
```

---

## Próximos Pasos

### Para Producción
1. Configurar webhooks de MercadoPago correctamente
2. Agregar analytics tracking (Google Analytics, Mixpanel, etc.)
3. Configurar emails de confirmación
4. Agregar tests automatizados
5. Configurar monitoring y alertas
6. Revisar copy y messaging con marketing
7. Hacer A/B testing de pricing

### Mejoras Opcionales
- [ ] Sistema de cupones/descuentos
- [ ] Planes anuales con descuento
- [ ] Plan Enterprise para empresas
- [ ] Gestión de múltiples métodos de pago
- [ ] Invoices PDF con branding personalizado
- [ ] Email notifications automáticas
- [ ] Panel de admin para ver métricas de conversión
- [ ] Referral program
- [ ] Credits system para rewards

---

## Soporte

**Documentación Completa:** Ver `BILLING_SYSTEM_IMPLEMENTATION.md`

**MercadoPago Docs:** https://www.mercadopago.com/developers

**Issues:** Reportar problemas en el repositorio

---

¡Sistema de billing listo para producción! 🎉
