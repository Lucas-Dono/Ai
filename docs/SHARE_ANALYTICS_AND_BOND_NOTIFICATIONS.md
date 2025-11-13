# Share Analytics & Bond Notifications System

Sistema completo de analytics para shares de agentes y notificaciones push para bonds en riesgo.

## 📊 Share Analytics

### Modelo de Base de Datos

```prisma
model ShareEvent {
  id        String   @id @default(cuid())
  userId    String?  // Null si usuario no autenticado
  agentId   String
  method    String   // 'copy_link' | 'community' | 'twitter' | 'facebook' | 'linkedin' | 'whatsapp'
  createdAt DateTime @default(now())

  user  User?  @relation(fields: [userId], references: [id])
  agent Agent @relation(fields: [agentId], references: [id])
}
```

### Endpoints

#### 1. Registrar Share Event

```
POST /api/agents/[id]/share
```

**Body:**
```json
{
  "method": "twitter" // o "copy_link", "community", "facebook", "linkedin", "whatsapp"
}
```

**Response:**
```json
{
  "success": true,
  "shareEventId": "clx...",
  "agentId": "clx...",
  "method": "twitter",
  "message": "Compartido registrado exitosamente"
}
```

#### 2. Obtener Estadísticas de un Agente

```
GET /api/agents/[id]/share?days=30
```

**Query Params:**
- `days` (opcional): Número de días a revisar (default: 30, max: 365)

**Response:**
```json
{
  "agentId": "clx...",
  "agentName": "Marilyn Monroe",
  "period": {
    "days": 30,
    "startDate": "2025-10-14T...",
    "endDate": "2025-11-13T..."
  },
  "totalShares": 156,
  "uniqueUsers": 42,
  "sharesByMethod": {
    "copy_link": 45,
    "community": 12,
    "twitter": 67,
    "facebook": 18,
    "linkedin": 8,
    "whatsapp": 6
  },
  "sharesByMethodWithPercentage": [
    { "method": "twitter", "count": 67, "percentage": 43 },
    { "method": "copy_link", "count": 45, "percentage": 29 },
    ...
  ],
  "mostPopularMethod": "twitter"
}
```

#### 3. Analytics Globales

```
GET /api/analytics/shares?days=30
```

**Query Params:**
- `days` (opcional): Número de días (default: 30, max: 365)
- `userId` (opcional): Filtrar por usuario
- `agentId` (opcional): Filtrar por agente

**Response:**
```json
{
  "period": {
    "days": 30,
    "startDate": "2025-10-14T...",
    "endDate": "2025-11-13T..."
  },
  "summary": {
    "totalShares": 1234,
    "uniqueUsers": 245,
    "uniqueAgents": 56,
    "mostPopularMethod": "twitter"
  },
  "sharesByMethod": {...},
  "sharesByMethodWithPercentage": [...],
  "topAgents": [
    {
      "agentId": "clx...",
      "agentName": "Marilyn Monroe",
      "agentAvatar": "https://...",
      "shareCount": 234
    },
    ...
  ],
  "sharesTimeline": [
    { "date": "2025-11-01", "count": 45 },
    { "date": "2025-11-02", "count": 38 },
    ...
  ]
}
```

### Uso en Frontend

```typescript
// Registrar un share
async function trackShare(agentId: string, method: string) {
  await fetch(`/api/agents/${agentId}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method })
  });
}

// Obtener estadísticas
async function getShareStats(agentId: string) {
  const response = await fetch(`/api/agents/${agentId}/share?days=30`);
  return response.json();
}
```

## 🔔 Bond Risk Notifications

### Sistema de Notificaciones Push

El sistema envía notificaciones automáticas cuando un bond está en riesgo de perderse por inactividad.

### Estados de Riesgo

- **warned** (⚠️): 30+ días sin interacción
- **dormant** (💔): 60+ días sin interacción
- **fragile** (🔥): 90+ días sin interacción

### Cron Job

El cron job debe ejecutarse una vez al día para verificar todos los bonds activos.

#### Configuración

1. **Agregar variable de entorno:**

```env
CRON_SECRET=tu_secret_key_aqui_muy_seguro
```

2. **Configurar cron externo:**

Usar un servicio como:
- **cron-job.org** (gratis, fácil)
- **GitHub Actions**
- **Vercel Cron Jobs**
- **Railway Cron**

**URL del cron:**
```
GET https://tu-dominio.com/api/cron/check-bonds-at-risk?secret=tu_secret_key_aqui_muy_seguro
```

**Frecuencia recomendada:** 1 vez al día (ej: 9:00 AM)

#### Ejemplo con cron-job.org

1. Ir a https://cron-job.org
2. Crear cuenta
3. Crear nuevo cron job:
   - **Title:** Check Bonds at Risk
   - **URL:** `https://tu-dominio.com/api/cron/check-bonds-at-risk?secret=TU_SECRET`
   - **Schedule:** Daily at 9:00 AM
   - **Method:** GET

