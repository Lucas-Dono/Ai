# Guía de Testing del Sistema de Analytics

Esta guía te permitirá verificar que todo el sistema de analytics funciona correctamente.

---

## Pre-requisitos

1. **Base de datos limpia** con modelos aplicados:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

2. **Variables de entorno** configuradas:
   ```bash
   cat .env | grep -E "DATABASE_URL|NEXT_PUBLIC_DEV_ADMIN_EMAIL|NODE_ENV"
   ```
   Debe mostrar:
   - `DATABASE_URL="postgresql://..."`
   - `NEXT_PUBLIC_DEV_ADMIN_EMAIL="tu@email.com"`
   - `NODE_ENV=development`

3. **Certificado admin** generado:
   ```bash
   npm run admin:generate-cert -- "tu@email.com" "Dev Machine" 720
   ```

---

## Fase 1: Verificación de Compilación

### 1.1 Build de Next.js

```bash
npm run build
```

**Resultado esperado**: Build exitoso sin errores críticos

**Nota**: Puede haber warnings de `FeaturesGrid.patched.tsx` - ignorar

---

## Fase 2: Servidor de Desarrollo

### 2.1 Iniciar servidor

```bash
npm run dev
```

**Resultado esperado**:
```
✓ Ready in X ms
○ Compiling / ...
✓ Compiled / in X ms
Local: http://localhost:3000
```

### 2.2 Verificar dashboard admin

1. Navega a: `http://localhost:3000/congrats`
2. **Esperado**: Dashboard principal con métricas
3. Verifica que el menú lateral muestre "Analytics"

---

## Fase 3: Testing de Analytics Dashboard

### 3.1 Acceder a Analytics

1. Click en "Analytics" en el menú lateral
2. O navega directamente a: `http://localhost:3000/congrats/analytics`

**Resultado esperado**:
- Página carga sin errores
- Se muestran 3 tabs: Funnel, Landing Page, Conversión
- Selector de rango temporal (7d, 30d, 90d)

### 3.2 Tab "Funnel"

**Verificar**:
- [ ] 4 MetricCards en la parte superior
- [ ] Gráfico de funnel horizontal (7 stages)
- [ ] Tabla de análisis de drop-off
- [ ] Loading states aparecen inicialmente

**Datos esperados inicialmente**:
- Todos los valores en 0 (no hay datos aún)
- NO debe haber errores de JavaScript

### 3.3 Tab "Landing Page"

**Verificar**:
- [ ] 4 MetricCards de overview
- [ ] 3 Cards de engagement (demo)
- [ ] Tabla de fuentes de tráfico (vacía inicialmente)
- [ ] Gráfico circular de dispositivos (vacío)

### 3.4 Tab "Conversión"

**Verificar**:
- [ ] 3 MetricCards de planes (Free, Plus, Ultra)
- [ ] Gráfico donut de distribución
- [ ] 3 Cards de tasas de conversión
- [ ] 3 Cards de revenue (MRR, ARR, Churn)

---

## Fase 4: Testing de API Endpoints

### 4.1 Verificar endpoints responden

**Terminal 1** (mantén el servidor corriendo):
```bash
npm run dev
```

**Terminal 2** (ejecuta las pruebas):

```bash
# Funnel endpoint
curl -X GET "http://localhost:3000/api/congrats-secure/analytics/funnel?days=30" \
  -H "X-Dev-Admin-Email: tu@email.com" \
  | jq

# Landing endpoint
curl -X GET "http://localhost:3000/api/congrats-secure/analytics/landing?days=30" \
  -H "X-Dev-Admin-Email: tu@email.com" \
  | jq

# Conversion endpoint
curl -X GET "http://localhost:3000/api/congrats-secure/analytics/conversion?days=30" \
  -H "X-Dev-Admin-Email: tu@email.com" \
  | jq
```

**Resultado esperado**:
```json
{
  "timeRange": {
    "days": 30,
    "start": "2025-12-13T...",
    "end": "2026-01-12T..."
  },
  "data": {
    "funnel": [...],
    "dropoff": [...]
  }
}
```

**Si obtienes 401 Unauthorized**:
- Verifica que `NEXT_PUBLIC_DEV_ADMIN_EMAIL` está en `.env`
- Verifica que generaste el certificado para ese email
- Reinicia el servidor

---

## Fase 5: Testing de Tracking Client-Side

### 5.1 Instrumentar Landing Page

