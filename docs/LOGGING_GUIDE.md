# Guía del Sistema de Logging

## Descripción General

El sistema utiliza **Pino**, un logger de alto rendimiento para Node.js, con logging estructurado en JSON para producción y pretty print para desarrollo.

## Características Principales

- **Niveles de Log**: trace, debug, info, warn, error, fatal
- **Logging Estructurado**: JSON en producción, pretty print en desarrollo
- **Redacción Automática**: Elimina datos sensibles (passwords, tokens, API keys)
- **Child Loggers**: Namespace por módulo para facilitar filtrado
- **Request Tracking**: RequestId único para seguir requests a través de toda la aplicación
- **Performance Timing**: Helpers para medir duración de operaciones

## Uso Básico

### Importar Loggers

```typescript
// Logger general de API
import { apiLogger as log } from '@/lib/logging/loggers';

// Logger específico para LLM
import { llmLogger as log } from '@/lib/logging/loggers';

// Logger para sistema emocional
import { emotionalLogger as log } from '@/lib/logging/loggers';
```

### Logging Simple

```typescript
// Info general
log.info('User logged in successfully');

// Con contexto estructurado
log.info({ userId: '123', email: 'user@example.com' }, 'User logged in');

// Warning
log.warn({ attemptedAction: 'delete', resourceId: 'abc' }, 'Unauthorized access attempt');

// Error con stack trace
log.error({ err: error, userId: '123' }, 'Failed to process request');
```

### Logging de Requests HTTP

```typescript
import { logRequest, logResponse } from '@/lib/logging';

// Al recibir request
logRequest(log, 'POST', '/api/agents', { userId: '123' });

// Al enviar response
logResponse(log, 'POST', '/api/agents', 201, 1245, { agentId: 'abc' });
```

### Medir Performance

```typescript
import { createTimer } from '@/lib/logging';

const timer = createTimer(log, 'Process message');

try {
  // Tu código aquí
  const result = await processMessage();

  timer.end({ messageId: result.id, tokensUsed: 1500 });
} catch (error) {
  timer.fail(error, { context: 'Additional info' });
}
```

### Logging de Errores

```typescript
import { logError } from '@/lib/logging';

try {
  // Código que puede fallar
} catch (error) {
  logError(log, error, {
    context: 'User registration',
    userId: '123',
    email: 'user@example.com'
  });
}
```

## Loggers Disponibles por Módulo

| Logger | Uso |
|--------|-----|
| `apiLogger` | API routes y endpoints HTTP |
| `llmLogger` | Llamadas a LLM providers (OpenRouter, Gemini, etc) |
| `dbLogger` | Operaciones de base de datos y Prisma |
| `authLogger` | Autenticación y autorización |
| `emotionalLogger` | Sistema emocional y OCC |
| `memoryLogger` | Sistema de memoria y embeddings |
| `socketLogger` | WebSockets y eventos en tiempo real |
| `voiceLogger` | Sistema de voice (TTS/STT) |
| `visualLogger` | Generación visual (imágenes, avatares) |
| `behaviorLogger` | Sistema de comportamientos |
| `notificationLogger` | Sistema de notificaciones |
| `billingLogger` | Billing y pagos (MercadoPago, Stripe) |
| `recommendationLogger` | Sistema de recomendaciones |
| `worldLogger` | Worlds/mundos |
| `middlewareLogger` | Middleware |
| `cronLogger` | Cron jobs y tareas programadas |
| `metricsLogger` | Métricas y analytics |

## Niveles de Log y Cuándo Usarlos

### TRACE
**Cuándo**: Debugging extremadamente detallado (raramente usado)
```typescript
log.trace({ variable: value }, 'Variable state at checkpoint');
```

### DEBUG
**Cuándo**: Información de debugging útil durante desarrollo
```typescript
log.debug({ params }, 'Function called with params');
log.debug({ step: 1, data }, 'Intermediate processing step');
```

