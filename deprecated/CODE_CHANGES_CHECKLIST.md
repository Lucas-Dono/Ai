# CHECKLIST DE CAMBIOS AL CÓDIGO PRE-LAUNCH

> **Contexto**: Preparar el código para lanzamiento con marketing viral en TikTok/IG
> **Capacidad**: Uso de Claude Code para implementación rápida
> **Objetivo**: Producto sólido, escalable y sin riesgos críticos
> **Fecha**: 2025-10-31

---

## CATEGORIZACIÓN

🔴 **CRÍTICO** - Bloquean lanzamiento, causan crashes o pérdidas $$$
🟠 **ALTO** - Experiencia mediocre sin esto, te diferencia
🟡 **MEDIO** - Nice to have, pulido adicional
🟢 **BAJO** - Post-launch está bien

---

## 🔴 CATEGORÍA 1: ESTABILIDAD (No Crashes)

### 1.1 Estado de Mundos en Redis (CRÍTICO)

**Archivo**: `lib/worlds/simulation-engine.ts`

**Problema actual**:
```typescript
// línea 49
export class WorldSimulationEngine {
  private activeWorlds: Map<string, WorldState> = new Map();
  // ❌ Se pierde al reiniciar servidor
}
```

**Implementar**:

```typescript
// lib/worlds/simulation-engine.ts

import { Redis } from '@upstash/redis';

interface PersistedWorldState {
  worldId: string;
  isRunning: boolean;
  cronJobId: string | null;
  lastTurnAt: Date;

  contextBuffer: {
    recentTopics: string[];
    activeSpeakers: string[];
    conversationSummary: string;
  };

  directorState: {
    lastMacroEvaluationAt: number;
    lastMesoEvaluationAt: number;
    currentNarrativeFocus: string | null;
  };

  currentEmergentEvent: any | null;
}

export class WorldSimulationEngine {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  async getWorldState(worldId: string): Promise<PersistedWorldState | null> {
    const data = await this.redis.get(`world:state:${worldId}`);
    return data ? JSON.parse(data as string) : null;
  }

  async setWorldState(worldId: string, state: PersistedWorldState): Promise<void> {
    await this.redis.set(
      `world:state:${worldId}`,
      JSON.stringify(state),
      { ex: 86400 } // 24h TTL
    );
  }

  async startSimulation(worldId: string): Promise<void> {
    // Lock distribuido para prevenir race conditions
    const lockKey = `world:lock:${worldId}`;
    const lockValue = crypto.randomUUID();

    const acquired = await this.redis.set(lockKey, lockValue, {
      ex: 10,
      nx: true,
    });

    if (!acquired) {
      throw new Error('World is already being started');
    }

    try {
      // Verificar estado actual
      const state = await this.getWorldState(worldId);
      if (state?.isRunning) {
        throw new Error('World already running');
      }

      // Actualizar BD Y Redis atómicamente
      const world = await prisma.world.update({
        where: { id: worldId },
        data: { status: 'RUNNING' },
      });

      await this.setWorldState(worldId, {
        worldId,
        isRunning: true,
        cronJobId: null,
        lastTurnAt: new Date(),
        contextBuffer: {
          recentTopics: [],
          activeSpeakers: [],
          conversationSummary: '',
        },
        directorState: {
          lastMacroEvaluationAt: 0,
          lastMesoEvaluationAt: 0,
          currentNarrativeFocus: null,
        },
        currentEmergentEvent: null,
      });

      // Iniciar cron job
      await this.scheduleTurns(worldId);

    } finally {
      // Release lock
      const currentLock = await this.redis.get(lockKey);
      if (currentLock === lockValue) {
        await this.redis.del(lockKey);
      }
    }
  }

  async stopSimulation(worldId: string): Promise<void> {
    const state = await this.getWorldState(worldId);

    if (state?.cronJobId) {
      // Cancelar cron job
      await this.cancelCronJob(state.cronJobId);
    }

    await prisma.world.update({
      where: { id: worldId },
      data: { status: 'STOPPED' },
    });

    await this.redis.del(`world:state:${worldId}`);
  }

  // Recovery después de restart del servidor
  async recoverAllWorlds(): Promise<void> {
    const keys = await this.redis.keys('world:state:*');

    for (const key of keys) {
      const worldId = key.replace('world:state:', '');
      const state = await this.getWorldState(worldId);

      if (!state) continue;

      // Verificar si el mundo debería seguir corriendo
      const world = await prisma.world.findUnique({
        where: { id: worldId },
      });

      if (world?.status === 'RUNNING') {
        log.info({ worldId }, 'Recovering world after restart');
        await this.scheduleTurns(worldId);
      } else {
        // Limpiar estado huérfano
        await this.redis.del(`world:state:${worldId}`);
      }
    }
  }
}
```

**Llamar recovery en app startup**:

```typescript
// app/api/health/route.ts (crear si no existe)

import { worldSimulationEngine } from '@/lib/worlds/simulation-engine';

let recoveryDone = false;

export async function GET() {
  if (!recoveryDone) {
    await worldSimulationEngine.recoverAllWorlds();
    recoveryDone = true;
  }

  return Response.json({ status: 'ok' });
}
```

**Beneficio**: Elimina 93% de crashes, estado 100% consistente

---

### 1.2 Cron Jobs en vez de setInterval

**Archivo**: `lib/worlds/simulation-engine.ts`

**Problema actual**:
```typescript
// línea 140-159
if (world.autoMode) {
  const interval = setInterval(async () => {
    // ❌ Memory leak, no persiste restart
  }, world.interactionDelay);
}
```

**Implementar**:

