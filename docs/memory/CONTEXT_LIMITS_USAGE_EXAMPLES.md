# Context Limits - Ejemplos de Uso

Este documento muestra cómo usar el sistema de contexto dinámico en diferentes partes del código.

## Importación

```typescript
import { getContextLimit } from '@/lib/usage/context-limits';
```

## Ejemplo 1: Endpoint de Mensajes (Actual)

```typescript
// app/api/agents/[id]/message/route.ts

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: agentId } = await params;
  const user = await getAuthenticatedUser(req);
  const userPlan = user.plan || 'free';

  const result = await messageService.processMessage({
    agentId,
    userId: user.id,
    content: "Hola",
    userPlan, // 🔥 Pasar el plan
  });
}
```

## Ejemplo 2: Service Layer (Actual)

```typescript
// lib/services/message.service.ts

async processMessage(input: ProcessMessageInput): Promise<ProcessMessageOutput> {
  const { agentId, userId, userPlan = 'free' } = input;

  // Obtener límite dinámico
  const contextLimit = getContextLimit(userPlan);
  console.log(`Context limit: ${contextLimit} messages for ${userPlan} tier`);

  // Usar en query
  const recentMessages = await prisma.message.findMany({
    where: { agentId },
    orderBy: { createdAt: 'desc' },
    take: contextLimit, // 🔥 10, 30, o 100
  });
}
```

## Ejemplo 3: World Messages (Actual)

```typescript
// app/api/worlds/[id]/message/route.ts

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userPlan = session.user.plan || 'free';
  const contextLimit = getContextLimit(userPlan);

  const recentInteractions = await prisma.worldInteraction.findMany({
    where: { worldId },
    orderBy: { createdAt: 'desc' },
    take: contextLimit, // 🔥 Dinámico
  });
}
```

## Ejemplo 4: Custom Hook para UI

```typescript
// hooks/useContextLimit.ts

import { useSession } from 'next-auth/react';
import { getContextLimit, getContextMultiplier, hasExtendedContext } from '@/lib/usage/context-limits';

export function useContextLimit() {
  const { data: session } = useSession();
  const userPlan = session?.user?.plan || 'free';

  return {
    limit: getContextLimit(userPlan),
    multiplier: getContextMultiplier(userPlan),
    hasExtended: hasExtendedContext(userPlan),
    tier: userPlan,
  };
}

// Uso en componente:
function ChatComponent() {
  const { limit, multiplier, hasExtended } = useContextLimit();

  return (
    <div>
      <p>Contexto disponible: {limit} mensajes</p>
      {hasExtended && (
        <p>🔥 {multiplier}x más memoria que Free tier!</p>
      )}
    </div>
  );
}
```

## Ejemplo 5: Analytics Dashboard

```typescript
// app/dashboard/analytics/page.tsx

import { getContextLimit, getAllContextLimits } from '@/lib/usage/context-limits';

export default async function AnalyticsPage() {
  const session = await auth();
  const userPlan = session?.user?.plan || 'free';
  const currentLimit = getContextLimit(userPlan);
  const allLimits = getAllContextLimits();

  return (
    <div>
      <h1>Tu Plan: {userPlan.toUpperCase()}</h1>
      <p>Contexto actual: {currentLimit} mensajes</p>

      <h2>Compara con otros planes:</h2>
      <ul>
        {Object.entries(allLimits).map(([plan, limit]) => (
          <li key={plan}>
            {plan}: {limit} mensajes
            {plan === userPlan && " (Tu plan actual)"}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Ejemplo 6: Server Action con Context Info

```typescript
// app/actions/chat-actions.ts

'use server';

import { auth } from '@/lib/auth';
import { getContextLimit } from '@/lib/usage/context-limits';
import { prisma } from '@/lib/prisma';

export async function getConversationContext(agentId: string) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const userPlan = session.user.plan || 'free';
  const contextLimit = getContextLimit(userPlan);

  const messages = await prisma.message.findMany({
    where: { agentId, userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: contextLimit,
    select: {
      id: true,
      content: true,
      role: true,
      createdAt: true,
    },
  });

  return {
    messages: messages.reverse(),
    contextInfo: {
      limit: contextLimit,
      used: messages.length,
      percentageUsed: (messages.length / contextLimit) * 100,
      plan: userPlan,
    },
  };
}
```

## Ejemplo 7: Indicator Component

```typescript
// components/chat/ContextIndicator.tsx

import { useContextLimit } from '@/hooks/useContextLimit';

