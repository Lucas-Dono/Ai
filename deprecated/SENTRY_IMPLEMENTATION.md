# Sentry Implementation Summary

## ¿Qué es Sentry?

Sentry es una plataforma de error tracking y performance monitoring que te permite:
- Detectar y diagnosticar errores en producción
- Monitorear el performance de tu aplicación
- Obtener feedback directo de usuarios
- Ver reproducciones de sesiones con errores

## Estado de Implementación: ✅ COMPLETO

Se ha implementado un sistema completo de monitoreo con Sentry que incluye:

### 1. Configuración Core
- ✅ Sentry client config (browser)
- ✅ Sentry server config (Node.js)
- ✅ Sentry edge config (middleware)
- ✅ Next.js config con Sentry wrapper
- ✅ Instrumentation para Next.js 15

### 2. Error Tracking
- ✅ Captura automática de excepciones
- ✅ Custom error utilities
- ✅ Error categorization (API, Database, AI)
- ✅ PII scrubbing automático
- ✅ Context enrichment

### 3. Performance Monitoring
- ✅ API routes tracking
- ✅ Database queries monitoring
- ✅ AI/LLM operations tracking
- ✅ Custom transactions
- ✅ Performance thresholds

### 4. Breadcrumbs
- ✅ Navigation tracking
- ✅ User interactions
- ✅ API calls
- ✅ Database operations
- ✅ AI operations
- ✅ Chat messages
- ✅ Auth events

### 5. User Feedback
- ✅ Feedback dialog component
- ✅ Floating feedback button
- ✅ Integración con errores
- ✅ UI en español

### 6. Developer Experience
- ✅ React hook (useSentry)
- ✅ API middleware
- ✅ TypeScript types
- ✅ Comprehensive examples
- ✅ Full documentation

## Archivos Creados

### Configuración
```
/sentry.client.config.ts       # Config para browser
/sentry.server.config.ts       # Config para server
/sentry.edge.config.ts         # Config para edge
/instrumentation.ts            # Next.js instrumentation
/next.config.ts                # Modificado con Sentry wrapper
```

### Utilities
```
/lib/sentry/
  ├── index.ts                 # Main exports
  ├── custom-error.ts          # Error tracking utilities
  ├── breadcrumbs.ts           # Breadcrumb tracking
  ├── api-middleware.ts        # API monitoring middleware
  └── examples.ts              # Usage examples
```

### Components
```
/components/sentry/
  ├── FeedbackDialog.tsx       # User feedback dialog
  └── FeedbackButton.tsx       # Floating feedback button
```

### Hooks
```
/hooks/
  └── useSentry.ts             # React hook for Sentry
```

### Documentation
```
/docs/
  ├── SENTRY_MONITORING.md     # Comprehensive guide
  └── SENTRY_QUICK_START.md    # Quick start guide
```

## Quick Start

### 1. Configurar Sentry (2 minutos)

```bash
# Crear cuenta en https://sentry.io
# Crear proyecto Next.js
# Copiar DSN y añadir a .env.local:

NEXT_PUBLIC_SENTRY_DSN="https://your_key@o123456.ingest.sentry.io/7654321"
SENTRY_ORG="tu-organizacion"
SENTRY_PROJECT="creador-inteligencias"
```

### 2. Usar en API Routes

```typescript
import { withSentryMonitoring } from "@/lib/sentry";

export const GET = withSentryMonitoring(async (request) => {
  // Tu código aquí
  return NextResponse.json({ ok: true });
});
```

### 3. Usar en Components

```typescript
import { useSentry } from "@/hooks/useSentry";

export function MyComponent() {
  const { captureError } = useSentry();

  try {
    await riskyOperation();
  } catch (error) {
    if (error instanceof Error) {
      captureError(error, { operation: "riskyOperation" });
    }
  }
}
```

### 4. User Feedback

```typescript
// En app/layout.tsx
import { FeedbackButton } from "@/components/sentry/FeedbackButton";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <FeedbackButton />
      </body>
    </html>
  );
}
```

## Features Destacadas

### 🎯 Error Tracking Inteligente

```typescript
// Captura de errores con contexto rico
captureCustomError(error, {
  operation: "worldSimulation",
  feature: "worlds",
  module: "simulation",
  userId: user.id,
  metadata: {
    worldId: "123",
    complexity: "high",
  },
  tags: {
    critical: "true",
  },
});
```

### 📊 Performance Monitoring

```typescript
// Mide automáticamente el performance
const result = await measurePerformance(
  "World Simulation",
  "world.simulate",
  async () => simulateWorld(worldId)
);
```

### 🔍 Breadcrumbs Automáticos

```typescript
// Tracking automático de operaciones
trackDatabaseOperation("findUnique", "User");
trackAIOperation("openrouter", "llama-3.2", "chat");
trackChatMessage(agentId, "sent", messageLength);
```