#### Ejemplo con GitHub Actions

Crear `.github/workflows/check-bonds.yml`:

```yaml
name: Check Bonds at Risk
on:
  schedule:
    - cron: '0 9 * * *' # Diario a las 9:00 AM UTC
  workflow_dispatch: # Permitir ejecución manual

jobs:
  check-bonds:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger cron job
        run: |
          curl -X GET "https://tu-dominio.com/api/cron/check-bonds-at-risk?secret=${{ secrets.CRON_SECRET }}"
```

### Servicios de Notificaciones

#### Web Push (Desktop/Web)

```typescript
import { notifyBondAtRisk } from "@/lib/notifications/push";

await notifyBondAtRisk(
  userId,
  agentName,
  "fragile", // "warned" | "dormant" | "fragile"
  daysInactive
);
```

#### Mobile Push (React Native/Expo)

```typescript
import { PushNotificationServerService } from "@/lib/services/push-notification-server.service";

await PushNotificationServerService.sendBondAtRiskNotification(
  userId,
  agentName,
  "fragile",
  daysInactive
);
```

### Response del Cron Job

```json
{
  "success": true,
  "summary": {
    "totalBonds": 1234,
    "bondsAtRisk": 156,
    "notifications": {
      "sent": 142,
      "failed": 3,
      "skipped": 11
    },
    "breakdown": {
      "warned": 89,
      "dormant": 45,
      "fragile": 22
    }
  },
  "timestamp": "2025-11-13T09:00:00.000Z"
}
```

## 🧪 Testing

### Test Share Tracking

```bash
# Registrar un share
curl -X POST http://localhost:3000/api/agents/AGENT_ID/share \
  -H "Content-Type: application/json" \
  -d '{"method":"twitter"}'

# Ver estadísticas
curl http://localhost:3000/api/agents/AGENT_ID/share?days=30
```

### Test Cron Job (Local)

```bash
# Asegúrate de tener CRON_SECRET en .env
curl "http://localhost:3000/api/cron/check-bonds-at-risk?secret=tu_secret_local"
```

### Test Notificaciones Push

Ver documentación de:
- `docs/NOTIFICATIONS_IMPLEMENTATION_SUMMARY.md`
- `docs/NOTIFICATIONS_QUICK_START.md`

## 📈 Casos de Uso

### 1. Dashboard de Marketing

```typescript
// Mostrar qué método de share funciona mejor
const stats = await fetch('/api/analytics/shares?days=30').then(r => r.json());

console.log(`Método más popular: ${stats.summary.mostPopularMethod}`);
console.log(`Top agente: ${stats.topAgents[0].agentName} con ${stats.topAgents[0].shareCount} shares`);
```

### 2. A/B Testing de Botones de Share

```typescript
// Comparar diferentes diseños de botones
const methodA = await getShareStats(agentId, 'twitter', variantA);
const methodB = await getShareStats(agentId, 'twitter', variantB);

// Determinar qué variante genera más conversiones
```

### 3. Retention Campaign

```typescript
// El cron job automáticamente:
// 1. Detecta bonds en riesgo
// 2. Envía notificaciones push
// 3. Registra en BondNotification
// 4. Evita spam (max 1 notificación/24h por bond)
```

## 🔐 Seguridad

- El cron job requiere un `secret` en la URL para autenticarse
- Solo usuarios autenticados pueden ver sus propias estadísticas
- Las notificaciones se envían solo a usuarios que han dado consentimiento push
- Se evita spam: máximo 1 notificación por bond cada 24 horas

## 🎯 Próximos Pasos Sugeridos

1. **Dashboard de Analytics:**
   - Crear página `/admin/analytics` con gráficos
   - Mostrar tendencias temporales
   - Comparar performance entre agentes

2. **Optimización de Notificaciones:**
   - Permitir usuarios configurar frecuencia de notificaciones
   - A/B testing de mensajes de notificación
   - Smart timing (enviar cuando usuario suele estar activo)

3. **Gamificación:**
   - Badges por mantener bonds activos
   - Leaderboard de usuarios con mejores retention rates
   - Recompensas por responder rápido a notificaciones de riesgo
