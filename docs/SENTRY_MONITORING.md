# Sentry Error Tracking & Performance Monitoring

Sistema completo de monitoreo de errores, performance tracking y user feedback usando Sentry.

## Índice

- [Configuración Inicial](#configuración-inicial)
- [Features Implementadas](#features-implementadas)
- [Uso Básico](#uso-básico)
- [Uso Avanzado](#uso-avanzado)
- [Performance Monitoring](#performance-monitoring)
- [User Feedback](#user-feedback)
- [Best Practices](#best-practices)
- [Alertas y Notificaciones](#alertas-y-notificaciones)
- [Troubleshooting](#troubleshooting)

## Configuración Inicial

### 1. Crear cuenta en Sentry

1. Ve a [sentry.io](https://sentry.io) y crea una cuenta (free tier)
2. Crea un nuevo proyecto de tipo "Next.js"
3. Copia tu DSN (Data Source Name)

### 2. Configurar variables de entorno

Copia las variables de `.env.example` a tu `.env.local`:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN="https://your_key@o123456.ingest.sentry.io/7654321"
SENTRY_ORG="tu-organizacion"
SENTRY_PROJECT="blaniel"
SENTRY_AUTH_TOKEN="your_sentry_auth_token_here"  # Solo para build/CI
NEXT_PUBLIC_SENTRY_RELEASE="${VERCEL_GIT_COMMIT_SHA}"  # Automático en Vercel
```

### 3. Configurar Source Maps Upload

Para el deploy en Vercel, añade las variables de entorno en el dashboard:

- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_AUTH_TOKEN`

El upload de source maps se hará automáticamente en cada build.

## Features Implementadas

### ✅ Error Tracking
- Captura automática de excepciones no manejadas (client + server)
- Source maps para stack traces legibles
- Context enrichment (user, tags, metadata)
- PII scrubbing automático
- Diferentes niveles de severidad

### ✅ Performance Monitoring
- Tracing de requests API
- Database queries monitoring
- Component render times
- Custom transactions
- AI/LLM operations tracking

### ✅ Session Replay
- Reproducción visual de sesiones de usuario
- Captura de interacciones que llevan a errores
- Privacy masking automático

### ✅ User Feedback
- Dialog de reporte de bugs integrado
- Botón flotante para reportar problemas
- Asociación automática con errores

### ✅ Breadcrumbs
- Tracking automático de navegación
- Clicks y interacciones de usuario
- API calls
- Database operations
- AI/LLM operations

### ✅ Release Tracking
- Tracking de releases con Git SHA
- Deploy notifications
- Source maps upload automático

## Uso Básico

### En API Routes (App Router)

```typescript
import { withSentryMonitoring } from "@/lib/sentry/api-middleware";

export const GET = withSentryMonitoring(
  async (request: NextRequest) => {
    // Tu lógica aquí
    const worlds = await prisma.world.findMany();
    return NextResponse.json({ worlds });
  },
  {
    operationName: "GET /api/worlds",
    trackPerformance: true,
    trackErrors: true,
  }
);
```

### En Componentes React

```typescript
"use client";

import { useSentry } from "@/hooks/useSentry";

export function MyComponent() {
  const { captureError, trackClick } = useSentry();

  const handleAction = async () => {
    try {
      trackClick("submit-button", { form: "world-creation" });
      await createWorld();
    } catch (error) {
      if (error instanceof Error) {
        captureError(error, {
          operation: "createWorld",
          feature: "worlds",
          metadata: { formData: "..." },
        });
      }
    }
  };

  return <button onClick={handleAction}>Create World</button>;
}
```

### Captura Manual de Errores

```typescript
import { captureCustomError } from "@/lib/sentry/custom-error";

try {
  await riskyOperation();
} catch (error) {
  if (error instanceof Error) {
    captureCustomError(error, {
      operation: "riskyOperation",
      feature: "worlds",
      module: "simulation",
      userId: session.user.id,
      metadata: {
        worldId: "123",
        attempt: 3,
      },
      tags: {
        critical: "true",
      },
    });
  }
}
```

## Uso Avanzado

### Database Operations

```typescript
import { captureDatabaseError } from "@/lib/sentry/custom-error";
import { trackDatabaseOperation } from "@/lib/sentry/breadcrumbs";

async function findUser(userId: string) {
  try {
    trackDatabaseOperation("findUnique", "User");
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return user;
  } catch (error) {
    if (error instanceof Error) {
      captureDatabaseError(error, {
        operation: "findUnique",
        model: "User",
        userId,
      });
    }
    throw error;
  }
}
```

### AI/LLM Operations

```typescript
import { captureAIError } from "@/lib/sentry/custom-error";
import { trackAIOperation } from "@/lib/sentry/breadcrumbs";

async function generateResponse(prompt: string) {
  const startTime = Date.now();

  try {
    trackAIOperation("openrouter", "meta-llama/llama-3.2-11b-vision", "chat");

    const response = await llmProvider.chat(prompt);

    const duration = Date.now() - startTime;
    trackAIOperation("openrouter", "meta-llama/llama-3.2-11b-vision", "chat", duration);

    return response;
  } catch (error) {
    if (error instanceof Error) {
      captureAIError(error, {
        provider: "openrouter",
        model: "meta-llama/llama-3.2-11b-vision",
        operation: "chat",
        promptLength: prompt.length,
        userId: session.user.id,
      });
    }
    throw error;
  }
}
```

### API Calls

```typescript
import { captureAPIError } from "@/lib/sentry/custom-error";
import { trackAPICall } from "@/lib/sentry/breadcrumbs";

async function callExternalAPI(endpoint: string) {
  const startTime = Date.now();

  try {
    const response = await fetch(endpoint);
    const duration = Date.now() - startTime;

    trackAPICall("GET", endpoint, response.status, duration);

    if (!response.ok) {
      throw new Error(`API failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof Error) {
      captureAPIError(error, {
        endpoint,
        method: "GET",
        statusCode: 500,
      });
    }

    throw error;
  }
}
```

## Performance Monitoring

### Medir Performance de Operaciones

```typescript
import { measurePerformance } from "@/lib/sentry/custom-error";

const result = await measurePerformance(
  "World Simulation",
  "world.simulate",
  async () => {
    // Tu operación costosa aquí
    return await simulateWorld(worldId);
  },
  {
    tags: { worldId },
    metadata: { complexity: "high" },
  }
);
```

### Transacciones Manuales

```typescript
import { startPerformanceTransaction } from "@/lib/sentry/custom-error";

const transaction = startPerformanceTransaction(
  "Complex Operation",
  "custom.operation",
  {
    tags: { module: "worlds" },
    metadata: { userId: "123" },
  }
);

try {
  // Operación 1
  const span1 = transaction.startChild({
    op: "db.query",
    description: "Fetch world data",
  });
  await fetchWorldData();
  span1.finish();

  // Operación 2
  const span2 = transaction.startChild({
    op: "ai.inference",
    description: "Generate world state",
  });
  await generateWorldState();
  span2.finish();

  transaction.setStatus("ok");
} catch (error) {
  transaction.setStatus("internal_error");
  throw error;
} finally {
  transaction.finish();
}
```

## User Feedback

### Botón Flotante (Recomendado)

Añade el botón flotante en tu layout principal:

```typescript
// app/layout.tsx
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

### Dialog Manual

```typescript
import { FeedbackDialog } from "@/components/sentry/FeedbackDialog";
import { useState } from "react";

export function MyComponent() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <>
      <button onClick={() => setFeedbackOpen(true)}>
        Report Issue
      </button>
      <FeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
      />
    </>
  );
}
```

## Best Practices

### 1. Error Categorization

Usa tags para categorizar errores:

```typescript
captureCustomError(error, {
  tags: {
    feature: "chat",
    severity: "high",
    user_tier: "premium",
    error_type: "rate_limit",
  },
});
```

### 2. Context Enrichment

Añade contexto relevante:

```typescript
captureCustomError(error, {
  metadata: {
    worldId: "123",
    agentCount: 5,
    complexity: "high",
    userAction: "simulate",
  },
});
```

### 3. Breadcrumbs para Debugging

Añade breadcrumbs antes de operaciones críticas:

```typescript
import { addBreadcrumb } from "@/lib/sentry/custom-error";

addBreadcrumb("Starting world simulation", "process", {
  worldId,
  agentCount,
});

await simulateWorld(worldId);
```

### 4. Performance Thresholds

Alerta cuando las operaciones son muy lentas:

```typescript
const startTime = Date.now();
const result = await operation();
const duration = Date.now() - startTime;

if (duration > 5000) {
  captureCustomError(
    new Error("Performance degradation"),
    {
      operation: "worldSimulation",
      metadata: { duration, threshold: 5000 },
      tags: { performance: "slow" },
    },
    "warning"
  );
}
```

### 5. User Context

Establece el contexto del usuario en login:

```typescript
import { setUserContext, clearUserContext } from "@/lib/sentry/custom-error";

// En login
setUserContext({
  id: user.id,
  email: user.email,
  username: user.name,
});

// En logout
clearUserContext();
```

## Alertas y Notificaciones

### Configurar Alertas en Sentry Dashboard

1. Ve a **Alerts** en tu proyecto Sentry
2. Crea nuevas alertas:

#### Alert de Error Rate
- **Condición**: Error rate > 10 errors/min
- **Acción**: Email + Slack notification
- **Frecuencia**: Máximo 1 vez cada 30 minutos

#### Alert de Nuevos Errores
- **Condición**: First seen error
- **Acción**: Email inmediato
- **Prioridad**: High

#### Alert de Performance
- **Condición**: p95 response time > 2s
- **Acción**: Slack notification
- **Frecuencia**: Cada hora

### Integración con Slack

1. En Sentry: Settings → Integrations → Slack
2. Conecta tu workspace
3. Configura el canal para notificaciones
4. Asigna alertas al canal

## Sample Rates

Los sample rates están configurados en los archivos `sentry.*.config.ts`:

### Development
```typescript
tracesSampleRate: 1.0,  // 100% de transacciones
replaysSessionSampleRate: 1.0,  // 100% de sesiones
```

### Production
```typescript
tracesSampleRate: 0.1,  // 10% de transacciones
replaysSessionSampleRate: 0.1,  // 10% de sesiones
replaysOnErrorSampleRate: 1.0,  // 100% cuando hay error
```

### Ajustar para tu Caso

Si excedes el free tier (5K errors/mes, 10K transactions/mes):

```typescript
// Reducir aún más el sampling
tracesSampleRate: 0.05,  // 5%
replaysSessionSampleRate: 0.05,  // 5%
```

O usar `tracesSampler` para control granular:

```typescript
tracesSampler(samplingContext) {
  // No trace health checks
  if (samplingContext.request?.url?.includes("/api/health")) {
    return 0;
  }

  // Always trace errors
  if (samplingContext.transactionContext.op === "http.server") {
    return 1.0;
  }

  // Default
  return 0.1;
}
```

## Troubleshooting

### Source Maps no se ven

1. Verifica que `SENTRY_AUTH_TOKEN` esté configurado
2. Chequea los logs del build para ver si se subieron
3. Verifica que el release name sea correcto

### Errores no se capturan

1. Verifica que `NEXT_PUBLIC_SENTRY_DSN` esté configurado
2. Chequea la consola del browser por errores de Sentry
3. Revisa los filtros en `beforeSend` y `ignoreErrors`

### Performance overhead

1. Reduce `tracesSampleRate` en producción
2. Desactiva Session Replay si no lo necesitas
3. Usa `tracesSampler` para excluir rutas específicas

### PII en errores

1. Revisa la función `beforeSend` en los configs
2. Añade más campos a la lista de scrubbing
3. Usa `beforeBreadcrumb` para filtrar breadcrumbs sensibles

## Recursos Adicionales

- [Documentación oficial de Sentry](https://docs.sentry.io/)
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)
- [User Feedback](https://docs.sentry.io/product/user-feedback/)

## Costos y Free Tier

### Free Tier Incluye:
- 5,000 errors/mes
- 10,000 performance transactions/mes
- 50 Session Replays/mes
- 1 miembro del equipo
- 30 días de retención

### Para escalar:
- Team plan: $26/mes (50K errors, 100K transactions)
- Business plan: $80/mes (100K errors, 500K transactions)

### Optimizar costos:
1. Usa sample rates bajos en producción (10%)
2. Filtra rutas de health check
3. Usa `ignoreErrors` para errores conocidos
4. Considera múltiples proyectos Sentry para separar dev/prod
