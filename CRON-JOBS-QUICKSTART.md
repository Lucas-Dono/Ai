# Cron Jobs Analytics - Quick Start Guide

## 🎯 Lo que se implementó

✅ **2 Endpoints de Cron Jobs**:
- `/api/cron/aggregate-daily-kpis` - Calcula KPIs diarios (runs diario 00:05 UTC)
- `/api/cron/update-user-summaries` - Actualiza resúmenes de usuarios (runs cada hora)

✅ **Configuración de Vercel**: `vercel.json` con schedules automáticos

✅ **Script de Testing**: `scripts/test-cron.ts` para testing local

✅ **Documentación completa**: 2 archivos en `/docs/`

---

## 🚀 Testing Local (3 pasos)

### 1. Verificar variables de entorno

```bash
# Asegurar que existe CRON_SECRET en tu .env
cat .env | grep CRON_SECRET

# Si no existe, agregar:
# CRON_SECRET="d09697ebe3fb59e1968befd2d5a265acd560f4e6a0fed2e620bb6b87cf8f0aff"
```

### 2. Iniciar servidor de desarrollo

```bash
npm run dev
```

### 3. Ejecutar script de testing

En otra terminal:

```bash
# Testear ambos jobs
npx tsx scripts/test-cron.ts all

# O testear individualmente
npx tsx scripts/test-cron.ts daily-kpis
npx tsx scripts/test-cron.ts user-summaries
```

---

## 📊 Output Esperado

### Daily KPIs Job

```
✅ SUCCESS (8234ms)

Key Metrics:
  • Landing Views: 1250
  • Signups: 42
  • DAU: 320
  • Total Messages: 2840
  • D1 Retention: 45.5%
```

### User Summaries Job

```
✅ SUCCESS (12340ms)

Update Summary:
  • Users Updated: 45
  • Failed: 0
  • Total Processed: 45
```

---

## 🔧 Testing Manual con cURL

Si prefieres usar cURL directamente:

```bash
# Asegurar que el servidor esté corriendo (npm run dev)

# Test daily KPIs
curl -X GET "http://localhost:3000/api/cron/aggregate-daily-kpis" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test user summaries
curl -X GET "http://localhost:3000/api/cron/update-user-summaries" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🌐 Deploy a Vercel

### 1. Commit y Push

```bash
git add .
git commit -m "feat(analytics): Implement cron jobs for daily KPIs and user summaries"
git push
```

### 2. Deploy

```bash
vercel --prod
```

### 3. Configurar CRON_SECRET en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Add new:
   - Name: `CRON_SECRET`
   - Value: `tu_secret_aqui`
   - Environment: Production

### 4. Verificar Cron Jobs

1. Dashboard → Cron Jobs
2. Deberías ver los 2 nuevos jobs:
   - `aggregate-daily-kpis` - Schedule: `5 0 * * *`
   - `update-user-summaries` - Schedule: `0 * * * *`

### 5. Monitorear Ejecución

1. Dashboard → Logs
2. Filtrar por `/api/cron/`
3. Ver logs de ejecución

---

## 📚 Documentación Completa

- **[CRON-JOBS-ANALYTICS.md](/docs/CRON-JOBS-ANALYTICS.md)**: Documentación completa con troubleshooting, arquitectura, best practices
- **[CRON-JOBS-IMPLEMENTATION-SUMMARY.md](/docs/CRON-JOBS-IMPLEMENTATION-SUMMARY.md)**: Resumen técnico de lo implementado

---

## ⚡ Archivos Creados

```
app/api/cron/
  ├── aggregate-daily-kpis/route.ts    (438 líneas)
  └── update-user-summaries/route.ts   (447 líneas)

scripts/
  └── test-cron.ts                     (171 líneas)

docs/
  ├── CRON-JOBS-ANALYTICS.md           (470 líneas)
  └── CRON-JOBS-IMPLEMENTATION-SUMMARY.md

vercel.json                            (nuevo)
```

---

## 🐛 Troubleshooting

### Error: "Unauthorized"

**Solución**: Verificar que `CRON_SECRET` en `.env` coincida con el header

### Error: "No active users found"

**Normal**: Si no hay mensajes en la última hora. Puedes crear un mensaje de prueba:

```sql
INSERT INTO "Message" (id, "userId", "agentId", "conversationId", role, content, "createdAt")
VALUES ('test', 'user_id', 'agent_id', 'conv_id', 'user', 'Test', NOW());
```

### Build Error (authOptions)

**No es culpa de los cron jobs**: Error pre-existente en `app/api/demo/migrate/route.ts`

---

## ✅ Checklist Final

Antes de considerar completo, verifica:

- [ ] Script de testing funciona localmente
- [ ] Ambos endpoints retornan success (no unauthorized)
- [ ] Logs muestran métricas calculadas
- [ ] vercel.json tiene los 2 nuevos crons
- [ ] CRON_SECRET está configurado en Vercel
- [ ] Primera ejecución automática fue exitosa

---

## 🎯 Próximos Pasos

1. **Implementar UI Dashboard**: Consumir datos de `DailyKPI` en dashboard admin
2. **Agregar Redis Caching**: Cache KPIs para queries rápidas
3. **Alertas**: Notificaciones en Slack/email si cron falla
4. **Tests Unitarios**: Unit tests para cálculos de KPIs
5. **Optimizaciones**: Raw SQL para queries complejas

---

## 📞 Soporte

Si tienes problemas:

1. Revisar logs: `console.log` detallados en ambos endpoints
2. Leer documentación completa en `/docs/CRON-JOBS-ANALYTICS.md`
3. Verificar Prisma schema: Todos los campos deben existir
4. Testing step by step con script incluido

---

**Ready to Test!** 🚀

Ejecuta: `npx tsx scripts/test-cron.ts all`
