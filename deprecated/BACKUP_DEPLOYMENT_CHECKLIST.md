
# Checklist de Deployment - Sistema de Backups

Guía paso a paso para deployar el sistema de backups en producción.

---

## Pre-requisitos

- [ ] Cuenta en Cloudflare (para R2)
- [ ] Cuenta en Vercel (o GitHub Actions habilitado)
- [ ] Acceso admin a la base de datos PostgreSQL
- [ ] (Opcional) Slack workspace para notificaciones
- [ ] (Opcional) Cuenta Resend para emails

**Tiempo estimado total**: 30 minutos

---

## Fase 1: Configuración de Cloudflare R2 (10 min)

### 1.1 Crear Cuenta/Login
- [ ] Ir a https://cloudflare.com
- [ ] Login o crear cuenta (gratis)
- [ ] Verificar email si es nueva cuenta

### 1.2 Crear Bucket R2
- [ ] Ir a https://dash.cloudflare.com/r2/overview
- [ ] Click "Create bucket"
- [ ] Nombre: `database-backups`
- [ ] Location: Automatic (recommended)
- [ ] Storage class: Standard
- [ ] Click "Create bucket"
- [ ] Verificar bucket creado en lista

### 1.3 Generar API Token
- [ ] En R2 dashboard, click "Manage R2 API Tokens"
- [ ] Click "Create API token"
- [ ] Configuración:
  - Name: `database-backups-token`
  - Permissions: Object Read & Write ✅
  - TTL: No expiry
  - Specific bucket: `database-backups` (opcional pero recomendado)
- [ ] Click "Create API Token"
- [ ] **COPIAR INMEDIATAMENTE** (se muestra solo una vez):
  - Access Key ID
  - Secret Access Key
  - Endpoint URL (ejemplo: `https://abc123.r2.cloudflarestorage.com`)
- [ ] Guardar en lugar seguro (1Password, etc.)

---

## Fase 2: Configuración de Variables de Entorno (5 min)

### Opción A: Vercel (Recomendado para apps Next.js)

- [ ] Ir a Vercel Dashboard > Tu Proyecto > Settings > Environment Variables
- [ ] Agregar cada variable a continuación:

#### Variables REQUERIDAS:
```
R2_ENDPOINT
Valor: https://[tu-account-id].r2.cloudflarestorage.com
Environments: ✅ Production ✅ Preview ✅ Development
```

```
R2_ACCESS_KEY_ID
Valor: [tu access key id]
Environments: ✅ Production ✅ Preview ✅ Development
```

```
R2_SECRET_ACCESS_KEY
Valor: [tu secret access key]
Environments: ✅ Production ✅ Preview ✅ Development
```

```
R2_BUCKET_NAME
Valor: database-backups
Environments: ✅ Production ✅ Preview ✅ Development
```

```
CRON_SECRET
Valor: [generar con: openssl rand -base64 32]
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variables OPCIONALES (Notificaciones):
```
SLACK_WEBHOOK_URL
Valor: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
Environments: ✅ Production
```

```
ADMIN_EMAIL
Valor: admin@tudominio.com
Environments: ✅ Production
```

- [ ] Click "Save" en cada variable
- [ ] Verificar que todas están guardadas

### Opción B: GitHub Actions

- [ ] Ir a GitHub > Tu Repo > Settings > Secrets and variables > Actions
- [ ] Click "New repository secret"
- [ ] Agregar cada secret:
  - DATABASE_URL
  - R2_ENDPOINT
  - R2_ACCESS_KEY_ID
  - R2_SECRET_ACCESS_KEY
  - R2_BUCKET_NAME
  - SLACK_WEBHOOK_URL (opcional)
  - ADMIN_EMAIL (opcional)
  - RESEND_API_KEY (opcional)
  - RESEND_FROM_EMAIL (opcional)

---

## Fase 3: Deploy del Código (5 min)

### 3.1 Commit y Push
```bash
# Verificar archivos agregados
git status

# Debería mostrar:
# - lib/services/database-backup.service.ts
# - app/api/cron/backup-database/route.ts
# - app/api/admin/backups/route.ts
# - scripts/backup-database-manual.sh
# - scripts/restore-database.sh
# - vercel.json (modificado)
# - .env.example (modificado)
# - docs/*
# - .github/workflows/database-backup.yml (si usas GitHub Actions)

# Commit
git add .
git commit -m "feat: Implementar sistema de backups automáticos

- Backups diarios con pg_dump + Cloudflare R2
- Retención de 30 días
- Notificaciones Slack/Email
- Scripts de restore interactivo
- Admin API para dashboard
- Documentación completa

Ver: DATABASE_BACKUPS_IMPLEMENTATION.md"