### INFO
**Cuándo**: Eventos normales importantes del sistema
```typescript
log.info({ userId, agentId }, 'Message processed successfully');
log.info({ count: 5 }, 'Cache invalidated');
```

### WARN
**Cuándo**: Situaciones inesperadas que NO son errores pero requieren atención
```typescript
log.warn({ limit: 100, attempted: 150 }, 'Rate limit approached');
log.warn({ userId }, 'Deprecated API endpoint used');
```

### ERROR
**Cuándo**: Errores que afectan la operación actual
```typescript
log.error({ err: error, userId }, 'Failed to save to database');
log.error({ status: 500, url }, 'External API call failed');
```

### FATAL
**Cuándo**: Errores críticos que requieren reinicio o detienen la aplicación
```typescript
log.fatal({ err: error }, 'Database connection lost');
log.fatal('Required API key not configured');
```

## Request Context Tracking

El sistema mantiene un `requestId` único para cada request:

```typescript
import { withRequestContext, getRequestId } from '@/lib/logging/request-context';

// En API route
export async function POST(request: Request) {
  return withRequestContext(async () => {
    const requestId = getRequestId(); // Disponible automáticamente

    // Todos los logs en este contexto incluirán el requestId
    log.info('Processing request');
  });
}
```

## Datos Sensibles

El sistema redacta automáticamente:
- Passwords
- API keys
- Tokens JWT (completos)
- Session cookies
- Headers de autorización
- Secrets

```typescript
// Estos datos serán redactados automáticamente
log.info({
  password: '123456',      // → '[REDACTED]'
  apiKey: 'sk-abc123',     // → '[REDACTED]'
  token: 'eyJhbGci...'     // → '[REDACTED]'
}, 'User data');
```

### Sanitización Manual

Para datos no cubiertos por la redacción automática:

```typescript
import { sanitize } from '@/lib/logging';

const userData = {
  email: 'user@example.com',
  password: '123456',
  customSecret: 'sensitive-data'
};

log.info(sanitize(userData), 'User created');
```

## Configuración de Ambiente

### Variables de Entorno

```bash
# Nivel de log (default: 'info' en prod, 'debug' en dev)
LOG_LEVEL=debug

# Ambiente
NODE_ENV=development  # 'production' para prod, 'test' para tests
```

### Comportamiento por Ambiente

#### Development
- Pretty print con colores
- Nivel: `debug`
- Muestra timestamps en formato legible
- Stack traces completos

#### Production
- JSON estructurado
- Nivel: `info`
- Timestamps ISO 8601
- Optimizado para ingestión por herramientas (Datadog, CloudWatch, etc)

#### Test
- Nivel: `silent` (no muestra logs durante tests)

## Búsqueda y Filtrado de Logs

### En Desarrollo (pretty print)

```bash
# Ver solo logs de error
npm run dev 2>&1 | grep "ERROR"

# Ver logs de un módulo específico
npm run dev 2>&1 | grep "\"module\":\"llm\""

# Ver logs de un requestId
npm run dev 2>&1 | grep "req-abc-123"
```

### En Producción (JSON)

Con jq:
```bash
# Filtrar por nivel
cat app.log | grep "\"level\":50"  # Error

# Filtrar por módulo
cat app.log | jq 'select(.module == "llm")'

# Filtrar por requestId
cat app.log | jq 'select(.requestId == "req-abc-123")'

# Errores de un usuario específico
cat app.log | jq 'select(.level >= 50 and .userId == "123")'
```

## Integración con Herramientas Externas

### Datadog

```typescript
// Los logs JSON se envían automáticamente a Datadog
// Configurar en Datadog:
// - Filtrar por: @module:llm
// - Agrupar por: @requestId
// - Alertas en: @level:error
```

### CloudWatch

