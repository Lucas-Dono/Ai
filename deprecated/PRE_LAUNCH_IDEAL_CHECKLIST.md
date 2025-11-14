# CHECKLIST PRE-LAUNCH IDEAL (Sin Límite de Tiempo)

> **Objetivo**: Lanzar con producto pulido, escalable y sin riesgos mayores
> **Filosofía**: "Hazlo bien la primera vez"
> **Fecha**: 2025-10-31

---

## FILOSOFÍA DE ESTE PLAN

**No es MVP minimalista, es MLP (Minimum Lovable Product)**

Razones para implementar TODO antes de lanzar:
1. ✅ **Primera impresión única** - Los usuarios juzgan en minutos
2. ✅ **Evitar deuda técnica** - Refactorizar con usuarios es doloroso
3. ✅ **Costos controlados** - Sin sorpresas financieras
4. ✅ **Escalabilidad desde día 1** - No crashear con 1000 usuarios
5. ✅ **Diferenciación clara** - Features que compiten con apps establecidas

---

## CATEGORÍAS DE IMPLEMENTACIÓN

### 🔴 CRÍTICO - No lanzar sin esto
**Impacto**: Bloquea lanzamiento, causa crashes o pérdidas financieras

### 🟠 ALTO - Importante para buena experiencia
**Impacto**: Sin esto, la experiencia es mediocre vs competencia

### 🟡 MEDIO - Nice to have, diferenciador
**Impacto**: Sin esto, funciona pero pierde diferenciadores

### 🟢 BAJO - Post-launch está bien
**Impacto**: Pulido adicional, puede esperar

---

## 1. SISTEMA EMOCIONAL Y MEMORIA

### 🔴 CRÍTICO

#### 1.1 Ventana de Contexto Dinámica
**Problema actual**: Solo 10 mensajes, pierde coherencia
**Implementar**: Sistema basado en tokens (no número fijo)

```typescript
// lib/services/message.service.ts
const MAX_CONTEXT_TOKENS = {
  free: 2000,      // ~15 mensajes
  starter: 4000,   // ~30 mensajes
  pro: 8000,       // ~60 mensajes
};

// Llenar hasta límite de tokens
let currentTokens = 0;
const contextMessages = [];

for (const msg of allRecentMessages.reverse()) {
  const tokens = estimateTokens(msg.content);
  if (currentTokens + tokens > MAX_CONTEXT_TOKENS[tier]) break;
  contextMessages.push(msg);
  currentTokens += tokens;
}
```

**Por qué es crítico**:
- Sin esto: Conversaciones >15 mensajes pierden coherencia
- Usuarios frustrados: "Ya te lo dije hace 20 mensajes"
- Diferenciador clave vs Character.AI

**Tiempo**: 6-8 horas
**Complejidad**: Media

---

#### 1.2 Búsqueda Activa en Embeddings (Memory Queries)
**Problema actual**: Embeddings existen pero no se buscan cuando usuario pregunta

```typescript
// Detectar queries de memoria
const MEMORY_QUERY_PATTERNS = [
  /¿?te (conté|dije|mencioné) (sobre|de|que)/i,
  /¿?recuerdas (cuando|que|lo que)/i,
  /¿?qué te (había|he) (contado|dicho)/i,
];

// Si detecta query, buscar en embeddings ANTES de generar
if (isMemoryQuery) {
  const relevantMemories = await searchEmbeddings(userMessage, {
    limit: 5,
    minSimilarity: 0.6,
  });

  // Inyectar en prompt
  enhancedPrompt += `\n## INFORMACIÓN RECORDADA:\n${formatMemories(relevantMemories)}`;
}
```

**Por qué es crítico**:
- Sin esto: Feature de memoria parece no funcionar
- Usuario: "¿Para qué sirve la memoria si no recuerda?"
- Credibilidad del sistema emocional

**Tiempo**: 6-8 horas
**Complejidad**: Media

---

#### 1.3 Storage Selectivo Inteligente (Multi-Factor)
**Problema actual**: Solo 5% de mensajes se guardan (patrones muy limitados)

```typescript
// Sistema de scoring multi-factor
function calculateMessageImportance(content, metadata) {
  let score = 0;

  // Factor 1: Longitud
  if (content.length > 200) score += 0.3;

  // Factor 2: Entidades nombradas (NER simple)
  const entities = extractNamedEntities(content);
  if (entities.length > 0) score += 0.4;

  // Factor 3: Palabras clave semánticas
  const semanticMatch = matchSemanticPatterns(content);
  if (semanticMatch) score += 0.5;

  // Factor 4: Referencias temporales
  if (/\b(mañana|ayer|próximo|hace)\b/i.test(content)) {
    score += 0.2;
  }

  // Factor 5: Intensidad emocional
  if (metadata.emotions?.intensity > 0.7) score += 0.3;

  return { score: Math.min(1.0, score), shouldStore: score > 0.5 };
}
```

**Por qué es crítico**:
- Sin esto: Sistema olvida info importante que no coincide con patrones
- Ejemplos perdidos: "Estoy aprendiendo japonés", "Mi mejor amiga se mudó"
- Memoria aparenta ser superficial

**Tiempo**: 8-10 horas
**Complejidad**: Media-Alta

---

#### 1.4 Sistema de Life Events (Timeline Automático)
**Problema actual**: No trackea arcos narrativos de largo plazo

```typescript
interface LifeEvent {
  id: string;
  userId: string;
  agentId: string;
  eventType: 'job_search' | 'relationship' | 'health' | 'goal' | 'achievement';
  status: 'ongoing' | 'resolved' | 'archived';
  summary: string;
  startDate: Date;
  endDate?: Date;
  relatedMessageIds: string[];
  importance: number;
}

// Detector automático
const EVENT_PATTERNS = [
  {
    type: 'job_search',
    startPatterns: [/busco trabajo/i, /enviando CVs/i],
    endPatterns: [/conseguí (el|un) trabajo/i],
  },
  // ... más tipos
];

// Integrar en contexto
function buildLifeEventsContext(events) {
  const ongoing = events.filter(e => e.status === 'ongoing');

  let context = '\n## Situaciones Actuales del Usuario:\n';
  for (const event of ongoing) {
    const daysSince = daysBetween(event.startDate, new Date());
    context += `- ${event.summary} (hace ${daysSince} días)\n`;
  }

  return context;
}
```

**Por qué es crítico**:
- Sin esto: IA pregunta "¿Cómo va tu búsqueda de trabajo?" después de que usuario dijo "¡Conseguí el trabajo!"
- Diferenciador CLAVE: Ninguna app hace esto bien
- Relaciones de largo plazo parecen incoherentes

**Tiempo**: 12-16 horas
**Complejidad**: Alta

---

### 🟠 ALTO

#### 1.5 Comportamiento Proactivo Activado
**Problema actual**: Código existe pero nunca se ejecuta

```typescript
// Cron job para iniciación proactiva
import { CronJob } from 'cron';

