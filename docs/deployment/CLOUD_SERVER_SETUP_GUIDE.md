# 🖥️ Guía de Configuración - Servidor Cloud Tradicional

## 📋 Resumen

Esta guía explica cómo configurar el sistema de límites diarios en un **servidor cloud tradicional** (VPS, Dedicated Server, etc.) sin usar Vercel.

La diferencia principal es que usaremos **crontab** (cron jobs de Linux) en lugar de Vercel Cron Jobs.

---

## 🎯 ¿Qué necesitamos configurar?

### 1. Variables de Entorno
El `CRON_SECRET` para proteger el endpoint

### 2. Cron Job en el Servidor
Un cronjob que ejecute cada hora el endpoint de expiración

---

## 🔧 Configuración Paso a Paso

### Paso 1: Configurar Variables de Entorno

En tu servidor, edita el archivo `.env`:

```bash
cd /ruta/a/tu/proyecto
nano .env  # o vim .env
```

Agrega o verifica que existe:

```bash
# Cron Jobs (para desactivar upgrades temporales expirados)
CRON_SECRET="d09697ebe3fb59e1968befd2d5a265acd560f4e6a0fed2e620bb6b87cf8f0aff"
```

**Importante:** Este secret debe estar en tu archivo `.env` del servidor en producción.

---

### Paso 2: Configurar Cron Job (crontab)

#### Opción A: Cron Job con curl (Recomendado)

1. **Abre crontab:**

```bash
crontab -e
```

2. **Agrega esta línea al final:**

```bash
# Desactivar upgrades temporales expirados cada hora
0 * * * * curl -H "Authorization: Bearer d09697ebe3fb59e1968befd2d5a265acd560f4e6a0fed2e620bb6b87cf8f0aff" https://tudominio.com/api/cron/expire-temp-grants >> /var/log/cron-expire-grants.log 2>&1
```

**Explicación:**
- `0 * * * *`: Ejecuta cada hora en el minuto 0
- `curl -H "Authorization: Bearer ..."`: Llama al endpoint con el secret
- `https://tudominio.com`: Cambia por tu dominio real
- `>> /var/log/...`: Guarda logs para debugging

3. **Guarda y cierra** (en nano: Ctrl+X, Y, Enter)

#### Opción B: Cron Job con Node.js script (Avanzado)

Si prefieres ejecutar un script Node.js directo:

1. **Crea el script:** `scripts/cron-expire-grants.js`

```javascript
// scripts/cron-expire-grants.js
const https = require('https');

const CRON_SECRET = process.env.CRON_SECRET;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const options = {
  hostname: new URL(API_URL).hostname,
  port: 443,
  path: '/api/cron/expire-temp-grants',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${CRON_SECRET}`,
  },
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`[${new Date().toISOString()}] Response:`, data);
  });
});

req.on('error', (error) => {
  console.error(`[${new Date().toISOString()}] Error:`, error);
  process.exit(1);
});

req.end();
```

2. **Agregar a crontab:**

```bash
crontab -e
```

```bash
# Desactivar upgrades temporales expirados cada hora
0 * * * * cd /ruta/a/tu/proyecto && NODE_ENV=production node scripts/cron-expire-grants.js >> /var/log/cron-expire-grants.log 2>&1
```

---

### Paso 3: Verificar que el Cron está Activo

```bash
# Ver cron jobs activos
crontab -l

# Ver logs del cron (después de 1 hora)
tail -f /var/log/cron-expire-grants.log
```

---

## 🧪 Testing

### Test 1: Verificar que el endpoint está protegido

```bash
# Sin el secret (debería fallar con 401)
curl https://tudominio.com/api/cron/expire-temp-grants

# Respuesta esperada:
# {"error": "Unauthorized"}
```

### Test 2: Con el secret correcto

```bash
# Con el secret (debería funcionar)
curl -H "Authorization: Bearer d09697ebe3fb59e1968befd2d5a265acd560f4e6a0fed2e620bb6b87cf8f0aff" \
  https://tudominio.com/api/cron/expire-temp-grants

# Respuesta esperada:
# {"success": true, "deactivated": 0}
```

### Test 3: Forzar ejecución manual del cron

```bash
# Ejecutar el cron manualmente (sin esperar 1 hora)
curl -H "Authorization: Bearer d09697ebe3fb59e1968befd2d5a265acd560f4e6a0fed2e620bb6b87cf8f0aff" \
  https://tudominio.com/api/cron/expire-temp-grants