```typescript
// Los logs se estructuran para CloudWatch Insights:
// fields @timestamp, module, requestId, level, msg
// | filter level >= 50
// | stats count() by module
```

### Sentry (para errores)

```typescript
import * as Sentry from '@sentry/node';

try {
  // código
} catch (error) {
  logError(log, error, { context: 'Important operation' });

  // También enviar a Sentry para tracking
  Sentry.captureException(error, {
    tags: { module: 'api', operation: 'process-message' }
  });
}
```

## Mejores Prácticas

### ✅ Hacer

```typescript
// Usar logging estructurado
log.info({ userId, agentId, duration: 1234 }, 'Message processed');

// Incluir contexto relevante
log.error({ err: error, userId, operation: 'payment' }, 'Payment failed');

// Usar niveles apropiados
log.warn({ limit: 100, current: 95 }, 'Approaching rate limit');

// Medir performance de operaciones críticas
const timer = createTimer(log, 'Database query');
```

### ❌ Evitar

```typescript
// NO usar console.log
console.log('User logged in');  // ❌

// NO loguear strings simples sin contexto
log.info('Something happened');  // ❌

// NO loguear datos sensibles sin sanitizar
log.info({ password: user.password });  // ❌

// NO usar nivel incorrecto
log.error('User clicked button');  // ❌ Debe ser info

// NO loguear en loops sin throttling
for (const item of items) {
  log.info({ item }, 'Processing');  // ❌ Flood de logs
}
```

## Ejemplos Completos

### API Route

```typescript
import { apiLogger as log, createTimer } from '@/lib/logging';

export async function POST(req: Request) {
  const timer = createTimer(log, 'Create agent');

  try {
    const body = await req.json();

    log.info({ agentName: body.name }, 'Creating new agent');

    const agent = await prisma.agent.create({ data: body });

    timer.end({ agentId: agent.id });

    return Response.json(agent);
  } catch (error) {
    timer.fail(error);
    logError(log, error, { operation: 'create-agent', body });

    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### Service Layer

```typescript
import { dbLogger as log } from '@/lib/logging/loggers';

export class UserService {
  async createUser(data: CreateUserInput) {
    log.debug({ email: data.email }, 'Creating user');

    try {
      const user = await prisma.user.create({ data });

      log.info({ userId: user.id, email: user.email }, 'User created successfully');

      return user;
    } catch (error) {
      log.error({ err: error, email: data.email }, 'Failed to create user');
      throw error;
    }
  }
}
```

### LLM Call

```typescript
import { llmLogger as log, createTimer } from '@/lib/logging';

async function generateResponse(prompt: string) {
  const timer = createTimer(log, 'LLM generation');

  try {
    log.debug({ promptLength: prompt.length }, 'Calling LLM');

    const response = await llm.generate({ prompt });

    timer.end({
      responseLength: response.length,
      model: 'gemini-2.5-flash'
    });

    return response;
  } catch (error) {
    log.error({ err: error, model: 'gemini-2.5-flash' }, 'LLM call failed');
    timer.fail(error);
    throw error;
  }
}
```

## Troubleshooting

### Logs no aparecen

1. Verificar `NODE_ENV` y `LOG_LEVEL`
2. En tests, logs están en modo `silent` por defecto
3. Verificar que estás usando el logger correcto (no `console.log`)

### Demasiados logs

1. Subir `LOG_LEVEL` a `info` o `warn`
2. Usar `log.debug()` para logs de desarrollo
3. Throttle logs en loops

### Datos sensibles en logs

1. Verificar la lista de `redactPaths` en `logger.ts`
2. Usar `sanitize()` para datos custom
3. Nunca loguear passwords, tokens completos, o API keys

## Referencias

- [Documentación Pino](https://getpino.io/)
- [Best Practices for Logging](https://github.com/pinojs/pino/blob/master/docs/best-practices.md)
- [Structured Logging](https://www.honeycomb.io/blog/structured-logging-and-your-team)