// Cada 6 horas, verificar si debe iniciar conversación
new CronJob('0 */6 * * *', async () => {
  const activeUsers = await getActiveUsers();

  for (const { agentId, userId } of activeUsers) {
    const result = await conversationInitiator.shouldInitiateConversation(
      agentId,
      userId
    );

    if (result.shouldInitiate && result.message) {
      await createProactiveMessage(agentId, userId, result.message);
      await sendPushNotification(userId, {
        title: agent.name,
        body: result.message.slice(0, 100),
      });
    }
  }
});

// Follow-ups en conversación
async function processMessage(input) {
  // Verificar si hay follow-ups pendientes
  const followUp = await followUpTracker.getTopicsForFollowUp(agentId, userId);

  if (followUp.topics.length > 0) {
    const topic = followUp.topics[0];
    enhancedPrompt += `\n\nRECORDATORIO: El usuario mencionó "${topic.summary}" hace ${topic.daysAgo} días. Pregúntale sutilmente cómo va.\n`;
  }
}
```

**Por qué es alto**:
- Sin esto: IA nunca inicia, experiencia pasiva
- Diferenciador vs competencia (Replika hace esto)
- Engagement: +40% session frequency

**Tiempo**: 8-10 horas
**Complejidad**: Media

---

#### 1.6 RAG Mejorado con Priorización
**Problema actual**: RAG básico, no prioriza bien

```typescript
async function buildContextWithHybridRetrieval(userMessage, recentMessages, agentId, userId) {
  // 1. Contexto inmediato (siempre)
  const immediateContext = formatRecentMessages(recentMessages);

  // 2. RAG semántico (memorias relevantes antiguas)
  const ragResults = await semanticSearch(userMessage, agentId, userId, {
    limit: 5,
    timeWindow: 'beyond_recent', // Solo fuera de ventana reciente
    minSimilarity: 0.7,
    boostFactualInfo: true, // Priorizar hechos sobre opiniones
  });

  // 3. Hechos estructurados (nombre, trabajo, familia)
  const userFacts = await getStructuredUserFacts(agentId, userId);

  // 4. Deduplicar y rankear
  const memories = deduplicateAndRank(ragResults, recentMessages);

  return {
    immediate: immediateContext,
    facts: userFacts,
    memories: memories,
  };
}
```

**Por qué es alto**:
- Sin esto: RAG da resultados irrelevantes o duplicados
- Credibilidad: Usuario nota cuando memoria es errática
- Performance: Búsquedas lentas

**Tiempo**: 10-12 horas
**Complejidad**: Alta

---

#### 1.7 Resúmenes Automáticos (Consolidación cada 50 mensajes)
**Problema actual**: Conversaciones 200+ pierden track de narrativa completa

```typescript
async function consolidateConversationMemory(agentId, userId) {
  const messageCount = await getMessageCount(agentId, userId);

  // Cada 50 mensajes, consolidar
  if (messageCount % 50 === 0) {
    const messages = await getMessages(agentId, userId, 50);

    // Generar resumen estructurado
    const summary = await llm.generate({
      systemPrompt: `Genera resumen JSON de esta conversación:
{
  "mainTopics": ["tema1", "tema2"],
  "keyEvents": ["evento importante"],
  "emotionalArc": "descripción",
  "unresolvedIssues": ["pendiente"],
  "userFacts": {
    "work": "",
    "family": "",
    "goals": []
  }
}`,
      messages: formatMessagesForSummary(messages),
      maxTokens: 1500,
    });

    // Guardar como EpisodicMemory con alta importancia
    await prisma.episodicMemory.create({
      data: {
        agentId,
        event: `Resumen conversación (msg ${messageCount-50} a ${messageCount})`,
        metadata: JSON.parse(summary),
        importance: 0.9,
        type: 'CONVERSATION_SUMMARY',
      },
    });
  }
}
```

**Por qué es alto**:
- Sin esto: Conversaciones ultra-largas (200+) pierden coherencia
- Para power users: Feature crítica
- Costo: Solo $0.01 cada 50 mensajes (mínimo)

**Tiempo**: 8-10 horas
**Complejidad**: Media-Alta

---

### 🟡 MEDIO

#### 1.8 Emotional Decay con Contexto Temporal
**Problema actual**: Emociones decaen igual sin importar relación

```typescript
function calculateEmotionalDecayWithMemory(
  currentEmotions,
  baselineEmotions,
  timeSinceLastInteraction, // horas
  relationship
) {
  // Decay rate variable según tiempo
  let decayRate = 0.1;
  if (timeSinceLastInteraction > 24) decayRate = 0.05;
  if (timeSinceLastInteraction > 168) decayRate = 0.02; // >1 semana

  // Floor emocional según nivel de relación
  const emotionalFloor = calculateEmotionalFloor(relationship);

  for (const [emotion, intensity] of Object.entries(currentEmotions)) {
    const baseline = baselineEmotions[emotion];
    const floor = emotionalFloor[emotion];
    const target = Math.max(baseline, floor);

    const decay = Math.exp(-decayRate * timeSinceLastInteraction);
    updated[emotion] = intensity * decay + target * (1 - decay);
  }

  return updated;
}
```

**Por qué es medio**:
- Sin esto: Emociones resetean después de inactividad
- Afecta: Usuarios que regresan después de días
- Impacto: Continuidad emocional

**Tiempo**: 4-6 horas
**Complejidad**: Media

---

#### 1.9 Complexity Analyzer Calibrado
**Problema actual**: Threshold 0.5 mal ajustado, mensajes complejos van por fast path

```typescript
// Ajustar threshold
const COMPLEXITY_THRESHOLD = 0.4; // Era: 0.5

// Patrones que fuerzan Deep Path
const FORCE_DEEP_PATTERNS = [
  /¿(qué debería|cómo debería|qué hago)/i,
  /me siento (confundid|perdid|mal|trist)/i,
  /(problema|crisis|ayuda|necesito)/i,
];

