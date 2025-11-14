# 🚀 Guía de Configuración de Vercel

## ¿Por qué necesitamos configurar Vercel?

El sistema de límites diarios incluye un **Cron Job** que desactiva automáticamente los upgrades temporales de eventos especiales cuando expiran.

Sin la configuración correcta en Vercel:
- ❌ Los upgrades temporales no expirarán automáticamente
- ❌ Los usuarios podrían mantener acceso gratuito indefinidamente
- ❌ El sistema de eventos especiales no funcionará correctamente

**Con la configuración correcta:**
- ✅ Los upgrades expiran automáticamente cada hora
- ✅ Sistema de eventos 100% funcional
- ✅ Seguridad garantizada (solo Vercel puede ejecutar el cron)

---

## 📋 Configuración Paso a Paso

### Paso 1: Acceder a Vercel Dashboard

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto "circuit-prompt-ai"

### Paso 2: Agregar Variable de Entorno

1. **Ir a Settings** → **Environment Variables**

2. **Agregar nueva variable:**
   - **Key**: `CRON_SECRET`
   - **Value**: `d09697ebe3fb59e1968befd2d5a265acd560f4e6a0fed2e620bb6b87cf8f0aff`
   - **Environments**: Selecciona **Production**, **Preview**, y **Development**

3. Click en **Save**

### Paso 3: Verificar Cron Jobs

Los cron jobs ya están configurados en `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/expire-temp-grants",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Qué hace:**
- Se ejecuta cada hora (minuto 0 de cada hora)
- Vercel envía automáticamente el `CRON_SECRET` en el header `Authorization`
- Desactiva todos los upgrades temporales que han expirado

**Para verificar:**
1. Ve a tu proyecto en Vercel
2. Click en **Settings** → **Cron Jobs**
3. Deberías ver: `/api/cron/expire-temp-grants` con schedule `0 * * * *`

### Paso 4: Re-deploy (si es necesario)

Si acabas de agregar el `CRON_SECRET`, necesitas hacer un nuevo deploy:

```bash
git add .
git commit -m "Add CRON_SECRET for automated grant expiration"
git push
```

O desde Vercel Dashboard:
- **Deployments** → **...** (3 puntos) → **Redeploy**

---

## 🧪 Testing en Producción

### Test 1: Verificar que el endpoint está protegido

```bash
# Sin el secret (debería fallar con 401)
curl https://tu-app.vercel.app/api/cron/expire-temp-grants

# Respuesta esperada:
# {"error": "Unauthorized"}
```

### Test 2: Con el secret correcto (solo para testing)

```bash
# Con el secret (debería funcionar)
curl -H "Authorization: Bearer d09697ebe3fb59e1968befd2d5a265acd560f4e6a0fed2e620bb6b87cf8f0aff" \
  https://tu-app.vercel.app/api/cron/expire-temp-grants

