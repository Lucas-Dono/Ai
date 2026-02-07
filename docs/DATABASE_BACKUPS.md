# Sistema de Backups Automáticos de Base de Datos

Sistema completo de backups automáticos para PostgreSQL con almacenamiento en Cloudflare R2, retención de 30 días y notificaciones.

## Índice

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Configuración Inicial](#configuración-inicial)
- [Uso](#uso)
- [Restore de Backups](#restore-de-backups)
- [Monitoreo](#monitoreo)
- [Troubleshooting](#troubleshooting)

---

## Características

✅ **Backups Automáticos Diarios**
- Ejecutados a las 3:00 AM (horario servidor)
- Compresión gzip automática
- Upload a Cloudflare R2 (compatible S3)

✅ **Retención Inteligente**
- 30 días de retención
- Limpieza automática de backups antiguos
- Sin intervención manual

✅ **Notificaciones**
- Slack webhooks
- Email (vía Resend)
- Notificaciones de éxito y fallos

✅ **Restore Fácil**
- Script interactivo
- Listado de backups disponibles
- Safety backup automático

✅ **Seguridad**
- Autenticación con CRON_SECRET
- Credenciales encriptadas en R2
- Logs detallados

---

## Arquitectura

```
┌─────────────────┐
│  Vercel Cron    │  Schedule: Diario 3:00 AM
│   (Trigger)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  /api/cron/     │  1. Verificar auth
│  backup-        │  2. Ejecutar pg_dump
│  database       │  3. Comprimir gzip
└────────┬────────┘  4. Upload a R2
         │           5. Limpiar antiguos
         ▼           6. Notificar
┌─────────────────┐
│  Cloudflare R2  │  Storage: 30 días
│    (Bucket)     │  Encryption: Sí
└─────────────────┘
```

### Componentes

1. **DatabaseBackupService** (`lib/services/database-backup.service.ts`)
   - Lógica principal de backups
   - Upload/download desde R2
   - Gestión de retención

2. **Cron Endpoint** (`app/api/cron/backup-database/route.ts`)
   - Endpoint protegido con CRON_SECRET
   - Ejecutado por Vercel Cron
   - Logging y error handling

3. **Scripts CLI**
   - `scripts/backup-database-manual.sh` - Backup manual
   - `scripts/restore-database.sh` - Restore interactivo

---

## Configuración Inicial

### 1. Crear Bucket en Cloudflare R2

1. Ir a [Cloudflare Dashboard](https://dash.cloudflare.com/r2/overview)
2. Click en "Create bucket"
3. Nombre: `database-backups`
4. Configuración recomendada:
   - Location: Automatic
   - Storage Class: Standard
   - Object Lock: Disabled

### 2. Generar Credenciales R2

1. En R2 Dashboard, ir a "Manage R2 API Tokens"
2. Click "Create API token"
3. Permisos:
   - ✅ Object Read & Write
   - ✅ List buckets
4. TTL: No expiry
5. Copiar:
   - Access Key ID
   - Secret Access Key
   - Endpoint URL (ejemplo: `https://abc123.r2.cloudflarestorage.com`)

### 3. Configurar Variables de Entorno

Agregar en Vercel (o `.env.local`):

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Cloudflare R2
R2_ENDPOINT="https://[account-id].r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="your_access_key_id"
R2_SECRET_ACCESS_KEY="your_secret_access_key"
R2_BUCKET_NAME="database-backups"

# Cron Authentication
CRON_SECRET="tu_token_secreto_aqui"  # Generar con: openssl rand -base64 32

# Notificaciones (opcional)
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
ADMIN_EMAIL="admin@tudominio.com"
RESEND_API_KEY="re_your_resend_key"  # Si usas email
RESEND_FROM_EMAIL="backups@tudominio.com"
```

### 4. Instalar Dependencias AWS SDK

El proyecto ya incluye `@aws-sdk/client-s3` en package.json. Si no está:

```bash
npm install @aws-sdk/client-s3
```

### 5. Deploy a Vercel

```bash
# 1. Commit cambios
git add .
git commit -m "feat: Implementar sistema de backups automáticos"

# 2. Push a Vercel
git push

# 3. Verificar cron en Vercel Dashboard
# Ir a Project Settings > Cron Jobs
# Verificar que aparece: /api/cron/backup-database @ 0 3 * * *
```

---

## Uso

### Backup Automático (Producción)

Los backups se ejecutan automáticamente a las 3:00 AM diariamente.

**Verificar último backup:**

```bash
# Usando el endpoint GET (requiere CRON_SECRET)
curl -X GET \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://tu-dominio.com/api/cron/backup-database
```

Respuesta esperada:
```json
{
  "success": true,
  "stats": {
    "totalBackups": 15,
    "totalSize": 125829120,
    "oldestBackup": "2025-01-01T03:00:00Z",
    "newestBackup": "2025-01-31T03:00:00Z"
  },
  "recentBackups": [
    {
      "filename": "backup_2025-01-31_03-00-00.sql.gz",
      "size": 8388608,
      "createdAt": "2025-01-31T03:00:00Z"
    }
  ]
}
```

### Backup Manual (Development)

```bash
# Backup completo (local + R2)
./scripts/backup-database-manual.sh

# Solo local (sin upload a R2)
./scripts/backup-database-manual.sh --local-only
```

### Trigger Manual de Cron (Testing)

```bash
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://tu-dominio.com/api/cron/backup-database
```

---

## Restore de Backups

### Método 1: Script Interactivo (Recomendado)

```bash
# 1. Listar backups disponibles
./scripts/restore-database.sh list

# Salida:
# Available backups:
#   backup_2025-01-31_03-00-00.sql.gz - 2025-01-31 03:00:00 - 8388608 bytes
#   backup_2025-01-30_03-00-00.sql.gz - 2025-01-30 03:00:00 - 8323072 bytes
#   ...

# 2. Restaurar backup específico
./scripts/restore-database.sh backup_2025-01-31_03-00-00.sql.gz

# El script te pedirá confirmación:
# ⚠️  WARNING: This will OVERWRITE your current database!
#    Database: postgresql://...
#    Backup: backup_2025-01-31_03-00-00.sql.gz
# Are you sure you want to continue? (yes/no):
```

El script automáticamente:
1. Descarga el backup desde R2
2. Descomprime el archivo
3. Crea un safety backup de la DB actual
4. Restaura el backup seleccionado
5. Limpia archivos temporales

### Método 2: Manual

```bash
# 1. Configurar AWS CLI con credenciales de R2
export AWS_ACCESS_KEY_ID="your_r2_access_key"
export AWS_SECRET_ACCESS_KEY="your_r2_secret_key"

# 2. Descargar backup
aws s3 cp \
  s3://database-backups/postgres-backups/backup_2025-01-31_03-00-00.sql.gz \
  ./backup.sql.gz \
  --endpoint-url $R2_ENDPOINT

# 3. Descomprimir y restaurar
gunzip -c backup.sql.gz | psql $DATABASE_URL

# 4. Limpiar
rm backup.sql.gz
```

### Restore en Vercel (Producción)

⚠️ **IMPORTANTE**: Nunca restaurar directamente en producción sin backup previo.

```bash
# 1. Crear backup de seguridad primero
./scripts/backup-database-manual.sh

# 2. Configurar DATABASE_URL de producción
export DATABASE_URL="postgresql://..."

# 3. Restaurar
./scripts/restore-database.sh backup_2025-01-31_03-00-00.sql.gz
```

---

## Monitoreo

### Verificar Estado de Backups

```bash
# Ver stats generales
curl -X GET \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://tu-dominio.com/api/cron/backup-database | jq
```

### Logs en Vercel

1. Ir a Vercel Dashboard
2. Seleccionar proyecto
3. Ir a "Logs"
4. Filtrar por: `CronBackup` o `DatabaseBackup`

### Notificaciones

#### Slack

Configurar webhook en Slack:
1. Ir a https://api.slack.com/apps
2. Crear nueva app
3. Activar "Incoming Webhooks"
4. Agregar webhook al canal deseado
5. Copiar webhook URL a `SLACK_WEBHOOK_URL`

Ejemplo de notificación:
```
✅ Database backup completed successfully
Filename: backup_2025-01-31_03-00-00.sql.gz
Size: 8.00 MB
Duration: 45000ms
```

#### Email (Resend)

Configurar email:
1. Verificar dominio en [Resend](https://resend.com)
2. Configurar `RESEND_FROM_EMAIL` con email verificado
3. Agregar `ADMIN_EMAIL` para recibir notificaciones

---

## Troubleshooting

### Error: "pg_dump: command not found"

**Causa**: PostgreSQL client no instalado en entorno de ejecución.

**Solución**: El cron de Vercel no tiene acceso a `pg_dump`. Opciones:

1. **Usar Vercel Postgres Backups** (Recomendado para Vercel Postgres)
   - Incluido automáticamente en plan Pro
   - No requiere código custom

2. **Migrar a servicio managed** (Supabase/Neon/PlanetScale)
   - Backups incluidos
   - Más confiable

3. **Usar GitHub Actions** para backups
   ```yaml
   # .github/workflows/backup-database.yml
   name: Database Backup
   on:
     schedule:
       - cron: '0 3 * * *'
   jobs:
     backup:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Install PostgreSQL
           run: sudo apt-get install postgresql-client
         - name: Run Backup
           run: ./scripts/backup-database-manual.sh
           env:
             DATABASE_URL: ${{ secrets.DATABASE_URL }}
             R2_ENDPOINT: ${{ secrets.R2_ENDPOINT }}
             R2_ACCESS_KEY_ID: ${{ secrets.R2_ACCESS_KEY_ID }}
             R2_SECRET_ACCESS_KEY: ${{ secrets.R2_SECRET_ACCESS_KEY }}
   ```

### Error: "R2 credentials not configured"

**Causa**: Variables de entorno R2 no configuradas.

**Solución**:
```bash
# Verificar que estas variables existen en Vercel:
# - R2_ENDPOINT
# - R2_ACCESS_KEY_ID
# - R2_SECRET_ACCESS_KEY
# - R2_BUCKET_NAME
```

### Error: "Unauthorized" al acceder al endpoint

**Causa**: CRON_SECRET no coincide.

**Solución**:
```bash
# Verificar que CRON_SECRET está configurado en Vercel
# El header debe ser: Authorization: Bearer <CRON_SECRET>
```

### Backup tarda demasiado

**Causa**: Base de datos muy grande (>1GB).

**Solución**:
```typescript
// Aumentar maxDuration en route.ts
export const maxDuration = 300; // 5 minutos (máximo en Pro plan)

// O usar backups incrementales (requiere pg_basebackup)
```

### No recibo notificaciones

**Verificar**:
1. `SLACK_WEBHOOK_URL` o `ADMIN_EMAIL` configurados
2. `RESEND_API_KEY` configurado (para email)
3. Logs de Vercel para errores en `sendNotification`

---

## Costos

### Cloudflare R2

**Free Tier** (más que suficiente para iniciar):
- ✅ 10GB storage gratis
- ✅ Sin costos de egress (downloads)
- ✅ 1 millón de operaciones Class A gratis/mes
- ✅ 10 millones de operaciones Class B gratis/mes

**Ejemplo de uso**:
- Backup diario: ~10MB comprimido
- 30 días retención: ~300MB total
- Operaciones: ~120/mes (bien dentro del free tier)

**Costo estimado**: $0/mes para bases de datos pequeñas (<10GB)

### Vercel Cron Jobs

- ✅ Gratis en todos los planes
- ✅ Hobby plan: 1 cron job
- ✅ Pro plan: 100 cron jobs

### Total

**Costo mensual**: $0 (usando free tiers) 🎉

---

## Mejoras Futuras

### Point-in-Time Recovery (PITR)

Para restaurar a un momento exacto, considerar:
- WAL archiving con `pg_basebackup`
- Continuous archiving con `archive_command`
- Requiere más storage pero permite recovery granular

### Backups Incrementales

Para bases de datos grandes:
```bash
# Backup incremental usando pg_basebackup
pg_basebackup -D /backup -Ft -z -P
```

### Testing Automático de Restores

Verificar integridad de backups:
```bash
# Restaurar en DB temporal
# Ejecutar checks de integridad
# Notificar si falla
```

### Dashboard de Backups

Crear UI admin para:
- Ver todos los backups
- Trigger manual
- Ver logs
- Restore one-click (con confirmación)

---

## Checklist de Testing

Antes de confiar en el sistema:

- [ ] Crear backup manual: `./scripts/backup-database-manual.sh`
- [ ] Verificar archivo en R2: `./scripts/restore-database.sh list`
- [ ] Restaurar en DB de prueba
- [ ] Verificar integridad de datos
- [ ] Trigger cron manual: `curl -X POST ...`
- [ ] Verificar notificaciones (Slack/Email)
- [ ] Esperar backup automático (3 AM)
- [ ] Verificar limpieza de backups >30 días

---

## Recursos

- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [PostgreSQL Backup & Restore](https://www.postgresql.org/docs/current/backup.html)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [AWS SDK S3 Client](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)

---

## Soporte

¿Problemas? Abre un issue o contacta al equipo de DevOps.

**Logs importantes**:
- `CronBackup`: Ejecución de cron
- `DatabaseBackup`: Proceso de backup/restore