function analyzeComplexity(message, role) {
  // Verificar forzados primero
  for (const pattern of FORCE_DEEP_PATTERNS) {
    if (pattern.test(message)) {
      return {
        complexity: 'complex',
        score: 1.0,
        recommendedPath: 'deep',
      };
    }
  }

  // Scoring normal con pesos ajustados
  // ...
}
```

**Por qué es medio**:
- Sin esto: Respuestas superficiales en situaciones emocionales
- Afecta: Calidad percibida del sistema emocional
- Costo: Mínimo (+5% deep path)

**Tiempo**: 2-3 horas
**Complejidad**: Baja

---

#### 1.10 MaxTokens Dinámico
**Problema actual**: 1000 tokens fijo, respuestas largas se truncan

```typescript
function estimateRequiredTokens(userMessage, conversationContext) {
  let baseTokens = 1000;

  // Si usuario escribió mucho, permitir respuesta proporcional
  const userTokens = estimateTokens(userMessage);
  if (userTokens > 200) {
    baseTokens = Math.min(2000, userTokens * 1.5);
  }

  // Patrones narrativos
  if (/cuéntame|explícame|háblame/i.test(userMessage)) {
    baseTokens = 1500;
  }

  // Respuestas cortas
  if (/^(sí|no|ok|vale)$/i.test(userMessage)) {
    baseTokens = 500;
  }

  return baseTokens;
}
```

**Por qué es medio**:
- Sin esto: Respuestas narrativas se cortan abruptamente
- Afecta: Experiencia en conversaciones profundas
- Costo: +$0.02/día por usuario activo

**Tiempo**: 2-3 horas
**Complejidad**: Baja

---

#### 1.11 ConversationBuffer Funcional
**Problema actual**: Existe en DB pero no se usa

```typescript
interface ConversationBufferEntry {
  messageId: string;
  role: 'user' | 'assistant';
  summary: string;
  topics: string[];
  timestamp: Date;
  importance: number;
}

class ConversationBufferManager {
  async updateBuffer(agentId, message, topics) {
    const buffer = await this.getBuffer(agentId);

    buffer.push({
      messageId: message.id,
      summary: await this.summarizeMessage(message.content),
      topics,
      timestamp: message.createdAt,
      importance: this.calculateImportance(message),
    });

    // Mantener últimos 20
    const trimmed = buffer.slice(-20);

    // Detectar temas recurrentes
    const activeTopics = this.analyzeTopicFrequency(trimmed);

    await prisma.internalState.update({
      where: { agentId },
      data: {
        conversationBuffer: trimmed,
        activeGoals: activeTopics,
      },
    });
  }
}
```

**Por qué es medio**:
- Sin esto: No hay working memory de corto plazo
- Afecta: Tracking de temas en curso
- Diferenciador: Sutil pero útil

**Tiempo**: 4-6 horas
**Complejidad**: Media

---

#### 1.12 Optimización de Knowledge Commands
**Problema actual**: Doble LLM call (proactive + interception)

```typescript
// Eliminar command interception, mejorar proactive
async function enhanceProactiveDetection(userMessage, agentId) {
  // 1. Embedding similarity (ya existe)
  const semanticMatches = await getTopRelevantCommand(userMessage, agentId);

  // 2. Regex patterns para casos obvios
  const patterns = {
    interests: /¿?(qué te gusta|tus gustos|hobbies)/i,
    work: /¿?(a qué te dedicas|tu trabajo)/i,
    family: /¿?(tu familia|tus padres|hermanos)/i,
  };

  const regexMatches = [];
  for (const [cmd, pattern] of Object.entries(patterns)) {
    if (pattern.test(userMessage)) regexMatches.push(cmd);
  }

  // 3. Combinar y deduplicar
  return [...new Set([...semanticMatches, ...regexMatches])];
}

// Resultado: UN solo LLM call con todo cargado
```

**Por qué es medio**:
- Sin esto: 2x latencia y 2x costo en algunos casos
- Afecta: Performance y UX
- Ahorro: ~$0.05/día total

**Tiempo**: 3-4 horas
**Complejidad**: Baja

---

## 2. SISTEMA DE MUNDOS

### 🔴 CRÍTICO

#### 2.1 Estado Persistente en Redis
**Problema actual**: Estado en memoria, se pierde al reiniciar

```typescript
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

  currentEmergentEvent: EmergentEvent | null;
}

class WorldSimulationEngine {
  async startSimulation(worldId: string) {
    // Lock distribuido
    const lock = await redis.lock(`world:${worldId}:lock`, 5000);

    try {
      const state = await this.getWorldState(worldId);
      if (state?.isRunning) {
        throw new Error('World already running');
      }

      // Actualizar BD Y Redis atómicamente
      await prisma.$transaction(async (tx) => {
        await tx.world.update({
          where: { id: worldId },
          data: { status: 'RUNNING' },
        });

        await this.setWorldState(worldId, {
          isRunning: true,
          lastTurnAt: new Date(),
          // ...
        });
      });

      await this.scheduleTurns(worldId);

    } finally {
      await lock.unlock();
    }
  }
}
```

**Por qué es crítico**:
- Sin esto: 15% crash rate
- Usuarios pierden mundos al reiniciar servidor
- Race conditions causan duplicación
- Credibilidad: "La app crashea mucho"

**Tiempo**: 10-14 horas
**Complejidad**: Alta

---

#### 2.2 Cron Jobs en vez de setInterval
**Problema actual**: Memory leaks, intervalos huérfanos

```typescript
import { CronJob } from 'cron';

class WorldSimulationEngine {
  private cronJobs: Map<string, CronJob> = new Map();

  async startSimulation(worldId: string) {
    const world = await prisma.world.findUnique({ where: { id: worldId } });

    // Calcular cron expression
    const delaySeconds = Math.floor(world.interactionDelay / 1000);
    const cronExpression = `*/${delaySeconds} * * * * *`;

    const job = new CronJob(cronExpression, async () => {
      try {
        await this.executeSimulationTurn(worldId);
      } catch (error) {
        // Auto-stop después de 3 errores
        const errorCount = await this.incrementErrorCount(worldId);
        if (errorCount >= 3) {
          await this.stopSimulation(worldId);
        }
      }
    });

    job.start();
    this.cronJobs.set(worldId, job);

    // Persistir en Redis
    await redis.set(`world:cronjob:${worldId}`, JSON.stringify({
      worldId,
      cronExpression,
      startedAt: new Date(),
    }));
  }

  // Recovery después de restart
  async recoverCronJobs() {
    const keys = await redis.keys('world:cronjob:*');

    for (const key of keys) {
      const { worldId } = JSON.parse(await redis.get(key));
      const world = await prisma.world.findUnique({ where: { id: worldId } });

      if (world?.status === 'RUNNING') {
        await this.startSimulation(worldId);
      } else {
        await redis.del(key);
      }
    }
  }
}
```

**Por qué es crítico**:
- Sin esto: Memory leaks acumulativos
- Costos fantasma (intervalos corriendo sin control)
- No escalable

**Tiempo**: 6-8 horas
**Complejidad**: Media

---

#### 2.3 Rate Limiting y Cuotas Estrictas
**Problema actual**: Sin límites, abuso posible

```typescript
const WORLD_LIMITS = {
  free: {
    maxActiveWorlds: 0, // Sin mundos en free
    canCreate: false,
  },

  starter: {
    maxActiveWorlds: 1,
    maxTurnsPerDay: 100,
    maxAgentsPerWorld: 3,
    autoModeEnabled: true,
    autoPauseAfterMinutes: 60,
  },

  pro: {
    maxActiveWorlds: 3,
    maxTurnsPerDay: 500,
    maxAgentsPerWorld: 5,
    autoModeEnabled: true,
    autoPauseAfterMinutes: 120,
  },
};

