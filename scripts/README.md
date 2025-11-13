# Scripts de Servidor

Scripts utilitarios para deployment y mantenimiento en servidor cloud.

## 📋 Scripts Disponibles

### `cron-ml-analysis.sh`
Ejecuta el análisis ML de moderación nocturno.

**Uso en crontab:**
```bash
0 3 * * * /ruta/completa/scripts/cron-ml-analysis.sh >> /ruta/logs/cron.log 2>&1
```

**Ejecución manual:**
```bash
./scripts/cron-ml-analysis.sh
```

### `health-check.sh`
Verifica que todos los sistemas estén funcionando correctamente.

**Uso en crontab (cada hora):**
```bash
0 * * * * /ruta/completa/scripts/health-check.sh >> /ruta/logs/health-check.log 2>&1
```

**Ejecución manual:**
```bash
./scripts/health-check.sh
```

### `start-embedding-queue.sh`
Inicia el procesamiento de cola de embeddings (ejecutado por PM2).

```bash
./scripts/start-embedding-queue.sh
```

### `verify-before-deploy.sh`
Verifica que todo esté listo antes de deployar al servidor.

**Ejecutar ANTES de hacer push:**
```bash
./scripts/verify-before-deploy.sh
```

## ⚙️ Configuración

Todos los scripts requieren:
- Archivo `.env` configurado
- Variable `CRON_SECRET` definida
- Variable `APP_URL` definida

## 📝 Logs

Los logs se guardan en:
- `logs/ml-analysis-YYYY-MM-DD.log` (análisis ML)
- `logs/cron.log` (cron general)
- `logs/health-check.log` (health checks)

Los logs antiguos (>30 días) se eliminan automáticamente.

## 🔧 Troubleshooting

### Scripts no ejecutables
```bash
chmod +x scripts/*.sh
```

### Terminaciones de línea incorrectas (Windows)
```bash
sed -i 's/\r$//' scripts/*.sh
```

### Ver logs de cron
```bash
tail -f logs/cron.log
```
