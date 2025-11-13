# 📢 Sistema de Reclamos de MercadoPago

## 📋 Resumen

El sistema de reclamos (claims) de MercadoPago te permite recibir notificaciones automáticas cuando un usuario disputa un pago. Este sistema ya está **completamente implementado** en tu proyecto.

---

## ✅ ¿Qué está Implementado?

### 1. **Modelo de Base de Datos** (`prisma/schema.prisma`)

```prisma
model Claim {
  id                    String   @id
  mercadopagoClaimId    String   @unique
  mercadopagoPaymentId  String?
  userId                String
  type                  String   // "not_received", "not_as_described", etc.
  status                String   // "opened", "pending", "closed", "resolved"
  stage                 String?  // "claim", "mediation", "resolved"
  amount                Float
  currency              String   @default("ARS")
  reason                String?  @db.Text
  claimDate             DateTime
  resolutionDate        DateTime?
  expirationDate        DateTime?
  metadata              Json?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

### 2. **Handler de Webhook** (`app/api/webhooks/mercadopago/route.ts:241`)

El webhook automáticamente:
- ✅ Recibe notificaciones de reclamos
- ✅ Consulta detalles del reclamo vía API de MercadoPago
- ✅ Asocia el reclamo con el pago y usuario correspondiente
- ✅ Guarda toda la información en la base de datos
- ✅ Registra logs detallados para auditoría

---

## 🔧 Configuración

### Paso 1: Aplicar Migración de Base de Datos

```bash
# Generar migración para el nuevo modelo Claim
npx prisma migrate dev --name add_claims_table

# O si prefieres solo sincronizar en desarrollo
npx prisma db push
```

### Paso 2: Configurar Webhook en MercadoPago

1. Ve a https://www.mercadopago.com.ar/developers/panel/app
2. Selecciona tu aplicación
3. Ve a **Webhooks**
4. Selecciona estos eventos:
   - ☑️ **Pagos**
   - ☑️ **Planes y suscripciones**
   - ☑️ **Reclamos** ← NUEVO

### Paso 3: Listo

No se requiere configuración adicional. El sistema ya maneja todo automáticamente.

---

## 📊 Tipos de Reclamos

### Tipos Comunes

| Tipo | Descripción | Acción Recomendada |
|------|-------------|-------------------|
| `not_received` | Usuario no recibió el servicio | Verificar acceso a la plataforma |
| `not_as_described` | Servicio diferente al esperado | Revisar descripción de planes |
| `unauthorized` | Cobro no autorizado | Revisar comunicaciones con usuario |
| `other` | Otros motivos | Contactar al usuario |

### Estados del Reclamo

| Estado | Descripción |
|--------|-------------|
| `opened` | Reclamo recién abierto |
| `pending` | En revisión |
| `resolved` | Resuelto a favor del vendedor |
| `closed` | Cerrado (favor del comprador) |
| `cancelled` | Cancelado por el usuario |

### Etapas del Reclamo

| Etapa | Descripción |
|-------|-------------|
| `claim` | Primera instancia |
| `mediation` | MercadoPago está mediando |
| `resolved` | Finalizado |

---

## 🔍 Consultar Reclamos

### Desde Prisma Studio

```bash
npx prisma studio

# Ve a la tabla "Claim" para ver todos los reclamos
```

### Desde el Código

```typescript
import { prisma } from "@/lib/prisma";

// Obtener reclamos de un usuario
const userClaims = await prisma.claim.findMany({
  where: {
    userId: "user-id",
  },
  orderBy: {
    claimDate: 'desc',
  },
});

// Obtener reclamos abiertos
const openClaims = await prisma.claim.findMany({
  where: {
    status: {
      in: ['opened', 'pending'],
    },
  },
  include: {
    // Podrías agregar relaciones si las creas
  },
});

// Obtener reclamo por payment ID
const claimForPayment = await prisma.claim.findFirst({
  where: {
    mercadopagoPaymentId: "123456789",
  },
});
```

---

## 📧 Notificaciones (TODOs)

El handler actual tiene TODOs para implementar:

### 1. Notificar al Usuario

```typescript
// TODO en: app/api/webhooks/mercadopago/route.ts:312
// Enviar email/notificación al usuario sobre el reclamo

// Ejemplo de implementación:
async function notifyUserAboutClaim(userId: string, claim: any) {
  // Opción 1: Email (si tienes Resend configurado)
  await sendEmail({
    to: user.email,
    subject: "Recibimos tu reclamo",
    body: `Tu reclamo #${claim.id} ha sido registrado...`,
  });

  // Opción 2: Notificación in-app
  await prisma.notification.create({
    data: {
      userId,
      type: 'CLAIM_RECEIVED',
      title: 'Reclamo recibido',
      message: `Hemos recibido tu reclamo #${claim.id}`,
    },
  });
}
```

### 2. Alertar al Equipo de Soporte

```typescript
// TODO en: app/api/webhooks/mercadopago/route.ts:313
// Enviar alerta al equipo de soporte

// Ejemplo:
async function alertSupportTeam(claim: any) {
  // Opción 1: Email
  await sendEmail({
    to: 'support@tudominio.com',
    subject: `⚠️ Nuevo reclamo: ${claim.type}`,
    body: `
      Reclamo ID: ${claim.id}
      Usuario: ${claim.userId}
      Monto: $${claim.amount}
      Razón: ${claim.reason}
    `,
  });

  // Opción 2: Slack/Discord
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      text: `🚨 Nuevo reclamo recibido: ${claim.type}`,
    }),
  });
}
```

### 3. Dashboard de Admin

```typescript
// TODO en: app/api/webhooks/mercadopago/route.ts:314
// Crear vista en dashboard para gestionar reclamos