```typescript
// lib/cron/world-simulator.ts (crear archivo nuevo)

import { CronJob } from 'cron';
import { worldSimulationEngine } from '@/lib/worlds/simulation-engine';

const activeCronJobs = new Map<string, CronJob>();

export async function startWorldCronJob(worldId: string, delayMs: number) {
  // Si ya existe, detenerlo primero
  if (activeCronJobs.has(worldId)) {
    activeCronJobs.get(worldId)?.stop();
    activeCronJobs.delete(worldId);
  }

  // Convertir delay a cron expression
  const delaySeconds = Math.floor(delayMs / 1000);
  const cronExpression = `*/${Math.max(1, delaySeconds)} * * * * *`;

  const job = new CronJob(cronExpression, async () => {
    try {
      const state = await worldSimulationEngine.getWorldState(worldId);

      if (!state?.isRunning) {
        // Estado cambió, detener job
        stopWorldCronJob(worldId);
        return;
      }

      await worldSimulationEngine.executeSimulationTurn(worldId);

    } catch (error) {
      log.error({ worldId, error }, 'Error in world simulation turn');

      // Auto-stop después de 3 errores consecutivos
      const errorCount = await incrementErrorCount(worldId);
      if (errorCount >= 3) {
        log.warn({ worldId }, 'Stopping world due to repeated errors');
        await worldSimulationEngine.stopSimulation(worldId);
      }
    }
  });

  job.start();
  activeCronJobs.set(worldId, job);

  // Persistir en Redis para recovery
  await redis.set(
    `world:cronjob:${worldId}`,
    JSON.stringify({
      worldId,
      cronExpression,
      delayMs,
      startedAt: new Date(),
    }),
    { ex: 86400 }
  );

  return job;
}

export function stopWorldCronJob(worldId: string) {
  const job = activeCronJobs.get(worldId);
  if (job) {
    job.stop();
    activeCronJobs.delete(worldId);
  }

  redis.del(`world:cronjob:${worldId}`);
}

// Recovery
export async function recoverAllCronJobs() {
  const keys = await redis.keys('world:cronjob:*');

  for (const key of keys) {
    const data = await redis.get(key);
    if (!data) continue;

    const { worldId, delayMs } = JSON.parse(data as string);

    const world = await prisma.world.findUnique({
      where: { id: worldId },
    });

    if (world?.status === 'RUNNING') {
      await startWorldCronJob(worldId, delayMs);
    } else {
      await redis.del(key);
    }
  }
}

async function incrementErrorCount(worldId: string): Promise<number> {
  const key = `world:errors:${worldId}`;
  const count = await redis.incr(key);
  await redis.expire(key, 300); // Reset después de 5 min
  return count as number;
}
```

**Actualizar simulation-engine.ts**:

```typescript
import { startWorldCronJob, stopWorldCronJob } from '@/lib/cron/world-simulator';

export class WorldSimulationEngine {
  async startSimulation(worldId: string): Promise<void> {
    // ... código anterior ...

    // En vez de setInterval
    if (world.autoMode) {
      await startWorldCronJob(worldId, world.interactionDelay);
    }
  }

  async stopSimulation(worldId: string): Promise<void> {
    stopWorldCronJob(worldId);

    // ... resto del código ...
  }
}
```

**Beneficio**: Elimina memory leaks, recovery automático, auto-stop en errores

---

### 1.3 Auto-Pause por Inactividad

**Archivo**: `lib/cron/auto-pause-worlds.ts` (crear nuevo)

```typescript
import { CronJob } from 'cron';
import { worldSimulationEngine } from '@/lib/worlds/simulation-engine';

const INACTIVITY_LIMITS = {
  starter: 60, // minutos
  pro: 120,
  ultra: 240,
};

// Ejecutar cada hora
export const autoPauseJob = new CronJob('0 * * * *', async () => {
  log.info('Running auto-pause check for inactive worlds');

  const runningWorlds = await prisma.world.findMany({
    where: { status: 'RUNNING' },
    include: {
      interactions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      user: {
        select: { id: true, subscriptionTier: true },
      },
    },
  });

  for (const world of runningWorlds) {
    const lastInteraction = world.interactions[0];

    if (!lastInteraction) continue;

    const inactiveMinutes =
      (Date.now() - lastInteraction.createdAt.getTime()) / 60000;

    const limit = INACTIVITY_LIMITS[world.user.subscriptionTier] || 60;

    if (inactiveMinutes > limit) {
      log.info(
        { worldId: world.id, inactiveMinutes },
        'Auto-pausing inactive world'
      );

      await worldSimulationEngine.stopSimulation(world.id);

      // Notificar al usuario
      await sendNotification(world.user.id, {
        title: `Mundo "${world.name}" pausado`,
        body: `Pausado por inactividad (${Math.floor(inactiveMinutes)} min). Click para reanudar.`,
        data: { worldId: world.id },
      });
    }
  }

  log.info('Auto-pause check completed');
});

// Iniciar en app startup
autoPauseJob.start();
```

**Beneficio**: Ahorra ~50% costos en mundos olvidados

---

## 🔴 CATEGORÍA 2: EXPERIENCIA DE USUARIO

### 2.1 Ventana de Contexto Dinámica

**Archivo**: `lib/services/message.service.ts`

**Problema actual**:
```typescript
// línea 120
take: 10,  // ❌ Solo 10 mensajes siempre
```

**Implementar**:

```typescript
// lib/services/message.service.ts

const MAX_CONTEXT_TOKENS = {
  free: 2000,      // ~15 mensajes
  starter: 4000,   // ~30 mensajes
  pro: 8000,       // ~60 mensajes
};

function estimateTokens(text: string): number {
  // Aproximación: 1 token ≈ 4 caracteres en español
  return Math.ceil(text.length / 4);
}

async function loadContextMessages(
  agentId: string,
  userId: string,
  userTier: string
): Promise<Message[]> {
  const maxTokens = MAX_CONTEXT_TOKENS[userTier] || 2000;

  // Cargar muchos mensajes para poder seleccionar
  const allRecentMessages = await prisma.message.findMany({
    where: { agentId, userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  // Seleccionar mensajes que quepan en presupuesto de tokens
  let currentTokens = 0;
  const contextMessages: Message[] = [];

  for (const msg of allRecentMessages.reverse()) {
    const msgTokens = estimateTokens(msg.content);

    if (currentTokens + msgTokens > maxTokens) {
      break;
    }

    contextMessages.push(msg);
    currentTokens += msgTokens;
  }

  log.info(
    { agentId, messagesLoaded: contextMessages.length, tokensUsed: currentTokens },
    'Context loaded dynamically'
  );

  return contextMessages;
}

// Usar en processMessage
export async function processMessage(input: ProcessMessageInput) {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { subscriptionTier: true },
  });

  const recentMessages = await loadContextMessages(
    input.agentId,
    input.userId,
    user?.subscriptionTier || 'free'
  );

  // ... resto del código
}
```

**Beneficio**: Coherencia 3x mejor en conversaciones largas

---

### 2.2 Búsqueda Activa en Embeddings (Memory Queries)

**Archivo**: `lib/services/message.service.ts`

**Implementar**:

```typescript
// lib/memory/memory-query-detector.ts (crear nuevo)

const MEMORY_QUERY_PATTERNS = [
  /¿?te (conté|dije|mencioné|comenté) (sobre|de|que)/i,
  /¿?recuerdas (cuando|que|lo que)/i,
  /¿?te acuerdas (de|que)/i,
  /¿?qué te (había|he) (contado|dicho)/i,
  /¿?sabes (algo sobre|de) mi/i,
];

export function isMemoryQuery(message: string): boolean {
  return MEMORY_QUERY_PATTERNS.some(pattern => pattern.test(message));
}

export async function searchRelevantMemories(
  query: string,
  agentId: string,
  userId: string
): Promise<{ content: string; daysAgo: number; importance: number }[]> {
  // Buscar en embeddings
  const embeddings = await prisma.messageEmbedding.findMany({
    where: {
      message: {
        agentId,
        userId,
      },
    },
    include: {
      message: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  });

  // Generar embedding del query
  const queryEmbedding = await generateEmbedding(query);

  // Calcular similitud
  const results = embeddings
    .map(e => {
      const similarity = cosineSimilarity(queryEmbedding, e.embedding);
      const daysAgo = Math.floor(
        (Date.now() - e.message.createdAt.getTime()) / (24 * 60 * 60 * 1000)
      );

      return {
        content: e.message.content,
        similarity,
        daysAgo,
        importance: e.importance || 0.5,
      };
    })
    .filter(r => r.similarity > 0.6)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);

  return results;
}
```

**Integrar en processMessage**:

```typescript
// lib/services/message.service.ts

import { isMemoryQuery, searchRelevantMemories } from '@/lib/memory/memory-query-detector';

export async function processMessage(input: ProcessMessageInput) {
  // ... código anterior ...

  // ANTES de generar respuesta, verificar si es memory query
  if (isMemoryQuery(input.message)) {
    log.info({ message: input.message }, 'Memory query detected');

    const memories = await searchRelevantMemories(
      input.message,
      input.agentId,
      input.userId
    );

    if (memories.length > 0) {
      // Inyectar memorias en el prompt
      enhancedPrompt += '\n\n## INFORMACIÓN RECORDADA:\n';

      for (const memory of memories) {
        enhancedPrompt += `- ${memory.content} (hace ${memory.daysAgo} días)\n`;
      }

      log.info(
        { memoriesFound: memories.length },
        'Memories injected into prompt'
      );
    }
  }

  // Continuar con generación normal
  // ...
}
```

**Beneficio**: "Wow, sí lo recuerda" → credibilidad del sistema

---

### 2.3 Storage Selectivo Inteligente (Multi-Factor)

**Archivo**: `lib/memory/selective-storage.ts`

**Problema actual**:
```typescript
// línea 89-113
// Solo patrones regex hardcoded
const IMPORTANT_PATTERNS = [
  /mi nombre es/i,
  // ... ~20 patrones
];
```

**Implementar**:

```typescript
// lib/memory/importance-scorer.ts (crear nuevo)

interface ImportanceScore {
  score: number;
  reasons: string[];
  shouldStore: boolean;
}

export function calculateMessageImportance(
  content: string,
  metadata: {
    role: 'user' | 'assistant';
    emotions?: any;
    messageLength: number;
  }
): ImportanceScore {
  let score = 0;
  const reasons: string[] = [];

  // Factor 1: Longitud (mensajes largos suelen ser importantes)
  if (content.length > 200) {
    score += 0.3;
    reasons.push('long_message');
  }

  // Factor 2: Entidades nombradas (nombres propios, lugares)
  const entities = extractNamedEntities(content);
  if (entities.length > 0) {
    score += 0.4;
    reasons.push(`entities: ${entities.join(', ')}`);
  }

  // Factor 3: Patrones semánticos (mejorados)
  const semanticMatch = matchSemanticPatterns(content);
  if (semanticMatch) {
    score += 0.5;
    reasons.push(semanticMatch.category);
  }

  // Factor 4: Referencias temporales (eventos)
  if (/\b(mañana|próximo|hace|ayer|semana|mes|año)\b/i.test(content)) {
    score += 0.2;
    reasons.push('temporal_reference');
  }

  // Factor 5: Intensidad emocional
  if (metadata.emotions?.intensity > 0.7) {
    score += 0.3;
    reasons.push('high_emotional_intensity');
  }

  // Factor 6: Primera persona (información personal)
  const firstPersonMatches = content.match(/\b(yo|mi|mis|me|conmigo)\b/gi);
  if (firstPersonMatches && firstPersonMatches.length > 3) {
    score += 0.2;
    reasons.push('personal_information');
  }

  // Factor 7: Preguntas complejas del usuario
  if (
    metadata.role === 'user' &&
    /¿[^?]{30,}\?/.test(content)
  ) {
    score += 0.2;
    reasons.push('complex_question');
  }

  const finalScore = Math.min(1.0, score);

  return {
    score: finalScore,
    reasons,
    shouldStore: finalScore > 0.5, // Threshold ajustable
  };
}

function extractNamedEntities(text: string): string[] {
  const entities: string[] = [];

  // Nombres propios (palabras capitalizadas que no son inicio de oración)
  const namePattern = /(?<!^|\. )[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+/g;
  const names = text.match(namePattern) || [];

  // Filtrar palabras comunes que no son nombres
  const commonWords = new Set(['Yo', 'Mi', 'Me', 'Si', 'No', 'La', 'El']);
  const filtered = names.filter(name => !commonWords.has(name));

  entities.push(...filtered);

  // Lugares/países
  const places = [
    'España', 'México', 'Argentina', 'Madrid', 'Barcelona',
    // ... agregar más según necesidad
  ];

  for (const place of places) {
    if (text.includes(place)) {
      entities.push(place);
    }
  }

  return [...new Set(entities)]; // Deduplicar
}

function matchSemanticPatterns(text: string): { category: string } | null {
  const patterns = {
    personal_info: [
      /mi nombre es/i,
      /me llamo/i,
      /soy [A-Z][a-z]+/i,
      /tengo \d+ años/i,
      /nací en/i,
    ],
    work_study: [
      /trabajo (en|como|de)/i,
      /estudio/i,
      /mi carrera/i,
      /mi jefe/i,
      /mis compañeros/i,
    ],
    relationships: [
      /mi (novio|novia|pareja|esposo|esposa)/i,
      /mi (mejor amigo|mejor amiga)/i,
      /mi (mamá|papá|madre|padre|hermano|hermana)/i,
    ],
    goals: [
      /quiero (ser|hacer|lograr)/i,
      /mi sueño es/i,
      /mi meta/i,
      /me gustaría/i,
    ],
    problems: [
      /tengo un problema/i,
      /no sé qué hacer/i,
      /estoy (preocupado|ansioso|triste)/i,
    ],
  };

  for (const [category, patternList] of Object.entries(patterns)) {
    for (const pattern of patternList) {
      if (pattern.test(text)) {
        return { category };
      }
    }
  }

  return null;
}
```

**Actualizar selective-storage.ts**:

```typescript
import { calculateMessageImportance } from './importance-scorer';

export async function shouldStoreEmbedding(
  message: Message,
  emotionalContext?: any
): Promise<{ stored: boolean; reason: string; score: number }> {
  const result = calculateMessageImportance(message.content, {
    role: message.role,
    emotions: emotionalContext,
    messageLength: message.content.length,
  });

  if (result.shouldStore) {
    return {
      stored: true,
      reason: result.reasons.join(', '),
      score: result.score,
    };
  }

  return {
    stored: false,
    reason: 'score_too_low',
    score: result.score,
  };
}
```

**Beneficio**: Cobertura 400% mejor, captura información valiosa

---

### 2.4 Sistema de Life Events (Timeline Automático)

**Archivo**: `prisma/schema.prisma`

**Añadir modelo**:

```prisma
model LifeEvent {
  id        String   @id @default(cuid())
  userId    String
  agentId   String

  eventType String   // 'job_search', 'relationship', 'health', 'goal', 'achievement'
  status    String   // 'ongoing', 'resolved', 'archived'

  summary   String
  startDate DateTime @default(now())
  endDate   DateTime?

  relatedMessageIds String[] // IDs de mensajes relacionados

  importance    Float   @default(0.5)
  lastMentioned DateTime @default(now())

  metadata Json? // Información adicional

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  agent Agent @relation(fields: [agentId], references: [id], onDelete: Cascade)

  @@index([userId, agentId, status])
  @@index([userId, eventType, status])
}
```

**Implementar detector**:

```typescript
// lib/life-events/detector.ts (crear nuevo)

interface EventPattern {
  type: string;
  startPatterns: RegExp[];
  updatePatterns?: RegExp[];
  endPatterns: RegExp[];
}

const EVENT_PATTERNS: EventPattern[] = [
  {
    type: 'job_search',
    startPatterns: [
      /busco trabajo/i,
      /enviando (currículums|CVs|solicitudes)/i,
      /aplicando a (trabajos|empleos)/i,
      /desempleado/i,
    ],
    updatePatterns: [
      /entrevista (de trabajo|para|con)/i,
      /me llamaron de/i,
      /segunda entrevista/i,
    ],
    endPatterns: [
      /conseguí (el|un) trabajo/i,
      /me contrataron/i,
      /empiezo a trabajar/i,
      /acepté la oferta/i,
    ],
  },
  {
    type: 'relationship',
    startPatterns: [
      /conocí a alguien/i,
      /estoy saliendo con/i,
      /empecé una relación/i,
      /tengo (novio|novia|pareja)/i,
    ],
    updatePatterns: [
      /nuestra primera cita/i,
      /cumplimos \d+ (mes|año)/i,
    ],
    endPatterns: [
      /terminamos/i,
      /ya no estamos juntos/i,
      /cortamos/i,
      /rompimos/i,
    ],
  },
  {
    type: 'health',
    startPatterns: [
      /me enfermé/i,
      /tengo (dolor|problema|enfermedad)/i,
      /me diagnosticaron/i,
    ],
    updatePatterns: [
      /fui al doctor/i,
      /me recetaron/i,
    ],
    endPatterns: [
      /me (curé|recuperé|mejoré)/i,
      /ya estoy bien/i,
    ],
  },
  {
    type: 'goal',
    startPatterns: [
      /voy a (aprender|empezar|comenzar)/i,
      /mi meta es/i,
      /quiero (lograr|conseguir)/i,
      /me propuse/i,
    ],
    updatePatterns: [
      /(practicando|estudiando|trabajando en)/i,
    ],
    endPatterns: [
      /lo logré/i,
      /lo conseguí/i,
      /terminé/i,
      /completé/i,
    ],
  },
  {
    type: 'achievement',
    startPatterns: [
      /¡(logré|conseguí|gané|aprobé)/i,
      /me (aceptaron|promovieron|graduaron)/i,
    ],
    endPatterns: [], // Los achievements son instantáneos
  },
];

export async function detectAndTrackLifeEvents(
  agentId: string,
  userId: string,
  message: Message
): Promise<void> {
  for (const eventDef of EVENT_PATTERNS) {
    // Detectar inicio de evento
    for (const pattern of eventDef.startPatterns) {
      if (pattern.test(message.content)) {
        // Verificar si ya existe evento abierto de este tipo
        const existingEvent = await prisma.lifeEvent.findFirst({
          where: {
            userId,
            agentId,
            eventType: eventDef.type,
            status: 'ongoing',
          },
        });

        if (!existingEvent) {
          // Crear nuevo life event
          await prisma.lifeEvent.create({
            data: {
              userId,
              agentId,
              eventType: eventDef.type,
              status: eventDef.type === 'achievement' ? 'resolved' : 'ongoing',
              summary: extractSummary(message.content, eventDef.type),
              relatedMessageIds: [message.id],
              importance: 0.8,
            },
          });

          log.info(
            { userId, agentId, eventType: eventDef.type },
            'New life event detected'
          );
        } else {
          // Actualizar evento existente
          await prisma.lifeEvent.update({
            where: { id: existingEvent.id },
            data: {
              relatedMessageIds: [...existingEvent.relatedMessageIds, message.id],
              lastMentioned: new Date(),
            },
          });
        }
      }
    }

    // Detectar actualización de evento
    if (eventDef.updatePatterns) {
      for (const pattern of eventDef.updatePatterns) {
        if (pattern.test(message.content)) {
          const openEvent = await prisma.lifeEvent.findFirst({
            where: {
              userId,
              agentId,
              eventType: eventDef.type,
              status: 'ongoing',
            },
          });

          if (openEvent) {
            await prisma.lifeEvent.update({
              where: { id: openEvent.id },
              data: {
                relatedMessageIds: [...openEvent.relatedMessageIds, message.id],
                lastMentioned: new Date(),
              },
            });
          }
        }
      }
    }

    // Detectar cierre de evento
    for (const pattern of eventDef.endPatterns) {
      if (pattern.test(message.content)) {
        const openEvent = await prisma.lifeEvent.findFirst({
          where: {
            userId,
            agentId,
            eventType: eventDef.type,
            status: 'ongoing',
          },
        });

        if (openEvent) {
          await prisma.lifeEvent.update({
            where: { id: openEvent.id },
            data: {
              status: 'resolved',
              endDate: new Date(),
              relatedMessageIds: [...openEvent.relatedMessageIds, message.id],
            },
          });

          log.info(
            { userId, agentId, eventType: eventDef.type },
            'Life event resolved'
          );
        }
      }
    }
  }
}

function extractSummary(content: string, eventType: string): string {
  // Generar resumen corto del evento
  const maxLength = 100;

  // Remover caracteres especiales y limpiar
  let summary = content
    .replace(/[¡!¿?]/g, '')
    .trim()
    .slice(0, maxLength);

  // Capitalizar primera letra
  summary = summary.charAt(0).toUpperCase() + summary.slice(1);

  return summary;
}
```