export function ContextIndicator({ messagesCount }: { messagesCount: number }) {
  const { limit, multiplier, hasExtended } = useContextLimit();

  const percentage = (messagesCount / limit) * 100;
  const isNearLimit = percentage > 80;

  return (
    <div className="flex items-center gap-2">
      <div className="w-32 bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${isNearLimit ? 'bg-orange-500' : 'bg-green-500'}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span className="text-sm text-gray-600">
        {messagesCount}/{limit} mensajes
      </span>
      {hasExtended && (
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
          {multiplier}x
        </span>
      )}
    </div>
  );
}
```

## Ejemplo 8: Upgrade Prompt cuando se alcanza el límite

```typescript
// components/chat/UpgradePrompt.tsx

import { useContextLimit } from '@/hooks/useContextLimit';
import Link from 'next/link';

export function UpgradePrompt({ messagesCount }: { messagesCount: number }) {
  const { limit, tier, hasExtended } = useContextLimit();

  if (hasExtended || messagesCount < limit * 0.8) {
    return null; // No mostrar si tiene plan premium o no está cerca del límite
  }

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-lg text-white">
      <h3 className="font-bold">¡Conversaciones más largas con Plus!</h3>
      <p className="text-sm mt-1">
        Estás usando {messagesCount}/{limit} mensajes.
        Actualiza a Plus para tener 30 mensajes de contexto (3x más).
      </p>
      <Link
        href="/pricing"
        className="mt-2 inline-block bg-white text-purple-600 px-4 py-2 rounded font-medium"
      >
        Ver Planes
      </Link>
    </div>
  );
}
```

## Ejemplo 9: Logging & Monitoring

```typescript
// lib/monitoring/context-tracking.ts

import { getContextLimit } from '@/lib/usage/context-limits';

export async function logContextUsage(params: {
  userId: string;
  agentId: string;
  userPlan: string;
  messagesRetrieved: number;
}) {
  const { userId, agentId, userPlan, messagesRetrieved } = params;
  const limit = getContextLimit(userPlan);

  console.log({
    event: 'context_usage',
    userId,
    agentId,
    plan: userPlan,
    contextLimit: limit,
    messagesRetrieved,
    utilizationPercentage: (messagesRetrieved / limit) * 100,
    timestamp: new Date().toISOString(),
  });

  // Enviar a analytics platform (ej: PostHog, Mixpanel, etc.)
  // analytics.track('Context Usage', { ... });
}
```

## Ejemplo 10: Testing con Diferentes Tiers

```typescript
// __tests__/integration/message-context.test.ts

import { describe, it, expect } from 'vitest';
import { getContextLimit } from '@/lib/usage/context-limits';

describe('Message Context Integration', () => {
  it('should load correct context for free user', async () => {
    const messages = await getMessagesForUser('user-1', 'free');
    expect(messages.length).toBeLessThanOrEqual(10);
  });

  it('should load correct context for plus user', async () => {
    const messages = await getMessagesForUser('user-2', 'plus');
    expect(messages.length).toBeLessThanOrEqual(30);
  });

  it('should load correct context for ultra user', async () => {
    const messages = await getMessagesForUser('user-3', 'ultra');
    expect(messages.length).toBeLessThanOrEqual(100);
  });
});

async function getMessagesForUser(userId: string, plan: string) {
  const limit = getContextLimit(plan);
  // Simulate fetching messages with limit...
  return [];
}
```

## Tips & Best Practices

### 1. Siempre pasar el userPlan
```typescript
// ✅ Bueno
const result = await messageService.processMessage({
  agentId,
  userId,
  content,
  userPlan: session.user.plan, // Siempre incluir
});

// ❌ Malo
const result = await messageService.processMessage({
  agentId,
  userId,
  content,
  // Falta userPlan - usará default 'free'
});
```

### 2. Cachear el límite si se usa múltiples veces
```typescript
// ✅ Bueno
const contextLimit = getContextLimit(userPlan);
const messages = await getMessages(contextLimit);
const summary = generateSummary(messages, contextLimit);

// ❌ Malo (llamadas redundantes)
const messages = await getMessages(getContextLimit(userPlan));
const summary = generateSummary(messages, getContextLimit(userPlan));
```

### 3. Logging para debugging
```typescript
const contextLimit = getContextLimit(userPlan);
log.debug({ userPlan, contextLimit, agentId }, 'Context limit applied');
```

### 4. Fallback seguro
```typescript
// Siempre usar default 'free' si plan es undefined
const userPlan = session?.user?.plan || 'free';
const contextLimit = getContextLimit(userPlan);
```

## Documentación Adicional

- Ver `DYNAMIC_CONTEXT_IMPLEMENTATION.md` para detalles técnicos completos
- Ver `CONTEXT_LIMITS_SUMMARY.txt` para resumen visual
- Ver tests en `__tests__/lib/usage/context-limits.test.ts` para ejemplos de validación
