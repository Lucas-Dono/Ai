# Checklist: Deploy Sistema Redis para Mundos Virtuales

## ✅ Pre-Deploy (Verificación Local)

### 1. Dependencias Instaladas
```bash
npm install @upstash/redis @upstash/ratelimit
```

### 2. Variables de Entorno (Desarrollo)
```bash
# .env.local
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

### 3. Build Local
```bash
npm run build
```

**Verificar que compile sin errores críticos en:**
- `/lib/worlds/world-state-redis.ts`
- `/lib/worlds/simulation-engine.ts`
- `/app/api/worlds/[id]/message/route.ts`

### 4. Tests (Opcional pero Recomendado)
```bash
# Ejecutar suite de tests
npx tsx scripts/test-redis-world-state.ts

# Esperar: 8/8 tests passed
```

---

## 🚀 Deploy a Producción

### Paso 1: Setup Redis (Upstash)

1. **Crear cuenta**: [upstash.com](https://upstash.com/)
2. **Create Database**:
   - Name: `creador-inteligencias-worlds`
   - Region: Nearest to your production server
   - Tier: Free (10k commands/day)
3. **Copiar credenciales**:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### Paso 2: Configurar Variables en Producción

**Vercel:**
```bash
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
```

**Railway:**
```bash
railway variables set UPSTASH_REDIS_REST_URL="https://..."
railway variables set UPSTASH_REDIS_REST_TOKEN="..."
```

**Otras plataformas:**
Agregar variables de entorno en el dashboard de tu plataforma.

### Paso 3: Deploy

```bash
# Commit y push
git add .
git commit -m "feat: Implementar sistema Redis para mundos virtuales"
git push origin main

# O deploy manual
npm run build
vercel deploy --prod
```

### Paso 4: Verificar Logs

Esperar estos logs en producción:

```
✅ [RedisSyncInit] Redis sync system initialized
✅ [WorldStateRedis] Starting sync background job (interval: 300s)
✅ [WorldStateRedis] Cache HIT - Redis
✅ [WorldStateRedis] Lock ACQUIRED
```

---

## 🔍 Verificación Post-Deploy

### 1. Verificar Sistema Funcionando

**Endpoint de health check:**
```bash
# Test message endpoint con Redis
curl -X POST https://your-app.com/api/worlds/{worldId}/message \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message"}'

# Respuesta esperada:
# Status: 200 o 503 (si locked)
# Headers: Retry-After (si locked)
```

### 2. Monitorear Upstash Console

Ir a [console.upstash.com](https://console.upstash.com/):
- **Commands**: Debe ser bajo (<100/min después de warmup)
- **Memory**: Debe ser estable (<50MB)
- **Hit Rate**: Debe ser >70% después de 10 minutos

### 3. Verificar Logs de Producción

**Buscar estos patrones:**

✅ **Cache funcionando:**
```
[WorldStateRedis] ✅ Cache HIT - Redis (duration: 8ms)
```

✅ **Locks funcionando:**
```
[WorldStateRedis] 🔒 Lock ACQUIRED (worldId: xxx)
[WorldStateRedis] 🔓 Lock RELEASED (worldId: xxx)
```

✅ **Sync funcionando:**
```
[WorldStateRedis] 🔄 Running sync job for active worlds
[WorldStateRedis] ✅ Sync job completed (synced: 5, total: 5)
```

⚠️ **Warnings esperables:**
```
[WorldStateRedis] ⚠️ Lock FAILED - World already locked
(Esto es NORMAL en concurrencia alta)
```

### 4. Test de Carga (Opcional)

```bash
# Enviar 10 mensajes concurrentes al mismo mundo
for i in {1..10}; do
  curl -X POST https://your-app.com/api/worlds/{worldId}/message \
    -H "Content-Type: application/json" \
    -d "{\"content\": \"Test $i\"}" &
done
wait