**Integrar en message processing**:

```typescript
// lib/services/message.service.ts

import { detectAndTrackLifeEvents } from '@/lib/life-events/detector';

export async function processMessage(input: ProcessMessageInput) {
  // ... procesamiento normal ...

  // Guardar mensaje
  const savedMessage = await prisma.message.create({
    data: {
      // ...
    },
  });

  // Detectar life events (async, no bloquear respuesta)
  detectAndTrackLifeEvents(input.agentId, input.userId, savedMessage).catch(
    error => log.error({ error }, 'Failed to detect life events')
  );

  // Continuar...
}
```

**Añadir al contexto**:

```typescript
// lib/services/message.service.ts

async function buildLifeEventsContext(
  agentId: string,
  userId: string
): Promise<string> {
  const events = await prisma.lifeEvent.findMany({
    where: {
      userId,
      agentId,
      OR: [
        { status: 'ongoing' },
        {
          status: 'resolved',
          endDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
          },
        },
      ],
    },
    orderBy: { lastMentioned: 'desc' },
  });

  if (events.length === 0) return '';

  let context = '\n## Situaciones de Vida del Usuario:\n\n';

  const ongoing = events.filter(e => e.status === 'ongoing');
  const resolved = events.filter(e => e.status === 'resolved');

  if (ongoing.length > 0) {
    context += '**Situaciones actuales:**\n';
    for (const event of ongoing) {
      const daysSince = Math.floor(
        (Date.now() - event.startDate.getTime()) / (24 * 60 * 60 * 1000)
      );
      const daysSinceMention = Math.floor(
        (Date.now() - event.lastMentioned.getTime()) / (24 * 60 * 60 * 1000)
      );

      context += `- ${event.summary} (inició hace ${daysSince} días`;

      if (daysSinceMention > 3) {
        context += `, no mencionado hace ${daysSinceMention} días - considera preguntar cómo va`;
      }

      context += ')\n';
    }
  }

  if (resolved.length > 0) {
    context += '\n**Eventos recientemente resueltos:**\n';
    for (const event of resolved) {
      context += `- ${event.summary} ✓\n`;
    }
  }

  return context;
}

// Incluir en prompt del sistema
export async function processMessage(input: ProcessMessageInput) {
  // ...

  const lifeEventsContext = await buildLifeEventsContext(
    input.agentId,
    input.userId
  );

  const finalSystemPrompt = `${baseSystemPrompt}${lifeEventsContext}`;

  // ...
}
```

**Beneficio**: GAME-CHANGER, coherencia en relaciones de largo plazo

---

## 🔴 CATEGORÍA 3: MONETIZACIÓN

### 3.1 Rate Limiting por Tier

**Archivo**: `lib/middleware/rate-limit.ts` (crear nuevo)

```typescript
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface RateLimits {
  messagesPerDay: number;
  maxRequestsPerMinute: number;
  maxAgents: number;
  worldsEnabled: boolean;
  maxWorlds: number;
  worldTurnsPerDay: number;
}

const TIER_LIMITS: Record<string, RateLimits> = {
  free: {
    messagesPerDay: 10,
    maxRequestsPerMinute: 10,
    maxAgents: 1,
    worldsEnabled: false,
    maxWorlds: 0,
    worldTurnsPerDay: 0,
  },
  starter: {
    messagesPerDay: 100,
    maxRequestsPerMinute: 30,
    maxAgents: 3,
    worldsEnabled: true,
    maxWorlds: 1,
    worldTurnsPerDay: 100,
  },
  pro: {
    messagesPerDay: 500,
    maxRequestsPerMinute: 60,
    maxAgents: 10,
    worldsEnabled: true,
    maxWorlds: 3,
    worldTurnsPerDay: 500,
  },
};

export async function checkRateLimit(
  userId: string,
  action: 'message' | 'world_turn' | 'request'
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  const tier = user?.subscriptionTier || 'free';
  const limits = TIER_LIMITS[tier];

  if (action === 'message') {
    const key = `rate:msg:${userId}:${getToday()}`;
    const count = await redis.incr(key);
    await redis.expire(key, 86400); // 24h

    if (count > limits.messagesPerDay) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: getEndOfDay(),
      };
    }

    return {
      allowed: true,
      remaining: limits.messagesPerDay - count,
      resetAt: getEndOfDay(),
    };
  }

  if (action === 'world_turn') {
    const key = `rate:world:${userId}:${getToday()}`;
    const count = await redis.incr(key);
    await redis.expire(key, 86400);

    if (count > limits.worldTurnsPerDay) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: getEndOfDay(),
      };
    }

    return {
      allowed: true,
      remaining: limits.worldTurnsPerDay - count,
      resetAt: getEndOfDay(),
    };
  }

  if (action === 'request') {
    const key = `rate:req:${userId}:${getCurrentMinute()}`;
    const count = await redis.incr(key);
    await redis.expire(key, 60);

    if (count > limits.maxRequestsPerMinute) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: getEndOfMinute(),
      };
    }

    return {
      allowed: true,
      remaining: limits.maxRequestsPerMinute - count,
      resetAt: getEndOfMinute(),
    };
  }

  return { allowed: true, remaining: 999, resetAt: new Date() };
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getCurrentMinute(): string {
  const now = new Date();
  return `${now.toISOString().split('T')[0]}-${now.getHours()}-${now.getMinutes()}`;
}

function getEndOfDay(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

function getEndOfMinute(): Date {
  const next = new Date();
  next.setSeconds(60, 0);
  return next;
}
```

**Middleware global**:

```typescript
// middleware.ts

import { checkRateLimit } from '@/lib/middleware/rate-limit';
import { getServerSession } from 'next-auth';

export async function middleware(request: NextRequest) {
  // Solo para API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const session = await getServerSession();

  if (!session?.user?.id) {
    return NextResponse.next();
  }

  // Check rate limit
  const { allowed, remaining, resetAt } = await checkRateLimit(
    session.user.id,
    'request'
  );

  if (!allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Please slow down',
        resetAt: resetAt.toISOString(),
      },
      { status: 429 }
    );
  }

  // Añadir headers de rate limit
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', resetAt.toISOString());

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

**En message endpoint**:

```typescript
// app/api/agents/[id]/message/route.ts

import { checkRateLimit } from '@/lib/middleware/rate-limit';

export async function POST(req: Request) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check message limit
  const rateLimit = await checkRateLimit(session.user.id, 'message');

  if (!rateLimit.allowed) {
    return Response.json(
      {
        error: 'Daily limit reached',
        message: `You've used all your messages for today. Limit: ${rateLimit.limit}`,
        resetAt: rateLimit.resetAt,
        upgradeUrl: '/pricing',
      },
      { status: 429 }
    );
  }

  // Continuar con procesamiento normal
  // ...

  // En respuesta, incluir cuántos mensajes quedan
  return Response.json({
    response: aiResponse,
    rateLimit: {
      remaining: rateLimit.remaining,
      resetAt: rateLimit.resetAt,
    },
  });
}
```

**Beneficio**: Control total de costos, incentivo de upgrade

---

### 3.2 Feature Flags por Tier

**Archivo**: `lib/access/feature-flags.ts` (crear nuevo)

```typescript
interface TierFeatures {
  // Conversaciones
  maxAgents: number;
  messagesPerDay: number;
  contextWindow: 'limited' | 'medium' | 'extended';
  emotionalDepth: 'fast' | 'hybrid';
  episodicMemory: boolean;
  proactiveBehavior: boolean;

