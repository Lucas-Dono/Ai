# Quick Start: Database Backups

Guía rápida de 5 minutos para configurar backups automáticos.

## 1. Crear Bucket en Cloudflare R2 (2 min)

```bash
# 1. Ir a: https://dash.cloudflare.com/r2/overview
# 2. Click "Create bucket"
# 3. Nombre: database-backups
# 4. Click "Create bucket"
```

## 2. Generar Credenciales (1 min)

```bash
# 1. En R2, click "Manage R2 API Tokens"
# 2. Click "Create API token"
# 3. Permisos: Object Read & Write ✅
# 4. Copiar:
#    - Access Key ID
#    - Secret Access Key
#    - Endpoint URL
```

## 3. Configurar Variables en Vercel (1 min)

```bash
# Ir a: Vercel Dashboard > Project > Settings > Environment Variables
# Agregar estas 4 variables:

R2_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=tu_access_key_id
R2_SECRET_ACCESS_KEY=tu_secret_access_key
R2_BUCKET_NAME=database-backups

# IMPORTANTE: Guardar para todos los entornos (Production, Preview, Development)
```

## 4. Deploy (1 min)

```bash
# Push a Vercel (triggerea deploy automático)
git push

# O deploy manual desde Vercel Dashboard
```

## 5. Verificar (30 seg)

```bash
# Trigger manual del primer backup
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://tu-dominio.vercel.app/api/cron/backup-database

# Verificar respuesta:
# {
#   "success": true,
#   "filename": "backup_2025-01-31_12-00-00.sql.gz",
#   "size": 8388608,
#   "uploadedToR2": true
# }
```

## ✅ Listo!

Los backups ahora se ejecutarán automáticamente todos los días a las 3:00 AM.

---

## Comandos Útiles

### Ver backups disponibles
```bash
./scripts/restore-database.sh list
```

### Crear backup manual
```bash
./scripts/backup-database-manual.sh
```

### Restaurar backup
```bash
./scripts/restore-database.sh backup_2025-01-31_03-00-00.sql.gz
```

### Ver estadísticas
```bash
curl -X GET \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://tu-dominio.vercel.app/api/cron/backup-database
```

---

## Notificaciones (Opcional)

### Slack
```bash
# Agregar en Vercel env vars:
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Email
```bash
# Agregar en Vercel env vars:
ADMIN_EMAIL=admin@tudominio.com
# Requiere RESEND_API_KEY ya configurado
```

---

## Troubleshooting

### "pg_dump: command not found"
Vercel serverless no tiene `pg_dump`. Opciones:
1. Usar GitHub Actions (ver docs completa)
2. Migrar a Supabase/Neon (backups incluidos)
3. Usar Vercel Postgres (backups en plan Pro)

### "R2 credentials not configured"
Verificar que las 4 env vars de R2 están configuradas en Vercel.

### No recibo notificaciones
Verificar `SLACK_WEBHOOK_URL` o `ADMIN_EMAIL` + `RESEND_API_KEY`.

---

## Documentación Completa

Ver: `docs/DATABASE_BACKUPS.md`