```

---

## 🔐 Seguridad

### ¿Por qué es importante el CRON_SECRET?

El endpoint `/api/cron/expire-temp-grants` **modifica datos de usuarios** (desactiva upgrades). Sin protección:
- ❌ Cualquiera podría desactivar todos los upgrades
- ❌ Ataques DoS (llamadas masivas)
- ❌ Usuarios maliciosos podrían sabotear el sistema

### ¿Cómo funciona la protección?

```typescript
// app/api/cron/expire-temp-grants/route.ts
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Solo ejecuta si el token es correcto
  // ...
}
```

### Generar un nuevo secret (opcional)

Si quieres cambiar el secret por uno nuevo:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Luego actualiza:
1. `.env` en el servidor
2. `.env.example` (documentación)
3. El crontab con el nuevo secret

---

## 📊 Monitoreo

### Ver logs del cron job

```bash
# Ver últimas ejecuciones
tail -20 /var/log/cron-expire-grants.log

# Seguir logs en tiempo real
tail -f /var/log/cron-expire-grants.log

# Buscar errores
grep -i error /var/log/cron-expire-grants.log
```

### Logs esperados (exitosos)

```
[2025-11-02T10:00:01.234Z] Response: {"success":true,"deactivated":0}
[2025-11-02T11:00:01.456Z] Response: {"success":true,"deactivated":0}
[2025-11-02T12:00:01.789Z] Response: {"success":true,"deactivated":2}
```

### Ver grants activos en la base de datos

```bash
# Conectar a PostgreSQL
psql -U postgres -d creador_inteligencias

# Ver grants temporales activos
SELECT
  id,
  "userId",
  "eventId",
  "tempTier",
  "expiresAt",
  active
FROM "TempTierGrant"
WHERE active = true
ORDER BY "expiresAt" ASC;
```

---

## 🆘 Troubleshooting

### Problema: El cron no se ejecuta

**Verificación:**

```bash
# 1. Ver si el cron está configurado
crontab -l

# 2. Ver logs del sistema de cron
sudo tail -f /var/log/syslog | grep CRON

# 3. Ver logs de tu aplicación
tail -f /var/log/cron-expire-grants.log
```

**Posibles causas:**

1. **Cron no está activo**
   ```bash
   # Verificar servicio cron
   sudo systemctl status cron

   # Si no está activo, iniciar
   sudo systemctl start cron
   sudo systemctl enable cron
   ```

2. **Ruta incorrecta al endpoint**
   - Verifica que `https://tudominio.com` sea correcto
   - Prueba el endpoint manualmente con curl

3. **CRON_SECRET incorrecto**
   - Verifica que el secret en el cron coincida con `.env`
   - Respuesta será 401 Unauthorized

### Problema: Error 401 Unauthorized

**Causa:** El `CRON_SECRET` no coincide.

**Solución:**

```bash
# 1. Ver el secret en el servidor
cat .env | grep CRON_SECRET

# 2. Ver el cron job
crontab -l | grep expire-grants

# 3. Verificar que coinciden
```

### Problema: Error de conexión

**Causa:** La aplicación no está corriendo o el puerto es incorrecto.

**Verificación:**

```bash
# Ver si la app está corriendo
pm2 status  # Si usas PM2
# o
ps aux | grep node

# Probar endpoint localmente
curl http://localhost:3000/api/cron/expire-temp-grants
```

### Problema: Cron ejecuta pero no desactiva grants

**Verificación:**

```bash
# Ver respuesta del endpoint
curl -H "Authorization: Bearer d09697ebe3fb59e1968befd2d5a265acd560f4e6a0fed2e620bb6b87cf8f0aff" \
  https://tudominio.com/api/cron/expire-temp-grants

# Debería mostrar algo como:
# {"success": true, "deactivated": 2}
```

Si `deactivated: 0` siempre, verifica que existan grants expirados:

```sql
SELECT * FROM "TempTierGrant"
WHERE active = true
AND "expiresAt" < NOW();
```

---

## 🌐 Configuración con Diferentes Setups

### Setup 1: PM2 (Recomendado para Node.js)

Si usas PM2 para manejar tu app:

```bash
# Agregar variable de entorno en ecosystem.config.js
module.exports = {
  apps: [{
    name: 'circuit-prompt-ai',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      CRON_SECRET: 'd09697ebe3fb59e1968befd2d5a265acd560f4e6a0fed2e620bb6b87cf8f0aff',
      // ... otras variables
    }
  }]
}
```

### Setup 2: Docker

Si usas Docker:

