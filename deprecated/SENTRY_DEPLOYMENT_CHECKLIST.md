# Sentry Deployment Checklist

Lista de verificación para configurar Sentry antes del deploy a producción.

## Pre-Deploy Setup

### 1. Cuenta de Sentry
- [ ] Crear cuenta en [sentry.io](https://sentry.io)
- [ ] Crear organización
- [ ] Crear proyecto "creador-inteligencias" (tipo: Next.js)
- [ ] Copiar DSN del proyecto

### 2. Variables de Entorno

#### Development (.env.local)
```bash
NEXT_PUBLIC_SENTRY_DSN="https://your_key@o123456.ingest.sentry.io/7654321"
SENTRY_ORG="tu-organizacion"
SENTRY_PROJECT="creador-inteligencias"
```

#### Production (Vercel/Platform)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Tu DSN de Sentry
- [ ] `SENTRY_ORG` - Nombre de tu organización
- [ ] `SENTRY_PROJECT` - Nombre del proyecto
- [ ] `SENTRY_AUTH_TOKEN` - Token para upload de source maps
- [ ] `NEXT_PUBLIC_SENTRY_RELEASE` - Automático en Vercel (`${VERCEL_GIT_COMMIT_SHA}`)

### 3. Auth Token para Source Maps

1. Ve a Sentry → Settings → Account → API → Auth Tokens
2. Click "Create New Token"
3. Nombre: "Source Maps Upload - Creador Inteligencias"
4. Scopes:
   - [x] `project:releases`
   - [x] `project:write`
5. Copia el token
6. Añádelo como `SENTRY_AUTH_TOKEN` en tu plataforma de deploy

### 4. Configurar Proyecto en Sentry

#### Settings
- [ ] Team Access - Invitar miembros del equipo
- [ ] Project Name - Verificar nombre
- [ ] Default Environment - production

#### Inbound Filters
- [ ] Habilitar filtros para:
  - [x] Browser extensions
  - [x] Legacy browsers
  - [x] Localhost
  - [x] Web crawlers

#### Data Scrubbing
- [ ] Verify PII scrubbing está habilitado
- [ ] Review sensitive fields list

### 5. Alertas

Crear las siguientes alertas:

#### Alert 1: High Error Rate
- **Nombre**: High Error Rate
- **Condición**: Error count > 50 in 1 minute
- **Acción**: Email + Slack
- **Frecuencia**: Max 1 alert every 30 minutes

#### Alert 2: New Issues
- **Nombre**: New Issues
- **Condición**: A new issue is first seen
- **Acción**: Email
- **Frecuencia**: Every time

#### Alert 3: Performance Degradation
- **Nombre**: Slow API Responses
- **Condición**: p95 response time > 2000ms
- **Acción**: Slack
- **Frecuencia**: Every hour

#### Alert 4: High Memory Usage (opcional)
- **Nombre**: High Memory Usage
- **Condición**: Custom metric: memory > 80%
- **Acción**: Email + Slack
- **Frecuencia**: Every 15 minutes

### 6. Integraciones

#### Slack (Recomendado)
- [ ] Ve a Sentry → Settings → Integrations → Slack
- [ ] Click "Add Workspace"
- [ ] Autoriza el workspace
- [ ] Selecciona canal para notificaciones (ej: #alerts)
- [ ] Configura qué eventos enviar

#### GitHub (Recomendado)
- [ ] Ve a Sentry → Settings → Integrations → GitHub
- [ ] Conecta tu repositorio
- [ ] Habilita:
  - [x] Auto-assign issues to commits
  - [x] Create issues from Sentry errors
  - [x] Resolve issues via commits

### 7. Release Tracking

Vercel hace esto automáticamente con `VERCEL_GIT_COMMIT_SHA`.

Para otros entornos:
```bash
# En CI/CD
export NEXT_PUBLIC_SENTRY_RELEASE=$(git rev-parse HEAD)
```

### 8. Dashboard Personalizado

Crear dashboard con:
- [ ] Error Rate (últimas 24h)
- [ ] Top 10 Errors
- [ ] API Response Time (p95)
- [ ] Database Query Performance
- [ ] AI Operations Latency
- [ ] User Feedback Count
- [ ] Active Users

## Post-Deploy Verification

### 1. Test Error Tracking

```typescript
// Temporal - remover después de verificar
import * as Sentry from "@sentry/nextjs";

// En alguna página/API route
Sentry.captureException(new Error("Sentry production test"));
```

- [ ] Verificar que el error aparece en Sentry dashboard
- [ ] Verificar source maps (stack trace debe ser legible)
- [ ] Verificar user context si hay sesión

### 2. Test Performance Tracking

- [ ] Hacer algunas requests a API routes
- [ ] Verificar que aparecen en Performance → Transactions
- [ ] Revisar tiempos de respuesta

### 3. Test User Feedback

- [ ] Abrir la app en producción
- [ ] Click en el botón de feedback (bug icon)
- [ ] Enviar un reporte de prueba
- [ ] Verificar que aparece en Sentry → User Feedback

### 4. Test Session Replay

- [ ] Navegar por la app
- [ ] Generar un error
- [ ] Verificar que el replay está disponible en el issue

## Sample Rates - Ajustar según Tráfico

### Estimación de Tráfico

Calcula tu tráfico mensual esperado:
- Usuarios activos/mes: ______
- Page views/usuario: ______
- API calls/usuario: ______
- Total transactions/mes: ______ (page views + API calls)

### Ajustar Sample Rates

Free tier: 10,000 transactions/mes

```typescript
// Si tu tráfico mensual es:
// < 100K transactions → tracesSampleRate: 0.1 (10%)
// 100K-500K → tracesSampleRate: 0.02 (2%)
// > 500K → tracesSampleRate: 0.01 (1%) o tracesSampler custom
```

Editar en `sentry.client.config.ts` y `sentry.server.config.ts`:

```typescript
tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
```

### Session Replay

Free tier: 50 replays/mes

```typescript
replaysSessionSampleRate: 0.01,  // 1% de sesiones
replaysOnErrorSampleRate: 1.0,   // 100% cuando hay error
```

## Monitoring Plan

### Daily
- [ ] Revisar nuevos errores
- [ ] Revisar error rate
- [ ] Revisar performance degradation

### Weekly
- [ ] Revisar top 10 errores
- [ ] Triage issues (resolver/ignorar)
- [ ] Revisar user feedback
- [ ] Analizar session replays de errores críticos

### Monthly
- [ ] Revisar quota usage (errors/transactions)
- [ ] Ajustar sample rates si es necesario
- [ ] Review y actualizar alertas
- [ ] Limpiar issues resueltos

## Cost Management

### Free Tier Limits
- 5,000 errors/mes
- 10,000 transactions/mes
- 50 session replays/mes
- 1 team member

### Si Excedes Free Tier

#### Opción 1: Optimizar
- Reducir sample rates
- Filtrar más errores con `ignoreErrors`
- Excluir health checks de tracing
- Reducir session replay rate

#### Opción 2: Upgrade
- Team: $26/mes (50K errors, 100K transactions)
- Business: $80/mes (100K errors, 500K transactions)

### Ignoring Known Errors

Añadir a `sentry.*.config.ts`:

```typescript
ignoreErrors: [
  "NetworkError",
  "Failed to fetch",
  "AbortError",
  "ChunkLoadError",
  "Load failed",
  // Añade más según necesites
],
```

## Security Checklist

- [ ] PII scrubbing habilitado
- [ ] Headers sensibles removidos (beforeSend)
- [ ] Query params sensibles removidos
- [ ] Session Replay masking configurado
- [ ] IP addresses anonimizadas (Settings → Security & Privacy)

## Performance Checklist

- [ ] Source maps se suben correctamente
- [ ] Bundle size no aumentó significativamente (<50KB overhead)
- [ ] No hay overhead visible en performance (<5ms)
- [ ] Sample rates configurados apropiadamente

## Compliance

Si tu app maneja datos sensibles:

- [ ] Review GDPR compliance settings
- [ ] Configure data retention (Settings → Data Management)
- [ ] Enable data scrubbing for sensitive fields
- [ ] Document Sentry usage in Privacy Policy

## Emergency Procedures

### Si Sentry Causa Problemas

1. **Deshabilitar temporalmente**:
```bash
# Remover variable de entorno
unset NEXT_PUBLIC_SENTRY_DSN
# Rebuild y deploy
```

2. **Deshabilitar solo features específicas**:
```typescript
// En sentry configs
integrations: [],  // Deshabilitar todas las integraciones
tracesSampleRate: 0,  // Deshabilitar performance tracking
```

### Si Excedes Quota

1. Check dashboard para ver qué consume más
2. Reducir sample rates inmediatamente
3. Review y añadir más `ignoreErrors`
4. Considerar upgrade si es necesario

## Support Resources

- [Sentry Status](https://status.sentry.io/)
- [Sentry Discord](https://discord.gg/sentry)
- [Documentation](https://docs.sentry.io/)
- [GitHub Issues](https://github.com/getsentry/sentry-javascript/issues)

## Checklist Final

- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Auth token para source maps
- [ ] ✅ Alertas creadas
- [ ] ✅ Integraciones configuradas (Slack, GitHub)
- [ ] ✅ Dashboard personalizado
- [ ] ✅ Sample rates ajustados
- [ ] ✅ Tests de verificación pasados
- [ ] ✅ PII scrubbing verificado
- [ ] ✅ Team members invitados
- [ ] ✅ Monitoring plan definido

---

**Status**: Ready for Production
**Last Review**: 2025-10-31