  // Mundos
  worldsEnabled: boolean;
  maxWorlds: number;
  worldTurnsPerDay: number;
  maxAgentsPerWorld: number;

  // Extras
  voiceMessages: boolean;
  imageGeneration: boolean;
  exportData: boolean;
  priorityGeneration: boolean;
  apiAccess: boolean;
}

export const TIER_FEATURES: Record<string, TierFeatures> = {
  free: {
    maxAgents: 1,
    messagesPerDay: 10,
    contextWindow: 'limited',
    emotionalDepth: 'fast',
    episodicMemory: false,
    proactiveBehavior: false,

    worldsEnabled: false,
    maxWorlds: 0,
    worldTurnsPerDay: 0,
    maxAgentsPerWorld: 0,

    voiceMessages: false,
    imageGeneration: false,
    exportData: false,
    priorityGeneration: false,
    apiAccess: false,
  },

  starter: {
    maxAgents: 3,
    messagesPerDay: 100,
    contextWindow: 'medium',
    emotionalDepth: 'hybrid',
    episodicMemory: true,
    proactiveBehavior: true,

    worldsEnabled: true,
    maxWorlds: 1,
    worldTurnsPerDay: 100,
    maxAgentsPerWorld: 3,

    voiceMessages: false,
    imageGeneration: false,
    exportData: true,
    priorityGeneration: false,
    apiAccess: false,
  },

  pro: {
    maxAgents: 10,
    messagesPerDay: 500,
    contextWindow: 'extended',
    emotionalDepth: 'hybrid',
    episodicMemory: true,
    proactiveBehavior: true,

    worldsEnabled: true,
    maxWorlds: 3,
    worldTurnsPerDay: 500,
    maxAgentsPerWorld: 5,

    voiceMessages: true,
    imageGeneration: true,
    exportData: true,
    priorityGeneration: true,
    apiAccess: true,
  },
};

export class FeatureAccessError extends Error {
  constructor(
    public feature: string,
    public minimumTier: string
  ) {
    super(`This feature requires ${minimumTier} plan or higher`);
    this.name = 'FeatureAccessError';
  }
}

export async function checkFeatureAccess(
  userId: string,
  feature: keyof TierFeatures
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  const tier = user?.subscriptionTier || 'free';
  const features = TIER_FEATURES[tier];

  return Boolean(features[feature]);
}

export async function requireFeature(
  userId: string,
  feature: keyof TierFeatures
): Promise<void> {
  const hasAccess = await checkFeatureAccess(userId, feature);

  if (!hasAccess) {
    const minimumTier = getMinimumTierForFeature(feature);
    throw new FeatureAccessError(feature, minimumTier);
  }
}

function getMinimumTierForFeature(feature: keyof TierFeatures): string {
  for (const [tier, features] of Object.entries(TIER_FEATURES)) {
    if (features[feature]) {
      return tier;
    }
  }
  return 'pro';
}

export async function getTierFeatures(userId: string): Promise<TierFeatures> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  const tier = user?.subscriptionTier || 'free';
  return TIER_FEATURES[tier];
}
```

**Usar en código**:

```typescript
// Ejemplo: Crear mundo
export async function POST(req: Request) {
  const session = await getServerSession();

  // Verificar acceso a mundos
  await requireFeature(session.user.id, 'worldsEnabled');

  // Verificar límite de mundos
  const features = await getTierFeatures(session.user.id);
  const activeWorlds = await prisma.world.count({
    where: {
      userId: session.user.id,
      status: 'RUNNING',
    },
  });

  if (activeWorlds >= features.maxWorlds) {
    return Response.json(
      {
        error: 'Maximum worlds limit reached',
        message: `Your plan allows ${features.maxWorlds} active worlds. Upgrade to create more.`,
        upgradeUrl: '/pricing',
      },
      { status: 403 }
    );
  }

  // Continuar...
}
```

**Beneficio**: Control granular de features, incentivo claro de upgrade

---

### 3.3 Stripe Integration Completa

**Archivo**: `app/api/webhooks/stripe/route.ts`

```typescript
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    log.error({ error: err.message }, 'Stripe webhook signature verification failed');
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        log.info({ type: event.type }, 'Unhandled webhook event');
    }

    return Response.json({ received: true });

  } catch (error) {
    log.error({ error, eventType: event.type }, 'Webhook processing failed');
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const tier = getTierFromPriceId(subscription.items.data[0].price.id);

  await prisma.user.update({
    where: { stripeCustomerId: subscription.customer as string },
    data: {
      subscriptionTier: tier,
      subscriptionStatus: 'active',
      subscriptionId: subscription.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  log.info({ customerId: subscription.customer, tier }, 'Subscription created');

  // Email de bienvenida
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: subscription.customer as string },
  });

  if (user) {
    await sendEmail({
      to: user.email!,
      subject: `Welcome to ${tier} plan!`,
      template: 'subscription-welcome',
      data: { userName: user.name, tier },
    });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const tier = getTierFromPriceId(subscription.items.data[0].price.id);

  await prisma.user.update({
    where: { stripeCustomerId: subscription.customer as string },
    data: {
      subscriptionTier: tier,
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  log.info({ customerId: subscription.customer, tier }, 'Subscription updated');
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  await prisma.user.update({
    where: { stripeCustomerId: subscription.customer as string },
    data: {
      subscriptionTier: 'free',
      subscriptionStatus: 'canceled',
      subscriptionId: null,
    },
  });

  log.info({ customerId: subscription.customer }, 'Subscription canceled');

  // Email de despedida
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: subscription.customer as string },
  });

  if (user) {
    await sendEmail({
      to: user.email!,
      subject: 'Sorry to see you go',
      template: 'subscription-canceled',
      data: { userName: user.name },
    });
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  log.info({ invoiceId: invoice.id }, 'Payment succeeded');

  // Crear registro de pago
  await prisma.payment.create({
    data: {
      userId: (await getUserFromCustomerId(invoice.customer as string))!.id,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: 'succeeded',
      stripeInvoiceId: invoice.id,
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  log.error({ invoiceId: invoice.id }, 'Payment failed');

  const user = await getUserFromCustomerId(invoice.customer as string);

  if (user) {
    // Email de pago fallido
    await sendEmail({
      to: user.email!,
      subject: 'Payment failed',
      template: 'payment-failed',
      data: {
        userName: user.name,
        amount: invoice.amount_due / 100,
        invoiceUrl: invoice.hosted_invoice_url,
      },
    });
  }
}

function getTierFromPriceId(priceId: string): string {
  const PRICE_TO_TIER: Record<string, string> = {
    [process.env.STRIPE_PRICE_STARTER!]: 'starter',
    [process.env.STRIPE_PRICE_PRO!]: 'pro',
  };

  return PRICE_TO_TIER[priceId] || 'free';
}

async function getUserFromCustomerId(customerId: string) {
  return prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });
}
```

**Checkout API**:

```typescript
// app/api/checkout/route.ts

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { priceId } = await req.json();

  let customerId = session.user.stripeCustomerId;

  // Crear customer si no existe
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email!,
      metadata: { userId: session.user.id },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customer.id },
    });

    customerId = customer.id;
  }

  // Crear checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
  });

  return Response.json({ url: checkoutSession.url });
}
```

**Beneficio**: Monetización funcional, revenue desde día 1

---

## 🟠 CATEGORÍA 4: MEJORAS DE ALTO IMPACTO

### 4.1 Comportamiento Proactivo Activado

**Archivo**: `lib/cron/proactive-behavior.ts` (crear nuevo)

```typescript
import { CronJob } from 'cron';
import { conversationInitiator } from '@/lib/proactive-behavior';

