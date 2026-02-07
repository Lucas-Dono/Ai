# 🛡️ Advanced Security System

Sistema completo de seguridad defensiva implementado con honeypots, tarpits, fingerprinting avanzado, canary tokens y detección de amenazas en tiempo real.

## 🚀 Quick Start

### 1. Instalación

```bash
# Migrar base de datos
npx prisma migrate dev --name add_security_system

# Setup inicial
npx ts-node scripts/setup-security-system.ts
```

### 2. Configuración Básica

Añade a tu `.env`:

```env
SECURITY_EMAIL=security@example.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
```

### 3. Uso Básico

```typescript
import { withSecurity, SecurityPresets } from '@/lib/security';

// Proteger un endpoint
export const GET = withSecurity(async (request) => {
  return NextResponse.json({ message: 'Secure endpoint' });
}, SecurityPresets.privateAPI);
```

### 4. Ver Dashboard

Accede a: `http://localhost:3000/security/dashboard`

## 📦 Componentes

| Componente | Descripción | Ubicación |
|------------|-------------|-----------|
| **Fingerprinting** | Identificación avanzada de clientes (IP, JA3, behavioral) | `lib/security/fingerprinting.ts` |
| **Threat Detection** | Detección de SQL injection, XSS, path traversal, etc. | `lib/security/threat-detection.ts` |
| **Honeypots** | Endpoints trampa (`/admin`, `/wp-admin`, `/api/debug`, etc.) | `lib/security/honeypots.ts` |
| **Tarpit** | Ralentización de atacantes detectados | `lib/security/tarpit.ts` |
| **Canary Tokens** | Tokens trampa en datos sensibles | `lib/security/canary-tokens.ts` |
| **Alerting** | Alertas en tiempo real (email, Slack, dashboard) | `lib/security/alerting.ts` |
| **Dashboard** | Dashboard visual para monitoreo | `app/security/dashboard/page.tsx` |
| **Middleware** | Integración central de todos los componentes | `lib/security/security-middleware.ts` |

## 🎯 Características Principales

✅ **Detección Automática**: Identifica amenazas sin intervención manual
✅ **Auto-blocking**: Bloquea automáticamente atacantes de alto riesgo
✅ **Fingerprinting Multi-señal**: IP, User-Agent, JA3, behavioral
✅ **Tarpit Inteligente**: Ralentiza atacantes sin afectar usuarios legítimos
✅ **15+ Honeypots**: Endpoints falsos realistas
✅ **Canary Tokens**: Detecta exfiltración de datos
✅ **Alertas en Tiempo Real**: Email, Slack, Dashboard
✅ **Dashboard Visual**: Monitoreo centralizado con threat score
✅ **Base de Datos**: Tracking completo de amenazas

## 📚 Ejemplos

### Proteger API Privada

```typescript
import { withSecurity, SecurityPresets } from '@/lib/security';

export const GET = withSecurity(async (request) => {
  // Tu código aquí
  return NextResponse.json({ data: 'sensitive' });
}, SecurityPresets.privateAPI);
```

### Detectar Brute Force

```typescript
import { detectBruteForce, sendAlert, AlertTemplates } from '@/lib/security';

const bruteForce = await detectBruteForce(ipAddress, '/api/auth/login', 5);

if (bruteForce.isBruteForce) {
  await sendAlert(
    AlertTemplates.bruteForceDetected(ipAddress, '/api/auth/login', bruteForce.attempts)
  );

  return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
}
```

### Crear Canary Token

```typescript
import { createCanaryToken } from '@/lib/security';

await createCanaryToken({
  type: 'api_key',
  description: 'Fake Stripe key in docs',
  placedIn: 'Documentation',
  dataContext: { location: 'docs/api.md' },
  alertEmails: ['security@example.com'],
});
```

## 📊 Dashboard

El dashboard proporciona:

- **Threat Score General**: 0-100 indicador de nivel de amenaza
- **Alertas Recientes**: Últimas alertas con severidad
- **Top Attackers**: IPs más maliciosas con detalles
- **Estadísticas**: Threats, honeypots, tarpit, canary tokens
- **Auto-refresh**: Actualización cada 30 segundos

## 🔧 Configuración Avanzada

### Presets Disponibles

```typescript
// API pública (menos restrictiva)
SecurityPresets.publicAPI

// API privada (muy restrictiva)
SecurityPresets.privateAPI

// Autenticación (detecta brute force)
SecurityPresets.authentication

// Dashboard (permisivo)
SecurityPresets.dashboard
```

### Configuración Personalizada

```typescript
{
  enableFingerprinting: true,
  enableHoneypots: true,
  enableTarpit: true,
  enableCanaryTokens: true,
  enableThreatDetection: true,
  autoBlock: true,
  autoBlockThreshold: 80, // Threat score para auto-block
}
```

## 🐝 Honeypots Incluidos

- `/admin` - Admin panel falso
- `/wp-admin` - WordPress admin falso
- `/phpmyadmin` - PHPMyAdmin falso
- `/api/internal/users` - API interna falsa
- `/api/debug` - Debug endpoint con datos sensibles falsos
- `/.env` - Archivo de configuración falso
- `/config.json` - Config JSON falso
- `/.git/config` - Git config falso
- Y más...

## 📧 Alertas

### Canales Soportados

- **Email**: Alertas críticas y resumen diario
- **Webhook**: Slack, Discord (formato compatible)
- **Dashboard**: Notificaciones en tiempo real
- **SMS**: Opcional, solo alertas críticas

### Tipos de Alertas

- **Real-time**: Amenazas detectadas en tiempo real
- **Critical**: Requieren acción inmediata (canary tokens, ataques críticos)
- **Honeypot**: Accesos a honeypots
- **Digest**: Resumen diario de actividad

## 📖 Documentación Completa

Ver [SECURITY_SYSTEM_DOCS.md](./SECURITY_SYSTEM_DOCS.md) para documentación detallada.

Ver [SECURITY_INTEGRATION_EXAMPLE.ts](./SECURITY_INTEGRATION_EXAMPLE.ts) para ejemplos de integración.

## 🔍 API Endpoints

```
GET  /api/security/dashboard?timeRange=24h  - Dashboard data
GET  /api/security/alerts?limit=50          - List alerts
POST /api/security/alerts                   - Acknowledge/resolve
GET  /api/security/honeypots                - List honeypots
```

## 🛠️ Scripts Útiles

```bash
# Setup inicial
npx ts-node scripts/setup-security-system.ts

# Enviar resumen diario
npx ts-node scripts/cron-security-digest.ts
```

## ⚡ Performance

- **Fingerprinting**: ~10-50ms por request
- **Threat Detection**: ~5-10ms por request
- **Honeypots**: 0ms (solo si coincide)
- **Tarpit**: Delay intencional (1s-60s)
- **Database**: Queries optimizadas con índices

## 🔐 Mejores Prácticas

1. ✅ Monitorea el dashboard regularmente
2. ✅ Responde a alertas críticas inmediatamente
3. ✅ Ajusta umbrales según tu tráfico
4. ✅ Mantén canary tokens secretos
5. ✅ Haz backups de datos de seguridad
6. ✅ Prueba en staging primero

## 🐛 Troubleshooting

### Demasiados Falsos Positivos

```typescript
const config = {
  autoBlockThreshold: 90, // Más permisivo
};
```

### Tarpit Afecta Usuarios Legítimos

```typescript
// Solo aplicar a threat score > 50
if (threatScore > 50) {
  applyTarpit(...);
}
```

## 📝 Licencia

Sistema desarrollado para protección defensiva de aplicaciones web.

---

**Sistema implementado y listo para usar! 🛡️**

Para más detalles, consulta la [documentación completa](./SECURITY_SYSTEM_DOCS.md).
