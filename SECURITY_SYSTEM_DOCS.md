# 🛡️ Advanced Security System Documentation

Sistema completo de seguridad defensiva implementado en el servidor con honeypots, tarpits, fingerprinting avanzado, canary tokens y detección de amenazas en tiempo real.

## 📋 Tabla de Contenidos

1. [Componentes del Sistema](#componentes-del-sistema)
2. [Características](#características)
3. [Instalación y Setup](#instalación-y-setup)
4. [Uso](#uso)
5. [Dashboard](#dashboard)
6. [Configuración](#configuración)
7. [Monitoreo y Alertas](#monitoreo-y-alertas)
8. [Integración](#integración)

---

## Componentes del Sistema

### 1. **Client Fingerprinting** 📋
Sistema de identificación avanzada de clientes mediante múltiples señales:

- **Network Fingerprinting**: IP, ASN, geolocalización, ISP
- **HTTP Fingerprinting**: User-Agent, Accept headers, idioma
- **TLS/SSL Fingerprinting**: JA3 hash (requiere configuración de proxy)
- **Behavioral Fingerprinting**: Patrones de requests, timing, orden

**Ubicación**: `lib/security/fingerprinting.ts`

### 2. **Threat Detection** 🔍
Detección automática de patrones de ataque:

- SQL Injection
- XSS (Cross-Site Scripting)
- Path Traversal
- Command Injection
- Directory Scanning
- Brute Force

**Ubicación**: `lib/security/threat-detection.ts`

### 3. **Honeypot Endpoints** 🍯
Endpoints trampa que parecen reales pero detectan atacantes:

- `/admin`, `/wp-admin`, `/phpmyadmin` - Admin panels falsos
- `/api/internal/users` - API interna falsa
- `/api/debug` - Debug endpoint con datos sensibles falsos
- `/.env`, `/config.json` - Archivos de configuración falsos
- Y más...

**Ubicación**: `lib/security/honeypots.ts`

### 4. **Tarpit Middleware** ⏱️
Sistema que ralentiza respuestas a atacantes detectados:

- Delay fijo basado en threat score
- Exponential backoff para atacantes repetitivos
- Respuestas lentas byte-por-byte
- Consumo de recursos del atacante

**Ubicación**: `lib/security/tarpit.ts`

### 5. **Canary Tokens** 🐤
Tokens trampa en datos sensibles para detectar exfiltración:

- API keys falsas
- JWT tokens falsos
- Emails trampa
- URLs trampa
- Queries SQL falsas

**Ubicación**: `lib/security/canary-tokens.ts`

### 6. **Real-Time Alerting** 🚨
Sistema de alertas en tiempo real:

- Email alerts (críticas y resumen diario)
- Webhook alerts (Slack, Discord)
- Dashboard notifications
- SMS (opcional, solo críticas)

**Ubicación**: `lib/security/alerting.ts`

### 7. **Security Dashboard** 📊
Dashboard web para monitoreo en tiempo real:

- Threat score general
- Alertas recientes
- Top attackers
- Estadísticas de honeypots
- Gráficos y visualizaciones

**Ubicación**: `app/security/dashboard/page.tsx`

---

## Características

✅ **Detección Automática**: Identifica amenazas sin intervención manual
✅ **Auto-blocking**: Bloquea automáticamente atacantes de alto riesgo
✅ **Fingerprinting Multi-señal**: Combina múltiples técnicas de identificación
✅ **Tarpit Inteligente**: Ralentiza atacantes sin afectar usuarios legítimos
✅ **Honeypots Realistas**: Endpoints falsos convincentes
✅ **Canary Tokens**: Detecta exfiltración de datos
✅ **Alertas en Tiempo Real**: Notificaciones inmediatas de amenazas críticas
✅ **Dashboard Visual**: Monitoreo centralizado y fácil de usar
✅ **Base de Datos**: Tracking completo de amenazas y patrones

---

## Instalación y Setup

### 1. Migración de Base de Datos

El sistema requiere los modelos de Prisma definidos. Ejecuta:

```bash
npx prisma migrate dev --name add_security_system
```

### 2. Setup de Canary Tokens (Opcional)

Genera canary tokens por defecto:

```bash
npx ts-node scripts/setup-canary-tokens.ts
```

### 3. Configuración de Variables de Entorno

Añade al `.env`:

```env
# Security Alerts
SECURITY_EMAIL=security@example.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Optional: SMS alerts
SECURITY_SMS=+1234567890

# Optional: IP Geolocation API
# (Free tier: ip-api.com - 45 req/min)
# No se requiere API key para ip-api.com
```

### 4. Configuración de Nginx/Caddy (Opcional - JA3)

Para habilitar JA3 fingerprinting, configura tu proxy reverso:

**Nginx**:
```nginx
# Requiere módulo nginx-fingerprint
# https://github.com/phuslu/nginx-fingerprint

location / {
    proxy_set_header X-JA3-Hash $ssl_ja3_hash;
    proxy_set_header X-JA3-String $ssl_ja3_string;
    proxy_pass http://localhost:3000;
}
```

**Caddy** (tiene JA3 built-in):
```caddy
example.com {
    header_up X-JA3-Hash {tls_client_ja3_hash}
    reverse_proxy localhost:3000
}
```

---

## Uso

### Uso Básico en Route Handlers

```typescript
import { withSecurity } from '@/lib/security/security-middleware';

export const GET = withSecurity(async (request) => {
  // Tu handler normal aquí
  return NextResponse.json({ message: 'Hello' });
});
```

### Uso con Configuración Personalizada

```typescript
import { withSecurity, SecurityPresets } from '@/lib/security/security-middleware';

// API privada con seguridad máxima
export const GET = withSecurity(async (request) => {
  // ...
}, SecurityPresets.privateAPI);

// API pública con seguridad moderada
export const GET = withSecurity(async (request) => {
  // ...
}, SecurityPresets.publicAPI);

// Endpoint de autenticación (detectar brute force)
export const POST = withSecurity(async (request) => {
  // ...
}, SecurityPresets.authentication);
```

### Crear Honeypot Personalizado

```typescript
import { createDynamicHoneypot } from '@/lib/security/honeypots';

createDynamicHoneypot({
  path: '/api/secret',
  name: 'My Custom Honeypot',
  type: 'fake_api',
  description: 'Custom honeypot for testing',
  fakeResponse: { secret: 'fake-data' },
  shouldTarpit: true,
  tarpitDelay: 5000,
  autoBlock: true,
});
```

### Crear Canary Token

```typescript
import { createCanaryToken } from '@/lib/security/canary-tokens';

await createCanaryToken({
  type: 'api_key',
  description: 'Fake Stripe key in docs',
  placedIn: 'Documentation page',
  dataContext: { location: 'docs/payment.md' },
  alertEmails: ['security@example.com'],
  alertWebhook: 'https://hooks.slack.com/...',
});
```

### Enviar Alerta Manual

```typescript
import { sendAlert } from '@/lib/security/alerting';

await sendAlert({
  type: 'real_time',
  severity: 'high',
  title: 'Custom Security Event',
  description: 'Descripción detallada del evento',
  channels: {
    email: ['security@example.com'],
    webhook: process.env.SLACK_WEBHOOK_URL,
    dashboard: true,
  },
});
```

---

## Dashboard

### Acceso

El dashboard está disponible en:
```
http://localhost:3000/security/dashboard
```

### Características del Dashboard

1. **Threat Score General**: Score de 0-100 que indica nivel de amenaza
2. **Alertas Recientes**: Últimas 10 alertas con severidad y estado
3. **Top Attackers**: IPs más maliciosas con detalles
4. **Estadísticas**:
   - Threats por tipo
   - Honeypot hits
   - Tarpit statistics
   - Canary triggers
5. **Auto-refresh**: Se actualiza cada 30 segundos
6. **Time Range Selector**: Ver datos de última hora, 24h, 7d, 30d

---

## Configuración

### Configuraciones de Seguridad Disponibles

```typescript
interface SecurityConfig {
  enableFingerprinting?: boolean;     // Default: true
  enableHoneypots?: boolean;          // Default: true
  enableTarpit?: boolean;             // Default: true
  enableCanaryTokens?: boolean;       // Default: true
  enableThreatDetection?: boolean;    // Default: true
  autoBlock?: boolean;                // Default: true
  autoBlockThreshold?: number;        // Default: 80 (threat score)
}
```

### Presets Disponibles

- **`SecurityPresets.publicAPI`**: Para APIs públicas (menos restrictivo)
- **`SecurityPresets.privateAPI`**: Para APIs privadas (muy restrictivo)
- **`SecurityPresets.authentication`**: Para endpoints de auth (detecta brute force)
- **`SecurityPresets.dashboard`**: Para dashboards (permisivo)

### Ajustar Umbrales

```typescript
// Auto-block más agresivo
const config = {
  autoBlock: true,
  autoBlockThreshold: 50, // Bloquear con threat score > 50
};

// Tarpit más lento
const tarpitConfig = {
  minDelay: 5000,  // 5 segundos mínimo
  maxDelay: 120000, // 2 minutos máximo
  exponentialBackoff: true,
};
```

---

## Monitoreo y Alertas

### Tipos de Alertas

1. **Real-time Alerts**: Amenazas detectadas en tiempo real
2. **Critical Alerts**: Requieren acción inmediata (canary tokens, ataques críticos)
3. **Honeypot Alerts**: Accesos a honeypots
4. **Digest Alerts**: Resumen diario de actividad

### Canales de Notificación

#### Email
Configura `SECURITY_EMAIL` en `.env`. Las alertas críticas se envían inmediatamente.

#### Slack/Discord Webhook
Configura `SLACK_WEBHOOK_URL` en `.env`. Compatible con formato Slack y Discord.

#### Dashboard
Todas las alertas aparecen en el dashboard en tiempo real.

### Resumen Diario

Para enviar resumen diario automático, configura cron job:

```bash
# Añadir a crontab
0 9 * * * cd /path/to/app && node scripts/send-daily-digest.js
```

---

## Integración

### Integrar en el Middleware Principal

Edita `middleware.ts`:

```typescript
import { securityMiddleware } from '@/lib/security/security-middleware';

export default async function middleware(req: NextRequest) {
  // Tu lógica de middleware existente...

  // Aplicar security middleware a ciertas rutas
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return securityMiddleware(req, async () => {
      // Tu handler existente
      return NextResponse.next();
    });
  }

  return NextResponse.next();
}
```

### Integrar con Sistema de Autenticación

```typescript
// En tu handler de login
import { detectBruteForce } from '@/lib/security/threat-detection';

export const POST = async (request: NextRequest) => {
  const ip = getClientIp(request);

  // Verificar brute force
  const bruteForce = await detectBruteForce(ip, '/api/auth/login', 5);

  if (bruteForce.isBruteForce) {
    // Enviar alerta
    await sendAlert(AlertTemplates.bruteForceDetected(ip, '/api/auth/login', bruteForce.attempts));

    return NextResponse.json(
      { error: 'Too many login attempts' },
      { status: 429 }
    );
  }

  // Tu lógica de login...
};
```

---

## API Endpoints

### Security Dashboard
- `GET /api/security/dashboard?timeRange=24h` - Dashboard data

### Alerts Management
- `GET /api/security/alerts?limit=50` - List alerts
- `POST /api/security/alerts` - Acknowledge/resolve alerts

### Honeypots
- `GET /api/security/honeypots` - List honeypot configs

---

## Mejores Prácticas

1. **Monitorea el Dashboard Regularmente**: Revisa el dashboard al menos una vez al día
2. **Responde a Alertas Críticas**: Las alertas críticas requieren atención inmediata
3. **Revisa Falsos Positivos**: Marca alertas como false positive si es necesario
4. **Ajusta Umbrales**: Afina los umbrales según tu tráfico real
5. **Mantén Canary Tokens Secretos**: No compartas los valores de canary tokens
6. **Backups de Base de Datos**: Los datos de seguridad son valiosos para análisis
7. **Testing**: Prueba en staging antes de production

---

## Troubleshooting

### Problema: Demasiados Falsos Positivos

**Solución**: Ajusta los umbrales de detección:
```typescript
const config = {
  autoBlockThreshold: 90, // Más permisivo
  enableThreatDetection: true,
};
```

### Problema: Tarpit Afecta Usuarios Legítimos

**Solución**: Aumenta el threshold de tarpit:
```typescript
// Solo aplicar tarpit a threat score > 50
if (threatScore > 50) {
  applyTarpit(...);
}
```

### Problema: Honeypots No Detectan Nada

**Solución**:
1. Verifica que los honeypots estén configurados correctamente
2. Añade más honeypots comunes
3. Revisa los logs para ver si hay errores

### Problema: Canary Tokens No Se Activan

**Solución**:
1. Verifica que el middleware de canary tokens esté activo
2. Prueba con un token manualmente
3. Revisa los logs de la base de datos

---

## Performance Considerations

- **Fingerprinting**: ~10-50ms por request (sin geolocation)
- **Threat Detection**: ~5-10ms por request
- **Honeypots**: 0ms (solo si coincide el path)
- **Tarpit**: Delay intencional (1s - 60s según threat score)
- **Database**: Queries optimizadas con índices

Para mejor performance:
- Deshabilita `includeGeolocation` en fingerprinting
- Usa Redis/Upstash para rate limiting
- Implementa caching de fingerprints
- Usa connection pooling en Prisma

---

## Licencia y Créditos

Sistema desarrollado para protección defensiva de aplicaciones web.
Inspirado en técnicas de honeypots, canary tokens y threat intelligence.

**Tecnologías utilizadas**:
- Prisma ORM
- Next.js 14+
- PostgreSQL
- TailwindCSS
- TypeScript

---

## Soporte

Para preguntas o issues:
1. Revisa esta documentación
2. Revisa los logs del sistema
3. Abre un issue en el repositorio

---

**¡Sistema de seguridad implementado exitosamente! 🛡️**