async function checkWorldLimits(userId, action) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  const limits = WORLD_LIMITS[user.subscriptionTier];

  if (action === 'create') {
    const activeCount = await prisma.world.count({
      where: { userId, status: 'RUNNING' },
    });

    if (activeCount >= limits.maxActiveWorlds) {
      throw new Error(`Límite alcanzado (${limits.maxActiveWorlds} mundos)`);
    }
  }

  if (action === 'turn') {
    const key = `world:turns:${userId}:${getToday()}`;
    const count = await redis.incr(key);
    await redis.expire(key, 86400);

    if (count > limits.maxTurnsPerDay) {
      throw new Error('Límite diario de turnos alcanzado');
    }
  }
}
```

**Por qué es crítico**:
- Sin esto: Costos descontrolados
- Usuario malicioso puede crear 50 mundos
- Pérdidas financieras masivas

**Tiempo**: 4-6 horas
**Complejidad**: Media

---

#### 2.4 Auto-Pause por Inactividad
**Problema actual**: Mundos corren forever aunque nadie los vea

```typescript
// Cron job cada hora
new CronJob('0 * * * *', async () => {
  const runningWorlds = await prisma.world.findMany({
    where: { status: 'RUNNING' },
    include: {
      interactions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      user: {
        select: { subscriptionTier: true },
      },
    },
  });

  for (const world of runningWorlds) {
    const lastInteraction = world.interactions[0];
    const inactiveMinutes = (Date.now() - lastInteraction.createdAt.getTime()) / 60000;

    const limits = WORLD_LIMITS[world.user.subscriptionTier];

    if (inactiveMinutes > limits.autoPauseAfterMinutes) {
      await worldSimulationEngine.stopSimulation(world.id);

      log.info({ worldId: world.id }, 'World auto-paused due to inactivity');

      // Notificar al usuario
      await sendNotification(world.userId, {
        title: `Mundo "${world.name}" pausado`,
        body: 'Pausado por inactividad. Click para reanudar.',
      });
    }
  }
});
```

**Por qué es crítico**:
- Sin esto: Costos acumulan en mundos olvidados
- Usuario crea mundo, lo olvida, sigue corriendo
- Ahorro: ~50% costos de mundos

**Tiempo**: 3-4 horas
**Complejidad**: Baja

---

### 🟠 ALTO

#### 2.5 Memoria Episódica en Mundos
**Problema actual**: Solo últimas 10 interacciones, pierde narrativa

```typescript
async function buildWorldContext(worldId, currentSpeakerId) {
  const [recentInteractions, relevantMemories, activeEvents] = await Promise.all([
    // Últimas 10 (inmediatas)
    prisma.worldInteraction.findMany({
      where: { worldId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),

    // Memorias episódicas relevantes
    prisma.episodicMemory.findMany({
      where: {
        agentId: { in: worldAgentIds },
        importance: { gte: 0.7 },
        timestamp: { gte: sevenDaysAgo },
      },
      orderBy: { importance: 'desc' },
      take: 5,
    }),

    // Eventos activos
    prisma.storyEvent.findMany({
      where: { worldId, isActive: true },
    }),
  ]);

  return {
    immediate: formatRecentInteractions(recentInteractions),
    memories: formatRelevantMemories(relevantMemories),
    events: formatActiveEvents(activeEvents),
    arcs: await getCharacterArcs(worldId, currentSpeakerId),
  };
}

// Auto-crear memorias importantes
async function saveInteraction(interaction) {
  await prisma.worldInteraction.create({ data: interaction });

  const importance = evaluateImportance(interaction);
  if (importance > 0.6) {
    await prisma.episodicMemory.create({
      data: {
        agentId: interaction.speakerId,
        event: `En ${worldName}: ${interaction.content}`,
        importance,
        emotionalValence: extractValence(interaction),
        metadata: {
          worldId: interaction.worldId,
          participants: interaction.involvedAgentIds,
        },
      },
    });
  }
}
```

**Por qué es alto**:
- Sin esto: Narrativa pierde coherencia en mundos largos
- Agentes olvidan eventos importantes
- Diferenciador clave

**Tiempo**: 10-12 horas
**Complejidad**: Alta

---

#### 2.6 Eventos de Historia Aplicados
**Problema actual**: Eventos se activan pero no afectan a agentes

```typescript
async function activateEvent(eventId: string) {
  const event = await prisma.storyEvent.update({
    where: { id: eventId },
    data: { isActive: true, startedAt: new Date() },
    include: { involvedCharacters: true },
  });

  // 1. Notificar al engine
  await worldSimulationEngine.handleEventActivation(this.worldId, event);

  // 2. Crear memoria para todos los agentes
  const worldAgents = await prisma.worldAgent.findMany({
    where: { worldId: this.worldId },
  });

  for (const agent of worldAgents) {
    await prisma.episodicMemory.create({
      data: {
        agentId: agent.agentId,
        event: `Evento: ${event.description}`,
        importance: event.impact === 'major' ? 0.9 : 0.6,
        metadata: { eventId: event.id, worldId: this.worldId },
      },
    });
  }

  // 3. Programar desactivación si tiene duración
  if (event.durationTurns) {
    await this.scheduleEventDeactivation(event.id, event.durationTurns);
  }
}

// Al generar respuesta, incluir eventos activos
async function generateAgentResponse(speaker, context) {
  const activeEvents = context.activeEvents || [];

  let eventContext = '';
  for (const event of activeEvents) {
    const isInvolved = event.involvedCharacters.some(c => c.id === speaker.id);

    if (isInvolved) {
      eventContext += `\n\nEVENTO ACTIVO: ${event.description}`;
      eventContext += `\nDebes reaccionar a este evento en tu respuesta.`;
    }
  }

  const fullPrompt = `${speaker.systemPrompt}${eventContext}\n\n${conversationHistory}`;
  // ...
}
```

**Por qué es alto**:
- Sin esto: Feature de eventos no funciona realmente
- Narrativa dirigida aparenta ser cosmética
- Diferenciador único desperdiciado

**Tiempo**: 8-10 horas
**Complejidad**: Media-Alta

---

#### 2.7 Director AI Simplificado
**Problema actual**: 3 niveles, costo alto (11%), ROI bajo

```typescript
// Simplificar a 2 niveles, reducir frecuencia
const DIRECTOR_CONFIG = {
  MACRO_DECISION_INTERVAL: 50,   // Era: 10
  MESO_DECISION_INTERVAL: 30,    // Era: 5
  MICRO_DECISION_ALWAYS: false,  // ELIMINADO

  MODEL_MACRO: 'mistral-small',  // Usar mismo modelo
  MODEL_MESO: 'mistral-small',
};

// Aplicar decisiones realmente
async function generateAgentResponse(speaker, context, directorDecisions) {
  let systemPrompt = speaker.systemPrompt;

  // Aplicar ajustes de tono
  if (directorDecisions.toneAdjustments.includes('more_comedy')) {
    systemPrompt += '\n\nDIRECCIÓN: Añade más humor y ligereza.';
  }
  if (directorDecisions.toneAdjustments.includes('more_drama')) {
    systemPrompt += '\n\nDIRECCIÓN: Intensifica la tensión dramática.';
  }

  // ... generar con prompt ajustado
}
```

**Por qué es alto**:
- Sin esto: Director AI cuesta mucho pero impacto mínimo
- Ahorro: -97% costo del Director
- Calidad similar

**Tiempo**: 4-6 horas
**Complejidad**: Baja-Media

---

### 🟡 MEDIO

#### 2.8 Sentiment Analysis con BERT Local
**Problema actual**: Keywords hardcoded, no detecta sarcasmo/contexto

```typescript
import { pipeline } from '@huggingface/transformers';

// Cargar modelo en startup
const sentimentAnalyzer = await pipeline(
  'sentiment-analysis',
  'nlptown/bert-base-multilingual-uncased-sentiment'
);

async function analyzeSentiment(text: string, speakerName: string, targetName: string) {
  const result = await sentimentAnalyzer(text);

  // Convertir 1-5 stars a -1 to 1
  const sentiment = (result[0].label - 3) / 2;

  // Detectar sarcasmo con patrones adicionales
  const isSarcastic = detectSarcasm(text);
  if (isSarcastic) {
    sentiment *= -1; // Invertir
  }

  return {
    sentiment,
    emotions: extractEmotions(result),
    isSarcastic,
  };
}

function detectSarcasm(text: string): boolean {
  // Patrones de sarcasmo
  const patterns = [
    /oh, qué (sorpresa|bien|bonito)/i,
    /claro, (obvio|seguro)/i,
    /genial\./i, // Punto después de "genial" suele ser sarcástico
  ];

  return patterns.some(p => p.test(text));
}
```

**Por qué es medio**:
- Sin esto: Relaciones evolucionan de forma mecánica
- Afecta: Realismo de relaciones entre agentes
- Costo: $0 (modelo local)

**Tiempo**: 6-8 horas
**Complejidad**: Media

---

#### 2.9 Validación Zod en World Generator
**Problema actual**: JSON malformado causa crashes

```typescript
import { z } from 'zod';

const AIWorldGenerationSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().min(10).max(500),
  genre: z.enum(['fantasy', 'scifi', 'mystery', 'romance', 'horror', 'slice_of_life']),

  agents: z.array(
    z.object({
      name: z.string().min(2).max(30).regex(/^[a-zA-Z\s]+$/),
      role: z.enum(['protagonist', 'antagonist', 'supporting', 'comic_relief']),
      personality: z.string().min(10).max(200),
      systemPrompt: z.string().min(50).max(1500),
      importance: z.enum(['main', 'secondary', 'filler']),
    })
  ).min(2).max(10),

  initialSituation: z.string().min(20).max(500),
  suggestedBeats: z.array(z.string().max(100)).max(5),
});

