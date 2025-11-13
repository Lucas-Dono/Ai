# Token-Based Limits System

## 📋 Tabla de Contenidos
- [Overview](#overview)
- [¿Por Qué Tokens?](#por-qué-tokens)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Ratios de Conversión](#ratios-de-conversión)
- [Límites por Tier](#límites-por-tier)
- [Flujo de Verificación](#flujo-de-verificación)
- [Frontend vs Backend](#frontend-vs-backend)
- [Implementación](#implementación)
- [Testing](#testing)

---

## Overview

Sistema de límites justo y preciso basado en **tokens reales consumidos** en lugar de conteo arbitrario de mensajes. Migrado en respuesta a la necesidad de equidad: un usuario que envía "Hola" (5 tokens) no debe consumir el mismo límite que alguien que envía un ensayo de 3000 tokens.

### Características Clave
- ✅ **Justo**: Los límites se basan en consumo real de recursos
- ✅ **Preciso**: Tracking separado de input/output tokens
- ✅ **User-friendly**: Frontend muestra equivalencias en mensajes aproximados
- ✅ **Anti-abuse**: Límites diarios Y semanales
- ✅ **Rewarded tokens**: Sistema de videos para usuarios free

---

## ¿Por Qué Tokens?

### Problema Anterior (Message-Based)
```typescript
// Usuario A
"Hola" = 1 mensaje = ~5 tokens

// Usuario B
[3000 palabra essay] = 1 mensaje = ~3000 tokens

// Resultado: Usuario B consume 600x más recursos pero cuenta igual ❌
```

### Solución Actual (Token-Based)
```typescript
// Usuario A
"Hola" = ~5 tokens consumidos

// Usuario B
[3000 palabra essay] = ~3000 tokens consumidos

// Resultado: Cada usuario consume según su uso real ✅
```

### Beneficios
1. **Equidad**: Usuarios pagan (en límites) por lo que realmente usan
2. **Precisión**: Costos reales de API = límites reales de usuario
3. **Flexibilidad**: Usuarios pueden enviar mensajes cortos más frecuentemente o largos menos frecuentemente
4. **Transparencia**: Frontend muestra tanto tokens como equivalencia en mensajes

---

## Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────────────┐
│                   USER REQUEST                       │
│              "Cuéntame sobre el espacio"            │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│            /api/agents/[id]/message                  │
│     1. canSendMessage(userId, plan, estimatedTokens)│
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│              token-limits.ts                         │
│   ┌──────────────────────────────────────────┐     │
│   │ STEP 1: Check Daily Token Limit          │     │
│   │   - Input tokens: 150 remaining?         │     │
│   │   - Output tokens: 200 remaining?        │     │
│   └──────────────────────────────────────────┘     │
│                    │                                 │
│                    ▼                                 │
│   ┌──────────────────────────────────────────┐     │
│   │ STEP 2: Check Weekly Token Limit         │     │
│   │   - Total tokens this week < limit?      │     │
│   │   - Anti-abuse protection                │     │
│   └──────────────────────────────────────────┘     │
│                    │                                 │
│                    ▼                                 │
│              [ALLOWED / BLOCKED]                    │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼ (if allowed)
┌─────────────────────────────────────────────────────┐
│              LLM API Call                            │
│     - Send message to OpenRouter/Claude             │
│     - Receive response with actual token usage      │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│         trackTokenUsage(userId, input, output)      │
│   - Record input_tokens to Usage table              │
│   - Record output_tokens to Usage table             │
│   - Invalidate cache for this user                  │
└─────────────────────────────────────────────────────┘
```

### Base de Datos (Usage Table)

```prisma
model Usage {
  id           String   @id @default(cuid())
  userId       String
  resourceType String   // "input_tokens", "output_tokens", "rewarded_input_tokens", etc.
  quantity     Int      // Número de tokens
  metadata     Json?    // { agentId, messageId, timestamp, etc. }
  createdAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  @@index([userId, resourceType, createdAt])
}
```

---

## Ratios de Conversión

### Tokens por Mensaje (Promedio)

```typescript
export const TOKENS_PER_MESSAGE = {
  input: 150,   // Mensaje típico del usuario
  output: 200,  // Respuesta típica del compañero
  total: 350,   // Total por intercambio completo
} as const;
```

### Ejemplos Reales

| Tipo de Mensaje | Ejemplo | Tokens Aprox. | Mensajes Equivalentes |
|-----------------|---------|---------------|----------------------|
| Saludo corto | "Hola" | 5 | 0.01 |
| Pregunta simple | "¿Cómo estás?" | 20 | 0.06 |
| Conversación casual | "Cuéntame sobre tu día" | 150 | 0.43 |
| Pregunta compleja | "Explícame la teoría de relatividad" | 200 | 0.57 |
| Ensayo corto | [100 palabras] | 800 | 2.29 |
| Ensayo largo | [500 palabras] | 3000 | 8.57 |

### Funciones de Conversión

```typescript
// Backend → Frontend (para mostrar al usuario)
function tokensToMessages(tokens: number): number {
  return Math.floor(tokens / 350);
}

// Ejemplo
tokensToMessages(3500) // = 10 mensajes aprox.
tokensToMessages(35000) // = 100 mensajes aprox.

// Frontend → Backend (para cálculos internos)
function messagesToTokens(messages: number): number {
  return messages * 350;
}

// Ejemplo
messagesToTokens(10) // = 3500 tokens
messagesToTokens(100) // = 35000 tokens
```

---

## Límites por Tier

### Free Plan
**Objetivo**: ~10 mensajes/día, ~50 mensajes/semana

```typescript
free: {
  resources: {
    // DAILY LIMITS
    inputTokensPerDay: 1_500,      // ~10 msgs × 150 tokens
    outputTokensPerDay: 2_000,     // ~10 msgs × 200 tokens
    totalTokensPerDay: 3_500,      // ~10 mensajes promedio

    // WEEKLY LIMITS (Anti-abuse)
    inputTokensPerWeek: 7_500,     // ~50 msgs × 150 tokens
    outputTokensPerWeek: 10_000,   // ~50 msgs × 200 tokens
    totalTokensPerWeek: 17_500,    // ~50 mensajes promedio

    // REWARDED TOKENS (Videos)
    maxRewardedTokensPerDay: 100_000, // ~285 mensajes extra/día
    tokensPerVideo: 10_000,            // ~28 mensajes por video
  }
}
```

**Estrategia de uso óptima para Free**:
- Mensajes cortos frecuentes: ✅ Excelente
- Mensajes largos ocasionales: ✅ Funciona
- Conversaciones largas diarias: ❌ Requiere upgrade o videos

### Plus Plan
**Objetivo**: ~100 mensajes/día, ~500 mensajes/semana

```typescript
plus: {
  resources: {
    // DAILY LIMITS
    inputTokensPerDay: 15_000,     // ~100 msgs × 150 tokens
    outputTokensPerDay: 20_000,    // ~100 msgs × 200 tokens
    totalTokensPerDay: 35_000,     // ~100 mensajes promedio

    // WEEKLY LIMITS (Anti-abuse)
    inputTokensPerWeek: 75_000,    // ~500 msgs × 150 tokens
    outputTokensPerWeek: 100_000,  // ~500 msgs × 200 tokens
    totalTokensPerWeek: 175_000,   // ~500 mensajes promedio
  }
}
```

**Estrategia de uso óptima para Plus**:
- Uso intensivo diario: ✅ Perfecto
- Múltiples agentes activos: ✅ Sin problema
- Conversaciones largas: ✅ Cubre la mayoría de casos

### Ultra Plan
**Objetivo**: ~100 mensajes/día, ~700 mensajes/semana

```typescript
ultra: {
  resources: {
    // DAILY LIMITS
    inputTokensPerDay: 15_000,     // ~100 msgs × 150 tokens
    outputTokensPerDay: 20_000,    // ~100 msgs × 200 tokens
    totalTokensPerDay: 35_000,     // ~100 mensajes promedio

    // WEEKLY LIMITS (Anti-abuse - PROPUESTA ORIGINAL USUARIO)
    inputTokensPerWeek: 105_000,   // ~700 msgs × 150 tokens
    outputTokensPerWeek: 140_000,  // ~700 msgs × 200 tokens
    totalTokensPerWeek: 245_000,   // ~700 mensajes promedio
  }
}
```

**Estrategia de uso óptima para Ultra**:
- Power users: ✅ Diseñado para ti
- Uso profesional: ✅ Capacidad empresarial
- Experimentación: ✅ Límite semanal más alto

---

## Flujo de Verificación

### 1. Pre-Flight Check (antes de enviar mensaje)

```typescript
// En /api/agents/[id]/message route.ts
const canSend = await canSendMessage(
  session.user.id,
  session.user.plan || "free",
  estimateTokensFromText(userMessage) // ~1 token por palabra
);

if (!canSend.allowed) {
  return NextResponse.json(
    {
      error: canSend.reason,
      usage: {
        tokensUsed: canSend.inputTokensUsed,
        tokensLimit: canSend.inputTokensLimit,
        messagesUsedToday: canSend.messagesUsedToday,
        messagesLimitToday: canSend.messagesLimitToday,
      },
      canUseRewarded: canSend.canUseRewarded,
    },
    { status: 429 }
  );
}
```

### 2. Post-Message Tracking (después de recibir respuesta)

```typescript
// Después de llamar al LLM
const completion = await llmProvider.chat({...});

// Trackear tokens REALES consumidos
await trackTokenUsage(
  session.user.id,
  completion.usage.prompt_tokens,      // Tokens reales de input
  completion.usage.completion_tokens,  // Tokens reales de output
  {
    agentId: agent.id,
    messageId: savedMessage.id,
    userMessageContent: userMessage.slice(0, 100), // Para debugging
  }
);
```

### 3. Verificación Diaria vs Semanal

```typescript
// STEP 1: Check Daily Limit
const usage = await getDailyTokenUsage(userId);
const inputRemaining = limits.inputTokensPerDay - usage.inputTokens;
const outputRemaining = limits.outputTokensPerDay - usage.outputTokens;

if (inputRemaining < estimatedInputTokens || outputRemaining < 200) {
  return { allowed: false, reason: "Daily limit reached" };
}

// STEP 2: Check Weekly Limit (ANTI-ABUSE)
const weeklyUsage = await getWeeklyUsage(userId, "tokens");
if (weeklyUsage >= limits.totalTokensPerWeek) {
  return {
    allowed: false,
    reason: "Weekly limit reached. Resets on Sunday."
  };
}

// STEP 3: All good!
return { allowed: true };
```

---

## Frontend vs Backend

### Backend (Precisión)
```typescript
// En tier-limits.ts y usage tracking
{
  inputTokensPerDay: 15_000,
  outputTokensPerDay: 20_000,
  totalTokensPerDay: 35_000,
}

// Usage tracking en DB
await prisma.usage.create({
  data: {
    userId: "user_123",
    resourceType: "input_tokens",
    quantity: 147,  // Tokens EXACTOS del mensaje
  }
});
```

### Frontend (Claridad)
```typescript
// En dashboard/billing/page.tsx
<UsageMetrics
  metrics={[
    {
      label: "Mensajes hoy",
      current: usageStats.tokens.messagesUsedToday,  // ~10
      limit: usageStats.tokens.messageLimitToday,    // ~100
      unit: `(${usageStats.tokens.tokensUsedToday.toLocaleString()}/${usageStats.tokens.tokenLimitToday.toLocaleString()} tokens) · ${usageStats.tokens.messagesUsedWeekly}/${usageStats.tokens.messageLimitWeekly} esta semana`
    }
  ]}
/>
```

**Resultado visual para el usuario**:
```
Mensajes hoy: 8 / 100
(2,840/35,000 tokens) · 45/500 esta semana
```

**Ventajas**:
- Usuario ve "mensajes" (concepto familiar)
- Usuario experto ve tokens exactos (transparencia)
- Usuario ve contexto semanal (prevenir sorpresas)

---

## Implementación

### Archivos Modificados

#### 1. `/lib/usage/tier-limits.ts`
**Cambios**:
- Migrado de `messagesPerDay/Week` a `inputTokensPerDay/Week`, `outputTokensPerDay/Week`, `totalTokensPerDay/Week`
- Agregado `tokensToMessages()` y `messagesToTokens()` helpers
- Actualizado Free: 3,500 tokens/día (10 msgs), 17,500 tokens/semana (50 msgs)
- Actualizado Plus: 35,000 tokens/día (100 msgs), 175,000 tokens/semana (500 msgs)
- Actualizado Ultra: 35,000 tokens/día (100 msgs), 245,000 tokens/semana (700 msgs)

#### 2. `/lib/usage/token-limits.ts`
**Cambios**:
- Agregado verificación de límite SEMANAL en `canSendMessage()`
- Importado `getTierLimits`, `isUnlimited`, `getWeeklyUsage`
- STEP 1: Check daily token limit
- STEP 2: Check weekly token limit (ANTI-ABUSE)
- STEP 3: Allow if both pass

#### 3. `/lib/usage/daily-limits.ts`
**Cambios**:
- Modificado `getWeeklyUsage()` para soportar `resourceType: "tokens"`
- Para tokens, suma tanto `input_tokens` como `output_tokens` de Usage table

#### 4. `/lib/billing/usage-stats.ts`
**Cambios**:
- Cambiado interface `UsageStats.messages` → `UsageStats.tokens`
- Incluye valores en tokens (backend) Y equivalencia en mensajes (frontend)
- Usa `getDailyTokenUsage()` y `getWeeklyUsage()` para token tracking

#### 5. `/app/dashboard/billing/page.tsx`
**Cambios**:
- Actualizado interface `UsageStats` para usar `tokens` en vez de `messages`
- Renderizado muestra mensajes aproximados con tokens exactos en paréntesis
- Muestra contexto semanal

### Uso en Endpoints

```typescript
// En /api/agents/[id]/message/route.ts (línea ~346)
const canSend = await canSendMessage(
  session.user.id,
  session.user.plan || "free",
  estimateTokensFromText(content)
);

if (!canSend.allowed) {
  return NextResponse.json(
    {
      error: canSend.reason,
      details: {
        tokensUsedToday: canSend.inputTokensUsed,
        tokensLimitToday: canSend.inputTokensLimit,
        messagesUsedToday: canSend.messagesUsedToday,
        messagesLimitToday: canSend.messagesLimitToday,
      }
    },
    { status: 429 }
  );
}
```

---

## Testing

### Unit Tests

```typescript
// __tests__/lib/usage/token-limits.test.ts
describe("Token-based limits", () => {
  it("should allow message when under daily limit", async () => {
    const result = await canSendMessage("user_free", "free", 150);
    expect(result.allowed).toBe(true);
  });

  it("should block message when daily limit exceeded", async () => {
    // Mock: user has used 3400/3500 tokens today
    const result = await canSendMessage("user_free", "free", 150);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("diario");
  });

  it("should block message when weekly limit exceeded", async () => {
    // Mock: user has used 17000/17500 tokens this week
    const result = await canSendMessage("user_free", "free", 150);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("semanal");
  });

  it("should convert tokens to messages correctly", () => {
    expect(tokensToMessages(3500)).toBe(10);
    expect(tokensToMessages(35000)).toBe(100);
    expect(tokensToMessages(245000)).toBe(700);
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/message-limits.test.ts
describe("Message API with token limits", () => {
  it("should track actual tokens consumed", async () => {
    const response = await fetch("/api/agents/agent_123/message", {
      method: "POST",
      body: JSON.stringify({ content: "Hola" }),
    });

    expect(response.status).toBe(200);

    // Verify tracking
    const usage = await getDailyTokenUsage("user_123");
    expect(usage.totalTokens).toBeGreaterThan(0);
    expect(usage.totalTokens).toBeLessThan(50); // "Hola" debería ser ~5-10 tokens
  });

  it("should block after weekly limit", async () => {
    // Simulate 50 messages throughout the week
    for (let i = 0; i < 50; i++) {
      await trackTokenUsage("user_free", 150, 200);
    }

    // Next message should be blocked
    const canSend = await canSendMessage("user_free", "free");
    expect(canSend.allowed).toBe(false);
  });
});
```

### Manual Testing Checklist

- [ ] Free user: Puede enviar ~10 mensajes/día
- [ ] Free user: Se bloquea al alcanzar 3,500 tokens diarios
- [ ] Free user: Se bloquea al alcanzar 17,500 tokens semanales
- [ ] Plus user: Puede enviar ~100 mensajes/día
- [ ] Ultra user: Puede enviar hasta 700 mensajes/semana
- [ ] Dashboard muestra tokens Y mensajes correctamente
- [ ] Rewarded videos otorgan 10k tokens (~28 mensajes)
- [ ] Límite semanal se resetea los domingos

---

## Beneficios del Sistema

### ✅ Para Usuarios
1. **Justicia**: Pagan (en límites) por lo que realmente usan
2. **Transparencia**: Pueden ver tokens exactos consumidos
3. **Flexibilidad**: Pueden elegir entre muchos mensajes cortos o pocos mensajes largos
4. **Claridad**: Frontend muestra equivalencias familiares ("~10 mensajes")

### ✅ Para el Negocio
1. **Costos predecibles**: Límites alineados con costos reales de API
2. **Anti-abuse efectivo**: Límites diarios Y semanales previenen uso excesivo
3. **Escalabilidad**: Sistema justo escala con crecimiento de usuarios
4. **Métricas precisas**: Tracking exacto de consumo real

### ✅ Para el Sistema
1. **Precisión**: Tracking basado en valores reales del LLM
2. **Performance**: Cache de 5 minutos reduce queries a DB
3. **Mantenibilidad**: Sistema unificado (no más doble tracking)
4. **Extensibilidad**: Fácil agregar nuevos tiers o límites

---

## Próximos Pasos

### Futuras Mejoras
1. **Smart token estimation**: Mejorar `estimateTokensFromText()` con análisis más sofisticado
2. **User analytics**: Dashboard con breakdown de uso por agente/conversación
3. **Token rollover**: Permitir que tokens no usados se acumulen (hasta cierto límite)
4. **Dynamic pricing**: Ajustar límites según demanda del servidor

### Monitoreo
1. Establecer alertas cuando usuarios free alcancen 80% de sus límites
2. Tracking de conversión: ¿cuántos usuarios free ven el límite y upgraden?
3. Análisis de patrones: ¿qué tipos de mensajes consumen más tokens?

---

## Referencias

- [OpenRouter Token Pricing](https://openrouter.ai/docs#token-counting)
- [Anthropic Claude Tokenization](https://docs.anthropic.com/claude/reference/token-counting)
- [OpenAI Token Usage](https://platform.openai.com/docs/guides/rate-limits/usage-tiers)

---

**Última actualización**: 2025-01-11
**Versión**: 1.0.0
**Autor**: Sistema de desarrollo
