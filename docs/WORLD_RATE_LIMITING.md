# World Rate Limiting Implementation

## Resumen

Sistema completo de rate limiting específico para mundos virtuales implementado para controlar costos y prevenir abuso. Incluye límites por tier, cooldowns, protección anti-spam y anti-flooding.

## Archivos Modificados

1. **lib/redis/ratelimit.ts** - Sistema extendido con funciones específicas para mundos
2. **app/api/worlds/[id]/message/route.ts** - Integración completa de rate limiting
3. **lib/usage/daily-limits.ts** - Tracking de mensajes en mundos

## Límites Implementados por Tier

### Tabla de Límites

| Feature | Free | Plus | Ultra |
|---------|------|------|-------|
| **Mensajes/día en mundos** | 50 | 500 | Ilimitado |
| **Agentes por mundo** | 3 | 10 | 50 |
| **Cooldown entre mensajes** | 5 segundos | 2 segundos | Sin cooldown |
| **Mensajes idénticos (1 hora)** | 10 | 10 | 10 |
| **Flooding threshold (1 min)** | 20 | 20 | 20 |

### Límites Free
```typescript
{
  messagesPerDay: 50,
  maxAgents: 3,
  cooldownMs: 5000,        // 5 segundos
  maxIdenticalMessages: 10,
  floodThreshold: 20
}
```

### Límites Plus
```typescript
{
  messagesPerDay: 500,
  maxAgents: 10,
  cooldownMs: 2000,        // 2 segundos
  maxIdenticalMessages: 10,
  floodThreshold: 20
}
```

### Límites Ultra
```typescript
{
  messagesPerDay: -1,      // Ilimitado
  maxAgents: 50,
  cooldownMs: 0,           // Sin cooldown
  maxIdenticalMessages: 10,
  floodThreshold: 20
}
```

## Funciones Implementadas

### 1. checkWorldMessageLimit(userId, plan)
Verifica el límite diario de mensajes en mundos.
- **Free**: 50 mensajes/día
- **Plus**: 500 mensajes/día
- **Ultra**: Ilimitado

```typescript
const result = await checkWorldMessageLimit(userId, userPlan);
if (!result.allowed) {
  // Límite excedido
  return 429 with result.reason
}
```

### 2. checkWorldCooldown(worldId, userId, plan)
Verifica cooldown entre mensajes en el mismo mundo.
- **Free**: 5 segundos
- **Plus**: 2 segundos
- **Ultra**: Sin cooldown

```typescript
const result = await checkWorldCooldown(worldId, userId, userPlan);
if (!result.allowed) {
  // Esperar result.retryAfter segundos
  return 429 with Retry-After header
}
```

### 3. checkSpamProtection(worldId, userId, messageContent)
Previene envío repetido del mismo mensaje.
- **Máximo**: 10 mensajes idénticos en 1 hora
- **Aplica a todos los tiers**

```typescript
const result = await checkSpamProtection(worldId, userId, content);
if (!result.allowed) {
  // Detectado spam
  return 429 with "Has enviado este mensaje demasiadas veces"
}
```

### 4. checkFloodProtection(worldId, userId, plan)
Previene flooding (demasiados mensajes en poco tiempo).
- **Máximo**: 20 mensajes en 1 minuto
- **Aplica a todos los tiers**

```typescript
const result = await checkFloodProtection(worldId, userId, userPlan);
if (!result.allowed) {
  // Detectado flooding
  return 429 with "Estás enviando mensajes demasiado rápido"
}
```

### 5. checkWorldAgentLimit(currentAgentCount, plan)
Verifica límite de agentes por mundo (no async).
- **Free**: 3 agentes
- **Plus**: 10 agentes
- **Ultra**: 50 agentes

```typescript
const result = checkWorldAgentLimit(world.worldAgents.length, userPlan);
if (!result.allowed) {
  return 429 with result.reason
}
```

### 6. checkAllWorldLimits() [Opcional]
Verifica todos los límites en una sola llamada.

```typescript
const result = await checkAllWorldLimits(
  worldId,
  userId,
  messageContent,
  currentAgentCount,
  userPlan
);

if (!result.allowed) {
  // result.violations contiene array de errores
  return 429 with violations
}
```

## Mensajes de Error por Tier

### Free Tier - Límite Diario
```
"Límite diario de mensajes en mundos alcanzado (50/día).
Actualiza a Plus para 500 mensajes/día o Ultra para mensajes ilimitados."
```

### Plus Tier - Límite Diario
```
"Límite diario de mensajes en mundos alcanzado (500/día).
Vuelve mañana o actualiza tu plan."
```

### Free Tier - Cooldown
```
"Por favor espera 5 segundos antes de enviar otro mensaje.
Usuarios Plus esperan 2 segundos, Ultra sin cooldown."
```

### Plus Tier - Cooldown
```
"Por favor espera 2 segundos antes de enviar otro mensaje."
```

### Spam Protection (Todos los tiers)
```
"Has enviado este mensaje demasiadas veces. Por favor envía algo diferente."
```

### Flood Protection (Todos los tiers)
```
"Estás enviando mensajes demasiado rápido. Por favor espera un momento."
```

### Free Tier - Agentes
```
"Has alcanzado el límite de 3 agentes por mundo.
Actualiza a Plus para 10 agentes o Ultra para 50 agentes."
```

### Plus Tier - Agentes
```
"Has alcanzado el límite de 10 agentes por mundo.
Actualiza a Ultra para 50 agentes por mundo."
```

## HTTP Headers de Rate Limit

### Respuestas Exitosas (200 OK)
```http
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1704067200000
```

### Límite Diario Excedido (429 Too Many Requests)
```http
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704067200000
Retry-After: 86400
```