# Push (triggerea deploy automático en Vercel)
git push
```

### 3.2 Verificar Deploy
- [ ] Ir a Vercel Dashboard > Deployments
- [ ] Esperar deploy completo (2-3 min)
- [ ] Verificar estado: "Ready" ✅
- [ ] Click en deployment > Ver logs
- [ ] Verificar no hay errores

---

## Fase 4: Testing Inicial (10 min)

### 4.1 Test de Configuración
```bash
# Verificar que endpoint responde
curl -X GET \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://tu-dominio.vercel.app/api/cron/backup-database

# Respuesta esperada:
# {
#   "success": true,
#   "stats": { "totalBackups": 0, ... },
#   "recentBackups": []
# }
```
- [ ] Endpoint responde 200 OK
- [ ] JSON válido retornado
- [ ] No hay errores en logs

### 4.2 Test de Backup Manual
```bash
# Trigger primer backup
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://tu-dominio.vercel.app/api/cron/backup-database

# Respuesta esperada:
# {
#   "success": true,
#   "filename": "backup_2025-01-31_12-00-00.sql.gz",
#   "size": 8388608,
#   "uploadedToR2": true,
#   "durationMs": 45000
# }
```
- [ ] Respuesta exitosa (success: true)
- [ ] Filename generado correctamente
- [ ] uploadedToR2: true
- [ ] Duration razonable (<60s para DBs pequeñas)

### 4.3 Verificar en R2
- [ ] Ir a Cloudflare R2 Dashboard
- [ ] Abrir bucket `database-backups`
- [ ] Verificar carpeta `postgres-backups/` existe
- [ ] Verificar archivo `backup_YYYY-MM-DD_HH-MM-SS.sql.gz` existe
- [ ] Verificar tamaño del archivo (debería ser >0 bytes)

### 4.4 Verificar Notificaciones
- [ ] Si configuraste Slack: verificar mensaje recibido
- [ ] Si configuraste Email: verificar email recibido
- [ ] Contenido del mensaje incluye:
  - ✅ Éxito/Fallo
  - Filename
  - Size
  - Duration

### 4.5 Test de Logs
```bash
# Ver logs en Vercel
# Dashboard > Tu Proyecto > Logs > Filtrar: "CronBackup"
```
- [ ] Logs aparecen en Vercel
- [ ] Nivel "info" para éxito
- [ ] No hay "error" logs
- [ ] Context incluido (filename, size, etc.)

---

## Fase 5: Configurar Cron Automático (5 min)

### Opción A: Vercel Cron (si usas Vercel)

- [ ] Ir a Vercel Dashboard > Tu Proyecto > Settings > Cron Jobs
- [ ] Verificar que aparece:
  ```
  /api/cron/backup-database
  Schedule: 0 3 * * * (Daily at 3:00 AM)
  ```
- [ ] Si no aparece:
  - Verificar `vercel.json` tiene el cron configurado
  - Re-deploy: `git commit --allow-empty -m "chore: trigger redeploy" && git push`

### Opción B: GitHub Actions (alternativa)

- [ ] Ir a GitHub > Actions
- [ ] Verificar workflow "Database Backup" aparece
- [ ] Habilitar workflow si está deshabilitado
- [ ] Schedule configurado: `0 3 * * *`

### 4.3 Test de Cron Manual (opcional)

#### Vercel:
```bash
# Vercel triggerea el cron automáticamente
# No requiere configuración adicional
# Esperar hasta las 3:00 AM para ver ejecución automática
```

#### GitHub Actions:
- [ ] GitHub > Actions > Database Backup > Run workflow
- [ ] Seleccionar branch: main
- [ ] Click "Run workflow"
- [ ] Esperar ejecución (2-5 min)
- [ ] Verificar status: ✅ Success
- [ ] Ver logs del job

---

## Fase 6: Monitoreo Post-Deploy (24-48 horas)

### Día 1 (después del primer backup automático)
- [ ] Verificar ejecución del cron a las 3:00 AM
- [ ] Verificar nuevo backup en R2
- [ ] Verificar notificación recibida
- [ ] Verificar logs en Vercel/GitHub

### Día 2-3
- [ ] Verificar backups diarios continúan
- [ ] Verificar incremento en tamaño de backups (si DB crece)
- [ ] No hay errores en logs

### Semana 1
- [ ] Verificar 7 backups en R2
- [ ] Sizes consistentes
- [ ] Notificaciones funcionando

### Día 30+
- [ ] Verificar limpieza automática (backups >30 días eliminados)
- [ ] Storage en R2 se mantiene estable (~30 backups)

---

## Fase 7: Test de Restore (IMPORTANTE)

⚠️ **SOLO EN DB DE TEST/STAGING, NUNCA EN PRODUCCIÓN DIRECTAMENTE**

### 7.1 Setup DB de Test
```bash
# Crear DB temporal para testing
createdb test_restore_db