```dockerfile
# Dockerfile
ENV CRON_SECRET="d09697ebe3fb59e1968befd2d5a265acd560f4e6a0fed2e620bb6b87cf8f0aff"
```

O en `docker-compose.yml`:

```yaml
services:
  app:
    environment:
      - CRON_SECRET=d09697ebe3fb59e1968befd2d5a265acd560f4e6a0fed2e620bb6b87cf8f0aff
```

El cron job se configura igual en el host (no en el container).

### Setup 3: Nginx Reverse Proxy

Si usas Nginx, no necesitas configuración especial. El cron hace request HTTP normal:

```nginx
# /etc/nginx/sites-available/tudominio.com
server {
  listen 80;
  server_name tudominio.com;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

---

## 📈 Alternativas a Crontab

### Opción 1: Node-cron (dentro de la app)

Si prefieres manejar el cron desde dentro de tu aplicación Node.js:

**Archivo:** `lib/cron/scheduler.ts`

```typescript
import cron from 'node-cron';
import { deactivateExpiredGrants } from '@/lib/usage/special-events';
import { createLogger } from '@/lib/logger';

const log = createLogger('CronScheduler');

export function startCronJobs() {
  // Ejecutar cada hora en el minuto 0
  cron.schedule('0 * * * *', async () => {
    log.info('Running expire-temp-grants cron job');

    try {
      const result = await deactivateExpiredGrants();
      log.info({ deactivated: result.deactivated }, 'Cron job completed');
    } catch (error) {
      log.error({ error }, 'Cron job failed');
    }
  });

  log.info('Cron jobs started');
}
```

**Archivo:** `server.js` o `app.tsx`

```typescript
import { startCronJobs } from '@/lib/cron/scheduler';

// Iniciar cron jobs al arrancar la app
if (process.env.ENABLE_CRON_JOBS === 'true') {
  startCronJobs();
}
```

**Instalar dependencia:**

```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

**Ventajas:**
- ✅ No necesitas configurar crontab
- ✅ Logs centralizados con tu app
- ✅ Más fácil de debuggear

**Desventajas:**
- ❌ Si la app se cae, el cron no ejecuta
- ❌ Necesita proceso corriendo 24/7

### Opción 2: Systemd Timer (Linux moderno)

Si quieres algo más robusto que crontab:

```bash
# /etc/systemd/system/expire-grants.service
[Unit]
Description=Expire temp tier grants

[Service]
Type=oneshot
ExecStart=/usr/bin/curl -H "Authorization: Bearer d09697ebe3fb59e1968befd2d5a265acd560f4e6a0fed2e620bb6b87cf8f0aff" https://tudominio.com/api/cron/expire-temp-grants

# /etc/systemd/system/expire-grants.timer
[Unit]
Description=Expire temp tier grants hourly

[Timer]
OnCalendar=hourly
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
# Activar timer
sudo systemctl enable expire-grants.timer
sudo systemctl start expire-grants.timer

# Ver status
sudo systemctl status expire-grants.timer
```

---

## ✅ Checklist de Configuración

- [ ] Variable `CRON_SECRET` en `.env` del servidor
- [ ] Aplicación corriendo con las variables de entorno cargadas
- [ ] Cron job configurado en crontab (o alternativa)
- [ ] Endpoint responde 401 sin autenticación
- [ ] Endpoint responde 200 con CRON_SECRET correcto
- [ ] Logs del cron guardándose correctamente
- [ ] Verificado después de 1 hora que ejecutó
- [ ] Grants expirados desactivados correctamente

---

## 📚 Referencias

- **Endpoint del cron:** `app/api/cron/expire-temp-grants/route.ts`
- **Servicio de eventos:** `lib/usage/special-events.ts`
- **Documentación completa:** `INTEGRATION_COMPLETE.md`
- **Guía frontend:** `FRONTEND_INTEGRATION_COMPLETE.md`

---

## 🎉 ¡Listo para Producción!

Con esta configuración, tu servidor cloud ejecutará automáticamente el cron job cada hora sin necesidad de Vercel.

**Flujo completo:**

```
Cada hora, crontab ejecuta:
  ↓
curl con Authorization header
  ↓
/api/cron/expire-temp-grants verifica CRON_SECRET
  ↓
Busca grants expirados en DB
  ↓
Los desactiva
  ↓
Retorna { success: true, deactivated: X }
  ↓
Logs guardados en /var/log/cron-expire-grants.log
```

**¡Todo automático, sin Vercel!** 🚀