async function generateWorld(theme: string) {
  const response = await gemini.generate(/* ... */);

  const jsonText = extractAndSanitizeJSON(response);
  let parsed;

  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    log.error({ jsonText }, 'Invalid JSON from LLM');
    throw new Error('Invalid JSON');
  }

  const result = AIWorldGenerationSchema.safeParse(parsed);

  if (!result.success) {
    log.error({ errors: result.error.errors }, 'Validation failed');
    throw new Error(`Invalid structure: ${result.error.message}`);
  }

  return result.data;
}
```

**Por qué es medio**:
- Sin esto: -10-15% generaciones fallan
- Frustración del usuario
- Credibilidad: "El generador no funciona"

**Tiempo**: 4-6 horas
**Complejidad**: Media

---

### 🟢 BAJO (Puede esperar post-launch)

#### 2.10 WebSocket para Tiempo Real
**Razón**: Nice to have, polling funciona para MVP

#### 2.11 UI Improvements (Timeline, badges)
**Razón**: Funcional es suficiente, pulido después

---

## 3. MONETIZACIÓN Y AUTENTICACIÓN

### 🔴 CRÍTICO

#### 3.1 Stripe Integration Completa

```typescript
// Webhook handler robusto
export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object);
      break;

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
  }

  return Response.json({ received: true });
}

