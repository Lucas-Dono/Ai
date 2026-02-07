# Cron Jobs de Analytics

Este documento describe el sistema de cron jobs para agregación automática de KPIs y actualización de resúmenes de usuarios.

## Índice

- [Descripción General](#descripción-general)
- [Configuración](#configuración)
- [Cron Jobs Disponibles](#cron-jobs-disponibles)
- [Testing Local](#testing-local)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Descripción General

El sistema de analytics cuenta con 2 cron jobs principales:

1. **aggregate-daily-kpis**: Calcula y almacena KPIs diarios en la tabla `DailyKPI`
2. **update-user-summaries**: Actualiza resúmenes analíticos de usuarios activos en `UserAnalyticsSummary`

### Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel Cron Scheduler                    │
│  (Ejecuta automáticamente según schedule configurado)       │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Route Handlers                         │
│  • /api/cron/aggregate-daily-kpis                           │
│  • /api/cron/update-user-summaries                          │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                     │
│  • DailyKPI (métricas agregadas por día)                    │
│  • UserAnalyticsSummary (snapshot por usuario)              │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuración

### 1. Variables de Entorno

Asegúrate de tener configuradas estas variables en tu `.env`:

```bash
# Cron Secret (protege endpoints de cron)
CRON_SECRET="your_cron_secret_here"

# Base URL (para testing local)
APP_URL="http://localhost:3000"  # En producción: https://tudominio.com
```

Para generar un `CRON_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Vercel Configuration

El archivo `vercel.json` en la raíz del proyecto configura los schedules:

```json
{
  "crons": [
    {
      "path": "/api/cron/aggregate-daily-kpis",
      "schedule": "5 0 * * *"
    },
    {
      "path": "/api/cron/update-user-summaries",
      "schedule": "0 * * * *"
    }
  ]
}
```

### 3. Prisma Models

Los cron jobs utilizan estos modelos:

- `DailyKPI`: Métricas agregadas diarias
- `UserAnalyticsSummary`: Resúmenes por usuario
- `AnalyticsEvent`: Eventos de tracking
- `UserSession`: Sesiones de usuarios
- `Message`, `Agent`, `SymbolicBond`, `Relation`: Datos de engagement

---

## Cron Jobs Disponibles

### 1. Aggregate Daily KPIs

**Endpoint:** `/api/cron/aggregate-daily-kpis`
**Schedule:** Diario a las 00:05 UTC (5 minutos después de medianoche)
**Duración típica:** 5-15 segundos

#### ¿Qué hace?

Calcula y almacena las métricas del día anterior:

- **Landing Page Metrics**: Views, demos, signups, CTAs
- **Conversion Rates**: Signup rate, demo conversion, activation
- **Engagement Metrics**: DAU, total messages, sessions
- **Monetization Metrics**: Conversiones free→plus→ultra
- **Retention Metrics**: D1, D7, D30 retention
- **Bonds Metrics**: Distribución por rarity tier

#### Request Example

```bash
curl -X GET "http://localhost:3000/api/cron/aggregate-daily-kpis" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### Response Example

```json
{
  "success": true,
  "date": "2026-01-10",
  "duration": "8234ms",
  "kpis": {
    "landing": {
      "views": 1250,
      "uniqueVisitors": 890,
      "demos": 156,
      "signups": 42
    },
    "engagement": {
      "dau": 320,
      "totalMessages": 2840,
      "avgMessagesPerUser": 8.88
    },
    "monetization": {
      "freeToPlus": 3,
      "freeToUltra": 1,
      "plusToUltra": 0
    },
    "retention": {
      "d1": 45.5,
      "d7": 28.3,
      "d30": 12.8
    }
  }
}
```

#### Idempotencia

Este job es idempotente: puede ejecutarse múltiples veces para la misma fecha sin efectos secundarios. Si ya existe un registro para la fecha, se actualiza (upsert).

---

### 2. Update User Summaries

**Endpoint:** `/api/cron/update-user-summaries`
**Schedule:** Cada hora (minuto 0)
**Duración típica:** 2-30 segundos (depende de usuarios activos)

#### ¿Qué hace?

Actualiza resúmenes analíticos de usuarios que estuvieron activos en la última hora:

- **Acquisition Data**: Source, medium, campaign (primera sesión)
- **Engagement Metrics**: Total messages, sessions, streaks
- **Agent Preferences**: Agente favorito y estadísticas
- **Bonds Summary**: Total bonds, highest tier, avg affinity
- **Monetization**: Plan actual, LTV, primera conversión
- **User Flags**: Churn risk, power user, high value

#### Request Example

```bash
curl -X GET "http://localhost:3000/api/cron/update-user-summaries" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### Response Example

```json
{
  "success": true,
  "updated": 45,
  "failed": 0,
  "total": 45,
  "duration": "12340ms"
}
```

#### Processing Strategy

- **Batch Processing**: Procesa usuarios en lotes de 10 para evitar sobrecarga
- **Error Isolation**: Si falla un usuario, continúa con los demás
- **Performance**: Pausa de 100ms entre batches para no saturar la BD

---

## Testing Local

### Opción 1: Script de Testing (Recomendado)

Usa el script `scripts/test-cron.ts` para testear manualmente:

```bash
# Testear daily KPIs
npx tsx scripts/test-cron.ts daily-kpis

# Testear user summaries
npx tsx scripts/test-cron.ts user-summaries

# Testear todos los jobs de analytics
npx tsx scripts/test-cron.ts all
```

El script:
- ✅ Valida que `CRON_SECRET` esté configurado
- ✅ Llama a los endpoints con autenticación
- ✅ Muestra respuestas detalladas y métricas
- ✅ Maneja errores y timeouts

### Opción 2: cURL Manual

Si el servidor Next.js está corriendo:

```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Call cron endpoints
curl -X GET "http://localhost:3000/api/cron/aggregate-daily-kpis" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

curl -X GET "http://localhost:3000/api/cron/update-user-summaries" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Opción 3: Testing en Desarrollo sin CRON_SECRET

Los endpoints permiten ejecución sin token en desarrollo si `CRON_SECRET` no está configurado:

```bash
# Sin CRON_SECRET en .env (solo desarrollo)
curl -X GET "http://localhost:3000/api/cron/aggregate-daily-kpis"
```

⚠️ **Advertencia**: Esto solo funciona en `NODE_ENV=development`. En producción siempre se requiere el token.

---

## Deployment

### Vercel (Recomendado)

Vercel ejecuta automáticamente los crons según el schedule en `vercel.json`:

1. **Deploy a Vercel**:
   ```bash
   vercel --prod
   ```

2. **Verificar Cron Jobs**:
   - Dashboard de Vercel → Tu proyecto → Cron Jobs
   - Verás los 2 jobs de analytics listados con sus schedules

3. **Configurar CRON_SECRET**:
   - Vercel Dashboard → Settings → Environment Variables
   - Add: `CRON_SECRET=your_secret_here`
   - Scope: Production

4. **Monitorear Ejecuciones**:
   - Dashboard → Logs
   - Filtra por `/api/cron/` para ver ejecuciones

### Manual Cron (Alternativa)

Si no usas Vercel, configura cron jobs manualmente en tu servidor:

```bash
# Crontab
# Daily KPIs (00:05 UTC)
5 0 * * * curl -X GET "https://tudominio.com/api/cron/aggregate-daily-kpis" -H "Authorization: Bearer YOUR_SECRET"

# User Summaries (cada hora)
0 * * * * curl -X GET "https://tudominio.com/api/cron/update-user-summaries" -H "Authorization: Bearer YOUR_SECRET"
```

---

## Monitoring

### Logs en Vercel

Los cron jobs loggean información detallada:

```
[CRON] Starting daily KPI aggregation for date: 2026-01-10
[CRON] Landing metrics - Views: 1250, Demos: 156, Signups: 42
[CRON] Engagement metrics - DAU: 320, Messages: 2840, Avg/User: 8.88
[CRON] Monetization metrics - Free→Plus: 3, Free→Ultra: 1, Plus→Ultra: 0
[CRON] Retention metrics - D1: 45.50%, D7: 28.30%, D30: 12.80%
[CRON] Bonds metrics - Total: 145, Avg Affinity: 68.40
[CRON] ✓ Daily KPI aggregation completed successfully in 8234ms
```

### Métricas Clave

- **Duration**: Tiempo de ejecución (target: <30s)
- **Success Rate**: % de ejecuciones exitosas (target: >99%)
- **Data Freshness**: Última actualización de KPIs

### Alertas

Configura alertas para:

1. **Failures**: Si un cron falla 2+ veces consecutivas
2. **Performance**: Si duración > 60s (timeout)
3. **Data Gaps**: Si no hay KPIs para ayer al mediodía

---

## Troubleshooting

### Error: "Unauthorized"

**Problema**: `401 Unauthorized` al llamar endpoint

**Solución**:
```bash
# Verificar que CRON_SECRET esté configurado
echo $CRON_SECRET

# Si no existe, agregarlo a .env
CRON_SECRET="generate_new_secret"

# Reiniciar servidor
npm run dev
```

### Error: "No active users found"

**Problema**: User summaries retorna 0 usuarios actualizados

**Causas comunes**:
- No hay mensajes en la última hora (normal en horas de baja actividad)
- Base de datos vacía (development)

**Solución**: Normal si no hay actividad. Testear con datos de prueba:
```sql
-- Insertar mensaje reciente para testing
INSERT INTO "Message" (id, "userId", "agentId", "conversationId", role, content, "createdAt")
VALUES ('test_msg', 'user_id', 'agent_id', 'conv_id', 'user', 'Test', NOW());
```

### Error: Timeout (maxDuration exceeded)

**Problema**: Cron job excede 60 segundos

**Soluciones**:
1. **Aumentar maxDuration** (solo Vercel Pro):
   ```ts
   export const maxDuration = 300; // 5 minutos
   ```

2. **Optimizar queries**:
   - Agregar índices en BD
   - Reducir BATCH_SIZE en user summaries
   - Usar raw SQL para queries complejas

3. **Procesar en background**:
   - Usar queue system (Redis Bull)
   - Dividir job en múltiples ejecuciones

### Error: Database Connection Issues

**Problema**: `Can't reach database server`

**Soluciones**:
- Verificar `DATABASE_URL` en variables de entorno
- Confirmar que PostgreSQL esté accesible
- Verificar límites de conexiones (Prisma connection pooling)

---

## Best Practices

### 1. Idempotencia

Los cron jobs deben ser idempotentes (safe to run multiple times):

```ts
// ✅ GOOD: Upsert
await prisma.dailyKPI.upsert({
  where: { date: yesterday },
  create: data,
  update: data
});

// ❌ BAD: Create (puede fallar si ya existe)
await prisma.dailyKPI.create({ data });
```

### 2. Error Handling

Siempre aislar errores para que un fallo no afecte todo:

```ts
// ✅ GOOD: Try-catch por usuario
for (const userId of userIds) {
  try {
    await updateUser(userId);
  } catch (error) {
    console.error(`Failed for user ${userId}:`, error);
    // Continuar con el siguiente
  }
}
```

### 3. Logging

Loggear información útil para debugging:

```ts
console.log('[CRON] Starting job...');
console.log('[CRON] Processed 42 users in 8234ms');
console.error('[CRON] Error:', error);
```

### 4. Performance

- Usar índices en BD para queries frecuentes
- Procesar en batches para muchos usuarios
- Usar `select` para solo traer campos necesarios
- Evitar N+1 queries (usar `include` o raw SQL)

---

## Próximos Pasos

- [ ] Implementar cálculo de streaks (currentStreak, longestStreak)
- [ ] Agregar caching de KPIs en Redis
- [ ] Crear dashboard de monitoring de cron jobs
- [ ] Implementar alertas automáticas vía Slack/email
- [ ] Optimizar queries con raw SQL para mejor performance
- [ ] Agregar tests unitarios para cálculos de KPIs

---

## Referencias

- [Documentación Analytics](./ANALYTICS-IMPLEMENTATION-SUMMARY.md)
- [Prisma Schema](../prisma/schema.prisma)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Script de Testing](../scripts/test-cron.ts)