### 🎨 User Feedback Integrado

Los usuarios pueden reportar bugs directamente desde la UI con:
- Descripción del problema
- Captura de pantalla automática
- Asociación con errores de Sentry
- UI completamente en español

### 🔒 Privacy & Security

- PII scrubbing automático
- Filtrado de headers sensibles
- Sanitización de query params
- Masking en Session Replay

## Configuración de Sample Rates

Para optimizar costos y cumplir con el free tier:

### Development (100%)
```typescript
tracesSampleRate: 1.0
replaysSessionSampleRate: 1.0
```

### Production (10%)
```typescript
tracesSampleRate: 0.1
replaysSessionSampleRate: 0.1
replaysOnErrorSampleRate: 1.0  // Siempre cuando hay error
```

Esto te permite mantener:
- 5,000 errors/mes (Free tier)
- 10,000 transactions/mes (Free tier)
- Session Replay solo en errores

## Alertas Recomendadas

### 1. Error Rate Alert
- **Condición**: Error rate > 10/min
- **Acción**: Email + Slack
- **Frecuencia**: Max 1 vez/30min

### 2. New Error Alert
- **Condición**: First seen error
- **Acción**: Email inmediato
- **Prioridad**: High

### 3. Performance Alert
- **Condición**: p95 > 2s
- **Acción**: Slack notification
- **Frecuencia**: Cada hora

## Integración con Features Existentes

### Worlds System
```typescript
import { captureCustomError, trackWorldEvent } from "@/lib/sentry";

async function simulateWorld(worldId: string) {
  trackWorldEvent(worldId, "simulation_start");

  try {
    const result = await simulate();
    trackWorldEvent(worldId, "simulation_complete");
    return result;
  } catch (error) {
    captureCustomError(error, {
      feature: "worlds",
      metadata: { worldId },
    });
  }
}
```

### Chat System
```typescript
import { trackChatMessage, captureCustomError } from "@/lib/sentry";

async function sendMessage(agentId: string, message: string) {
  trackChatMessage(agentId, "sent", message.length);

  try {
    const response = await chat(message);
    trackChatMessage(agentId, "received", response.length);
    return response;
  } catch (error) {
    captureCustomError(error, {
      feature: "chat",
      metadata: { agentId },
    });
  }
}
```

### Emotional System
```typescript
import { captureAIError, trackAIOperation } from "@/lib/sentry";

async function processEmotion(input: string) {
  trackAIOperation("openrouter", "llama-3.2", "emotion");

  try {
    const emotion = await detectEmotion(input);
    return emotion;
  } catch (error) {
    captureAIError(error, {
      provider: "openrouter",
      model: "llama-3.2",
      operation: "emotion",
    });
  }
}
```

## Dashboard Setup

### Crear Dashboard Personalizado

1. Ve a Dashboards → Create Dashboard
2. Añade widgets:
   - Error Rate (últimas 24h)
   - Top 10 errores
   - API Performance (p95)
   - Database Query Time
   - AI Operations Latency
   - User Feedback

### Métricas Clave

- **Error Rate**: Errores/minuto
- **Apdex Score**: User satisfaction
- **Throughput**: Requests/segundo
- **p95 Latency**: 95th percentile response time
- **Session Duration**: Tiempo promedio de sesión

## Cost Management

### Free Tier (Actual)
- 5K errors/mes
- 10K transactions/mes
- 50 Session Replays/mes

### Optimización
```typescript
// En sentry.server.config.ts
tracesSampler(samplingContext) {
  // No trace health checks
  if (samplingContext.request?.url?.includes("/api/health")) {
    return 0;
  }

  // Default
  return 0.1;  // 10%
}
```

### Filtrar Errores Conocidos
```typescript
ignoreErrors: [
  "NetworkError",
  "Failed to fetch",
  "AbortError",
  // ... más errores ignorados
]
```

## Next Steps

### Para Producción
1. ✅ Configurar `SENTRY_AUTH_TOKEN` para source maps
2. ✅ Crear alertas en Sentry dashboard
3. ✅ Integrar con Slack para notificaciones
4. ✅ Ajustar sample rates según tráfico
5. ✅ Configurar releases tracking

### Para Mejorar
1. Añadir más breadcrumbs en flujos críticos
2. Crear dashboards personalizados
3. Configurar alertas específicas por feature
4. Integrar con Jira para issues tracking

## Documentation

- [Quick Start Guide](./docs/SENTRY_QUICK_START.md)
- [Complete Documentation](./docs/SENTRY_MONITORING.md)
- [Code Examples](./lib/sentry/examples.ts)
- [Sentry Official Docs](https://docs.sentry.io/)

## Support

Para preguntas sobre Sentry:
- [Sentry Discord](https://discord.gg/sentry)
- [Sentry Docs](https://docs.sentry.io/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/sentry)

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2025-10-31
