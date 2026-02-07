# Semantic Cache System

Sistema de caché semántico para respuestas de IA que reduce costos en ~30% mediante búsqueda por similitud vectorial.

## 🎯 Propósito

El caché semántico resuelve el problema de **respuestas repetitivas costosas**:

### Sin Semantic Cache
```
Usuario 1: "¿Cuál es tu color favorito?"        → API Call ($$$)
Usuario 2: "Cual es tu color preferido?"        → API Call ($$$)
Usuario 3: "Dime qué color te gusta más"        → API Call ($$$)
```
**Resultado**: 3 llamadas a la API, mismo contexto, ~$0.03

### Con Semantic Cache
```
Usuario 1: "¿Cuál es tu color favorito?"        → API Call ($$$) + Cache
Usuario 2: "Cual es tu color preferido?"        → CACHE HIT (95% similar) ✅
Usuario 3: "Dime qué color te gusta más"        → CACHE HIT (87% similar) ✅
```
**Resultado**: 1 llamada a la API, ~$0.01 (ahorro: 66%)

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     Usuario envía prompt                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Generar embedding del prompt (Qwen2.5 1.5B Instruct)   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Buscar en Redis Index (Sorted Set por hit count)       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Calcular similitud coseno con candidatos (top 50)      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                ┌─────┴─────┐
                │           │
         Similitud >= 85%   │ Similitud < 85%
                │           │
                ▼           ▼
    ┌──────────────┐  ┌──────────────┐
    │  CACHE HIT   │  │  CACHE MISS  │
    │  Retornar    │  │  Llamar API  │
    │  respuesta   │  │  y cachear   │
    └──────────────┘  └──────────────┘
```

---

## 📦 Uso Básico

### 1. Wrapper Automático (Recomendado)

```typescript
import { withSemanticCache } from '@/lib/cache/semantic-cache';
import { generateAIResponse } from '@/lib/llm/provider';

async function chat(prompt: string, agentId: string) {
  return withSemanticCache(
    prompt,
    agentId,
    // Generator function
    async () => {
      const response = await generateAIResponse({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      });
      return response.content;
    },
    {
      model: 'gpt-4',
      temperature: 0.7,
      ttl: 7 * 24 * 60 * 60, // 7 días
    }
  );
}

// Uso
const response = await chat("¿Cuál es tu color favorito?", "agent-123");
```

### 2. API Manual

```typescript
import { semanticCache } from '@/lib/cache/semantic-cache';

// Buscar en cache
const cached = await semanticCache.get(
  "¿Cuál es tu color favorito?",
  "agent-123",
  {
    model: 'gpt-4',
    temperature: 0.7,
  }
);

if (cached) {
  console.log('CACHE HIT:', cached);
} else {
  // Generar respuesta
  const response = await generateAIResponse(...);

  // Guardar en cache
  await semanticCache.set(
    "¿Cuál es tu color favorito?",
    response,
    "agent-123",
    {
      model: 'gpt-4',
      temperature: 0.7,
      ttl: 604800, // 7 días en segundos
    }
  );
}
```

---

## 🎨 Integración en Routes

### API Route con Semantic Cache

```typescript
// app/api/agents/[id]/message/route.ts

import { withSemanticCache } from '@/lib/cache/semantic-cache';
import { generateResponse } from '@/lib/emotional-system/orchestrator';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { message } = await request.json();
  const agentId = params.id;

  // Usar cache semántico
  const response = await withSemanticCache(
    message,
    agentId,
    async () => {
      // Generar respuesta con el sistema emocional
      return await generateResponse({
        agentId,
        userMessage: message,
        userId: session.user.id,
      });
    },
    {
      model: 'qwen-2.5-72b-instruct',
      temperature: 0.7,
      enabled: true, // Habilitar cache
    }
  );

  return Response.json({ response });
}
```

---

## ⚙️ Configuración

### Configuración Global

```typescript
import { SemanticCache } from '@/lib/cache/semantic-cache';

const cache = new SemanticCache({
  similarityThreshold: 0.85,      // 85% de similitud (0-1)
  defaultTtl: 7 * 24 * 60 * 60,  // 7 días
  namespace: 'semantic_cache',    // Namespace de Redis
  maxCandidates: 50,              // Máximo de candidatos a revisar
});
```

### Configuración por Llamada

```typescript
await withSemanticCache(
  prompt,
  agentId,
  generator,
  {
    model: 'gpt-4',           // Filtrar por modelo
    temperature: 0.7,         // Filtrar por temperature
    ttl: 86400,              // TTL específico (1 día)
    enabled: true,           // Habilitar/deshabilitar
  }
);
```

---

## 📊 Estadísticas y Monitoreo

### Obtener Estadísticas

```typescript
import { semanticCache } from '@/lib/cache/semantic-cache';

const stats = await semanticCache.getStats('agent-123');

console.log(stats);
// {
//   totalEntries: 150,      // Total de entradas cacheadas
//   totalHits: 450,         // Total de hits acumulados
//   avgHitCount: 3,         // Promedio de hits por entrada
//   oldestEntry: 1234567890, // Timestamp de la entrada más antigua
//   newestEntry: 1234599999  // Timestamp de la entrada más reciente
// }
```

### Dashboard de Métricas

```typescript
// app/api/admin/cache-stats/route.ts