# Respuesta esperada:
# {"success": true, "deactivated": 0}
```

### Test 3: Verificar logs de Cron

1. Ve a Vercel Dashboard → **Deployments**
2. Click en el deployment más reciente
3. Click en **Functions** → Busca `/api/cron/expire-temp-grants`
4. Verifica que se está ejecutando cada hora

---

## 🔐 Seguridad del CRON_SECRET

### ¿Por qué es importante?

El endpoint `/api/cron/expire-temp-grants` **modifica datos de usuarios** (desactiva upgrades). Si no está protegido:
- Cualquiera podría desactivar todos los upgrades temporales
- Podrían llamarlo miles de veces y sobrecargar la DB
- Ataques de denegación de servicio

### ¿Cómo funciona la protección?

1. El endpoint verifica que el header `Authorization` contenga el `CRON_SECRET` correcto
2. Vercel automáticamente envía este header cuando ejecuta el cron
3. Nadie más conoce el secret (está solo en variables de entorno)

```typescript
// lib/cron/expire-temp-grants.ts
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ... resto del código
}
```

### ¿Necesito cambiar el secret?

**No es necesario**, pero si quieres generar uno nuevo:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Luego actualiza:
1. `.env.example` (para documentación)
2. `.env` (local)
3. Vercel Dashboard → Environment Variables

---

## 📊 Monitoreo del Sistema

### Ver ejecuciones del Cron

**Opción 1: Logs de Vercel**
1. Dashboard → **Deployments** → **Functions**
2. Busca `/api/cron/expire-temp-grants`
3. Click para ver logs de ejecuciones

**Opción 2: Logs de la aplicación**

El endpoint loguea cada ejecución:

```
✅ Desactivados 3 grants temporales expirados
```

**Opción 3: Base de datos**

Verifica en tu DB:

```sql
SELECT * FROM "TempTierGrant"
WHERE active = false
ORDER BY "expiresAt" DESC
LIMIT 10;
```

---

## 🆘 Troubleshooting

### Problema: El cron no se ejecuta

**Posibles causas:**

1. **Variable de entorno no configurada**
   - Verifica en Vercel Dashboard → Settings → Environment Variables
   - Debe existir `CRON_SECRET` con el valor correcto

2. **Proyecto en plan Free de Vercel**
   - Los cron jobs requieren plan Pro o superior
   - Solución: Upgrade a Pro ($20/mes) o ejecutar manualmente

3. **Deployment antiguo**
   - El cron solo funciona en deployments recientes
   - Solución: Hacer un nuevo deploy

**Verificación:**
```bash
# Ver si el endpoint está disponible
curl https://tu-app.vercel.app/api/cron/expire-temp-grants
# Debe responder 401 Unauthorized (es correcto)
```

### Problema: Error 401 en el cron

**Causa:** El `CRON_SECRET` en Vercel no coincide con el del código.

**Solución:**
1. Copia el valor EXACTO de `.env.example`
2. Pégalo en Vercel → Environment Variables
3. Re-deploy

### Problema: El endpoint funciona pero no desactiva grants

**Verificación:**
1. ¿Hay grants expirados en la DB?
   ```sql
   SELECT * FROM "TempTierGrant"
   WHERE active = true
   AND "expiresAt" < NOW();
   ```

2. ¿El endpoint retorna success?
   ```bash
   curl -H "Authorization: Bearer <secret>" \
     https://tu-app.vercel.app/api/cron/expire-temp-grants
   ```

3. Ver logs en Vercel para errores

---

## 📈 Costos de Vercel

### Plan Free
- ❌ **No incluye Cron Jobs**
- Necesitas ejecutar manualmente o usar otro servicio

### Plan Pro ($20/mes)
- ✅ **Incluye Cron Jobs ilimitados**
- ✅ Mejor para producción
- ✅ Más recursos y performance

### Alternativas sin Cron Jobs

Si estás en plan Free, puedes:

**Opción 1: GitHub Actions (GRATIS)**

Crea `.github/workflows/expire-grants.yml`:

```yaml
name: Expire Temp Grants
on:
  schedule:
    - cron: '0 * * * *'  # Cada hora
jobs:
  expire:
    runs-on: ubuntu-latest
    steps:
      - name: Call endpoint
        run: |
          curl -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://tu-app.vercel.app/api/cron/expire-temp-grants
```

Y agrega el `CRON_SECRET` en GitHub: Settings → Secrets → New repository secret

**Opción 2: Cron-job.org (GRATIS)**

1. Ve a https://cron-job.org/
2. Registra una cuenta
3. Crea un job:
   - URL: `https://tu-app.vercel.app/api/cron/expire-temp-grants`
   - Schedule: `0 * * * *`
   - Header: `Authorization: Bearer <tu-secret>`

---

## ✅ Checklist Final

Antes de considerar la configuración completa:

- [ ] Variable `CRON_SECRET` agregada en Vercel
- [ ] Seleccionadas las 3 environments (Production, Preview, Development)
- [ ] Deploy exitoso después de agregar el secret
- [ ] Endpoint `/api/cron/expire-temp-grants` responde 401 sin auth
- [ ] Endpoint responde 200 con el secret correcto (opcional testear)
- [ ] Cron job visible en Vercel Dashboard → Settings → Cron Jobs
- [ ] Sin errores en logs de Functions después de 1 hora

---

## 📚 Referencias

- **Endpoint del cron:** `app/api/cron/expire-temp-grants/route.ts`
- **Servicio de eventos:** `lib/usage/special-events.ts`
- **Documentación completa:** `INTEGRATION_COMPLETE.md`
- **Guía de integración:** `DAILY_LIMITS_INTEGRATION_GUIDE.md`

---

## 🎉 ¡Listo!

Una vez configurado el `CRON_SECRET`, el sistema de eventos especiales funcionará automáticamente:

1. Usuario activa evento especial (ej: Navidad)
2. Recibe upgrade temporal a Plus por 24h
3. Cada hora, Vercel ejecuta el cron
4. Al cumplirse las 24h, el upgrade se desactiva automáticamente
5. Usuario vuelve a su tier original

**¡Sin intervención manual necesaria!** 🚀