# Verificar:
# - Solo 1 debe procesar (200)
# - 9 deben recibir 503 (locked)
# - Sin race conditions en DB
```

---

## 📊 Métricas a Monitorear (Primera Semana)

### Antes vs Después

**Crashes por Race Conditions:**
- Target: <1/día (vs ~20/día antes)
- Métrica: Errores de "unique constraint violation"

**Latencia de Mundos:**
- Target: <50ms p95 (vs ~200ms antes)
- Métrica: Tiempo de respuesta del endpoint `/worlds/[id]/message`

**Carga de DB:**
- Target: -70% queries (vs antes)
- Métrica: DB queries/segundo en dashboard

**Uso de Redis:**
- Commands/min: <100 en steady state
- Memory usage: <50MB
- Hit rate: >70%

---

## 🐛 Troubleshooting

### Problema 1: "Redis not configured"

**Síntomas:**
```
[WorldStateRedis] ⚠️ Redis not configured, skipping cache
```

**Solución:**
1. Verificar variables de entorno:
   ```bash
   echo $UPSTASH_REDIS_REST_URL
   echo $UPSTASH_REDIS_REST_TOKEN
   ```
2. Reiniciar servidor después de agregar variables
3. Verificar que no haya typos en nombres de variables

---

### Problema 2: "World is locked" constante

**Síntomas:**
```
Error: World is busy processing another message
Status: 503 (todo el tiempo)
```

**Causa:** Lock no se liberó por crash del proceso

**Solución:**
- **Automática**: Los locks expiran en 30 segundos
- **Manual**: Reiniciar Redis (elimina todos los locks)
- **Prevención**: Verificar que `finally` blocks siempre liberen locks

---

### Problema 3: Cache siempre MISS

**Síntomas:**
```
[WorldStateRedis] ❌ Cache MISS - Loading from DB (todo el tiempo)
```

**Causas posibles:**
1. TTL muy corto (<1 hora)
2. Redis con poca memoria (eviction)
3. Invalidación excesiva del cache

**Solución:**
```typescript
// Verificar métricas
const service = getWorldStateRedis();
const metrics = service.getMetrics();
console.log(metrics); // Ver hit rate
```

---

### Problema 4: Sync job no ejecuta

**Síntomas:**
- No aparecen logs de sync cada 5 minutos
- Estado en DB no se actualiza

**Verificar:**
1. Socket server inicializado:
   ```typescript
   // lib/socket/server.ts debe llamar:
   initializeRedisSync();
   ```

2. Logs de inicio:
   ```
   [RedisSyncInit] ✅ Redis sync system initialized
   ```

**Solución:**
- Verificar que el servidor Socket.IO esté corriendo
- Reiniciar servidor

---

### Problema 5: Estado desactualizado

**Síntomas:**
- Cambios en DB no reflejados en frontend
- Turno number incorrecto

**Causa:** Cache no invalidado después de cambios externos

**Solución:**
```typescript
// Siempre invalidar después de modificar DB directamente
await redisService.invalidateCache(worldId);
```

---

## 🔄 Rollback Plan

Si algo sale mal, puedes hacer rollback rápido:

### Opción 1: Deshabilitar Redis (emergencia)

```bash
# Remover variables de entorno
vercel env rm UPSTASH_REDIS_REST_URL
vercel env rm UPSTASH_REDIS_REST_TOKEN

# Redeploy
vercel deploy --prod
```

**Efecto**: El sistema usa fallback in-memory (funcional pero sin optimizaciones)

### Opción 2: Revert commits

```bash
# Encontrar commit anterior
git log --oneline | head -5

# Revert
git revert <commit-hash>
git push origin main
```

---

## ✅ Checklist Final

Antes de considerar el deploy exitoso:

- [ ] Redis configurado en Upstash
- [ ] Variables de entorno en producción
- [ ] Build exitoso sin errores críticos
- [ ] Logs de inicialización correctos
- [ ] Cache HIT después de 2 requests al mismo mundo
- [ ] Locks funcionando (503 en concurrencia)
- [ ] Sync job ejecutándose cada 5 minutos
- [ ] Métricas en Upstash normales (<100 cmd/min)
- [ ] Tests manuales de funcionalidad básica
- [ ] Monitoreo configurado (Sentry/Datadog opcional)

---

## 📞 Soporte

Si necesitas ayuda:

1. **Revisar documentación completa**: `REDIS_WORLD_STATE_SYSTEM.md`
2. **Ejecutar tests**: `npx tsx scripts/test-redis-world-state.ts`
3. **Ver logs detallados**: Buscar `[WorldStateRedis]` y `[RedisSyncInit]`
4. **Verificar métricas**: Upstash Console

---

## 🎉 Success Criteria

El deploy es exitoso cuando:

✅ 0 crashes por race conditions en 24 horas
✅ Latencia p95 <50ms en endpoint de mundos
✅ Cache hit rate >70% después de 1 hora
✅ Sync job ejecutándose sin errores
✅ Uso de Redis <100 commands/min steady state

**¡Ready to deploy! 🚀**