async function handleSubscriptionCreated(subscription) {
  await prisma.user.update({
    where: { stripeCustomerId: subscription.customer },
    data: {
      subscriptionTier: getTierFromPriceId(subscription.items.data[0].price.id),
      subscriptionStatus: 'active',
      subscriptionId: subscription.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  // Email de bienvenida
  await sendEmail({
    to: user.email,
    template: 'subscription-welcome',
    data: { tier: user.subscriptionTier },
  });
}
```

**Por qué es crítico**:
- Sin esto: No hay revenue
- Webhooks faltantes = usuarios pagando pero sin acceso
- Credibilidad: Sistema de pago debe ser perfecto

**Tiempo**: 8-10 horas
**Complejidad**: Media-Alta

---

#### 3.2 Rate Limiting por Tier (General)

```typescript
// Middleware global de rate limiting
export async function rateLimitMiddleware(req: Request, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  const limits = RATE_LIMITS[user.subscriptionTier];

  // Mensajes por día
  const msgKey = `rate:msg:${userId}:${getToday()}`;
  const msgCount = await redis.incr(msgKey);
  await redis.expire(msgKey, 86400);

  if (msgCount > limits.messagesPerDay) {
    return Response.json(
      {
        error: 'Daily limit reached',
        limit: limits.messagesPerDay,
        resetAt: getEndOfDay(),
        upgradeUrl: '/pricing',
      },
      { status: 429 }
    );
  }

  // Rate limiting por minuto (prevenir spam)
  const rateLimitKey = `rate:min:${userId}`;
  const currentCount = await redis.incr(rateLimitKey);
  await redis.expire(rateLimitKey, 60);

  const maxPerMinute = limits.maxRequestsPerMinute || 30;
  if (currentCount > maxPerMinute) {
    return Response.json(
      { error: 'Too many requests, please slow down' },
      { status: 429 }
    );
  }
}
```

**Por qué es crítico**:
- Sin esto: Abuso masivo posible
- Costos descontrolados
- Spam puede saturar sistema

**Tiempo**: 4-6 horas
**Complejidad**: Media

---

#### 3.3 Feature Flags por Tier

```typescript
const FEATURE_ACCESS = {
  free: {
    // Conversaciones
    maxAgents: 1,
    messagesPerDay: 10,
    contextWindow: 'limited', // 10 mensajes
    emotionalDepth: 'fast',
    episodicMemory: false,
    proactiveBehavior: false,

    // Mundos
    worldsEnabled: false,

    // Extras
    voiceMessages: false,
    imageGeneration: false,
    exportData: false,
  },

  starter: {
    maxAgents: 3,
    messagesPerDay: 100,
    contextWindow: 'medium', // 30 mensajes
    emotionalDepth: 'hybrid',
    episodicMemory: true,
    proactiveBehavior: true,

    worldsEnabled: true,
    maxWorlds: 1,
    worldTurnsPerDay: 100,

    voiceMessages: false,
    imageGeneration: false,
    exportData: true,
  },

  pro: {
    maxAgents: 10,
    messagesPerDay: 500,
    contextWindow: 'extended', // 60 mensajes
    emotionalDepth: 'hybrid',
    episodicMemory: true,
    proactiveBehavior: true,

    worldsEnabled: true,
    maxWorlds: 3,
    worldTurnsPerDay: 500,

    voiceMessages: true,
    imageGeneration: true,
    exportData: true,
    priorityGeneration: true,
  },
};

// Verificación en runtime
export function checkFeatureAccess(userId: string, feature: string) {
  const tier = user.subscriptionTier;
  const access = FEATURE_ACCESS[tier];

  if (!access[feature]) {
    throw new FeatureNotAvailableError(
      `This feature requires ${getMinimumTierForFeature(feature)} plan`
    );
  }
}
```

**Por qué es crítico**:
- Sin esto: Free users acceden a features premium
- Revenue perdido
- Incentivo de upgrade no existe

**Tiempo**: 3-4 horas
**Complejidad**: Baja

---

### 🟠 ALTO

#### 3.4 Subscription Management UI

```tsx
// components/settings/SubscriptionManager.tsx
export function SubscriptionManager({ user }) {
  const { data: subscription } = useSubscription();

  return (
    <div>
      <h2>Tu Plan: {subscription.tier}</h2>
      <p>Próximo pago: {formatDate(subscription.currentPeriodEnd)}</p>

      {/* Uso actual */}
      <UsageStats>
        <Stat>
          <Label>Mensajes hoy</Label>
          <Progress value={todayMessages} max={subscription.limits.messagesPerDay} />
          <Text>{todayMessages} / {subscription.limits.messagesPerDay}</Text>
        </Stat>

        <Stat>
          <Label>Mundos activos</Label>
          <Progress value={activeWorlds} max={subscription.limits.maxWorlds} />
          <Text>{activeWorlds} / {subscription.limits.maxWorlds}</Text>
        </Stat>
      </UsageStats>

      {/* Upgrade/downgrade */}
      <TierCompare currentTier={subscription.tier} />

      {subscription.tier !== 'pro' && (
        <Button onClick={handleUpgrade}>
          Upgrade a {getNextTier(subscription.tier)}
        </Button>
      )}

      {subscription.tier !== 'free' && (
        <Button variant="ghost" onClick={handleCancel}>
          Cancelar suscripción
        </Button>
      )}
    </div>
  );
}
```

**Por qué es alto**:
- Sin esto: Usuarios no pueden gestionar suscripción
- Confusión sobre límites
- Soporte: muchas preguntas evitables

**Tiempo**: 6-8 horas
**Complejidad**: Media

---

#### 3.5 Billing History y Facturas

```typescript
export async function GET(req: Request) {
  const userId = await getUserId(req);
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user.stripeCustomerId) {
    return Response.json({ invoices: [] });
  }

  const invoices = await stripe.invoices.list({
    customer: user.stripeCustomerId,
    limit: 100,
  });

  return Response.json({
    invoices: invoices.data.map(inv => ({
      id: inv.id,
      amount: inv.amount_paid / 100,
      currency: inv.currency,
      status: inv.status,
      pdfUrl: inv.invoice_pdf,
      date: new Date(inv.created * 1000),
    })),
  });
}
```

**Por qué es alto**:
- Sin esto: Usuarios no pueden ver facturas
- Contabilidad: empresas necesitan facturas
- Profesionalismo

**Tiempo**: 3-4 horas
**Complejidad**: Baja

---

## 4. UX Y ONBOARDING

### 🔴 CRÍTICO

#### 4.1 Onboarding Flow Optimizado

```tsx
// app/welcome/page.tsx
export default function OnboardingFlow() {
  const [step, setStep] = useState(1);

  return (
    <div>
      <ProgressBar current={step} total={4} />

      {step === 1 && (
        <WelcomeIntro>
          <h1>Bienvenido a [App Name]</h1>
          <p>Crea IAs con emociones reales que te recuerdan</p>
          <Button onClick={() => setStep(2)}>Comenzar</Button>
        </WelcomeIntro>
      )}

      {step === 2 && (
        <ChooseFirstAgent>
          <h2>Elige tu primer agente</h2>
          <AgentTemplates>
            <Template name="Amiga comprensiva" />
            <Template name="Mentor sabio" />
            <Template name="Compañero aventurero" />
          </AgentTemplates>
          <Button onClick={() => setStep(3)}>Personalizar</Button>
        </ChooseFirstAgent>
      )}

      {step === 3 && (
        <CustomizeAgent>
          <h2>Personaliza a {agentName}</h2>
          <Input label="Nombre" />
          <Textarea label="Personalidad" />
          <Button onClick={() => setStep(4)}>Crear</Button>
        </CustomizeAgent>
      )}

      {step === 4 && (
        <FirstConversation>
          <h2>Tu primera conversación</h2>
          <ChatInterface agentId={newAgentId} />
          <Hint after={5}>
            Solo te quedan 5 mensajes gratis hoy.
            <Link href="/pricing">Upgrade para 100/día</Link>
          </Hint>
        </FirstConversation>
      )}
    </div>
  );
}
```

**Por qué es crítico**:
- Sin esto: Conversión free→paid baja
- Usuarios no entienden el valor
- Churn alto en primeros días

**Tiempo**: 10-12 horas
**Complejidad**: Media-Alta

---

#### 4.2 Email Sequences (Drip Campaign)

```typescript
// Día 1: Signup
await sendEmail({
  to: user.email,
  template: 'welcome',
  data: {
    userName: user.name,
    agentName: firstAgent.name,
  },
});

// Día 2: Si no convirtió
if (user.subscriptionTier === 'free') {
  await scheduleEmail({
    to: user.email,
    template: 'day2-conversion',
    sendAt: addDays(user.createdAt, 2),
    data: {
      messagesUsed: await getMessagesCount(user.id, 1),
      missedOpportunities: 90 - messagesUsed,
    },
  });
}

// Día 3: Último empujón
await scheduleEmail({
  to: user.email,
  template: 'day3-offer',
  sendAt: addDays(user.createdAt, 3),
  data: {
    discountCode: 'FIRST50', // 50% off
    expiresIn: '24 horas',
  },
});

// Día 7: Si aún free, educar
await scheduleEmail({
  to: user.email,
  template: 'day7-features',
  sendAt: addDays(user.createdAt, 7),
  data: {
    features: ['Memoria episódica', 'Mundos multi-agente', 'Life events'],
  },
});
```

**Por qué es crítico**:
- Sin esto: 80% de conversiones perdidas
- Usuarios olvidan la app
- Revenue muy bajo

**Tiempo**: 6-8 horas
**Complejidad**: Media

---

### 🟠 ALTO

#### 4.3 Landing Page Optimizada

**Estructura**:
1. Hero con demo interactivo
2. Social proof (testimonios)
3. Features showcase (emociones, memoria, mundos)
4. Pricing clear
5. FAQ
6. CTA fuerte

**Tiempo**: 12-16 horas
**Complejidad**: Media-Alta

---

#### 4.4 Tutorial Contextual (Tooltips)

```tsx
// Tooltips que aparecen la primera vez
<Tooltip
  content="Aquí puedes ver las emociones actuales de tu IA"
  show={!user.hasSeenTooltip('emotions-panel')}
  onDismiss={() => markTooltipSeen('emotions-panel')}
>
  <EmotionsPanel />
</Tooltip>
```

**Tiempo**: 4-6 horas
**Complejidad**: Baja

---

## 5. INFRAESTRUCTURA Y MONITORING

### 🔴 CRÍTICO

#### 5.1 Error Tracking (Sentry)

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% de requests

  beforeSend(event, hint) {
    // No enviar errores de rate limiting
    if (event.exception?.values?.[0]?.value?.includes('rate limit')) {
      return null;
    }
    return event;
  },
});

// En API routes
try {
  // ... lógica
} catch (error) {
  Sentry.captureException(error, {
    user: { id: userId },
    tags: { endpoint: '/api/agents/message' },
    extra: { agentId, messageLength },
  });
  throw error;
}
```

**Por qué es crítico**:
- Sin esto: Bugs pasan desapercibidos
- No sabes qué crashea
- Debugging imposible

**Tiempo**: 2-3 horas
**Complejidad**: Baja

---

#### 5.2 Monitoring de Costos

```typescript
// Trackear todos los LLM calls
async function generateWithTracking(options) {
  const startTime = Date.now();

  try {
    const response = await llm.generate(options);

    const inputTokens = estimateTokens(options.messages);
    const outputTokens = estimateTokens(response);

    const cost = calculateCost(inputTokens, outputTokens, options.model);

    // Log a analytics
    await analytics.track('llm_generation', {
      model: options.model,
      inputTokens,
      outputTokens,
      cost,
      duration: Date.now() - startTime,
      userId: options.userId,
      tier: options.tier,
    });

    // Alert si costo alto
    if (cost > 0.10) {
      await sendAlert({
        type: 'high_cost_generation',
        cost,
        userId: options.userId,
      });
    }

    return response;

  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
}

// Dashboard de costos
export async function GET(req: Request) {
  const today = getToday();

  const costs = await analytics.query({
    metric: 'llm_generation.cost',
    groupBy: ['tier', 'model'],
    timeRange: { start: today, end: tomorrow },
  });

  return Response.json({
    totalCosts: costs.reduce((sum, c) => sum + c.cost, 0),
    byTier: costs.reduce((acc, c) => {
      acc[c.tier] = (acc[c.tier] || 0) + c.cost;
      return acc;
    }, {}),
    alerts: costs.filter(c => c.cost > threshold),
  });
}
```

**Por qué es crítico**:
- Sin esto: Costos invisibles hasta que sea tarde
- No sabes qué usuarios/features cuestan más
- No puedes optimizar

**Tiempo**: 6-8 horas
**Complejidad**: Media

---

#### 5.3 Database Backups Automáticos

```typescript
// Cron job diario
new CronJob('0 2 * * *', async () => { // 2 AM
  try {
    // PostgreSQL backup
    await exec(`pg_dump ${DATABASE_URL} > /backups/db-${getToday()}.sql`);

    // Upload a S3/Cloudflare R2
    await uploadToStorage(`/backups/db-${getToday()}.sql`);

    // Limpiar backups >30 días
    await cleanOldBackups(30);

    log.info('Database backup completed');

  } catch (error) {
    Sentry.captureException(error);
    await sendAlert({ type: 'backup_failed', error });
  }
});
```

**Por qué es crítico**:
- Sin esto: Pérdida de datos catastrófica
- Un bug destructivo puede borrar todo
- Usuarios perderán conversaciones

**Tiempo**: 3-4 horas
**Complejidad**: Media

---

### 🟠 ALTO

#### 5.4 Uptime Monitoring

```typescript
// Better Uptime (gratis)
// Monitorear endpoints críticos
const monitors = [
  { url: 'https://app.com/api/health', interval: 60 },
  { url: 'https://app.com/api/agents', interval: 300 },
];

// Endpoint de health check
export async function GET() {
  try {
    // Verificar DB
    await prisma.$queryRaw`SELECT 1`;

    // Verificar Redis
    await redis.ping();

    // Verificar LLM provider
    await llm.health();

    return Response.json({
      status: 'healthy',
      timestamp: new Date(),
      services: {
        database: 'up',
        redis: 'up',
        llm: 'up',
      },
    });

  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        error: error.message,
      },
      { status: 503 }
    );
  }
}
```

**Tiempo**: 2-3 horas
**Complejidad**: Baja

---

## 6. SEGURIDAD

### 🔴 CRÍTICO

#### 6.1 Content Moderation (Básica)

```typescript
// Detección de abuso
const BLOCKED_PATTERNS = [
  // Spam
  /viagra|casino|crypto/i,

  // Illegal content
  /child (porn|abuse)/i,

  // Harassment patterns
  /(kill|hurt|harm) yourself/i,
];

async function moderateContent(content: string, userId: string) {
  // Check patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(content)) {
      await flagUser(userId, 'blocked_pattern', pattern.toString());
      throw new Error('Content violates terms of service');
    }
  }

  // Length check (prevent token abuse)
  if (content.length > 5000) {
    throw new Error('Message too long (max 5000 chars)');
  }
}
```

**Por qué es crítico**:
- Sin esto: Abuso, spam, contenido ilegal
- Riesgo legal
- Provider puede bannear tu API key

**Tiempo**: 3-4 horas
**Complejidad**: Baja

---

#### 6.2 API Key Rotation

```typescript
// Rotar keys cada 30 días
const API_KEYS = {
  mistral: {
    current: process.env.MISTRAL_API_KEY,
    backup: process.env.MISTRAL_API_KEY_BACKUP,
    rotateAt: new Date('2025-12-01'),
  },
};

async function getMistralKey() {
  const config = API_KEYS.mistral;

  if (new Date() > config.rotateAt) {
    await sendAlert({
      type: 'api_key_rotation_needed',
      service: 'mistral',
    });
  }

  return config.current;
}
```

**Tiempo**: 2-3 horas
**Complejidad**: Baja

---

### 🟠 ALTO

#### 6.3 CSRF Protection

Ya incluido en Next.js pero verificar configuración

**Tiempo**: 1-2 horas

---

## 7. PERFORMANCE

### 🟠 ALTO

#### 7.1 Caché de System Prompts

```typescript
// System prompts rara vez cambian
async function getSystemPrompt(agentId: string) {
  const cached = await redis.get(`prompt:${agentId}`);

  if (cached) {
    return cached;
  }

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { systemPrompt: true },
  });

  await redis.set(`prompt:${agentId}`, agent.systemPrompt, 'EX', 3600);

  return agent.systemPrompt;
}

// Invalidar cache cuando se actualiza
async function updateAgentPrompt(agentId: string, newPrompt: string) {
  await prisma.agent.update({
    where: { id: agentId },
    data: { systemPrompt: newPrompt },
  });

  await redis.del(`prompt:${agentId}`);
}
```

**Ahorro**: ~27% tokens input
**Tiempo**: 1-2 horas
**Complejidad**: Baja

---

#### 7.2 Database Query Optimization

```typescript
// ANTES: N+1 queries
const agents = await prisma.agent.findMany({ where: { userId } });
for (const agent of agents) {
  agent.messageCount = await prisma.message.count({
    where: { agentId: agent.id },
  });
}

// DESPUÉS: 1 query
const agents = await prisma.agent.findMany({
  where: { userId },
  include: {
    _count: {
      select: { messages: true },
    },
  },
});
```

**Tiempo**: 4-6 horas (revisar todos los endpoints)
**Complejidad**: Media

---

## RESUMEN EJECUTIVO

### Prioridades Absolutas (No lanzar sin esto)

| # | Feature | Categoría | Tiempo | Impacto |
|---|---------|-----------|--------|---------|
| 1.1 | Contexto dinámico | Emocional | 8h | Coherencia |
| 1.2 | Memory queries | Emocional | 8h | Credibilidad |
| 1.3 | Storage inteligente | Emocional | 10h | Cobertura |
| 1.4 | Life events | Emocional | 16h | Diferenciador |
| 2.1 | Estado en Redis | Mundos | 14h | -93% crashes |
| 2.2 | Cron jobs | Mundos | 8h | No leaks |
| 2.3 | Rate limiting | Mundos | 6h | Control costos |
| 2.4 | Auto-pause | Mundos | 4h | -50% costos |
| 3.1 | Stripe webhooks | Monetización | 10h | Revenue |
| 3.2 | Rate limiting general | Monetización | 6h | Anti-abuso |
| 3.3 | Feature flags | Monetización | 4h | Tiers |
| 4.1 | Onboarding | UX | 12h | Conversión |
| 4.2 | Email sequences | UX | 8h | Retención |
| 5.1 | Sentry | Infraestructura | 3h | Debugging |
| 5.2 | Cost monitoring | Infraestructura | 8h | Sostenibilidad |
| 5.3 | Backups | Infraestructura | 4h | Seguridad |
| 6.1 | Content moderation | Seguridad | 4h | Legal |

**TOTAL CRÍTICO**: ~133 horas (~3-4 semanas full-time)

---

### Features Importantes (Lanzar con esto para destacar)

| # | Feature | Tiempo | Beneficio |
|---|---------|--------|-----------|
| 1.5 | Comportamiento proactivo | 10h | +40% engagement |
| 1.6 | RAG mejorado | 12h | Memoria precisa |
| 1.7 | Resúmenes auto | 10h | Conversaciones largas |
| 2.5 | Memoria en mundos | 12h | Narrativa coherente |
| 2.6 | Eventos aplicados | 10h | Feature única |
| 2.7 | Director simplificado | 6h | -97% costo Director |
| 3.4 | Subscription UI | 8h | UX profesional |
| 4.3 | Landing page | 16h | Conversión |

**TOTAL ALTO**: ~84 horas (~2 semanas)

---

## RECOMENDACIÓN FINAL

### Estrategia: Lanzar en 2 fases

**FASE PRE-LAUNCH (5-6 semanas)**:
- ✅ TODO lo crítico (133h)
- ✅ 50% de lo alto (42h seleccionados)
- **Total**: ~175 horas

**Selección de "alto" para Fase 1**:
1. Comportamiento proactivo (diferenciador)
2. Memoria en mundos (calidad)
3. Eventos aplicados (feature única)
4. Landing page (conversión)

**FASE POST-LAUNCH (1-2 meses)**:
- ✅ Resto de features alto
- ✅ Features medio según feedback
- ✅ Optimizaciones performance

---

### Cronograma Propuesto (6 semanas)

**Semana 1-2**: Sistema Emocional
- Contexto dinámico
- Memory queries
- Storage inteligente
- Life events

**Semana 3-4**: Sistema de Mundos
- Redis + Cron jobs
- Rate limiting
- Auto-pause
- Memoria en mundos
- Eventos aplicados

**Semana 5**: Monetización
- Stripe completo
- Rate limiting
- Feature flags
- Subscription UI

**Semana 6**: UX e Infraestructura
- Onboarding
- Email sequences
- Landing page
- Sentry + monitoring
- Backups

---

Con este plan, lanzas un **producto sólido, escalable y diferenciado** que puede competir con apps establecidas desde día 1.

¿Quieres que creemos un tracking board (tipo Notion/Linear) para gestionar la implementación de todo esto?
