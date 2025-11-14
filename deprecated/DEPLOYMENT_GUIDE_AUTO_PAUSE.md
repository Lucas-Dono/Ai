# Guía de Deployment - Sistema de Auto-Pause

## Pre-requisitos

- [x] Código implementado completamente
- [ ] Acceso a base de datos PostgreSQL
- [ ] Acceso a Vercel (o plataforma de hosting)
- [ ] 15 minutos de tiempo

## Paso 1: Generar CRON_SECRET

```bash
# Opción A: Usar script incluido
node scripts/generate-cron-secret.js

# Opción B: Generar manualmente
openssl rand -base64 32
```

Copiar el token generado para los siguientes pasos.

## Paso 2: Configurar Variables de Entorno

### Local (.env)

```bash
# Agregar al archivo .env
CRON_SECRET="<token-generado-en-paso-1>"
```

### Vercel (Producción)

```bash
# Opción A: CLI
vercel env add CRON_SECRET production
# Pegar el token cuando se solicite

# Opción B: Dashboard
# 1. Ir a Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
# 2. Click "Add New"
# 3. Name: CRON_SECRET
# 4. Value: <token-generado>
# 5. Environment: Production
# 6. Click "Save"
```

## Paso 3: Ejecutar Migración de Prisma

### En Local (Desarrollo)

```bash
# Generar y aplicar migración
npx prisma migrate dev --name add_world_auto_pause

# Verificar que se aplicó correctamente
npx prisma db push
```

### En Producción

**IMPORTANTE**: Hacer backup de la base de datos antes de ejecutar migraciones en producción.

```bash
# Backup de DB (ejemplo con PostgreSQL)
pg_dump $DATABASE_URL > backup_before_auto_pause_$(date +%Y%m%d_%H%M%S).sql

# Aplicar migración en producción
npx prisma migrate deploy

# Verificar
npx prisma db push
```

## Paso 4: Verificar vercel.json

Asegurarse de que `vercel.json` contiene los cron jobs:

```json
{
  "crons": [
    {
      "path": "/api/cron/auto-pause-worlds",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/delete-scheduled-worlds",
      "schedule": "0 3 * * *"
    }
  ]
}
```

## Paso 5: Deploy a Producción

```bash
# Commit cambios
git add .
git commit -m "feat: Implementar sistema de auto-pause para mundos (ahorro 50% costos)"

# Push a main/producción
git push origin main

# Vercel automáticamente desplegará
```

## Paso 6: Verificar Cron Jobs en Vercel

1. Ir a **Vercel Dashboard** → Tu Proyecto → **Settings** → **Cron Jobs**
2. Deberías ver:
   - `/api/cron/auto-pause-worlds` - Schedule: `0 */6 * * *`
   - `/api/cron/delete-scheduled-worlds` - Schedule: `0 3 * * *`
3. Click en "Run" para probar manualmente
4. Verificar logs en la pestaña "Logs"

## Paso 7: Test Post-Deployment

### Test 1: Verificar Endpoints

```bash
# Test auto-pause endpoint (reemplazar URL y token)
curl -X POST https://tu-dominio.vercel.app/api/cron/auto-pause-worlds \
  -H "Authorization: Bearer $CRON_SECRET"

# Debería retornar:
{
  "success": true,
  "stats": {
    "totalPaused": 0,
    "pausedBy24h": 0,
    "pausedBy7d": 0,
    "pausedBy30d": 0,
    "skippedFavorites": 0,
    "skippedWithEvents": 0,
    "estimatedSavings": {
      "llmCalls": 0,
      "redisMemoryMB": 0,
      "costUSD": 0
    }
  }
}
```

### Test 2: Test de Auto-Resume

```bash
# 1. Pausar un mundo manualmente (desde DB o UI)
UPDATE "World" SET "isPaused" = true, "pauseReason" = 'manual', "pausedAt" = NOW()
WHERE id = 'test-world-id';

# 2. Enviar mensaje a ese mundo (debería auto-resumir)
curl -X POST https://tu-dominio.vercel.app/api/worlds/test-world-id/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"content": "Hola!"}'

# 3. Verificar que el mundo se reactivó
SELECT "isPaused", "pausedAt", "lastActiveAt"
FROM "World"
WHERE id = 'test-world-id';
```

### Test 3: Test de Cron Schedule

