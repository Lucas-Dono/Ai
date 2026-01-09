# 🚀 Security System - Pasos de Migración

## Paso 1: Migración de Base de Datos

El sistema de seguridad requiere nuevas tablas en la base de datos. Ejecuta:

```bash
npx prisma migrate dev --name add_security_system
```

Esto creará las siguientes tablas:
- `ClientFingerprint`
- `ThreatDetection`
- `HoneypotHit`
- `CanaryToken`
- `CanaryTokenTrigger`
- `ThreatAlert`
- `AttackPattern`

## Paso 2: Generar Cliente de Prisma

```bash
npx prisma generate
```

## Paso 3: Configurar Variables de Entorno

Añade a tu `.env`:

```env
# Alertas de Seguridad (REQUERIDO)
SECURITY_EMAIL=tu-email@example.com

# Webhook para Slack/Discord (OPCIONAL)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# SMS para alertas críticas (OPCIONAL)
SECURITY_SMS=+1234567890
```

## Paso 4: Setup Inicial del Sistema

```bash
npx ts-node scripts/setup-security-system.ts
```

Este script:
- ✅ Verifica la conexión a la base de datos
- ✅ Verifica que las tablas existen
- ✅ Crea canary tokens por defecto
- ✅ Verifica configuración
- ✅ Muestra estadísticas iniciales

## Paso 5: Integrar en el Middleware (OPCIONAL)

Si quieres aplicar seguridad a todas las rutas automáticamente, edita `middleware.ts`:

```typescript
import { securityMiddleware, SecurityPresets } from '@/lib/security';

// Dentro de tu función middleware:
if (req.nextUrl.pathname.startsWith('/api/')) {
  return securityMiddleware(
    req,
    async () => NextResponse.next(),
    SecurityPresets.publicAPI
  );
}
```

Ver [SECURITY_INTEGRATION_EXAMPLE.ts](./SECURITY_INTEGRATION_EXAMPLE.ts) para más ejemplos.

## Paso 6: Proteger Endpoints Específicos

Usa el wrapper `withSecurity`:

```typescript
import { withSecurity, SecurityPresets } from '@/lib/security';

export const GET = withSecurity(async (request) => {
  // Tu código aquí
  return NextResponse.json({ data: 'secure' });
}, SecurityPresets.privateAPI);
```

## Paso 7: Acceder al Dashboard

Visita:
```
http://localhost:3000/security/dashboard
```

## Paso 8: Probar los Honeypots

Prueba que los honeypots funcionan:

```bash
# Debería registrar un hit en honeypot
curl http://localhost:3000/admin

# Ver en el dashboard los hits
```

## Paso 9: Verificar Alertas

Las alertas se enviarán a:
- ✉️ Email configurado en `SECURITY_EMAIL`
- 💬 Webhook configurado en `SLACK_WEBHOOK_URL`
- 📊 Dashboard en `/security/dashboard`

## Paso 10: Configurar Cron Job para Resumen Diario (OPCIONAL)

Añade a tu crontab:

```bash
# Enviar resumen de seguridad cada día a las 9 AM
0 9 * * * cd /path/to/app && npx ts-node scripts/cron-security-digest.ts
```

---

## ✅ Checklist Post-Instalación

- [ ] Migración de base de datos ejecutada
- [ ] `SECURITY_EMAIL` configurado en `.env`
- [ ] Setup script ejecutado exitosamente
- [ ] Dashboard accesible en `/security/dashboard`
- [ ] Al menos un endpoint protegido con `withSecurity`
- [ ] Honeypots probados y funcionando
- [ ] Alertas configuradas (email/webhook)
- [ ] Documentación leída

---

## 🐛 Troubleshooting

### Error: Tabla no existe

**Solución**: Ejecuta la migración de Prisma:
```bash
npx prisma migrate dev --name add_security_system
```

### Error: Cannot find module '@/lib/security'

**Solución**: Asegúrate de que todos los archivos fueron creados correctamente en `lib/security/`.

### Dashboard no carga

**Solución**:
1. Verifica que el archivo existe en `app/security/dashboard/page.tsx`
2. Verifica que las API routes existen en `app/api/security/`
3. Revisa la consola del navegador para errores

### No se reciben alertas por email

**Solución**:
1. Verifica que `SECURITY_EMAIL` está configurado
2. El sistema de email está en modo "logging" por defecto
3. Para envío real, implementa integración con SendGrid/Resend en `lib/security/alerting.ts`

### Honeypots no detectan nada

**Solución**:
1. Prueba manualmente: `curl http://localhost:3000/admin`
2. Verifica los logs del servidor
3. Verifica que el middleware de honeypots está activo

---

## 📚 Próximos Pasos

1. Lee la documentación completa: [SECURITY_SYSTEM_DOCS.md](./SECURITY_SYSTEM_DOCS.md)
2. Revisa los ejemplos de integración: [SECURITY_INTEGRATION_EXAMPLE.ts](./SECURITY_INTEGRATION_EXAMPLE.ts)
3. Revisa el README: [SECURITY_README.md](./SECURITY_README.md)
4. Monitorea el dashboard regularmente
5. Ajusta los umbrales según tu tráfico real

---

**¡Sistema de seguridad instalado exitosamente! 🛡️**
