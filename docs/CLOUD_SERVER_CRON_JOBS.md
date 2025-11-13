# ⏰ Cron Jobs para Cloud Server

Esta documentación describe todos los cron jobs necesarios para el funcionamiento del sistema en un cloud server tradicional (sin Vercel).

## 📋 Lista de Cron Jobs

### 1. Mensajes Proactivos de IA
**Frecuencia:** Cada hora
**Descripción:** Genera y envía mensajes proactivos de la IA a usuarios basándose en triggers inteligentes (inactividad, follow-ups, check-ins emocionales, etc.)

```bash
0 * * * * curl -X POST -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/proactive-messaging >> /var/www/circuit-prompt-ai/logs/proactive-messaging.log 2>&1
```

### 2. Auto-pausa de Mundos Inactivos
**Frecuencia:** Cada 6 horas
**Descripción:** Pausa mundos virtuales que han estado inactivos para ahorrar recursos

```bash
0 */6 * * * curl -X POST -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/auto-pause-worlds >> /var/www/circuit-prompt-ai/logs/auto-pause-worlds.log 2>&1
```

### 3. Eliminar Mundos Programados
**Frecuencia:** Diario a las 3 AM
**Descripción:** Elimina mundos que están marcados para eliminación programada

```bash
0 3 * * * curl -X POST -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/delete-scheduled-worlds >> /var/www/circuit-prompt-ai/logs/delete-worlds.log 2>&1
```

### 4. Backup de Base de Datos
**Frecuencia:** Diario a las 3 AM
**Descripción:** Realiza backup automático de la base de datos PostgreSQL

```bash
0 3 * * * curl -X POST -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/backup-database >> /var/www/circuit-prompt-ai/logs/backup-database.log 2>&1
```

### 5. Expirar Grants Temporales
**Frecuencia:** Cada hora
**Descripción:** Elimina permisos temporales que han expirado

```bash
0 * * * * curl -X POST -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/expire-temp-grants >> /var/www/circuit-prompt-ai/logs/expire-grants.log 2>&1
```

### 6. Análisis ML de Moderación
**Frecuencia:** Diario a las 3 AM
**Descripción:** Ejecuta análisis de embeddings para detección de contenido inapropiado

```bash
0 3 * * * curl -X POST -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/ml-moderation-analysis >> /var/www/circuit-prompt-ai/logs/ml-analysis.log 2>&1
```

### 7. Limpieza de Caché
**Frecuencia:** Diario a las 2 AM
**Descripción:** Limpia caché antiguo de Redis

```bash
0 2 * * * curl -X POST -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/cache-cleanup >> /var/www/circuit-prompt-ai/logs/cache-cleanup.log 2>&1
```

### 8. Verificación de Alertas
**Frecuencia:** Cada hora
**Descripción:** Verifica el sistema y envía alertas si hay problemas

```bash
0 * * * * curl -X POST -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/check-alerts >> /var/www/circuit-prompt-ai/logs/check-alerts.log 2>&1
```

## 🔧 Instalación

### Opción 1: Instalación Automática

Ejecuta el script de instalación:

```bash
cd /var/www/circuit-prompt-ai
chmod +x scripts/setup-cron-jobs.sh
./scripts/setup-cron-jobs.sh
```

### Opción 2: Instalación Manual

1. Abre el crontab:
```bash
crontab -e
```

2. Agrega todas las líneas de cron jobs listadas arriba

3. Guarda y cierra el editor

4. Verifica que se hayan agregado:
```bash
crontab -l
```

## 🔐 Variables de Entorno Requeridas

Asegúrate de tener estas variables en tu `.env`:

```bash
# Secret para proteger endpoints de cron
CRON_SECRET=tu_secret_aqui_genera_con_openssl_rand_base64_32

# URL de la aplicación
APP_URL=http://localhost:3000  # o https://tudominio.com
```

## 📊 Monitoreo de Cron Jobs

### Ver logs en tiempo real

```bash
# Mensajes proactivos
tail -f /var/www/circuit-prompt-ai/logs/proactive-messaging.log

# Auto-pausa de mundos
tail -f /var/www/circuit-prompt-ai/logs/auto-pause-worlds.log

# Análisis ML
tail -f /var/www/circuit-prompt-ai/logs/ml-analysis.log

# Ver todos los logs de cron
tail -f /var/www/circuit-prompt-ai/logs/*.log
```

### Verificar ejecución de cron

```bash
# Ver logs del sistema cron
sudo tail -f /var/log/syslog | grep CRON

# Ver historial de ejecuciones
grep CRON /var/log/syslog | tail -20
```

### Probar cron job manualmente

```bash
# Probar mensajes proactivos
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/proactive-messaging

# Probar cualquier otro cron
curl -X POST \
  -H "Authorization: Bearer tu_cron_secret" \
  http://localhost:3000/api/cron/NOMBRE_DEL_CRON
```

## ⚠️ Troubleshooting

### Cron jobs no se ejecutan

1. Verifica que crontab esté configurado:
```bash
crontab -l
```

2. Verifica que el servicio cron esté activo:
```bash
sudo systemctl status cron
```

3. Si no está activo, inícialo:
```bash
sudo systemctl start cron
sudo systemctl enable cron
```

### Errores de autenticación

Verifica que el `CRON_SECRET` en `.env` coincida con el usado en el crontab:
```bash
grep CRON_SECRET /var/www/circuit-prompt-ai/.env
```

### Logs no se generan

1. Crea el directorio de logs si no existe:
```bash
mkdir -p /var/www/circuit-prompt-ai/logs
chmod 755 /var/www/circuit-prompt-ai/logs
```

2. Verifica permisos:
```bash
ls -la /var/www/circuit-prompt-ai/logs
```

## 📅 Calendario de Ejecución

```
┌───────────── minuto (0 - 59)
│ ┌───────────── hora (0 - 23)
│ │ ┌───────────── día del mes (1 - 31)
│ │ │ ┌───────────── mes (1 - 12)
│ │ │ │ ┌───────────── día de la semana (0 - 6) (domingo = 0)
│ │ │ │ │
* * * * * comando
```

| Cron Job | Frecuencia | Horarios |
|----------|------------|----------|
| Mensajes Proactivos | Cada hora | 00:00, 01:00, 02:00... |
| Auto-pausa Mundos | Cada 6 horas | 00:00, 06:00, 12:00, 18:00 |
| Eliminar Mundos | Diario | 03:00 |
| Backup DB | Diario | 03:00 |
| Expirar Grants | Cada hora | 00:00, 01:00, 02:00... |
| Análisis ML | Diario | 03:00 |
| Limpieza Caché | Diario | 02:00 |
| Verificar Alertas | Cada hora | 00:00, 01:00, 02:00... |

## 🔄 Actualización de Cron Jobs

Si se agregan nuevos cron jobs:

1. Actualiza este documento
2. Actualiza el script `scripts/setup-cron-jobs.sh`
3. Re-ejecuta la instalación o agrega manualmente al crontab

## 📝 Notas Importantes

- **Horarios:** Todos los cron jobs usan la hora del servidor (timezone del sistema)
- **Logs:** Los logs se rotan automáticamente para no llenar el disco
- **Seguridad:** NUNCA expongas el `CRON_SECRET` públicamente
- **Performance:** Los cron jobs intensivos (ML, backup) se ejecutan a las 2-3 AM para no afectar usuarios
- **Escalabilidad:** Si tienes múltiples servidores, usa un servidor dedicado para cron jobs

---

**Última actualización:** 2025-01-12
**Migrado desde:** vercel.json crons