```bash
# Verificar que los cron jobs se ejecutan según schedule
# Revisar logs en Vercel Dashboard cada 6 horas

# Logs esperados:
[WorldPauseService] Starting auto-pause process for inactive worlds
[WorldPauseService] Found active worlds to evaluate: { count: X }
[CronAutoPause] Auto-pause cron job completed successfully
```

## Paso 8: Monitoreo Continuo

### Configurar Alertas (Opcional)

En Vercel:
1. Settings → Notifications
2. Configurar alertas para errores en cron jobs
3. Agregar webhook o email

### Dashboard de Estadísticas

Crear página de admin para ver estadísticas:

```typescript
// app/admin/worlds-stats/page.tsx
const stats = await fetch('/api/cron/auto-pause-worlds', {
  method: 'GET', // Solo en dev
});
```

### Métricas a Monitorear

- **Total de mundos pausados**: Debería aumentar gradualmente
- **Ahorro estimado en USD**: Calculado automáticamente
- **Errores en cron jobs**: Debería ser 0
- **Tiempo de ejecución**: Debería ser < 30 segundos

## Troubleshooting

### Error: CRON_SECRET not configured

**Causa**: Variable de entorno no configurada

**Solución**:
```bash
vercel env add CRON_SECRET production
# Pegar token y redeploy
vercel --prod
```

### Error: Unauthorized (401)

**Causa**: Token incorrecto o header mal formado

**Solución**:
1. Verificar que el header es: `Authorization: Bearer <token>`
2. Verificar que el token es el mismo en .env y en la request

### Error: Migration failed

**Causa**: Conflicto con schema existente

**Solución**:
```bash
# Reset y volver a intentar
npx prisma migrate reset
npx prisma migrate deploy
```

### Cron jobs no se ejecutan

**Causa**: vercel.json no está en la raíz del proyecto

**Solución**:
1. Mover `vercel.json` a la raíz
2. Redeploy
3. Verificar en Vercel Dashboard → Settings → Cron Jobs

### Mundos no se pausan

**Causa**: `lastActiveAt` no se está actualizando

**Solución**:
1. Verificar que el endpoint de mensaje llama a `WorldPauseService.updateLastActive()`
2. Verificar que la migración se aplicó correctamente
3. Revisar logs del cron job

## Rollback (si algo sale mal)

### Rollback de Código

```bash
# Volver al commit anterior
git revert HEAD
git push origin main
```

### Rollback de Base de Datos

```bash
# Restaurar backup
psql $DATABASE_URL < backup_before_auto_pause_YYYYMMDD_HHMMSS.sql

# O revertir migración específica
npx prisma migrate resolve --rolled-back "add_world_auto_pause"
```

## Checklist de Deployment

- [ ] CRON_SECRET generado y guardado de forma segura
- [ ] Variable CRON_SECRET configurada en Vercel (producción)
- [ ] Variable CRON_SECRET configurada en .env (local)
- [ ] Backup de base de datos realizado
- [ ] Migración de Prisma ejecutada (local)
- [ ] Migración de Prisma ejecutada (producción)
- [ ] Código commiteado y pusheado a main
- [ ] Vercel desplegó automáticamente
- [ ] Cron jobs visibles en Vercel Dashboard
- [ ] Test 1 ejecutado (endpoint funciona)
- [ ] Test 2 ejecutado (auto-resume funciona)
- [ ] Logs monitoreados por 24 horas
- [ ] Documentación leída por el equipo

## Notas Importantes

1. **No exponer CRON_SECRET**: Este token debe mantenerse secreto y seguro
2. **Backup antes de migración**: Siempre hacer backup de producción antes de migraciones
3. **Monitorear primeras 24h**: Revisar logs y estadísticas después del deployment
4. **Mundos favoritos**: Instruir a usuarios cómo marcar mundos como favoritos
5. **Comunicación**: Notificar a usuarios sobre la nueva funcionalidad

## Soporte

Si encuentras problemas:

1. Revisar logs en Vercel Dashboard
2. Revisar documentación completa: `docs/WORLD_AUTO_PAUSE_SYSTEM.md`
3. Revisar código fuente: `lib/services/world-pause.service.ts`
4. Crear issue en GitHub con logs y detalles

---

**Tiempo estimado de deployment**: 15-30 minutos

**Impacto en usuarios**: Ninguno (transparente)

**Ahorro de costos**: 50% para mundos inactivos

**Riesgo**: Bajo (sistema tiene rollback fácil)

---

**Creado**: 2025-10-31
**Versión**: 1.0.0