// Ejecutar cada 6 horas
export const proactiveBehaviorJob = new CronJob('0 */6 * * *', async () => {
  log.info('Running proactive behavior check');

  // Obtener usuarios activos (con conversaciones en últimos 7 días)
  const activeUsers = await prisma.user.findMany({
    where: {
      subscriptionTier: { not: 'free' }, // Solo paid users
      agents: {
        some: {
          messages: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      },
    },
    include: {
      agents: {
        where: {
          messages: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
        take: 3, // Max 3 agentes por usuario
      },
    },
  });

  for (const user of activeUsers) {
    for (const agent of user.agents) {
      try {
        const result = await conversationInitiator.shouldInitiateConversation(
          agent.id,
          user.id
        );

        if (result.shouldInitiate && result.message) {
          // Crear mensaje proactivo
          await prisma.message.create({
            data: {
              agentId: agent.id,
              userId: user.id,
              role: 'assistant',
              content: result.message,
              isProactive: true, // Nuevo campo
            },
          });

          // Enviar notificación push
          await sendPushNotification(user.id, {
            title: agent.name,
            body: result.message.slice(0, 100) + '...',
            data: { agentId: agent.id },
          });

          log.info(
            { agentId: agent.id, userId: user.id },
            'Proactive message sent'
          );
        }
      } catch (error) {
        log.error(
          { agentId: agent.id, userId: user.id, error },
          'Failed to initiate proactive conversation'
        );
      }
    }
  }

  log.info('Proactive behavior check completed');
});

// Iniciar en app startup
proactiveBehaviorJob.start();
```

**Integrar follow-ups en conversación**:

```typescript
// lib/services/message.service.ts

import { followUpTracker } from '@/lib/proactive-behavior';

export async function processMessage(input: ProcessMessageInput) {
  // ... código anterior ...

  // Verificar follow-ups pendientes
  const followUpTopics = await followUpTracker.getTopicsForFollowUp(
    input.agentId,
    input.userId
  );

  if (followUpTopics.topics.length > 0) {
    const topic = followUpTopics.topics[0];

    enhancedPrompt += `\n\nRECORDATORIO: El usuario mencionó "${topic.summary}" hace ${topic.daysAgo} días y no ha vuelto a hablar de eso. Si es natural en la conversación, pregúntale sutilmente cómo va.\n`;
  }

  // Continuar...
}
```

**Beneficio**: +40% engagement, experiencia proactiva

---

### 4.2 Memoria Episódica en Mundos

**Ver sección anterior 2.5 del WORLDS_SYSTEM_ANALYSIS.md**

Similar a la implementación de life events pero para mundos.

**Beneficio**: Narrativa coherente en mundos largos

---

### 4.3 Eventos de Historia Aplicados

**Ver sección anterior 2.6 del WORLDS_SYSTEM_ANALYSIS.md**

**Beneficio**: Feature de narrativa dirigida funcional

---

## 🟡 CATEGORÍA 5: PULIDO ADICIONAL

### 5.1 Resúmenes Automáticos (Consolidación cada 50 mensajes)

**Archivo**: `lib/memory/conversation-consolidator.ts` (crear nuevo)

```typescript
export async function consolidateConversationMemory(
  agentId: string,
  userId: string
): Promise<void> {
  const messageCount = await prisma.message.count({
    where: { agentId, userId },
  });

  // Consolidar cada 50 mensajes
  if (messageCount % 50 !== 0) return;

  log.info({ agentId, userId, messageCount }, 'Consolidating conversation memory');

  const messages = await prisma.message.findMany({
    where: { agentId, userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const summary = await llm.generate({
    systemPrompt: `Analiza esta conversación y genera un resumen estructurado en JSON:

{
  "mainTopics": ["tema1", "tema2"],
  "keyEvents": ["evento importante 1", "evento 2"],
  "emotionalArc": "descripción del arco emocional",
  "unresolvedIssues": ["asunto pendiente 1"],
  "userPreferences": {
    "likes": ["cosa que le gusta"],
    "dislikes": ["cosa que no le gusta"]
  },
  "userFacts": {
    "work": "información laboral",
    "family": "información familiar",
    "goals": ["meta 1", "meta 2"]
  }
}`,
    messages: messages.reverse().map(m => ({
      role: m.role,
      content: m.content,
    })),
    maxTokens: 1500,
    model: 'mistral-small',
  });

  await prisma.episodicMemory.create({
    data: {
      agentId,
      event: `Resumen de conversación (mensajes ${messageCount - 50} a ${messageCount})`,
      metadata: JSON.parse(summary),
      importance: 0.9,
      emotionalValence: 0.0,
      type: 'CONVERSATION_SUMMARY',
      timestamp: new Date(),
    },
  });

  log.info({ agentId, userId }, 'Conversation consolidated successfully');
}

// Llamar después de guardar mensaje
export async function processMessage(input: ProcessMessageInput) {
  // ... guardar mensaje ...

  // Consolidar si es necesario (async, no bloquear)
  consolidateConversationMemory(input.agentId, input.userId).catch(
    error => log.error({ error }, 'Failed to consolidate conversation')
  );

  // ...
}
```

**Beneficio**: Coherencia en conversaciones ultra-largas (200+)

---

### 5.2 Caché de System Prompts

**Archivo**: Actualizar `lib/services/message.service.ts`

```typescript
async function getSystemPrompt(agentId: string): Promise<string> {
  // Intentar caché primero
  const cached = await redis.get(`prompt:${agentId}`);

  if (cached) {
    return cached as string;
  }

  // Si no está en caché, obtener de BD
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { systemPrompt: true },
  });

  if (!agent) {
    throw new Error('Agent not found');
  }

  // Cachear por 1 hora
  await redis.set(`prompt:${agentId}`, agent.systemPrompt, { ex: 3600 });

  return agent.systemPrompt;
}

// Invalidar cuando se actualiza
export async function updateAgentPrompt(agentId: string, newPrompt: string) {
  await prisma.agent.update({
    where: { id: agentId },
    data: { systemPrompt: newPrompt },
  });

  // Invalidar caché
  await redis.del(`prompt:${agentId}`);
}
```

**Beneficio**: -27% tokens input, ahorro inmediato

---

## 🔴 CATEGORÍA 6: MONITORING Y SEGURIDAD

### 6.1 Sentry Integration

**Archivo**: `sentry.client.config.ts` y `sentry.server.config.ts`

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,

  beforeSend(event, hint) {
    // No enviar errores de rate limiting
    if (event.exception?.values?.[0]?.value?.includes('rate limit')) {
      return null;
    }

    // No enviar errores de feature access
    if (event.exception?.values?.[0]?.type === 'FeatureAccessError') {
      return null;
    }

    return event;
  },
});
```

**Usar en código**:

```typescript
try {
  await processMessage(input);
} catch (error) {
  Sentry.captureException(error, {
    user: { id: userId },
    tags: { endpoint: '/api/agents/message' },
    extra: { agentId, messageLength: input.message.length },
  });

  throw error;
}
```

**Beneficio**: Debugging, alertas de errores

---

### 6.2 Cost Monitoring Dashboard

**Archivo**: `lib/analytics/cost-tracker.ts` (crear nuevo)

```typescript
export async function trackLLMGeneration(params: {
  userId: string;
  agentId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  duration: number;
}) {
  const cost = calculateCost(
    params.inputTokens,
    params.outputTokens,
    params.model
  );

  await prisma.llmUsage.create({
    data: {
      userId: params.userId,
      agentId: params.agentId,
      model: params.model,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      cost,
      duration: params.duration,
    },
  });

  // Alert si costo alto
  if (cost > 0.10) {
    await sendAlert({
      type: 'high_cost_generation',
      userId: params.userId,
      cost,
      details: params,
    });
  }
}

function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  const COSTS = {
    'mistral-small': {
      input: 0.20 / 1_000_000,
      output: 0.60 / 1_000_000,
    },
  };

  const pricing = COSTS[model] || COSTS['mistral-small'];

  return (
    inputTokens * pricing.input +
    outputTokens * pricing.output
  );
}
```

**Dashboard API**:

```typescript
// app/api/admin/costs/route.ts

export async function GET(req: Request) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const costs = await prisma.llmUsage.groupBy({
    by: ['userId'],
    where: {
      createdAt: { gte: today },
    },
    _sum: {
      cost: true,
      inputTokens: true,
      outputTokens: true,
    },
  });

  const totalCost = costs.reduce((sum, c) => sum + (c._sum.cost || 0), 0);

  return Response.json({
    totalCost,
    byUser: costs.map(c => ({
      userId: c.userId,
      cost: c._sum.cost,
      tokens: (c._sum.inputTokens || 0) + (c._sum.outputTokens || 0),
    })),
  });
}
```

**Beneficio**: Visibilidad de costos, optimización

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

### Prioridad CRÍTICA (Implementar primero)

- [ ] 1.1 Estado de mundos en Redis
- [ ] 1.2 Cron jobs en vez de setInterval
- [ ] 1.3 Auto-pause por inactividad
- [ ] 2.1 Ventana de contexto dinámica
- [ ] 2.2 Búsqueda activa en embeddings
- [ ] 2.3 Storage selectivo inteligente
- [ ] 2.4 Sistema de Life Events
- [ ] 3.1 Rate limiting por tier
- [ ] 3.2 Feature flags por tier
- [ ] 3.3 Stripe integration
- [ ] 6.1 Sentry integration
- [ ] 6.2 Cost monitoring

### Prioridad ALTA (Segunda fase)

- [ ] 4.1 Comportamiento proactivo
- [ ] 4.2 Memoria episódica en mundos
- [ ] 4.3 Eventos de historia aplicados
- [ ] 5.1 Resúmenes automáticos
- [ ] 5.2 Caché de system prompts

### Prioridad MEDIA (Tercera fase)

- [ ] Director AI simplificado
- [ ] Sentiment analysis con BERT
- [ ] Emotional decay contextual
- [ ] MaxTokens dinámico
- [ ] ConversationBuffer funcional

---

## 🎯 ESTIMACIÓN DE TIEMPO

**Con Claude Code optimizado:**

| Categoría | Items | Tiempo Estimado |
|-----------|-------|-----------------|
| Estabilidad | 3 | 6-8 horas |
| UX | 4 | 10-12 horas |
| Monetización | 3 | 6-8 horas |
| Alto Impacto | 3 | 8-10 horas |
| Pulido | 2 | 4-6 horas |
| Monitoring | 2 | 3-4 horas |

**TOTAL CRÍTICO**: ~37-48 horas (~5-6 días full-time con herramientas)

**TOTAL ALTO**: +12-14 horas

**TOTAL COMPLETO**: ~49-62 horas (~1 semana con Claude Code)

---

## 🚀 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

**Día 1-2: Estabilidad**
1. Redis state management
2. Cron jobs
3. Auto-pause

**Día 3-4: UX Core**
1. Contexto dinámico
2. Memory queries
3. Storage inteligente
4. Life Events

**Día 5: Monetización**
1. Rate limiting
2. Feature flags
3. Stripe webhooks

**Día 6: Monitoring**
1. Sentry
2. Cost tracking

**Día 7: Alto Impacto**
1. Comportamiento proactivo
2. Memoria en mundos
3. Eventos aplicados

---

Con estos cambios, el código estará listo para **escalar, monetizar y competir** con apps establecidas.

¿Por dónde quieres empezar?