El tracking ya está implementado en:
- `app/landing/page.tsx`
- `components/landing/HeroSection.tsx`
- `components/landing/LandingDemoChat.tsx`

### 5.2 Probar tracking

1. Abre DevTools → Network tab
2. Navega a: `http://localhost:3000/landing`
3. Filtra por `/analytics/track`

**Acciones a realizar**:

a) **Page view**:
   - Al cargar la página
   - Esperado: POST a `/api/analytics/track` con `eventType: "LANDING_PAGE_VIEW"`

b) **Scroll depth**:
   - Scrollea hacia abajo
   - Esperado: Eventos de scroll_depth (25%, 50%, 75%, 100%)

c) **CTA Click**:
   - Click en botón "Empezar Gratis" o similar
   - Esperado: POST con `eventType: "LANDING_CTA_PRIMARY"`

d) **Demo Chat** (si aplica):
   - Envía un mensaje en el demo
   - Esperado: `LANDING_DEMO_START`, `LANDING_DEMO_MESSAGE`

### 5.3 Verificar datos en BD

```bash
# En la terminal SQL
psql $DATABASE_URL -c "SELECT COUNT(*), \"eventType\" FROM \"AnalyticsEvent\" GROUP BY \"eventType\";"
```

**Resultado esperado**:
```
 count |     eventType
-------+-------------------
     1 | LANDING_PAGE_VIEW
     3 | LANDING_DEMO_MESSAGE
     1 | LANDING_CTA_PRIMARY
```

---

## Fase 6: Testing de Cron Jobs

### 6.1 Preparar datos de prueba

Primero genera algunos eventos manualmente:

```bash
# Crear un evento de test
curl -X POST "http://localhost:3000/api/analytics/track" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "LANDING_PAGE_VIEW",
    "metadata": {
      "sessionId": "test-session-123",
      "url": "http://localhost:3000/landing",
      "deviceType": "desktop"
    }
  }'
```

### 6.2 Ejecutar cron jobs manualmente

```bash
# Daily KPIs aggregation
npx tsx scripts/test-cron.ts daily-kpis

# User summaries update
npx tsx scripts/test-cron.ts user-summaries

# O ambos
npx tsx scripts/test-cron.ts all
```

**Resultado esperado**:
```
🔄 Testing Cron Jobs...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Testing: Aggregate Daily KPIs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏳ Running job... (this may take a few seconds)

✅ SUCCESS (8234ms)

Key Metrics:
  • Landing Views: 1250
  • Signups: 42
  • DAU: 320
  • Total Messages: 2840
  • D1 Retention: 45.5%
```

### 6.3 Verificar KPIs en BD

```bash
psql $DATABASE_URL -c "SELECT * FROM \"DailyKPI\" ORDER BY date DESC LIMIT 1;"
```

**Resultado esperado**: Registro con la fecha de ayer y métricas calculadas

---

## Fase 7: Testing End-to-End

### 7.1 Flujo completo simulado

1. **Landing Page**:
   ```bash
   # Simular 10 visitas
   for i in {1..10}; do
     curl -X POST "http://localhost:3000/api/analytics/track" \
       -H "Content-Type: application/json" \
       -d "{\"eventType\": \"LANDING_PAGE_VIEW\", \"metadata\": {\"sessionId\": \"session-$i\"}}"
   done
   ```

2. **Demo Starts**:
   ```bash
   # Simular 5 demo starts
   for i in {1..5}; do
     curl -X POST "http://localhost:3000/api/analytics/track" \
       -H "Content-Type: application/json" \
       -d "{\"eventType\": \"LANDING_DEMO_START\", \"metadata\": {\"sessionId\": \"session-$i\"}}"
   done
   ```

3. **Ejecutar agregación**:
   ```bash
   npx tsx scripts/test-cron.ts daily-kpis
   ```

4. **Verificar en dashboard**:
   - Recarga `http://localhost:3000/congrats/analytics`
   - Tab "Funnel": Debería mostrar 10 landing views, 5 demo starts
   - Tasa de conversión: 50% (5/10)

---

## Fase 8: Checklist de Verificación Final

### 8.1 Funcionalidad Core

- [ ] Dashboard admin carga sin errores
- [ ] Menú "Analytics" navega correctamente
- [ ] 3 tabs funcionan (Funnel, Landing, Conversion)
- [ ] Selector de rango temporal cambia los datos
- [ ] Loading states aparecen correctamente
- [ ] Error states se muestran si falla API