### Cooldown Activo (429 Too Many Requests)
```http
Retry-After: 5
```

## Integración en Endpoint

```typescript
// En app/api/worlds/[id]/message/route.ts

export async function POST(req, { params }) {
  const session = await auth();
  const userId = session.user.id;
  const userPlan = session.user.plan || 'free';
  const { content } = await req.json();

  // 1. Verificar límite diario
  const messageLimitCheck = await checkWorldMessageLimit(userId, userPlan);
  if (!messageLimitCheck.allowed) {
    return NextResponse.json(
      { error: messageLimitCheck.reason, ... },
      { status: 429, headers: { 'X-RateLimit-Limit': '...', ... } }
    );
  }

  // 2. Verificar cooldown
  const cooldownCheck = await checkWorldCooldown(worldId, userId, userPlan);
  if (!cooldownCheck.allowed) {
    return NextResponse.json(
      { error: cooldownCheck.reason, ... },
      { status: 429, headers: { 'Retry-After': '...' } }
    );
  }

  // 3. Verificar spam
  const spamCheck = await checkSpamProtection(worldId, userId, content);
  if (!spamCheck.allowed) {
    return NextResponse.json({ error: spamCheck.reason }, { status: 429 });
  }

  // 4. Verificar flooding
  const floodCheck = await checkFloodProtection(worldId, userId, userPlan);
  if (!floodCheck.allowed) {
    return NextResponse.json({ error: floodCheck.reason }, { status: 429 });
  }

  // ... procesar mensaje ...

  // Registrar uso
  await trackWorldMessageUsage(userId);

  // Retornar con headers
  return NextResponse.json({ success: true, ... }, {
    headers: {
      'X-RateLimit-Limit': messageLimitCheck.limit.toString(),
      'X-RateLimit-Remaining': messageLimitCheck.remaining.toString(),
      'X-RateLimit-Reset': messageLimitCheck.resetAt.toString()
    }
  });
}
```

## Tracking de Uso

### Tabla Usage en Prisma
```typescript
{
  resourceType: "world_message",
  quantity: 1,
  metadata: { timestamp: "2025-10-31T..." }
}
```

### Función trackWorldMessageUsage()
```typescript
await trackWorldMessageUsage(userId);
// Registra 1 mensaje de mundo en la tabla Usage
// Invalida cache de uso diario
```

### Estadísticas de Usuario
```typescript
const stats = await getUserUsageStats(userId, userPlan);
// {
//   today: {
//     messages: { used: 15, limit: 20, rewarded: 0 },
//     worldMessages: { used: 8, limit: 50 }
//   },
//   thisMonth: { ... }
// }
```

## Performance

- **Overhead estimado**: < 5ms por request
- **Redis**: Usado cuando está configurado
- **Fallback**: In-memory cuando Redis no disponible
- **Cache**: 5 minutos para estadísticas de uso
- **Limpieza**: Cache in-memory limpiado cada 60 segundos

## Logging

Todos los límites violados son registrados en console:

```typescript
console.log(`[World Message] Límite diario excedido para usuario ${userId}`);
console.log(`[World Message] Cooldown activo para usuario ${userId} en mundo ${worldId}`);
console.log(`[World Message] Spam detectado para usuario ${userId} en mundo ${worldId}`);
console.log(`[World Message] Flooding detectado para usuario ${userId} en mundo ${worldId}`);
```

## Testing

### Test Manual - Límite Diario (Free)
```bash
# Enviar 51 mensajes en un día
for i in {1..51}; do
  curl -X POST /api/worlds/{id}/message \
    -H "Cookie: ..." \
    -d '{"content": "Test message '$i'"}'
done
# Mensaje 51 debe retornar 429
```

### Test Manual - Cooldown (Free)
```bash
# Enviar 2 mensajes rápidamente
curl -X POST /api/worlds/{id}/message -d '{"content": "Message 1"}'
curl -X POST /api/worlds/{id}/message -d '{"content": "Message 2"}'
# Segundo mensaje debe retornar 429 con Retry-After: 5
```

### Test Manual - Spam
```bash
# Enviar el mismo mensaje 11 veces
for i in {1..11}; do
  curl -X POST /api/worlds/{id}/message -d '{"content": "Same message"}'
  sleep 1
done
# Mensaje 11 debe retornar 429
```

### Test Manual - Flooding
```bash
# Enviar 21 mensajes en menos de 1 minuto
for i in {1..21}; do
  curl -X POST /api/worlds/{id}/message -d '{"content": "Flood '$i'"}'
done
# Mensaje 21 debe retornar 429
```

## Mejoras Futuras

1. **Dashboard de Rate Limits**: Mostrar estadísticas en tiempo real al usuario
2. **Notificaciones**: Alertar cuando el usuario se acerca al límite
3. **Soft Limits**: Warnings antes de alcanzar el límite
4. **Dynamic Limits**: Ajustar límites basado en comportamiento del usuario
5. **Grace Period**: Período de gracia para usuarios que acaban de actualizar plan
6. **Rollover**: Permitir acumular mensajes no usados (hasta cierto límite)

## Troubleshooting

### Redis no disponible
- Sistema usa fallback in-memory automáticamente
- Logs muestran "falling back to in-memory limiter"
- Límites se mantienen pero no persisten entre restarts

### Límites incorrectos
- Verificar que user.plan en sesión sea correcto
- Cache puede estar desactualizado (máximo 5 minutos)
- Invalidar cache manualmente si es necesario

### Headers no aparecen
- Verificar que messageLimitCheck tenga limit y remaining
- Headers solo se agregan en respuestas exitosas (200) y 429
- CORS puede estar bloqueando headers en frontend