// Crear en: app/admin/claims/page.tsx
export default function ClaimsPage() {
  const claims = useClaims(); // Hook para obtener reclamos

  return (
    <div>
      <h1>Reclamos</h1>
      <ClaimsTable claims={claims} />
    </div>
  );
}
```

---

## 🧪 Probar el Sistema

### Desarrollo

En desarrollo NO puedes generar reclamos reales con credenciales TEST. Los reclamos solo funcionan en producción.

### Producción

1. Un usuario hace una compra
2. El usuario va a https://www.mercadopago.com.ar
3. En "Actividad" → "Compras" → Selecciona el pago
4. Click en "Tengo un problema"
5. Sigue el flujo de reclamo

Tu webhook recibirá la notificación automáticamente.

---

## 📊 Análisis y Métricas

### Queries Útiles

```typescript
// Reclamos por tipo
const claimsByType = await prisma.claim.groupBy({
  by: ['type'],
  _count: true,
});

// Tasa de reclamos
const totalPayments = await prisma.payment.count();
const totalClaims = await prisma.claim.count();
const claimRate = (totalClaims / totalPayments) * 100;

// Reclamos resueltos vs abiertos
const claimsByStatus = await prisma.claim.groupBy({
  by: ['status'],
  _count: true,
});

// Tiempo promedio de resolución
const resolvedClaims = await prisma.claim.findMany({
  where: {
    status: 'resolved',
    resolutionDate: { not: null },
  },
  select: {
    claimDate: true,
    resolutionDate: true,
  },
});

const avgResolutionTime = resolvedClaims.reduce((acc, claim) => {
  const diff = claim.resolutionDate!.getTime() - claim.claimDate.getTime();
  return acc + diff;
}, 0) / resolvedClaims.length;

console.log(`Tiempo promedio: ${avgResolutionTime / (1000 * 60 * 60 * 24)} días`);
```

---

## 🛡️ Mejores Prácticas

### 1. Responde Rápido
- MercadoPago espera que respondas en 3 días
- Respuestas rápidas mejoran tu reputación

### 2. Documentación Clara
- Mantén evidencia de las transacciones
- Guarda logs de acceso del usuario
- Documenta comunicaciones

### 3. Prevención
- Descripción clara de planes
- Emails de confirmación detallados
- Términos y condiciones visibles

### 4. Seguimiento
- Revisa reclamos semanalmente
- Analiza patrones comunes
- Mejora procesos basándote en reclamos

---

## 🔗 API Reference

### MercadoPago Claims API

- **Endpoint:** `https://api.mercadopago.com/v1/claims/{id}`
- **Método:** GET
- **Headers:**
  ```
  Authorization: Bearer YOUR_ACCESS_TOKEN
  Content-Type: application/json
  ```

### Respuesta de Ejemplo

```json
{
  "id": "123456789",
  "payment_id": "987654321",
  "type": "not_received",
  "status": "opened",
  "stage": "claim",
  "amount": 4900,
  "currency_id": "ARS",
  "reason": "El usuario reporta que no recibió acceso al plan Plus",
  "date_created": "2025-01-06T12:00:00Z",
  "date_last_updated": "2025-01-06T12:00:00Z",
  "resolution_date": null,
  "expiration_date": "2025-01-13T12:00:00Z"
}
```

---

## 🐛 Troubleshooting

### Webhook no llega

**Solución:**
1. Verifica que seleccionaste "Reclamos" en la configuración de webhooks
2. Asegúrate que la URL sea accesible (HTTPS en producción)
3. Revisa los logs del webhook en MercadoPago

### Error al guardar en DB

**Error:** `Cannot find userId for claim`

**Causa:** El pago relacionado no existe en tu base de datos

**Solución:**
1. Verifica que estés guardando todos los pagos
2. Revisa que el `mercadopagoPaymentId` sea correcto
3. Considera guardar el reclamo de todas formas con `userId = null` para no perder información

### Claim no se encuentra

**Error:** `Failed to fetch claim: 404`

**Causa:** El claim ID no es válido o fue eliminado

**Solución:**
1. Verifica el claim ID en el dashboard de MercadoPago
2. Revisa los logs del webhook para ver el ID recibido

---

## 📚 Recursos

### Documentación Oficial
- **Claims API:** https://www.mercadopago.com.ar/developers/es/reference/claims
- **Webhooks:** https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
- **Disputas:** https://www.mercadopago.com.ar/ayuda/32117

### Panel de MercadoPago
- **Gestión de Reclamos:** https://www.mercadopago.com.ar/activities/claims

---

## ✅ Checklist de Implementación

- [x] Modelo `Claim` creado en Prisma
- [x] Handler `handleClaimEvent` implementado
- [x] Switch case actualizado en webhook
- [ ] Migración aplicada (`npx prisma migrate dev`)
- [ ] Webhook configurado en MercadoPago
- [ ] Implementar notificación al usuario (TODO)
- [ ] Implementar alerta a soporte (TODO)
- [ ] Crear dashboard de admin para reclamos (TODO)
- [ ] Probar con reclamo real en producción
- [ ] Documentar proceso de respuesta a reclamos

---

## 🎯 Próximos Pasos

1. **Aplicar migración:**
   ```bash
   npx prisma migrate dev --name add_claims_table
   ```

2. **Configurar webhook** para incluir "Reclamos"

3. **Implementar notificaciones** (opcional pero recomendado)

4. **Crear dashboard de admin** (opcional)

5. **Probar en producción** cuando tengas pagos reales

---

**Última actualización:** 2025-01-06
**Estado:** ✅ Código implementado, listo para configurar webhook