# Configurar DATABASE_URL temporal
export DATABASE_URL="postgresql://localhost:5432/test_restore_db"
```

### 7.2 Ejecutar Restore
```bash
# Listar backups disponibles
./scripts/restore-database.sh list

# Restaurar backup más reciente
./scripts/restore-database.sh backup_2025-01-31_03-00-00.sql.gz

# Confirmar cuando pregunte (yes)
```

### 7.3 Verificar Integridad
```bash
# Conectar a DB de test
psql $DATABASE_URL

# Verificar tablas
\dt

# Verificar conteo de registros
SELECT 
  'User' as table, COUNT(*) as count FROM "User"
UNION ALL
SELECT 'Agent', COUNT(*) FROM "Agent"
UNION ALL
SELECT 'Message', COUNT(*) FROM "Message";

# Verificar foreign keys
SELECT * FROM "Message" LIMIT 5;

# Exit
\q
```

- [ ] Todas las tablas presentes
- [ ] Conteo de registros correcto
- [ ] Foreign keys funcionan
- [ ] Datos consistentes

### 7.4 Cleanup
```bash
# Eliminar DB de test
dropdb test_restore_db
```

---

## Fase 8: Documentación y Handoff

### 8.1 Documentar Accesos
- [ ] Agregar credenciales R2 a 1Password/Vault
- [ ] Documentar CRON_SECRET
- [ ] Agregar URLs importantes:
  - R2 Dashboard
  - Vercel Project
  - Slack Channel (si aplica)

### 8.2 Crear Runbook
- [ ] Ubicación de docs: `docs/DATABASE_BACKUPS.md`
- [ ] Quick start: `docs/DATABASE_BACKUPS_QUICK_START.md`
- [ ] Contacto de soporte

### 8.3 Capacitar al Equipo
- [ ] Mostrar dónde ver backups (R2 dashboard)
- [ ] Mostrar cómo restaurar (script)
- [ ] Mostrar logs (Vercel/GitHub)
- [ ] Proceso de emergencia

---

## Troubleshooting Común

### "pg_dump: command not found" en Vercel
✅ **Solución**: Usar GitHub Actions en lugar de Vercel Cron
- Ver `.github/workflows/database-backup.yml`
- Configurar secrets en GitHub
- Deshabilitar cron en `vercel.json`

### "R2 credentials not configured"
✅ **Solución**: Verificar env vars en Vercel
- Ir a Settings > Environment Variables
- Verificar las 4 vars de R2
- Re-deploy si es necesario

### Backup tarda >5 minutos (timeout)
✅ **Solución**: 
1. Verificar tamaño de DB (`SELECT pg_database_size(current_database());`)
2. Si >1GB, considerar:
   - Backups incrementales
   - Usar GitHub Actions (sin timeout)
   - DB managed service (Supabase/Neon)

### No recibo notificaciones
✅ **Solución**:
1. Verificar SLACK_WEBHOOK_URL o ADMIN_EMAIL configurado
2. Verificar RESEND_API_KEY (para email)
3. Ver logs: buscar "sendNotification"
4. Test manual: ejecutar backup y ver logs

---

## Checklist Final

- [ ] ✅ R2 bucket creado y configurado
- [ ] ✅ Credenciales R2 en Vercel/GitHub
- [ ] ✅ Código deployed a producción
- [ ] ✅ Primer backup manual exitoso
- [ ] ✅ Backup verificado en R2
- [ ] ✅ Notificaciones funcionando
- [ ] ✅ Cron configurado (Vercel o GitHub)
- [ ] ✅ Restore testeado en DB test
- [ ] ✅ Documentación completa
- [ ] ✅ Equipo capacitado
- [ ] ✅ Monitoreo configurado

---

## Post-Deployment

### Alertas Recomendadas
- [ ] Configurar alerta si backup falla 2 días consecutivos
- [ ] Configurar alerta si storage R2 excede 10GB (near limit)
- [ ] Configurar alerta si backup tarda >5 min (near timeout)

### Mejoras Futuras (Opcional)
- [ ] Implementar admin UI dashboard (`/admin/backups`)
- [ ] Agregar métricas a Grafana/DataDog
- [ ] Implementar backups incrementales
- [ ] Point-in-Time Recovery (WAL archiving)

---

## Soporte

**Documentación**:
- Quick Start: `docs/DATABASE_BACKUPS_QUICK_START.md`
- Guía Completa: `docs/DATABASE_BACKUPS.md`
- Implementación: `DATABASE_BACKUPS_IMPLEMENTATION.md`

**Comandos Útiles**:
```bash
# Ver backups
./scripts/restore-database.sh list

# Backup manual
./scripts/backup-database-manual.sh

# Restore
./scripts/restore-database.sh <filename>

# Ver stats
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://tu-dominio.com/api/cron/backup-database
```

**Contacto**: [Tu equipo de DevOps/SRE]

---

✅ **Sistema de backups listo para producción!** 🚀