### 8.2 API Endpoints

- [ ] `/api/congrats-secure/analytics/funnel` responde
- [ ] `/api/congrats-secure/analytics/landing` responde
- [ ] `/api/congrats-secure/analytics/conversion` responde
- [ ] `/api/congrats-secure/analytics/users/:userId` responde
- [ ] Todos requieren autenticación admin

### 8.3 Tracking

- [ ] Landing page tracking funciona
- [ ] Eventos se guardan en `AnalyticsEvent`
- [ ] SessionId se persiste correctamente
- [ ] UTM params se capturan

### 8.4 Cron Jobs

- [ ] `aggregate-daily-kpis` ejecuta sin errores
- [ ] `update-user-summaries` ejecuta sin errores
- [ ] Datos se guardan en `DailyKPI`
- [ ] `UserAnalyticsSummary` se actualiza

### 8.5 Visualizaciones

- [ ] Gráficos de barras (funnel) renderizan
- [ ] Gráficos circulares (pie) renderizan
- [ ] Tablas muestran datos correctamente
- [ ] Tooltips funcionan en gráficos
- [ ] Responsive design (mobile/desktop)

---

## Troubleshooting

### Error: "Unauthorized" en APIs

**Causa**: Falta certificado admin o email incorrecto

**Solución**:
```bash
# Verificar email en .env
echo $NEXT_PUBLIC_DEV_ADMIN_EMAIL

# Regenerar certificado
npm run admin:generate-cert -- "tu@email.com" "Dev" 720

# Reiniciar servidor
npm run dev
```

### Error: "Cannot find module @/lib/..."

**Causa**: Imports no resueltos

**Solución**:
```bash
# Limpiar cache
rm -rf .next
npm run dev
```

### Error: Gráficos no aparecen

**Causa**: Recharts no instalado o datos vacíos

**Solución**:
```bash
# Verificar Recharts
npm list recharts

# Si no está instalado
npm install recharts

# Generar datos de prueba (ver Fase 7.1)
```

### Error: Cron jobs fallan

**Causa**: Base de datos sin datos o CRON_SECRET incorrecto

**Solución**:
```bash
# Verificar BD
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"

# Verificar CRON_SECRET
grep CRON_SECRET .env

# Ejecutar con más detalle
NODE_ENV=development npx tsx scripts/test-cron.ts daily-kpis
```

---

## Performance Benchmarks

### API Response Times (con datos)

| Endpoint | Tamaño BD | Tiempo Esperado |
|----------|-----------|-----------------|
| `/analytics/funnel` | 1K users | < 500ms |
| `/analytics/landing` | 1K users | < 800ms |
| `/analytics/conversion` | 1K users | < 600ms |
| `/analytics/users/:id` | - | < 200ms |

### Cron Jobs Duration

| Job | Frecuencia | Duración Esperada |
|-----|------------|-------------------|
| `aggregate-daily-kpis` | Diario | 5-30 segundos |
| `update-user-summaries` | Cada hora | 10-60 segundos |

---

## Próximos Pasos

Una vez completado el testing:

1. **Deploy a Staging**:
   ```bash
   git add .
   git commit -m "feat(analytics): Sistema completo de analytics y KPIs"
   git push
   vercel --prod
   ```

2. **Configurar Cron en Vercel**:
   - Settings → Cron Jobs
   - Verificar que `vercel.json` está configurado
   - Agregar `CRON_SECRET` en Environment Variables

3. **Monitorear Primera Ejecución**:
   - Dashboard → Logs
   - Filtrar por `/api/cron/`
   - Verificar éxito a las 00:05 UTC

4. **Implementar Alertas** (opcional):
   - Slack/Discord webhook en cron jobs
   - Notificar si falla o métricas críticas

---

## Resumen de Comandos Rápidos

```bash
# Setup inicial
npm run dev
npm run admin:generate-cert -- "tu@email.com" "Dev" 720

# Testing manual
curl "http://localhost:3000/api/congrats-secure/analytics/funnel?days=30" \
  -H "X-Dev-Admin-Email: tu@email.com" | jq

# Cron jobs
npx tsx scripts/test-cron.ts all

# Verificar BD
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"AnalyticsEvent\";"
psql $DATABASE_URL -c "SELECT * FROM \"DailyKPI\" ORDER BY date DESC LIMIT 1;"

# Build production
npm run build
vercel --prod
```

---

**¡Sistema de Analytics Completo y Listo para Producción!** 🚀
