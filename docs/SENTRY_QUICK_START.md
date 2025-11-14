# Sentry - Quick Start Guide

Guía rápida para empezar a usar Sentry en 5 minutos.

## 1. Configuración Inicial (2 minutos)

### Crear cuenta y proyecto

1. Ve a [sentry.io/signup](https://sentry.io/signup)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto → Selecciona "Next.js"
4. Copia el DSN que te dan

### Configurar variables de entorno

Crea un archivo `.env.local` con:

```bash
NEXT_PUBLIC_SENTRY_DSN="https://tu_key@o123456.ingest.sentry.io/7654321"
SENTRY_ORG="tu-organizacion"
SENTRY_PROJECT="circuit-prompt-ai"
```

¡Listo! Sentry ya está funcionando automáticamente.

## 2. Primer Test (1 minuto)

Crea un error de prueba:

```typescript
// En cualquier componente o API route
import * as Sentry from "@sentry/nextjs";

// Captura un error de prueba
Sentry.captureException(new Error("Mi primer error en Sentry!"));
```

Ve al dashboard de Sentry y deberías ver el error aparecer.

## 3. Uso Común (2 minutos)

### En API Routes

```typescript
import { withSentryMonitoring } from "@/lib/sentry";

export const GET = withSentryMonitoring(
  async (request) => {
    // Tu código aquí
    return NextResponse.json({ ok: true });
  }
);
```

### En Componentes React

```typescript
import { useSentry } from "@/hooks/useSentry";

export function MyComponent() {
  const { captureError } = useSentry();

  const handleClick = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      if (error instanceof Error) {
        captureError(error, { operation: "riskyOperation" });
      }
    }
  };
}
```

### User Feedback

Añade el botón de feedback en tu layout:

```typescript
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

## 4. Ejemplos por Feature

### Database Error

```typescript
import { captureDatabaseError } from "@/lib/sentry";

try {
  await prisma.user.create({ data: {...} });
} catch (error) {
  if (error instanceof Error) {
    captureDatabaseError(error, {
      operation: "create",
      model: "User",
    });
  }
}
```

### AI/LLM Error

```typescript
import { captureAIError } from "@/lib/sentry";

try {
  const response = await llm.chat(prompt);
} catch (error) {
  if (error instanceof Error) {
    captureAIError(error, {
      provider: "openrouter",
      model: "llama-3.2",
      operation: "chat",
    });
  }
}
```

### Performance Monitoring

```typescript
import { measurePerformance } from "@/lib/sentry";

const result = await measurePerformance(
  "World Simulation",
  "world.simulate",
  async () => {
    return await simulateWorld(worldId);
  }
);
```

## 5. Configuración Avanzada (Opcional)

### Source Maps (para builds de producción)

1. Ve a Sentry → Settings → Account → API → Auth Tokens
2. Crea un nuevo token con scope: `project:releases, project:write`
3. Añade a `.env.local`:

```bash
SENTRY_AUTH_TOKEN="tu_auth_token_aqui"
```

### Alertas

1. En Sentry dashboard → Alerts
2. Create Alert → "Issues"
3. Configura:
   - When: New issue is first seen
   - Then: Send notification to email/Slack

### Sample Rates

Para controlar costos en producción, edita `sentry.client.config.ts`:

```typescript
tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
// 10% en producción, 100% en desarrollo
```

## Cheatsheet de Imports

```typescript
// Todo en uno
import {
  captureCustomError,
  captureAPIError,
  captureDatabaseError,
  captureAIError,
  measurePerformance,
  trackNavigation,
  trackInteraction,
  withSentryMonitoring,
} from "@/lib/sentry";

// Hook de React
import { useSentry } from "@/hooks/useSentry";

// Componentes
import { FeedbackButton } from "@/components/sentry/FeedbackButton";
import { FeedbackDialog } from "@/components/sentry/FeedbackDialog";
```

## Recursos

- [Documentación completa](./SENTRY_MONITORING.md)
- [Sentry Dashboard](https://sentry.io/)
- [Ejemplos de código](../lib/sentry/examples.ts)

## Free Tier Límites

- 5,000 errors/mes
- 10,000 transactions/mes
- 50 Session Replays/mes

Con los sample rates por defecto (10% en prod), deberías estar bien dentro del free tier.

## Troubleshooting Rápido

**No veo errores en Sentry:**
- Verifica que `NEXT_PUBLIC_SENTRY_DSN` esté en `.env.local`
- Recarga la aplicación
- Abre la consola del browser, busca errores de Sentry

**Source maps no funcionan:**
- Añade `SENTRY_AUTH_TOKEN`
- Rebuild la aplicación

**Muchos errores/transacciones:**
- Reduce `tracesSampleRate` en configs
- Usa `ignoreErrors` para filtrar errores conocidos

---

¡Listo! Ya tienes Sentry funcionando. Para más detalles, consulta la [documentación completa](./SENTRY_MONITORING.md).