import { semanticCache } from '@/lib/cache/semantic-cache';

export async function GET() {
  const agentIds = await getAllAgentIds();

  const stats = await Promise.all(
    agentIds.map(async (id) => ({
      agentId: id,
      stats: await semanticCache.getStats(id),
    }))
  );

  // Calcular métricas globales
  const totalEntries = stats.reduce((sum, s) => sum + s.stats.totalEntries, 0);
  const totalHits = stats.reduce((sum, s) => sum + s.stats.totalHits, 0);
  const hitRate = totalHits / (totalHits + totalEntries); // Estimado

  return Response.json({
    stats,
    global: {
      totalEntries,
      totalHits,
      hitRate: (hitRate * 100).toFixed(2) + '%',
      estimatedSavings: `$${(totalHits * 0.01).toFixed(2)}`, // Asumiendo $0.01 por request
    },
  });
}
```

---

## 🧹 Mantenimiento

### Invalidar Cache de un Agente

```typescript
import { semanticCache } from '@/lib/cache/semantic-cache';

// Cuando se actualiza el agente
await semanticCache.invalidate('agent-123');
```

### Limpieza Automática (Cron)

```typescript
// app/api/cron/cache-cleanup/route.ts

import { semanticCache } from '@/lib/cache/semantic-cache';

export async function GET(request: Request) {
  // Verificar cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Limpiar entradas antiguas
  await semanticCache.cleanup();

  return Response.json({ success: true });
}
```

**Configurar en Vercel Cron**:
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cache-cleanup",
      "schedule": "0 0 * * *"
    }
  ]
}
```

---

## 🎯 Best Practices

### ✅ DO

```typescript
// 1. Usar cache para respuestas conversacionales
await withSemanticCache(
  userMessage,
  agentId,
  () => generateResponse(...)
);

// 2. Invalidar cache cuando se actualiza el agente
await prisma.agent.update({ ... });
await semanticCache.invalidate(agentId);

// 3. Monitorear hit rate
const stats = await semanticCache.getStats(agentId);
console.log(`Hit rate: ${stats.totalHits / stats.totalEntries}`);

// 4. Usar TTL apropiado según el contenido
await semanticCache.set(prompt, response, agentId, {
  ttl: isPersonalInfo ? 3600 : 604800, // 1h vs 7d
});
```

### ❌ DON'T

```typescript
// 1. NO usar cache para contenido altamente dinámico
await withSemanticCache(
  `¿Qué hora es?`, // ❌ Cambia constantemente
  agentId,
  () => generateResponse(...)
);

// 2. NO usar cache con temperature muy alto
await withSemanticCache(
  prompt,
  agentId,
  () => generateResponse(...),
  { temperature: 1.2 } // ❌ Respuestas muy aleatorias
);

// 3. NO olvidar invalidar al actualizar el agente
await prisma.agent.update({ ... });
// ❌ Falta: await semanticCache.invalidate(agentId);

// 4. NO usar TTL muy largo para info personal
await semanticCache.set(
  "¿Cuál es mi dirección?",
  response,
  agentId,
  { ttl: 2592000 } // ❌ 30 días es demasiado
);
```

---

## 🔧 Troubleshooting

### Cache no está funcionando

```typescript
// 1. Verificar que Redis esté conectado
import { redis } from '@/lib/redis/config';
const ping = await redis.ping();
console.log('Redis:', ping); // Debe retornar 'PONG'

// 2. Verificar que se estén generando embeddings
import { generateEmbedding } from '@/lib/memory/embeddings';
const embedding = await generateEmbedding("test");
console.log('Embedding length:', embedding.length); // Debe ser > 0

// 3. Revisar threshold de similitud
const cache = new SemanticCache({
  similarityThreshold: 0.75, // Bajar si es necesario
});
```

### Hit rate muy bajo

```typescript
// Posibles causas:

// 1. Threshold muy alto
const cache = new SemanticCache({
  similarityThreshold: 0.85, // Probar con 0.80
});

// 2. Prompts muy variados
// Solución: Normalizar prompts antes de cachear
function normalizePrompt(prompt: string): string {
  return prompt
    .toLowerCase()
    .trim()
    .replace(/[¿?¡!]/g, '');
}

// 3. Temperature muy alto
// Solución: Usar temperature más bajo para respuestas más consistentes
```

---

## 📈 Métricas de Éxito

### KPIs a Monitorear

```typescript
// 1. Cache Hit Rate
const hitRate = totalHits / (totalHits + totalMisses);
// Target: >30% (30% de ahorros)

// 2. Latencia promedio
const avgLatency = (cacheLatency + apiLatency) / totalRequests;
// Target: <100ms para cache hits

// 3. Ahorros estimados
const savings = totalHits * costPerRequest;
// Calcular mensualmente

// 4. Similitud promedio de hits
const avgSimilarity = totalSimilarity / totalHits;
// Target: >0.90 (90%+ similitud)
```

---

## 🔗 Referencias

- [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)
- [Redis Sorted Sets](https://redis.io/docs/data-types/sorted-sets/)
- [Embedding Models](https://huggingface.co/Alibaba-NLP/gte-Qwen2-1.5B-instruct)

---

**¡Ahorra en costos de IA sin sacrificar calidad!** 💰✨
